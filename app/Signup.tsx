import React, { useState, useEffect } from 'react';
import {Button, Alert, ScrollView, ActivityIndicator, KeyboardAvoidingView, Pressable, } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { supabase } from '@/utils/supabase';
import { calculateMacros, ACTIVITY_LEVELS, type MacrosResult, } from '@/utils/macroCalculator';
import { ThemedSafeAreaView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import SegmentedControlTab from 'react-native-segmented-control-tab';
import { Host, Picker, VStack, HStack } from '@expo/ui/swift-ui';
import { Platform } from 'react-native';

export default function ProfileSetup() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [macros, setMacros] = useState<MacrosResult | null>(null);

  // Form state
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [current_weight, setCurrentWeight] = useState('');
  const [height, setHeight] = useState('');
  const [goal_weight, setGoalWeight] = useState('');
  const [activity_level, setActivityLevel] = useState(0); // moderate default
  const activityLabel = ACTIVITY_LEVELS.find(level => level.value === activity_level)?.label || '';

  const calculatePreview = () => {
    const weight = parseFloat(current_weight);
    const heightIn = parseFloat(height);
    const ageNum = parseInt(age);

    if (!weight || !heightIn || !ageNum || isNaN(weight) || isNaN(heightIn) || isNaN(ageNum)) {
      Alert.alert('Please fill all fields');
      return;
    }

    const preview = calculateMacros({
      age: ageNum,
      gender,
      current_weight: weight,
      height: heightIn,
      activity_level,
      goal_weight: goal_weight ? parseFloat(goal_weight) : undefined,
    });

    setMacros(preview);
  };

  const saveProfile = async () => {
    setLoading(true);
    const weight = parseFloat(current_weight);
    const heightIn = parseFloat(height);
    const ageNum = parseInt(age);

    if (!weight || !heightIn || !ageNum) {
      Alert.alert('Please fill all required fields');
      setLoading(false);
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        Alert.alert('No user session');
        return;
      }

      const macros = calculateMacros({
        age: ageNum,
        gender,
        current_weight: weight,
        height: heightIn,
        activity_level,
        goal_weight: goal_weight ? parseFloat(goal_weight) : undefined,
      });

      // Save profile + calculated macros
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: session.user.id,
          age: ageNum,
          gender,
          current_weight: weight,
          height: heightIn,
          goal_weight: goal_weight ? parseFloat(goal_weight) : null,
          activity_level,
          // Save calculated macros
          calorie_goal: macros.calorie_goal,
          protein_goal: macros.protein_goal,
          carb_goal: macros.carb_goal,
          fat_goal: macros.fat_goal,
          water_goal: macros.water_goal,
          profile_complete: 'stats',  // onboarding done
        });

      if (error) throw error;

      //Alert.alert('Profile Saved!', `Your daily goals:\nCalories: ${macros.calorie_goal}\nProtein: ${macros.protein_goal}g`);
      
      // Navigate to tabs
      router.replace('/Signup-2');
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile');
      //console.error(error);
    } finally {
      setLoading(false);
    }
  };
    return (
        <ThemedSafeAreaView style={{ flex: 1, padding: 20 }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.select({ ios: 80, android: 20 })} enabled={true}>
          <ThemedView>
            <ThemedView style={{ alignItems: 'center', marginBottom: 10, marginTop: 20 }}>
                <ThemedText style={{ fontSize: 35, fontWeight: 'bold', marginBottom: 10, lineHeight: 35, }}>Profile Setup</ThemedText>
            </ThemedView>
            <ThemedView style={{flexDirection: 'column', marginBottom: 10}}>
                <ThemedText style={styles.labels}>Age</ThemedText>
                <ThemedView style={{ flexDirection: 'row'}}>
                    <TextInput
                    keyboardType="numeric"
                    enablesReturnKeyAutomatically={true}
                    returnKeyType='done'
                    value={age}
                    placeholder='Age (Years)'
                    onChangeText={setAge}
                    style={[styles.input, { borderColor: Colors[colorScheme ?? 'light'].numbers, backgroundColor: Colors[colorScheme ?? 'light'].card, color: Colors[colorScheme ?? 'light'].text }]}
                    />
                    <MaterialCommunityIcons name="calendar-month" size={35} color={Colors[colorScheme ?? 'light'].icon} style={{ position: 'absolute', top: 8, left: 325, zIndex: 1 }} />
                </ThemedView>
            </ThemedView>
            <ThemedView style={{flexDirection: 'column', marginBottom: 10}}>
                <ThemedText style={styles.labels}>Height</ThemedText>
                <ThemedView style={{ flexDirection: 'row'}}>
                    <TextInput
                      keyboardType="decimal-pad"
                      enablesReturnKeyAutomatically={true}
                      returnKeyType='done'
                      placeholder='Height (inches)'
                      value={height}
                      onChangeText={setHeight}
                      style={[styles.input, { borderColor: Colors[colorScheme ?? 'light'].numbers, backgroundColor: Colors[colorScheme ?? 'light'].card, color: Colors[colorScheme ?? 'light'].text }]}
                    />
                    <MaterialCommunityIcons name="human-male-height" size={35} color={Colors[colorScheme ?? 'light'].icon} style={{ position: 'absolute', top: 8, left: 325, zIndex: 1 }} />
                </ThemedView>
            </ThemedView>
            <ThemedView style={{flexDirection: 'column', marginBottom: 10}}>
                <ThemedText style={styles.labels}>Current Weight</ThemedText>
                <ThemedView style={{ flexDirection: 'row'}}>
                    <TextInput
                      keyboardType="decimal-pad"
                      enablesReturnKeyAutomatically={true}
                      returnKeyType='done'
                      placeholder='Current Weight (lbs)'
                      value={current_weight}
                      onChangeText={setCurrentWeight}
                      style={[styles.input, { borderColor: Colors[colorScheme ?? 'light'].numbers, backgroundColor: Colors[colorScheme ?? 'light'].card, color: Colors[colorScheme ?? 'light'].text }]}
                    />
                    <MaterialCommunityIcons name="weight-pound" size={35} color={Colors[colorScheme ?? 'light'].icon} style={{ position: 'absolute', top: 6, left: 325, zIndex: 1 }} />
                </ThemedView>
            </ThemedView>
            <ThemedView style={{flexDirection: 'column', marginBottom: 10}}>
                <ThemedText style={styles.labels}>Goal Weight</ThemedText>
                <ThemedView style={{ flexDirection: 'row'}}>
                    <TextInput
                      keyboardType="decimal-pad"
                      enablesReturnKeyAutomatically={true}
                      returnKeyType='done'
                      placeholder='Goal Weight (lbs)'
                      value={goal_weight}
                      onChangeText={setGoalWeight}
                      style={[styles.input, { borderColor: Colors[colorScheme ?? 'light'].numbers, backgroundColor: Colors[colorScheme ?? 'light'].card, color: Colors[colorScheme ?? 'light'].text }]}
                    />
                    <MaterialCommunityIcons name="weight-pound" size={35} color={Colors[colorScheme ?? 'light'].icon} style={{ position: 'absolute', top: 6, left: 325, zIndex: 1 }} />
                </ThemedView>
            </ThemedView>
            <ThemedView style={{flexDirection: 'column', marginBottom: 20}}>
                <ThemedText style={styles.labels}>Gender</ThemedText>
                <SegmentedControlTab
                    values={['Male', 'Female']}
                    selectedIndex={gender === 'male' ? 0 : 1}
                    onTabPress={(index) => setGender(index === 0 ? 'male' : 'female')}
                    borderRadius={50}
                    tabStyle={{ height: 50, backgroundColor: Colors[colorScheme ?? 'light'].card, borderColor: Colors[colorScheme ?? 'light'].card, }}
                    activeTabStyle={{ backgroundColor: Colors[colorScheme ?? 'light'].button, borderColor: Colors[colorScheme ?? 'light'].button, }}
                    activeTabTextStyle={{ color: Colors[colorScheme ?? 'light'].pickerActive, fontSize: 25 }}
                    tabTextStyle={{ color: Colors[colorScheme ?? 'light'].placeholder, fontSize: 25}}
                    activeTabOpacity={50}
                    tabsContainerStyle={{ width: 375, alignContent: 'center', marginLeft: 0 }}
                /> 
            </ThemedView>
            <ThemedView style={{flexDirection: 'column', marginBottom: 10}}>
                <ThemedText style={styles.labels}>Activity Level</ThemedText>
                    <SegmentedControlTab
                        values={ACTIVITY_LEVELS.map(level => level.title.toString())}
                        selectedIndex={ACTIVITY_LEVELS.findIndex(level => level.value === activity_level)}
                        onTabPress={(index => setActivityLevel(ACTIVITY_LEVELS[index].value))}
                        borderRadius={50}
                        tabStyle={{ height: 50, backgroundColor: Colors[colorScheme ?? 'light'].card, borderColor: Colors[colorScheme ?? 'light'].card }}
                        activeTabStyle={{ backgroundColor: Colors[colorScheme ?? 'light'].button, borderColor: Colors[colorScheme ?? 'light'].button }}
                        activeTabTextStyle={{ color: Colors[colorScheme ?? 'light'].pickerActive, fontSize: 25 }}
                        tabTextStyle={{ color: Colors[colorScheme ?? 'light'].placeholder, fontSize: 25 }}
                        activeTabOpacity={50}
                        tabsContainerStyle={{ width: 375, alignContent: 'center', marginLeft: 0 }}
                    />
                    <ThemedText style={{ marginTop: 10, fontSize: 20, color: Colors[colorScheme ?? 'light'].text, alignSelf                                                                                                                                                                             : 'center' }}>{activityLabel}</ThemedText>
            </ThemedView>

            <Pressable onPress={saveProfile} style={{ backgroundColor: Colors[colorScheme ?? 'light'].button, padding: 15, borderRadius: 50, alignItems: 'center', marginTop: 10, marginBottom: 10,    width: 300, alignSelf: 'center' }}>
                <ThemedText style={{ color: '#fff', fontSize: 18 }}>Complete Profile</ThemedText>
            </Pressable>
          </ThemedView>
        </KeyboardAvoidingView>
        </ThemedSafeAreaView>
    );
}
const styles = {
  input: {
    padding: 8, 
    marginBottom: 10, 
    borderRadius: 45,
    height: 50,
    width: 375,
    fontSize: 25,
    paddingLeft: 25,
    marginLeft: 0,

  },
  labels: {
    fontSize: 25,
    marginBottom: 5,
    marginLeft: 25,
  },
};