import SwiftUI

struct HomeScreen: View {
    @Environment(AuthService.self) private var auth
    @Binding var selectedTab: AppTab

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: Theme.spacingLG) {
                    heroSection
                    featuresSection
                    pricingSection
                }
                .padding(.bottom, Theme.spacingXL)
            }
            .background(Color.ppBackground)
            .navigationTitle("Home")
            #if os(iOS)
            .toolbarTitleDisplayMode(.large)
            #endif
        }
    }

    // MARK: - Hero

    private var heroSection: some View {
        VStack(spacing: Theme.spacingMD) {
            ProPilatesLogo()
                .padding(.top, Theme.spacingLG)

            Text("Your Pilates Studio, Elevated")
                .headingFont(size: 28)
                .foregroundStyle(Color.ppTextPrimary)
                .multilineTextAlignment(.center)

            Text("Build classes, teach with precision, trade portfolios, and verify your credentials — all in one platform.")
                .bodyFont(size: 15)
                .foregroundStyle(Color.ppTextSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, Theme.spacingLG)

            if let instructor = auth.instructor {
                VStack(spacing: Theme.spacingSM) {
                    Text("Welcome back, \(instructor.name)")
                        .subheadingFont(size: 20)
                        .foregroundStyle(Color.ppAccent)

                    HStack(spacing: Theme.spacingSM) {
                        tierBadge(instructor.tier)
                        Text("•")
                            .foregroundStyle(Color.ppTextMuted)
                        Text("\(instructor.methods.count) methods")
                            .bodyFont(size: 13)
                            .foregroundStyle(Color.ppTextSecondary)
                    }
                }
                .padding(.top, Theme.spacingSM)
            }
        }
        .padding(.horizontal, Theme.spacingMD)
    }

    // MARK: - Features

    private var featuresSection: some View {
        VStack(spacing: Theme.spacingMD) {
            Text("Features")
                .subheadingFont(size: 22)
                .foregroundStyle(Color.ppTextPrimary)
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.horizontal, Theme.spacingMD)

            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: Theme.spacingMD) {
                featureCard(icon: "square.stack.3d.up.fill", title: "Class Builder", description: "Create structured Pilates classes with exercises, timing, and cues") {
                    selectedTab = .builder
                }
                featureCard(icon: "play.circle.fill", title: "Teaching Mode", description: "Live class delivery with timers, music, and voice cues") {
                    selectedTab = .teach
                }
                featureCard(icon: "bag.fill", title: "Marketplace", description: "Buy and sell class portfolios on the marketplace") {
                    selectedTab = .more
                }
                featureCard(icon: "book.fill", title: "Class Templates", description: "Browse pre-built classes from the Pilates exercise library") {
                    selectedTab = .classes
                }
                featureCard(icon: "music.note", title: "Spotify", description: "Integrate your playlists directly into your teaching flow") {
                    selectedTab = .builder
                }
                featureCard(icon: "person.crop.circle.badge.checkmark", title: "Easy Sign-Up", description: "One-click wallet creation with no crypto knowledge needed") {
                    selectedTab = .more
                }
            }
            .padding(.horizontal, Theme.spacingMD)
        }
    }

    // MARK: - Pricing

    private var pricingSection: some View {
        VStack(spacing: Theme.spacingMD) {
            Text("Pricing")
                .subheadingFont(size: 22)
                .foregroundStyle(Color.ppTextPrimary)
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.horizontal, Theme.spacingMD)

            HStack(spacing: Theme.spacingMD) {
                pricingCard(
                    tier: "Free",
                    price: "$0",
                    features: ["Build classes", "Exercise library", "Teaching mode"],
                    isPremium: false
                )
                pricingCard(
                    tier: "Premium",
                    price: "$4.99/mo",
                    features: ["Save classes", "Marketplace", "Spotify", "Verification badges"],
                    isPremium: true
                )
            }
            .padding(.horizontal, Theme.spacingMD)
        }
    }

    // MARK: - Subviews

    private func featureCard(icon: String, title: String, description: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            VStack(alignment: .leading, spacing: Theme.spacingSM) {
                Image(systemName: icon)
                    .font(.system(size: 24))
                    .foregroundStyle(Color.ppAccent)

                Text(title)
                    .subheadingFont(size: 16)
                    .foregroundStyle(Color.ppTextPrimary)

                Text(description)
                    .bodyFont(size: 12)
                    .foregroundStyle(Color.ppTextSecondary)
                    .lineLimit(3)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .cardStyle()
        }
        .buttonStyle(.plain)
    }

    private func pricingCard(tier: String, price: String, features: [String], isPremium: Bool) -> some View {
        VStack(alignment: .leading, spacing: Theme.spacingSM) {
            if isPremium {
                Text("Popular")
                    .bodyFont(size: 11)
                    .foregroundStyle(.white)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 3)
                    .background(Color.ppAccent)
                    .cornerRadius(Theme.radiusFull)
            }

            Text(tier)
                .subheadingFont(size: 18)
                .foregroundStyle(Color.ppTextPrimary)

            Text(price)
                .headingFont(size: 24)
                .foregroundStyle(isPremium ? Color.ppAccent : Color.ppTextPrimary)

            ForEach(features, id: \.self) { feature in
                HStack(spacing: 6) {
                    Image(systemName: "checkmark")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundStyle(Color.ppSuccess)
                    Text(feature)
                        .bodyFont(size: 13)
                        .foregroundStyle(Color.ppTextSecondary)
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardStyle()
        .overlay(
            RoundedRectangle(cornerRadius: Theme.radiusMD)
                .stroke(isPremium ? Color.ppAccent : Color.clear, lineWidth: isPremium ? 2 : 0)
        )
    }

    private func tierBadge(_ tier: Tier) -> some View {
        Text(tier.rawValue.capitalized)
            .bodyFont(size: 12)
            .foregroundStyle(tier == .premium ? Color.ppAccent : Color.ppTextMuted)
            .padding(.horizontal, 8)
            .padding(.vertical, 3)
            .background(
                tier == .premium
                    ? Color.ppAccent.opacity(0.12)
                    : Color.ppBackgroundElevated
            )
            .cornerRadius(Theme.radiusFull)
    }
}

#Preview {
    HomeScreen(selectedTab: .constant(.home))
        .environment(AuthService(config: .load(), supabase: SupabaseService(config: .load())))
}
