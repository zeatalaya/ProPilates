import Foundation

// MARK: - Pilates Method

enum PilatesMethod: String, Codable, CaseIterable {
    case mat
    case reformer
    case xReformer
    case chair
    case tower
    case barrel
    case ring
    case band
    case foamRoller

    enum CodingKeys: String, CodingKey {
        case mat
        case reformer
        case xReformer = "x-reformer"
        case chair
        case tower
        case barrel
        case ring
        case band
        case foamRoller = "foam_roller"
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        let rawValue = try container.decode(String.self)
        switch rawValue {
        case "mat": self = .mat
        case "reformer": self = .reformer
        case "x-reformer": self = .xReformer
        case "chair": self = .chair
        case "tower": self = .tower
        case "barrel": self = .barrel
        case "ring": self = .ring
        case "band": self = .band
        case "foam_roller": self = .foamRoller
        default:
            throw DecodingError.dataCorruptedError(
                in: container,
                debugDescription: "Unknown PilatesMethod: \(rawValue)"
            )
        }
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()
        switch self {
        case .mat: try container.encode("mat")
        case .reformer: try container.encode("reformer")
        case .xReformer: try container.encode("x-reformer")
        case .chair: try container.encode("chair")
        case .tower: try container.encode("tower")
        case .barrel: try container.encode("barrel")
        case .ring: try container.encode("ring")
        case .band: try container.encode("band")
        case .foamRoller: try container.encode("foam_roller")
        }
    }
}

// MARK: - Class Type

enum ClassType: String, Codable, CaseIterable {
    case `private` = "private"
    case duet
    case group
    case virtual

    enum CodingKeys: String, CodingKey {
        case `private` = "private"
        case duet
        case group
        case virtual
    }
}

// MARK: - Difficulty

enum Difficulty: String, Codable, CaseIterable {
    case beginner
    case intermediate
    case advanced
}

// MARK: - Tier

enum Tier: String, Codable, CaseIterable {
    case free
    case premium
}

// MARK: - Instructor

struct Instructor: Codable, Identifiable {
    let id: UUID
    let xionAddress: String?
    let name: String
    let bio: String
    let avatarURL: String?
    let location: String
    let languages: [String]
    let methods: [PilatesMethod]
    let classTypes: [ClassType]
    let equipment: [String]
    let certifications: [String]
    let musicStyle: String
    let favoriteArtists: [String]
    let tier: Tier
    let onboardingComplete: Bool
    let createdAt: String
    let updatedAt: String
    var classesTaught: Int
    let stripeAccountId: String?

    enum CodingKeys: String, CodingKey {
        case id
        case xionAddress = "xion_address"
        case name
        case bio
        case avatarURL = "avatar_url"
        case location
        case languages
        case methods
        case classTypes = "class_types"
        case equipment
        case certifications
        case musicStyle = "music_style"
        case favoriteArtists = "favorite_artists"
        case tier
        case onboardingComplete = "onboarding_complete"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
        case classesTaught = "classes_taught"
        case stripeAccountId = "stripe_account_id"
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(UUID.self, forKey: .id)
        xionAddress = try container.decodeIfPresent(String.self, forKey: .xionAddress)
        name = try container.decode(String.self, forKey: .name)
        bio = try container.decode(String.self, forKey: .bio)
        avatarURL = try container.decodeIfPresent(String.self, forKey: .avatarURL)
        location = try container.decode(String.self, forKey: .location)
        languages = try container.decode([String].self, forKey: .languages)
        methods = try container.decode([PilatesMethod].self, forKey: .methods)
        classTypes = try container.decode([ClassType].self, forKey: .classTypes)
        equipment = try container.decode([String].self, forKey: .equipment)
        certifications = try container.decode([String].self, forKey: .certifications)
        musicStyle = try container.decode(String.self, forKey: .musicStyle)
        favoriteArtists = try container.decode([String].self, forKey: .favoriteArtists)
        tier = try container.decode(Tier.self, forKey: .tier)
        onboardingComplete = try container.decode(Bool.self, forKey: .onboardingComplete)
        createdAt = try container.decode(String.self, forKey: .createdAt)
        updatedAt = try container.decode(String.self, forKey: .updatedAt)
        classesTaught = try container.decodeIfPresent(Int.self, forKey: .classesTaught) ?? 0
        stripeAccountId = try container.decodeIfPresent(String.self, forKey: .stripeAccountId)
    }
}
