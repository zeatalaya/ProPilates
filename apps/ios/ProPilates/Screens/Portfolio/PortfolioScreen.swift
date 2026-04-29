import SwiftUI

struct PortfolioScreen: View {
    @Environment(AuthService.self) private var auth
    @Environment(SupabaseService.self) private var supabase

    @State private var selectedTab = 0 // 0=Classes, 1=Exercises
    @State private var classes: [PilatesClass] = []
    @State private var purchasedClasses: [PilatesClass] = []
    @State private var customExercises: [Exercise] = []
    @State private var isLoading = true

    // Navigation state for builder / teach full-screen covers
    @State private var classForBuilder: PilatesClass?
    @State private var classForTeach: PilatesClass?
    @State private var isLoadingClassDetails = false

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                Picker("View", selection: $selectedTab) {
                    Text("Classes").tag(0)
                    Text("Exercises").tag(1)
                }
                .pickerStyle(.segmented)
                .padding(.horizontal, Theme.spacingMD)
                .padding(.vertical, Theme.spacingSM)

                if isLoading {
                    Spacer()
                    ProgressView("Loading portfolio...")
                        .foregroundStyle(Color.ppTextSecondary)
                    Spacer()
                } else {
                    switch selectedTab {
                    case 0: classesTab
                    case 1: exercisesTab
                    default: EmptyView()
                    }
                }
            }
            .overlay {
                if isLoadingClassDetails {
                    ZStack {
                        Color.black.opacity(0.3)
                            .ignoresSafeArea()
                        ProgressView("Loading class...")
                            .padding(Theme.spacingLG)
                            .background(Color.ppBackgroundCard)
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                    }
                }
            }
            .background(Color.ppBackground)
            .navigationTitle("Portfolio")
            #if os(iOS)
            .toolbarTitleDisplayMode(.large)
            #endif
            .task { await loadData() }
            .refreshable { await loadData() }
            .fullScreenCover(item: $classForBuilder) { pc in
                BuilderScreenWithClass(pilatesClass: pc)
                    .environment(auth)
                    .environment(supabase)
            }
            .fullScreenCover(item: $classForTeach) { pc in
                TeachScreenFromClass(pilatesClass: pc)
            }
        }
    }

    // MARK: - Classes Tab

    private var classesTab: some View {
        Group {
            if classes.isEmpty && purchasedClasses.isEmpty {
                emptyState(icon: "book.closed", title: "No Classes Yet", message: "Build and save classes to see them here")
            } else {
                List {
                    if !purchasedClasses.isEmpty {
                        Section {
                            ForEach(purchasedClasses, id: \.id) { pc in
                                classRow(pc, isPurchased: true)
                                    .listRowBackground(Color.ppBackgroundCard)
                            }
                        } header: {
                            Text("Purchased Classes")
                                .subheadingFont(size: 14)
                                .foregroundStyle(Color.ppAccent)
                                .textCase(nil)
                        }
                    }

                    Section {
                        ForEach(classes, id: \.id) { pc in
                            classRow(pc, isPurchased: false)
                                .listRowBackground(Color.ppBackgroundCard)
                                .swipeActions(edge: .trailing) {
                                    Button(role: .destructive) {
                                        Task { await deleteClass(pc.id) }
                                    } label: {
                                        Label("Delete", systemImage: "trash")
                                    }
                                }
                        }
                    } header: {
                        if !purchasedClasses.isEmpty {
                            Text("My Classes")
                                .subheadingFont(size: 14)
                                .foregroundStyle(Color.ppAccent)
                                .textCase(nil)
                        }
                    }
                }
                .listStyle(.plain)
                .scrollContentBackground(.hidden)
            }
        }
    }

    // MARK: - Class Row

    private func classRow(_ pc: PilatesClass, isPurchased: Bool) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text(pc.title)
                    .subheadingFont(size: 16)
                    .foregroundStyle(Color.ppTextPrimary)
                Spacer()
                if pc.isPublic {
                    Image(systemName: "globe")
                        .font(.system(size: 12))
                        .foregroundStyle(Color.ppSuccess)
                }
            }
            HStack(spacing: 6) {
                Text(methodDisplayName(pc.method))
                    .bodyFont(size: 11)
                    .foregroundStyle(Color.ppAccent)
                Text("\u{2022}").foregroundStyle(Color.ppTextMuted)
                Text(pc.difficulty.rawValue.capitalized)
                    .bodyFont(size: 11)
                    .foregroundStyle(Color.ppTextMuted)
                Text("\u{2022}").foregroundStyle(Color.ppTextMuted)
                Text("\(pc.durationMinutes) min")
                    .bodyFont(size: 11)
                    .foregroundStyle(Color.ppTextMuted)
            }
            if let price = pc.price {
                Text("$\(String(format: "%.2f", price)) USDC")
                    .bodyFont(size: 12)
                    .foregroundStyle(Color.ppAccent)
            }

            // Action buttons
            HStack(spacing: 8) {
                Button {
                    Task { await openInBuilder(pc) }
                } label: {
                    Label("Open in Builder", systemImage: "square.stack.3d.up.fill")
                        .bodyFont(size: 11)
                        .foregroundStyle(Color.ppAccent)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 5)
                        .background(Color.ppAccent.opacity(0.12))
                        .clipShape(Capsule())
                }
                .buttonStyle(.plain)

                Button {
                    Task { await startTeaching(pc) }
                } label: {
                    Label("Start Teaching", systemImage: "play.circle.fill")
                        .bodyFont(size: 11)
                        .foregroundStyle(Color.ppAccent)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 5)
                        .background(Color.ppAccent.opacity(0.12))
                        .clipShape(Capsule())
                }
                .buttonStyle(.plain)

                Spacer()
            }
            .padding(.top, 2)
        }
    }

    // MARK: - Exercises Tab

    private var exercisesTab: some View {
        Group {
            if customExercises.isEmpty {
                emptyState(icon: "figure.pilates", title: "No Custom Exercises", message: "Create custom exercises in the Class Builder")
            } else {
                List {
                    ForEach(customExercises, id: \.id) { exercise in
                        VStack(alignment: .leading, spacing: 4) {
                            HStack {
                                Text(exercise.name)
                                    .bodyFont(size: 15)
                                    .foregroundStyle(Color.ppTextPrimary)
                                Spacer()
                                if exercise.isPublic {
                                    Image(systemName: "globe")
                                        .font(.system(size: 12))
                                        .foregroundStyle(Color.ppSuccess)
                                }
                            }
                            HStack(spacing: 6) {
                                Text(methodDisplayName(exercise.method))
                                    .bodyFont(size: 11)
                                    .foregroundStyle(Color.ppAccent)
                                Text("\u{2022}").foregroundStyle(Color.ppTextMuted)
                                Text(exercise.category.rawValue.capitalized)
                                    .bodyFont(size: 11)
                                    .foregroundStyle(Color.ppTextMuted)
                                Text("\u{2022}").foregroundStyle(Color.ppTextMuted)
                                Text(exercise.difficulty.rawValue.capitalized)
                                    .bodyFont(size: 11)
                                    .foregroundStyle(Color.ppTextMuted)
                            }
                        }
                        .listRowBackground(Color.ppBackgroundCard)
                        .swipeActions(edge: .trailing) {
                            Button(role: .destructive) {
                                Task { await deleteExercise(exercise.id) }
                            } label: {
                                Label("Delete", systemImage: "trash")
                            }
                        }
                    }
                }
                .listStyle(.plain)
                .scrollContentBackground(.hidden)
            }
        }
    }

    // MARK: - Empty State

    private func emptyState(icon: String, title: String, message: String) -> some View {
        VStack(spacing: Theme.spacingMD) {
            Spacer()
            Image(systemName: icon)
                .font(.system(size: 40))
                .foregroundStyle(Color.ppTextMuted)
            Text(title)
                .headingFont(size: 22)
                .foregroundStyle(Color.ppTextPrimary)
            Text(message)
                .bodyFont(size: 14)
                .foregroundStyle(Color.ppTextSecondary)
                .multilineTextAlignment(.center)
            Spacer()
        }
        .padding(Theme.spacingLG)
    }

    // MARK: - Actions

    private func openInBuilder(_ pc: PilatesClass) async {
        isLoadingClassDetails = true
        defer { isLoadingClassDetails = false }

        do {
            if let detailed = try await supabase.fetchClassWithDetails(classId: pc.id) {
                classForBuilder = detailed
            }
        } catch {
            print("[PortfolioScreen] Load class for builder error: \(error)")
        }
    }

    private func startTeaching(_ pc: PilatesClass) async {
        isLoadingClassDetails = true
        defer { isLoadingClassDetails = false }

        do {
            if let detailed = try await supabase.fetchClassWithDetails(classId: pc.id) {
                classForTeach = detailed
            }
        } catch {
            print("[PortfolioScreen] Load class for teach error: \(error)")
        }
    }

    // MARK: - Data

    private func loadData() async {
        isLoading = true
        defer { isLoading = false }

        guard let instructor = auth.instructor else { return }

        do {
            async let fetchClasses = supabase.fetchInstructorClasses(instructorId: instructor.id)
            async let fetchExercises = supabase.fetchCustomExercises(creatorId: instructor.id)

            classes = try await fetchClasses
            customExercises = try await fetchExercises

            // Load purchased classes from portfolio_access
            if let address = instructor.xionAddress {
                do {
                    let access = try await supabase.fetchPortfolioAccess(buyerAddress: address)
                    var purchased: [PilatesClass] = []
                    for entry in access {
                        // Skip classes the instructor owns (already in "My Classes")
                        if entry.classId == instructor.id { continue }
                        do {
                            if let pc = try await supabase.fetchClassWithDetails(classId: entry.classId) {
                                // Exclude own classes that might appear in portfolio_access
                                if pc.instructorId != instructor.id {
                                    purchased.append(pc)
                                }
                            }
                        } catch {
                            print("[PortfolioScreen] Skip purchased class \(entry.classId): \(error)")
                        }
                    }
                    purchasedClasses = purchased
                } catch {
                    print("[PortfolioScreen] Purchased classes error: \(error)")
                }
            }
        } catch {
            print("[PortfolioScreen] Error: \(error)")
        }
    }

    private func deleteClass(_ id: UUID) async {
        do {
            try await supabase.deleteClass(classId: id)
            classes.removeAll { $0.id == id }
        } catch {
            print("[PortfolioScreen] Delete class error: \(error)")
        }
    }

    private func deleteExercise(_ id: UUID) async {
        do {
            try await supabase.deleteExercise(exerciseId: id)
            customExercises.removeAll { $0.id == id }
        } catch {
            print("[PortfolioScreen] Delete exercise error: \(error)")
        }
    }

    private func methodDisplayName(_ m: PilatesMethod) -> String {
        m.displayName
    }
}

