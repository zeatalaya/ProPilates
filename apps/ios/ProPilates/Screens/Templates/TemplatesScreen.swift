import SwiftUI

// MARK: - Section Enum

private enum ClassSection: String, CaseIterable {
    case free = "Free"
    case premium = "Premium"
    case community = "Community"
}

// MARK: - Classes Screen

struct TemplatesScreen: View {
    @Environment(SupabaseService.self) private var supabase
    @Environment(AuthService.self) private var auth

    @State private var templates: [PilatesClass] = []
    @State private var marketplaceClasses: [PilatesClass] = []
    @State private var isLoading = true
    @State private var filterMethod: PilatesMethod?
    @State private var selectedSection: ClassSection = .free

    private let freeLimit = 10

    // MARK: - Derived Data

    private var freeTemplates: [PilatesClass] {
        let base = Array(templates.prefix(freeLimit))
        return applyMethodFilter(base)
    }

    private var premiumTemplates: [PilatesClass] {
        let base = templates.count > freeLimit ? Array(templates.dropFirst(freeLimit)) : []
        return applyMethodFilter(base)
    }

    private var communityClasses: [PilatesClass] {
        let currentUserId = auth.instructor?.id
        let base = marketplaceClasses.filter { item in
            if let currentUserId { return item.instructorId != currentUserId }
            return true
        }
        return applyMethodFilter(base)
    }

    private var isPremium: Bool {
        auth.tier == .premium
    }

    private func applyMethodFilter(_ classes: [PilatesClass]) -> [PilatesClass] {
        guard let method = filterMethod else { return classes }
        return classes.filter { $0.method == method }
    }

    // MARK: - Body

