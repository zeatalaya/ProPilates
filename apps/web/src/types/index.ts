// ── Core domain types ──

export type PilatesMethod = "mat" | "reformer" | "x-reformer" | "chair" | "tower" | "barrel" | "ring" | "band" | "foam_roller";
export type ClassType = "private" | "duet" | "group" | "virtual";
export type Difficulty = "beginner" | "intermediate" | "advanced";
export type MuscleGroup = "core" | "legs" | "arms" | "back" | "glutes" | "shoulders" | "full_body" | "hip_flexors" | "chest";
export type ExerciseCategory = "warmup" | "strength" | "flexibility" | "balance" | "cooldown" | "flow" | "cardio";
export type ExercisePace = "deliberate" | "moderate" | "flowing" | "dynamic";
export type PilatesSchool = "classical" | "basi" | "stott" | "romana" | "fletcher" | "polestar" | "balanced_body" | "contemporary";
export type Tier = "free" | "premium";
export type VerificationProvider = "basi" | "stott" | "balanced_body" | "polestar" | "other";

export interface Instructor {
  id: string;
  xion_address: string | null;
  name: string;
  bio: string;
  avatar_url: string | null;
  location: string;
  languages: string[];
  methods: PilatesMethod[];
  class_types: ClassType[];
  equipment: string[];
  certifications: string[];
  music_style: string;
  favorite_artists: string[];
  tier: Tier;
  onboarding_complete: boolean;
  created_at: string;
  updated_at: string;
}

export interface Exercise {
  id: string;
  name: string;
  method: PilatesMethod;
  category: ExerciseCategory;
  difficulty: Difficulty;
  muscle_groups: MuscleGroup[];
  description: string;
  cues: string[];
  default_duration: number; // seconds
  image_url: string | null;
  video_url: string | null;
  objective: string | null;
  apparatus: string | null;
  start_position: string | null;
  movement: string[] | null;
  pace: ExercisePace | null;
  school: PilatesSchool | null;
}

export interface ClassBlock {
  id: string;
  class_id: string;
  name: string;
  order_index: number;
  exercises: BlockExercise[];
}

export interface BlockExercise {
  id: string;
  block_id: string;
  exercise_id: string;
  exercise?: Exercise;
  order_index: number;
  duration: number;
  reps: number | null;
  side: "both" | "left" | "right" | null;
  notes: string;
}

export interface PilatesClass {
  id: string;
  instructor_id: string;
  title: string;
  description: string;
  method: PilatesMethod;
  class_type: ClassType;
  difficulty: Difficulty;
  duration_minutes: number;
  is_public: boolean;
  is_template: boolean;
  price: number | null; // in XION
  playlist_id: string | null;
  blocks: ClassBlock[];
  created_at: string;
  updated_at: string;
}

export interface Playlist {
  id: string;
  instructor_id: string;
  spotify_playlist_id: string;
  name: string;
  image_url: string | null;
  tracks: SpotifyTrack[];
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
  duration_ms: number;
  uri: string;
  image_url: string | null;
}

export interface PortfolioAccess {
  id: string;
  buyer_address: string;
  seller_address: string;
  class_id: string;
  token_id: string;
  price_paid: number;
  purchased_at: string;
}

export interface Verification {
  id: string;
  instructor_id: string;
  provider: VerificationProvider;
  proof_hash: string;
  verified_at: string;
  tx_hash: string | null;
  on_chain: boolean;
}

export interface Subscription {
  id: string;
  instructor_id: string;
  tier: Tier;
  started_at: string;
  expires_at: string | null;
  tx_hash: string | null;
}

// ── Teaching mode ──
export interface TeachingState {
  classId: string;
  currentBlockIndex: number;
  currentExerciseIndex: number;
  isPlaying: boolean;
  elapsed: number;
  totalElapsed: number;
}

// ── Marketplace ──
export interface MarketplaceListing {
  token_id: string;
  seller: string;
  class_id: string;
  pilatesClass?: PilatesClass;
  instructor?: Instructor;
  price: string; // uxion amount
  listed_at: string;
}

// ── Certification Badges ──
export interface CertificationBadge {
  tokenId: string;
  owner: string;
  provider: VerificationProvider;
  certifiedAt: string;
  txHash: string;
  metadata: BadgeMetadata;
}

export interface BadgeMetadata {
  name: string;
  description: string;
  image?: string;
  attributes: Array<{ trait_type: string; value: string }>;
}
