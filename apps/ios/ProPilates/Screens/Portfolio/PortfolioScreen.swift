import SwiftUI

struct PortfolioScreen: View {
    @Environment(AuthService.self) private var auth
    @Environment(SupabaseService.self) private var supabase

    @State private var selectedTab = 0 // 0=Classes, 1=Exercises
    @State private var classes: [PilatesClass] = []
    @State private var customExercises: [Exercise] = []
    @State private var isLoading = true

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
            .background(Color.ppBackground)
            .navigationTitle("Portfolio")
            #if os(iOS)
            .toolbarTitleDisplayMode(.large)
            #endif
            .task { await loadData() }
            .refreshable { await loadData() }
        }
    }

    // MARK: - Classes Tab

    private var classesTab: some View {
        Group {
            if classes.isEmpty {
                emptyState(icon: "book.closed", title: "No Classes Yet", message: "Build and save classes to see them here")
            } else {
                List {
                    ForEach(classes, id: \.id) { pc in
                        VStack(alignment: .leading, spacing: 4) {
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
                                Text("•").foregroundStyle(Color.ppTextMuted)
                                Text(pc.difficulty.rawValue.capitalized)
                                    .bodyFont(size: 11)
                                    .foregroundStyle(Color.ppTextMuted)
                                Text("•").foregroundStyle(Color.ppTextMuted)
                                Text("\(pc.durationMinutes) min")
                                    .bodyFont(size: 11)
                                    .foregroundStyle(Color.ppTextMuted)
                            }
                            if let price = pc.price {
                                Text("$\(String(format: "%.2f", price)) USDC")
                                    .bodyFont(size: 12)
                                    .foregroundStyle(Color.ppAccent)
                            }
                        }
                        .listRowBackground(Color.ppBackgroundCard)
                        .swipeActions(edge: .trailing) {
                            Button(role: .destructive) {
                                Task { await deleteClass(pc.id) }
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
                                Text("•").foregroundStyle(Color.ppTextMuted)
                                Text(exercise.category.rawValue.capitalized)
                                    .bodyFont(size: 11)
                                    .foregroundStyle(Color.ppTextMuted)
                                Text("•").foregroundStyle(Color.ppTextMuted)
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
        switch m {
        case .mat: return "Mat"; case .reformer: return "Reformer"; case .xReformer: return "X-Reformer"
        case .chair: return "Chair"; case .tower: return "Tower"; case .barrel: return "Barrel"
        case .ring: return "Ring"; case .band: return "Band"; case .foamRoller: return "Foam Roller"
        }
    }
}

#Preview {
    PortfolioScreen()
        .environment(AuthService(config: .load(), supabase: SupabaseService(config: .load())))
        .environment(SupabaseService(config: .load()))
}
