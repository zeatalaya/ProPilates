import SwiftUI

struct BuilderScreen: View {
    @Environment(AuthService.self) private var auth
    @Environment(SupabaseService.self) private var supabase
    @State private var viewModel = ClassBuilderViewModel()
    @State private var isLoadingExercises = true
    @State private var showSaveSheet = false
    @State private var showTeachMode = false
    @State private var selectedTab = 0 // 0=Blocks, 1=Detail, 2=Library

    var body: some View {
        NavigationStack {
            ZStack {
                Color.ppBackground
                    .ignoresSafeArea()

                if isLoadingExercises {
                    ProgressView("Loading exercises...")
                        .foregroundStyle(Color.ppTextSecondary)
                } else {
                    VStack(spacing: 0) {
                        Picker("View", selection: $selectedTab) {
                            Text("Blocks").tag(0)
                            Text("Detail").tag(1)
                            Text("Library").tag(2)
                        }
                        .pickerStyle(.segmented)
                        .padding(.horizontal, Theme.spacingMD)
                        .padding(.vertical, Theme.spacingSM)

                        switch selectedTab {
                        case 0: blocksPanel
                        case 1: detailPanel
                        case 2: exerciseBrowser
                        default: EmptyView()
                        }
                    }
                }
            }
            .navigationTitle("Class Builder")
            #if os(iOS)
            .toolbarTitleDisplayMode(.inline)
            #endif
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Menu {
                        if !viewModel.blocks.isEmpty {
                            Button {
                                showTeachMode = true
                            } label: {
                                Label("Teach", systemImage: "play.circle")
                            }
                        }

                        if auth.tier == .premium, !viewModel.blocks.isEmpty {
                            Button {
                                showSaveSheet = true
                            } label: {
                                Label("Save Class", systemImage: "square.and.arrow.down")
                            }
                        }

                        Button(role: .destructive) {
                            viewModel.reset()
                        } label: {
                            Label("Reset", systemImage: "trash")
                        }
                    } label: {
                        Image(systemName: "ellipsis.circle")
                            .foregroundStyle(Color.ppAccent)
                    }
                }
            }
            #if os(iOS)
            .fullScreenCover(isPresented: $showTeachMode) {
                TeachScreen(blocks: viewModel.blocks, classTitle: viewModel.title)
            }
            #else
            .sheet(isPresented: $showTeachMode) {
                TeachScreen(blocks: viewModel.blocks, classTitle: viewModel.title)
            }
            #endif
            .sheet(isPresented: $showSaveSheet) {
                SaveClassSheet(viewModel: viewModel)
            }
            .task {
                await loadExercises()
            }
        }
    }

    // MARK: - Blocks Panel

    private var blocksPanel: some View {
        ScrollView {
            VStack(spacing: Theme.spacingMD) {
                classMetadataCard

                ForEach(viewModel.blocks) { block in
                    blockCard(block)
                }

                Button {
                    viewModel.addBlock()
                } label: {
                    Label("Add Block", systemImage: "plus.circle")
                        .bodyFont(size: 14)
                        .foregroundStyle(Color.ppAccent)
                        .frame(maxWidth: .infinity)
                        .frame(height: 44)
                        .background(Color.ppBackgroundCard)
                        .cornerRadius(Theme.radiusMD)
                        .overlay(
                            RoundedRectangle(cornerRadius: Theme.radiusMD)
                                .strokeBorder(style: StrokeStyle(lineWidth: 1, dash: [6]))
                                .foregroundStyle(Color.ppBorder)
                        )
                }

                HStack(spacing: Theme.spacingLG) {
                    statBadge(label: "Exercises", value: "\(viewModel.totalExerciseCount)")
                    statBadge(label: "Duration", value: formatDuration(viewModel.totalDuration))
                    statBadge(label: "Blocks", value: "\(viewModel.blocks.count)")
                }
            }
            .padding(Theme.spacingMD)
        }
    }

    private var classMetadataCard: some View {
        VStack(alignment: .leading, spacing: Theme.spacingSM) {
            TextField("Class Title", text: $viewModel.title)
                .headingFont(size: 22)
                .foregroundStyle(Color.ppTextPrimary)

            HStack(spacing: Theme.spacingSM) {
                methodPicker
                difficultyPicker
            }
        }
        .cardStyle()
    }

    private var methodPicker: some View {
        Menu {
            ForEach(PilatesMethod.allCases, id: \.self) { method in
                Button(methodDisplayName(method)) {
                    viewModel.method = method
                }
            }
        } label: {
            HStack(spacing: 4) {
                Text(methodDisplayName(viewModel.method))
                    .bodyFont(size: 12)
                    .foregroundStyle(Color.ppAccent)
                Image(systemName: "chevron.down")
                    .font(.system(size: 10))
                    .foregroundStyle(Color.ppAccent)
            }
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .background(Color.ppAccent.opacity(0.1))
            .cornerRadius(Theme.radiusFull)
        }
    }

    private var difficultyPicker: some View {
        Menu {
            ForEach(Difficulty.allCases, id: \.self) { diff in
                Button(diff.rawValue.capitalized) {
                    viewModel.difficulty = diff
                }
            }
        } label: {
            HStack(spacing: 4) {
                Text(viewModel.difficulty.rawValue.capitalized)
                    .bodyFont(size: 12)
                    .foregroundStyle(Color.ppTextSecondary)
                Image(systemName: "chevron.down")
                    .font(.system(size: 10))
                    .foregroundStyle(Color.ppTextSecondary)
            }
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .background(Color.ppBackgroundElevated)
            .cornerRadius(Theme.radiusFull)
        }
    }

    // MARK: - Block Card

    private func blockCard(_ block: BuilderBlock) -> some View {
        VStack(alignment: .leading, spacing: Theme.spacingSM) {
            HStack {
                Text(block.name)
                    .subheadingFont(size: 16)
                    .foregroundStyle(Color.ppTextPrimary)
                Spacer()
                Button {
                    viewModel.removeBlock(id: block.id)
                } label: {
                    Image(systemName: "trash")
                        .font(.system(size: 14))
                        .foregroundStyle(Color.ppError)
                }
            }

            ForEach(block.exercises) { exercise in
                Button {
                    viewModel.selectedBlockId = block.id
                    viewModel.selectedExerciseId = exercise.id
                    selectedTab = 1
                } label: {
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text(exercise.exercise?.name ?? "Unknown")
                                .bodyFont(size: 14)
                                .foregroundStyle(Color.ppTextPrimary)
                            Text(formatDuration(exercise.duration))
                                .bodyFont(size: 11)
                                .foregroundStyle(Color.ppTextMuted)
                        }
                        Spacer()
                        Image(systemName: "chevron.right")
                            .font(.system(size: 12))
                            .foregroundStyle(Color.ppTextMuted)
                    }
                    .padding(.vertical, 4)
                }
            }

            Button {
                viewModel.selectedBlockId = block.id
                selectedTab = 2
            } label: {
                Label("Add Exercise", systemImage: "plus")
                    .bodyFont(size: 13)
                    .foregroundStyle(Color.ppAccent)
            }
            .padding(.top, 4)
        }
        .cardStyle()
    }

    // MARK: - Detail Panel

    private var detailPanel: some View {
        ScrollView {
            if let blockId = viewModel.selectedBlockId,
               let exerciseId = viewModel.selectedExerciseId,
               let exercise = viewModel.selectedExercise,
               let info = exercise.exercise {
                VStack(alignment: .leading, spacing: Theme.spacingMD) {
                    Text(info.name)
                        .headingFont(size: 24)
                        .foregroundStyle(Color.ppTextPrimary)

                    HStack(spacing: 6) {
                        badge(methodDisplayName(info.method), color: .ppAccent)
                        badge(info.category.rawValue.capitalized, color: .ppTextSecondary)
                        badge(info.difficulty.rawValue.capitalized, color: difficultyColor(info.difficulty))
                    }

                    if !info.description.isEmpty {
                        Text(info.description)
                            .bodyFont(size: 14)
                            .foregroundStyle(Color.ppTextSecondary)
                    }

                    // Duration
                    VStack(alignment: .leading, spacing: Theme.spacingSM) {
                        Text("Duration")
                            .bodyFont(size: 13)
                            .foregroundStyle(Color.ppTextMuted)

                        // Preset durations
                        HStack(spacing: 6) {
                            ForEach([15, 30, 45, 60, 90, 120], id: \.self) { seconds in
                                Button {
                                    viewModel.updateExercise(blockId: blockId, exerciseId: exerciseId, duration: seconds)
                                } label: {
                                    Text(formatDuration(seconds))
                                        .bodyFont(size: 11)
                                        .foregroundStyle(exercise.duration == seconds ? .white : Color.ppTextSecondary)
                                        .padding(.horizontal, 10)
                                        .padding(.vertical, 5)
                                        .background(exercise.duration == seconds ? Color.ppAccent : Color.ppBackgroundCard)
                                        .cornerRadius(Theme.radiusFull)
                                        .overlay(RoundedRectangle(cornerRadius: Theme.radiusFull).stroke(exercise.duration == seconds ? Color.ppAccent : Color.ppBorder, lineWidth: 1))
                                }
                            }
                        }

                        // Fine-tune controls
                        HStack(spacing: 12) {
                            Button {
                                let d = max(5, exercise.duration - 5)
                                viewModel.updateExercise(blockId: blockId, exerciseId: exerciseId, duration: d)
                            } label: {
                                Image(systemName: "minus.circle.fill")
                                    .font(.system(size: 24))
                                    .foregroundStyle(Color.ppAccent)
                            }
                            Text(formatDuration(exercise.duration))
                                .subheadingFont(size: 20)
                                .foregroundStyle(Color.ppTextPrimary)
                                .frame(width: 60, alignment: .center)
                            Button {
                                viewModel.updateExercise(blockId: blockId, exerciseId: exerciseId, duration: exercise.duration + 5)
                            } label: {
                                Image(systemName: "plus.circle.fill")
                                    .font(.system(size: 24))
                                    .foregroundStyle(Color.ppAccent)
                            }
                        }
                        .frame(maxWidth: .infinity)
                    }
                    .cardStyle()

                    // Side
                    sidePicker(blockId: blockId, exerciseId: exerciseId, current: exercise.side ?? "both")

                    // Custom Cues (editable)
                    VStack(alignment: .leading, spacing: Theme.spacingSM) {
                        HStack {
                            Text("Your Cues")
                                .bodyFont(size: 13)
                                .foregroundStyle(Color.ppTextMuted)
                            Spacer()
                            Text("Personalise your instructions")
                                .bodyFont(size: 10)
                                .foregroundStyle(Color.ppTextMuted)
                        }
                        TextEditor(text: Binding(
                            get: { exercise.notes },
                            set: { viewModel.updateExercise(blockId: blockId, exerciseId: exerciseId, notes: $0) }
                        ))
                        .bodyFont(size: 14)
                        .frame(minHeight: 80)
                        .padding(8)
                        .background(Color.ppBackgroundCard)
                        .cornerRadius(Theme.radiusSM)
                        .overlay(
                            RoundedRectangle(cornerRadius: Theme.radiusSM)
                                .stroke(Color.ppBorder, lineWidth: 1)
                        )
                    }
                    .cardStyle()

                    // Exercise Cues (reference from BASI)
                    if !info.cues.isEmpty {
                        VStack(alignment: .leading, spacing: Theme.spacingSM) {
                            Text("BASI Cues")
                                .bodyFont(size: 13)
                                .foregroundStyle(Color.ppTextMuted)
                            ForEach(Array(info.cues.enumerated()), id: \.offset) { _, cue in
                                HStack(alignment: .top, spacing: 8) {
                                    Image(systemName: "circle.fill")
                                        .font(.system(size: 4))
                                        .foregroundStyle(Color.ppAccent)
                                        .padding(.top, 6)
                                    Text(cue)
                                        .bodyFont(size: 13)
                                        .foregroundStyle(Color.ppTextSecondary)
                                }
                            }
                        }
                        .cardStyle()
                    }

                    Button {
                        viewModel.removeExerciseFromBlock(blockId: blockId, exerciseId: exerciseId)
                        selectedTab = 0
                    } label: {
                        Text("Remove from Block")
                            .bodyFont(size: 14)
                            .foregroundStyle(Color.ppError)
                            .frame(maxWidth: .infinity)
                            .frame(height: 44)
                            .background(Color.ppError.opacity(0.1))
                            .cornerRadius(Theme.radiusMD)
                    }
                }
                .padding(Theme.spacingMD)
            } else {
                VStack(spacing: Theme.spacingMD) {
                    Image(systemName: "hand.tap")
                        .font(.system(size: 32))
                        .foregroundStyle(Color.ppTextMuted)
                    Text("Select an exercise to view details")
                        .bodyFont(size: 14)
                        .foregroundStyle(Color.ppTextMuted)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .padding(.top, 100)
            }
        }
    }

    private func sidePicker(blockId: UUID, exerciseId: UUID, current: String) -> some View {
        VStack(alignment: .leading, spacing: Theme.spacingSM) {
            Text("Side")
                .bodyFont(size: 13)
                .foregroundStyle(Color.ppTextMuted)
            HStack(spacing: Theme.spacingSM) {
                ForEach(["both", "left", "right"], id: \.self) { side in
                    Button {
                        viewModel.updateExercise(blockId: blockId, exerciseId: exerciseId, side: side)
                    } label: {
                        Text(side.capitalized)
                            .bodyFont(size: 13)
                            .foregroundStyle(current == side ? .white : Color.ppTextSecondary)
                            .padding(.horizontal, 14)
                            .padding(.vertical, 8)
                            .background(current == side ? Color.ppAccent : Color.ppBackgroundCard)
                            .cornerRadius(Theme.radiusFull)
                            .overlay(
                                RoundedRectangle(cornerRadius: Theme.radiusFull)
                                    .stroke(current == side ? Color.ppAccent : Color.ppBorder, lineWidth: 1)
                            )
                    }
                }
            }
        }
        .cardStyle()
    }

    // MARK: - Exercise Browser

    private var exerciseBrowser: some View {
        VStack(spacing: 0) {
            HStack {
                Image(systemName: "magnifyingglass")
                    .foregroundStyle(Color.ppTextMuted)
                TextField("Search exercises...", text: $viewModel.browserSearch)
                    .bodyFont(size: 14)
            }
            .padding(10)
            .background(Color.ppBackgroundCard)
            .cornerRadius(Theme.radiusSM)
            .overlay(
                RoundedRectangle(cornerRadius: Theme.radiusSM)
                    .stroke(Color.ppBorder, lineWidth: 1)
            )
            .padding(.horizontal, Theme.spacingMD)
            .padding(.vertical, Theme.spacingSM)

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 6) {
                    filterPill("All", isActive: viewModel.browserMethod == nil) {
                        viewModel.browserMethod = nil
                    }
                    ForEach(PilatesMethod.allCases, id: \.self) { method in
                        filterPill(methodDisplayName(method), isActive: viewModel.browserMethod == method) {
                            viewModel.browserMethod = method
                        }
                    }
                }
                .padding(.horizontal, Theme.spacingMD)
            }
            .padding(.bottom, Theme.spacingSM)

            List {
                ForEach(viewModel.filteredExercises, id: \.id) { exercise in
                    Button {
                        if let blockId = viewModel.selectedBlockId ?? viewModel.blocks.first?.id {
                            viewModel.addExerciseToBlock(blockId: blockId, exercise: exercise)
                            selectedTab = 0
                        }
                    } label: {
                        HStack {
                            VStack(alignment: .leading, spacing: 2) {
                                Text(exercise.name)
                                    .bodyFont(size: 14)
                                    .foregroundStyle(Color.ppTextPrimary)
                                HStack(spacing: 4) {
                                    Text(methodDisplayName(exercise.method))
                                        .bodyFont(size: 11)
                                        .foregroundStyle(Color.ppAccent)
                                    Text("•").foregroundStyle(Color.ppTextMuted)
                                    Text(exercise.category.rawValue.capitalized)
                                        .bodyFont(size: 11)
                                        .foregroundStyle(Color.ppTextMuted)
                                }
                            }
                            Spacer()
                            Image(systemName: "plus.circle")
                                .foregroundStyle(Color.ppAccent)
                        }
                    }
                    .listRowBackground(Color.ppBackground)
                }
            }
            .listStyle(.plain)
            .scrollContentBackground(.hidden)
        }
    }

    // MARK: - Helpers

    private func loadExercises() async {
        defer { isLoadingExercises = false }
        do {
            viewModel.allExercises = try await supabase.fetchLibraryExercises()
            if let instructor = auth.instructor {
                viewModel.customExercises = try await supabase.fetchCustomExercises(creatorId: instructor.id)
            }
        } catch {
            print("[BuilderScreen] Failed to load exercises: \(error)")
        }
        if viewModel.blocks.isEmpty {
            viewModel.addBlock(name: "Warm-Up")
        }
    }

    private func badge(_ text: String, color: Color) -> some View {
        Text(text)
            .bodyFont(size: 11)
            .foregroundStyle(color)
            .padding(.horizontal, 8)
            .padding(.vertical, 3)
            .background(color.opacity(0.1))
            .cornerRadius(Theme.radiusFull)
    }

    private func statBadge(label: String, value: String) -> some View {
        VStack(spacing: 2) {
            Text(value)
                .subheadingFont(size: 18)
                .foregroundStyle(Color.ppTextPrimary)
            Text(label)
                .bodyFont(size: 11)
                .foregroundStyle(Color.ppTextMuted)
        }
        .frame(maxWidth: .infinity)
    }

    private func filterPill(_ title: String, isActive: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(title)
                .bodyFont(size: 12)
                .foregroundStyle(isActive ? .white : Color.ppTextSecondary)
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(isActive ? Color.ppAccent : Color.ppBackgroundCard)
                .cornerRadius(Theme.radiusFull)
                .overlay(
                    RoundedRectangle(cornerRadius: Theme.radiusFull)
                        .stroke(isActive ? Color.ppAccent : Color.ppBorder, lineWidth: 1)
                )
        }
    }

    private func difficultyColor(_ difficulty: Difficulty) -> Color {
        switch difficulty {
        case .beginner: return .ppSuccess
        case .intermediate: return .ppAccent
        case .advanced: return .ppError
        }
    }

    private func formatDuration(_ seconds: Int) -> String {
        let m = seconds / 60
        let s = seconds % 60
        return s > 0 ? "\(m):\(String(format: "%02d", s))" : "\(m):00"
    }

    private func methodDisplayName(_ method: PilatesMethod) -> String {
        method.displayName
    }
}

