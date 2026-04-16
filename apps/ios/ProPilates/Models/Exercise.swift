import Foundation

// MARK: - Muscle Group

enum MuscleGroup: String, Codable, CaseIterable {
    case core
    case legs
    case arms
    case back
    case glutes
    case shoulders
    case fullBody
    case hipFlexors
    case chest

    init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        let rawValue = try container.decode(String.self)
        switch rawValue {
        case "core": self = .core
        case "legs": self = .legs
        case "arms": self = .arms
        case "back": self = .back
        case "glutes": self = .glutes
        case "shoulders": self = .shoulders
        case "full_body": self = .fullBody
        case "hip_flexors": self = .hipFlexors
        case "chest": self = .chest
        default:
            throw DecodingError.dataCorruptedError(
                in: container,
                debugDescription: "Unknown MuscleGroup: \(rawValue)"
            )
        }
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()
        switch self {
        case .core: try container.encode("core")
        case .legs: try container.encode("legs")
        case .arms: try container.encode("arms")
        case .back: try container.encode("back")
        case .glutes: try container.encode("glutes")
        case .shoulders: try container.encode("shoulders")
        case .fullBody: try container.encode("full_body")
        case .hipFlexors: try container.encode("hip_flexors")
        case .chest: try container.encode("chest")
        }
    }
}

// MARK: - Exercise Category

enum ExerciseCategory: String, Codable, CaseIterable {
    case warmup
    case strength
    case flexibility
    case balance
    case cooldown
    case flow
    case cardio
}

// MARK: - Exercise Pace

enum ExercisePace: String, Codable, CaseIterable {
    case deliberate
    case moderate
    case flowing
    case dynamic
}

// MARK: - Pilates School

enum PilatesSchool: String, Codable, CaseIterable {
    case classical
    case basi
    case stott
    case romana
    case fletcher
    case polestar
    case balancedBody
    case contemporary

    init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        let rawValue = try container.decode(String.self)
        switch rawValue {
        case "classical": self = .classical
        case "basi": self = .basi
        case "stott": self = .stott
        case "romana": self = .romana
        case "fletcher": self = .fletcher
        case "polestar": self = .polestar
        case "balanced_body": self = .balancedBody
        case "contemporary": self = .contemporary
        default:
            throw DecodingError.dataCorruptedError(
                in: container,
                debugDescription: "Unknown PilatesSchool: \(rawValue)"
            )
        }
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()
        switch self {
        case .classical: try container.encode("classical")
        case .basi: try container.encode("basi")
        case .stott: try container.encode("stott")
        case .romana: try container.encode("romana")
        case .fletcher: try container.encode("fletcher")
        case .polestar: try container.encode("polestar")
        case .balancedBody: try container.encode("balanced_body")
        case .contemporary: try container.encode("contemporary")
        }
    }
}

// MARK: - Exercise

struct Exercise: Codable, Identifiable {
    let id: UUID
    let name: String
    let method: PilatesMethod
    let category: ExerciseCategory
    let difficulty: Difficulty
    let muscleGroups: [MuscleGroup]
    let description: String
    let cues: [String]
    let defaultDuration: Int
    let imageURL: String?
    let videoURL: String?
    let objective: String?
    let apparatus: String?
    let startPosition: String?
    let movement: [String]?
    let pace: ExercisePace?
    let school: PilatesSchool?
    let creatorId: UUID?
    let isCustom: Bool
    let isPublic: Bool
    let price: Double?

    enum CodingKeys: String, CodingKey {
        case id
        case name
        case method
        case category
        case difficulty
        case muscleGroups = "muscle_groups"
        case description
        case cues
        case defaultDuration = "default_duration"
        case imageURL = "image_url"
        case videoURL = "video_url"
        case objective
        case apparatus
        case startPosition = "start_position"
        case movement
        case pace
        case school
        case creatorId = "creator_id"
        case isCustom = "is_custom"
        case isPublic = "is_public"
        case price
    }
}
