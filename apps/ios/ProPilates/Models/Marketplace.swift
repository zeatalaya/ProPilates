import Foundation

// MARK: - Portfolio Access

struct PortfolioAccess: Codable, Identifiable {
    let id: UUID
    let buyerAddress: String
    let sellerAddress: String
    let classId: UUID
    let tokenId: String
    let pricePaid: Double
    let purchasedAt: String

    enum CodingKeys: String, CodingKey {
        case id
        case buyerAddress = "buyer_address"
        case sellerAddress = "seller_address"
        case classId = "class_id"
        case tokenId = "token_id"
        case pricePaid = "price_paid"
        case purchasedAt = "purchased_at"
    }
}

// MARK: - Verification

struct Verification: Codable, Identifiable {
    let id: UUID
    let instructorId: UUID
    let provider: String
    let proofHash: String
    let verifiedAt: String
    let txHash: String?
    let onChain: Bool

    enum CodingKeys: String, CodingKey {
        case id
        case instructorId = "instructor_id"
        case provider
        case proofHash = "proof_hash"
        case verifiedAt = "verified_at"
        case txHash = "tx_hash"
        case onChain = "on_chain"
    }
}

// MARK: - Subscription

struct Subscription: Codable, Identifiable {
    let id: UUID
    let instructorId: UUID
    let tier: Tier
    let startedAt: String
    let expiresAt: String?
    let txHash: String?
    let status: String
    let paymentMethod: String?
    let amountUsdc: Double?

    enum CodingKeys: String, CodingKey {
        case id
        case instructorId = "instructor_id"
        case tier
        case startedAt = "started_at"
        case expiresAt = "expires_at"
        case txHash = "tx_hash"
        case status
        case paymentMethod = "payment_method"
        case amountUsdc = "amount_usdc"
    }
}