// MARK: - Save Class Sheet

struct SaveClassSheet: View {
    @Environment(AuthService.self) private var auth
    @Environment(SupabaseService.self) private var supabase
    @Environment(\.dismiss) private var dismiss
    let viewModel: ClassBuilderViewModel

    @State private var isSaving = false
    @State private var errorMessage: String?

    var body: some View {
        NavigationStack {
            VStack(spacing: Theme.spacingMD) {
                Text("Save Class")
                    .headingFont(size: 24)
                    .foregroundStyle(Color.ppTextPrimary)

                VStack(alignment: .leading, spacing: Theme.spacingSM) {
                    Text("Title: \(viewModel.title.isEmpty ? "Untitled" : viewModel.title)")
                    Text("Method: \(viewModel.method.rawValue)")
                    Text("Blocks: \(viewModel.blocks.count)")
                    Text("Exercises: \(viewModel.totalExerciseCount)")
                }
                .bodyFont(size: 14)
                .foregroundStyle(Color.ppTextSecondary)
                .frame(maxWidth: .infinity, alignment: .leading)
                .cardStyle()

                if let error = errorMessage {
                    Text(error)
                        .bodyFont(size: 13)
                        .foregroundStyle(Color.ppError)
                }

                Spacer()

                Button {
                    Task { await saveClass() }
                } label: {
                    Group {
                        if isSaving { ProgressView().tint(.white) }
                        else { Text("Save") }
                    }
                    .bodyFont(size: 15)
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .frame(height: Theme.buttonHeight)
                    .background(Color.ppAccent)
                    .cornerRadius(Theme.radiusLG)
                }
                .disabled(isSaving)
            }
            .padding(Theme.spacingMD)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
            }
        }
        .presentationDetents([.medium])
    }

    private func saveClass() async {
        guard let instructor = auth.instructor else {
            errorMessage = "No instructor profile found."
            return
        }

        isSaving = true
        errorMessage = nil

        do {
            let classInsert = ClassInsert(
                instructorId: instructor.id,
                title: viewModel.title.isEmpty ? "Untitled Class" : viewModel.title,
                description: viewModel.description,
                method: viewModel.method,
                classType: viewModel.classType,
                difficulty: viewModel.difficulty,
                durationMinutes: viewModel.durationMinutes
            )

            let blocks = viewModel.blocks.map { block in
                (
                    name: block.name,
                    exercises: block.exercises.map { ex in
                        (exerciseId: ex.exerciseId, duration: ex.duration, reps: ex.reps, side: ex.side, notes: ex.notes)
                    }
                )
            }

            _ = try await supabase.saveFullClass(classData: classInsert, blocks: blocks)
            dismiss()
        } catch {
            errorMessage = "Failed to save: \(error.localizedDescription)"
        }

        isSaving = false
    }
}

#Preview {
    BuilderScreen()
        .environment(AuthService(config: .load(), supabase: SupabaseService(config: .load())))
        .environment(SupabaseService(config: .load()))
}
