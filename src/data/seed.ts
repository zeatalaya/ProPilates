/**
 * Run with: npx tsx src/data/seed.ts
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars.
 */
import { createClient } from "@supabase/supabase-js";
import { exercises } from "./exercises";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

async function seed() {
  console.log(`Seeding ${exercises.length} exercises...`);

  const { error } = await supabase.from("exercises").upsert(
    exercises.map((ex) => ({
      name: ex.name,
      method: ex.method,
      category: ex.category,
      difficulty: ex.difficulty,
      muscle_groups: ex.muscle_groups,
      description: ex.description,
      cues: ex.cues,
      default_duration: ex.default_duration,
    })),
    { onConflict: "name" },
  );

  if (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }

  console.log("Seed complete!");
}

seed();
