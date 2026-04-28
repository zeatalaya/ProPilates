// swift-tools-version: 5.9

import PackageDescription

let package = Package(
    name: "ProPilates",
    platforms: [
        .iOS(.v17),
        .macOS(.v14)
    ],
    products: [
        .library(name: "ProPilates", targets: ["ProPilates"]),
    ],
    dependencies: [
        .package(url: "https://github.com/supabase/supabase-swift", from: "2.0.0"),
        .package(url: "https://github.com/stripe/stripe-ios", from: "24.0.0"),
    ],
    targets: [
        .target(
            name: "ProPilates",
            dependencies: [
                .product(name: "Supabase", package: "supabase-swift"),
                .product(name: "StripePaymentSheet", package: "stripe-ios"),
            ],
            path: "ProPilates",
            exclude: [
                "App/ProPilatesApp.swift",
            ],
            resources: [
                .process("Resources/Fonts"),
                .process("Resources/Assets.xcassets"),
            ]
        ),
        .testTarget(
            name: "ProPilatesTests",
            dependencies: ["ProPilates"],
            path: "ProPilatesTests"
        ),
    ]
)
