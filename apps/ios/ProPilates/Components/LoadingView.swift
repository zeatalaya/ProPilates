import SwiftUI

/// A simple centered loading spinner on the app background.
struct LoadingView: View {
    var body: some View {
        ZStack {
            Color.ppBackground
                .ignoresSafeArea()

            VStack(spacing: Theme.spacingMD) {
                ProgressView()
                    .tint(.ppAccent)

                Text("Loading...")
                    .font(.system(size: 14))
                    .foregroundStyle(Color.ppTextMuted)
            }
        }
    }
}

#Preview {
    LoadingView()
}
