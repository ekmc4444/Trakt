import { StyleSheet, Pressable } from 'react-native';
import { Link } from 'expo-router'; 
import { ThemedText } from '@/components/themed-text';
import { ThemedView, ThemedSafeAreaView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/utils/supabase';
import { useState, useEffect } from 'react'
import SignOutButton from '@/components/social-auth-buttons/sign-out-button';
import { Colors } from '@/constants/theme';
import { adjustCaloriesForGoal } from '@/utils/goalAdjustment';
import GoalSpeedSegment from '@/components/GoalSpeedSegment';
import { router } from 'expo-router';
import { recalculateMacros } from '@/utils/recalculateMacros';


async function profileData() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return null;
    const { data: profile, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
    return profile;
  }

export default function index() {
  const colorScheme = useColorScheme();
  const [profile, setProfile] = useState<any>(null);
  const [goal, setGoal] = useState<any>(null);
  const [current_weight, setCurrentWeight] = useState<any>(null);
  const [goal_weight, setGoalWeight] = useState<any>(null);
  const [speed, setSpeed] = useState<'slow' | 'moderate' | 'aggressive'>('moderate');
  const [weeklyRate, setWeeklyRate] = useState<number | null>(null);
  const [adjustedCalories, setAdjustedCalories] = useState<number | null>(null);
  const [macros, setMacros] = useState<any>(null);


  useEffect (() => {
    profileData().then(setProfile)
  }, []);

  useEffect(() => {
      if (!profile?.current_weight || !profile?.goal_weight) return;

      if (profile.goal_weight > profile.current_weight) {
        setGoal('Gain');
      } else if (profile.goal_weight < profile.current_weight) {
        setGoal('Lose');
      } else {
        setGoal('Maintain');
      }
    }, [profile]);

  useEffect(() => {
      if (!profile || goal === 'Maintain') return;

      const { adjustedCalories, weeklyRate } =
        adjustCaloriesForGoal(profile.calorie_goal, goal, speed);

      const recalculated = recalculateMacros({
        calories: adjustedCalories,
        bodyweight: profile.current_weight,
      });

      setWeeklyRate(weeklyRate);
      setMacros(recalculated);
    }, [speed, profile, goal]);


    async function finalizeProfile() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id || !macros) return;

      if (goal !== 'Maintain'){
        await supabase
          .from('profiles')
          .update({
            calorie_goal: macros.calorie_goal,
            protein_goal: macros.protein_goal,
            carb_goal: macros.carb_goal,
            fat_goal: macros.fat_goal,
            weekly_rate: weeklyRate,
            goal_speed: speed,
            profile_complete: 'complete',
          })
          .eq('id', session.user.id);
        }

      router.replace('/(tab)');
    }



  return (
    <ThemedSafeAreaView style={styles.container}>
      <ThemedView style={[styles.cardView,{backgroundColor: Colors[colorScheme ?? 'light'].card}]}>
        <ThemedView style={[styles.card, {backgroundColor: Colors[colorScheme ?? 'light'].card}]}>
        <ThemedView style={[styles.titleView, {backgroundColor: 'transparent'}]}>
          <ThemedText style={[styles.title,{color: Colors[colorScheme ?? 'light'].text}]}>Goal: {goal} Weight</ThemedText>
        </ThemedView>
        <ThemedView style={[styles.titleView,{backgroundColor: 'transparent'}]}>
          {goal !== 'Maintain' && (
                <ThemedView style={[styles.segTab,{ gap: 10 }]}>
                  <ThemedText style={{ fontSize: 22, fontWeight: 600, color: Colors[colorScheme ?? 'light'].numbers }}>
                    Choose Your Pace
                  </ThemedText>

                  <GoalSpeedSegment value={speed} onChange={setSpeed} />

                  {weeklyRate !== null && (
                    <ThemedText style={{ fontSize: 18, fontWeight: 500, color: Colors[colorScheme ?? 'light'].numbers }}>
                      {goal} {Math.abs(weeklyRate).toFixed(2)} lb / week
                    </ThemedText>
                  )}
                </ThemedView>
              )}
        </ThemedView>
          <ThemedText style={{fontSize: 28, lineHeight: 28, paddingBottom: 10, fontWeight: 700, paddingLeft: 90}}>Daily Macros</ThemedText>
        
            <ThemedView style={[{backgroundColor: 'transparent', alignItems: 'center', paddingBottom: 20, paddingTop: 0,}]}>
              <ThemedView style={[styles.goals, {borderColor: Colors[colorScheme ?? 'light'].tint, backgroundColor: 'transparent'}]}>
                <ThemedText style={[styles.labels,{color: Colors[colorScheme ?? 'light'].numbers}]}>Calories                  {goal !== 'Maintain' ? macros?.calorie_goal : profile?.calorie_goal}</ThemedText>
              </ThemedView>
              <ThemedView style={[styles.goals, {borderColor: Colors[colorScheme ?? 'light'].tint, backgroundColor: 'transparent'}]}>
                <ThemedText style={[styles.labels,{color: Colors[colorScheme ?? 'light'].numbers}]}>Carbs                         {goal !== 'Maintain' ? macros?.carb_goal : profile?.carb_goal}g</ThemedText>
              </ThemedView>
              <ThemedView style={[styles.goals, {borderColor: Colors[colorScheme ?? 'light'].tint, backgroundColor: 'transparent'}]}>
                <ThemedText style={[styles.labels,{color: Colors[colorScheme ?? 'light'].numbers}]}>Protein                      {macros?.protein_goal}g</ThemedText>
              </ThemedView>
              <ThemedView style={[styles.goals, {borderColor: Colors[colorScheme ?? 'light'].tint, backgroundColor: 'transparent'}]}>
                <ThemedText style={[styles.labels,{color: Colors[colorScheme ?? 'light'].numbers}]}>Fats                              {macros?.fat_goal}g</ThemedText>
              </ThemedView>
              <ThemedView style={[styles.goals, {borderColor: Colors[colorScheme ?? 'light'].tint, backgroundColor: 'transparent'}]}>
                <ThemedText style={[styles.labels,{color: Colors[colorScheme ?? 'light'].numbers}]}>Water Goal             {profile?.water_goal}oz</ThemedText>
              </ThemedView>              
            </ThemedView>
          <Pressable onPress={finalizeProfile} style={[styles.buttonStyle, { borderColor: Colors[colorScheme ?? 'light'].tint }]}>
            <ThemedText style={[styles.button, {color: Colors[colorScheme ?? 'light'].numbers}]}>
              Finish Setup
            </ThemedText>
          </Pressable>
          <ThemedText></ThemedText>
        </ThemedView>
      </ThemedView>
    </ThemedSafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //backgroundColor: '#25292e',
    alignItems: 'center',
    //justifyContent: 'center',
  },
  cardView: {
    padding: 20,
    //marginTop: 18,
    borderRadius: 15
  },
  card: {
    height: 790,
    width: 350,
    borderRadius: 905,
    justifyContent: 'center'
  },
  titleView: {
    alignItems: 'center',
    paddingBottom: 20,
    paddingTop: 10,
    backgroundColor: 'transparent'

  },
  segTab: {
    backgroundColor: 'transparent',
    alignItems: 'center'
  },
  title: {
    fontSize: 35,
    lineHeight: 35,
    fontWeight: 800,
  },
  text: {
    fontSize: 35,
    lineHeight: 35,
    fontWeight: 600,
  },
  goals: {
    width: 350, 
    height: 75,
    justifyContent: 'center',
    alignItems: 'center',
    //paddingLeft: 20,
    borderRadius: 35,
    marginBottom: 10,
    borderWidth: 1,
    //paddingTop: 10
  },
  labels: {
    fontWeight: 600,
    fontSize: 30,
    lineHeight: 30
  },
  button: {
    fontSize: 20,
    fontWeight: 600
    //textDecorationLine: 'underline',
    //color: '#fff',
  },
  buttonStyle: {
    width: 200, 
    height: 45, 
    borderRadius: 22, 
    borderWidth: 1,
    justifyContent:'center', 
    alignItems: 'center',
    marginLeft: 75
  }
});
