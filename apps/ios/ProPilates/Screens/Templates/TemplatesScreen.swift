import SwiftUI

struct TemplatesScreen: View {
    @Environment(SupabaseService.self) private var supabase

    @State private var templates: [PilatesClass] = []
    @State private var isLoading = true
    @State private var filterMethod: PilatesMethod?

    var filteredTemplates: [PilatesClass] {
        guard let method = filterMethod else { return templates }
        return templates.filter { $0.method == method }
    }

    var body: some View {
        NavigationStack {
            ZStack {
                Color.ppBackground.ignoresSafeArea()

                if isLoading {
                    ProgressView("Loading templates...")
                        .foregroundStyle(Color.ppTextSecondary)
                } else if templates.isEmpty {
                    VStack(spacing: Theme.spacingMD) {
                        Image(systemName: "book.closed")
                            .font(.system(size: 40))
                            .foregroundStyle(Color.ppTextMuted)
                        Text("No Templates Available")
                            .headingFont(size: 22)
                            .foregroundStyle(Color.ppTextPrimary)
                    }
                } else {
                    ScrollView {
                        VStack(spacing: Theme.spacingMD) {
                            // Method filter
                            ScrollView(.horizontal, showsIndicators: false) {
                                HStack(spacing: 6) {
                                    filterPill("All", isActive: filterMethod == nil) { filterMethod = nil }
                                    ForEach(PilatesMethod.allCases, id: \.self) { method in
                                        filterPill(methodDisplayName(method), isActive: filterMethod == method) { filterMethod = method }
                                    }
                                }
                            }

                            ForEach(filteredTemplates, id: \.id) { template in
                                NavigationLink {
                                    TemplateDetailView(template: template)
                                } label: {
                                    templateCard(template)
                                }
                            }
                        }
                        .padding(Theme.spacingMD)
                    }
                }
            }
            .navigationTitle("Class Templates")
            #if os(iOS)
            .toolbarTitleDisplayMode(.large)
            #endif
            .task { await loadTemplates() }
            .refreshable { await loadTemplates() }
        }
    }

    private func templateCard(_ pc: PilatesClass) -> some View {
        VStack(alignment: .leading, spacing: Theme.spacingSM) {
            Text(pc.title)
                .subheadingFont(size: 18)
                .foregroundStyle(Color.ppTextPrimary)

            Text(pc.description)
                .bodyFont(size: 13)
                .foregroundStyle(Color.ppTextSecondary)
                .lineLimit(2)

            HStack(spacing: 6) {
                badge(methodDisplayName(pc.method), color: .ppAccent)
                badge(pc.difficulty.rawValue.capitalized, color: difficultyColor(pc.difficulty))
                badge("\(pc.durationMinutes) min", color: .ppTextSecondary)

                if let blocks = pc.blocks {
                    let exCount = blocks.flatMap(\.exercises).count
                    badge("\(exCount) exercises", color: .ppTextMuted)
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardStyle()
    }

    private func loadTemplates() async {
        isLoading = true
        defer { isLoading = false }
        do {
            templates = try await supabase.fetchTemplateClasses()
        } catch {
            print("[TemplatesScreen] Error: \(error)")
        }
    }

    private func badge(_ text: String, color: Color) -> some View {
        Text(text).bodyFont(size: 11).foregroundStyle(color)
            .padding(.horizontal, 8).padding(.vertical, 3)
            .background(color.opacity(0.1)).cornerRadius(Theme.radiusFull)
    }

    private func filterPill(_ title: String, isActive: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(title).bodyFont(size: 12)
                .foregroundStyle(isActive ? .white : Color.ppTextSecondary)
                .padding(.horizontal, 12).padding(.vertical, 6)
                .background(isActive ? Color.ppAccent : Color.ppBackgroundCard)
                .cornerRadius(Theme.radiusFull)
                .overlay(RoundedRectangle(cornerRadius: Theme.radiusFull).stroke(isActive ? Color.ppAccent : Color.ppBorder, lineWidth: 1))
        }
    }

    private func difficultyColor(_ d: Difficulty) -> Color {
        switch d { case .beginner: return .ppSuccess; case .intermediate: return .ppAccent; case .advanced: return .ppError }
    }

    private func methodDisplayName(_ m: PilatesMethod) -> String {
        switch m {
        case .mat: return "Mat"; case .reformer: return "Reformer"; case .xReformer: return "X-Reformer"
        case .chair: return "Chair"; case .tower: return "Tower"; case .barrel: return "Barrel"
        case .ring: return "Ring"; case .band: return "Band"; case .foamRoller: return "Foam Roller"
        }
    }
}

// MARK: - Template Detail

struct TemplateDetailView: View {
    let template: PilatesClass

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Theme.spacingMD) {
                Text(template.title)
                    .headingFont(size: 28)
                    .foregroundStyle(Color.ppTextPrimary)

                Text(template.description)
                    .bodyFont(size: 14)
                    .foregroundStyle(Color.ppTextSecondary)

                HStack(spacing: Theme.spacingLG) {
                    VStack(spacing: 2) {
                        Text("\(template.durationMinutes)")
                            .subheadingFont(size: 20)
                            .foregroundStyle(Color.ppTextPrimary)
                        Text("minutes")
                            .bodyFont(size: 11)
                            .foregroundStyle(Color.ppTextMuted)
                    }
                    .frame(maxWidth: .infinity)

                    VStack(spacing: 2) {
                        Text("\(template.blocks?.count ?? 0)")
                            .subheadingFont(size: 20)
                            .foregroundStyle(Color.ppTextPrimary)
                        Text("blocks")
                            .bodyFont(size: 11)
                            .foregroundStyle(Color.ppTextMuted)
                    }
                    .frame(maxWidth: .infinity)

                    VStack(spacing: 2) {
                        let count = template.blocks?.flatMap(\.exercises).count ?? 0
                        Text("\(count)")
                            .subheadingFont(size: 20)
                            .foregroundStyle(Color.ppTextPrimary)
                        Text("exercises")
                            .bodyFont(size: 11)
                            .foregroundStyle(Color.ppTextMuted)
                    }
                    .frame(maxWidth: .infinity)
                }
                .cardStyle()

                if let blocks = template.blocks {
                    ForEach(blocks, id: \.id) { block in
                        VStack(alignment: .leading, spacing: Theme.spacingSM) {
                            Text(block.name)
                                .subheadingFont(size: 16)
                                .foregroundStyle(Color.ppAccent)

                            ForEach(block.exercises, id: \.id) { ex in
                                HStack {
                                    VStack(alignment: .leading, spacing: 2) {
                                        Text(ex.exercise?.name ?? "Exercise")
                                            .bodyFont(size: 14)
                                            .foregroundStyle(Color.ppTextPrimary)
                                        if !ex.notes.isEmpty {
                                            Text(ex.notes)
                                                .bodyFont(size: 11)
                                                .foregroundStyle(Color.ppTextMuted)
                                        }
                                    }
                                    Spacer()
                                    Text("\(ex.duration / 60):\(String(format: "%02d", ex.duration % 60))")
                                        .bodyFont(size: 12)
                                        .foregroundStyle(Color.ppTextMuted)
                                }
                            }
                        }
                        .cardStyle()
                    }
                }
            }
            .padding(Theme.spacingMD)
        }
        .background(Color.ppBackground)
        .navigationTitle(template.title)
        #if os(iOS)
        .navigationBarTitleDisplayMode(.inline)
        #endif
    }
}

#Preview {
    TemplatesScreen()
        .environment(SupabaseService(config: .load()))
}
