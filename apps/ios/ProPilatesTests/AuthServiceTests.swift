import XCTest
@testable import ProPilates

final class AuthServiceTests: XCTestCase {

    func testKeychainSaveAndLoad() {
        let keychain = KeychainManager()
        let testKey = "test_session"
        let testData = "hello world".data(using: .utf8)!

        // Clean up first
        keychain.delete(forKey: testKey)

        // Save
        let saved = keychain.save(data: testData, forKey: testKey)
        XCTAssertTrue(saved)

        // Load
        let loaded = keychain.load(forKey: testKey)
        XCTAssertNotNil(loaded)
        XCTAssertEqual(loaded, testData)

        // Delete
        let deleted = keychain.delete(forKey: testKey)
        XCTAssertTrue(deleted)

        // Verify deleted
        let afterDelete = keychain.load(forKey: testKey)
        XCTAssertNil(afterDelete)
    }

    func testSessionModelCoding() throws {
        let session = OAuth3Session(
            accessToken: "test_token",
            refreshToken: "refresh_token",
            expiresAt: Date().timeIntervalSince1970 + 3600,
            xionAddress: "xion1abc123"
        )

        let data = try JSONEncoder().encode(session)
        let decoded = try JSONDecoder().decode(OAuth3Session.self, from: data)

        XCTAssertEqual(decoded.accessToken, "test_token")
        XCTAssertEqual(decoded.refreshToken, "refresh_token")
        XCTAssertEqual(decoded.xionAddress, "xion1abc123")
        XCTAssertFalse(decoded.isExpired)
    }

    func testSessionExpired() {
        let session = OAuth3Session(
            accessToken: "test",
            refreshToken: nil,
            expiresAt: Date().timeIntervalSince1970 - 100, // 100 seconds ago
            xionAddress: "xion1abc"
        )
        XCTAssertTrue(session.isExpired)
    }

    func testPKCEGeneration() {
        let oauth3 = OAuth3Client(config: AppConfig.load())
        let pkce = oauth3.generatePKCE()

        // Verifier should be base64url encoded (no +, /, =)
        XCTAssertFalse(pkce.verifier.contains("+"))
        XCTAssertFalse(pkce.verifier.contains("/"))
        XCTAssertFalse(pkce.verifier.contains("="))

        // Challenge should also be base64url
        XCTAssertFalse(pkce.challenge.contains("+"))
        XCTAssertFalse(pkce.challenge.contains("/"))
        XCTAssertFalse(pkce.challenge.contains("="))

        // Both should be non-empty
        XCTAssertFalse(pkce.verifier.isEmpty)
        XCTAssertFalse(pkce.challenge.isEmpty)

        // Verifier and challenge should be different
        XCTAssertNotEqual(pkce.verifier, pkce.challenge)
    }

    func testAuthorizeURL() {
        let oauth3 = OAuth3Client(config: AppConfig.load())
        let url = oauth3.authorizeURL(challenge: "test_challenge", state: "test_state")

        XCTAssertNotNil(url)
        let urlString = url!.absoluteString
        XCTAssertTrue(urlString.contains("response_type=code"))
        XCTAssertTrue(urlString.contains("code_challenge=test_challenge"))
        XCTAssertTrue(urlString.contains("state=mobile%3Atest_state") || urlString.contains("state=mobile:test_state"))
        XCTAssertTrue(urlString.contains("code_challenge_method=S256"))
    }

    func testInstructorDecoding() throws {
        let json = """
        {
            "id": "550e8400-e29b-41d4-a716-446655440000",
            "xion_address": "xion1abc123",
            "name": "Jane",
            "bio": "Instructor",
            "avatar_url": null,
            "location": "NYC",
            "languages": ["en"],
            "methods": ["mat", "reformer"],
            "class_types": ["private", "group"],
            "equipment": [],
            "certifications": [],
            "music_style": "",
            "favorite_artists": [],
            "tier": "premium",
            "onboarding_complete": true,
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z",
            "classes_taught": 42
        }
        """.data(using: .utf8)!

        let instructor = try JSONDecoder().decode(Instructor.self, from: json)
        XCTAssertEqual(instructor.name, "Jane")
        XCTAssertEqual(instructor.xionAddress, "xion1abc123")
        XCTAssertEqual(instructor.tier, .premium)
        XCTAssertEqual(instructor.methods, [.mat, .reformer])
        XCTAssertEqual(instructor.classesTaught, 42)
    }
}
