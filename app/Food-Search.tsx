import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { searchFoods, parseMacros } from '@/utils/usda';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Router, useRouter } from 'expo-router';

let debounceTimer: ReturnType<typeof setTimeout>;

export default function FoodSearchScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    clearTimeout(debounceTimer);

    debounceTimer = setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await searchFoods(query);

        const foods = data.foods
          .sort((a: any, b: any) =>
            a.dataType === 'Branded' ? -1 : 1
          )
          .slice(0, 20);

        setResults(foods);
      } catch (err) {
        setError('Failed to search foods');
      } finally {
        setLoading(false);
      }
    }, 400);
  }, [query]);

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Search Foods</ThemedText>

      <TextInput
        placeholder="Search food (e.g. chicken breast)"
        value={query}
        onChangeText={setQuery}
        style={[styles.searchInput, {color: Colors[colorScheme ?? 'light'].text}]}
        autoCapitalize="none"
        autoCorrect={false}
        placeholderTextColor= {Colors[colorScheme ?? 'light'].placeholder}
      />

      {loading && <ActivityIndicator size="large" />}

      {error && <ThemedText style={styles.error}>{error}</ThemedText>}

      {!loading && query.length > 0 && results.length === 0 && (
        <ThemedText style={styles.empty}>No foods found</ThemedText>
      )}

      
      <FlatList
        data={results}
        keyExtractor={item => item.fdcId.toString()}
        contentContainerStyle={{ paddingBottom: 60 }}
        renderItem={({ item }) => {
          const macros = parseMacros(item);

          return (
            <Pressable onPress={() => {
                router.replace({
                pathname: '/add', // <-- your add screen route
                params: {
                    food: JSON.stringify({
                    name: item.description,
                    calories: macros.calories,
                    carbs: macros.carbs,
                    protein: macros.protein,
                    fats: macros.fat,
                    }),
                },
                });

            }} 
            style={[styles.card, {backgroundColor: Colors[colorScheme ?? 'light'].card}]}>
                <ThemedText style={styles.foodName}>{item.description}</ThemedText>

                {item.brandName && (
                    <ThemedText style={[styles.brand, {color: Colors[colorScheme ?? 'light'].placeholder}]}>{item.brandName}</ThemedText>
                )}

                <ThemedText style={styles.macros}>
                    {macros.calories} cal • Protein {macros.protein}g • Carbs {macros.carbs}g • Fats {macros.fat}g
                </ThemedText>

                <ThemedText style={[styles.serving, {color: Colors[colorScheme ?? 'light'].placeholder}]}>
                    Per {macros.servingSize} {macros.servingUnit}
                </ThemedText>
                </Pressable>
            );
            }}
      />
    </ThemedView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 120
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
    lineHeight: 28
  },
  searchInput: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 16,
    marginBottom: 12,
    fontSize: 16,
  },
  card: {
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
  },
  brand: {
    fontSize: 13,
    //color: '#777',
    marginTop: 2,
  },
  macros: {
    fontSize: 14,
    marginTop: 6,
  },
  serving: {
    fontSize: 12,
    //color: '#666',
    marginTop: 2,
  },
  error: {
    color: 'red',
    marginVertical: 8,
  },
  empty: {
    textAlign: 'center',
    marginTop: 20,
  },
});
