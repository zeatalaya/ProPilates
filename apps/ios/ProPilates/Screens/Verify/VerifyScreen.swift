import SwiftUI

// MARK: - Provider Model

struct VerificationProvider: Identifiable {
    let id: String
    let name: String
    let description: String
    let icon: String
    let reclaimProviderId: String
}

private let providers: [VerificationProvider] = [
    VerificationProvider(id: "basi", name: "BASI Pilates", description: "Body Arts and Science International", icon: "b.circle.fill", reclaimProviderId: "basi-pilates"),
    VerificationProvider(id: "stott", name: "STOTT PILATES", description: "Merrithew's contemporary approach", icon: "s.circle.fill", reclaimProviderId: "stott-pilates"),
    VerificationProvider(id: "balanced_body", name: "Balanced Body", description: "Equipment & mind-body education", icon: "scalemass.fill", reclaimProviderId: "balanced-body"),
    VerificationProvider(id: "polestar", name: "Polestar Pilates", description: "Rehabilitation-focused Pilates", icon: "p.circle.fill", reclaimProviderId: "polestar-pilates"),
]

// MARK: - Verify Screen

struct VerifyScreen: View {
    @Environment(AuthService.self) private var auth
    @Environment(SupabaseService.self) private var supabase

    @State private var step = 0 // 0=Choose, 1=Prove, 2=Submit, 3=Success
    @State private var selectedProvider: VerificationProvider?
    @State private var isProving = false
    @State private var isSubmitting = false
    @State private var txHash: String?
    @State private var errorMessage: String?
    @State private var existingVerifications: [Verification] = []

