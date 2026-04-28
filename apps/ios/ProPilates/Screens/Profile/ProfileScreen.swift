import SwiftUI

struct ProfileScreen: View {
    @Environment(AuthService.self) private var auth
    @Environment(SupabaseService.self) private var supabase
    @Environment(XionService.self) private var xion
    @Environment(PaymentService.self) private var payment

    @State private var verifications: [Verification] = []
    @State private var subscription: Subscription?
    @State private var usdcBalance: String = "0.00"
    @State private var isLoading = true
    @State private var isPurchasing = false
    @State private var purchaseError: String?
    @State private var showPurchaseSuccess = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: Theme.spacingLG) {
                    if isLoading {
                        ProgressView()
                            .padding(.top, Theme.spacingXXL)
                    } else if let instructor = auth.instructor {
                        profileHeader(instructor)
                        infoCards(instructor)
                        practiceDetails(instructor)
                        logoutButton
                    } else if auth.isConnected {
                        connectedButNoProfile
                        logoutButton
                    }
                }
                .padding(.bottom, Theme.spacingXL)
            }
            .background(Color.ppBackground)
            .navigationTitle("Profile")
            #if os(iOS)
            .toolbarTitleDisplayMode(.large)
            #endif
            .task {
                await loadProfileData()
            }
            .alert("Upgrade Successful", isPresented: $showPurchaseSuccess) {
                Button("OK", role: .cancel) {}
            } message: {
                Text("Welcome to Premium! You now have full access to all features.")
            }
            .alert("Payment Error", isPresented: .init(
                get: { purchaseError != nil },
                set: { if !$0 { purchaseError = nil } }
            )) {
                Button("OK", role: .cancel) {}
            } message: {
                Text(purchaseError ?? "")
            }
        }
    }

    // MARK: - Profile Header

    private func profileHeader(_ instructor: Instructor) -> some View {
        VStack(spacing: Theme.spacingMD) {
            // Avatar
            ZStack {
                Circle()
                    .fill(
                        instructor.tier == .premium
                            ? LinearGradient(colors: [Color.ppAccent, Color.ppSecondary], startPoint: .topLeading, endPoint: .bottomTrailing)
                            : LinearGradient(colors: [Color.ppBackgroundElevated, Color.ppBackgroundElevated], startPoint: .topLeading, endPoint: .bottomTrailing)
                    )
                    .frame(width: 80, height: 80)

                Text(String(instructor.name.prefix(1)).uppercased())
                    .headingFont(size: 32)
                    .foregroundStyle(instructor.tier == .premium ? .white : Color.ppTextPrimary)
            }

            Text(instructor.name)
                .headingFont(size: 28)
                .foregroundStyle(Color.ppTextPrimary)

            HStack(spacing: Theme.spacingSM) {
                tierBadge(instructor.tier)

                if !instructor.location.isEmpty {
                    Text("•")
                        .foregroundStyle(Color.ppTextMuted)
                    Label(instructor.location, systemImage: "mappin")
                        .bodyFont(size: 13)
                        .foregroundStyle(Color.ppTextSecondary)
                }
            }

            if !instructor.bio.isEmpty {
                Text(instructor.bio)
                    .bodyFont(size: 14)
                    .foregroundStyle(Color.ppTextSecondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, Theme.spacingLG)
            }

            if !instructor.languages.isEmpty {
                HStack(spacing: 6) {
                    Image(systemName: "globe")
                        .font(.system(size: 13))
                        .foregroundStyle(Color.ppTextMuted)
                    Text(instructor.languages.joined(separator: ", "))
                        .bodyFont(size: 13)
                        .foregroundStyle(Color.ppTextMuted)
                }
            }

            if let address = instructor.xionAddress {
                Text(address)
                    .font(.system(size: 11, design: .monospaced))
                    .foregroundStyle(Color.ppTextMuted)
                    .lineLimit(1)
                    .truncationMode(.middle)
                    .padding(.horizontal, Theme.spacingXL)
            }
        }
        .padding(.horizontal, Theme.spacingMD)
    }

    // MARK: - Info Cards

    private func infoCards(_ instructor: Instructor) -> some View {
        VStack(spacing: Theme.spacingMD) {
            HStack(spacing: Theme.spacingMD) {
                // Balance Card
                VStack(alignment: .leading, spacing: Theme.spacingSM) {
                    Label("Balance", systemImage: "dollarsign.circle")
                        .bodyFont(size: 13)
                        .foregroundStyle(Color.ppTextMuted)

                    Text("$\(usdcBalance)")
                        .headingFont(size: 24)
                        .foregroundStyle(Color.ppTextPrimary)

                    Text("USDC")
                        .bodyFont(size: 12)
                        .foregroundStyle(Color.ppTextMuted)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .cardStyle()

                // Subscription Card
                VStack(alignment: .leading, spacing: Theme.spacingSM) {
                    Label("Subscription", systemImage: "star.circle")
                        .bodyFont(size: 13)
                        .foregroundStyle(Color.ppTextMuted)

                    if let sub = subscription {
                        Text(sub.tier.rawValue.capitalized)
                            .subheadingFont(size: 18)
                            .foregroundStyle(Color.ppAccent)

                        Text("Active")
                            .bodyFont(size: 12)
                            .foregroundStyle(Color.ppSuccess)
                    } else {
                        Text("Free")
                            .subheadingFont(size: 18)
                            .foregroundStyle(Color.ppTextPrimary)

                        Button {
                            Task { await purchaseSubscription() }
                        } label: {
                            if isPurchasing {
                                ProgressView()
                                    .controlSize(.small)
                            } else {
                                Text("Upgrade $4.99/mo")
                                    .bodyFont(size: 11)
                                    .foregroundStyle(.white)
                            }
                        }
                        .frame(maxWidth: .infinity)
                        .frame(height: 28)
                        .background(Color.ppAccent)
                        .cornerRadius(Theme.radiusSM)
                        .disabled(isPurchasing)
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .cardStyle()
            }

            // Certifications Card
            VStack(alignment: .leading, spacing: Theme.spacingMD) {
                HStack {
                    Label("Certifications", systemImage: "checkmark.seal")
                        .bodyFont(size: 13)
                        .foregroundStyle(Color.ppTextMuted)

                    Spacer()

                    NavigationLink("Verify More") {
                        // Will be VerifyScreen later
                        Text("Verification")
                    }
                    .bodyFont(size: 13)
                    .foregroundStyle(Color.ppAccent)
                }

                if verifications.isEmpty {
                    VStack(spacing: Theme.spacingSM) {
                        Image(systemName: "checkmark.seal")
                            .font(.system(size: 24))
                            .foregroundStyle(Color.ppTextMuted)
                        Text("No certifications verified yet")
                            .bodyFont(size: 13)
                            .foregroundStyle(Color.ppTextMuted)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, Theme.spacingMD)
                    .background(
                        RoundedRectangle(cornerRadius: Theme.radiusSM)
                            .strokeBorder(style: StrokeStyle(lineWidth: 1, dash: [6]))
                            .foregroundStyle(Color.ppBorder)
                    )
                } else {
                    ForEach(verifications) { v in
                        HStack {
                            VStack(alignment: .leading, spacing: 2) {
                                Text(v.provider.capitalized)
                                    .bodyFont(size: 14)
                                    .foregroundStyle(Color.ppTextPrimary)
                                Text(v.verifiedAt)
                                    .bodyFont(size: 11)
                                    .foregroundStyle(Color.ppTextMuted)
                            }

                            Spacer()

                            if v.onChain {
                                Label("On-chain", systemImage: "checkmark.circle.fill")
                                    .bodyFont(size: 12)
                                    .foregroundStyle(Color.ppSuccess)
                            } else {
                                Text("Pending")
                                    .bodyFont(size: 12)
                                    .foregroundStyle(Color.ppTextMuted)
                            }
                        }
                    }
                }
            }
            .cardStyle()
        }
        .padding(.horizontal, Theme.spacingMD)
    }

    // MARK: - Practice Details

    private func practiceDetails(_ instructor: Instructor) -> some View {
        VStack(alignment: .leading, spacing: Theme.spacingMD) {
            Text("Practice Details")
                .subheadingFont(size: 18)
                .foregroundStyle(Color.ppTextPrimary)

            // Methods
            if !instructor.methods.isEmpty {
                VStack(alignment: .leading, spacing: Theme.spacingSM) {
                    Text("Methods")
                        .bodyFont(size: 13)
                        .foregroundStyle(Color.ppTextMuted)

                    FlowLayout(spacing: 6) {
                        ForEach(instructor.methods, id: \.self) { method in
                            Text(methodDisplayName(method))
                                .bodyFont(size: 12)
                                .foregroundStyle(Color.ppAccent)
                                .padding(.horizontal, 10)
                                .padding(.vertical, 4)
                                .background(Color.ppAccent.opacity(0.1))
                                .cornerRadius(Theme.radiusFull)
                        }
                    }
                }
            }

            // Class Types
            if !instructor.classTypes.isEmpty {
                VStack(alignment: .leading, spacing: Theme.spacingSM) {
                    Text("Class Types")
                        .bodyFont(size: 13)
                        .foregroundStyle(Color.ppTextMuted)

                    FlowLayout(spacing: 6) {
                        ForEach(instructor.classTypes, id: \.self) { classType in
                            Text(classType.rawValue.capitalized)
                                .bodyFont(size: 12)
                                .foregroundStyle(Color.ppTextSecondary)
                                .padding(.horizontal, 10)
                                .padding(.vertical, 4)
                                .background(Color.ppBackgroundElevated)
                                .cornerRadius(Theme.radiusFull)
                        }
                    }
                }
            }

            // Music Style
            if !instructor.musicStyle.isEmpty {
                VStack(alignment: .leading, spacing: Theme.spacingSM) {
                    Text("Music Preferences")
                        .bodyFont(size: 13)
                        .foregroundStyle(Color.ppTextMuted)
                    Text(instructor.musicStyle)
                        .bodyFont(size: 14)
                        .foregroundStyle(Color.ppTextSecondary)
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardStyle()
        .padding(.horizontal, Theme.spacingMD)
    }

    // MARK: - Connected but no profile

    private var connectedButNoProfile: some View {
        VStack(spacing: Theme.spacingMD) {
            Image(systemName: "person.crop.circle.badge.plus")
                .font(.system(size: 40))
                .foregroundStyle(Color.ppAccent)

            Text("Complete Your Profile")
                .headingFont(size: 24)
                .foregroundStyle(Color.ppTextPrimary)

            Text("Set up your instructor profile to get started")
                .bodyFont(size: 14)
                .foregroundStyle(Color.ppTextSecondary)

            if let address = auth.xionAddress {
                Text(address)
                    .font(.system(size: 11, design: .monospaced))
                    .foregroundStyle(Color.ppTextMuted)
                    .lineLimit(1)
                    .truncationMode(.middle)
                    .padding(.horizontal, Theme.spacingXL)
            }
        }
        .padding(.top, Theme.spacingXXL)
    }

    // MARK: - Logout

    private var logoutButton: some View {
        Button {
            auth.logout()
        } label: {
            Text("Log Out")
                .font(.system(size: 16, weight: .semibold))
                .foregroundStyle(Color.ppError)
                .frame(maxWidth: .infinity)
                .frame(height: 50)
                .background(Color.ppBackgroundCard)
                .cornerRadius(Theme.radiusLG)
                .overlay(
                    RoundedRectangle(cornerRadius: Theme.radiusLG)
                        .stroke(Color.ppBorder, lineWidth: 1)
                )
        }
        .padding(.horizontal, Theme.spacingMD)
        .padding(.top, Theme.spacingMD)
    }

    // MARK: - Helpers

    private func tierBadge(_ tier: Tier) -> some View {
        Text(tier.rawValue.capitalized)
            .bodyFont(size: 12)
            .foregroundStyle(tier == .premium ? Color.ppAccent : Color.ppTextMuted)
            .padding(.horizontal, 8)
            .padding(.vertical, 3)
            .background(
                tier == .premium
                    ? Color.ppAccent.opacity(0.12)
                    : Color.ppBackgroundElevated
            )
            .cornerRadius(Theme.radiusFull)
    }

    private func methodDisplayName(_ method: PilatesMethod) -> String {
        switch method {
        case .mat: return "Mat"
        case .reformer: return "Reformer"
        case .xReformer: return "X-Reformer"
        case .chair: return "Chair"
        case .tower: return "Tower"
        case .barrel: return "Barrel"
        case .ring: return "Ring"
        case .band: return "Band"
        case .foamRoller: return "Foam Roller"
        }
    }

    @MainActor
    private func purchaseSubscription() async {
        guard let instructor = auth.instructor else { return }
        isPurchasing = true
        defer { isPurchasing = false }

        do {
            _ = try await payment.purchaseSubscription(instructorId: instructor.id)
            showPurchaseSuccess = true
            // Reload subscription status
            subscription = try? await supabase.fetchLatestSubscription(instructorId: instructor.id)
        } catch let error as PaymentError where error.errorDescription?.contains("cancelled") == true {
            // User cancelled — do nothing
        } catch {
            purchaseError = error.localizedDescription
        }
    }

    private func loadProfileData() async {
        defer { isLoading = false }

        guard let instructor = auth.instructor else { return }

        async let fetchVerifications = supabase.fetchVerifications(instructorId: instructor.id)
        async let fetchSubscription = supabase.fetchLatestSubscription(instructorId: instructor.id)

        do {
            verifications = try await fetchVerifications
            subscription = try await fetchSubscription
        } catch {
            print("[ProfileScreen] Failed to load data: \(error)")
        }

        if let address = instructor.xionAddress {
            do {
                usdcBalance = try await xion.getBalance(address: address)
            } catch {
                print("[ProfileScreen] Failed to fetch balance: \(error)")
            }
        }
    }
}

// MARK: - Flow Layout (for tag pills)

struct FlowLayout: Layout {
    var spacing: CGFloat = 6

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let result = computeLayout(proposal: proposal, subviews: subviews)
        return result.size
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let result = computeLayout(proposal: proposal, subviews: subviews)
        for (index, offset) in result.offsets.enumerated() {
            subviews[index].place(at: CGPoint(x: bounds.minX + offset.x, y: bounds.minY + offset.y), proposal: .unspecified)
        }
    }

    private func computeLayout(proposal: ProposedViewSize, subviews: Subviews) -> (offsets: [CGPoint], size: CGSize) {
        let maxWidth = proposal.width ?? .infinity
        var offsets: [CGPoint] = []
        var currentX: CGFloat = 0
        var currentY: CGFloat = 0
        var lineHeight: CGFloat = 0

        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            if currentX + size.width > maxWidth, currentX > 0 {
                currentX = 0
                currentY += lineHeight + spacing
                lineHeight = 0
            }
            offsets.append(CGPoint(x: currentX, y: currentY))
            lineHeight = max(lineHeight, size.height)
            currentX += size.width + spacing
        }

        return (offsets, CGSize(width: maxWidth, height: currentY + lineHeight))
    }
}

#Preview {
    ProfileScreen()
        .environment(AuthService(config: .load(), supabase: SupabaseService(config: .load())))
        .environment(SupabaseService(config: .load()))
        .environment(XionService(config: .load()))
        .environment(PaymentService(config: .load()))
}
