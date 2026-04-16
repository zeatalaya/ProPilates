import SwiftUI

/// Main tab navigation with 7 tabs matching the React Native app.
struct MainTabView: View {
    var body: some View {
        TabView {
            HomeScreen()
                .tabItem {
                    Label("Home", systemImage: "house.fill")
                }

            BuilderScreen()
                .tabItem {
                    Label("Builder", systemImage: "square.stack.3d.up.fill")
                }

            TemplatesScreen()
                .tabItem {
                    Label("Classes", systemImage: "book.fill")
                }

            TeachScreen()
                .tabItem {
                    Label("Teach", systemImage: "play.circle.fill")
                }

            MarketplaceScreen()
                .tabItem {
                    Label("Market", systemImage: "bag.fill")
                }

            PortfolioScreen()
                .tabItem {
                    Label("Portfolio", systemImage: "briefcase.fill")
                }

            ProfileScreen()
                .tabItem {
                    Label("Profile", systemImage: "person.fill")
                }
        }
        .tint(.ppAccent)
    }
}

#Preview {
    MainTabView()
        .environment(AuthService(config: .load(), supabase: SupabaseService(config: .load())))
        .environment(SupabaseService(config: .load()))
        .environment(XionService(config: .load()))
}
