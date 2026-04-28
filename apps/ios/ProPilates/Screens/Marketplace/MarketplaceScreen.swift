import SwiftUI

struct MarketplaceScreen: View {
    @Environment(AuthService.self) private var auth
    @Environment(SupabaseService.self) private var supabase

    @State private var classes: [PilatesClass] = []
    @State private var isLoading = true
    @State private var searchText = ""
    @State private var filterMethod: PilatesMethod?

    var filteredClasses: [PilatesClass] {
        classes.filter { pc in
            if !searchText.isEmpty,
               !pc.title.localizedCaseInsensitiveContains(searchText) { return false }
            if let method = filterMethod, pc.method != method { return false }
            return true
        }
    }

    var body: some View {
        NavigationStack {
            ZStack {
                Color.ppBackground.ignoresSafeArea()

                if isLoading {
                    ProgressView("Loading marketplace...")
                        .foregroundStyle(Color.ppTextSecondary)
                } else if classes.isEmpty {
                    emptyState
                } else {
                    ScrollView {
                        VStack(spacing: Theme.spacingMD) {
                            searchBar
                            methodFilter

                            LazyVStack(spacing: Theme.spacingMD) {
                                ForEach(filteredClasses, id: \.id) { pc in
                                    NavigationLink {
                                        MarketplaceDetailView(pilatesClass: pc)
                                    } label: {
                                        classCard(pc)
                                    }
                                }
                            }
                        }
                        .padding(Theme.spacingMD)
                    }
                }
            }
            .navigationTitle("Marketplace")
            #if os(iOS)
            .toolbarTitleDisplayMode(.large)
            #endif
            .task { await loadClasses() }
            .refreshable { await loadClasses() }
        }
    }

    // MARK: - Search

    private var searchBar: some View {
        HStack {
            Image(systemName: "magnifyingglass").foregroundStyle(Color.ppTextMuted)
            TextField("Search classes...", text: $searchText).bodyFont(size: 14)
        }
        .padding(10)
        .background(Color.ppBackgroundCard)
        .cornerRadius(Theme.radiusSM)
        .overlay(RoundedRectangle(cornerRadius: Theme.radiusSM).stroke(Color.ppBorder, lineWidth: 1))
    }

