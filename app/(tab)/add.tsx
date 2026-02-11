import { KeyboardAvoidingView, Pressable, StyleSheet } from 'react-native';
import { Link, useRouter } from 'expo-router'; 
import { ThemedText } from '@/components/themed-text';
import { ThemedView, ThemedSafeAreaView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import SegmentedControlTab from 'react-native-segmented-control-tab';
import { useState, useEffect } from 'react';
import { Colors } from '@/constants/theme';
import { TextInput, Button } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Icon } from 'expo-router/unstable-native-tabs';
import { Router } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import { useRef, useMemo } from 'react';
import BottomSheet from '@gorhom/bottom-sheet';
import { useWindowDimensions } from 'react-native';

export default function index() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  const [type, setType] = useState<any>('Food');
  const [name, setName] = useState<string>('');
  const [cal, setCal] = useState<string>('');
  const [carbs, setCarbs] = useState<string>('');
  const [protein, setProtein] = useState<string>('');
  const [fats, setFats] = useState<string>('');
  const [water, setWater] = useState<string>('');
  const [servings, setServings] = useState<number>(1);

  const params = useLocalSearchParams();

  const { width } = useWindowDimensions();
  const [isWeightSheetOpen, setIsWeightSheetOpen] = useState(false);
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = ['25%', '50%'];
  //const snapPoints = useMemo(() => ['25%', '50%'], []); // first half screen, second half
  const [weight, setWeight] = useState<string>(''); // weight input

  const openWeightSheet = () => setIsWeightSheetOpen(true);
  const closeWeightSheet = () => setIsWeightSheetOpen(false);

  useEffect(() => {
    if (!params.food) return;

    const food = JSON.parse(params.food as string);

    setName(food.name ?? '');
    setCal(String(food.calories ?? ''));
    setCarbs(String(food.carbs ?? ''));
    setProtein(String(food.protein ?? ''));
    setFats(String(food.fats ?? ''));
    
    router.setParams({ food: undefined });
  }, [params.food]);

  return ( 
    <ThemedSafeAreaView style={styles.container}> 
      <ThemedView style={styles.titleContainer}>
        <ThemedView style={{paddingRight: 200}}>
            <ThemedText style={[styles.title]}>
              Log Stats:
            </ThemedText>
        </ThemedView>
        <ThemedView style={{flexDirection: 'row', justifyContent: 'space-between', paddingTop: 0}}>
          <ThemedView style={[styles.buttonView,{backgroundColor: Colors[colorScheme ?? 'light'].olive}]}>
            <Pressable style={styles.button2} onPress={openWeightSheet}>
              <ThemedView style={{flexDirection: 'row', backgroundColor: 'transparent', alignItems: 'center'}}>
                <Ionicons name="scale-outline" size={30} color={Colors[colorScheme ?? 'light'].background}/>
                <ThemedText style={{color: Colors[colorScheme ?? 'light'].background, paddingLeft: 10,}}>Weight</ThemedText>
              </ThemedView>
            </Pressable>
          </ThemedView>
          <ThemedView style={{ width: 5 }} />
          <ThemedView style={[styles.buttonView,{backgroundColor: Colors[colorScheme ?? 'light'].olive, flexDirection: 'row', justifyContent: 'space-around', }]}>
            <ThemedView style={{backgroundColor: 'transparent'}}>
              <Pressable style={[styles.button2, {flexDirection: 'row', alignItems: 'center'}]} onPress={() => router.push('/Barcode')}>
                  <MaterialCommunityIcons name="barcode-scan" size={24} color={Colors[colorScheme ?? 'light'].background} />
                  <ThemedText style={{color: Colors[colorScheme ?? 'light'].background, paddingLeft: 10}}>Barcode</ThemedText>
              </Pressable>
            </ThemedView>
          </ThemedView>
          <ThemedView style={{ width: 5 }} />
          <ThemedView style={[styles.buttonView,{backgroundColor: Colors[colorScheme ?? 'light'].olive, flexDirection: 'row', justifyContent: 'space-around', }]}>
            <ThemedView style={{backgroundColor: 'transparent'}}>
              <Pressable style={[styles.button2, {flexDirection: 'row', alignItems: 'center'}]} onPress={() => router.push('/Food-Search')}>
                  <Ionicons name="search" size={24} color={Colors[colorScheme ?? 'light'].background} />
                  <ThemedText style={{color: Colors[colorScheme ?? 'light'].background, paddingLeft: 10}}>Search</ThemedText>
              </Pressable>
            </ThemedView>
          </ThemedView>
        </ThemedView>
        <SegmentedControlTab
            values={['Food', 'Water']}
            selectedIndex={type === 'Food' ? 0 : 1}
            onTabPress={(index) => setType(index === 0 ? 'Food' : 'Water')}
            borderRadius={18}

            tabStyle={{
              height: 30,
              backgroundColor: 'transparent',
              borderWidth: 0,
              borderColor: 'transparent',
              margin: 4,  
            }}

            activeTabStyle={{
              backgroundColor: Colors[colorScheme ?? 'light'].taupe,
              borderRadius: 10,
              margin: 4,              // 👈 creates floating pill
              shadowColor: '#000',    // 👇 subtle iOS shadow
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 3,
              borderWidth: 0,
              borderColor: 'transparent'
              //elevation: 2,
            }}

            tabTextStyle={{
              color: Colors[colorScheme ?? 'light'].placeholder,
              fontSize: 16,
              fontWeight: '500',
            }}

            activeTabTextStyle={{
              color: Colors[colorScheme ?? 'light'].background,
              fontSize: 16,
              fontWeight: '600',
            }}

            tabsContainerStyle={{
              width: 370,
              padding: 4,
              backgroundColor: Colors[colorScheme ?? 'light'].card,
              borderRadius: 18,
              
            }}
          />

        </ThemedView>
      {type === 'Food' && (
        <ThemedView style={[styles.container]}>      
      <ThemedView style={[styles.inputContainer, {backgroundColor: Colors[colorScheme ?? 'light'].card}]}>
        <KeyboardAvoidingView>
        <ThemedText style={[styles.text, {paddingLeft: 10, color: Colors[colorScheme ?? 'light'].numbers}]}>Food Name:</ThemedText>
        <TextInput 
          style={[styles.text2, {color: Colors[colorScheme ?? 'light'].text, height: 35, width: 350, paddingLeft: 10 }]} 
          value={name} 
          placeholder='Enter Food Name' 
          keyboardType='default' 
          enablesReturnKeyAutomatically={false}
          returnKeyType='default'
          onChangeText={setName}
          placeholderTextColor={Colors[colorScheme ?? 'light'].placeholder} />
        </KeyboardAvoidingView>
      </ThemedView>
      <ThemedView style={styles.cards}>
        <ThemedView style={[styles.card,{backgroundColor: Colors[colorScheme ?? 'light'].card}]}>
          <ThemedText style={[styles.text, {fontSize: 35, lineHeight: 35, paddingBottom: 10, color: Colors[colorScheme ?? 'light'].numbers}]}>Calories</ThemedText>
          <KeyboardAvoidingView behavior='padding' enabled style={{flexDirection: 'row'}}>
            <TextInput 
              style={[styles.text, {color: Colors[colorScheme ?? 'light'].text, height: 55, width: 110, paddingLeft: 20, textAlign: 'right'  }]} 
              value={cal} 
              placeholder='##' 
              keyboardType='number-pad' 
              enablesReturnKeyAutomatically={false}
              returnKeyType='done'
              onChangeText={setCal}
              placeholderTextColor={Colors[colorScheme ?? 'light'].placeholder} />
            <ThemedText style={[styles.units,{color: Colors[colorScheme ?? 'light'].olive}]}>cal</ThemedText>

        </KeyboardAvoidingView>
        </ThemedView>
        <ThemedView style={[styles.card,{backgroundColor: Colors[colorScheme ?? 'light'].card}]}>
          <ThemedText style={[styles.text, {fontSize: 35, lineHeight: 35, paddingBottom: 10, color: Colors[colorScheme ?? 'light'].numbers}]}>Carbs</ThemedText>
          <KeyboardAvoidingView behavior='padding' enabled style={{flexDirection: 'row'}}>
            <TextInput 
              style={[styles.text, {color: Colors[colorScheme ?? 'light'].text, height: 55, width: 120, paddingLeft: 20, textAlign: 'right' }]} 
              value={carbs} 
              placeholder='##' 
              keyboardType='number-pad' 
              enablesReturnKeyAutomatically={false}
              returnKeyType='done'
              onChangeText={setCarbs}
              placeholderTextColor={Colors[colorScheme ?? 'light'].placeholder} />
            <ThemedText style={[styles.units,{color: Colors[colorScheme ?? 'light'].olive}]}>g</ThemedText>
        </KeyboardAvoidingView>
        </ThemedView>
        <ThemedView style={[styles.card,{backgroundColor: Colors[colorScheme ?? 'light'].card}]}>
          <ThemedText style={[styles.text, {fontSize: 35, lineHeight: 35, paddingBottom: 10, color: Colors[colorScheme ?? 'light'].numbers}]}>Protein</ThemedText>
          <KeyboardAvoidingView behavior='padding' enabled style={{flexDirection: 'row'}}>
            <TextInput 
              style={[styles.text, {color: Colors[colorScheme ?? 'light'].text, height: 55, width: 120, paddingLeft: 20, textAlign: 'right' }]} 
              value={protein} 
              placeholder='##' 
              keyboardType='number-pad' 
              enablesReturnKeyAutomatically={false}
              returnKeyType='done'
              onChangeText={setProtein}
              placeholderTextColor={Colors[colorScheme ?? 'light'].placeholder} />
            <ThemedText style={[styles.units,{color: Colors[colorScheme ?? 'light'].olive}]}>g</ThemedText>
        </KeyboardAvoidingView>
        </ThemedView>
        <ThemedView style={[styles.card,{backgroundColor: Colors[colorScheme ?? 'light'].card}]}>
          <ThemedText style={[styles.text, {fontSize: 35, lineHeight: 35, paddingBottom: 10, color: Colors[colorScheme ?? 'light'].numbers}]}>Fats</ThemedText>
          <KeyboardAvoidingView behavior='padding' enabled style={{flexDirection: 'row'}}>
            <TextInput 
              style={[styles.text, {color: Colors[colorScheme ?? 'light'].text, height: 55, width: 120, paddingLeft: 20, textAlign: 'right' }]} 
              value={fats} 
              placeholder='##' 
              keyboardType='number-pad' 
              enablesReturnKeyAutomatically={false}
              returnKeyType='done'
              onChangeText={setFats}
              placeholderTextColor={Colors[colorScheme ?? 'light'].placeholder} />
            <ThemedText style={[styles.units,{color: Colors[colorScheme ?? 'light'].olive}]}>g</ThemedText>
        </KeyboardAvoidingView>
        </ThemedView>
      </ThemedView>
      <ThemedView style={{ flexDirection: 'column', alignItems: 'center'}}>
        <ThemedText style={[styles.text,{color: Colors[colorScheme ?? 'light'].numbers}]}>Servings</ThemedText>
        <ThemedView style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}>
        <Pressable onPress={() => setServings(s => Math.max(1, s - 1))}>
          <Ionicons name="remove-circle-outline" size={32} color={Colors[colorScheme ?? 'light'].text}/>
        </Pressable>
        <ThemedText style={{ fontSize: 30, marginHorizontal: 16, lineHeight: 30 }}>{servings}</ThemedText>
        <Pressable onPress={() => setServings(s => s + 1)}>
          <Ionicons name="add-circle-outline" size={32} color={Colors[colorScheme ?? 'light'].text}/>
        </Pressable>
      </ThemedView>
      </ThemedView>
      <ThemedView style={[styles.buttonView,{backgroundColor: Colors[colorScheme ?? 'light'].numbers}]}>
        <Pressable style={styles.button}>
          <ThemedView style={{flexDirection: 'row', backgroundColor: 'transparent', alignItems: 'center'}}>
            <Ionicons name="add" size={35} color={Colors[colorScheme ?? 'light'].background}/>
            <ThemedText style={{color: Colors[colorScheme ?? 'light'].background, paddingLeft: 10, fontSize: 25, lineHeight: 35}}>Add Stats</ThemedText>
          </ThemedView>
        </Pressable>
      </ThemedView>
      </ThemedView>
      )}
      {type === 'Water' && (
            <ThemedView
              style={[
                styles.inputContainer,
                { backgroundColor: Colors[colorScheme ?? 'light'].card },
              ]}
            >
              <ThemedText style={[styles.text, { color: Colors[colorScheme ?? 'light'].numbers }]}>
                Water Intake
              </ThemedText>

              <TextInput
                value={water}
                onChangeText={setWater}
                keyboardType="number-pad"
                placeholder="Ounces"
                style={[styles.text2, { color: Colors[colorScheme ?? 'light'].text }]}
                placeholderTextColor={Colors[colorScheme ?? 'light'].placeholder}
              />
            </ThemedView>
          )} 

      <BottomSheet ref={sheetRef} index={-1} snapPoints={snapPoints}>
        <ThemedView style={{ flex: 1, alignItems: 'center', padding: 20 }}>
          <TextInput value={weight} onChangeText={setWeight} placeholder="lbs" />
          <Pressable onPress={() => sheetRef.current?.close()}>
            <ThemedText>Done</ThemedText>
          </Pressable>
        </ThemedView>
      </BottomSheet>
          </ThemedSafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //backgroundColor: '#25292e',
    alignItems: 'center',
    paddingTop: 0
    //justifyContent: 'center',
  },
  text: {
    //color: '#fff',
    fontSize: 35,
    lineHeight: 35,
    fontWeight: 600,

  },
  text2: {
    //color: '#fff',
    fontSize: 25,
    lineHeight: 35,
    fontWeight: 600,

  },
  button: {
    //fontSize: 20,
    //textDecorationLine: 'underline',
    //color: '#fff',
    height: 40,
    width: 370,
    //borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',

  },
  button2: {
    //fontSize: 20,
    //textDecorationLine: 'underline',
    //color: '#fff',
    height: 40,
    width: 120,
    //borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    //padding: 0
  },
  button3: {
    //fontSize: 20,
    //textDecorationLine: 'underline',
    //color: '#fff',
    height: 40,
    width: 370,
    //borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    //padding: 0
  },
  buttonView: {
    alignItems: 'center',
    borderRadius: 15,
    marginBottom: 10,
    marginTop: 10
  },
  titleContainer: {
    alignItems: 'center',
    paddingTop: 10
  },
  title: {
    fontSize: 35,
    lineHeight: 35,
    paddingBottom: 0,
    fontWeight: 600
  },
  cards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    paddingLeft: 25,
    paddingRight: 25,
    paddingTop: 5,
    paddingBottom: 10,
    
  },
  card: {
    height: 130,
    width: 174,
    //borderWidth: 1,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 5,
    justifyContent: 'center'
  },
  units: {
    fontSize: 20,
    lineHeight: 45,
    fontWeight: 600,
    paddingLeft: 5
  },
  inputContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    //padding: 0,
    //borderWidth: 1,
    height: 115,
    width: 370,
    marginTop: 5,
    borderRadius: 15
  },
  stats: {
    flexDirection:'row',
    height: 55,
    width: 45,
    alignItems: 'center',
    backgroundColor: 'transparent'
  }
});
