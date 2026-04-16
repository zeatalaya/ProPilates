import Foundation
import Observation

// MARK: - REST response types

private struct BalanceByDenomResponse: Codable {
    let balance: CoinBalance
}

private struct CoinBalance: Codable {
    let denom: String
    let amount: String
}

// MARK: - Errors

enum XionError: LocalizedError {
    case invalidURL
    case requestFailed(statusCode: Int, body: String)
    case invalidResponse

    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid XION REST URL."
        case .requestFailed(let code, let body):
            return "XION request failed (\(code)): \(body)"
        case .invalidResponse:
            return "Invalid response from XION REST API."
        }
    }
}

// MARK: - Service

@Observable
final class XionService {

    let config: AppConfig

    /// The RPC endpoint for the XION testnet.
    var rpcEndpoint: String { config.xionRPC }

    /// The REST endpoint for the XION testnet.
    var restEndpoint: String { config.xionREST }

    /// The treasury contract address.
    var treasuryContract: String { config.treasuryContract }

    /// The marketplace contract address.
    var marketplaceContract: String { config.marketplaceContract }

    init(config: AppConfig) {
        self.config = config
    }

    /// Fetch the USDC balance for a given XION address.
    /// Returns a human-readable string (e.g. "12.50") with 6-decimal USDC precision.
    func getBalance(address: String) async throws -> String {
        let urlString = "\(config.xionREST)/cosmos/bank/v1beta1/balances/\(address)/by_denom?denom=\(config.usdcDenom)"

        guard let url = URL(string: urlString) else {
            throw XionError.invalidURL
        }

        let (data, response) = try await URLSession.shared.data(from: url)

        guard let http = response as? HTTPURLResponse else {
            throw XionError.invalidResponse
        }
        guard http.statusCode == 200 else {
            let body = String(data: data, encoding: .utf8) ?? ""
            throw XionError.requestFailed(statusCode: http.statusCode, body: body)
        }

        let decoded = try JSONDecoder().decode(BalanceByDenomResponse.self, from: data)
        return formatUSDC(microAmount: decoded.balance.amount)
    }

    // MARK: - Helpers

    /// Convert a micro-USDC string (e.g. "12500000") to a human-readable amount ("12.50").
    private func formatUSDC(microAmount: String) -> String {
        guard let raw = Double(microAmount) else { return "0.00" }
        let usdc = raw / 1_000_000.0
        return String(format: "%.2f", usdc)
    }
}
