import Foundation
import Observation
import Supabase

@Observable
final class SupabaseService {

    let client: SupabaseClient

    init(config: AppConfig) {
        guard let url = URL(string: config.supabaseURL) else {
            fatalError("Invalid Supabase URL: \(config.supabaseURL)")
        }
        self.client = SupabaseClient(supabaseURL: url, supabaseKey: config.supabaseAnonKey)
    }

    // MARK: - Instructor

    func fetchInstructor(xionAddress: String) async throws -> Instructor? {
        let response: [Instructor] = try await client
            .from("instructors")
            .select()
            .eq("xion_address", value: xionAddress)
            .limit(1)
            .execute()
            .value

        return response.first
    }

    func fetchInstructorById(_ id: UUID) async throws -> Instructor? {
        let response: [Instructor] = try await client
            .from("instructors")
            .select()
            .eq("id", value: id.uuidString)
            .limit(1)
            .execute()
            .value

        return response.first
    }

    func upsertInstructor(_ data: InstructorUpsert) async throws -> Instructor {
        let response: Instructor = try await client
            .from("instructors")
            .upsert(data, onConflict: "xion_address")
            .select()
            .single()
            .execute()
            .value

        return response
    }

    func updateInstructorTier(instructorId: UUID, tier: Tier) async throws {
        try await client
            .from("instructors")
            .update(["tier": tier.rawValue])
            .eq("id", value: instructorId.uuidString)
            .execute()
    }

    // MARK: - Subscription

    func fetchSubscription(instructorId: UUID) async throws -> Subscription? {
        let response: [Subscription] = try await client
            .from("subscriptions")
            .select()
            .eq("instructor_id", value: instructorId.uuidString)
            .eq("status", value: "active")
            .limit(1)
            .execute()
            .value

        return response.first
    }

    func fetchLatestSubscription(instructorId: UUID) async throws -> Subscription? {
        let response: [Subscription] = try await client
            .from("subscriptions")
            .select()
            .eq("instructor_id", value: instructorId.uuidString)
            .order("started_at", ascending: false)
            .limit(1)
            .execute()
            .value

        return response.first
    }

    func createSubscription(_ data: SubscriptionInsert) async throws {
        try await client
            .from("subscriptions")
            .insert(data)
            .execute()
    }

    // MARK: - Exercises

    func fetchLibraryExercises() async throws -> [Exercise] {
        let response: [Exercise] = try await client
            .from("exercises")
            .select()
            .or("is_custom.is.null,is_custom.eq.false")
            .order("method")
            .order("name")
            .execute()
            .value

        return response
    }

    func fetchCustomExercises(creatorId: UUID) async throws -> [Exercise] {
        let response: [Exercise] = try await client
            .from("exercises")
            .select()
            .eq("is_custom", value: true)
            .eq("creator_id", value: creatorId.uuidString)
            .order("name")
            .execute()
            .value

        return response
    }

    func fetchPublicCustomExercises() async throws -> [Exercise] {
        let response: [Exercise] = try await client
            .from("exercises")
            .select()
            .eq("is_custom", value: true)
            .eq("is_public", value: true)
            .execute()
            .value

        return response
    }

    func createExercise(_ data: ExerciseInsert) async throws -> Exercise {
        let response: Exercise = try await client
            .from("exercises")
            .insert(data)
            .select()
            .single()
            .execute()
            .value

        return response
    }

    func updateExerciseVisibility(exerciseId: UUID, isPublic: Bool) async throws {
        try await client
            .from("exercises")
            .update(["is_public": isPublic])
            .eq("id", value: exerciseId.uuidString)
            .execute()
    }

    func updateExercisePrice(exerciseId: UUID, price: Double, isPublic: Bool) async throws {
        struct ExercisePriceUpdate: Encodable {
            let price: Double
            let isPublic: Bool
            enum CodingKeys: String, CodingKey {
                case price
                case isPublic = "is_public"
            }
        }
        try await client
            .from("exercises")
            .update(ExercisePriceUpdate(price: price, isPublic: isPublic))
            .eq("id", value: exerciseId.uuidString)
            .execute()
    }

    func deleteExercise(exerciseId: UUID) async throws {
        try await client
            .from("exercises")
            .delete()
            .eq("id", value: exerciseId.uuidString)
            .execute()
    }

    // MARK: - Classes

    func fetchInstructorClasses(instructorId: UUID) async throws -> [PilatesClass] {
        let response: [PilatesClass] = try await client
            .from("classes")
            .select()
            .eq("instructor_id", value: instructorId.uuidString)
            .order("updated_at", ascending: false)
            .execute()
            .value

        return response
    }

    func fetchTemplateClasses() async throws -> [PilatesClass] {
        let response: [PilatesClass] = try await client
            .from("classes")
            .select("*, class_blocks(*, block_exercises(*, exercise:exercises(*)))")
            .eq("is_template", value: true)
            .order("created_at", ascending: false)
            .execute()
            .value

        return response
    }

