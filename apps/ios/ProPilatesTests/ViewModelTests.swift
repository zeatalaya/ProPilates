import XCTest
@testable import ProPilates

final class ViewModelTests: XCTestCase {

    // MARK: - ClassBuilderViewModel

    func testAddBlock() {
        let vm = ClassBuilderViewModel()
        XCTAssertTrue(vm.blocks.isEmpty)
        vm.addBlock(name: "Warm-Up")
        XCTAssertEqual(vm.blocks.count, 1)
        XCTAssertEqual(vm.blocks[0].name, "Warm-Up")
        XCTAssertEqual(vm.selectedBlockId, vm.blocks[0].id)
    }

    func testRemoveBlock() {
        let vm = ClassBuilderViewModel()
        vm.addBlock(name: "A")
        vm.addBlock(name: "B")
        XCTAssertEqual(vm.blocks.count, 2)

        let idA = vm.blocks[0].id
        vm.removeBlock(id: idA)
        XCTAssertEqual(vm.blocks.count, 1)
        XCTAssertEqual(vm.blocks[0].name, "B")
    }

    func testRenameBlock() {
        let vm = ClassBuilderViewModel()
        vm.addBlock(name: "Old Name")
        vm.renameBlock(id: vm.blocks[0].id, name: "New Name")
        XCTAssertEqual(vm.blocks[0].name, "New Name")
    }

    func testAddExerciseToBlock() throws {
        let vm = ClassBuilderViewModel()
        vm.addBlock(name: "Block 1")

        let exercise = makeExercise(name: "The Hundred", duration: 120)
        vm.addExerciseToBlock(blockId: vm.blocks[0].id, exercise: exercise)

        XCTAssertEqual(vm.blocks[0].exercises.count, 1)
        XCTAssertEqual(vm.blocks[0].exercises[0].exercise?.name, "The Hundred")
        XCTAssertEqual(vm.blocks[0].exercises[0].duration, 120)
    }

    func testRemoveExerciseFromBlock() {
        let vm = ClassBuilderViewModel()
        vm.addBlock(name: "Block 1")

        let exercise = makeExercise(name: "Roll Up", duration: 60)
        vm.addExerciseToBlock(blockId: vm.blocks[0].id, exercise: exercise)
        let exId = vm.blocks[0].exercises[0].id

        vm.removeExerciseFromBlock(blockId: vm.blocks[0].id, exerciseId: exId)
        XCTAssertTrue(vm.blocks[0].exercises.isEmpty)
    }

    func testUpdateExercise() {
        let vm = ClassBuilderViewModel()
        vm.addBlock(name: "Block 1")
        vm.addExerciseToBlock(blockId: vm.blocks[0].id, exercise: makeExercise(name: "Test", duration: 60))

        let blockId = vm.blocks[0].id
        let exId = vm.blocks[0].exercises[0].id

        vm.updateExercise(blockId: blockId, exerciseId: exId, duration: 90, side: "left", notes: "Focus on form")

        XCTAssertEqual(vm.blocks[0].exercises[0].duration, 90)
        XCTAssertEqual(vm.blocks[0].exercises[0].side, "left")
        XCTAssertEqual(vm.blocks[0].exercises[0].notes, "Focus on form")
    }

    func testTotalDuration() {
        let vm = ClassBuilderViewModel()
        vm.addBlock(name: "Block 1")
        vm.addExerciseToBlock(blockId: vm.blocks[0].id, exercise: makeExercise(name: "A", duration: 60))
        vm.addExerciseToBlock(blockId: vm.blocks[0].id, exercise: makeExercise(name: "B", duration: 30))

        XCTAssertEqual(vm.totalDuration, 90)
        XCTAssertEqual(vm.totalExerciseCount, 2)
    }

    func testReset() {
        let vm = ClassBuilderViewModel()
        vm.title = "Test Class"
        vm.addBlock(name: "Block 1")
        vm.reset()

        XCTAssertTrue(vm.title.isEmpty)
        XCTAssertTrue(vm.blocks.isEmpty)
        XCTAssertNil(vm.selectedBlockId)
    }

    func testFilteredExercises() {
        let vm = ClassBuilderViewModel()
        vm.allExercises = [
            makeExercise(name: "Mat A", duration: 60, method: .mat, category: .warmup),
            makeExercise(name: "Reformer B", duration: 45, method: .reformer, category: .strength),
        ]

        // No filter
        XCTAssertEqual(vm.filteredExercises.count, 2)

        // Filter by method
        vm.browserMethod = .mat
        XCTAssertEqual(vm.filteredExercises.count, 1)
        XCTAssertEqual(vm.filteredExercises[0].name, "Mat A")

        // Filter by search
        vm.browserMethod = nil
        vm.browserSearch = "Reformer"
        XCTAssertEqual(vm.filteredExercises.count, 1)
        XCTAssertEqual(vm.filteredExercises[0].name, "Reformer B")
    }

