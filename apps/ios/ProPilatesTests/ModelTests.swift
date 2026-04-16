import XCTest
@testable import ProPilates

final class ModelTests: XCTestCase {

    // MARK: - Exercise Decoding

    func testExerciseDecoding() throws {
        let json = """
        {
            "id": "550e8400-e29b-41d4-a716-446655440001",
            "name": "The Hundred",
            "method": "mat",
            "category": "warmup",
            "difficulty": "beginner",
            "muscle_groups": ["core", "arms"],
            "description": "Classic Pilates warm-up exercise",
            "cues": ["Pump arms", "Breathe 5 in, 5 out"],
            "default_duration": 120,
            "image_url": null,
            "video_url": null,
            "objective": "Warm up the body",
            "apparatus": null,
            "start_position": "Supine",
            "movement": ["Arm pumps"],
            "pace": "moderate",
            "school": "classical",
            "creator_id": null,
            "is_custom": false,
            "is_public": false,
            "price": null
        }
        """.data(using: .utf8)!

        let exercise = try JSONDecoder().decode(Exercise.self, from: json)
        XCTAssertEqual(exercise.name, "The Hundred")
        XCTAssertEqual(exercise.method, .mat)
        XCTAssertEqual(exercise.category, .warmup)
        XCTAssertEqual(exercise.difficulty, .beginner)
        XCTAssertEqual(exercise.muscleGroups, [.core, .arms])
        XCTAssertEqual(exercise.defaultDuration, 120)
        XCTAssertEqual(exercise.pace, .moderate)
        XCTAssertEqual(exercise.school, .classical)
        XCTAssertNil(exercise.creatorId)
        XCTAssertFalse(exercise.isCustom)
        XCTAssertNil(exercise.price)
    }

    func testCustomExerciseDecoding() throws {
        let json = """
        {
            "id": "550e8400-e29b-41d4-a716-446655440002",
            "name": "My Custom Exercise",
            "method": "reformer",
            "category": "strength",
            "difficulty": "advanced",
            "muscle_groups": ["glutes", "legs"],
            "description": "A custom reformer exercise",
            "cues": ["Engage core"],
            "default_duration": 60,
            "image_url": null,
            "video_url": null,
            "objective": null,
            "apparatus": "Reformer",
            "start_position": null,
            "movement": null,
            "pace": null,
            "school": "basi",
            "creator_id": "550e8400-e29b-41d4-a716-446655440000",
            "is_custom": true,
            "is_public": true,
            "price": 2.99
        }
        """.data(using: .utf8)!

        let exercise = try JSONDecoder().decode(Exercise.self, from: json)
        XCTAssertTrue(exercise.isCustom)
        XCTAssertTrue(exercise.isPublic)
        XCTAssertEqual(exercise.price, 2.99)
        XCTAssertNotNil(exercise.creatorId)
        XCTAssertEqual(exercise.school, .basi)
    }

    // MARK: - PilatesClass Decoding

    func testPilatesClassDecoding() throws {
        let json = """
        {
            "id": "550e8400-e29b-41d4-a716-446655440010",
            "instructor_id": "550e8400-e29b-41d4-a716-446655440000",
            "title": "Morning Flow",
            "description": "A gentle morning class",
            "method": "mat",
            "class_type": "group",
            "difficulty": "beginner",
            "duration_minutes": 45,
            "is_public": true,
            "is_template": false,
            "price": 4.99,
            "token_id": "nft123",
            "playlist_id": null,
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-02T00:00:00Z"
        }
        """.data(using: .utf8)!

        let pilatesClass = try JSONDecoder().decode(PilatesClass.self, from: json)
        XCTAssertEqual(pilatesClass.title, "Morning Flow")
        XCTAssertEqual(pilatesClass.durationMinutes, 45)
        XCTAssertTrue(pilatesClass.isPublic)
        XCTAssertFalse(pilatesClass.isTemplate)
        XCTAssertEqual(pilatesClass.price, 4.99)
        XCTAssertEqual(pilatesClass.tokenId, "nft123")
    }

