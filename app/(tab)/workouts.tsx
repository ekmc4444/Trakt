import { StyleSheet } from 'react-native';
import { Link } from 'expo-router'; 
import { ThemedText } from '@/components/themed-text';
import { ThemedView, ThemedSafeAreaView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function index() {
  const colorScheme = useColorScheme();

  return (
    <ThemedSafeAreaView style={styles.container}>
    <ThemedView style={styles.container}>
      <ThemedText style={styles.text}>Home screen</ThemedText>
      <Link href="../about" style={styles.button}>
        <ThemedText>Go to About screen</ThemedText>
      </Link>
    </ThemedView>
    </ThemedSafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //backgroundColor: '#25292e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    //color: '#fff',
  },
  button: {
    fontSize: 20,
    textDecorationLine: 'underline',
    //color: '#fff',
  },
});
