import { Pressable, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const OPTIONS = [
  { key: 'slow', label: 'Slow' },
  { key: 'moderate', label: 'Moderate' },
  { key: 'aggressive', label: 'Fast' },
] as const;

export default function GoalSpeedSegment({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: any) => void;
}) {
  const scheme = useColorScheme();

  return (
    <ThemedView style={[styles.container,{borderColor: Colors[scheme ?? 'light'].numbers,}]}>
      {OPTIONS.map(opt => {
        const active = value === opt.key;
        return (
          <Pressable
            key={opt.key}
            onPress={() => onChange(opt.key)}
            style={[
              styles.option,
              {
                backgroundColor: active
                  ? Colors[scheme ?? 'light'].numbers
                  : Colors[scheme ?? 'light'].card,
                
              },
            ]}
          >
            <ThemedText style={{ fontWeight: 600, color: active ? Colors[scheme ?? 'light'].background : Colors[scheme ?? 'light'].numbers }}>
              {opt.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 1,
    width: 350
  },
  option: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
});