    func testPilatesClassWithInstructorJoin() throws {
        let json = """
        {
            "id": "550e8400-e29b-41d4-a716-446655440010",
            "instructor_id": "550e8400-e29b-41d4-a716-446655440000",
            "title": "Morning Flow",
            "description": "A gentle morning class",
            "method": "mat",
            "class_type": "group",
            "difficulty": "beginner",
            "duration_minutes": 45,
            "is_public": true,
            "is_template": false,
            "price": 4.99,
            "token_id": null,
            "playlist_id": null,
            "instructor": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "xion_address": "xion1abc",
                "name": "Jane Doe",
                "bio": "Certified instructor",
                "avatar_url": null,
                "location": "LA",
                "languages": ["en", "es"],
                "methods": ["mat"],
                "class_types": ["group"],
                "equipment": [],
                "certifications": ["BASI"],
                "music_style": "ambient",
                "favorite_artists": [],
                "tier": "premium",
                "onboarding_complete": true,
                "created_at": "2024-01-01T00:00:00Z",
                "updated_at": "2024-01-01T00:00:00Z",
                "classes_taught": 100
            },
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-02T00:00:00Z"
        }
        """.data(using: .utf8)!

        let pilatesClass = try JSONDecoder().decode(PilatesClass.self, from: json)
        XCTAssertNotNil(pilatesClass.instructor)
        XCTAssertEqual(pilatesClass.instructor?.name, "Jane Doe")
        XCTAssertEqual(pilatesClass.instructor?.tier, .premium)
    }

    // MARK: - ClassBlock + BlockExercise Decoding

    func testClassBlockWithExercisesDecoding() throws {
        let json = """
        {
            "id": "550e8400-e29b-41d4-a716-446655440020",
            "class_id": "550e8400-e29b-41d4-a716-446655440010",
            "name": "Warm-Up",
            "order_index": 0,
            "block_exercises": [
                {
                    "id": "550e8400-e29b-41d4-a716-446655440030",
                    "block_id": "550e8400-e29b-41d4-a716-446655440020",
                    "exercise_id": "550e8400-e29b-41d4-a716-446655440001",
                    "exercise": {
                        "id": "550e8400-e29b-41d4-a716-446655440001",
                        "name": "The Hundred",
                        "method": "mat",
                        "category": "warmup",
                        "difficulty": "beginner",
                        "muscle_groups": ["core"],
                        "description": "Classic warmup",
                        "cues": ["Breathe"],
                        "default_duration": 120,
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
                    },
                    "order_index": 0,
                    "duration": 120,
                    "reps": null,
                    "side": null,
                    "notes": "Focus on breathing"
                }
            ]
        }
        """.data(using: .utf8)!

        let block = try JSONDecoder().decode(ClassBlock.self, from: json)
        XCTAssertEqual(block.name, "Warm-Up")
        XCTAssertEqual(block.orderIndex, 0)
        // block_exercises should be mapped to exercises
        XCTAssertEqual(block.exercises.count, 1)
        XCTAssertEqual(block.exercises.first?.exercise?.name, "The Hundred")
        XCTAssertEqual(block.exercises.first?.duration, 120)
        XCTAssertEqual(block.exercises.first?.notes, "Focus on breathing")
    }

    // MARK: - Marketplace Models

    func testPortfolioAccessDecoding() throws {
        let json = """
        {
            "id": "550e8400-e29b-41d4-a716-446655440040",
            "buyer_address": "xion1buyer",
            "seller_address": "xion1seller",
            "class_id": "550e8400-e29b-41d4-a716-446655440010",
            "token_id": "nft_123",
            "price_paid": 4.99,
            "purchased_at": "2024-06-15T10:30:00Z"
        }
        """.data(using: .utf8)!

        let access = try JSONDecoder().decode(PortfolioAccess.self, from: json)
        XCTAssertEqual(access.buyerAddress, "xion1buyer")
        XCTAssertEqual(access.sellerAddress, "xion1seller")
        XCTAssertEqual(access.pricePaid, 4.99)
    }

    func testVerificationDecoding() throws {
        let json = """
        {
            "id": "550e8400-e29b-41d4-a716-446655440050",
            "instructor_id": "550e8400-e29b-41d4-a716-446655440000",
            "provider": "basi",
            "proof_hash": "0xabc123",
            "verified_at": "2024-03-15T08:00:00Z",
            "tx_hash": "ABCDEF",
            "on_chain": true
        }
        """.data(using: .utf8)!

        let verification = try JSONDecoder().decode(Verification.self, from: json)
        XCTAssertEqual(verification.provider, "basi")
        XCTAssertTrue(verification.onChain)
        XCTAssertNotNil(verification.txHash)
    }

    func testSubscriptionDecoding() throws {
        let json = """
        {
            "id": "550e8400-e29b-41d4-a716-446655440060",
            "instructor_id": "550e8400-e29b-41d4-a716-446655440000",
            "tier": "premium",
            "started_at": "2024-01-01T00:00:00Z",
            "expires_at": "2024-02-01T00:00:00Z",
            "tx_hash": null,
            "status": "active",
            "payment_method": "crossmint",
            "amount_usdc": 4.99
        }
        """.data(using: .utf8)!

        let sub = try JSONDecoder().decode(Subscription.self, from: json)
        XCTAssertEqual(sub.tier, .premium)
        XCTAssertEqual(sub.status, "active")
        XCTAssertEqual(sub.paymentMethod, "crossmint")
        XCTAssertEqual(sub.amountUsdc, 4.99)
    }

