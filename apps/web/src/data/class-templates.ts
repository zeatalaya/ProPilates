import type { PilatesMethod, ClassType, Difficulty } from "@/types";

export interface ClassTemplateSeed {
  title: string;
  description: string;
  method: PilatesMethod;
  class_type: ClassType;
  difficulty: Difficulty;
  duration_minutes: number;
  blocks: {
    name: string;
    order_index: number;
    exercises: {
      exercise_name: string;
      order_index: number;
      duration: number;
      reps: number | null;
      side: "both" | "left" | "right" | null;
      notes: string;
    }[];
  }[];
}

export const classTemplates: ClassTemplateSeed[] = [
  // ── 1. Classical Mat Fundamentals ──
  {
    title: "Classical Mat Fundamentals",
    description:
      "Introduction to the foundational Pilates mat exercises. Focus on breath, alignment, and core connection. Perfect for those new to Pilates or revisiting the basics.",
    method: "mat",
    class_type: "group",
    difficulty: "beginner",
    duration_minutes: 45,
    blocks: [
      {
        name: "Warm-Up",
        order_index: 0,
        exercises: [
          { exercise_name: "Pelvic Curl", order_index: 0, duration: 120, reps: 8, side: null, notes: "Focus on sequential articulation of the spine" },
          { exercise_name: "Cat Stretch", order_index: 1, duration: 90, reps: 6, side: null, notes: "Coordinate breath with movement" },
          { exercise_name: "Chest Lift", order_index: 2, duration: 90, reps: 8, side: null, notes: "Keep pelvis neutral, no tucking" },
          { exercise_name: "The Hundred", order_index: 3, duration: 120, reps: null, side: null, notes: "Modified: keep knees in tabletop for beginners" },
        ],
      },
      {
        name: "Supine Series",
        order_index: 1,
        exercises: [
          { exercise_name: "Roll Up", order_index: 0, duration: 150, reps: 6, side: null, notes: "Use a strap or bent knees if needed" },
          { exercise_name: "Single Leg Circle", order_index: 1, duration: 120, reps: 5, side: "both", notes: "Small circles, stabilize pelvis" },
          { exercise_name: "Single Leg Stretch", order_index: 2, duration: 120, reps: 8, side: null, notes: "Alternate legs, keep torso lifted" },
          { exercise_name: "Double Leg Stretch", order_index: 3, duration: 120, reps: 6, side: null, notes: "Reach long, return to center" },
        ],
      },
      {
        name: "Seated & Prone",
        order_index: 2,
        exercises: [
          { exercise_name: "Spine Stretch Forward", order_index: 0, duration: 120, reps: 5, side: null, notes: "Sit tall, articulate forward from the crown" },
          { exercise_name: "Rolling Like a Ball", order_index: 1, duration: 90, reps: 6, side: null, notes: "Maintain C-curve shape throughout" },
          { exercise_name: "Swan Dive", order_index: 2, duration: 120, reps: 5, side: null, notes: "Baby swan only — no rocking for beginners" },
        ],
      },
      {
        name: "Cool Down",
        order_index: 3,
        exercises: [
          { exercise_name: "Seal", order_index: 0, duration: 90, reps: 6, side: null, notes: "Clap feet 3 times at each end" },
          { exercise_name: "Cat Stretch", order_index: 1, duration: 60, reps: 4, side: null, notes: "Gentle spinal mobilization" },
          { exercise_name: "Pelvic Curl", order_index: 2, duration: 60, reps: 4, side: null, notes: "Slow, mindful cooldown" },
        ],
      },
    ],
  },

  // ── 2. Intermediate Mat Flow ──
  {
    title: "Intermediate Mat Flow",
    description:
      "A flowing intermediate mat class connecting classical exercises with breath and rhythm. Builds on fundamentals with added challenge and transitions.",
    method: "mat",
    class_type: "group",
    difficulty: "intermediate",
    duration_minutes: 55,
    blocks: [
      {
        name: "Warm-Up",
        order_index: 0,
        exercises: [
          { exercise_name: "Pelvic Curl", order_index: 0, duration: 90, reps: 6, side: null, notes: "" },
          { exercise_name: "Chest Lift", order_index: 1, duration: 60, reps: 8, side: null, notes: "" },
          { exercise_name: "The Hundred", order_index: 2, duration: 120, reps: null, side: null, notes: "Full version with legs extended at 45 degrees" },
        ],
      },
      {
        name: "Abdominal Series",
        order_index: 1,
        exercises: [
          { exercise_name: "Roll Up", order_index: 0, duration: 120, reps: 6, side: null, notes: "" },
          { exercise_name: "Roll Over", order_index: 1, duration: 120, reps: 5, side: null, notes: "Control the descent, no momentum" },
          { exercise_name: "Single Leg Stretch", order_index: 2, duration: 90, reps: 10, side: null, notes: "" },
          { exercise_name: "Double Leg Stretch", order_index: 3, duration: 90, reps: 8, side: null, notes: "" },
          { exercise_name: "Scissors", order_index: 4, duration: 90, reps: 8, side: null, notes: "Pulse twice at each leg" },
          { exercise_name: "Bicycle", order_index: 5, duration: 90, reps: 6, side: null, notes: "" },
        ],
      },
      {
        name: "Lateral & Rotation",
        order_index: 2,
        exercises: [
          { exercise_name: "Spine Twist", order_index: 0, duration: 90, reps: 5, side: "both", notes: "" },
          { exercise_name: "Saw", order_index: 1, duration: 90, reps: 5, side: "both", notes: "" },
          { exercise_name: "Corkscrew", order_index: 2, duration: 90, reps: 4, side: "both", notes: "" },
          { exercise_name: "Open Leg Rocker", order_index: 3, duration: 90, reps: 6, side: null, notes: "Find the balance point" },
        ],
      },
      {
        name: "Prone Series",
        order_index: 3,
        exercises: [
          { exercise_name: "Swan Dive", order_index: 0, duration: 90, reps: 5, side: null, notes: "Full swan with rocking" },
          { exercise_name: "Single Leg Kick", order_index: 1, duration: 90, reps: 6, side: "both", notes: "" },
          { exercise_name: "Double Leg Kick", order_index: 2, duration: 90, reps: 4, side: "both", notes: "" },
          { exercise_name: "Swimming", order_index: 3, duration: 60, reps: null, side: null, notes: "30 seconds continuous" },
        ],
      },
      {
        name: "Side Lying",
        order_index: 4,
        exercises: [
          { exercise_name: "Side Kick Series - Front/Back", order_index: 0, duration: 90, reps: 8, side: "both", notes: "" },
          { exercise_name: "Side Kick Series - Up/Down", order_index: 1, duration: 60, reps: 6, side: "both", notes: "" },
          { exercise_name: "Side Kick Series - Circles", order_index: 2, duration: 60, reps: 6, side: "both", notes: "" },
        ],
      },
      {
        name: "Cool Down",
        order_index: 5,
        exercises: [
          { exercise_name: "Seal", order_index: 0, duration: 60, reps: 6, side: null, notes: "" },
          { exercise_name: "Cat Stretch", order_index: 1, duration: 60, reps: 4, side: null, notes: "" },
        ],
      },
    ],
  },

  // ── 3. Advanced Mat Challenge ──
  {
    title: "Advanced Mat Challenge",
    description:
      "The complete classical mat order for advanced practitioners. Demands strength, control, and flow through the full repertoire.",
    method: "mat",
    class_type: "group",
    difficulty: "advanced",
    duration_minutes: 60,
    blocks: [
      {
        name: "Opening",
        order_index: 0,
        exercises: [
          { exercise_name: "The Hundred", order_index: 0, duration: 120, reps: null, side: null, notes: "Legs low, full pumping intensity" },
          { exercise_name: "Roll Up", order_index: 1, duration: 90, reps: 6, side: null, notes: "" },
          { exercise_name: "Roll Over", order_index: 2, duration: 90, reps: 5, side: null, notes: "" },
          { exercise_name: "Single Leg Circle", order_index: 3, duration: 90, reps: 5, side: "both", notes: "Large circles" },
        ],
      },
      {
        name: "Abdominal Series",
        order_index: 1,
        exercises: [
          { exercise_name: "Rolling Like a Ball", order_index: 0, duration: 60, reps: 6, side: null, notes: "" },
          { exercise_name: "Single Leg Stretch", order_index: 1, duration: 60, reps: 10, side: null, notes: "" },
          { exercise_name: "Double Leg Stretch", order_index: 2, duration: 60, reps: 8, side: null, notes: "" },
          { exercise_name: "Spine Stretch Forward", order_index: 3, duration: 60, reps: 5, side: null, notes: "" },
          { exercise_name: "Open Leg Rocker", order_index: 4, duration: 60, reps: 6, side: null, notes: "" },
        ],
      },
      {
        name: "Spinal Articulation",
        order_index: 2,
        exercises: [
          { exercise_name: "Corkscrew", order_index: 0, duration: 90, reps: 4, side: "both", notes: "Full version with lift" },
          { exercise_name: "Saw", order_index: 1, duration: 60, reps: 5, side: "both", notes: "" },
          { exercise_name: "Jack Knife", order_index: 2, duration: 90, reps: 4, side: null, notes: "" },
          { exercise_name: "Neck Pull", order_index: 3, duration: 90, reps: 5, side: null, notes: "" },
        ],
      },
      {
        name: "Prone & Extension",
        order_index: 3,
        exercises: [
          { exercise_name: "Swan Dive", order_index: 0, duration: 60, reps: 5, side: null, notes: "Full rocking" },
          { exercise_name: "Single Leg Kick", order_index: 1, duration: 60, reps: 6, side: "both", notes: "" },
          { exercise_name: "Double Leg Kick", order_index: 2, duration: 60, reps: 4, side: "both", notes: "" },
          { exercise_name: "Rocking", order_index: 3, duration: 60, reps: 5, side: null, notes: "" },
        ],
      },
      {
        name: "Side Series & Inversions",
        order_index: 4,
        exercises: [
          { exercise_name: "Side Kick Series - Front/Back", order_index: 0, duration: 60, reps: 8, side: "both", notes: "" },
          { exercise_name: "Side Kick Series - Up/Down", order_index: 1, duration: 60, reps: 6, side: "both", notes: "" },
          { exercise_name: "Teaser I", order_index: 2, duration: 60, reps: 3, side: null, notes: "" },
          { exercise_name: "Teaser II", order_index: 3, duration: 60, reps: 3, side: null, notes: "" },
          { exercise_name: "Hip Circles", order_index: 4, duration: 60, reps: 4, side: "both", notes: "" },
        ],
      },
      {
        name: "Advanced Closing",
        order_index: 5,
        exercises: [
          { exercise_name: "Swimming", order_index: 0, duration: 60, reps: null, side: null, notes: "" },
          { exercise_name: "Leg Pull Front", order_index: 1, duration: 60, reps: 5, side: "both", notes: "" },
          { exercise_name: "Leg Pull Back", order_index: 2, duration: 60, reps: 5, side: "both", notes: "" },
          { exercise_name: "Kneeling Side Kick", order_index: 3, duration: 60, reps: 5, side: "both", notes: "" },
          { exercise_name: "Side Bend", order_index: 4, duration: 60, reps: 4, side: "both", notes: "" },
          { exercise_name: "Boomerang", order_index: 5, duration: 60, reps: 4, side: null, notes: "" },
        ],
      },
      {
        name: "Cool Down",
        order_index: 6,
        exercises: [
          { exercise_name: "Seal", order_index: 0, duration: 45, reps: 6, side: null, notes: "" },
          { exercise_name: "Crab", order_index: 1, duration: 45, reps: 4, side: null, notes: "" },
          { exercise_name: "Control Balance", order_index: 2, duration: 45, reps: 4, side: null, notes: "" },
          { exercise_name: "Push Up", order_index: 3, duration: 45, reps: 4, side: null, notes: "" },
        ],
      },
    ],
  },

  // ── 4. Reformer Foundations ──
  {
    title: "Reformer Foundations",
    description:
      "Learn the reformer basics with footwork, straps, and simple spring-based exercises. Builds confidence with the apparatus in a safe, structured format.",
    method: "reformer",
    class_type: "group",
    difficulty: "beginner",
    duration_minutes: 45,
    blocks: [
      {
        name: "Footwork",
        order_index: 0,
        exercises: [
          { exercise_name: "Footwork - Parallel", order_index: 0, duration: 120, reps: 10, side: null, notes: "3 Red Springs" },
          { exercise_name: "Footwork - V Position", order_index: 1, duration: 90, reps: 10, side: null, notes: "" },
          { exercise_name: "Footwork - Heels", order_index: 2, duration: 90, reps: 10, side: null, notes: "" },
          { exercise_name: "Footwork - Tendon Stretch", order_index: 3, duration: 90, reps: 10, side: null, notes: "Lower and lift heels with control" },
        ],
      },
      {
        name: "Supine Straps",
        order_index: 1,
        exercises: [
          { exercise_name: "Hundred on Reformer", order_index: 0, duration: 120, reps: null, side: null, notes: "1 Red Spring, knees tabletop" },
          { exercise_name: "Frog in Straps", order_index: 1, duration: 90, reps: 8, side: null, notes: "" },
          { exercise_name: "Leg Circles in Straps", order_index: 2, duration: 90, reps: 5, side: "both", notes: "Small controlled circles" },
        ],
      },
      {
        name: "Box Work",
        order_index: 2,
        exercises: [
          { exercise_name: "Long Box - Pulling Straps", order_index: 0, duration: 90, reps: 6, side: null, notes: "1 Red Spring" },
          { exercise_name: "Long Box - T-Pull", order_index: 1, duration: 90, reps: 6, side: null, notes: "" },
          { exercise_name: "Short Box - Round", order_index: 2, duration: 120, reps: 5, side: null, notes: "Feet under strap" },
        ],
      },
      {
        name: "Kneeling & Standing",
        order_index: 3,
        exercises: [
          { exercise_name: "Knee Stretches - Round", order_index: 0, duration: 90, reps: 10, side: null, notes: "2 Red Springs" },
          { exercise_name: "Running", order_index: 1, duration: 90, reps: null, side: null, notes: "3 Red Springs, alternating heels" },
          { exercise_name: "Pelvic Lift on Reformer", order_index: 2, duration: 90, reps: 6, side: null, notes: "" },
        ],
      },
      {
        name: "Cool Down",
        order_index: 4,
        exercises: [
          { exercise_name: "Mermaid on Reformer", order_index: 0, duration: 120, reps: 4, side: "both", notes: "1 Red Spring, gentle side stretch" },
        ],
      },
    ],
  },

  // ── 5. Intermediate Reformer Flow ──
  {
    title: "Intermediate Reformer Flow",
    description:
      "A balanced reformer class incorporating all positions with moderate spring work and flowing transitions. Builds strength and coordination.",
    method: "reformer",
    class_type: "group",
    difficulty: "intermediate",
    duration_minutes: 55,
    blocks: [
      {
        name: "Footwork",
        order_index: 0,
        exercises: [
          { exercise_name: "Footwork - Parallel", order_index: 0, duration: 90, reps: 10, side: null, notes: "" },
          { exercise_name: "Footwork - V Position", order_index: 1, duration: 90, reps: 10, side: null, notes: "" },
          { exercise_name: "Footwork - Heels", order_index: 2, duration: 60, reps: 10, side: null, notes: "" },
          { exercise_name: "Footwork - Tendon Stretch", order_index: 3, duration: 60, reps: 10, side: null, notes: "" },
        ],
      },
      {
        name: "Hundred & Coordination",
        order_index: 1,
        exercises: [
          { exercise_name: "Hundred on Reformer", order_index: 0, duration: 120, reps: null, side: null, notes: "Legs extended at 45 degrees" },
          { exercise_name: "Coordination", order_index: 1, duration: 90, reps: 8, side: null, notes: "" },
        ],
      },
      {
        name: "Long Stretch Series",
        order_index: 2,
        exercises: [
          { exercise_name: "Long Stretch", order_index: 0, duration: 90, reps: 5, side: null, notes: "1 Red + 1 Blue" },
          { exercise_name: "Down Stretch", order_index: 1, duration: 90, reps: 5, side: null, notes: "" },
          { exercise_name: "Up Stretch", order_index: 2, duration: 90, reps: 5, side: null, notes: "" },
          { exercise_name: "Elephant", order_index: 3, duration: 90, reps: 8, side: null, notes: "Round spine, heels pressing back" },
        ],
      },
      {
        name: "Short Box",
        order_index: 3,
        exercises: [
          { exercise_name: "Short Box - Round", order_index: 0, duration: 90, reps: 5, side: null, notes: "" },
          { exercise_name: "Short Box - Flat Back", order_index: 1, duration: 90, reps: 5, side: null, notes: "" },
          { exercise_name: "Short Box - Side Reach", order_index: 2, duration: 90, reps: 4, side: "both", notes: "" },
          { exercise_name: "Short Box - Twist", order_index: 3, duration: 90, reps: 4, side: "both", notes: "" },
        ],
      },
      {
        name: "Straps & Supine",
        order_index: 4,
        exercises: [
          { exercise_name: "Short Spine", order_index: 0, duration: 120, reps: 4, side: null, notes: "2 Red Springs" },
          { exercise_name: "Frog in Straps", order_index: 1, duration: 60, reps: 8, side: null, notes: "" },
          { exercise_name: "Leg Circles in Straps", order_index: 2, duration: 60, reps: 5, side: "both", notes: "" },
        ],
      },
      {
        name: "Knee Stretches",
        order_index: 5,
        exercises: [
          { exercise_name: "Knee Stretches - Round", order_index: 0, duration: 60, reps: 10, side: null, notes: "" },
          { exercise_name: "Knee Stretches - Arched", order_index: 1, duration: 60, reps: 10, side: null, notes: "" },
          { exercise_name: "Knee Stretches - Knees Off", order_index: 2, duration: 60, reps: 8, side: null, notes: "Hover knees 1 inch off carriage" },
        ],
      },
      {
        name: "Cool Down",
        order_index: 6,
        exercises: [
          { exercise_name: "Running", order_index: 0, duration: 60, reps: null, side: null, notes: "" },
          { exercise_name: "Mermaid on Reformer", order_index: 1, duration: 90, reps: 4, side: "both", notes: "" },
        ],
      },
    ],
  },

  // ── 6. Advanced Reformer Power ──
  {
    title: "Advanced Reformer Power",
    description:
      "High-intensity reformer class for experienced practitioners. Full repertoire with advanced transitions and heavier spring challenges.",
    method: "reformer",
    class_type: "group",
    difficulty: "advanced",
    duration_minutes: 60,
    blocks: [
      {
        name: "Footwork",
        order_index: 0,
        exercises: [
          { exercise_name: "Footwork - Parallel", order_index: 0, duration: 60, reps: 10, side: null, notes: "4 Springs, quick tempo" },
          { exercise_name: "Footwork - V Position", order_index: 1, duration: 60, reps: 10, side: null, notes: "" },
          { exercise_name: "Footwork - Heels", order_index: 2, duration: 60, reps: 10, side: null, notes: "" },
          { exercise_name: "Footwork - Tendon Stretch", order_index: 3, duration: 60, reps: 10, side: null, notes: "" },
        ],
      },
      {
        name: "Hundred & Coordination",
        order_index: 1,
        exercises: [
          { exercise_name: "Hundred on Reformer", order_index: 0, duration: 120, reps: null, side: null, notes: "Legs at 6 inches off carriage" },
          { exercise_name: "Coordination", order_index: 1, duration: 90, reps: 10, side: null, notes: "" },
        ],
      },
      {
        name: "Rowing Series",
        order_index: 2,
        exercises: [
          { exercise_name: "Rowing Series - Into the Sternum", order_index: 0, duration: 120, reps: 5, side: null, notes: "1 Red Spring" },
          { exercise_name: "Rowing Series - From the Chest", order_index: 1, duration: 120, reps: 5, side: null, notes: "" },
        ],
      },
      {
        name: "Long Stretch Series",
        order_index: 3,
        exercises: [
          { exercise_name: "Long Stretch", order_index: 0, duration: 60, reps: 5, side: null, notes: "" },
          { exercise_name: "Down Stretch", order_index: 1, duration: 60, reps: 5, side: null, notes: "" },
          { exercise_name: "Up Stretch", order_index: 2, duration: 60, reps: 5, side: null, notes: "" },
          { exercise_name: "Elephant", order_index: 3, duration: 60, reps: 8, side: null, notes: "" },
          { exercise_name: "Snake", order_index: 4, duration: 90, reps: 3, side: "both", notes: "" },
          { exercise_name: "Star", order_index: 5, duration: 90, reps: 3, side: "both", notes: "" },
        ],
      },
      {
        name: "Short Box",
        order_index: 4,
        exercises: [
          { exercise_name: "Short Box - Round", order_index: 0, duration: 60, reps: 5, side: null, notes: "" },
          { exercise_name: "Short Box - Flat Back", order_index: 1, duration: 60, reps: 5, side: null, notes: "" },
          { exercise_name: "Short Box - Side Reach", order_index: 2, duration: 60, reps: 4, side: "both", notes: "" },
          { exercise_name: "Short Box - Twist", order_index: 3, duration: 60, reps: 4, side: "both", notes: "" },
        ],
      },
      {
        name: "Spine & Inversion",
        order_index: 5,
        exercises: [
          { exercise_name: "Short Spine", order_index: 0, duration: 120, reps: 4, side: null, notes: "" },
          { exercise_name: "Semi-Circle", order_index: 1, duration: 120, reps: 4, side: null, notes: "" },
        ],
      },
      {
        name: "Knee Stretches & Standing",
        order_index: 6,
        exercises: [
          { exercise_name: "Knee Stretches - Round", order_index: 0, duration: 45, reps: 10, side: null, notes: "" },
          { exercise_name: "Knee Stretches - Arched", order_index: 1, duration: 45, reps: 10, side: null, notes: "" },
          { exercise_name: "Knee Stretches - Knees Off", order_index: 2, duration: 45, reps: 10, side: null, notes: "" },
        ],
      },
      {
        name: "Cool Down",
        order_index: 7,
        exercises: [
          { exercise_name: "Running", order_index: 0, duration: 60, reps: null, side: null, notes: "" },
          { exercise_name: "Pelvic Lift on Reformer", order_index: 1, duration: 60, reps: 6, side: null, notes: "" },
          { exercise_name: "Mermaid on Reformer", order_index: 2, duration: 90, reps: 4, side: "both", notes: "" },
        ],
      },
    ],
  },

  // ── 7. xR Athletic Cardio Blast ──
  {
    title: "xR Athletic Cardio Blast",
    description:
      "High-energy jumpboard and athletic reformer work. Cardiovascular conditioning meets Pilates precision for a full-body burn.",
    method: "x-reformer",
    class_type: "group",
    difficulty: "intermediate",
    duration_minutes: 45,
    blocks: [
      {
        name: "Warm-Up & Footwork",
        order_index: 0,
        exercises: [
          { exercise_name: "Footwork - Parallel", order_index: 0, duration: 90, reps: 10, side: null, notes: "3 Red Springs" },
          { exercise_name: "Footwork - V Position", order_index: 1, duration: 90, reps: 10, side: null, notes: "" },
        ],
      },
      {
        name: "Jumpboard Cardio",
        order_index: 1,
        exercises: [
          { exercise_name: "xR Jumpboard - Basic Jumps", order_index: 0, duration: 120, reps: 20, side: null, notes: "2 Red Springs" },
          { exercise_name: "xR Jumpboard - Tuck Jumps", order_index: 1, duration: 90, reps: 12, side: null, notes: "" },
          { exercise_name: "xR Jumpboard - Single Leg", order_index: 2, duration: 120, reps: 10, side: "both", notes: "" },
          { exercise_name: "xR Jumpboard - Plié Jumps", order_index: 3, duration: 90, reps: 15, side: null, notes: "" },
        ],
      },
      {
        name: "Standing Power",
        order_index: 2,
        exercises: [
          { exercise_name: "xR Standing Lunge Series", order_index: 0, duration: 120, reps: 10, side: "both", notes: "" },
          { exercise_name: "xR Platform Squats", order_index: 1, duration: 90, reps: 12, side: null, notes: "" },
          { exercise_name: "xR Scooter", order_index: 2, duration: 120, reps: 10, side: "both", notes: "" },
        ],
      },
      {
        name: "Core & Balance",
        order_index: 3,
        exercises: [
          { exercise_name: "xR Plank to Pike", order_index: 0, duration: 90, reps: 8, side: null, notes: "" },
          { exercise_name: "xR Stability Ball Pike", order_index: 1, duration: 90, reps: 6, side: null, notes: "" },
          { exercise_name: "xR Rotation Disk Twist", order_index: 2, duration: 90, reps: 8, side: "both", notes: "" },
        ],
      },
      {
        name: "Cool Down",
        order_index: 4,
        exercises: [
          { exercise_name: "xR Cooldown Stretch Series", order_index: 0, duration: 120, reps: null, side: null, notes: "" },
          { exercise_name: "xR Mermaid Side Stretch", order_index: 1, duration: 90, reps: 4, side: "both", notes: "" },
        ],
      },
    ],
  },

  // ── 8. xR Full Body Sculpt ──
  {
    title: "xR Full Body Sculpt",
    description:
      "Total body conditioning on the reformer. Power, control, and endurance across every plane of motion for advanced practitioners.",
    method: "x-reformer",
    class_type: "group",
    difficulty: "advanced",
    duration_minutes: 55,
    blocks: [
      {
        name: "Lower Body Power",
        order_index: 0,
        exercises: [
          { exercise_name: "xR Jumpboard - Basic Jumps", order_index: 0, duration: 90, reps: 20, side: null, notes: "" },
          { exercise_name: "xR Jumpboard - Tuck Jumps", order_index: 1, duration: 90, reps: 12, side: null, notes: "" },
          { exercise_name: "xR Platform Squats", order_index: 2, duration: 90, reps: 15, side: null, notes: "" },
          { exercise_name: "xR Standing Lunge Series", order_index: 3, duration: 120, reps: 10, side: "both", notes: "" },
        ],
      },
      {
        name: "Upper Body & Core",
        order_index: 1,
        exercises: [
          { exercise_name: "xR Long Box Power Pull", order_index: 0, duration: 90, reps: 10, side: null, notes: "" },
          { exercise_name: "xR Kneeling Arm Series", order_index: 1, duration: 90, reps: 8, side: null, notes: "" },
          { exercise_name: "xR Chest Fly on Box", order_index: 2, duration: 90, reps: 10, side: null, notes: "" },
          { exercise_name: "xR Plank to Pike", order_index: 3, duration: 90, reps: 8, side: null, notes: "" },
        ],
      },
      {
        name: "Flexibility & Control",
        order_index: 2,
        exercises: [
          { exercise_name: "xR Front Splits", order_index: 0, duration: 120, reps: 5, side: "both", notes: "" },
          { exercise_name: "xR Side Splits", order_index: 1, duration: 90, reps: 5, side: null, notes: "" },
          { exercise_name: "xR Arabesque Press", order_index: 2, duration: 90, reps: 6, side: "both", notes: "" },
        ],
      },
      {
        name: "Advanced Integration",
        order_index: 3,
        exercises: [
          { exercise_name: "xR Box Burpee Flow", order_index: 0, duration: 90, reps: 8, side: null, notes: "" },
          { exercise_name: "xR Reverse Plank Glide", order_index: 1, duration: 90, reps: 6, side: null, notes: "" },
          { exercise_name: "xR Teaser with Straps", order_index: 2, duration: 90, reps: 5, side: null, notes: "" },
          { exercise_name: "xR Swan on Long Box", order_index: 3, duration: 90, reps: 5, side: null, notes: "" },
        ],
      },
      {
        name: "Posterior Chain",
        order_index: 4,
        exercises: [
          { exercise_name: "xR Hamstring Curl", order_index: 0, duration: 90, reps: 10, side: null, notes: "" },
          { exercise_name: "xR Side-Lying Leg Press", order_index: 1, duration: 90, reps: 8, side: "both", notes: "" },
        ],
      },
      {
        name: "Cool Down",
        order_index: 5,
        exercises: [
          { exercise_name: "xR Cooldown Stretch Series", order_index: 0, duration: 120, reps: null, side: null, notes: "" },
          { exercise_name: "xR Mermaid Side Stretch", order_index: 1, duration: 90, reps: 4, side: "both", notes: "" },
        ],
      },
    ],
  },

  // ── 9. Mat - Core & Back Restore ──
  {
    title: "Mat - Core & Back Restore",
    description:
      "Gentle core activation and back mobility. Perfect for recovery days or Pilates newcomers seeking a mindful, restorative session.",
    method: "mat",
    class_type: "group",
    difficulty: "beginner",
    duration_minutes: 30,
    blocks: [
      {
        name: "Centering",
        order_index: 0,
        exercises: [
          { exercise_name: "Pelvic Curl", order_index: 0, duration: 120, reps: 8, side: null, notes: "Slow, mindful articulation" },
          { exercise_name: "Cat Stretch", order_index: 1, duration: 90, reps: 6, side: null, notes: "" },
          { exercise_name: "Chest Lift", order_index: 2, duration: 90, reps: 8, side: null, notes: "" },
        ],
      },
      {
        name: "Supine Core",
        order_index: 1,
        exercises: [
          { exercise_name: "The Hundred", order_index: 0, duration: 120, reps: null, side: null, notes: "Modified — head down if needed" },
          { exercise_name: "Single Leg Stretch", order_index: 1, duration: 120, reps: 6, side: null, notes: "" },
          { exercise_name: "Spine Stretch Forward", order_index: 2, duration: 120, reps: 5, side: null, notes: "" },
        ],
      },
      {
        name: "Prone Extension",
        order_index: 2,
        exercises: [
          { exercise_name: "Swan Dive", order_index: 0, duration: 90, reps: 4, side: null, notes: "Baby swan only" },
          { exercise_name: "Single Leg Kick", order_index: 1, duration: 90, reps: 6, side: "both", notes: "" },
        ],
      },
      {
        name: "Cool Down",
        order_index: 3,
        exercises: [
          { exercise_name: "Rolling Like a Ball", order_index: 0, duration: 60, reps: 6, side: null, notes: "Massage the spine" },
          { exercise_name: "Seal", order_index: 1, duration: 60, reps: 6, side: null, notes: "" },
        ],
      },
    ],
  },

  // ── 10. Reformer - Lower Body Focus ──
  {
    title: "Reformer - Lower Body Focus",
    description:
      "Targeted leg and glute work on the reformer. Footwork variations, straps, and standing challenges for a strong lower body.",
    method: "reformer",
    class_type: "group",
    difficulty: "intermediate",
    duration_minutes: 50,
    blocks: [
      {
        name: "Footwork Series",
        order_index: 0,
        exercises: [
          { exercise_name: "Footwork - Parallel", order_index: 0, duration: 120, reps: 12, side: null, notes: "Heavy springs — 4 springs" },
          { exercise_name: "Footwork - V Position", order_index: 1, duration: 90, reps: 12, side: null, notes: "" },
          { exercise_name: "Footwork - Heels", order_index: 2, duration: 90, reps: 12, side: null, notes: "" },
          { exercise_name: "Footwork - Tendon Stretch", order_index: 3, duration: 90, reps: 12, side: null, notes: "" },
        ],
      },
      {
        name: "Supine Leg Straps",
        order_index: 1,
        exercises: [
          { exercise_name: "Frog in Straps", order_index: 0, duration: 90, reps: 10, side: null, notes: "" },
          { exercise_name: "Leg Circles in Straps", order_index: 1, duration: 120, reps: 6, side: "both", notes: "Large circles with control" },
        ],
      },
      {
        name: "Box Work",
        order_index: 2,
        exercises: [
          { exercise_name: "Long Box - Pulling Straps", order_index: 0, duration: 90, reps: 8, side: null, notes: "" },
          { exercise_name: "Short Box - Round", order_index: 1, duration: 90, reps: 5, side: null, notes: "" },
          { exercise_name: "Short Box - Flat Back", order_index: 2, duration: 90, reps: 5, side: null, notes: "" },
        ],
      },
      {
        name: "Knee Stretches",
        order_index: 3,
        exercises: [
          { exercise_name: "Knee Stretches - Round", order_index: 0, duration: 60, reps: 10, side: null, notes: "" },
          { exercise_name: "Knee Stretches - Arched", order_index: 1, duration: 60, reps: 10, side: null, notes: "" },
          { exercise_name: "Knee Stretches - Knees Off", order_index: 2, duration: 60, reps: 8, side: null, notes: "" },
        ],
      },
      {
        name: "Standing Finish",
        order_index: 4,
        exercises: [
          { exercise_name: "Running", order_index: 0, duration: 90, reps: null, side: null, notes: "" },
          { exercise_name: "Pelvic Lift on Reformer", order_index: 1, duration: 90, reps: 6, side: null, notes: "" },
        ],
      },
      {
        name: "Stretch",
        order_index: 5,
        exercises: [
          { exercise_name: "Mermaid on Reformer", order_index: 0, duration: 120, reps: 4, side: "both", notes: "" },
        ],
      },
    ],
  },

  // ── 11. Mat - Flexibility & Flow ──
  {
    title: "Mat - Flexibility & Flow",
    description:
      "Emphasizing spinal mobility, hip opening, and flowing transitions between exercises. A graceful intermediate-level class.",
    method: "mat",
    class_type: "group",
    difficulty: "intermediate",
    duration_minutes: 40,
    blocks: [
      {
        name: "Warm-Up",
        order_index: 0,
        exercises: [
          { exercise_name: "Cat Stretch", order_index: 0, duration: 90, reps: 6, side: null, notes: "" },
          { exercise_name: "Pelvic Curl", order_index: 1, duration: 90, reps: 6, side: null, notes: "" },
          { exercise_name: "Chest Lift", order_index: 2, duration: 60, reps: 8, side: null, notes: "" },
        ],
      },
      {
        name: "Spinal Mobility",
        order_index: 1,
        exercises: [
          { exercise_name: "Roll Up", order_index: 0, duration: 120, reps: 6, side: null, notes: "" },
          { exercise_name: "Spine Stretch Forward", order_index: 1, duration: 90, reps: 5, side: null, notes: "" },
          { exercise_name: "Saw", order_index: 2, duration: 90, reps: 5, side: "both", notes: "" },
          { exercise_name: "Spine Twist", order_index: 3, duration: 90, reps: 5, side: "both", notes: "" },
        ],
      },
      {
        name: "Hip & Leg Work",
        order_index: 2,
        exercises: [
          { exercise_name: "Single Leg Circle", order_index: 0, duration: 120, reps: 5, side: "both", notes: "" },
          { exercise_name: "Side Kick Series - Front/Back", order_index: 1, duration: 90, reps: 8, side: "both", notes: "" },
          { exercise_name: "Side Kick Series - Circles", order_index: 2, duration: 90, reps: 6, side: "both", notes: "" },
        ],
      },
      {
        name: "Extension & Balance",
        order_index: 3,
        exercises: [
          { exercise_name: "Swan Dive", order_index: 0, duration: 90, reps: 5, side: null, notes: "" },
          { exercise_name: "Swimming", order_index: 1, duration: 60, reps: null, side: null, notes: "" },
          { exercise_name: "Shoulder Bridge", order_index: 2, duration: 90, reps: 5, side: "both", notes: "" },
        ],
      },
      {
        name: "Cool Down",
        order_index: 4,
        exercises: [
          { exercise_name: "Seal", order_index: 0, duration: 60, reps: 6, side: null, notes: "" },
          { exercise_name: "Cat Stretch", order_index: 1, duration: 60, reps: 4, side: null, notes: "" },
        ],
      },
    ],
  },

  // ── 12. xR Beginner Explorer ──
  {
    title: "xR Beginner Explorer",
    description:
      "Introduction to the cross-reformer method. Accessible jumpboard and platform work with clear instruction for newcomers.",
    method: "x-reformer",
    class_type: "group",
    difficulty: "beginner",
    duration_minutes: 35,
    blocks: [
      {
        name: "Orientation & Footwork",
        order_index: 0,
        exercises: [
          { exercise_name: "Footwork - Parallel", order_index: 0, duration: 120, reps: 10, side: null, notes: "3 Red Springs" },
          { exercise_name: "Footwork - Heels", order_index: 1, duration: 90, reps: 10, side: null, notes: "" },
        ],
      },
      {
        name: "Jumpboard Intro",
        order_index: 1,
        exercises: [
          { exercise_name: "xR Jumpboard - Basic Jumps", order_index: 0, duration: 120, reps: 15, side: null, notes: "Light springs, focus on landing" },
          { exercise_name: "xR Jumpboard - Plié Jumps", order_index: 1, duration: 120, reps: 12, side: null, notes: "" },
        ],
      },
      {
        name: "Standing & Balance",
        order_index: 2,
        exercises: [
          { exercise_name: "xR Standing Lunge Series", order_index: 0, duration: 120, reps: 8, side: "both", notes: "Hold onto frame for balance" },
          { exercise_name: "xR Scooter", order_index: 1, duration: 90, reps: 8, side: "both", notes: "" },
        ],
      },
      {
        name: "Core",
        order_index: 3,
        exercises: [
          { exercise_name: "xR Kneeling Arm Series", order_index: 0, duration: 120, reps: 8, side: null, notes: "" },
        ],
      },
      {
        name: "Cool Down",
        order_index: 4,
        exercises: [
          { exercise_name: "xR Cooldown Stretch Series", order_index: 0, duration: 90, reps: null, side: null, notes: "" },
          { exercise_name: "xR Mermaid Side Stretch", order_index: 1, duration: 60, reps: 4, side: "both", notes: "" },
        ],
      },
    ],
  },

  // ── 13. Mat - Teaser & Inversion Workshop ──
  {
    title: "Mat - Teaser & Inversion Workshop",
    description:
      "Deep dive into the teaser progression and inverted exercises. For experienced practitioners seeking mastery of advanced mat work.",
    method: "mat",
    class_type: "virtual",
    difficulty: "advanced",
    duration_minutes: 45,
    blocks: [
      {
        name: "Warm-Up",
        order_index: 0,
        exercises: [
          { exercise_name: "The Hundred", order_index: 0, duration: 120, reps: null, side: null, notes: "" },
          { exercise_name: "Roll Up", order_index: 1, duration: 90, reps: 6, side: null, notes: "" },
          { exercise_name: "Pelvic Curl", order_index: 2, duration: 60, reps: 6, side: null, notes: "" },
        ],
      },
      {
        name: "Teaser Progression",
        order_index: 1,
        exercises: [
          { exercise_name: "Teaser I", order_index: 0, duration: 120, reps: 4, side: null, notes: "Build up slowly" },
          { exercise_name: "Teaser II", order_index: 1, duration: 120, reps: 4, side: null, notes: "" },
          { exercise_name: "Hip Circles", order_index: 2, duration: 120, reps: 5, side: "both", notes: "" },
        ],
      },
      {
        name: "Inversions",
        order_index: 2,
        exercises: [
          { exercise_name: "Roll Over", order_index: 0, duration: 90, reps: 5, side: null, notes: "" },
          { exercise_name: "Jack Knife", order_index: 1, duration: 90, reps: 4, side: null, notes: "" },
          { exercise_name: "Control Balance", order_index: 2, duration: 90, reps: 4, side: null, notes: "" },
          { exercise_name: "Scissors", order_index: 3, duration: 60, reps: 6, side: null, notes: "Supported on shoulders" },
          { exercise_name: "Bicycle", order_index: 4, duration: 60, reps: 6, side: null, notes: "" },
        ],
      },
      {
        name: "Integration",
        order_index: 3,
        exercises: [
          { exercise_name: "Boomerang", order_index: 0, duration: 120, reps: 4, side: null, notes: "" },
          { exercise_name: "Crab", order_index: 1, duration: 90, reps: 4, side: null, notes: "" },
          { exercise_name: "Rocking", order_index: 2, duration: 90, reps: 5, side: null, notes: "" },
        ],
      },
      {
        name: "Cool Down",
        order_index: 4,
        exercises: [
          { exercise_name: "Seal", order_index: 0, duration: 60, reps: 6, side: null, notes: "" },
          { exercise_name: "Cat Stretch", order_index: 1, duration: 60, reps: 4, side: null, notes: "" },
          { exercise_name: "Pelvic Curl", order_index: 2, duration: 60, reps: 4, side: null, notes: "" },
        ],
      },
    ],
  },

  // ── 14. Reformer - Short Box Mastery ──
  {
    title: "Reformer - Short Box Mastery",
    description:
      "Focused workshop on the short box series with supplementary footwork and stretching. Perfect for deepening your short box technique.",
    method: "reformer",
    class_type: "virtual",
    difficulty: "intermediate",
    duration_minutes: 40,
    blocks: [
      {
        name: "Footwork Warm-Up",
        order_index: 0,
        exercises: [
          { exercise_name: "Footwork - Parallel", order_index: 0, duration: 90, reps: 10, side: null, notes: "" },
          { exercise_name: "Footwork - V Position", order_index: 1, duration: 90, reps: 10, side: null, notes: "" },
        ],
      },
      {
        name: "Hundred & Straps",
        order_index: 1,
        exercises: [
          { exercise_name: "Hundred on Reformer", order_index: 0, duration: 120, reps: null, side: null, notes: "" },
          { exercise_name: "Coordination", order_index: 1, duration: 90, reps: 8, side: null, notes: "" },
        ],
      },
      {
        name: "Short Box Deep Dive",
        order_index: 2,
        exercises: [
          { exercise_name: "Short Box - Round", order_index: 0, duration: 120, reps: 6, side: null, notes: "Focus on C-curve depth" },
          { exercise_name: "Short Box - Flat Back", order_index: 1, duration: 120, reps: 6, side: null, notes: "Maintain length through spine" },
          { exercise_name: "Short Box - Side Reach", order_index: 2, duration: 120, reps: 5, side: "both", notes: "Reach over, don't collapse" },
          { exercise_name: "Short Box - Twist", order_index: 3, duration: 120, reps: 5, side: "both", notes: "Rotate from ribs, not hips" },
        ],
      },
      {
        name: "Long Box",
        order_index: 3,
        exercises: [
          { exercise_name: "Long Box - Pulling Straps", order_index: 0, duration: 90, reps: 6, side: null, notes: "" },
          { exercise_name: "Long Box - T-Pull", order_index: 1, duration: 90, reps: 6, side: null, notes: "" },
        ],
      },
      {
        name: "Cool Down",
        order_index: 4,
        exercises: [
          { exercise_name: "Running", order_index: 0, duration: 60, reps: null, side: null, notes: "" },
          { exercise_name: "Mermaid on Reformer", order_index: 1, duration: 120, reps: 4, side: "both", notes: "" },
        ],
      },
    ],
  },

  // ── 15. xR HIIT Reformer ──
  {
    title: "xR HIIT Reformer",
    description:
      "Maximum intensity interval training on the reformer. Explosive jumpboard sets, power moves, and athletic conditioning for the advanced practitioner.",
    method: "x-reformer",
    class_type: "group",
    difficulty: "advanced",
    duration_minutes: 50,
    blocks: [
      {
        name: "Dynamic Warm-Up",
        order_index: 0,
        exercises: [
          { exercise_name: "Footwork - Parallel", order_index: 0, duration: 60, reps: 10, side: null, notes: "" },
          { exercise_name: "xR Jumpboard - Basic Jumps", order_index: 1, duration: 90, reps: 15, side: null, notes: "Build tempo gradually" },
        ],
      },
      {
        name: "HIIT Round 1 - Lower",
        order_index: 1,
        exercises: [
          { exercise_name: "xR Jumpboard - Tuck Jumps", order_index: 0, duration: 90, reps: 12, side: null, notes: "" },
          { exercise_name: "xR Jumpboard - Single Leg", order_index: 1, duration: 90, reps: 10, side: "both", notes: "" },
          { exercise_name: "xR Platform Squats", order_index: 2, duration: 90, reps: 15, side: null, notes: "" },
          { exercise_name: "xR Standing Lunge Series", order_index: 3, duration: 120, reps: 10, side: "both", notes: "" },
        ],
      },
      {
        name: "HIIT Round 2 - Upper & Core",
        order_index: 2,
        exercises: [
          { exercise_name: "xR Long Box Power Pull", order_index: 0, duration: 90, reps: 10, side: null, notes: "" },
          { exercise_name: "xR Chest Fly on Box", order_index: 1, duration: 90, reps: 10, side: null, notes: "" },
          { exercise_name: "xR Plank to Pike", order_index: 2, duration: 90, reps: 8, side: null, notes: "" },
          { exercise_name: "xR Box Burpee Flow", order_index: 3, duration: 90, reps: 8, side: null, notes: "" },
        ],
      },
      {
        name: "HIIT Round 3 - Full Body",
        order_index: 3,
        exercises: [
          { exercise_name: "xR Arabesque Press", order_index: 0, duration: 90, reps: 6, side: "both", notes: "" },
          { exercise_name: "xR Reverse Plank Glide", order_index: 1, duration: 90, reps: 6, side: null, notes: "" },
          { exercise_name: "xR Rotation Disk Twist", order_index: 2, duration: 90, reps: 8, side: "both", notes: "" },
          { exercise_name: "xR Stability Ball Pike", order_index: 3, duration: 90, reps: 6, side: null, notes: "" },
        ],
      },
      {
        name: "Posterior Chain",
        order_index: 4,
        exercises: [
          { exercise_name: "xR Hamstring Curl", order_index: 0, duration: 90, reps: 10, side: null, notes: "" },
          { exercise_name: "xR Side-Lying Leg Press", order_index: 1, duration: 90, reps: 8, side: "both", notes: "" },
          { exercise_name: "xR Footwork - Single Leg", order_index: 2, duration: 60, reps: 8, side: "both", notes: "" },
        ],
      },
      {
        name: "Recovery",
        order_index: 5,
        exercises: [
          { exercise_name: "xR Cooldown Stretch Series", order_index: 0, duration: 120, reps: null, side: null, notes: "" },
          { exercise_name: "xR Mermaid Side Stretch", order_index: 1, duration: 90, reps: 4, side: "both", notes: "" },
          { exercise_name: "xR Swan on Long Box", order_index: 2, duration: 90, reps: 4, side: null, notes: "Gentle extension to finish" },
        ],
      },
    ],
  },
];
