import Foundation
import AuthenticationServices
import Observation
#if canImport(UIKit)
import UIKit
#endif

@Observable
final class AuthService {

    // MARK: - Public State

    private(set) var instructor: Instructor?     = nil
    private(set) var xionAddress: String?        = nil
    private(set) var isConnected: Bool           = false
    private(set) var isLoading: Bool             = true
    private(set) var isInitialized: Bool         = false
    private(set) var isAuthenticating: Bool      = false
    private(set) var tier: Tier                  = .free
    private(set) var accessToken: String?        = nil
    private(set) var error: String?              = nil

    var isAuthenticated: Bool { session != nil }

    // MARK: - Private

    private var session: OAuth3Session? = nil
    private let oauth3: OAuth3Client
    private let keychain: KeychainManager
    private let supabase: SupabaseService

    /// Retain the web auth session so it isn't deallocated mid-flow
    private var currentWebAuthSession: ASWebAuthenticationSession?
    private let contextProvider = PresentationContextProvider()

    private static let sessionKey = "propilates_oauth3_session"

    // MARK: - Init

    init(config: AppConfig, supabase: SupabaseService) {
        self.supabase = supabase
        self.oauth3   = OAuth3Client(config: config)
        self.keychain = KeychainManager()
    }

    // MARK: - Restore persisted session

    func restoreSession() async {
        defer {
            isLoading     = false
            isInitialized = true
        }

        guard
            let data = keychain.load(forKey: Self.sessionKey),
            let stored = try? JSONDecoder().decode(OAuth3Session.self, from: data)
        else { return }

        if stored.isExpired {
            if let refresh = stored.refreshToken {
                do {
                    let tokens = try await oauth3.refreshToken(refresh)
                    let refreshed = OAuth3Session(
                        accessToken:  tokens.accessToken,
                        refreshToken: tokens.refreshToken,
                        expiresAt:    Date().timeIntervalSince1970 + Double(tokens.expiresIn),
                        xionAddress:  stored.xionAddress
                    )
                    persist(session: refreshed)
                    apply(session: refreshed)
                    await fetchInstructorProfile(xionAddress: refreshed.xionAddress)
                    return
                } catch {
                    logout()
                    return
                }
            } else {
                logout()
                return
            }
        }

        apply(session: stored)
        await fetchInstructorProfile(xionAddress: stored.xionAddress)
    }

    // MARK: - Login (ASWebAuthenticationSession)

    @MainActor
    func login() async throws {
        guard !isAuthenticating else { return }
        isAuthenticating = true
        error = nil
        defer {
            isAuthenticating = false
            currentWebAuthSession = nil
        }

        // 1. PKCE
        let pkce = oauth3.generatePKCE()

        // 2. Random state
        var stateBytes = [UInt8](repeating: 0, count: 16)
        _ = SecRandomCopyBytes(kSecRandomDefault, stateBytes.count, &stateBytes)
        let state = stateBytes.map { String(format: "%02x", $0) }.joined()

        // 3. Authorize URL
        guard let authorizeURL = oauth3.authorizeURL(challenge: pkce.challenge, state: state) else {
            throw AuthError.invalidAuthorizeURL
        }

        print("[AuthService] Opening OAuth URL: \(authorizeURL)")

        // 4. Present ASWebAuthenticationSession
        let callbackURL: URL = try await withCheckedThrowingContinuation { continuation in
            let webAuthSession = ASWebAuthenticationSession(
                url: authorizeURL,
                callbackURLScheme: "propilates"
            ) { url, sessionError in
                if let sessionError = sessionError as? ASWebAuthenticationSessionError,
                   sessionError.code == .canceledLogin {
                    continuation.resume(throwing: AuthError.cancelled)
                } else if let sessionError {
                    continuation.resume(throwing: sessionError)
                } else if let url {
                    continuation.resume(returning: url)
                } else {
                    continuation.resume(throwing: AuthError.noCallbackURL)
                }
            }

            webAuthSession.presentationContextProvider = contextProvider
            webAuthSession.prefersEphemeralWebBrowserSession = true

            // Retain the session so it isn't deallocated
            self.currentWebAuthSession = webAuthSession

            if !webAuthSession.start() {
                continuation.resume(throwing: AuthError.sessionStartFailed)
            }
        }

        print("[AuthService] Callback URL: \(callbackURL)")

        // 5. Parse code and state from callback URL
        guard let components = URLComponents(url: callbackURL, resolvingAgainstBaseURL: false),
              let code = components.queryItems?.first(where: { $0.name == "code" })?.value,
              let returnedState = components.queryItems?.first(where: { $0.name == "state" })?.value
        else {
            throw AuthError.missingCodeOrState
        }

        // 6. Verify state (web callback strips the "mobile:" prefix)
        guard returnedState == state else {
            print("[AuthService] State mismatch: expected '\(state)', got '\(returnedState)'")
            throw AuthError.stateMismatch
        }

        // 7. Exchange code for tokens
        let tokens = try await oauth3.exchangeCode(code, verifier: pkce.verifier)

        // 8. Fetch Meta Account (XION address)
        let meta = try await oauth3.fetchMetaAccount(accessToken: tokens.accessToken)

        // 9. Build & persist session
        let newSession = OAuth3Session(
            accessToken:  tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresAt:    Date().timeIntervalSince1970 + Double(tokens.expiresIn),
            xionAddress:  meta.id
        )
        persist(session: newSession)
        apply(session: newSession)

        // 10. Fetch instructor profile
        await fetchInstructorProfile(xionAddress: meta.id)
    }