    func fetchMarketplaceClasses() async throws -> [PilatesClass] {
        let response: [PilatesClass] = try await client
            .from("classes")
            .select("*, instructor:instructors(*)")
            .eq("is_public", value: true)
            .not("price", operator: .is, value: "null")
            .order("created_at", ascending: false)
            .execute()
            .value

        return response
    }

    func createClass(_ data: ClassInsert) async throws -> PilatesClass {
        let response: PilatesClass = try await client
            .from("classes")
            .insert(data)
            .select()
            .single()
            .execute()
            .value

        return response
    }

    func updateClassVisibility(classId: UUID, isPublic: Bool) async throws {
        try await client
            .from("classes")
            .update(["is_public": isPublic])
            .eq("id", value: classId.uuidString)
            .execute()
    }

    func updateClassPrice(classId: UUID, price: Double) async throws {
        struct ClassPriceUpdate: Encodable {
            let price: Double
        }
        try await client
            .from("classes")
            .update(ClassPriceUpdate(price: price))
            .eq("id", value: classId.uuidString)
            .execute()
    }

    func updateClassTokenId(classId: UUID, tokenId: String) async throws {
        try await client
            .from("classes")
            .update(["token_id": tokenId])
            .eq("id", value: classId.uuidString)
            .execute()
    }

    func deleteClass(classId: UUID) async throws {
        try await client
            .from("classes")
            .delete()
            .eq("id", value: classId.uuidString)
            .execute()
    }

    // MARK: - Class Blocks

    func fetchClassBlocks(classId: UUID) async throws -> [ClassBlock] {
        let response: [ClassBlock] = try await client
            .from("class_blocks")
            .select()
            .eq("class_id", value: classId.uuidString)
            .order("order_index")
            .execute()
            .value

        return response
    }

    func createClassBlock(_ data: ClassBlockInsert) async throws -> ClassBlock {
        let response: ClassBlock = try await client
            .from("class_blocks")
            .insert(data)
            .select()
            .single()
            .execute()
            .value

        return response
    }

    // MARK: - Block Exercises

    func fetchBlockExercises(blockId: UUID) async throws -> [BlockExercise] {
        let response: [BlockExercise] = try await client
            .from("block_exercises")
            .select("*, exercise:exercises(*)")
            .eq("block_id", value: blockId.uuidString)
            .order("order_index")
            .execute()
            .value

        return response
    }

    func createBlockExercise(_ data: BlockExerciseInsert) async throws {
        try await client
            .from("block_exercises")
            .insert(data)
            .execute()
    }

    func createBlockExercises(_ data: [BlockExerciseInsert]) async throws {
        try await client
            .from("block_exercises")
            .insert(data)
            .execute()
    }

    // MARK: - Portfolio Access

    func fetchPortfolioAccess(buyerAddress: String) async throws -> [PortfolioAccess] {
        let response: [PortfolioAccess] = try await client
            .from("portfolio_access")
            .select()
            .eq("buyer_address", value: buyerAddress)
            .execute()
            .value

        return response
    }

    func createPortfolioAccess(_ data: PortfolioAccessInsert) async throws {
        try await client
            .from("portfolio_access")
            .insert(data)
            .execute()
    }

    // MARK: - Verifications

    func fetchVerifications(instructorId: UUID) async throws -> [Verification] {
        let response: [Verification] = try await client
            .from("verifications")
            .select()
            .eq("instructor_id", value: instructorId.uuidString)
            .execute()
            .value

        return response
    }

    // MARK: - Purchased Exercises (via portfolio_access → class_blocks → block_exercises)

    func fetchPurchasedCustomExercises(buyerAddress: String) async throws -> [Exercise] {
        // 1. Get purchased class IDs
        let access = try await fetchPortfolioAccess(buyerAddress: buyerAddress)
        guard !access.isEmpty else { return [] }

        let classIds = access.map { $0.classId.uuidString }

        // 2. Get block IDs for those classes
        let blocks: [ClassBlock] = try await client
            .from("class_blocks")
            .select("id, class_id, name, order_index")
            .in("class_id", values: classIds)
            .execute()
            .value

        guard !blocks.isEmpty else { return [] }
        let blockIds = blocks.map { $0.id.uuidString }

        // 3. Get block exercises with exercise join, filter for custom
        let blockExercises: [BlockExercise] = try await client
            .from("block_exercises")
            .select("*, exercise:exercises!inner(*)")
            .in("block_id", values: blockIds)
            .execute()
            .value

        // Filter to custom exercises and deduplicate
        var seen = Set<UUID>()
        var result: [Exercise] = []
        for be in blockExercises {
            if let exercise = be.exercise, exercise.isCustom, !seen.contains(exercise.id) {
                seen.insert(exercise.id)
                result.append(exercise)
            }
        }

        return result
    }

    // MARK: - Save Full Class (blocks + exercises)

