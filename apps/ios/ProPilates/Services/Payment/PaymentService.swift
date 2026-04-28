import Foundation
import Observation
#if canImport(UIKit)
import UIKit
#endif
import StripePaymentSheet

// MARK: - Payment Types

enum PaymentType: String {
    case subscription
    case marketplace
}

struct PaymentIntentResponse: Codable {
    let clientSecret: String
    let paymentIntentId: String
}

enum PaymentError: LocalizedError {
    case noAPIBaseURL
    case serverError(String)
    case paymentCancelled
    case paymentFailed(String)
    case noViewController

    var errorDescription: String? {
        switch self {
        case .noAPIBaseURL: return "API base URL not configured"
        case .serverError(let msg): return "Server error: \(msg)"
        case .paymentCancelled: return "Payment was cancelled"
        case .paymentFailed(let msg): return "Payment failed: \(msg)"
        case .noViewController: return "Unable to present payment sheet"
        }
    }
}

// MARK: - Payment Service

@Observable
final class PaymentService {

    private let config: AppConfig

    init(config: AppConfig) {
        self.config = config
        configureStripe()
    }

    private func configureStripe() {
        StripeAPI.defaultPublishableKey = config.stripePublishableKey
    }

    // MARK: - Create Payment Intent (via backend API)

    private func createPaymentIntent(
        type: PaymentType,
        instructorId: UUID,
        amount: Double? = nil,
        classId: UUID? = nil,
        sellerStripeAccountId: String? = nil
    ) async throws -> PaymentIntentResponse {
        let urlString = "\(config.apiBaseURL)/api/stripe/create-payment-intent"
        guard let url = URL(string: urlString) else {
            throw PaymentError.noAPIBaseURL
        }

        var body: [String: Any] = [
            "type": type.rawValue,
            "instructorId": instructorId.uuidString,
        ]

        if let amount { body["amount"] = amount }
        if let classId { body["classId"] = classId.uuidString }
        if let sellerStripeAccountId { body["sellerStripeAccountId"] = sellerStripeAccountId }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONSerialization.data(withJSONObject: body)

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let http = response as? HTTPURLResponse else {
            throw PaymentError.serverError("Invalid response")
        }

        if http.statusCode != 200 {
            let errorBody = String(data: data, encoding: .utf8) ?? "Unknown error"
            throw PaymentError.serverError(errorBody)
        }

        return try JSONDecoder().decode(PaymentIntentResponse.self, from: data)
    }

    // MARK: - Present Payment Sheet

    /// Configures and presents the Stripe PaymentSheet for subscription or marketplace purchases.
    /// Returns the PaymentIntent ID on success.
    @MainActor
    func presentPaymentSheet(
        type: PaymentType,
        instructorId: UUID,
        amount: Double? = nil,
        classId: UUID? = nil,
        sellerStripeAccountId: String? = nil
    ) async throws -> String {
        // 1. Create PaymentIntent on backend
        let intent = try await createPaymentIntent(
            type: type,
            instructorId: instructorId,
            amount: amount,
            classId: classId,
            sellerStripeAccountId: sellerStripeAccountId
        )

        // 2. Configure PaymentSheet
        var configuration = PaymentSheet.Configuration()
        configuration.merchantDisplayName = "ProPilates"
        configuration.allowsDelayedPaymentMethods = false

        // Apple Pay
        configuration.applePay = .init(
            merchantId: config.stripeMerchantID,
            merchantCountryCode: "US"
        )

        // Appearance — match Oak/Clay palette
        var appearance = PaymentSheet.Appearance()
        appearance.colors.primary = UIColor(red: 0.54, green: 0.49, blue: 0.45, alpha: 1) // #8A7E72
        appearance.colors.background = UIColor(red: 0.98, green: 0.97, blue: 0.96, alpha: 1) // #FAF8F5
        appearance.colors.componentBackground = UIColor(red: 0.94, green: 0.93, blue: 0.90, alpha: 1) // #F0ECE6
        appearance.colors.componentBorder = UIColor(red: 0.87, green: 0.85, blue: 0.81, alpha: 1) // #DDD8CF
        appearance.colors.text = UIColor(red: 0.17, green: 0.16, blue: 0.15, alpha: 1) // #2C2825
        appearance.cornerRadius = 12
        configuration.appearance = appearance

        let paymentSheet = PaymentSheet(
            paymentIntentClientSecret: intent.clientSecret,
            configuration: configuration
        )

        // 3. Present
        #if canImport(UIKit)
        guard let scene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
              let viewController = scene.windows.first?.rootViewController else {
            throw PaymentError.noViewController
        }

        // Find the topmost presented view controller
        var topVC = viewController
        while let presented = topVC.presentedViewController {
            topVC = presented
        }

        return try await withCheckedThrowingContinuation { continuation in
            paymentSheet.present(from: topVC) { result in
                switch result {
                case .completed:
                    continuation.resume(returning: intent.paymentIntentId)
                case .canceled:
                    continuation.resume(throwing: PaymentError.paymentCancelled)
                case .failed(let error):
                    continuation.resume(throwing: PaymentError.paymentFailed(error.localizedDescription))
                }
            }
        }
        #else
        throw PaymentError.noViewController
        #endif
    }

    // MARK: - Convenience Methods

    /// Pay for premium subscription ($4.99/mo)
    @MainActor
    func purchaseSubscription(instructorId: UUID) async throws -> String {
        try await presentPaymentSheet(
            type: .subscription,
            instructorId: instructorId
        )
    }

    /// Purchase a class from the marketplace
    @MainActor
    func purchaseClass(
        instructorId: UUID,
        classId: UUID,
        amount: Double,
        sellerStripeAccountId: String? = nil
    ) async throws -> String {
        try await presentPaymentSheet(
            type: .marketplace,
            instructorId: instructorId,
            amount: amount,
            classId: classId,
            sellerStripeAccountId: sellerStripeAccountId
        )
    }
}
