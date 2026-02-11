import { ThemedText } from '@/components/themed-text';
import { ThemedSafeAreaView, ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { supabase } from '@/utils/supabase';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Pressable, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import SegmentedControlTab from 'react-native-segmented-control-tab';

const screenWidth = Dimensions.get('window').width - 40;

const DAY = 24 * 60 * 60 * 1000;

function formatDateKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

function dayLabel(d: Date) {
  return d.toLocaleDateString('en-US', { weekday: 'short' });
}

export default function index() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [weightData, setWeightData] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isReloading, setIsReloading] = useState(false);

  useEffect(() => {
    reloadStats();
  }, []);

  useEffect(() => {
    const days = selectedIndex === 0 ? 7 : selectedIndex === 1 ? 30 : 365;
    fetchWeightHistory(days, selectedIndex).then(setWeightData);
  }, [selectedIndex]);

  async function reloadStats() {
    setIsReloading(true);
    try {
      const [{ data: { session } }] = await Promise.all([
        supabase.auth.getSession(),
      ]);
      if (!session?.user?.id) return;

      const [{ data: profile }, { data: stats }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', session.user.id).single(),
        supabase.from('stats')
          .select('*')
          .eq('id', session.user.id)
          .eq('date', new Date().toLocaleDateString('en-NY'))
          .single(),
      ]);

      setProfile(profile);
      setStats(stats);

      const days = selectedIndex === 0 ? 7 : selectedIndex === 1 ? 30 : 365;
      setWeightData(await fetchWeightHistory(days, selectedIndex));
    } finally {
      setIsReloading(false);
    }
  }

  async function fetchWeightHistory(days: number, mode: number) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) return [];

    const today = new Date();
    const start = new Date(today.getTime() - days * DAY);

    const { data } = await supabase
      .from('stats')
      .select('date, weight')
      .eq('id', session.user.id)
      .gte('date', start.toLocaleDateString('en-NY'))
      .lte('date', today.toLocaleDateString('en-NY'))
      .order('date', { ascending: true });

    if (!data) return [];

    const todayKey = formatDateKey(today);

    return data
      .filter(d => d.weight > 0)
      .map(d => {
        const dateObj = new Date(d.date);
        let label = '';

        if (mode === 0) {
          label = dayLabel(dateObj);
        } else if (mode === 1) {
          label = dateObj.getDay() === today.getDay()
            ? dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : '';
        } else {
          label = dateObj.getDate() === today.getDate()
            ? dateObj.toLocaleDateString('en-US', { month: 'short' })
            : '';
        }

        return {
          x: label,
          y: d.weight,
          isToday: formatDateKey(dateObj) === todayKey,
        };
      });
  }

  const getChartConfig = (data: any[]) => ({
    chartData: {
      labels: data.map(d => d.x),
      datasets: [{ data: data.map(d => d.y), strokeWidth: 3 }],
    },
    chartConfig: {
      backgroundGradientFrom: Colors[colorScheme ?? 'light'].card,
      backgroundGradientTo: Colors[colorScheme ?? 'light'].card,
      decimalPlaces: 0,
      color: () => Colors[colorScheme ?? 'light'].text,
      labelColor: () => Colors[colorScheme ?? 'light'].numbers,
      propsForDots: {
        r: '4',
        strokeWidth: '2',
        stroke: Colors[colorScheme ?? 'light'].icon,
      },
    },
  });

  return (
    <ThemedSafeAreaView style={styles.container}>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.welcomeContainer}>
          <ThemedText style={[styles.welcome, {color: Colors[colorScheme ?? 'light'].text}]}>Hello, {profile?.first_name}</ThemedText>
          <Pressable onPress={reloadStats} disabled={isReloading}>
            {isReloading ? (
              <ActivityIndicator 
                size="small" 
                color={Colors[colorScheme ?? 'light'].icon}
                style={{paddingTop: 4, paddingLeft: 5}}
              />
            ) : (
              <Ionicons 
                name="reload-outline" 
                size={25} 
                color={Colors[colorScheme ?? 'light'].icon} 
                style={{paddingTop: 4, paddingLeft: 5}}
              />
            )}
          </Pressable>        
          <ThemedView style={{ marginLeft: 'auto', marginRight: 18, marginTop: 4 }}>
            <Ionicons name="settings" onPress={() => {router.navigate('/Settings')}} size={24} color={Colors[colorScheme ?? 'light'].icon} />
          </ThemedView>
        </ThemedView>

        {/* Today's Stats Card */}
        <ThemedView style={{ paddingLeft: 18, paddingBottom: 10 }}>
          <ThemedView style={[styles.bigCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
            <ThemedView style={{ flexDirection: 'row', backgroundColor: 'transparent', flexWrap: 'wrap' }}>
              <ThemedView style={{backgroundColor: 'transparent', paddingBottom: 1, paddingTop: 10, flexDirection: 'column' }}>
                <ThemedView style={{backgroundColor: 'transparent', paddingBottom: 1, flexDirection: 'row' }}>
                  <ThemedText style={[styles.text1, {paddingLeft: 20, height: 45, textAlignVertical: 'center', color: Colors[colorScheme ?? 'light'].numbers}]}>Today's Stats</ThemedText>
                </ThemedView>
                <ThemedView style={{backgroundColor: 'transparent', flexDirection: 'row', paddingTop: 10 }}>
                  <ThemedText style={{paddingLeft: 20, fontSize: 35, lineHeight: 35, color: Colors[colorScheme ?? 'light'].text}}>{(stats?.calories ?? 0)}/{profile?.calorie_goal}</ThemedText>
                  <ThemedText style={{paddingLeft: 3, fontSize: 25, paddingTop: 1, lineHeight: 35, color: Colors[colorScheme ?? 'light'].numbers, fontWeight: '600'}}>Cal</ThemedText>
                </ThemedView>
              </ThemedView>
              <ThemedView style={{backgroundColor: 'transparent'}}>
                <ThemedText style={{ paddingLeft: 25, paddingTop: 40, fontSize: 18, color: Colors[colorScheme ?? 'light'].text }}>Water Intake</ThemedText>
                <ThemedText style={{ paddingLeft: 25, paddingTop: 10, fontSize: 15, fontWeight: 600, color: '#398bceff' }}>{stats?.water ?? 0}/{profile?.water_goal?.toString()} oz.</ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/* Carbs/Protein Cards */}
        <ThemedView style={styles.cards}>
          <ThemedView style={[styles.card, { backgroundColor: Colors[colorScheme ?? 'light'].card, paddingTop: 0 }]}>
            <ThemedText style={[styles.text, {color: Colors[colorScheme ?? 'light'].numbers, paddingTop: 20}]}>Carbs</ThemedText>
            <ThemedView style={{ flexDirection: 'row', backgroundColor: 'transparent' }}>
              <ThemedText style={styles.stats}>{stats?.carbs ?? 0}/{profile?.carb_goal}</ThemedText>
              <ThemedText style={[styles.units, {color: Colors[colorScheme ?? 'light'].numbers}]}> g</ThemedText>
            </ThemedView>
          </ThemedView>
          <ThemedView style={[styles.card, { backgroundColor: Colors[colorScheme ?? 'light'].card, paddingTop: 0 }]}>
            <ThemedText style={[styles.text, {color: Colors[colorScheme ?? 'light'].numbers, paddingTop: 20}]}>Protein</ThemedText>
            <ThemedView style={{ flexDirection: 'row', backgroundColor: 'transparent' }}>
              <ThemedText style={styles.stats}>{(stats?.protein ?? 0)}/{profile?.protein_goal}</ThemedText>
              <ThemedText style={[styles.units, {color: Colors[colorScheme ?? 'light'].numbers}]}> g</ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {/* GRAPH */}
        <ThemedView style={{ paddingLeft: 18, paddingBottom: 10, paddingTop: 10,  }}>
          <ThemedView style={[styles.graphCard, { backgroundColor: Colors[colorScheme ?? 'light'].card, alignItems: 'center' }]}>
            <ThemedText style={[styles.text, { color: Colors[colorScheme ?? 'light'].numbers, paddingBottom: 6 }]}>Weight</ThemedText>

            <SegmentedControlTab
              values={['Week', 'Month', 'Year']}
              selectedIndex={selectedIndex}
              onTabPress={setSelectedIndex}
              tabsContainerStyle={{ width: 350, height: 40, borderRadius: 55 }}
              tabStyle={{ backgroundColor: Colors[colorScheme ?? 'light'].card, borderColor: Colors[colorScheme ?? 'light'].numbers }}
              activeTabStyle={{ backgroundColor: Colors[colorScheme ?? 'light'].numbers, borderColor: Colors[colorScheme ?? 'light'].numbers }}
              tabTextStyle={{ fontSize: 18, color: Colors[colorScheme ?? 'light'].numbers }}
              activeTabTextStyle={{ fontSize: 18, color: Colors[colorScheme ?? 'light'].background }}
            />
          </ThemedView>

          {weightData.length > 0 ? (
              (() => {
                const config = getChartConfig(weightData);
                return (
                  <LineChart
                    data={config.chartData}
                    width={380}
                    height={250}
                    withInnerLines={false}
                    withOuterLines={false}
                    chartConfig={config.chartConfig}
                    style={{ paddingBottom: 15, marginTop: 12, borderRadius: 12 }}
                    bezier
                    renderDotContent={({ x, y, index }) =>
                      weightData[index]?.isToday && (
                        <ThemedText
                          style={{
                            position: 'absolute',
                            top: y - 30,
                            left: x - 18,
                            fontSize: 12,
                            fontWeight: '600',
                          }}
                        >
                          {weightData[index].y} lbs
                        </ThemedText>
                      )
                    }
                  />
                );
              })()
            ) : (
              <ThemedText
                style={[
                  styles.text,
                  {
                    color: Colors[colorScheme ?? 'light'].text,
                    marginLeft: 85,
                    marginTop: 80,
                  },
                ]}
              >
                No weight data yet
              </ThemedText>
            )}

        </ThemedView>
      </ThemedView>
    </ThemedSafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //backgroundColor: '#25292e',
    //alignItems: 'center',
    //justifyContent: 'center',
  },
  card: {
        //backgroundColor: '',
        //borderWidth: 1,
        borderRadius: 15,
        paddingLeft: 16,
        //elevation: 14,
        width: 180,
        height: 150,
        justifyContent: 'space-around',
        //alignItems: 'center',
    },
  bigCard: {
        //backgroundColor: '',
        //borderWidth: 1,
        //flex: 20,
        borderRadius: 15,
        paddingTop: 0,
        //paddingRight: 18,
        //paddingLeft: 18,
        //elevation: 14,
        width: 380,
        height: 150,
        //flexWrap: 'wrap',
        //justifyContent: 'center',
        //alignContent: 'flex-start',
        
    },
  graphCard: {
    borderRadius: 15,
    width: 380,
    height: 115,
    paddingTop: 16,
    paddingBottom: 12,
    paddingHorizontal: 12,
    justifyContent: 'flex-start',
  },

  cards: {
    flexDirection: 'row', 
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    paddingLeft: 18,
    paddingRight: 18,
  },
  text: {
    fontSize: 25,
    lineHeight: 35,
    fontWeight: '600',
    //color: '#fff',
  },
  stats: {
    fontSize: 35,
    lineHeight: 35,
    paddingBottom: 35,
  },
  units: {
    fontSize: 25,
    lineHeight: 35,
    fontWeight: '600',
  },
  text1: {
    marginBottom: 0,
    marginTop: 9,
    lineHeight: 40,
    fontSize: 35,
    fontWeight: '600',
    //backgroundColor: 'transparent',
    //alignContent: 'left',
    //color: '#fff',
  },
  button: {
    fontSize: 20,
    textDecorationLine: 'underline',
    //color: '#fff',
  },
  welcomeContainer: {
    marginBottom: 10,
    marginTop: 10,
    paddingLeft: 25,
    flexDirection: 'row',
  },
  welcome: {
    fontSize: 32,
    fontWeight: '700',
    paddingTop: 10,
    //marginBottom: 20,
  },
});
