import Foundation

struct AppConfig {
    let supabaseURL: String
    let supabaseAnonKey: String
    let oauth3Server: String
    let oauth3ClientID: String
    let oauthRedirectURL: String
    let xionRPC: String
    let xionREST: String
    let treasuryContract: String
    let marketplaceContract: String
    let usdcDenom: String
    let spotifyClientID: String
    let stripePublishableKey: String
    let stripeMerchantID: String
    let apiBaseURL: String

    /// Loads configuration from Info.plist with fallback to built-in defaults.
    static func load() -> AppConfig {
        let info = Bundle.main.infoDictionary ?? [:]

        return AppConfig(
            supabaseURL: info["SUPABASE_URL"] as? String
                ?? "https://krgtqmrypauqisayyqfu.supabase.co",
            supabaseAnonKey: info["SUPABASE_ANON_KEY"] as? String
                ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtyZ3RxbXJ5cGF1cWlzYXl5cWZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MDI4MTIsImV4cCI6MjA4ODM3ODgxMn0.tDEykPrV12LMnhd2VlkezZk56WZrGHx4VT_Y84vINFo",
            oauth3Server: info["OAUTH3_SERVER"] as? String
                ?? "https://oauth2.testnet.burnt.com",
            oauth3ClientID: info["OAUTH3_CLIENT_ID"] as? String
                ?? "W04z4drnVQCIlieA",
            oauthRedirectURL: info["OAUTH_REDIRECT_URL"] as? String
                ?? "https://pro-pilates.vercel.app/api/auth/oauth3/callback",
            xionRPC: info["XION_RPC"] as? String
                ?? "https://rpc.xion-testnet-2.burnt.com:443",
            xionREST: info["XION_REST"] as? String
                ?? "https://api.xion-testnet-2.burnt.com",
            treasuryContract: info["TREASURY_CONTRACT"] as? String
                ?? "xion13ls6nwtr265rw3920auznvatw86g7ppjgvjww4zyhchdkrgp95mqlt8dzp",
            marketplaceContract: info["MARKETPLACE_CONTRACT"] as? String
                ?? "xion1wrzzfaflek5xk2rxw45vz692vnszkfsnpzcru8rcfujwqw0m5c2q3u2sku",
            usdcDenom: info["USDC_DENOM"] as? String
                ?? "ibc/usdc",
            spotifyClientID: info["SPOTIFY_CLIENT_ID"] as? String
                ?? "b3ab1ac165144645a27433d9b4599e90",
            stripePublishableKey: info["STRIPE_PUBLISHABLE_KEY"] as? String
                ?? "pk_test_REPLACE_WITH_YOUR_KEY",
            stripeMerchantID: info["STRIPE_MERCHANT_ID"] as? String
                ?? "merchant.com.propilates.app",
            apiBaseURL: info["API_BASE_URL"] as? String
                ?? "https://pro-pilates.vercel.app"
        )
    }

    /// Shared singleton instance.
    static let shared = AppConfig.load()
}
