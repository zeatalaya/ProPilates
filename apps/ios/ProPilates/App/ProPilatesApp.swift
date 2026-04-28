import SwiftUI

@main
struct ProPilatesApp: App {
    @State private var appState = AppState()

    init() {
        FontRegistration.registerFonts()
    }

    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(appState)
                .environment(appState.authService)
                .environment(appState.xionService)
                .environment(appState.supabaseService)
                .environment(appState.paymentService)
                .onOpenURL { url in
                    Task {
                        await appState.authService.handleCallback(url: url)
                    }
                }
        }
    }
}
