import SwiftUI

/// Authentication screen matching the React Native auth design.
struct AuthScreen: View {
    @Environment(AuthService.self) private var auth
    @State private var showAlert = false
    @State private var alertMessage = ""

    var body: some View {
        ZStack {
            Color.ppBackground
                .ignoresSafeArea()

            VStack(spacing: Theme.spacingMD) {
                Spacer()

                // Logo
                ProPilatesLogo(size: 60)

                // Tagline
                Text("Your Pilates Studio, Elevated")
                    .font(.system(size: 16))
                    .foregroundStyle(Color.ppTextSecondary)
                    .padding(.top, Theme.spacingXS)

                Spacer()

                // Get Started button
                PrimaryButton(
                    title: "Get Started",
                    isLoading: auth.isAuthenticating
                ) {
                    Task {
                        do {
                            try await auth.login()
                        } catch {
                            alertMessage = error.localizedDescription
                            showAlert = true
                        }
                    }
                }
                .padding(.horizontal, Theme.spacingLG)

                // Log In link
                HStack(spacing: 4) {
                    Text("Already have an account?")
                        .font(.system(size: 14))
                        .foregroundStyle(Color.ppTextSecondary)

                    Button {
                        Task {
                            do {
                                try await auth.login()
                            } catch {
                                alertMessage = error.localizedDescription
                                showAlert = true
                            }
                        }
                    } label: {
                        Text("Log In")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundStyle(Color.ppAccent)
                    }
                }
                .padding(.top, Theme.spacingSM)

                // Bottom text
                Text("Sign in with email, Google, or passkey")
                    .font(.system(size: 12))
                    .foregroundStyle(Color.ppTextMuted)
                    .padding(.top, Theme.spacingSM)
                    .padding(.bottom, Theme.spacingXL)
            }
        }
        .alert("Error", isPresented: $showAlert) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(alertMessage)
        }
    }
}

#Preview {
    AuthScreen()
        .environment(AuthService(config: .load(), supabase: SupabaseService(config: .load())))
}