// MARK: - Builder wrapper that loads a class into the view model

private struct BuilderScreenWithClass: View {
    @Environment(AuthService.self) private var auth
    @Environment(SupabaseService.self) private var supabase
    @Environment(\.dismiss) private var dismiss

    let pilatesClass: PilatesClass
    @State private var viewModel = ClassBuilderViewModel()
    @State private var didLoad = false

    var body: some View {
        NavigationStack {
            BuilderScreen()
                .toolbar {
                    ToolbarItem(placement: .cancellationAction) {
                        Button("Close") { dismiss() }
                            .foregroundStyle(Color.ppTextMuted)
                    }
                }
        }
        .task {
            guard !didLoad else { return }
            didLoad = true
            viewModel.loadClass(pilatesClass)
        }
    }
}

// MARK: - Teach wrapper that loads a class's blocks

private struct TeachScreenFromClass: View {
    @Environment(\.dismiss) private var dismiss

    let pilatesClass: PilatesClass

    var body: some View {
        NavigationStack {
            TeachScreen(blocks: builderBlocks, classTitle: pilatesClass.title)
                .toolbar {
                    ToolbarItem(placement: .cancellationAction) {
                        Button("Close") { dismiss() }
                            .foregroundStyle(Color.ppTextMuted)
                    }
                }
        }
    }

    private var builderBlocks: [BuilderBlock] {
        guard let blocks = pilatesClass.blocks else { return [] }
        return blocks.map { block in
            BuilderBlock(
                id: block.id,
                name: block.name,
                orderIndex: block.orderIndex,
                exercises: block.exercises.map { be in
                    BuilderExercise(
                        id: be.id,
                        exerciseId: be.exerciseId,
                        exercise: be.exercise,
                        orderIndex: be.orderIndex,
                        duration: be.duration,
                        reps: be.reps,
                        side: be.side,
                        notes: be.notes
                    )
                }
            )
        }
    }
}

// MARK: - Make PilatesClass work with fullScreenCover(item:)

extension PilatesClass: @retroactive Hashable {
    static func == (lhs: PilatesClass, rhs: PilatesClass) -> Bool {
        lhs.id == rhs.id
    }

    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }
}

#Preview {
    PortfolioScreen()
        .environment(AuthService(config: .load(), supabase: SupabaseService(config: .load())))
        .environment(SupabaseService(config: .load()))
}
