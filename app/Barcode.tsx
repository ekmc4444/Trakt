import { View, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { searchFoods, parseMacros } from '@/utils/usda';

export default function Barcode() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!permission) return <View />;

  if (!permission.granted) {
    requestPermission();
    return <View />;
  }

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;

    setScanned(true);
    setLoading(true);

    try {
      const usda = await searchFoods(data);

      if (usda?.foods?.length) {
        const food = usda.foods[0];
        const macros = parseMacros(food);

        router.replace({
          pathname: '/add',
          params: {
            food: JSON.stringify({
              name: food.description,
              calories: macros.calories,
              carbs: macros.carbs,
              protein: macros.protein,
              fats: macros.fat,
            }),
          },
        });
        return;
      }

      const res = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${data}.json`
      );
      const off = await res.json();

      if (off.status === 1) {
        const p = off.product;

        router.replace({
          pathname: '/add',
          params: {
            food: JSON.stringify({
              name: p.product_name ?? 'Unknown food',
              calories: p.nutriments?.['energy-kcal_100g'] ?? '',
              carbs: p.nutriments?.['carbohydrates_100g'] ?? '',
              protein: p.nutriments?.['proteins_100g'] ?? '',
              fats: p.nutriments?.['fat_100g'] ?? '',
            }),
          },
        });
        return;
      }

      throw new Error('Not found');
    } catch {
      Alert.alert(
        'Food not found',
        'We couldn’t find nutrition data for this barcode.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'],
        }}
        onBarcodeScanned={handleBarcodeScanned}
      />

      {loading && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
});
