-- Seed all 15 class templates into Supabase
-- Run this as a single transaction in the Supabase SQL Editor

DO $$
DECLARE
  v_instructor_id uuid;
  v_class_id uuid;
  v_block_id uuid;
  v_exercise_id uuid;
BEGIN

  -- 1. Create or find system instructor
  SELECT id INTO v_instructor_id
    FROM instructors
   WHERE name = 'ProPilates Templates'
   LIMIT 1;

  IF v_instructor_id IS NULL THEN
    INSERT INTO instructors (id, name, bio, location, languages, methods, class_types, equipment, certifications, music_style, favorite_artists, tier, onboarding_complete)
    VALUES (
      gen_random_uuid(),
      'ProPilates Templates',
      'System-generated template classes for ProPilates.',
      'Global',
      ARRAY['English'],
      ARRAY['mat','reformer','x-reformer']::pilates_method[],
      ARRAY['group','virtual','private']::class_type[],
      ARRAY['mat','reformer','jumpboard'],
      ARRAY['ProPilates Certified'],
      'Ambient',
      ARRAY[]::text[],
      'free'::tier_level,
      true
    )
    RETURNING id INTO v_instructor_id;
  END IF;

  -- 2. Delete existing template data (cascade through blocks and exercises)
  DELETE FROM block_exercises
   WHERE block_id IN (
     SELECT cb.id FROM class_blocks cb
      JOIN classes c ON cb.class_id = c.id
      WHERE c.is_template = true AND c.instructor_id = v_instructor_id
   );

  DELETE FROM class_blocks
   WHERE class_id IN (
     SELECT id FROM classes WHERE is_template = true AND instructor_id = v_instructor_id
   );

  DELETE FROM classes
   WHERE is_template = true AND instructor_id = v_instructor_id;

  -----------------------------------------------------------------------
  -- TEMPLATE 1: Classical Mat Fundamentals
  -----------------------------------------------------------------------
  INSERT INTO classes (id, instructor_id, title, description, method, class_type, difficulty, duration_minutes, is_public, is_template, price)
  VALUES (gen_random_uuid(), v_instructor_id,
    'Classical Mat Fundamentals',
    'Introduction to the foundational Pilates mat exercises. Focus on breath, alignment, and core connection. Perfect for those new to Pilates or revisiting the basics.',
    'mat', 'group', 'beginner', 45, true, true, 0)
  RETURNING id INTO v_class_id;

  -- Block: Warm-Up
  INSERT INTO class_blocks (id, class_id, name, order_index)
  VALUES (gen_random_uuid(), v_class_id, 'Warm-Up', 0)
  RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Pelvic Curl' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 120, 8, NULL, 'Focus on sequential articulation of the spine');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Cat Stretch' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 90, 6, NULL, 'Coordinate breath with movement');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Chest Lift' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 2, 90, 8, NULL, 'Keep pelvis neutral, no tucking');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'The Hundred' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 3, 120, NULL, NULL, 'Modified: keep knees in tabletop for beginners');
  END IF;

  -- Block: Supine Series
  INSERT INTO class_blocks (id, class_id, name, order_index)
  VALUES (gen_random_uuid(), v_class_id, 'Supine Series', 1)
  RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Roll Up' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 150, 6, NULL, 'Use a strap or bent knees if needed');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Single Leg Circle' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 120, 5, 'both', 'Small circles, stabilize pelvis');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Single Leg Stretch' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 2, 120, 8, NULL, 'Alternate legs, keep torso lifted');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Double Leg Stretch' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 3, 120, 6, NULL, 'Reach long, return to center');
  END IF;

  -- Block: Seated & Prone
  INSERT INTO class_blocks (id, class_id, name, order_index)
  VALUES (gen_random_uuid(), v_class_id, 'Seated & Prone', 2)
  RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Spine Stretch Forward' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 120, 5, NULL, 'Sit tall, articulate forward from the crown');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Rolling Like a Ball' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 90, 6, NULL, 'Maintain C-curve shape throughout');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Swan Dive' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 2, 120, 5, NULL, 'Baby swan only — no rocking for beginners');
  END IF;

  -- Block: Cool Down
  INSERT INTO class_blocks (id, class_id, name, order_index)
  VALUES (gen_random_uuid(), v_class_id, 'Cool Down', 3)
  RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Seal' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 90, 6, NULL, 'Clap feet 3 times at each end');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Cat Stretch' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 60, 4, NULL, 'Gentle spinal mobilization');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Pelvic Curl' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 2, 60, 4, NULL, 'Slow, mindful cooldown');
  END IF;


  -----------------------------------------------------------------------
  -- TEMPLATE 2: Intermediate Mat Flow
  -----------------------------------------------------------------------
  INSERT INTO classes (id, instructor_id, title, description, method, class_type, difficulty, duration_minutes, is_public, is_template, price)
  VALUES (gen_random_uuid(), v_instructor_id,
    'Intermediate Mat Flow',
    'A flowing intermediate mat class connecting classical exercises with breath and rhythm. Builds on fundamentals with added challenge and transitions.',
    'mat', 'group', 'intermediate', 55, true, true, 0)
  RETURNING id INTO v_class_id;

  -- Block: Warm-Up
  INSERT INTO class_blocks (id, class_id, name, order_index)
  VALUES (gen_random_uuid(), v_class_id, 'Warm-Up', 0)
  RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Pelvic Curl' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 90, 6, NULL, '');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Chest Lift' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 60, 8, NULL, '');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'The Hundred' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 2, 120, NULL, NULL, 'Full version with legs extended at 45 degrees');
  END IF;

  -- Block: Abdominal Series
  INSERT INTO class_blocks (id, class_id, name, order_index)
  VALUES (gen_random_uuid(), v_class_id, 'Abdominal Series', 1)
  RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Roll Up' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 120, 6, NULL, '');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Roll Over' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 120, 5, NULL, 'Control the descent, no momentum');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Single Leg Stretch' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 2, 90, 10, NULL, '');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Double Leg Stretch' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 3, 90, 8, NULL, '');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Scissors' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 4, 90, 8, NULL, 'Pulse twice at each leg');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Bicycle' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 5, 90, 6, NULL, '');
  END IF;

  -- Block: Lateral & Rotation
  INSERT INTO class_blocks (id, class_id, name, order_index)
  VALUES (gen_random_uuid(), v_class_id, 'Lateral & Rotation', 2)
  RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Spine Twist' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 90, 5, 'both', '');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Saw' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 90, 5, 'both', '');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Corkscrew' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 2, 90, 4, 'both', '');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Open Leg Rocker' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 3, 90, 6, NULL, 'Find the balance point');
  END IF;

  -- Block: Prone Series
  INSERT INTO class_blocks (id, class_id, name, order_index)
  VALUES (gen_random_uuid(), v_class_id, 'Prone Series', 3)
  RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Swan Dive' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 90, 5, NULL, 'Full swan with rocking');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Single Leg Kick' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 90, 6, 'both', '');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Double Leg Kick' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 2, 90, 4, 'both', '');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Swimming' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 3, 60, NULL, NULL, '30 seconds continuous');
  END IF;

  -- Block: Side Lying
  INSERT INTO class_blocks (id, class_id, name, order_index)
  VALUES (gen_random_uuid(), v_class_id, 'Side Lying', 4)
  RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Side Kick Series - Front/Back' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 90, 8, 'both', '');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Side Kick Series - Up/Down' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 60, 6, 'both', '');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Side Kick Series - Circles' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 2, 60, 6, 'both', '');
  END IF;

  -- Block: Cool Down
  INSERT INTO class_blocks (id, class_id, name, order_index)
  VALUES (gen_random_uuid(), v_class_id, 'Cool Down', 5)
  RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Seal' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 60, 6, NULL, '');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Cat Stretch' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 60, 4, NULL, '');
  END IF;


  -----------------------------------------------------------------------
  -- TEMPLATE 3: Advanced Mat Challenge
  -----------------------------------------------------------------------
  INSERT INTO classes (id, instructor_id, title, description, method, class_type, difficulty, duration_minutes, is_public, is_template, price)
  VALUES (gen_random_uuid(), v_instructor_id,
    'Advanced Mat Challenge',
    'The complete classical mat order for advanced practitioners. Demands strength, control, and flow through the full repertoire.',
    'mat', 'group', 'advanced', 60, true, true, 0)
  RETURNING id INTO v_class_id;

  -- Block: Opening
  INSERT INTO class_blocks (id, class_id, name, order_index)
  VALUES (gen_random_uuid(), v_class_id, 'Opening', 0)
  RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'The Hundred' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 120, NULL, NULL, 'Legs low, full pumping intensity');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Roll Up' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 90, 6, NULL, '');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Roll Over' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 2, 90, 5, NULL, '');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Single Leg Circle' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 3, 90, 5, 'both', 'Large circles');
  END IF;

  -- Block: Abdominal Series
  INSERT INTO class_blocks (id, class_id, name, order_index)
  VALUES (gen_random_uuid(), v_class_id, 'Abdominal Series', 1)
  RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Rolling Like a Ball' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 60, 6, NULL, '');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Single Leg Stretch' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 60, 10, NULL, '');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Double Leg Stretch' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 2, 60, 8, NULL, '');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Spine Stretch Forward' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 3, 60, 5, NULL, '');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Open Leg Rocker' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 4, 60, 6, NULL, '');
  END IF;

  -- Block: Spinal Articulation
  INSERT INTO class_blocks (id, class_id, name, order_index)
  VALUES (gen_random_uuid(), v_class_id, 'Spinal Articulation', 2)
  RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Corkscrew' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 90, 4, 'both', 'Full version with lift');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Saw' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 60, 5, 'both', '');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Jack Knife' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 2, 90, 4, NULL, '');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Neck Pull' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 3, 90, 5, NULL, '');
  END IF;

  -- Block: Prone & Extension
  INSERT INTO class_blocks (id, class_id, name, order_index)
  VALUES (gen_random_uuid(), v_class_id, 'Prone & Extension', 3)
  RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Swan Dive' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 60, 5, NULL, 'Full rocking');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Single Leg Kick' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 60, 6, 'both', '');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Double Leg Kick' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 2, 60, 4, 'both', '');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Rocking' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 3, 60, 5, NULL, '');
  END IF;

  -- Block: Side Series & Inversions
  INSERT INTO class_blocks (id, class_id, name, order_index)
  VALUES (gen_random_uuid(), v_class_id, 'Side Series & Inversions', 4)
  RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Side Kick Series - Front/Back' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 60, 8, 'both', '');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Side Kick Series - Up/Down' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 60, 6, 'both', '');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Teaser I' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 2, 60, 3, NULL, '');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Teaser II' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 3, 60, 3, NULL, '');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Hip Circles' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 4, 60, 4, 'both', '');
  END IF;

  -- Block: Advanced Closing
  INSERT INTO class_blocks (id, class_id, name, order_index)
  VALUES (gen_random_uuid(), v_class_id, 'Advanced Closing', 5)
  RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Swimming' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 60, NULL, NULL, '');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Leg Pull Front' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 60, 5, 'both', '');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Leg Pull Back' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 2, 60, 5, 'both', '');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Kneeling Side Kick' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 3, 60, 5, 'both', '');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Side Bend' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 4, 60, 4, 'both', '');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Boomerang' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 5, 60, 4, NULL, '');
  END IF;

  -- Block: Cool Down
  INSERT INTO class_blocks (id, class_id, name, order_index)
  VALUES (gen_random_uuid(), v_class_id, 'Cool Down', 6)
  RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Seal' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 45, 6, NULL, '');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Crab' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 45, 4, NULL, '');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Control Balance' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 2, 45, 4, NULL, '');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Push Up' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 3, 45, 4, NULL, '');
  END IF;


  -----------------------------------------------------------------------
  -- TEMPLATE 4: Reformer Foundations
  -----------------------------------------------------------------------
  INSERT INTO classes (id, instructor_id, title, description, method, class_type, difficulty, duration_minutes, is_public, is_template, price)
  VALUES (gen_random_uuid(), v_instructor_id,
    'Reformer Foundations',
    'Learn the reformer basics with footwork, straps, and simple spring-based exercises. Builds confidence with the apparatus in a safe, structured format.',
    'reformer', 'group', 'beginner', 45, true, true, 0)
  RETURNING id INTO v_class_id;

  -- Block: Footwork
  INSERT INTO class_blocks (id, class_id, name, order_index)
  VALUES (gen_random_uuid(), v_class_id, 'Footwork', 0)
  RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Footwork - Parallel' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 120, 10, NULL, '3 Red Springs');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Footwork - V Position' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 90, 10, NULL, '');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Footwork - Heels' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 2, 90, 10, NULL, '');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Footwork - Tendon Stretch' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 3, 90, 10, NULL, 'Lower and lift heels with control');
  END IF;

  -- Block: Supine Straps
  INSERT INTO class_blocks (id, class_id, name, order_index)
  VALUES (gen_random_uuid(), v_class_id, 'Supine Straps', 1)
  RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Hundred on Reformer' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 120, NULL, NULL, '1 Red Spring, knees tabletop');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Frog in Straps' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 90, 8, NULL, '');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Leg Circles in Straps' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 2, 90, 5, 'both', 'Small controlled circles');
  END IF;

  -- Block: Box Work
  INSERT INTO class_blocks (id, class_id, name, order_index)
  VALUES (gen_random_uuid(), v_class_id, 'Box Work', 2)
  RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Long Box - Pulling Straps' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 90, 6, NULL, '1 Red Spring');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Long Box - T-Pull' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 90, 6, NULL, '');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Short Box - Round' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 2, 120, 5, NULL, 'Feet under strap');
  END IF;

  -- Block: Kneeling & Standing
  INSERT INTO class_blocks (id, class_id, name, order_index)
  VALUES (gen_random_uuid(), v_class_id, 'Kneeling & Standing', 3)
  RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Knee Stretches - Round' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 90, 10, NULL, '2 Red Springs');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Running' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 90, NULL, NULL, '3 Red Springs, alternating heels');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Pelvic Lift on Reformer' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 2, 90, 6, NULL, '');
  END IF;

  -- Block: Cool Down
  INSERT INTO class_blocks (id, class_id, name, order_index)
  VALUES (gen_random_uuid(), v_class_id, 'Cool Down', 4)
  RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Mermaid on Reformer' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 120, 4, 'both', '1 Red Spring, gentle side stretch');
  END IF;

  -----------------------------------------------------------------------
  -- TEMPLATE 5: Intermediate Reformer Flow
  -----------------------------------------------------------------------
  INSERT INTO classes (id, instructor_id, title, description, method, class_type, difficulty, duration_minutes, is_public, is_template, price)
  VALUES (gen_random_uuid(), v_instructor_id,
    'Intermediate Reformer Flow',
    'A balanced reformer class incorporating all positions with moderate spring work and flowing transitions. Builds strength and coordination.',
    'reformer', 'group', 'intermediate', 55, true, true, 0)
  RETURNING id INTO v_class_id;

  -- Block: Footwork
  INSERT INTO class_blocks (id, class_id, name, order_index)
  VALUES (gen_random_uuid(), v_class_id, 'Footwork', 0)
  RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Footwork - Parallel' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 90, 10, NULL, '');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Footwork - V Position' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 90, 10, NULL, '');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Footwork - Heels' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 2, 60, 10, NULL, '');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Footwork - Tendon Stretch' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 3, 60, 10, NULL, '');
  END IF;

  -- Block: Hundred & Coordination
  INSERT INTO class_blocks (id, class_id, name, order_index)
  VALUES (gen_random_uuid(), v_class_id, 'Hundred & Coordination', 1)
  RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Hundred on Reformer' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 120, NULL, NULL, 'Legs extended at 45 degrees');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Coordination' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 90, 8, NULL, '');
  END IF;

  -- Block: Long Stretch Series
  INSERT INTO class_blocks (id, class_id, name, order_index)
  VALUES (gen_random_uuid(), v_class_id, 'Long Stretch Series', 2)
  RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Long Stretch' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 90, 5, NULL, '1 Red + 1 Blue');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Down Stretch' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 90, 5, NULL, '');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Up Stretch' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 2, 90, 5, NULL, '');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Elephant' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 3, 90, 8, NULL, 'Round spine, heels pressing back');
  END IF;

  -- Block: Short Box
  INSERT INTO class_blocks (id, class_id, name, order_index)
  VALUES (gen_random_uuid(), v_class_id, 'Short Box', 3)
  RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Short Box - Round' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 90, 5, NULL, '');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Short Box - Flat Back' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 90, 5, NULL, '');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Short Box - Side Reach' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 2, 90, 4, 'both', '');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Short Box - Twist' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 3, 90, 4, 'both', '');
  END IF;

  -- Block: Straps & Supine
  INSERT INTO class_blocks (id, class_id, name, order_index)
  VALUES (gen_random_uuid(), v_class_id, 'Straps & Supine', 4)
  RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Short Spine' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 120, 4, NULL, '2 Red Springs');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Frog in Straps' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 60, 8, NULL, '');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Leg Circles in Straps' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 2, 60, 5, 'both', '');
  END IF;

  -- Block: Knee Stretches
  INSERT INTO class_blocks (id, class_id, name, order_index)
  VALUES (gen_random_uuid(), v_class_id, 'Knee Stretches', 5)
  RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Knee Stretches - Round' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 60, 10, NULL, '');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Knee Stretches - Arched' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 60, 10, NULL, '');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Knee Stretches - Knees Off' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 2, 60, 8, NULL, 'Hover knees 1 inch off carriage');
  END IF;

  -- Block: Cool Down
  INSERT INTO class_blocks (id, class_id, name, order_index)
  VALUES (gen_random_uuid(), v_class_id, 'Cool Down', 6)
  RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Running' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 60, NULL, NULL, '');
  END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Mermaid on Reformer' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN
    INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes)
    VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 90, 4, 'both', '');
  END IF;


  -----------------------------------------------------------------------
  -- TEMPLATE 6: Advanced Reformer Power
  -----------------------------------------------------------------------
  INSERT INTO classes (id, instructor_id, title, description, method, class_type, difficulty, duration_minutes, is_public, is_template, price)
  VALUES (gen_random_uuid(), v_instructor_id,
    'Advanced Reformer Power',
    'High-intensity reformer class for experienced practitioners. Full repertoire with advanced transitions and heavier spring challenges.',
    'reformer', 'group', 'advanced', 60, true, true, 0)
  RETURNING id INTO v_class_id;

  -- Block: Footwork
  INSERT INTO class_blocks (id, class_id, name, order_index)
  VALUES (gen_random_uuid(), v_class_id, 'Footwork', 0)
  RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Footwork - Parallel' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 60, 10, NULL, '4 Springs, quick tempo'); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Footwork - V Position' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 60, 10, NULL, ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Footwork - Heels' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 2, 60, 10, NULL, ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Footwork - Tendon Stretch' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 3, 60, 10, NULL, ''); END IF;

  -- Block: Hundred & Coordination
  INSERT INTO class_blocks (id, class_id, name, order_index)
  VALUES (gen_random_uuid(), v_class_id, 'Hundred & Coordination', 1)
  RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Hundred on Reformer' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 120, NULL, NULL, 'Legs at 6 inches off carriage'); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Coordination' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 90, 10, NULL, ''); END IF;

  -- Block: Rowing Series
  INSERT INTO class_blocks (id, class_id, name, order_index)
  VALUES (gen_random_uuid(), v_class_id, 'Rowing Series', 2)
  RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Rowing Series - Into the Sternum' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 120, 5, NULL, '1 Red Spring'); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Rowing Series - From the Chest' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 120, 5, NULL, ''); END IF;

  -- Block: Long Stretch Series
  INSERT INTO class_blocks (id, class_id, name, order_index)
  VALUES (gen_random_uuid(), v_class_id, 'Long Stretch Series', 3)
  RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Long Stretch' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 60, 5, NULL, ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Down Stretch' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 60, 5, NULL, ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Up Stretch' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 2, 60, 5, NULL, ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Elephant' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 3, 60, 8, NULL, ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Snake' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 4, 90, 3, 'both', ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Star' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 5, 90, 3, 'both', ''); END IF;

  -- Block: Short Box
  INSERT INTO class_blocks (id, class_id, name, order_index)
  VALUES (gen_random_uuid(), v_class_id, 'Short Box', 4)
  RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Short Box - Round' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 60, 5, NULL, ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Short Box - Flat Back' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 60, 5, NULL, ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Short Box - Side Reach' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 2, 60, 4, 'both', ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Short Box - Twist' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 3, 60, 4, 'both', ''); END IF;

  -- Block: Spine & Inversion
  INSERT INTO class_blocks (id, class_id, name, order_index)
  VALUES (gen_random_uuid(), v_class_id, 'Spine & Inversion', 5)
  RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Short Spine' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 120, 4, NULL, ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Semi-Circle' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 120, 4, NULL, ''); END IF;

  -- Block: Knee Stretches & Standing
  INSERT INTO class_blocks (id, class_id, name, order_index)
  VALUES (gen_random_uuid(), v_class_id, 'Knee Stretches & Standing', 6)
  RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Knee Stretches - Round' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 45, 10, NULL, ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Knee Stretches - Arched' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 45, 10, NULL, ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Knee Stretches - Knees Off' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 2, 45, 10, NULL, ''); END IF;

  -- Block: Cool Down
  INSERT INTO class_blocks (id, class_id, name, order_index)
  VALUES (gen_random_uuid(), v_class_id, 'Cool Down', 7)
  RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Running' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 60, NULL, NULL, ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Pelvic Lift on Reformer' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 60, 6, NULL, ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Mermaid on Reformer' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 2, 90, 4, 'both', ''); END IF;


  -----------------------------------------------------------------------
  -- TEMPLATE 7: xR Athletic Cardio Blast
  -----------------------------------------------------------------------
  INSERT INTO classes (id, instructor_id, title, description, method, class_type, difficulty, duration_minutes, is_public, is_template, price)
  VALUES (gen_random_uuid(), v_instructor_id,
    'xR Athletic Cardio Blast',
    'High-energy jumpboard and athletic reformer work. Cardiovascular conditioning meets Pilates precision for a full-body burn.',
    'x-reformer', 'group', 'intermediate', 45, true, true, 0)
  RETURNING id INTO v_class_id;

  -- Block: Warm-Up & Footwork
  INSERT INTO class_blocks (id, class_id, name, order_index) VALUES (gen_random_uuid(), v_class_id, 'Warm-Up & Footwork', 0) RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Footwork - Parallel' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 90, 10, NULL, '3 Red Springs'); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Footwork - V Position' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 90, 10, NULL, ''); END IF;

  -- Block: Jumpboard Cardio
  INSERT INTO class_blocks (id, class_id, name, order_index) VALUES (gen_random_uuid(), v_class_id, 'Jumpboard Cardio', 1) RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'xR Jumpboard - Basic Jumps' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 120, 20, NULL, '2 Red Springs'); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'xR Jumpboard - Tuck Jumps' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 90, 12, NULL, ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'xR Jumpboard - Single Leg' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 2, 120, 10, 'both', ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'xR Jumpboard - Plié Jumps' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 3, 90, 15, NULL, ''); END IF;

  -- Block: Standing Power
  INSERT INTO class_blocks (id, class_id, name, order_index) VALUES (gen_random_uuid(), v_class_id, 'Standing Power', 2) RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'xR Standing Lunge Series' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 120, 10, 'both', ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'xR Platform Squats' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 90, 12, NULL, ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'xR Scooter' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 2, 120, 10, 'both', ''); END IF;

  -- Block: Core & Balance
  INSERT INTO class_blocks (id, class_id, name, order_index) VALUES (gen_random_uuid(), v_class_id, 'Core & Balance', 3) RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'xR Plank to Pike' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 90, 8, NULL, ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'xR Stability Ball Pike' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 90, 6, NULL, ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'xR Rotation Disk Twist' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 2, 90, 8, 'both', ''); END IF;

  -- Block: Cool Down
  INSERT INTO class_blocks (id, class_id, name, order_index) VALUES (gen_random_uuid(), v_class_id, 'Cool Down', 4) RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'xR Cooldown Stretch Series' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 120, NULL, NULL, ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'xR Mermaid Side Stretch' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 90, 4, 'both', ''); END IF;

  -----------------------------------------------------------------------
  -- TEMPLATE 8: xR Full Body Sculpt
  -----------------------------------------------------------------------
  INSERT INTO classes (id, instructor_id, title, description, method, class_type, difficulty, duration_minutes, is_public, is_template, price)
  VALUES (gen_random_uuid(), v_instructor_id,
    'xR Full Body Sculpt',
    'Total body conditioning on the reformer. Power, control, and endurance across every plane of motion for advanced practitioners.',
    'x-reformer', 'group', 'advanced', 55, true, true, 0)
  RETURNING id INTO v_class_id;

  -- Block: Lower Body Power
  INSERT INTO class_blocks (id, class_id, name, order_index) VALUES (gen_random_uuid(), v_class_id, 'Lower Body Power', 0) RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'xR Jumpboard - Basic Jumps' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 90, 20, NULL, ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'xR Jumpboard - Tuck Jumps' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 90, 12, NULL, ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'xR Platform Squats' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 2, 90, 15, NULL, ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'xR Standing Lunge Series' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 3, 120, 10, 'both', ''); END IF;

  -- Block: Upper Body & Core
  INSERT INTO class_blocks (id, class_id, name, order_index) VALUES (gen_random_uuid(), v_class_id, 'Upper Body & Core', 1) RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'xR Long Box Power Pull' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 90, 10, NULL, ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'xR Kneeling Arm Series' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 90, 8, NULL, ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'xR Chest Fly on Box' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 2, 90, 10, NULL, ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'xR Plank to Pike' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 3, 90, 8, NULL, ''); END IF;

  -- Block: Flexibility & Control
  INSERT INTO class_blocks (id, class_id, name, order_index) VALUES (gen_random_uuid(), v_class_id, 'Flexibility & Control', 2) RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'xR Front Splits' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 120, 5, 'both', ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'xR Side Splits' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 90, 5, NULL, ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'xR Arabesque Press' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 2, 90, 6, 'both', ''); END IF;

  -- Block: Advanced Integration
  INSERT INTO class_blocks (id, class_id, name, order_index) VALUES (gen_random_uuid(), v_class_id, 'Advanced Integration', 3) RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'xR Box Burpee Flow' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 90, 8, NULL, ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'xR Reverse Plank Glide' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 90, 6, NULL, ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'xR Teaser with Straps' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 2, 90, 5, NULL, ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'xR Swan on Long Box' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 3, 90, 5, NULL, ''); END IF;

  -- Block: Posterior Chain
  INSERT INTO class_blocks (id, class_id, name, order_index) VALUES (gen_random_uuid(), v_class_id, 'Posterior Chain', 4) RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'xR Hamstring Curl' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 90, 10, NULL, ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'xR Side-Lying Leg Press' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 90, 8, 'both', ''); END IF;

  -- Block: Cool Down
  INSERT INTO class_blocks (id, class_id, name, order_index) VALUES (gen_random_uuid(), v_class_id, 'Cool Down', 5) RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'xR Cooldown Stretch Series' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 120, NULL, NULL, ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'xR Mermaid Side Stretch' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 90, 4, 'both', ''); END IF;


  -----------------------------------------------------------------------
  -- TEMPLATE 9: Mat - Core & Back Restore
  -----------------------------------------------------------------------
  INSERT INTO classes (id, instructor_id, title, description, method, class_type, difficulty, duration_minutes, is_public, is_template, price)
  VALUES (gen_random_uuid(), v_instructor_id,
    'Mat - Core & Back Restore',
    'Gentle core activation and back mobility. Perfect for recovery days or Pilates newcomers seeking a mindful, restorative session.',
    'mat', 'group', 'beginner', 30, true, true, 0)
  RETURNING id INTO v_class_id;

  -- Block: Centering
  INSERT INTO class_blocks (id, class_id, name, order_index) VALUES (gen_random_uuid(), v_class_id, 'Centering', 0) RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Pelvic Curl' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 120, 8, NULL, 'Slow, mindful articulation'); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Cat Stretch' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 90, 6, NULL, ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Chest Lift' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 2, 90, 8, NULL, ''); END IF;

  -- Block: Supine Core
  INSERT INTO class_blocks (id, class_id, name, order_index) VALUES (gen_random_uuid(), v_class_id, 'Supine Core', 1) RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'The Hundred' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 120, NULL, NULL, 'Modified — head down if needed'); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Single Leg Stretch' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 120, 6, NULL, ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Spine Stretch Forward' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 2, 120, 5, NULL, ''); END IF;

  -- Block: Prone Extension
  INSERT INTO class_blocks (id, class_id, name, order_index) VALUES (gen_random_uuid(), v_class_id, 'Prone Extension', 2) RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Swan Dive' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 90, 4, NULL, 'Baby swan only'); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Single Leg Kick' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 90, 6, 'both', ''); END IF;

  -- Block: Cool Down
  INSERT INTO class_blocks (id, class_id, name, order_index) VALUES (gen_random_uuid(), v_class_id, 'Cool Down', 3) RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Rolling Like a Ball' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 60, 6, NULL, 'Massage the spine'); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Seal' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 60, 6, NULL, ''); END IF;

  -----------------------------------------------------------------------
  -- TEMPLATE 10: Reformer - Lower Body Focus
  -----------------------------------------------------------------------
  INSERT INTO classes (id, instructor_id, title, description, method, class_type, difficulty, duration_minutes, is_public, is_template, price)
  VALUES (gen_random_uuid(), v_instructor_id,
    'Reformer - Lower Body Focus',
    'Targeted leg and glute work on the reformer. Footwork variations, straps, and standing challenges for a strong lower body.',
    'reformer', 'group', 'intermediate', 50, true, true, 0)
  RETURNING id INTO v_class_id;

  -- Block: Footwork Series
  INSERT INTO class_blocks (id, class_id, name, order_index) VALUES (gen_random_uuid(), v_class_id, 'Footwork Series', 0) RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Footwork - Parallel' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 120, 12, NULL, 'Heavy springs — 4 springs'); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Footwork - V Position' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 90, 12, NULL, ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Footwork - Heels' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 2, 90, 12, NULL, ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Footwork - Tendon Stretch' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 3, 90, 12, NULL, ''); END IF;

  -- Block: Supine Leg Straps
  INSERT INTO class_blocks (id, class_id, name, order_index) VALUES (gen_random_uuid(), v_class_id, 'Supine Leg Straps', 1) RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Frog in Straps' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 90, 10, NULL, ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Leg Circles in Straps' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 120, 6, 'both', 'Large circles with control'); END IF;

  -- Block: Box Work
  INSERT INTO class_blocks (id, class_id, name, order_index) VALUES (gen_random_uuid(), v_class_id, 'Box Work', 2) RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Long Box - Pulling Straps' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 90, 8, NULL, ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Short Box - Round' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 90, 5, NULL, ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Short Box - Flat Back' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 2, 90, 5, NULL, ''); END IF;

  -- Block: Knee Stretches
  INSERT INTO class_blocks (id, class_id, name, order_index) VALUES (gen_random_uuid(), v_class_id, 'Knee Stretches', 3) RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Knee Stretches - Round' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 60, 10, NULL, ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Knee Stretches - Arched' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 60, 10, NULL, ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Knee Stretches - Knees Off' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 2, 60, 8, NULL, ''); END IF;

  -- Block: Standing Finish
  INSERT INTO class_blocks (id, class_id, name, order_index) VALUES (gen_random_uuid(), v_class_id, 'Standing Finish', 4) RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Running' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 90, NULL, NULL, ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Pelvic Lift on Reformer' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 90, 6, NULL, ''); END IF;

  -- Block: Stretch
  INSERT INTO class_blocks (id, class_id, name, order_index) VALUES (gen_random_uuid(), v_class_id, 'Stretch', 5) RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Mermaid on Reformer' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 120, 4, 'both', ''); END IF;


  -----------------------------------------------------------------------
  -- TEMPLATE 11: Mat - Flexibility & Flow
  -----------------------------------------------------------------------
  INSERT INTO classes (id, instructor_id, title, description, method, class_type, difficulty, duration_minutes, is_public, is_template, price)
  VALUES (gen_random_uuid(), v_instructor_id,
    'Mat - Flexibility & Flow',
    'Emphasizing spinal mobility, hip opening, and flowing transitions between exercises. A graceful intermediate-level class.',
    'mat', 'group', 'intermediate', 40, true, true, 0)
  RETURNING id INTO v_class_id;

  -- Block: Warm-Up
  INSERT INTO class_blocks (id, class_id, name, order_index) VALUES (gen_random_uuid(), v_class_id, 'Warm-Up', 0) RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Cat Stretch' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 90, 6, NULL, ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Pelvic Curl' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 90, 6, NULL, ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Chest Lift' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 2, 60, 8, NULL, ''); END IF;

  -- Block: Spinal Mobility
  INSERT INTO class_blocks (id, class_id, name, order_index) VALUES (gen_random_uuid(), v_class_id, 'Spinal Mobility', 1) RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Roll Up' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 120, 6, NULL, ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Spine Stretch Forward' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 90, 5, NULL, ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Saw' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 2, 90, 5, 'both', ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Spine Twist' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 3, 90, 5, 'both', ''); END IF;

  -- Block: Hip & Leg Work
  INSERT INTO class_blocks (id, class_id, name, order_index) VALUES (gen_random_uuid(), v_class_id, 'Hip & Leg Work', 2) RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Single Leg Circle' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 120, 5, 'both', ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Side Kick Series - Front/Back' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 90, 8, 'both', ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Side Kick Series - Circles' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 2, 90, 6, 'both', ''); END IF;

  -- Block: Extension & Balance
  INSERT INTO class_blocks (id, class_id, name, order_index) VALUES (gen_random_uuid(), v_class_id, 'Extension & Balance', 3) RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Swan Dive' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 90, 5, NULL, ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Swimming' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 60, NULL, NULL, ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Shoulder Bridge' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 2, 90, 5, 'both', ''); END IF;

  -- Block: Cool Down
  INSERT INTO class_blocks (id, class_id, name, order_index) VALUES (gen_random_uuid(), v_class_id, 'Cool Down', 4) RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Seal' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 60, 6, NULL, ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Cat Stretch' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 60, 4, NULL, ''); END IF;

  -----------------------------------------------------------------------
  -- TEMPLATE 12: xR Beginner Explorer
  -----------------------------------------------------------------------
  INSERT INTO classes (id, instructor_id, title, description, method, class_type, difficulty, duration_minutes, is_public, is_template, price)
  VALUES (gen_random_uuid(), v_instructor_id,
    'xR Beginner Explorer',
    'Introduction to the cross-reformer method. Accessible jumpboard and platform work with clear instruction for newcomers.',
    'x-reformer', 'group', 'beginner', 35, true, true, 0)
  RETURNING id INTO v_class_id;

  -- Block: Orientation & Footwork
  INSERT INTO class_blocks (id, class_id, name, order_index) VALUES (gen_random_uuid(), v_class_id, 'Orientation & Footwork', 0) RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Footwork - Parallel' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 120, 10, NULL, '3 Red Springs'); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Footwork - Heels' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 90, 10, NULL, ''); END IF;

  -- Block: Jumpboard Intro
  INSERT INTO class_blocks (id, class_id, name, order_index) VALUES (gen_random_uuid(), v_class_id, 'Jumpboard Intro', 1) RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'xR Jumpboard - Basic Jumps' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 120, 15, NULL, 'Light springs, focus on landing'); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'xR Jumpboard - Plié Jumps' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 120, 12, NULL, ''); END IF;

  -- Block: Standing & Balance
  INSERT INTO class_blocks (id, class_id, name, order_index) VALUES (gen_random_uuid(), v_class_id, 'Standing & Balance', 2) RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'xR Standing Lunge Series' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 120, 8, 'both', 'Hold onto frame for balance'); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'xR Scooter' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 90, 8, 'both', ''); END IF;

  -- Block: Core
  INSERT INTO class_blocks (id, class_id, name, order_index) VALUES (gen_random_uuid(), v_class_id, 'Core', 3) RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'xR Kneeling Arm Series' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 120, 8, NULL, ''); END IF;

  -- Block: Cool Down
  INSERT INTO class_blocks (id, class_id, name, order_index) VALUES (gen_random_uuid(), v_class_id, 'Cool Down', 4) RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'xR Cooldown Stretch Series' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 90, NULL, NULL, ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'xR Mermaid Side Stretch' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 60, 4, 'both', ''); END IF;


  -----------------------------------------------------------------------
  -- TEMPLATE 13: Mat - Teaser & Inversion Workshop
  -----------------------------------------------------------------------
  INSERT INTO classes (id, instructor_id, title, description, method, class_type, difficulty, duration_minutes, is_public, is_template, price)
  VALUES (gen_random_uuid(), v_instructor_id,
    'Mat - Teaser & Inversion Workshop',
    'Deep dive into the teaser progression and inverted exercises. For experienced practitioners seeking mastery of advanced mat work.',
    'mat', 'virtual', 'advanced', 45, true, true, 0)
  RETURNING id INTO v_class_id;

  -- Block: Warm-Up
  INSERT INTO class_blocks (id, class_id, name, order_index) VALUES (gen_random_uuid(), v_class_id, 'Warm-Up', 0) RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'The Hundred' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 120, NULL, NULL, ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Roll Up' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 90, 6, NULL, ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Pelvic Curl' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 2, 60, 6, NULL, ''); END IF;

  -- Block: Teaser Progression
  INSERT INTO class_blocks (id, class_id, name, order_index) VALUES (gen_random_uuid(), v_class_id, 'Teaser Progression', 1) RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Teaser I' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 120, 4, NULL, 'Build up slowly'); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Teaser II' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 120, 4, NULL, ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Hip Circles' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 2, 120, 5, 'both', ''); END IF;

  -- Block: Inversions
  INSERT INTO class_blocks (id, class_id, name, order_index) VALUES (gen_random_uuid(), v_class_id, 'Inversions', 2) RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Roll Over' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 90, 5, NULL, ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Jack Knife' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 90, 4, NULL, ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Control Balance' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 2, 90, 4, NULL, ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Scissors' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 3, 60, 6, NULL, 'Supported on shoulders'); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Bicycle' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 4, 60, 6, NULL, ''); END IF;

  -- Block: Integration
  INSERT INTO class_blocks (id, class_id, name, order_index) VALUES (gen_random_uuid(), v_class_id, 'Integration', 3) RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Boomerang' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 120, 4, NULL, ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Crab' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 90, 4, NULL, ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Rocking' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 2, 90, 5, NULL, ''); END IF;

  -- Block: Cool Down
  INSERT INTO class_blocks (id, class_id, name, order_index) VALUES (gen_random_uuid(), v_class_id, 'Cool Down', 4) RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Seal' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 60, 6, NULL, ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Cat Stretch' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 60, 4, NULL, ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Pelvic Curl' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 2, 60, 4, NULL, ''); END IF;

  -----------------------------------------------------------------------
  -- TEMPLATE 14: Reformer - Short Box Mastery
  -----------------------------------------------------------------------
  INSERT INTO classes (id, instructor_id, title, description, method, class_type, difficulty, duration_minutes, is_public, is_template, price)
  VALUES (gen_random_uuid(), v_instructor_id,
    'Reformer - Short Box Mastery',
    'Focused workshop on the short box series with supplementary footwork and stretching. Perfect for deepening your short box technique.',
    'reformer', 'virtual', 'intermediate', 40, true, true, 0)
  RETURNING id INTO v_class_id;

  -- Block: Footwork Warm-Up
  INSERT INTO class_blocks (id, class_id, name, order_index) VALUES (gen_random_uuid(), v_class_id, 'Footwork Warm-Up', 0) RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Footwork - Parallel' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 90, 10, NULL, ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Footwork - V Position' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 90, 10, NULL, ''); END IF;

  -- Block: Hundred & Straps
  INSERT INTO class_blocks (id, class_id, name, order_index) VALUES (gen_random_uuid(), v_class_id, 'Hundred & Straps', 1) RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Hundred on Reformer' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 120, NULL, NULL, ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Coordination' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 90, 8, NULL, ''); END IF;

  -- Block: Short Box Deep Dive
  INSERT INTO class_blocks (id, class_id, name, order_index) VALUES (gen_random_uuid(), v_class_id, 'Short Box Deep Dive', 2) RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Short Box - Round' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 120, 6, NULL, 'Focus on C-curve depth'); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Short Box - Flat Back' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 120, 6, NULL, 'Maintain length through spine'); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Short Box - Side Reach' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 2, 120, 5, 'both', 'Reach over, don''t collapse'); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Short Box - Twist' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 3, 120, 5, 'both', 'Rotate from ribs, not hips'); END IF;

  -- Block: Long Box
  INSERT INTO class_blocks (id, class_id, name, order_index) VALUES (gen_random_uuid(), v_class_id, 'Long Box', 3) RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Long Box - Pulling Straps' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 90, 6, NULL, ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Long Box - T-Pull' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 90, 6, NULL, ''); END IF;

  -- Block: Cool Down
  INSERT INTO class_blocks (id, class_id, name, order_index) VALUES (gen_random_uuid(), v_class_id, 'Cool Down', 4) RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Running' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 60, NULL, NULL, ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Mermaid on Reformer' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 120, 4, 'both', ''); END IF;


  -----------------------------------------------------------------------
  -- TEMPLATE 15: xR HIIT Reformer
  -----------------------------------------------------------------------
  INSERT INTO classes (id, instructor_id, title, description, method, class_type, difficulty, duration_minutes, is_public, is_template, price)
  VALUES (gen_random_uuid(), v_instructor_id,
    'xR HIIT Reformer',
    'Maximum intensity interval training on the reformer. Explosive jumpboard sets, power moves, and athletic conditioning for the advanced practitioner.',
    'x-reformer', 'group', 'advanced', 50, true, true, 0)
  RETURNING id INTO v_class_id;

  -- Block: Dynamic Warm-Up
  INSERT INTO class_blocks (id, class_id, name, order_index) VALUES (gen_random_uuid(), v_class_id, 'Dynamic Warm-Up', 0) RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'Footwork - Parallel' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 60, 10, NULL, ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'xR Jumpboard - Basic Jumps' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 90, 15, NULL, 'Build tempo gradually'); END IF;

  -- Block: HIIT Round 1 - Lower
  INSERT INTO class_blocks (id, class_id, name, order_index) VALUES (gen_random_uuid(), v_class_id, 'HIIT Round 1 - Lower', 1) RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'xR Jumpboard - Tuck Jumps' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 90, 12, NULL, ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'xR Jumpboard - Single Leg' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 90, 10, 'both', ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'xR Platform Squats' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 2, 90, 15, NULL, ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'xR Standing Lunge Series' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 3, 120, 10, 'both', ''); END IF;

  -- Block: HIIT Round 2 - Upper & Core
  INSERT INTO class_blocks (id, class_id, name, order_index) VALUES (gen_random_uuid(), v_class_id, 'HIIT Round 2 - Upper & Core', 2) RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'xR Long Box Power Pull' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 90, 10, NULL, ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'xR Chest Fly on Box' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 90, 10, NULL, ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'xR Plank to Pike' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 2, 90, 8, NULL, ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'xR Box Burpee Flow' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 3, 90, 8, NULL, ''); END IF;

  -- Block: HIIT Round 3 - Full Body
  INSERT INTO class_blocks (id, class_id, name, order_index) VALUES (gen_random_uuid(), v_class_id, 'HIIT Round 3 - Full Body', 3) RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'xR Arabesque Press' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 90, 6, 'both', ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'xR Reverse Plank Glide' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 90, 6, NULL, ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'xR Rotation Disk Twist' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 2, 90, 8, 'both', ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'xR Stability Ball Pike' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 3, 90, 6, NULL, ''); END IF;

  -- Block: Posterior Chain
  INSERT INTO class_blocks (id, class_id, name, order_index) VALUES (gen_random_uuid(), v_class_id, 'Posterior Chain', 4) RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'xR Hamstring Curl' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 90, 10, NULL, ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'xR Side-Lying Leg Press' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 90, 8, 'both', ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'xR Footwork - Single Leg' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 2, 60, 8, 'both', ''); END IF;

  -- Block: Recovery
  INSERT INTO class_blocks (id, class_id, name, order_index) VALUES (gen_random_uuid(), v_class_id, 'Recovery', 5) RETURNING id INTO v_block_id;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'xR Cooldown Stretch Series' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 0, 120, NULL, NULL, ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'xR Mermaid Side Stretch' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 1, 90, 4, 'both', ''); END IF;

  SELECT id INTO v_exercise_id FROM exercises WHERE name = 'xR Swan on Long Box' LIMIT 1;
  IF v_exercise_id IS NOT NULL THEN INSERT INTO block_exercises (id, block_id, exercise_id, order_index, duration, reps, side, notes) VALUES (gen_random_uuid(), v_block_id, v_exercise_id, 2, 90, 4, NULL, 'Gentle extension to finish'); END IF;

  RAISE NOTICE 'Successfully seeded all 15 class templates.';

END $$;
