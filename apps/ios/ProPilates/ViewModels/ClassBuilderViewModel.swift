import Foundation
import Observation

@Observable
final class ClassBuilderViewModel {

    // MARK: - Class Metadata

    var title = ""
    var description = ""
    var method: PilatesMethod = .mat
    var classType: ClassType = .group
    var difficulty: Difficulty = .beginner
    var durationMinutes = 45

    // MARK: - Blocks

    var blocks: [BuilderBlock] = []
    var selectedBlockId: UUID?
    var selectedExerciseId: UUID?

    // MARK: - Exercise Browser

    var browserSearch = ""
    var browserMethod: PilatesMethod?
    var browserCategory: ExerciseCategory?
    var browserDifficulty: Difficulty?

    var allExercises: [Exercise] = []
    var customExercises: [Exercise] = []

    var filteredExercises: [Exercise] {
        let combined = allExercises + customExercises
        return combined.filter { exercise in
            if !browserSearch.isEmpty,
               !exercise.name.localizedCaseInsensitiveContains(browserSearch) {
                return false
            }
            if let method = browserMethod, exercise.method != method { return false }
            if let category = browserCategory, exercise.category != category { return false }
            if let difficulty = browserDifficulty, exercise.difficulty != difficulty { return false }
            return true
        }
    }

    var selectedBlock: BuilderBlock? {
        blocks.first { $0.id == selectedBlockId }
    }

    var selectedExercise: BuilderExercise? {
        guard let block = selectedBlock else { return nil }
        return block.exercises.first { $0.id == selectedExerciseId }
    }

    var totalDuration: Int {
        blocks.flatMap(\.exercises).reduce(0) { $0 + $1.duration }
    }

    var totalExerciseCount: Int {
        blocks.flatMap(\.exercises).count
    }

    // MARK: - Block Management

    func addBlock(name: String = "New Block") {
        let block = BuilderBlock(
            id: UUID(),
            name: name,
            orderIndex: blocks.count,
            exercises: []
        )
        blocks.append(block)
        selectedBlockId = block.id
    }

    func removeBlock(id: UUID) {
        blocks.removeAll { $0.id == id }
        if selectedBlockId == id { selectedBlockId = blocks.first?.id }
    }

    func renameBlock(id: UUID, name: String) {
        guard let index = blocks.firstIndex(where: { $0.id == id }) else { return }
        blocks[index].name = name
    }

    // MARK: - Exercise Management

    func addExerciseToBlock(blockId: UUID, exercise: Exercise) {
        guard let index = blocks.firstIndex(where: { $0.id == blockId }) else { return }
        let builderExercise = BuilderExercise(
            id: UUID(),
            exerciseId: exercise.id,
            exercise: exercise,
            orderIndex: blocks[index].exercises.count,
            duration: exercise.defaultDuration,
            reps: nil,
            side: nil,
            notes: ""
        )
        blocks[index].exercises.append(builderExercise)
        selectedExerciseId = builderExercise.id
    }

    func removeExerciseFromBlock(blockId: UUID, exerciseId: UUID) {
        guard let blockIndex = blocks.firstIndex(where: { $0.id == blockId }) else { return }
        blocks[blockIndex].exercises.removeAll { $0.id == exerciseId }
        if selectedExerciseId == exerciseId { selectedExerciseId = nil }
    }

    func updateExercise(blockId: UUID, exerciseId: UUID, duration: Int? = nil, reps: Int? = nil, side: String? = nil, notes: String? = nil) {
        guard let blockIndex = blocks.firstIndex(where: { $0.id == blockId }),
              let exIndex = blocks[blockIndex].exercises.firstIndex(where: { $0.id == exerciseId }) else { return }

        if let duration { blocks[blockIndex].exercises[exIndex].duration = duration }
        if let reps { blocks[blockIndex].exercises[exIndex].reps = reps }
        if let side { blocks[blockIndex].exercises[exIndex].side = side }
        if let notes { blocks[blockIndex].exercises[exIndex].notes = notes }
    }

    func moveExercise(blockId: UUID, from: IndexSet, to: Int) {
        guard let blockIndex = blocks.firstIndex(where: { $0.id == blockId }) else { return }
        blocks[blockIndex].exercises.move(fromOffsets: from, toOffset: to)
        for i in blocks[blockIndex].exercises.indices {
            blocks[blockIndex].exercises[i].orderIndex = i
        }
    }

    // MARK: - Load/Reset

    func loadClass(_ pilatesClass: PilatesClass) {
        title = pilatesClass.title
        description = pilatesClass.description
        method = pilatesClass.method
        classType = pilatesClass.classType
        difficulty = pilatesClass.difficulty
        durationMinutes = pilatesClass.durationMinutes

        if let classBlocks = pilatesClass.blocks {
            blocks = classBlocks.map { block in
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

        selectedBlockId = blocks.first?.id
    }

    func reset() {
        title = ""
        description = ""
        method = .mat
        classType = .group
        difficulty = .beginner
        durationMinutes = 45
        blocks = []
        selectedBlockId = nil
        selectedExerciseId = nil
    }
}

// MARK: - Builder Models (mutable, local-only)

struct BuilderBlock: Identifiable {
    let id: UUID
    var name: String
    var orderIndex: Int
    var exercises: [BuilderExercise]
}

struct BuilderExercise: Identifiable {
    let id: UUID
    let exerciseId: UUID
    let exercise: Exercise?
    var orderIndex: Int
    var duration: Int
    var reps: Int?
    var side: String?
    var notes: String
}
