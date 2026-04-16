import Foundation
import Observation

@Observable
final class TeachingModeViewModel {

    // MARK: - State

    var isPlaying = false
    var elapsed = 0
    var totalElapsed = 0
    var currentBlockIndex = 0
    var currentExerciseIndex = 0
    var blocks: [BuilderBlock] = []

    private var timer: Timer?

    // MARK: - Computed

    var currentBlock: BuilderBlock? {
        guard currentBlockIndex < blocks.count else { return nil }
        return blocks[currentBlockIndex]
    }

    var currentExercise: BuilderExercise? {
        guard let block = currentBlock,
              currentExerciseIndex < block.exercises.count else { return nil }
        return block.exercises[currentExerciseIndex]
    }

    var nextExercise: BuilderExercise? {
        guard let block = currentBlock else { return nil }
        let nextIdx = currentExerciseIndex + 1
        if nextIdx < block.exercises.count {
            return block.exercises[nextIdx]
        }
        let nextBlockIdx = currentBlockIndex + 1
        if nextBlockIdx < blocks.count, let first = blocks[nextBlockIdx].exercises.first {
            return first
        }
        return nil
    }

    var progress: Double {
        guard let exercise = currentExercise, exercise.duration > 0 else { return 0 }
        return min(Double(elapsed) / Double(exercise.duration), 1.0)
    }

    var totalExercises: Int {
        blocks.flatMap(\.exercises).count
    }

    var currentExerciseNumber: Int {
        var count = 0
        for i in 0..<currentBlockIndex {
            count += blocks[i].exercises.count
        }
        count += currentExerciseIndex + 1
        return count
    }

    var isComplete: Bool {
        guard let exercise = currentExercise else { return blocks.isEmpty == false }
        return currentBlockIndex == blocks.count - 1
            && currentExerciseIndex == (currentBlock?.exercises.count ?? 1) - 1
            && elapsed >= exercise.duration
    }

    var timeRemaining: Int {
        guard let exercise = currentExercise else { return 0 }
        return max(exercise.duration - elapsed, 0)
    }

    // MARK: - Load

    func loadBlocks(_ builderBlocks: [BuilderBlock]) {
        blocks = builderBlocks
        currentBlockIndex = 0
        currentExerciseIndex = 0
        elapsed = 0
        totalElapsed = 0
        isPlaying = false
        stopTimer()
    }

    func reset() {
        stopTimer()
        blocks = []
        isPlaying = false
        elapsed = 0
        totalElapsed = 0
        currentBlockIndex = 0
        currentExerciseIndex = 0
    }

    // MARK: - Playback

    func play() {
        guard !isComplete else { return }
        isPlaying = true
        startTimer()
    }

    func pause() {
        isPlaying = false
        stopTimer()
    }

    func togglePlayPause() {
        isPlaying ? pause() : play()
    }

    func skipNext() {
        guard let block = currentBlock else { return }
        elapsed = 0

        if currentExerciseIndex + 1 < block.exercises.count {
            currentExerciseIndex += 1
        } else if currentBlockIndex + 1 < blocks.count {
            currentBlockIndex += 1
            currentExerciseIndex = 0
        }
        // else: already at end
    }

    func skipPrev() {
        if elapsed > 3 {
            elapsed = 0
            return
        }

        elapsed = 0

        if currentExerciseIndex > 0 {
            currentExerciseIndex -= 1
        } else if currentBlockIndex > 0 {
            currentBlockIndex -= 1
            currentExerciseIndex = max(0, blocks[currentBlockIndex].exercises.count - 1)
        }
    }

    func goToExercise(blockIndex: Int, exerciseIndex: Int) {
        currentBlockIndex = blockIndex
        currentExerciseIndex = exerciseIndex
        elapsed = 0
    }

    // MARK: - Timer

    private func startTimer() {
        stopTimer()
        timer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { [weak self] _ in
            self?.tick()
        }
    }

    private func stopTimer() {
        timer?.invalidate()
        timer = nil
    }

    private func tick() {
        guard isPlaying, let exercise = currentExercise else { return }

        elapsed += 1
        totalElapsed += 1

        if elapsed >= exercise.duration {
            // Auto-advance
            guard let block = currentBlock else { return }

            if currentExerciseIndex + 1 < block.exercises.count {
                currentExerciseIndex += 1
                elapsed = 0
            } else if currentBlockIndex + 1 < blocks.count {
                currentBlockIndex += 1
                currentExerciseIndex = 0
                elapsed = 0
            } else {
                // Class complete
                isPlaying = false
                stopTimer()
            }
        }
    }

    deinit {
        stopTimer()
    }
}
