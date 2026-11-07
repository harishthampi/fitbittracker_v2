export type TabType = 'today' | 'workouts' | 'nutrition' | 'progress';

export interface ExerciseSet {
  id: string;
  setNumber: number;
  weightKg: number;
  reps: number;
  completed: boolean;
}

export interface WorkoutExercise {
  id: string;
  name: string;
  targetMuscle: string;
  sets: ExerciseSet[];
  notes?: string;
}

export interface WorkoutPlan {
  id: string;
  title: string;
  category: 'Strength' | 'HIIT' | 'Cardio' | 'Mobility';
  durationMinutes: number;
  estimatedCalories: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  imageUrl: string;
  description: string;
  exercises: WorkoutExercise[];
}

export interface CompletedWorkout {
  id: string;
  workoutPlanId?: string;
  title: string;
  category: string;
  durationMinutes: number;
  caloriesBurned: number;
  timestamp: string; // ISO date string
  completedExercisesCount: number;
  totalExercisesCount: number;
}

export interface FoodItem {
  id: string;
  name: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  timestamp: string;
}

export interface DailyTargets {
  calories: number;
  workoutMinutes: number;
  steps: number;
  waterMl: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
}

export interface DailyStats {
  date: string; // YYYY-MM-DD
  caloriesBurned: number;
  caloriesConsumed: number;
  workoutMinutes: number;
  steps: number;
  waterMl: number;
  proteinConsumed: number;
  carbsConsumed: number;
  fatConsumed: number;
  weightKg?: number;
}

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  targetCount: number;
  currentCount: number;
  unit: string;
  xpReward: number;
  completed: boolean;
}

export interface AchievementBadge {
  id: string;
  title: string;
  category: 'streak' | 'workout' | 'nutrition' | 'community';
  description: string;
  iconName: string;
  unlockedAt?: string;
  progressPercent: number;
}

export interface LeaderboardMember {
  id: string;
  name: string;
  avatarSeed: string;
  steps: number;
  workoutsThisWeek: number;
  streakDays: number;
  isCurrentUser?: boolean;
}
