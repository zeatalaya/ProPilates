import Foundation

/// Persisted OAuth3 session, stored as JSON in the Keychain.
struct OAuth3Session: Codable {
    let accessToken: String
    let refreshToken: String?
    /// Unix timestamp in seconds when the access token expires.
    let expiresAt: TimeInterval
    /// The user's XION Meta Account address (e.g. `xion1abc...`).
    let xionAddress: String

    /// Whether the access token has expired.
    var isExpired: Bool {
        Date().timeIntervalSince1970 >= expiresAt
    }
}
