const USDA_API_KEY = "IX2OL7SjJV8K8wkT8VcIQg28NFmRxRTjF3xYKAyz";

if (!USDA_API_KEY) {
  throw new Error('Missing USDA API key');
}

export async function searchFoods(query: string) {
  const response = await fetch(
    `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${USDA_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        pageSize: 25,
        dataType: ['Branded', 'Foundation', 'Survey (FNDDS)'],
      }),
    }
  );

  if (!response.ok) {
    throw new Error('USDA API request failed');
  }

  return response.json();
}

function getNutrient(nutrients: any[], name: string) {
  return nutrients.find(n => n.nutrientName === name)?.value ?? 0;
}

export function parseMacros(food: any) {
  const nutrients = food.foodNutrients || [];

  return {
    calories: Math.round(getNutrient(nutrients, 'Energy')),
    protein: Number(getNutrient(nutrients, 'Protein').toFixed(1)),
    carbs: Number(
      getNutrient(nutrients, 'Carbohydrate, by difference').toFixed(1)
    ),
    fat: Number(getNutrient(nutrients, 'Total lipid (fat)').toFixed(1)),
    servingSize: food.servingSize ?? 100,
    servingUnit: food.servingSizeUnit ?? 'g',
  };
}
