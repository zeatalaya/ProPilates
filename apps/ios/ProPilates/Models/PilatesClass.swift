import Foundation

// MARK: - Block Exercise

struct BlockExercise: Codable, Identifiable {
    let id: UUID
    let blockId: UUID
    let exerciseId: UUID
    var exercise: Exercise?
    let orderIndex: Int
    let duration: Int
    let reps: Int?
    let side: String?
    let notes: String

    enum CodingKeys: String, CodingKey {
        case id
        case blockId = "block_id"
        case exerciseId = "exercise_id"
        case exercise
        case orderIndex = "order_index"
        case duration
        case reps
        case side
        case notes
    }
}

// MARK: - Class Block

struct ClassBlock: Codable, Identifiable {
    let id: UUID
    let classId: UUID
    let name: String
    let orderIndex: Int
    var exercises: [BlockExercise]
    var blockExercises: [BlockExercise]?

    enum CodingKeys: String, CodingKey {
        case id
        case classId = "class_id"
        case name
        case orderIndex = "order_index"
        case exercises
        case blockExercises = "block_exercises"
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(UUID.self, forKey: .id)
        classId = try container.decode(UUID.self, forKey: .classId)
        name = try container.decode(String.self, forKey: .name)
        orderIndex = try container.decode(Int.self, forKey: .orderIndex)
        // Supabase nested joins come back as "block_exercises", manual loads as "exercises"
        blockExercises = try container.decodeIfPresent([BlockExercise].self, forKey: .blockExercises)
        exercises = try container.decodeIfPresent([BlockExercise].self, forKey: .exercises) ?? blockExercises ?? []
    }
}

// MARK: - Pilates Class

struct PilatesClass: Codable, Identifiable {
    let id: UUID
    let instructorId: UUID
    let title: String
    let description: String
    let method: PilatesMethod
    let classType: ClassType
    let difficulty: Difficulty
    let durationMinutes: Int
    let isPublic: Bool
    let isTemplate: Bool
    let price: Double?
    let tokenId: String?
    let playlistId: UUID?
    var blocks: [ClassBlock]?
    var instructor: Instructor?
    let createdAt: String
    let updatedAt: String

    enum CodingKeys: String, CodingKey {
        case id
        case instructorId = "instructor_id"
        case title
        case description
        case method
        case classType = "class_type"
        case difficulty
        case durationMinutes = "duration_minutes"
        case isPublic = "is_public"
        case isTemplate = "is_template"
        case price
        case tokenId = "token_id"
        case playlistId = "playlist_id"
        case blocks
        case instructor
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}