    private let steps = ["Choose", "Prove", "Submit", "Success"]

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: Theme.spacingLG) {
                    stepIndicator

                    switch step {
                    case 0: chooseStep
                    case 1: proveStep
                    case 2: submitStep
                    case 3: successStep
                    default: EmptyView()
                    }
                }
                .padding(Theme.spacingMD)
            }
            .background(Color.ppBackground)
            .navigationTitle("Verify Credentials")
            #if os(iOS)
            .toolbarTitleDisplayMode(.inline)
            #endif
            .task {
                if let instructor = auth.instructor {
                    do {
                        existingVerifications = try await supabase.fetchVerifications(instructorId: instructor.id)
                    } catch {
                        print("[VerifyScreen] Error loading verifications: \(error)")
                    }
                }
            }
        }
    }

    // MARK: - Step Indicator

    private var stepIndicator: some View {
        HStack(spacing: 0) {
            ForEach(0..<steps.count, id: \.self) { index in
                VStack(spacing: 4) {
                    ZStack {
                        Circle()
                            .fill(index <= step ? Color.ppAccent : Color.ppBackgroundElevated)
                            .frame(width: 28, height: 28)

                        Image(systemName: stepIcon(index))
                            .font(.system(size: 12))
                            .foregroundStyle(index <= step ? .white : Color.ppTextMuted)
                    }

                    Text(steps[index])
                        .bodyFont(size: 10)
                        .foregroundStyle(index <= step ? Color.ppTextPrimary : Color.ppTextMuted)
                }
                .frame(maxWidth: .infinity)

                if index < steps.count - 1 {
                    Rectangle()
                        .fill(index < step ? Color.ppAccent : Color.ppBorder)
                        .frame(height: 2)
                        .padding(.bottom, 16)
                }
            }
        }
    }

    private func stepIcon(_ index: Int) -> String {
        switch index {
        case 0: return "list.bullet"
        case 1: return "hand.raised"
        case 2: return "paperplane"
        case 3: return "checkmark"
        default: return "circle"
        }
    }

    // MARK: - Step 0: Choose Provider

    private var chooseStep: some View {
        VStack(alignment: .leading, spacing: Theme.spacingMD) {
            Text("Choose Certification")
                .subheadingFont(size: 20)
                .foregroundStyle(Color.ppTextPrimary)

            Text("Select the certification body you want to verify your credentials with.")
                .bodyFont(size: 14)
                .foregroundStyle(Color.ppTextSecondary)

            if let error = errorMessage {
                errorBanner(error)
            }

            ForEach(providers) { provider in
                let isVerified = existingVerifications.contains { $0.provider == provider.id }
                Button {
                    if !isVerified {
                        selectedProvider = provider
                        withAnimation { step = 1 }
                    }
                } label: {
                    HStack(spacing: Theme.spacingMD) {
                        Image(systemName: provider.icon)
                            .font(.system(size: 28))
                            .foregroundStyle(isVerified ? Color.ppSuccess : Color.ppAccent)

                        VStack(alignment: .leading, spacing: 2) {
                            Text(provider.name)
                                .subheadingFont(size: 16)
                                .foregroundStyle(Color.ppTextPrimary)
                            Text(provider.description)
                                .bodyFont(size: 12)
                                .foregroundStyle(Color.ppTextSecondary)
                        }

                        Spacer()

                        if isVerified {
                            Label("Verified", systemImage: "checkmark.seal.fill")
                                .bodyFont(size: 12)
                                .foregroundStyle(Color.ppSuccess)
                        } else {
                            Image(systemName: "chevron.right")
                                .foregroundStyle(Color.ppTextMuted)
                        }
                    }
                    .cardStyle()
                }
                .disabled(isVerified)
            }
        }
    }

    // MARK: - Step 1: Prove

    private var proveStep: some View {
        VStack(spacing: Theme.spacingLG) {
            if let provider = selectedProvider {
                Image(systemName: "hand.raised.fill")
                    .font(.system(size: 40))
                    .foregroundStyle(Color.ppAccent)

                Text("Verify with \(provider.name)")
                    .headingFont(size: 24)
                    .foregroundStyle(Color.ppTextPrimary)

                Text("You'll be redirected to verify your certification through our zero-knowledge proof system. Your sensitive data never leaves your device.")
                    .bodyFont(size: 14)
                    .foregroundStyle(Color.ppTextSecondary)
                    .multilineTextAlignment(.center)

                VStack(alignment: .leading, spacing: Theme.spacingSM) {
                    HStack(spacing: 8) {
                        Image(systemName: "lock.shield")
                            .foregroundStyle(Color.ppSuccess)
                        Text("Your login credentials are never shared")
                            .bodyFont(size: 13)
                            .foregroundStyle(Color.ppTextSecondary)
                    }
                    HStack(spacing: 8) {
                        Image(systemName: "checkmark.shield")
                            .foregroundStyle(Color.ppSuccess)
                        Text("Only the proof of certification is stored")
                            .bodyFont(size: 13)
                            .foregroundStyle(Color.ppTextSecondary)
                    }
                    HStack(spacing: 8) {
                        Image(systemName: "link")
                            .foregroundStyle(Color.ppSuccess)
                        Text("Verification is stored on-chain as an NFT badge")
                            .bodyFont(size: 13)
                            .foregroundStyle(Color.ppTextSecondary)
                    }
                }
                .cardStyle()

                if isProving {
                    ProgressView("Generating proof...")
                        .foregroundStyle(Color.ppTextSecondary)
                } else {
                    Button {
                        Task { await startProof() }
                    } label: {
                        Text("Start Verification")
                            .bodyFont(size: 15)
                            .foregroundStyle(.white)
                            .frame(maxWidth: .infinity)
                            .frame(height: Theme.buttonHeight)
                            .background(Color.ppAccent)
                            .cornerRadius(Theme.radiusLG)
                    }
                }

                Button {
                    withAnimation { step = 0 }
                    selectedProvider = nil
                } label: {
                    Text("Back")
                        .bodyFont(size: 14)
                        .foregroundStyle(Color.ppTextMuted)
                }
            }
        }
    }

    // MARK: - Step 2: Submit

    private var submitStep: some View {
        VStack(spacing: Theme.spacingLG) {
            Image(systemName: "paperplane.fill")
                .font(.system(size: 40))
                .foregroundStyle(Color.ppAccent)

            Text("Submitting On-Chain")
                .headingFont(size: 24)
                .foregroundStyle(Color.ppTextPrimary)

            Text("Minting your certification badge as an NFT on the XION blockchain...")
                .bodyFont(size: 14)
                .foregroundStyle(Color.ppTextSecondary)
                .multilineTextAlignment(.center)

            if isSubmitting {
                ProgressView()
                    .padding()
            }

            if let error = errorMessage {
                errorBanner(error)
                Button {
                    Task { await submitOnChain() }
                } label: {
                    Text("Retry")
                        .bodyFont(size: 14)
                        .foregroundStyle(Color.ppAccent)
                }
            }
        }
    }

    // MARK: - Step 3: Success

    private var successStep: some View {
        VStack(spacing: Theme.spacingMD) {
            Image(systemName: "checkmark.seal.fill")
                .font(.system(size: 56))
                .foregroundStyle(Color.ppSuccess)

            Text("Verified!")
                .headingFont(size: 28)
                .foregroundStyle(Color.ppTextPrimary)

            if let provider = selectedProvider {
                Text("Your \(provider.name) certification has been verified and minted as an NFT badge.")
                    .bodyFont(size: 14)
                    .foregroundStyle(Color.ppTextSecondary)
                    .multilineTextAlignment(.center)
            }

            if let tx = txHash {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Transaction Hash")
                        .bodyFont(size: 12)
                        .foregroundStyle(Color.ppTextMuted)
                    Text(tx)
                        .font(.system(size: 11, design: .monospaced))
                        .foregroundStyle(Color.ppTextSecondary)
                        .lineLimit(1)
                        .truncationMode(.middle)
                }
                .cardStyle()
            }

            Button {
                step = 0
                selectedProvider = nil
                txHash = nil
                errorMessage = nil
            } label: {
                Text("Verify Another")
                    .bodyFont(size: 15)
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .frame(height: Theme.buttonHeight)
                    .background(Color.ppAccent)
                    .cornerRadius(Theme.radiusLG)
            }
            .padding(.top, Theme.spacingMD)
        }
    }

    // MARK: - Actions

    private func startProof() async {
        isProving = true
        errorMessage = nil

        // TODO: Integrate Reclaim Protocol native SDK
        // For now, simulate the proof generation
        try? await Task.sleep(nanoseconds: 2_000_000_000) // 2 seconds

        isProving = false
        withAnimation { step = 2 }
        await submitOnChain()
    }

    private func submitOnChain() async {
        isSubmitting = true
        errorMessage = nil

        // TODO: Use mob SDK to submit transaction to Clearance contract
        // For now, simulate the on-chain submission
        try? await Task.sleep(nanoseconds: 2_000_000_000) // 2 seconds

        // Simulated success
        txHash = "SIMULATED_TX_\(UUID().uuidString.prefix(8))"
        isSubmitting = false
        withAnimation { step = 3 }
    }

    // MARK: - Helpers

    private func errorBanner(_ message: String) -> some View {
        HStack(spacing: Theme.spacingSM) {
            Image(systemName: "exclamationmark.triangle")
                .foregroundStyle(Color.ppError)
            Text(message)
                .bodyFont(size: 13)
                .foregroundStyle(Color.ppError)
        }
        .padding(Theme.spacingSM)
        .background(Color.ppError.opacity(0.1))
        .cornerRadius(Theme.radiusSM)
    }
}

#Preview {
    VerifyScreen()
        .environment(AuthService(config: .load(), supabase: SupabaseService(config: .load())))
        .environment(SupabaseService(config: .load()))
}