    func saveFullClass(
        classData: ClassInsert,
        blocks: [(name: String, exercises: [(exerciseId: UUID, duration: Int, reps: Int?, side: String?, notes: String)])]
    ) async throws -> PilatesClass {
        // 1. Create the class
        let pilatesClass = try await createClass(classData)

        // 2. Create blocks and their exercises
        for (index, block) in blocks.enumerated() {
            let blockInsert = ClassBlockInsert(
                classId: pilatesClass.id,
                name: block.name,
                orderIndex: index
            )
            let savedBlock = try await createClassBlock(blockInsert)

            // 3. Create block exercises
            let exerciseInserts = block.exercises.enumerated().map { (exIndex, ex) in
                BlockExerciseInsert(
                    blockId: savedBlock.id,
                    exerciseId: ex.exerciseId,
                    orderIndex: exIndex,
                    duration: ex.duration,
                    reps: ex.reps,
                    side: ex.side,
                    notes: ex.notes
                )
            }

            if !exerciseInserts.isEmpty {
                try await createBlockExercises(exerciseInserts)
            }
        }

        return pilatesClass
    }

    // MARK: - Load class with full details

    func fetchClassWithDetails(classId: UUID) async throws -> PilatesClass? {
        let response: [PilatesClass] = try await client
            .from("classes")
            .select("*, instructor:instructors(*)")
            .eq("id", value: classId.uuidString)
            .limit(1)
            .execute()
            .value

        guard var pilatesClass = response.first else { return nil }

        // Load blocks with exercises
        var blocks = try await fetchClassBlocks(classId: classId)
        for i in blocks.indices {
            blocks[i].exercises = try await fetchBlockExercises(blockId: blocks[i].id)
        }
        pilatesClass.blocks = blocks

        return pilatesClass
    }
}

// MARK: - Insert DTOs

struct InstructorUpsert: Encodable {
    let xionAddress: String
    let name: String
    let bio: String
    let location: String
    let languages: [String]
    let methods: [PilatesMethod]
    let classTypes: [ClassType]
    let equipment: [String]
    let certifications: [String]
    let musicStyle: String
    let favoriteArtists: [String]
    let onboardingComplete: Bool

    enum CodingKeys: String, CodingKey {
        case xionAddress = "xion_address"
        case name, bio, location, languages, methods
        case classTypes = "class_types"
        case equipment, certifications
        case musicStyle = "music_style"
        case favoriteArtists = "favorite_artists"
        case onboardingComplete = "onboarding_complete"
    }
}

struct ExerciseInsert: Encodable {
    let name: String
    let method: PilatesMethod
    let category: ExerciseCategory
    let difficulty: Difficulty
    let muscleGroups: [MuscleGroup]
    let description: String
    let cues: [String]
    let defaultDuration: Int
    let objective: String?
    let apparatus: String?
    let startPosition: String?
    let movement: [String]?
    let pace: ExercisePace?
    let school: PilatesSchool?
    let creatorId: UUID?
    let isCustom: Bool
    let isPublic: Bool

    enum CodingKeys: String, CodingKey {
        case name, method, category, difficulty
        case muscleGroups = "muscle_groups"
        case description, cues
        case defaultDuration = "default_duration"
        case objective, apparatus
        case startPosition = "start_position"
        case movement, pace, school
        case creatorId = "creator_id"
        case isCustom = "is_custom"
        case isPublic = "is_public"
    }
}

struct ClassInsert: Encodable {
    let instructorId: UUID
    let title: String
    let description: String
    let method: PilatesMethod
    let classType: ClassType
    let difficulty: Difficulty
    let durationMinutes: Int

    enum CodingKeys: String, CodingKey {
        case instructorId = "instructor_id"
        case title, description, method
        case classType = "class_type"
        case difficulty
        case durationMinutes = "duration_minutes"
    }
}

struct ClassBlockInsert: Encodable {
    let classId: UUID
    let name: String
    let orderIndex: Int

    enum CodingKeys: String, CodingKey {
        case classId = "class_id"
        case name
        case orderIndex = "order_index"
    }
}

struct BlockExerciseInsert: Encodable {
    let blockId: UUID
    let exerciseId: UUID
    let orderIndex: Int
    let duration: Int
    let reps: Int?
    let side: String?
    let notes: String

    enum CodingKeys: String, CodingKey {
        case blockId = "block_id"
        case exerciseId = "exercise_id"
        case orderIndex = "order_index"
        case duration, reps, side, notes
    }
}

struct PortfolioAccessInsert: Encodable {
    let buyerAddress: String
    let sellerAddress: String
    let classId: UUID
    let tokenId: String
    let pricePaid: Double

    enum CodingKeys: String, CodingKey {
        case buyerAddress = "buyer_address"
        case sellerAddress = "seller_address"
        case classId = "class_id"
        case tokenId = "token_id"
        case pricePaid = "price_paid"
    }
}

struct SubscriptionInsert: Encodable {
    let instructorId: UUID
    let tier: Tier
    let startedAt: String
    let expiresAt: String?
    let paymentMethod: String
    let amountUsdc: Double

    enum CodingKeys: String, CodingKey {
        case instructorId = "instructor_id"
        case tier
        case startedAt = "started_at"
        case expiresAt = "expires_at"
        case paymentMethod = "payment_method"
        case amountUsdc = "amount_usdc"
    }
}