    var body: some View {
        NavigationStack {
            ZStack {
                Color.ppBackground.ignoresSafeArea()

                if isLoading {
                    ProgressView("Loading classes...")
                        .foregroundStyle(Color.ppTextSecondary)
                } else {
                    VStack(spacing: 0) {
                        // Segmented Picker
                        Picker("Section", selection: $selectedSection) {
                            ForEach(ClassSection.allCases, id: \.self) { section in
                                Text(section.rawValue).tag(section)
                            }
                        }
                        .pickerStyle(.segmented)
                        .padding(.horizontal, Theme.spacingMD)
                        .padding(.top, Theme.spacingSM)
                        .padding(.bottom, Theme.spacingSM)

                        // Method filter pills
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 6) {
                                filterPill("All", isActive: filterMethod == nil) { filterMethod = nil }
                                ForEach(PilatesMethod.allCases, id: \.self) { method in
                                    filterPill(method.displayName, isActive: filterMethod == method) { filterMethod = method }
                                }
                            }
                            .padding(.horizontal, Theme.spacingMD)
                        }
                        .padding(.bottom, Theme.spacingSM)

                        // Content
                        switch selectedSection {
                        case .free:
                            freeSection
                        case .premium:
                            premiumSection
                        case .community:
                            communitySection
                        }
                    }
                }
            }
            .navigationTitle("Classes")
            #if os(iOS)
            .toolbarTitleDisplayMode(.large)
            #endif
            .task { await loadAll() }
            .refreshable { await loadAll() }
        }
    }

    // MARK: - Free Section

    private var freeSection: some View {
        Group {
            if freeTemplates.isEmpty {
                emptyState(icon: "book.closed", message: "No Free Classes Available")
            } else {
                ScrollView {
                    LazyVStack(spacing: Theme.spacingMD) {
                        ForEach(freeTemplates, id: \.id) { template in
                            NavigationLink {
                                TemplateDetailView(template: template, mode: .template)
                            } label: {
                                templateCard(template)
                            }
                        }
                    }
                    .padding(Theme.spacingMD)
                }
            }
        }
    }

    // MARK: - Premium Section

    private var premiumSection: some View {
        Group {
            if !isPremium {
                premiumLockedView
            } else if premiumTemplates.isEmpty {
                emptyState(icon: "crown", message: "No Premium Classes Available")
            } else {
                ScrollView {
                    LazyVStack(spacing: Theme.spacingMD) {
                        ForEach(premiumTemplates, id: \.id) { template in
                            NavigationLink {
                                TemplateDetailView(template: template, mode: .template)
                            } label: {
                                templateCard(template)
                            }
                        }
                    }
                    .padding(Theme.spacingMD)
                }
            }
        }
    }

    private var premiumLockedView: some View {
        VStack(spacing: Theme.spacingMD) {
            Spacer()

            Image(systemName: "lock.fill")
                .font(.system(size: 48))
                .foregroundStyle(Color.ppAccent)

            Text("Premium Classes")
                .headingFont(size: 24)
                .foregroundStyle(Color.ppTextPrimary)

            let count = templates.count > freeLimit ? templates.count - freeLimit : 0
            Text("Upgrade to Premium to access \(count)+ class plans")
                .bodyFont(size: 15)
                .foregroundStyle(Color.ppTextSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, Theme.spacingLG)

            Text("$4.99 / month")
                .subheadingFont(size: 18)
                .foregroundStyle(Color.ppAccent)
                .padding(.top, Theme.spacingSM)

            Spacer()
        }
    }

    // MARK: - Community Section

    private var communitySection: some View {
        Group {
            if communityClasses.isEmpty {
                emptyState(icon: "person.3", message: "No Community Classes Listed")
            } else {
                ScrollView {
                    LazyVStack(spacing: Theme.spacingMD) {
                        ForEach(communityClasses, id: \.id) { item in
                            NavigationLink {
                                TemplateDetailView(template: item, mode: .marketplace)
                            } label: {
                                marketplaceCard(item)
                            }
                        }
                    }
                    .padding(Theme.spacingMD)
                }
            }
        }
    }

    // MARK: - Cards

    private func templateCard(_ pc: PilatesClass) -> some View {
        VStack(alignment: .leading, spacing: Theme.spacingSM) {
            Text(pc.title)
                .subheadingFont(size: 18)
                .foregroundStyle(Color.ppTextPrimary)

            Text(pc.description)
                .bodyFont(size: 13)
                .foregroundStyle(Color.ppTextSecondary)
                .lineLimit(2)
                .multilineTextAlignment(.leading)

            HStack(spacing: 6) {
                badge(pc.method.displayName, color: .ppAccent)
                badge(pc.difficulty.rawValue.capitalized, color: difficultyColor(pc.difficulty))
                badge("\(pc.durationMinutes) min", color: .ppTextSecondary)

                if let blocks = pc.blocks {
                    let exCount = blocks.flatMap(\.exercises).count
                    badge("\(exCount) exercises", color: .ppTextMuted)
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardStyle()
    }

    private func marketplaceCard(_ pc: PilatesClass) -> some View {
        VStack(alignment: .leading, spacing: Theme.spacingSM) {
            HStack {
                Text(pc.title)
                    .subheadingFont(size: 18)
                    .foregroundStyle(Color.ppTextPrimary)

                Spacer()

                if let price = pc.price {
                    Text(String(format: "$%.2f", price))
                        .subheadingFont(size: 16)
                        .foregroundStyle(Color.ppAccent)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 4)
                        .background(Color.ppAccent.opacity(0.1))
                        .cornerRadius(Theme.radiusFull)
                }
            }

            if let instructor = pc.instructor {
                HStack(spacing: 4) {
                    Image(systemName: "person.circle.fill")
                        .font(.system(size: 12))
                        .foregroundStyle(Color.ppTextMuted)
                    Text(instructor.name)
                        .bodyFont(size: 13)
                        .foregroundStyle(Color.ppTextSecondary)
                }
            }

            Text(pc.description)
                .bodyFont(size: 13)
                .foregroundStyle(Color.ppTextSecondary)
                .lineLimit(2)
                .multilineTextAlignment(.leading)

            HStack(spacing: 6) {
                badge(pc.method.displayName, color: .ppAccent)
                badge(pc.difficulty.rawValue.capitalized, color: difficultyColor(pc.difficulty))
                badge("\(pc.durationMinutes) min", color: .ppTextSecondary)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardStyle()
    }

    // MARK: - Helpers

    private func emptyState(icon: String, message: String) -> some View {
        VStack(spacing: Theme.spacingMD) {
            Spacer()
            Image(systemName: icon)
                .font(.system(size: 40))
                .foregroundStyle(Color.ppTextMuted)
            Text(message)
                .headingFont(size: 22)
                .foregroundStyle(Color.ppTextPrimary)
            Spacer()
        }
        .frame(maxWidth: .infinity)
    }

    private func loadAll() async {
        isLoading = true
        defer { isLoading = false }

        async let templatesFetch = supabase.fetchTemplateClasses()
        async let marketplaceFetch = supabase.fetchMarketplaceClasses()

        do {
            templates = try await templatesFetch
        } catch {
            print("[TemplatesScreen] Error loading templates: \(error)")
        }

        do {
            marketplaceClasses = try await marketplaceFetch
        } catch {
            print("[TemplatesScreen] Error loading marketplace: \(error)")
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
}

// MARK: - Detail View Mode

private enum DetailMode {
    case template
    case marketplace
}

// MARK: - Template Detail

struct TemplateDetailView: View {
    let template: PilatesClass
    fileprivate var mode: DetailMode = .template

    var body: some View {
        VStack(spacing: 0) {
            ScrollView {
                VStack(alignment: .leading, spacing: Theme.spacingMD) {
                    Text(template.title)
                        .headingFont(size: 28)
                        .foregroundStyle(Color.ppTextPrimary)

                    Text(template.description)
                        .bodyFont(size: 14)
                        .foregroundStyle(Color.ppTextSecondary)

                    // Instructor (marketplace items)
                    if mode == .marketplace, let instructor = template.instructor {
                        HStack(spacing: 8) {
                            Image(systemName: "person.circle.fill")
                                .font(.system(size: 20))
                                .foregroundStyle(Color.ppTextMuted)
                            VStack(alignment: .leading, spacing: 2) {
                                Text(instructor.name)
                                    .subheadingFont(size: 15)
                                    .foregroundStyle(Color.ppTextPrimary)
                                Text(instructor.location)
                                    .bodyFont(size: 12)
                                    .foregroundStyle(Color.ppTextMuted)
                            }
                        }
                    }

                    // Stats row
                    HStack(spacing: Theme.spacingLG) {
                        VStack(spacing: 2) {
                            Text("\(template.durationMinutes)")
                                .subheadingFont(size: 20)
                                .foregroundStyle(Color.ppTextPrimary)
                            Text("minutes")
                                .bodyFont(size: 11)
                                .foregroundStyle(Color.ppTextMuted)
                        }
                        .frame(maxWidth: .infinity)

                        VStack(spacing: 2) {
                            Text("\(template.blocks?.count ?? 0)")
                                .subheadingFont(size: 20)
                                .foregroundStyle(Color.ppTextPrimary)
                            Text("blocks")
                                .bodyFont(size: 11)
                                .foregroundStyle(Color.ppTextMuted)
                        }
                        .frame(maxWidth: .infinity)

                        VStack(spacing: 2) {
                            let count = template.blocks?.flatMap(\.exercises).count ?? 0
                            Text("\(count)")
                                .subheadingFont(size: 20)
                                .foregroundStyle(Color.ppTextPrimary)
                            Text("exercises")
                                .bodyFont(size: 11)
                                .foregroundStyle(Color.ppTextMuted)
                        }
                        .frame(maxWidth: .infinity)
                    }
                    .cardStyle()

                    // Method / Difficulty / Duration badges
                    HStack(spacing: 6) {
                        detailBadge(template.method.displayName, color: .ppAccent)
                        detailBadge(template.difficulty.rawValue.capitalized, color: difficultyColor(template.difficulty))
                        detailBadge("\(template.durationMinutes) min", color: .ppTextSecondary)
                    }

                    // Blocks
                    if let blocks = template.blocks {
                        ForEach(blocks, id: \.id) { block in
                            VStack(alignment: .leading, spacing: Theme.spacingSM) {
                                Text(block.name)
                                    .subheadingFont(size: 16)
                                    .foregroundStyle(Color.ppAccent)

                                ForEach(block.exercises, id: \.id) { ex in
                                    HStack {
                                        VStack(alignment: .leading, spacing: 2) {
                                            Text(ex.exercise?.name ?? "Exercise")
                                                .bodyFont(size: 14)
                                                .foregroundStyle(Color.ppTextPrimary)
                                            if !ex.notes.isEmpty {
                                                Text(ex.notes)
                                                    .bodyFont(size: 11)
                                                    .foregroundStyle(Color.ppTextMuted)
                                            }
                                        }
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
                }
                .padding(Theme.spacingMD)
                .padding(.bottom, Theme.spacingLG)
            }

            // Bottom action buttons
            bottomActions
        }
        .background(Color.ppBackground)
        .navigationTitle(template.title)
        #if os(iOS)
        .navigationBarTitleDisplayMode(.inline)
        #endif
    }

    @ViewBuilder
    private var bottomActions: some View {
        VStack(spacing: Theme.spacingSM) {
            Divider().overlay(Color.ppBorder)

            switch mode {
            case .template:
                HStack(spacing: Theme.spacingSM) {
                    Button {
                        // Navigate to builder tab with template loaded
                    } label: {
                        HStack(spacing: 6) {
                            Image(systemName: "hammer.fill")
                            Text("Use in Builder")
                        }
                        .bodyFont(size: 15)
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                        .background(Color.ppAccent)
                        .cornerRadius(Theme.radiusMD)
                    }

                    Button {
                        // Navigate to teach mode with template
                    } label: {
                        HStack(spacing: 6) {
                            Image(systemName: "play.fill")
                            Text("Start Teaching")
                        }
                        .bodyFont(size: 15)
                        .foregroundStyle(Color.ppAccent)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                        .background(Color.ppAccent.opacity(0.1))
                        .cornerRadius(Theme.radiusMD)
                        .overlay(
                            RoundedRectangle(cornerRadius: Theme.radiusMD)
                                .stroke(Color.ppAccent, lineWidth: 1)
                        )
                    }
                }

            case .marketplace:
                Button {
                    // Purchase action
                } label: {
                    HStack(spacing: 6) {
                        Image(systemName: "cart.fill")
                        if let price = template.price {
                            Text("Purchase for \(String(format: "$%.2f", price))")
                        } else {
                            Text("Purchase")
                        }
                    }
                    .bodyFont(size: 15)
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 12)
                    .background(Color.ppAccent)
                    .cornerRadius(Theme.radiusMD)
                }
            }
        }
        .padding(.horizontal, Theme.spacingMD)
        .padding(.vertical, Theme.spacingSM)
        .background(Color.ppBackgroundCard)
    }

    private func detailBadge(_ text: String, color: Color) -> some View {
        Text(text).bodyFont(size: 12).foregroundStyle(color)
            .padding(.horizontal, 10).padding(.vertical, 4)
            .background(color.opacity(0.1)).cornerRadius(Theme.radiusFull)
    }

    private func difficultyColor(_ d: Difficulty) -> Color {
        switch d { case .beginner: return .ppSuccess; case .intermediate: return .ppAccent; case .advanced: return .ppError }
    }
}

#Preview {
    TemplatesScreen()
        .environment(SupabaseService(config: .load()))
        .environment(AuthService(config: .load(), supabase: SupabaseService(config: .load())))
}
