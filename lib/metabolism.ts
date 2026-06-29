import { ActivityLevel, CalorieGoal, GoalType, Goals, Sex } from '@/types';

export const activityMultipliers: Record<ActivityLevel, { label: string; multiplier: number }> = {
  sedentary: { label: 'Sedentary / little or no exercise', multiplier: 1.2 },
  light: { label: 'Light activity / 1–3 workouts per week', multiplier: 1.375 },
  moderate: { label: 'Moderate activity / 3–5 workouts per week', multiplier: 1.55 },
  veryActive: { label: 'Very active / 6–7 workouts per week', multiplier: 1.725 },
  athlete: { label: 'Athlete / physical job plus hard training', multiplier: 1.9 },
};

export const calculateBmr = (sex: Sex, age: number, heightCm: number, weightKg: number) =>
  10 * weightKg + 6.25 * heightCm - 5 * age + (sex === 'male' ? 5 : -161);

export const goalCalories = (tdee: number, goal: CalorieGoal) => {
  const adjustments: Record<CalorieGoal, number> = {
    maintain: 0,
    loseSlow: -300,
    loseStandard: -500,
    gainSlow: 250,
    gainStandard: 400,
  };
  return tdee + adjustments[goal];
};

export const simpleGoalType = (goal: CalorieGoal): GoalType => {
  if (goal.startsWith('lose')) return 'lose';
  if (goal.startsWith('gain')) return 'gain';
  return 'maintain';
};

export const recommendedTargets = ({
  sex,
  age,
  heightCm,
  weightKg,
  activityLevel,
  goal,
}: {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goal: CalorieGoal;
}) => {
  const bmr = calculateBmr(sex, age, heightCm, weightKg);
  const tdee = bmr * activityMultipliers[activityLevel].multiplier;
  const simpleGoal = simpleGoalType(goal);
  const caloriesByGoal: Record<GoalType, number> = { maintain: tdee, lose: tdee - 500, gain: tdee + 300 };
  const proteinFactors: Record<GoalType, number> = { maintain: 1.8, lose: 2, gain: 1.8 };
  const fatFactors: Record<GoalType, number> = { maintain: 0.8, lose: 0.7, gain: 0.9 };

  const calories = caloriesByGoal[simpleGoal];
  const protein = proteinFactors[simpleGoal] * weightKg;
  let fat = fatFactors[simpleGoal] * weightKg;
  let carbs = (calories - protein * 4 - fat * 9) / 4;
  let warning: string | undefined;

  if (carbs < 50) {
    fat = Math.max(0.6 * weightKg, (calories - protein * 4 - 50 * 4) / 9);
    carbs = (calories - protein * 4 - fat * 9) / 4;
  }

  if (carbs < 50) warning = 'Calories are probably too low for this body weight and macro minimums.';

  const targets: Goals = {
    calories: Math.round(calories),
    protein: Math.round(protein),
    fat: Math.round(fat),
    carbs: Math.max(0, Math.round(carbs)),
  };

  return { bmr: Math.round(bmr), tdee: Math.round(tdee), targets, warning };
};

export const macroRanges = (weightKg: number) => ({
  protein: `${(weightKg * 1.6).toFixed(0)}–${(weightKg * 2.2).toFixed(0)} g`,
  fat: `${(weightKg * 0.6).toFixed(0)}–${(weightKg * 1.0).toFixed(0)} g`,
});
