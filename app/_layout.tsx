// app/_layout.tsx
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack, Redirect } from 'expo-router';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';


import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/utils/supabase';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [userState, setUserState] = useState<'loading' | 'no-session' | 'new-user' | 'complete' | 'stats' >('loading');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!isMounted) return;

      if (!session?.user?.id) {
        setUserState('no-session');
      } else {
        // Check if profile is complete
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('profile_complete')
          .eq('id', session.user.id)
          .single();

        if (error || !profile || profile.profile_complete == 'new-user') {
          setUserState('new-user');
        } else if (profile.profile_complete == 'complete'){
          setUserState('complete')
        } else {
          setUserState('stats')
        }
      }

      setLoading(false);
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;

      if (event === 'SIGNED_OUT') {
        setUserState('no-session');
      } else if (session?.user?.id) {
        // Re-check profile on auth change
        init();
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const theme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

  return (

    <ThemeProvider value={theme}>
      <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen name="(tab)" options={{ headerShown: false }} />
        <Stack.Screen name="Login" options={{ headerShown: false }} />
        <Stack.Screen name="Signup" options={{ headerShown: false }} />
        <Stack.Screen name="Signup-2" options={{ headerShown: false }} />
        <Stack.Screen name="Food-Search" options={{ headerShown: true, title: 'Search', headerTransparent: true, headerBlurEffect: 'regular', headerBackButtonDisplayMode: "minimal"  }} />
        <Stack.Screen name="Barcode" options={{ headerShown: true, title: 'Barcode Scanner', headerTransparent: true, headerBlurEffect: 'regular', headerBackButtonDisplayMode: "minimal"  }} />
        <Stack.Screen name="Settings" options={{ headerShown: true, title: 'Settings', headerTransparent: true, headerBlurEffect: 'regular', headerBackButtonDisplayMode: "minimal" }} />
      </Stack>

      {/* Auto-redirect based on user state */}
      {userState === 'no-session' && <Redirect href="/Login" />}
      {userState === 'new-user' && <Redirect href="/Signup" />}
      {userState === 'stats' && <Redirect href="/Signup-2" />}
      {userState === 'complete' && <Redirect href="/(tab)" />}

      <StatusBar style="auto" />
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
