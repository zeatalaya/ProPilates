import Foundation
import CryptoKit

// MARK: - Response types

struct TokenResponse: Codable {
    let accessToken: String
    let refreshToken: String?
    let tokenType: String
    let expiresIn: Int

    enum CodingKeys: String, CodingKey {
        case accessToken  = "access_token"
        case refreshToken = "refresh_token"
        case tokenType    = "token_type"
        case expiresIn    = "expires_in"
    }
}

struct MetaAccount: Codable {
    /// The XION address (e.g. `xion1abc...`).
    let id: String
}

// MARK: - Errors

enum OAuth3Error: LocalizedError {
    case invalidURL
    case tokenExchangeFailed(statusCode: Int, body: String)
    case metaAccountFetchFailed(statusCode: Int, body: String)
    case refreshFailed(statusCode: Int, body: String)
    case invalidResponse

    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid OAuth3 URL."
        case .tokenExchangeFailed(let code, let body):
            return "Token exchange failed (\(code)): \(body)"
        case .metaAccountFetchFailed(let code, let body):
            return "Meta account fetch failed (\(code)): \(body)"
        case .refreshFailed(let code, let body):
            return "Token refresh failed (\(code)): \(body)"
        case .invalidResponse:
            return "Invalid response from OAuth3 server."
        }
    }
}

// MARK: - Client

struct OAuth3Client {

    let oauthServer: String
    let clientID: String
    let webCallbackURL: String
    let mobileDeepLink = "propilates://auth/callback"

    init(config: AppConfig) {
        self.oauthServer    = config.oauth3Server
        self.clientID       = config.oauth3ClientID
        self.webCallbackURL = config.oauthRedirectURL
    }

    // MARK: - PKCE

    /// Generate a PKCE code verifier and its S256 challenge.
    func generatePKCE() -> (verifier: String, challenge: String) {
        var bytes = [UInt8](repeating: 0, count: 32)
        _ = SecRandomCopyBytes(kSecRandomDefault, bytes.count, &bytes)

        let verifier  = base64URLEncode(Data(bytes))
        let hash      = SHA256.hash(data: Data(verifier.utf8))
        let challenge = base64URLEncode(Data(hash))

        return (verifier, challenge)
    }

    // MARK: - Authorize URL

    func authorizeURL(challenge: String, state: String) -> URL? {
        var components = URLComponents(string: "\(oauthServer)/oauth/authorize")

        components?.queryItems = [
            URLQueryItem(name: "response_type",        value: "code"),
            URLQueryItem(name: "client_id",            value: clientID),
            URLQueryItem(name: "redirect_uri",         value: webCallbackURL),
            URLQueryItem(name: "code_challenge",       value: challenge),
            URLQueryItem(name: "code_challenge_method", value: "S256"),
            URLQueryItem(name: "state",                value: "mobile:\(state)"),
            URLQueryItem(name: "scope",                value: "openid profile email xion:transactions:submit"),
        ]

        return components?.url
    }

    // MARK: - Exchange authorization code

    func exchangeCode(_ code: String, verifier: String) async throws -> TokenResponse {
        guard let url = URL(string: "\(oauthServer)/oauth/token") else {
            throw OAuth3Error.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/x-www-form-urlencoded", forHTTPHeaderField: "Content-Type")

        let body: [String: String] = [
            "grant_type":    "authorization_code",
            "code":          code,
            "redirect_uri":  webCallbackURL,
            "client_id":     clientID,
            "code_verifier": verifier,
        ]
        request.httpBody = formEncode(body).data(using: .utf8)

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let http = response as? HTTPURLResponse else {
            throw OAuth3Error.invalidResponse
        }
        guard http.statusCode == 200 else {
            let responseBody = String(data: data, encoding: .utf8) ?? ""
            throw OAuth3Error.tokenExchangeFailed(statusCode: http.statusCode, body: responseBody)
        }

        return try JSONDecoder().decode(TokenResponse.self, from: data)
    }

    // MARK: - Fetch Meta Account

    func fetchMetaAccount(accessToken: String) async throws -> MetaAccount {
        guard let url = URL(string: "\(oauthServer)/api/v1/me") else {
            throw OAuth3Error.invalidURL
        }

        var request = URLRequest(url: url)
        request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let http = response as? HTTPURLResponse else {
            throw OAuth3Error.invalidResponse
        }
        guard http.statusCode == 200 else {
            let responseBody = String(data: data, encoding: .utf8) ?? ""
            throw OAuth3Error.metaAccountFetchFailed(statusCode: http.statusCode, body: responseBody)
        }

        return try JSONDecoder().decode(MetaAccount.self, from: data)
    }

    // MARK: - Refresh token

    func refreshToken(_ token: String) async throws -> TokenResponse {
        guard let url = URL(string: "\(oauthServer)/oauth/token") else {
            throw OAuth3Error.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/x-www-form-urlencoded", forHTTPHeaderField: "Content-Type")

        let body: [String: String] = [
            "grant_type":    "refresh_token",
            "refresh_token": token,
            "client_id":     clientID,
        ]
        request.httpBody = formEncode(body).data(using: .utf8)

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let http = response as? HTTPURLResponse else {
            throw OAuth3Error.invalidResponse
        }
        guard http.statusCode == 200 else {
            let responseBody = String(data: data, encoding: .utf8) ?? ""
            throw OAuth3Error.refreshFailed(statusCode: http.statusCode, body: responseBody)
        }

        return try JSONDecoder().decode(TokenResponse.self, from: data)
    }

    // MARK: - Helpers

    private func base64URLEncode(_ data: Data) -> String {
        data.base64EncodedString()
            .replacingOccurrences(of: "+", with: "-")
            .replacingOccurrences(of: "/", with: "_")
            .replacingOccurrences(of: "=", with: "")
    }

    private func formEncode(_ params: [String: String]) -> String {
        params.map { key, value in
            let escapedKey   = key.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? key
            let escapedValue = value.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? value
            return "\(escapedKey)=\(escapedValue)"
        }
        .joined(separator: "&")
    }
}
