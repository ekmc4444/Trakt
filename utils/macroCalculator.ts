// utils/macroCalculator.ts
import { supabase } from './supabase'; // adjust import path

interface Profile {
  current_weight: number;     // lbs
  height: number;             // inches
  age: number;                // years
  gender: 'male' | 'female';
  activity_level: number;     // 1.2–1.9
  goal_weight?: number;       // optional lbs
  calorie_goal?: number;      // manual override
}

export interface MacrosResult {
  calorie_goal: number;
  protein_goal: number;
  carb_goal: number;
  fat_goal: number;
  water_goal: number;
  bmr: number;
  tdee: number;
  recommendation: 'lose' | 'maintain' | 'gain';
}

// Activity level presets
export const ACTIVITY_LEVELS = [
  { value: 1.2, label: 'Sedentary (little/no exercise)', title: 1 },
  { value: 1.375, label: 'Lightly Active (1-3 days/week)', title: 2 },
  { value: 1.55, label: 'Moderately Active (3-5 days/week)', title: 3 },
  { value: 1.725, label: 'Very Active (6-7 days/week)', title: 4 },
  { value: 1.9, label: 'Extra Active (hard exercise 2x/day)', title: 5 },
] as const;

/**
 * Fetch user profile from Supabase and calculate macros
 */
export async function getUserMacros(userId: string): Promise<MacrosResult | null> {
  try {
    // 1. Get profile from Supabase
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('current_weight, height, age, gender, activity_level, goal_weight, calorie_goal')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      console.error('Profile fetch error:', error);
      return null;
    }

    // 2. Calculate macros
    return calculateMacros(profile);
  } catch (err) {
    console.error('Macro calculation error:', err);
    return null;
  }
}

/**
 * Calculate macros from profile data (Mifflin-St Jeor + evidence-based ratios)
 */
export function calculateMacros(profile: Profile): MacrosResult {
  const weightKg = profile.current_weight / 2.20462;
  const heightCm = profile.height * 2.54;

  // BMR (Mifflin-St Jeor - most accurate formula)
  let bmr: number;
  if (profile.gender === 'male') {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * profile.age + 5;
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * profile.age - 161;
  }

  // TDEE (maintenance calories)
  const tdee = bmr * profile.activity_level;

  // Goal calories (auto or override)
  let calorie_goal = profile.calorie_goal || tdee;
  let recommendation: 'lose' | 'maintain' | 'gain' = 'maintain';

  if (!profile.calorie_goal) {
    const weightDiffPct = profile.goal_weight ? 
      (profile.goal_weight - profile.current_weight) / profile.current_weight : 0;

    if (weightDiffPct > 0.02) {      // gain >2%
      calorie_goal = tdee * 1.15;    // 15% surplus
      recommendation = 'gain';
    } else if (weightDiffPct < -0.02) { // lose >2%
      calorie_goal = tdee * 0.85;    // 15% deficit
      recommendation = 'lose';
    } else {
      calorie_goal = tdee;
      recommendation = 'maintain';
    }
  }

  // Macros (g/lb bodyweight - evidence-based)
  const protein_goal = profile.current_weight * 0.8;  // 1.76g/kg
  const fat_goal = profile.current_weight * 0.4;      // 25-30% calories minimum
  const proteinCals = protein_goal * 4;
  const fatCals = fat_goal * 9;
  const carbCals = calorie_goal - (proteinCals + fatCals);
  const carb_goal = Math.max(50, carbCals / 4);       // minimum 50g carbs

  const water_goal = Math.round(profile.current_weight * 0.67); // 2/3 oz per lb

  return {
    calorie_goal: Math.round(calorie_goal),
    protein_goal: Math.round(protein_goal),
    fat_goal: Math.round(fat_goal),
    carb_goal: Math.round(carb_goal),
    water_goal,
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    recommendation,
  };
}

/**
 * Save macros back to user's profile
 */
export async function saveUserMacros(userId: string, macros: MacrosResult): Promise<boolean> {
  const { error } = await supabase
    .from('profiles')
    .update({
      calorie_goal: macros.calorie_goal,
      protein_goal: macros.protein_goal,
      carb_goal: macros.carb_goal,
      fat_goal: macros.fat_goal,
      water_goal: macros.water_goal,
      profile_complete: true,  // mark onboarding done
    })
    .eq('id', userId);

  return !error;
}
