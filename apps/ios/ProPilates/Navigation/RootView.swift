import SwiftUI

/// Auth gate: shows loading, auth screen, onboarding, or main tab view based on authentication state.
struct RootView: View {
    @Environment(AuthService.self) private var auth
    @State private var showOnboarding = false

    var body: some View {
        Group {
            if !auth.isInitialized {
                LoadingView()
            } else if auth.isAuthenticated {
                if auth.instructor?.onboardingComplete == true {
                    MainTabView()
                } else {
                    MainTabView()
                        #if os(iOS)
                        .fullScreenCover(isPresented: .constant(auth.instructor == nil || auth.instructor?.onboardingComplete == false)) {
                            OnboardingScreen()
                        }
                        #else
                        .sheet(isPresented: .constant(auth.instructor == nil || auth.instructor?.onboardingComplete == false)) {
                            OnboardingScreen()
                        }
                        #endif
                }
            } else {
                AuthScreen()
            }
        }
        .task {
            await auth.restoreSession()
        }
    }
}

#Preview {
    RootView()
        .environment(AuthService(config: .load(), supabase: SupabaseService(config: .load())))
        .environment(SupabaseService(config: .load()))
        .environment(XionService(config: .load()))
        .environment(PaymentService(config: .load()))
}
