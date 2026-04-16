import SwiftUI

// MARK: - Font Registration

struct FontRegistration {
    /// Call once at app launch to register Cormorant Garamond fonts from the bundle.
    static func registerFonts() {
        let fontNames = [
            "CormorantGaramond-Regular",
            "CormorantGaramond-Medium",
            "CormorantGaramond-SemiBold",
            "CormorantGaramond-Bold"
        ]

        for fontName in fontNames {
            guard let url = Bundle.main.url(forResource: fontName, withExtension: "ttf") else {
                print("Warning: Could not find font file \(fontName).ttf in bundle")
                continue
            }
            guard let fontDataProvider = CGDataProvider(url: url as CFURL) else {
                print("Warning: Could not create data provider for \(fontName)")
                continue
            }
            guard let font = CGFont(fontDataProvider) else {
                print("Warning: Could not create CGFont for \(fontName)")
                continue
            }
            var error: Unmanaged<CFError>?
            if !CTFontManagerRegisterGraphicsFont(font, &error) {
                let description = error?.takeRetainedValue().localizedDescription ?? "unknown error"
                print("Warning: Failed to register font \(fontName): \(description)")
            }
        }
    }
}

// MARK: - Custom Font Names

private enum AppFont {
    static let headingBold = "CormorantGaramond-Bold"
    static let subheadingSemiBold = "CormorantGaramond-SemiBold"
}

// MARK: - View Modifiers

struct HeadingFontModifier: ViewModifier {
    let size: CGFloat

    func body(content: Content) -> some View {
        content.font(.custom(AppFont.headingBold, size: size))
    }
}

struct SubheadingFontModifier: ViewModifier {
    let size: CGFloat

    func body(content: Content) -> some View {
        content.font(.custom(AppFont.subheadingSemiBold, size: size))
    }
}

struct BodyFontModifier: ViewModifier {
    let size: CGFloat

    func body(content: Content) -> some View {
        content.font(.system(size: size))
    }
}

// MARK: - View Extensions

extension View {
    /// Applies CormorantGaramond-Bold at the given size.
    func headingFont(size: CGFloat = 28) -> some View {
        modifier(HeadingFontModifier(size: size))
    }

    /// Applies CormorantGaramond-SemiBold at the given size.
    func subheadingFont(size: CGFloat = 22) -> some View {
        modifier(SubheadingFontModifier(size: size))
    }

    /// Applies the system font at the given size.
    func bodyFont(size: CGFloat = 16) -> some View {
        modifier(BodyFontModifier(size: size))
    }
}
