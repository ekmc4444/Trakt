interface MacroInputs {
  calories: number;
  bodyweight: number; // lbs
}

export interface RecalculatedMacros {
  calorie_goal: number;
  protein_goal: number;
  fat_goal: number;
  carb_goal: number;
}

export function recalculateMacros({
  calories,
  bodyweight,
}: MacroInputs): RecalculatedMacros {
  // Protein & fat anchored to weight
  const protein_goal = bodyweight * 0.8; // g/lb
  const fat_goal = bodyweight * 0.4;     // g/lb

  const proteinCals = protein_goal * 4;
  const fatCals = fat_goal * 9;

  // Remaining calories go to carbs
  const remaining = calories - (proteinCals + fatCals);

  const carb_goal = Math.max(50, remaining / 4);

  return {
    calorie_goal: Math.round(calories),
    protein_goal: Math.round(protein_goal),
    fat_goal: Math.round(fat_goal),
    carb_goal: Math.round(carb_goal),
  };
}
