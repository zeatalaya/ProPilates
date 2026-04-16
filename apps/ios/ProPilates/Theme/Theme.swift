import SwiftUI

enum Theme {
    // MARK: - Spacing

    static let spacingXS: CGFloat = 4
    static let spacingSM: CGFloat = 8
    static let spacingMD: CGFloat = 16
    static let spacingLG: CGFloat = 24
    static let spacingXL: CGFloat = 32
    static let spacingXXL: CGFloat = 48

    // MARK: - Corner Radius

    static let radiusSM: CGFloat = 8
    static let radiusMD: CGFloat = 12
    static let radiusLG: CGFloat = 16
    static let radiusXL: CGFloat = 24
    static let radiusFull: CGFloat = 9999

    // MARK: - Shadows

    static let shadowRadius: CGFloat = 4
    static let shadowY: CGFloat = 2

    // MARK: - Sizing

    static let buttonHeight: CGFloat = 48
    static let iconSize: CGFloat = 24
    static let avatarSize: CGFloat = 40
    static let avatarLargeSize: CGFloat = 80
    static let navBarHeight: CGFloat = 56

    // MARK: - Animation

    static let animationDuration: Double = 0.25
    static let springResponse: Double = 0.4
    static let springDamping: Double = 0.75
}

// MARK: - Card Style Modifier

struct CardStyleModifier: ViewModifier {
    func body(content: Content) -> some View {
        content
            .padding(Theme.spacingMD)
            .background(Color.ppBackgroundCard)
            .cornerRadius(Theme.radiusMD)
            .overlay(
                RoundedRectangle(cornerRadius: Theme.radiusMD)
                    .stroke(Color.ppBorder, lineWidth: 1)
            )
            .shadow(
                color: Color.ppTextPrimary.opacity(0.05),
                radius: Theme.shadowRadius,
                x: 0,
                y: Theme.shadowY
            )
    }
}

extension View {
    /// Applies the standard ProPilates card style: background, border, rounded corners, and subtle shadow.
    func cardStyle() -> some View {
        modifier(CardStyleModifier())
    }
}
