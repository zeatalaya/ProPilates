import SwiftUI

/// The ProPilates "P" logo with "PILATES" subtitle.
struct ProPilatesLogo: View {
    var size: CGFloat = 60

    var body: some View {
        VStack(spacing: 4) {
            Text("P")
                .font(.custom("CormorantGaramond-Bold", size: size))
                .foregroundStyle(Color.ppAccent)

            Text("PILATES")
                .font(.system(size: 12, weight: .medium))
                .tracking(6)
                .foregroundStyle(Color.ppTextSecondary)
        }
    }
}

#Preview {
    ProPilatesLogo()
        .padding()
        .background(Color.ppBackground)
}
