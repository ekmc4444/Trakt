export type GoalSpeed =
  | 'slow'
  | 'moderate'
  | 'aggressive';

interface AdjustmentResult {
  adjustedCalories: number;
  weeklyRate: number; // lbs per week (+ gain, - loss)
}

export function adjustCaloriesForGoal(
  tdee: number,
  goal: 'Lose' | 'Gain',
  speed: GoalSpeed
): AdjustmentResult {
  const calorieMap = {
    slow: 250,
    moderate: 500,
    aggressive: 750,
  };

  const delta = calorieMap[speed];

  if (goal === 'Lose') {
    return {
      adjustedCalories: Math.round(tdee - delta),
      weeklyRate: -(delta * 7) / 3500,
    };
  }

  return {
    adjustedCalories: Math.round(tdee + delta),
    weeklyRate: (delta * 7) / 3500,
  };
}
