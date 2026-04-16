import Foundation

/// Root application state that owns all services.
@Observable
final class AppState {
    let authService: AuthService
    let xionService: XionService
    let supabaseService: SupabaseService

    init() {
        let config = AppConfig.load()

        // Create services in dependency order
        let supabase = SupabaseService(config: config)
        let xion = XionService(config: config)
        let auth = AuthService(config: config, supabase: supabase)

        self.supabaseService = supabase
        self.xionService = xion
        self.authService = auth
    }
}
