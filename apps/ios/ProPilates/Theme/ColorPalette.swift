import SwiftUI

extension Color {
    // MARK: - Backgrounds
    /// Warm off-white background
    static let ppBackground = Color(hex: "FAF8F5")
    /// Warm light gray for cards
    static let ppBackgroundCard = Color(hex: "F0ECE6")
    /// Elevated surface background
    static let ppBackgroundElevated = Color(hex: "E5E0D8")

    // MARK: - Borders
    /// Default border color
    static let ppBorder = Color(hex: "DDD8CF")

    // MARK: - Text
    /// Primary text color (near-black warm)
    static let ppTextPrimary = Color(hex: "2C2825")
    /// Secondary text color
    static let ppTextSecondary = Color(hex: "6B6560")
    /// Muted text color
    static let ppTextMuted = Color(hex: "9E9790")

    // MARK: - Brand
    /// Clay accent color
    static let ppAccent = Color(hex: "8A7E72")
    /// Dark clay accent
    static let ppAccentDark = Color(hex: "6E6358")
    /// Oak secondary color
    static let ppSecondary = Color(hex: "B5A99A")

    // MARK: - Semantic
    /// Sage green for success states
    static let ppSuccess = Color(hex: "7D9B76")
    /// Terracotta for error states
    static let ppError = Color(hex: "C67B6B")
}
