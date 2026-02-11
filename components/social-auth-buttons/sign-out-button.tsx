import React from 'react';
import { Button } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/utils/supabase';

export default function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut({ scope: 'local' });

    if (error) {
      console.error('Error signing out:', error);
      return;
    }

    console.log('Signed out, navigating to Login');
    router.replace('/Login');
  };

  return <Button title="Sign out" color={'white'} onPress={handleSignOut} />;
}