    // MARK: - Insert DTO Encoding

    func testExerciseInsertEncoding() throws {
        let insert = ExerciseInsert(
            name: "Test Exercise",
            method: .mat,
            category: .strength,
            difficulty: .intermediate,
            muscleGroups: [.core, .glutes],
            description: "A test exercise",
            cues: ["Cue 1"],
            defaultDuration: 60,
            objective: nil,
            apparatus: nil,
            startPosition: "Supine",
            movement: nil,
            pace: .moderate,
            school: nil,
            creatorId: UUID(uuidString: "550e8400-e29b-41d4-a716-446655440000"),
            isCustom: true,
            isPublic: false
        )

        let data = try JSONEncoder().encode(insert)
        let dict = try JSONSerialization.jsonObject(with: data) as! [String: Any]

        XCTAssertEqual(dict["name"] as? String, "Test Exercise")
        XCTAssertEqual(dict["method"] as? String, "mat")
        XCTAssertEqual(dict["is_custom"] as? Bool, true)
        XCTAssertEqual(dict["is_public"] as? Bool, false)
        XCTAssertEqual(dict["default_duration"] as? Int, 60)
        XCTAssertEqual(dict["muscle_groups"] as? [String], ["core", "glutes"])
        XCTAssertNotNil(dict["creator_id"])
    }

    func testClassInsertEncoding() throws {
        let insert = ClassInsert(
            instructorId: UUID(uuidString: "550e8400-e29b-41d4-a716-446655440000")!,
            title: "Morning Flow",
            description: "A class",
            method: .reformer,
            classType: .group,
            difficulty: .beginner,
            durationMinutes: 50
        )

        let data = try JSONEncoder().encode(insert)
        let dict = try JSONSerialization.jsonObject(with: data) as! [String: Any]

        XCTAssertEqual(dict["title"] as? String, "Morning Flow")
        XCTAssertEqual(dict["method"] as? String, "reformer")
        XCTAssertEqual(dict["class_type"] as? String, "group")
        XCTAssertEqual(dict["duration_minutes"] as? Int, 50)
        XCTAssertNotNil(dict["instructor_id"])
    }

    func testInstructorUpsertEncoding() throws {
        let upsert = InstructorUpsert(
            xionAddress: "xion1abc",
            name: "Jane",
            bio: "Bio",
            location: "NYC",
            languages: ["en"],
            methods: [.mat, .reformer],
            classTypes: [.group],
            equipment: ["mat"],
            certifications: ["BASI"],
            musicStyle: "ambient",
            favoriteArtists: ["Nils Frahm"],
            onboardingComplete: true
        )

        let data = try JSONEncoder().encode(upsert)
        let dict = try JSONSerialization.jsonObject(with: data) as! [String: Any]

        XCTAssertEqual(dict["xion_address"] as? String, "xion1abc")
        XCTAssertEqual(dict["name"] as? String, "Jane")
        XCTAssertEqual(dict["onboarding_complete"] as? Bool, true)
        XCTAssertEqual(dict["methods"] as? [String], ["mat", "reformer"])
        XCTAssertEqual(dict["class_types"] as? [String], ["group"])
        XCTAssertEqual(dict["music_style"] as? String, "ambient")
    }

    // MARK: - Enum Edge Cases

    func testAllMuscleGroups() throws {
        for group in MuscleGroup.allCases {
            let data = try JSONEncoder().encode(group)
            let decoded = try JSONDecoder().decode(MuscleGroup.self, from: data)
            XCTAssertEqual(group, decoded)
        }
    }

    func testAllPilatesMethods() throws {
        for method in PilatesMethod.allCases {
            let data = try JSONEncoder().encode(method)
            let decoded = try JSONDecoder().decode(PilatesMethod.self, from: data)
            XCTAssertEqual(method, decoded)
        }
    }

    func testAllPilatesSchools() throws {
        for school in PilatesSchool.allCases {
            let data = try JSONEncoder().encode(school)
            let decoded = try JSONDecoder().decode(PilatesSchool.self, from: data)
            XCTAssertEqual(school, decoded)
        }
    }

    func testFoamRollerEncoding() throws {
        let data = try JSONEncoder().encode(PilatesMethod.foamRoller)
        let string = String(data: data, encoding: .utf8)!
        XCTAssertTrue(string.contains("foam_roller"))
    }

    func testBalancedBodyEncoding() throws {
        let data = try JSONEncoder().encode(PilatesSchool.balancedBody)
        let string = String(data: data, encoding: .utf8)!
        XCTAssertTrue(string.contains("balanced_body"))
    }
}
