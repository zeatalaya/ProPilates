import SwiftUI

/// Reusable primary action button with loading state.
struct PrimaryButton: View {
    let title: String
    var isLoading: Bool = false
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            ZStack {
                if isLoading {
                    ProgressView()
                        .tint(.white)
                } else {
                    Text(title)
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundStyle(.white)
                }
            }
            .frame(maxWidth: .infinity)
            .frame(height: 50)
            .background(Color.ppAccent)
            .cornerRadius(Theme.radiusLG)
        }
        .disabled(isLoading)
    }
}

#Preview {
    VStack(spacing: 16) {
        PrimaryButton(title: "Get Started") {}
        PrimaryButton(title: "Loading...", isLoading: true) {}
    }
    .padding()
    .background(Color.ppBackground)
}
