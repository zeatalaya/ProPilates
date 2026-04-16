import SwiftUI

struct TeachScreen: View {
    @Environment(\.dismiss) private var dismiss
    @State private var vm = TeachingModeViewModel()

    var blocks: [BuilderBlock] = []
    var classTitle: String = ""

    var body: some View {
        NavigationStack {
            ZStack {
                Color.ppBackground
                    .ignoresSafeArea()

                if vm.blocks.isEmpty {
                    emptyState
                } else if vm.isComplete {
                    completeState
                } else {
                    mainContent
                }
            }
            .navigationTitle(classTitle.isEmpty ? "Teach" : classTitle)
            #if os(iOS)
            .toolbarTitleDisplayMode(.inline)
            #endif
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Done") {
                        vm.reset()
                        dismiss()
                    }
                    .foregroundStyle(Color.ppTextMuted)
                }

                ToolbarItem(placement: .principal) {
                    if !vm.blocks.isEmpty, !vm.isComplete {
                        Text("\(vm.currentExerciseNumber) / \(vm.totalExercises)")
                            .bodyFont(size: 13)
                            .foregroundStyle(Color.ppTextMuted)
                    }
                }
            }
        }
        .onAppear {
            vm.loadBlocks(blocks)
        }
    }

    // MARK: - Main Content

    private var mainContent: some View {
        VStack(spacing: 0) {
            ScrollView {
                VStack(spacing: Theme.spacingLG) {
                    timerRing
                    exerciseInfo
                    blockOverview
                    upNextCard
                }
                .padding(Theme.spacingMD)
            }

            playbackControls
        }
    }

    // MARK: - Timer Ring

    private var timerRing: some View {
        ZStack {
            Circle()
                .stroke(Color.ppBackgroundElevated, lineWidth: 8)
                .frame(width: 200, height: 200)

            Circle()
                .trim(from: 0, to: vm.progress)
                .stroke(Color.ppAccent, style: StrokeStyle(lineWidth: 8, lineCap: .round))
                .frame(width: 200, height: 200)
                .rotationEffect(.degrees(-90))
                .animation(.linear(duration: 1), value: vm.progress)

            VStack(spacing: 4) {
                Text(formatTime(vm.timeRemaining))
                    .headingFont(size: 40)
                    .foregroundStyle(Color.ppTextPrimary)
                    .monospacedDigit()

                Text("remaining")
                    .bodyFont(size: 12)
                    .foregroundStyle(Color.ppTextMuted)
            }
        }
        .padding(.top, Theme.spacingMD)
    }

    // MARK: - Exercise Info

    private var exerciseInfo: some View {
        VStack(spacing: Theme.spacingSM) {
            if let exercise = vm.currentExercise, let info = exercise.exercise {
                Text(info.name)
                    .headingFont(size: 28)
                    .foregroundStyle(Color.ppTextPrimary)
                    .multilineTextAlignment(.center)

                HStack(spacing: 6) {
                    badge(methodDisplayName(info.method), color: .ppAccent)
                    badge(info.category.rawValue.capitalized, color: .ppTextSecondary)
                    if let side = exercise.side, side != "both" {
                        badge(side.capitalized, color: .ppAccent)
                    }
                }

                // Cues
                if !info.cues.isEmpty {
                    VStack(alignment: .leading, spacing: 6) {
                        ForEach(info.cues, id: \.self) { cue in
                            HStack(alignment: .top, spacing: 8) {
                                Image(systemName: "circle.fill")
                                    .font(.system(size: 4))
                                    .foregroundStyle(Color.ppAccent)
                                    .padding(.top, 6)
                                Text(cue)
                                    .bodyFont(size: 14)
                                    .foregroundStyle(Color.ppTextSecondary)
                            }
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .cardStyle()
                }

                // Notes
                if !exercise.notes.isEmpty {
                    HStack(spacing: 8) {
                        Image(systemName: "note.text")
                            .foregroundStyle(Color.ppAccent)
                        Text(exercise.notes)
                            .bodyFont(size: 13)
                            .foregroundStyle(Color.ppTextSecondary)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(Theme.spacingSM)
                    .background(Color.ppAccent.opacity(0.08))
                    .cornerRadius(Theme.radiusSM)
                }
            }
        }
    }

    // MARK: - Block Overview

    private var blockOverview: some View {
        VStack(alignment: .leading, spacing: Theme.spacingSM) {
            if let block = vm.currentBlock {
                Text(block.name)
                    .subheadingFont(size: 16)
                    .foregroundStyle(Color.ppTextPrimary)

                ForEach(Array(block.exercises.enumerated()), id: \.element.id) { index, exercise in
                    HStack {
                        Circle()
                            .fill(exerciseStateColor(index: index))
                            .frame(width: 8, height: 8)

                        Text(exercise.exercise?.name ?? "Exercise")
                            .bodyFont(size: 13)
                            .foregroundStyle(
                                index == vm.currentExerciseIndex
                                    ? Color.ppTextPrimary
                                    : index < vm.currentExerciseIndex
                                        ? Color.ppTextMuted
                                        : Color.ppTextSecondary
                            )

                        Spacer()

                        Text(formatTime(exercise.duration))
                            .bodyFont(size: 12)
                            .foregroundStyle(Color.ppTextMuted)
                    }
                    .contentShape(Rectangle())
                    .onTapGesture {
                        vm.goToExercise(blockIndex: vm.currentBlockIndex, exerciseIndex: index)
                    }
                }
            }
        }
        .cardStyle()
    }

    private func exerciseStateColor(index: Int) -> Color {
        if index == vm.currentExerciseIndex { return .ppAccent }
        if index < vm.currentExerciseIndex { return .ppSuccess }
        return .ppBackgroundElevated
    }

    // MARK: - Up Next

    private var upNextCard: some View {
        Group {
            if let next = vm.nextExercise, let info = next.exercise {
                VStack(alignment: .leading, spacing: Theme.spacingSM) {
                    Text("Up Next")
                        .bodyFont(size: 12)
                        .foregroundStyle(Color.ppTextMuted)

                    HStack {
                        Text(info.name)
                            .subheadingFont(size: 16)
                            .foregroundStyle(Color.ppTextPrimary)
                        Spacer()
                        Text(formatTime(next.duration))
                            .bodyFont(size: 13)
                            .foregroundStyle(Color.ppTextMuted)
                    }
                }
                .cardStyle()
            }
        }
    }

    // MARK: - Playback Controls

    private var playbackControls: some View {
        HStack(spacing: Theme.spacingXL) {
            Button {
                vm.skipPrev()
            } label: {
                Image(systemName: "backward.fill")
                    .font(.system(size: 24))
                    .foregroundStyle(Color.ppTextSecondary)
            }

            Button {
                vm.togglePlayPause()
            } label: {
                Image(systemName: vm.isPlaying ? "pause.circle.fill" : "play.circle.fill")
                    .font(.system(size: 56))
                    .foregroundStyle(Color.ppAccent)
            }

            Button {
                vm.skipNext()
            } label: {
                Image(systemName: "forward.fill")
                    .font(.system(size: 24))
                    .foregroundStyle(Color.ppTextSecondary)
            }
        }
        .padding(.vertical, Theme.spacingLG)
        .frame(maxWidth: .infinity)
        .background(Color.ppBackgroundCard)
    }

    // MARK: - Empty & Complete States

    private var emptyState: some View {
        VStack(spacing: Theme.spacingMD) {
            Image(systemName: "square.stack.3d.up.slash")
                .font(.system(size: 40))
                .foregroundStyle(Color.ppTextMuted)
            Text("No class loaded")
                .headingFont(size: 22)
                .foregroundStyle(Color.ppTextPrimary)
            Text("Build a class first, then come back to teach it")
                .bodyFont(size: 14)
                .foregroundStyle(Color.ppTextSecondary)
                .multilineTextAlignment(.center)
        }
        .padding(Theme.spacingXL)
    }

    private var completeState: some View {
        VStack(spacing: Theme.spacingMD) {
            Image(systemName: "checkmark.circle.fill")
                .font(.system(size: 56))
                .foregroundStyle(Color.ppSuccess)

            Text("Class Complete!")
                .headingFont(size: 28)
                .foregroundStyle(Color.ppTextPrimary)

            Text("Total time: \(formatTime(vm.totalElapsed))")
                .bodyFont(size: 16)
                .foregroundStyle(Color.ppTextSecondary)

            Button {
                vm.reset()
                dismiss()
            } label: {
                Text("Done")
                    .bodyFont(size: 15)
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .frame(height: Theme.buttonHeight)
                    .background(Color.ppAccent)
                    .cornerRadius(Theme.radiusLG)
            }
            .padding(.horizontal, Theme.spacingXL)
            .padding(.top, Theme.spacingMD)
        }
    }

    // MARK: - Helpers

    private func badge(_ text: String, color: Color) -> some View {
        Text(text)
            .bodyFont(size: 11)
            .foregroundStyle(color)
            .padding(.horizontal, 8)
            .padding(.vertical, 3)
            .background(color.opacity(0.1))
            .cornerRadius(Theme.radiusFull)
    }

    private func formatTime(_ seconds: Int) -> String {
        let m = seconds / 60
        let s = seconds % 60
        return "\(m):\(String(format: "%02d", s))"
    }

    private func methodDisplayName(_ method: PilatesMethod) -> String {
        switch method {
        case .mat: return "Mat"
        case .reformer: return "Reformer"
        case .xReformer: return "X-Reformer"
        case .chair: return "Chair"
        case .tower: return "Tower"
        case .barrel: return "Barrel"
        case .ring: return "Ring"
        case .band: return "Band"
        case .foamRoller: return "Foam Roller"
        }
    }
}

#Preview {
    TeachScreen()
}
