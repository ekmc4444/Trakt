import React, { useState } from 'react';
import { Alert, StyleSheet, View, ActivityIndicator, KeyboardAvoidingView } from 'react-native';
import { supabase } from '@/utils/supabase';
import { Button } from 'react-native-elements';
import { ThemedSafeAreaView, ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { TextInput, Image } from 'react-native';
import { DarkTheme } from '@react-navigation/native';

export default function Auth() {
  const colorScheme = useColorScheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [fname, setFname] = useState('');
  const [lname, setLname] = useState('');
  const [showSignUp, setShowSignUp] = useState(false);

  // Single handler that signs up and then upserts profile
  const handleSignUpAndProfile = async () => {
    setLoading(true);
    try {
      // Sign up user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        Alert.alert('Sign up error', signUpError.message);
        setLoading(false);
        return;
      }

      // Get the user object (works with supabase-js v2)
      const {
        data: { user },
        error: getUserError,
      } = await supabase.auth.getUser();

      if (getUserError) {
        Alert.alert('User error', getUserError.message);
        setLoading(false);
        return;
      }

      if (!user) {
        Alert.alert('Check email', 'Please verify your email before creating a profile.');
        setLoading(false);
        return;
      }

      // Upsert profile. Use array form and onConflict to avoid duplicate key errors.
      const profileRow = {
        id: user.id,
        first_name: fname,
        last_name: lname,
        email,
        profile_complete: 'new-user',
      };

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .upsert([profileRow], { onConflict: 'id' })
        .select()
        .single();

      if (profileError) {
        Alert.alert('Profile error', profileError.message);
      } else {
        Alert.alert('Success', 'Profile saved successfully.');
        //console.log('Profile upserted', profileData);
      }
    } catch (err) {
      //console.error('Unexpected error', err);
      Alert.alert('Unexpected error', 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert(error.message);
    }
    // No navigation needed here — _layout onAuthStateChange(SIGNED_IN) will auto-switch to (tab)

    setLoading(false);
  }

  const logoSource =
  colorScheme === 'dark'
    ? require('../assets/images/TrackrDark.png')
    : require('../assets/images/Trackr.png');

  return (
    <KeyboardAvoidingView>
      <ThemedSafeAreaView>
        <Image
          source={logoSource}
          style={{ width: 700, height: 250, alignSelf: 'center', marginTop: 50, marginBottom: 0, paddingRight: 30 }}
        />
        <ThemedView style={[styles.container, { marginBottom: showSignUp ? 150 : 3500, marginTop: showSignUp ? 5 : 5 }]}>
          <ThemedView style={[styles.verticallySpaced, styles.mt20]}>
            {/* Only show name fields when signing up */}
            {showSignUp && (
              <>
                <ThemedText style={[styles.text, { color: Colors[colorScheme ?? 'light'].text }]}>
                  First Name
                </ThemedText>
                <ThemedView style={{ marginBottom: 10, marginTop: 10, paddingLeft: 10 }}>
                  <TextInput
                    onChangeText={setFname}
                    value={fname}
                    placeholder="First Name"
                    autoCapitalize="words"
                    style={{
                      color: Colors[colorScheme ?? 'light'].text,
                      fontSize: 18,
                      borderBottomWidth: 1,
                      borderBottomColor: Colors[colorScheme ?? 'light'].text,
                      paddingBottom: 4,
                      paddingTop: 4,
                    }}
                  />
                </ThemedView>

                <ThemedText style={[styles.text, { color: Colors[colorScheme ?? 'light'].text }]}>
                  Last Name
                </ThemedText>
                <ThemedView style={{ marginBottom: 10, marginTop: 10, paddingLeft: 10 }}>
                  <TextInput
                    onChangeText={setLname}
                    value={lname}
                    placeholder="Last Name"
                    autoCapitalize="words"
                    style={{
                      color: Colors[colorScheme ?? 'light'].text,
                      fontSize: 18,
                      borderBottomWidth: 1,
                      borderBottomColor: Colors[colorScheme ?? 'light'].text,
                      paddingBottom: 4,
                      paddingTop: 4,
                    }}
                  />
                </ThemedView>
              </>
            )}

            {/* Email & Password always visible */}
            <ThemedText style={[styles.text, { color: Colors[colorScheme ?? 'light'].text }]}>
              Email
            </ThemedText>
            <ThemedView style={{ marginBottom: 10, marginTop: 10, paddingLeft: 10 }}>
              <TextInput
                onChangeText={setEmail}
                value={email}
                placeholder="Email"
                autoCapitalize="none"
                keyboardType="email-address"
                style={{
                  color: Colors[colorScheme ?? 'light'].text,
                  fontSize: 18,
                  borderBottomWidth: 1,
                  borderBottomColor: Colors[colorScheme ?? 'light'].text,
                  paddingBottom: 4,
                  paddingTop: 4,
                }}
              />
            </ThemedView>

            <ThemedText style={[styles.text, { color: Colors[colorScheme ?? 'light'].text }]}>
              Password
            </ThemedText>
            <ThemedView style={{ marginBottom: 10, marginTop: 10, paddingLeft: 10 }}>
              <TextInput
                onChangeText={setPassword}
                value={password}
                placeholder="Password"
                autoCapitalize="none"
                secureTextEntry
                style={{
                  color: Colors[colorScheme ?? 'light'].text,
                  fontSize: 18,
                  borderBottomWidth: 1,
                  borderBottomColor: Colors[colorScheme ?? 'light'].text,
                  paddingBottom: 4,
                  paddingTop: 4,
                }}
              />
            </ThemedView>
          </ThemedView>

          {/* Action buttons */}
          <View style={[styles.verticallySpaced, styles.mt20]}>
            {!showSignUp ? (
              // Sign in visible when NOT in sign-up mode
              <Button
                title="Sign in"
                buttonStyle={{ backgroundColor: '#718d34ff' }}
                disabled={loading}
                onPress={signInWithEmail}
              />
            ) : (
              // Sign up visible only when in sign-up mode
              <View style={styles.verticallySpaced}>
                <Button
                  buttonStyle={{ backgroundColor: '#718d34ff' }}
                  title={loading ? 'Please wait...' : 'Sign up'}
                  disabled={loading}
                  onPress={handleSignUpAndProfile}
                />
                {loading && <ActivityIndicator style={{ marginTop: 8 }} />}
              </View>
            )}
          </View>

          {/* Toggle button to switch between sign in / sign up */}
          <ThemedView style={styles.verticallySpaced}>
            <Button
              title={showSignUp ? 'Have an account? Sign in' : "Don't have an account? Sign up"}
              type='clear'
              titleStyle={{ color: Colors[colorScheme ?? 'light'].numbers }}
              onPress={() => setShowSignUp((s) => !s)}
            />
          </ThemedView>
        </ThemedView>
      </ThemedSafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 200,
    padding: 12,
    marginBottom: 150,
  },
  verticallySpaced: {
    paddingTop: 1,
    paddingBottom: 1,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },
  inputText: {
    fontSize: 1,
  },
  inputContainer: {
    borderBottomWidth: 1,
  },
  text: {
    paddingLeft: 10,
    fontWeight: '700',
    paddingBottom: 0,
    fontSize: 20,
    paddingTop: 10,
  },
});
