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
import { Header } from 'react-native-elements';
import SignOutButton from '@/components/social-auth-buttons/sign-out-button';

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
  const [activity_level, setActivityLevel] = useState(0);
  const activityLabel = ACTIVITY_LEVELS.find(level => level.value === activity_level)?.label || '';
  const [profile, setProfile] = useState<any>(null);

    return (
        <ThemedSafeAreaView style={{ flex: 1, padding: 20, paddingBottom: 0 }}>
        <ThemedView style={{paddingTop: 20}}>
        <Pressable onPress={() => router.replace("/Signup")} style={{borderWidth: 2, marginTop: 30, borderRadius: 50, backgroundColor: Colors[colorScheme ?? 'light'].button, borderColor: Colors[colorScheme ?? 'light'].button, height: 40, justifyContent: 'center', alignItems: 'center', }}>
          <ThemedText style={{fontSize: 18, color: 'white',}}>Update Profile</ThemedText>
        </Pressable>
        <ThemedView style={{borderWidth: 2, marginTop: 30, borderRadius: 50, backgroundColor: '#ad4949ff', borderColor: '#ad4949ff'}}>
          <SignOutButton/>
        </ThemedView>
        </ThemedView>
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

