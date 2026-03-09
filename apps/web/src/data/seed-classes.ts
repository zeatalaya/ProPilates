/**
 * Seed pre-built class templates into Supabase.
 * Run with: npx tsx src/data/seed-classes.ts
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars.
 * Must run AFTER seed.ts (exercises must exist first).
 */
import { createClient } from "@supabase/supabase-js";
import { classTemplates } from "./class-templates";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const SYSTEM_INSTRUCTOR_NAME = "ProPilates Templates";

async function getOrCreateSystemInstructor(): Promise<string> {
  // Check if system instructor exists
  const { data: existing } = await supabase
    .from("instructors")
    .select("id")
    .eq("name", SYSTEM_INSTRUCTOR_NAME)
    .single();

  if (existing) return existing.id;

  // Create system instructor
  const { data: created, error } = await supabase
    .from("instructors")
    .insert({
      name: SYSTEM_INSTRUCTOR_NAME,
      bio: "Pre-built class templates curated by the ProPilates team.",
      location: "Global",
      languages: ["en"],
      methods: ["mat", "reformer", "x-reformer"],
      class_types: ["group", "virtual"],
      equipment: [],
      certifications: [],
      music_style: "",
      favorite_artists: [],
      tier: "premium",
      onboarding_complete: true,
    })
    .select("id")
    .single();

  if (error || !created) {
    throw new Error(`Failed to create system instructor: ${error?.message}`);
  }

  return created.id;
}

async function seedClasses() {
  console.log("Seeding class templates...");

  // 1. Get or create system instructor
  const instructorId = await getOrCreateSystemInstructor();
  console.log(`System instructor ID: ${instructorId}`);

  // 2. Fetch all exercises by name
  const { data: exercises, error: exErr } = await supabase
    .from("exercises")
    .select("id, name");

  if (exErr || !exercises) {
    throw new Error(`Failed to fetch exercises: ${exErr?.message}`);
  }

  const exerciseMap = new Map(exercises.map((e) => [e.name, e.id]));
  console.log(`Found ${exerciseMap.size} exercises in database`);

  // 3. Delete existing templates (idempotent re-seed)
  const { data: existingTemplates } = await supabase
    .from("classes")
    .select("id")
    .eq("is_template", true);

  if (existingTemplates && existingTemplates.length > 0) {
    console.log(`Removing ${existingTemplates.length} existing templates...`);
    await supabase
      .from("classes")
      .delete()
      .eq("is_template", true);
  }

  // 4. Insert each template
  let successCount = 0;
  for (const template of classTemplates) {
    // Validate all exercise names exist
    const missingExercises: string[] = [];
    for (const block of template.blocks) {
      for (const ex of block.exercises) {
        if (!exerciseMap.has(ex.exercise_name)) {
          missingExercises.push(ex.exercise_name);
        }
      }
    }
    if (missingExercises.length > 0) {
      console.warn(
        `Skipping "${template.title}" — missing exercises: ${missingExercises.join(", ")}`,
      );
      continue;
    }

    // Insert class
    const { data: cls, error: clsErr } = await supabase
      .from("classes")
      .insert({
        instructor_id: instructorId,
        title: template.title,
        description: template.description,
        method: template.method,
        class_type: template.class_type,
        difficulty: template.difficulty,
        duration_minutes: template.duration_minutes,
        is_public: true,
        is_template: true,
        price: null,
      })
      .select("id")
      .single();

    if (clsErr || !cls) {
      console.error(`Failed to insert "${template.title}":`, clsErr?.message);
      continue;
    }

    // Insert blocks and exercises
    for (const block of template.blocks) {
      const { data: blk, error: blkErr } = await supabase
        .from("class_blocks")
        .insert({
          class_id: cls.id,
          name: block.name,
          order_index: block.order_index,
        })
        .select("id")
        .single();

      if (blkErr || !blk) {
        console.error(`Failed to insert block "${block.name}":`, blkErr?.message);
        continue;
      }

      for (const ex of block.exercises) {
        const exerciseId = exerciseMap.get(ex.exercise_name);
        if (!exerciseId) continue;

        await supabase.from("block_exercises").insert({
          block_id: blk.id,
          exercise_id: exerciseId,
          order_index: ex.order_index,
          duration: ex.duration,
          reps: ex.reps,
          side: ex.side,
          notes: ex.notes,
        });
      }
    }

    successCount++;
    console.log(`  Seeded: ${template.title}`);
  }

  console.log(`\nSeed complete! ${successCount}/${classTemplates.length} templates created.`);
}

seedClasses().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