    // MARK: - Logout

    func logout() {
        session          = nil
        instructor       = nil
        xionAddress      = nil
        isConnected      = false
        isAuthenticating = false
        accessToken      = nil
        tier             = .free
        error            = nil
        keychain.delete(forKey: Self.sessionKey)
    }

    // MARK: - Deep Link

    func handleCallback(url: URL) async {
        // ASWebAuthenticationSession handles the callback inline.
        // This is only needed if using universal links as a fallback.
        print("[AuthService] handleCallback: \(url)")
    }

    // MARK: - Fetch instructor profile

    func fetchInstructorProfile(xionAddress: String) async {
        do {
            if let found = try await supabase.fetchInstructor(xionAddress: xionAddress) {
                instructor = found

                if let sub = try await supabase.fetchSubscription(instructorId: found.id) {
                    tier = sub.tier
                } else {
                    tier = .free
                }
            }
        } catch {
            print("[AuthService] Failed to fetch instructor profile: \(error)")
        }
    }

    // MARK: - Helpers

    private func persist(session: OAuth3Session) {
        if let data = try? JSONEncoder().encode(session) {
            keychain.save(data: data, forKey: Self.sessionKey)
        }
    }

    private func apply(session: OAuth3Session) {
        self.session     = session
        self.accessToken = session.accessToken
        self.xionAddress = session.xionAddress
        self.isConnected = true
    }
}

// MARK: - Errors

enum AuthError: LocalizedError {
    case invalidAuthorizeURL
    case noCallbackURL
    case missingCodeOrState
    case stateMismatch
    case cancelled
    case sessionStartFailed

    var errorDescription: String? {
        switch self {
        case .invalidAuthorizeURL: return "Failed to build the authorization URL."
        case .noCallbackURL:       return "No callback URL received from authentication."
        case .missingCodeOrState:  return "Authorization code or state missing from callback."
        case .stateMismatch:       return "OAuth state mismatch — possible CSRF attack."
        case .cancelled:           return nil  // User cancelled — no alert needed
        case .sessionStartFailed:  return "Failed to start authentication session."
        }
    }
}

// MARK: - ASWebAuthenticationSession presentation context

private final class PresentationContextProvider: NSObject, ASWebAuthenticationPresentationContextProviding {
    func presentationAnchor(for session: ASWebAuthenticationSession) -> ASPresentationAnchor {
        #if canImport(UIKit)
        if let scene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
           let window = scene.windows.first {
            return window
        }
        #endif
        return ASPresentationAnchor()
    }
}