    private var methodFilter: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 6) {
                filterPill("All", isActive: filterMethod == nil) { filterMethod = nil }
                ForEach(PilatesMethod.allCases, id: \.self) { method in
                    filterPill(methodDisplayName(method), isActive: filterMethod == method) { filterMethod = method }
                }
            }
        }
    }

    // MARK: - Class Card

    private func classCard(_ pc: PilatesClass) -> some View {
        VStack(alignment: .leading, spacing: Theme.spacingSM) {
            HStack {
                Text(pc.title)
                    .subheadingFont(size: 18)
                    .foregroundStyle(Color.ppTextPrimary)
                Spacer()
                if let price = pc.price {
                    Text("$\(String(format: "%.2f", price))")
                        .subheadingFont(size: 16)
                        .foregroundStyle(Color.ppAccent)
                }
            }

            HStack(spacing: 6) {
                badge(methodDisplayName(pc.method), color: .ppAccent)
                badge(pc.difficulty.rawValue.capitalized, color: difficultyColor(pc.difficulty))
                badge("\(pc.durationMinutes) min", color: .ppTextSecondary)
            }

            if let instructor = pc.instructor {
                HStack(spacing: 6) {
                    Image(systemName: "person.circle")
                        .font(.system(size: 14))
                        .foregroundStyle(Color.ppTextMuted)
                    Text(instructor.name)
                        .bodyFont(size: 13)
                        .foregroundStyle(Color.ppTextSecondary)
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardStyle()
    }

    private var emptyState: some View {
        VStack(spacing: Theme.spacingMD) {
            Image(systemName: "bag")
                .font(.system(size: 40))
                .foregroundStyle(Color.ppTextMuted)
            Text("No classes listed yet")
                .headingFont(size: 22)
                .foregroundStyle(Color.ppTextPrimary)
            Text("Be the first to list a class on the marketplace")
                .bodyFont(size: 14)
                .foregroundStyle(Color.ppTextSecondary)
        }
    }

    // MARK: - Helpers

    private func loadClasses() async {
        isLoading = true
        defer { isLoading = false }
        do {
            classes = try await supabase.fetchMarketplaceClasses()
        } catch {
            print("[MarketplaceScreen] Error: \(error)")
        }
    }

    private func badge(_ text: String, color: Color) -> some View {
        Text(text).bodyFont(size: 11).foregroundStyle(color)
            .padding(.horizontal, 8).padding(.vertical, 3)
            .background(color.opacity(0.1)).cornerRadius(Theme.radiusFull)
    }

    private func filterPill(_ title: String, isActive: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(title).bodyFont(size: 12)
                .foregroundStyle(isActive ? .white : Color.ppTextSecondary)
                .padding(.horizontal, 12).padding(.vertical, 6)
                .background(isActive ? Color.ppAccent : Color.ppBackgroundCard)
                .cornerRadius(Theme.radiusFull)
                .overlay(RoundedRectangle(cornerRadius: Theme.radiusFull).stroke(isActive ? Color.ppAccent : Color.ppBorder, lineWidth: 1))
        }
    }

    private func difficultyColor(_ d: Difficulty) -> Color {
        switch d { case .beginner: return .ppSuccess; case .intermediate: return .ppAccent; case .advanced: return .ppError }
    }

    private func methodDisplayName(_ m: PilatesMethod) -> String {
        switch m {
        case .mat: return "Mat"; case .reformer: return "Reformer"; case .xReformer: return "X-Reformer"
        case .chair: return "Chair"; case .tower: return "Tower"; case .barrel: return "Barrel"
        case .ring: return "Ring"; case .band: return "Band"; case .foamRoller: return "Foam Roller"
        }
    }
}

// MARK: - Marketplace Detail

struct MarketplaceDetailView: View {
    @Environment(AuthService.self) private var auth
    @Environment(SupabaseService.self) private var supabase
    @Environment(PaymentService.self) private var payment
    let pilatesClass: PilatesClass

    @State private var detailedClass: PilatesClass?
    @State private var isLoading = true
    @State private var isPurchasing = false
    @State private var purchaseError: String?
    @State private var showPurchaseSuccess = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Theme.spacingMD) {
                if isLoading {
                    ProgressView()
                        .frame(maxWidth: .infinity)
                        .padding(.top, Theme.spacingXXL)
                } else if let pc = detailedClass {
                    // Header
                    Text(pc.title)
                        .headingFont(size: 28)
                        .foregroundStyle(Color.ppTextPrimary)

                    if let instructor = pc.instructor {
                        HStack(spacing: 8) {
                            Image(systemName: "person.circle.fill")
                                .font(.system(size: 20))
                                .foregroundStyle(Color.ppAccent)
                            Text(instructor.name)
                                .bodyFont(size: 15)
                                .foregroundStyle(Color.ppTextSecondary)
                        }
                    }

                    Text(pc.description)
                        .bodyFont(size: 14)
                        .foregroundStyle(Color.ppTextSecondary)

                    // Stats
                    HStack(spacing: Theme.spacingLG) {
                        stat(label: "Duration", value: "\(pc.durationMinutes) min")
                        stat(label: "Difficulty", value: pc.difficulty.rawValue.capitalized)
                        stat(label: "Type", value: pc.classType.rawValue.capitalized)
                    }
                    .cardStyle()

                    // Blocks
                    if let blocks = pc.blocks, !blocks.isEmpty {
                        Text("Class Structure")
                            .subheadingFont(size: 18)
                            .foregroundStyle(Color.ppTextPrimary)

                        ForEach(blocks, id: \.id) { block in
                            VStack(alignment: .leading, spacing: Theme.spacingSM) {
                                Text(block.name)
                                    .subheadingFont(size: 16)
                                    .foregroundStyle(Color.ppAccent)

                                ForEach(block.exercises, id: \.id) { ex in
                                    HStack {
                                        Text(ex.exercise?.name ?? "Exercise")
                                            .bodyFont(size: 13)
                                            .foregroundStyle(Color.ppTextPrimary)
                                        Spacer()
                                        Text("\(ex.duration / 60):\(String(format: "%02d", ex.duration % 60))")
                                            .bodyFont(size: 12)
                                            .foregroundStyle(Color.ppTextMuted)
                                    }
                                }
                            }
                            .cardStyle()
                        }
                    }

                    // Price & Buy
                    if let price = pc.price {
                        VStack(spacing: Theme.spacingSM) {
                            Text("$\(String(format: "%.2f", price))")
                                .headingFont(size: 24)
                                .foregroundStyle(Color.ppAccent)

                            Button {
                                Task { await purchaseClass(pc, price: price) }
                            } label: {
                                if isPurchasing {
                                    ProgressView()
                                        .tint(.white)
                                } else {
                                    Label("Purchase with Apple Pay", systemImage: "creditcard")
                                        .bodyFont(size: 15)
                                        .foregroundStyle(.white)
                                }
                            }
                            .frame(maxWidth: .infinity)
                            .frame(height: Theme.buttonHeight)
                            .background(Color.ppAccent)
                            .cornerRadius(Theme.radiusLG)
                            .disabled(isPurchasing)
                        }
                        .padding(.top, Theme.spacingMD)
                    }
                }
            }
            .padding(Theme.spacingMD)
        }
        .background(Color.ppBackground)
        .navigationTitle(pilatesClass.title)
        #if os(iOS)
        .navigationBarTitleDisplayMode(.inline)
        #endif
        .task {
            do {
                detailedClass = try await supabase.fetchClassWithDetails(classId: pilatesClass.id)
            } catch {
                print("[MarketplaceDetail] Error: \(error)")
            }
            isLoading = false
        }
        .alert("Purchase Complete", isPresented: $showPurchaseSuccess) {
            Button("OK", role: .cancel) {}
        } message: {
            Text("You now have access to this class in your portfolio.")
        }
        .alert("Payment Error", isPresented: .init(
            get: { purchaseError != nil },
            set: { if !$0 { purchaseError = nil } }
        )) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(purchaseError ?? "")
        }
    }

    @MainActor
    private func purchaseClass(_ pc: PilatesClass, price: Double) async {
        guard let instructor = auth.instructor else { return }
        isPurchasing = true
        defer { isPurchasing = false }

        do {
            _ = try await payment.purchaseClass(
                instructorId: instructor.id,
                classId: pc.id,
                amount: price,
                sellerStripeAccountId: pc.instructor?.stripeAccountId
            )
            showPurchaseSuccess = true
        } catch let error as PaymentError where error.errorDescription?.contains("cancelled") == true {
            // User cancelled — do nothing
        } catch {
            purchaseError = error.localizedDescription
        }
    }

    private func stat(label: String, value: String) -> some View {
        VStack(spacing: 2) {
            Text(value).subheadingFont(size: 16).foregroundStyle(Color.ppTextPrimary)
            Text(label).bodyFont(size: 11).foregroundStyle(Color.ppTextMuted)
        }
        .frame(maxWidth: .infinity)
    }
}

#Preview {
    MarketplaceScreen()
        .environment(AuthService(config: .load(), supabase: SupabaseService(config: .load())))
        .environment(SupabaseService(config: .load()))
        .environment(PaymentService(config: .load()))
}
