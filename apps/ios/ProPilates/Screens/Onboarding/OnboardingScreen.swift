import SwiftUI

struct OnboardingScreen: View {
    @Environment(AuthService.self) private var auth
    @Environment(SupabaseService.self) private var supabase
    @Environment(\.dismiss) private var dismiss

    @State private var currentStep = 0
    @State private var isSaving = false
    @State private var errorMessage: String?

    // Step 0: Personal
    @State private var name = ""
    @State private var bio = ""
    @State private var location = ""
    @State private var languages: [String] = ["English"]

    // Step 1: Practice
    @State private var selectedMethods: Set<PilatesMethod> = []
    @State private var selectedClassTypes: Set<ClassType> = []

    // Step 2: Music
    @State private var musicStyle = ""

    private let steps = ["Personal", "Practice", "Music", "Confirm"]

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                stepIndicator
                    .padding(.horizontal, Theme.spacingMD)
                    .padding(.top, Theme.spacingMD)

                ScrollView {
                    VStack(spacing: Theme.spacingLG) {
                        switch currentStep {
                        case 0: personalStep
                        case 1: practiceStep
                        case 2: musicStep
                        case 3: confirmStep
                        default: EmptyView()
                        }
                    }
                    .padding(Theme.spacingMD)
                }

                navigationButtons
                    .padding(Theme.spacingMD)
            }
            .background(Color.ppBackground)
            .navigationTitle("Get Started")
            #if os(iOS)
            .toolbarTitleDisplayMode(.inline)
            #endif
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                        .foregroundStyle(Color.ppTextMuted)
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
                            .fill(index <= currentStep ? Color.ppAccent : Color.ppBackgroundElevated)
                            .frame(width: 28, height: 28)

                        Text("\(index + 1)")
                            .bodyFont(size: 13)
                            .foregroundStyle(index <= currentStep ? .white : Color.ppTextMuted)
                    }

                    Text(steps[index])
                        .bodyFont(size: 10)
                        .foregroundStyle(index <= currentStep ? Color.ppTextPrimary : Color.ppTextMuted)
                }
                .frame(maxWidth: .infinity)

                if index < steps.count - 1 {
                    Rectangle()
                        .fill(index < currentStep ? Color.ppAccent : Color.ppBorder)
                        .frame(height: 2)
                        .padding(.bottom, 16)
                }
            }
        }
    }

    // MARK: - Step 0: Personal

    private var personalStep: some View {
        VStack(alignment: .leading, spacing: Theme.spacingMD) {
            Text("Personal Information")
                .subheadingFont(size: 20)
                .foregroundStyle(Color.ppTextPrimary)

            formField(label: "Name", text: $name, placeholder: "Your full name")
            formField(label: "Bio", text: $bio, placeholder: "Tell us about your practice", isMultiline: true)
            formField(label: "Location", text: $location, placeholder: "City, Country")

            VStack(alignment: .leading, spacing: Theme.spacingSM) {
                Text("Languages")
                    .bodyFont(size: 13)
                    .foregroundStyle(Color.ppTextMuted)

                Text(languages.joined(separator: ", "))
                    .bodyFont(size: 14)
                    .foregroundStyle(Color.ppTextSecondary)
                    .padding(12)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color.ppBackgroundCard)
                    .cornerRadius(Theme.radiusSM)
                    .overlay(
                        RoundedRectangle(cornerRadius: Theme.radiusSM)
                            .stroke(Color.ppBorder, lineWidth: 1)
                    )
            }
        }
    }

    // MARK: - Step 1: Practice

    private var practiceStep: some View {
        VStack(alignment: .leading, spacing: Theme.spacingLG) {
            Text("Your Practice")
                .subheadingFont(size: 20)
                .foregroundStyle(Color.ppTextPrimary)

            VStack(alignment: .leading, spacing: Theme.spacingSM) {
                Text("Methods")
                    .bodyFont(size: 13)
                    .foregroundStyle(Color.ppTextMuted)

                FlowLayout(spacing: 8) {
                    ForEach(PilatesMethod.allCases, id: \.self) { method in
                        togglePill(
                            title: methodDisplayName(method),
                            isSelected: selectedMethods.contains(method),
                            action: { toggleMethod(method) }
                        )
                    }
                }
            }

            VStack(alignment: .leading, spacing: Theme.spacingSM) {
                Text("Class Types")
                    .bodyFont(size: 13)
                    .foregroundStyle(Color.ppTextMuted)

                FlowLayout(spacing: 8) {
                    ForEach(ClassType.allCases, id: \.self) { classType in
                        togglePill(
                            title: classType.rawValue.capitalized,
                            isSelected: selectedClassTypes.contains(classType),
                            action: { toggleClassType(classType) }
                        )
                    }
                }
            }
        }
    }

    // MARK: - Step 2: Music

    private var musicStep: some View {
        VStack(alignment: .leading, spacing: Theme.spacingMD) {
            Text("Music Preferences")
                .subheadingFont(size: 20)
                .foregroundStyle(Color.ppTextPrimary)

            Text("What kind of music do you like to teach with?")
                .bodyFont(size: 14)
                .foregroundStyle(Color.ppTextSecondary)

            formField(label: "Music Style", text: $musicStyle, placeholder: "e.g., Ambient, Classical, Lo-fi")
        }
    }

    // MARK: - Step 3: Confirm

    private var confirmStep: some View {
        VStack(alignment: .leading, spacing: Theme.spacingMD) {
            Text("Review Your Profile")
                .subheadingFont(size: 20)
                .foregroundStyle(Color.ppTextPrimary)

            if let error = errorMessage {
                HStack(spacing: Theme.spacingSM) {
                    Image(systemName: "exclamationmark.triangle")
                        .foregroundStyle(Color.ppError)
                    Text(error)
                        .bodyFont(size: 13)
                        .foregroundStyle(Color.ppError)
                }
                .padding(Theme.spacingSM)
                .background(Color.ppError.opacity(0.1))
                .cornerRadius(Theme.radiusSM)
            }

            Group {
                confirmRow(label: "Name", value: name)
                confirmRow(label: "Location", value: location)
                confirmRow(label: "Bio", value: bio)
                confirmRow(label: "Languages", value: languages.joined(separator: ", "))
                confirmRow(label: "Methods", value: selectedMethods.map { methodDisplayName($0) }.joined(separator: ", "))
                confirmRow(label: "Class Types", value: selectedClassTypes.map { $0.rawValue.capitalized }.joined(separator: ", "))
                confirmRow(label: "Music Style", value: musicStyle)
            }
        }
    }

    // MARK: - Navigation

    private var navigationButtons: some View {
        HStack(spacing: Theme.spacingMD) {
            if currentStep > 0 {
                Button {
                    withAnimation(.easeInOut(duration: Theme.animationDuration)) {
                        currentStep -= 1
                    }
                } label: {
                    Text("Back")
                        .bodyFont(size: 15)
                        .foregroundStyle(Color.ppTextSecondary)
                        .frame(maxWidth: .infinity)
                        .frame(height: Theme.buttonHeight)
                        .background(Color.ppBackgroundCard)
                        .cornerRadius(Theme.radiusLG)
                        .overlay(
                            RoundedRectangle(cornerRadius: Theme.radiusLG)
                                .stroke(Color.ppBorder, lineWidth: 1)
                        )
                }
            }

            Button {
                if currentStep < steps.count - 1 {
                    withAnimation(.easeInOut(duration: Theme.animationDuration)) {
                        currentStep += 1
                    }
                } else {
                    Task { await saveProfile() }
                }
            } label: {
                Group {
                    if isSaving {
                        ProgressView()
                            .tint(.white)
                    } else {
                        Text(currentStep < steps.count - 1 ? "Next" : "Create Profile")
                    }
                }
                .bodyFont(size: 15)
                .foregroundStyle(.white)
                .frame(maxWidth: .infinity)
                .frame(height: Theme.buttonHeight)
                .background(nextButtonEnabled ? Color.ppAccent : Color.ppAccent.opacity(0.5))
                .cornerRadius(Theme.radiusLG)
            }
            .disabled(!nextButtonEnabled || isSaving)
        }
    }

    private var nextButtonEnabled: Bool {
        switch currentStep {
        case 0: return !name.trimmingCharacters(in: .whitespaces).isEmpty
        case 1: return !selectedMethods.isEmpty
        default: return true
        }
    }

    // MARK: - Save

    private func saveProfile() async {
        guard let xionAddress = auth.xionAddress else {
            errorMessage = "No wallet connected. Please log in first."
            return
        }

        isSaving = true
        errorMessage = nil

        do {
            let data = InstructorUpsert(
                xionAddress: xionAddress,
                name: name,
                bio: bio,
                location: location,
                languages: languages,
                methods: Array(selectedMethods),
                classTypes: Array(selectedClassTypes),
                equipment: [],
                certifications: [],
                musicStyle: musicStyle,
                favoriteArtists: [],
                onboardingComplete: true
            )

            _ = try await supabase.upsertInstructor(data)
            await auth.fetchInstructorProfile(xionAddress: xionAddress)
            dismiss()
        } catch {
            errorMessage = "Failed to save profile: \(error.localizedDescription)"
        }

        isSaving = false
    }

    // MARK: - Subviews

    private func formField(label: String, text: Binding<String>, placeholder: String, isMultiline: Bool = false) -> some View {
        VStack(alignment: .leading, spacing: Theme.spacingSM) {
            Text(label)
                .bodyFont(size: 13)
                .foregroundStyle(Color.ppTextMuted)

            if isMultiline {
                TextEditor(text: text)
                    .bodyFont(size: 14)
                    .foregroundStyle(Color.ppTextPrimary)
                    .frame(minHeight: 80)
                    .padding(8)
                    .background(Color.ppBackgroundCard)
                    .cornerRadius(Theme.radiusSM)
                    .overlay(
                        RoundedRectangle(cornerRadius: Theme.radiusSM)
                            .stroke(Color.ppBorder, lineWidth: 1)
                    )
            } else {
                TextField(placeholder, text: text)
                    .bodyFont(size: 14)
                    .foregroundStyle(Color.ppTextPrimary)
                    .padding(12)
                    .background(Color.ppBackgroundCard)
                    .cornerRadius(Theme.radiusSM)
                    .overlay(
                        RoundedRectangle(cornerRadius: Theme.radiusSM)
                            .stroke(Color.ppBorder, lineWidth: 1)
                    )
            }
        }
    }

    private func togglePill(title: String, isSelected: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(title)
                .bodyFont(size: 13)
                .foregroundStyle(isSelected ? .white : Color.ppTextSecondary)
                .padding(.horizontal, 14)
                .padding(.vertical, 8)
                .background(isSelected ? Color.ppAccent : Color.ppBackgroundCard)
                .cornerRadius(Theme.radiusFull)
                .overlay(
                    RoundedRectangle(cornerRadius: Theme.radiusFull)
                        .stroke(isSelected ? Color.ppAccent : Color.ppBorder, lineWidth: 1)
                )
        }
    }

    private func confirmRow(label: String, value: String) -> some View {
        HStack(alignment: .top) {
            Text(label)
                .bodyFont(size: 13)
                .foregroundStyle(Color.ppTextMuted)
                .frame(width: 100, alignment: .leading)

            Text(value.isEmpty ? "—" : value)
                .bodyFont(size: 14)
                .foregroundStyle(Color.ppTextPrimary)
        }
        .padding(.vertical, 4)
    }

    // MARK: - Helpers

    private func toggleMethod(_ method: PilatesMethod) {
        if selectedMethods.contains(method) {
            selectedMethods.remove(method)
        } else {
            selectedMethods.insert(method)
        }
    }

    private func toggleClassType(_ classType: ClassType) {
        if selectedClassTypes.contains(classType) {
            selectedClassTypes.remove(classType)
        } else {
            selectedClassTypes.insert(classType)
        }
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
}

#Preview {
    OnboardingScreen()
        .environment(AuthService(config: .load(), supabase: SupabaseService(config: .load())))
        .environment(SupabaseService(config: .load()))
}
