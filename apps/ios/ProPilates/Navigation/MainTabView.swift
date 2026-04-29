import SwiftUI

/// Main tab navigation with tabs. Uses "More" menu for overflow tabs.
struct MainTabView: View {
    @State var selectedTab: AppTab = .home

    var body: some View {
        TabView(selection: $selectedTab) {
            HomeScreen(selectedTab: $selectedTab)
                .tabItem {
                    Label("Home", systemImage: "house.fill")
                }
                .tag(AppTab.home)

            BuilderScreen()
                .tabItem {
                    Label("Builder", systemImage: "square.stack.3d.up.fill")
                }
                .tag(AppTab.builder)

            TemplatesScreen()
                .tabItem {
                    Label("Classes", systemImage: "book.fill")
                }
                .tag(AppTab.classes)

            TeachScreen()
                .tabItem {
                    Label("Teach", systemImage: "play.circle.fill")
                }
                .tag(AppTab.teach)

            MoreScreen(selectedTab: $selectedTab)
                .tabItem {
                    Label("More", systemImage: "ellipsis.circle.fill")
                }
                .tag(AppTab.more)
        }
        .tint(.ppAccent)
    }
}

enum AppTab: Hashable {
    case home, builder, classes, teach, more
    case marketplace, portfolio, profile
}

/// "More" tab that shows Marketplace, Portfolio, Profile as navigation links
struct MoreScreen: View {
    @Binding var selectedTab: AppTab

    var body: some View {
        NavigationStack {
            List {
                NavigationLink {
                    MarketplaceScreen()
                } label: {
                    Label("Marketplace", systemImage: "bag.fill")
                }

                NavigationLink {
                    PortfolioScreen()
                } label: {
                    Label("Portfolio", systemImage: "briefcase.fill")
                }

                NavigationLink {
                    ProfileScreen()
                } label: {
                    Label("Profile", systemImage: "person.fill")
                }
            }
            .navigationTitle("More")
            #if os(iOS)
            .toolbarTitleDisplayMode(.large)
            #endif
        }
    }
}

#Preview {
    MainTabView()
        .environment(AuthService(config: .load(), supabase: SupabaseService(config: .load())))
        .environment(SupabaseService(config: .load()))
        .environment(XionService(config: .load()))
        .environment(PaymentService(config: .load()))
}