    // MARK: - TeachingModeViewModel

    func testTeachingModeLoadBlocks() {
        let vm = TeachingModeViewModel()
        let blocks = makeBlocks()
        vm.loadBlocks(blocks)

        XCTAssertEqual(vm.blocks.count, 2)
        XCTAssertEqual(vm.currentBlockIndex, 0)
        XCTAssertEqual(vm.currentExerciseIndex, 0)
        XCTAssertFalse(vm.isPlaying)
        XCTAssertEqual(vm.totalExercises, 3) // 2 + 1
    }

    func testTeachingModeProgress() {
        let vm = TeachingModeViewModel()
        vm.loadBlocks(makeBlocks())

        XCTAssertEqual(vm.progress, 0.0, accuracy: 0.01)
        XCTAssertEqual(vm.currentExerciseNumber, 1)
        XCTAssertFalse(vm.isComplete)
    }

    func testTeachingModeSkipNext() {
        let vm = TeachingModeViewModel()
        vm.loadBlocks(makeBlocks())

        vm.skipNext()
        XCTAssertEqual(vm.currentExerciseIndex, 1)
        XCTAssertEqual(vm.currentBlockIndex, 0)
        XCTAssertEqual(vm.elapsed, 0)

        // Skip to next block
        vm.skipNext()
        XCTAssertEqual(vm.currentBlockIndex, 1)
        XCTAssertEqual(vm.currentExerciseIndex, 0)
    }

    func testTeachingModeSkipPrevRestartsFirst() {
        let vm = TeachingModeViewModel()
        vm.loadBlocks(makeBlocks())
        vm.elapsed = 10 // > 3 seconds

        vm.skipPrev()
        XCTAssertEqual(vm.elapsed, 0)
        XCTAssertEqual(vm.currentExerciseIndex, 0) // Didn't go back, just restarted
    }

    func testTeachingModeSkipPrevGoesBack() {
        let vm = TeachingModeViewModel()
        vm.loadBlocks(makeBlocks())
        vm.skipNext() // Go to exercise 1
        vm.elapsed = 2 // <= 3 seconds

        vm.skipPrev()
        XCTAssertEqual(vm.currentExerciseIndex, 0) // Went back
    }

    func testTeachingModeReset() {
        let vm = TeachingModeViewModel()
        vm.loadBlocks(makeBlocks())
        vm.play()
        vm.reset()

        XCTAssertTrue(vm.blocks.isEmpty)
        XCTAssertFalse(vm.isPlaying)
        XCTAssertEqual(vm.elapsed, 0)
    }

    func testTeachingModeTimeRemaining() {
        let vm = TeachingModeViewModel()
        vm.loadBlocks(makeBlocks())
        // First exercise has duration 60
        XCTAssertEqual(vm.timeRemaining, 60)
    }

    // MARK: - Helpers

    private func makeExercise(
        name: String,
        duration: Int,
        method: PilatesMethod = .mat,
        category: ExerciseCategory = .warmup
    ) -> Exercise {
        let json = """
        {
            "id": "\(UUID().uuidString)",
            "name": "\(name)",
            "method": "\(method.rawValue)",
            "category": "\(category.rawValue)",
            "difficulty": "beginner",
            "muscle_groups": ["core"],
            "description": "",
            "cues": [],
            "default_duration": \(duration),
            "image_url": null,
            "video_url": null,
            "objective": null,
            "apparatus": null,
            "start_position": null,
            "movement": null,
            "pace": null,
            "school": null,
            "creator_id": null,
            "is_custom": false,
            "is_public": false,
            "price": null
        }
        """.data(using: .utf8)!

        return try! JSONDecoder().decode(Exercise.self, from: json)
    }

    private func makeBlocks() -> [BuilderBlock] {
        [
            BuilderBlock(
                id: UUID(),
                name: "Warm-Up",
                orderIndex: 0,
                exercises: [
                    BuilderExercise(id: UUID(), exerciseId: UUID(), exercise: makeExercise(name: "Hundred", duration: 60), orderIndex: 0, duration: 60, reps: nil, side: nil, notes: ""),
                    BuilderExercise(id: UUID(), exerciseId: UUID(), exercise: makeExercise(name: "Roll Up", duration: 45), orderIndex: 1, duration: 45, reps: nil, side: nil, notes: ""),
                ]
            ),
            BuilderBlock(
                id: UUID(),
                name: "Core",
                orderIndex: 1,
                exercises: [
                    BuilderExercise(id: UUID(), exerciseId: UUID(), exercise: makeExercise(name: "Plank", duration: 30), orderIndex: 0, duration: 30, reps: nil, side: nil, notes: ""),
                ]
            ),
        ]
    }
}
