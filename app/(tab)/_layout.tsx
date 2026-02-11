import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';
import React from 'react';
import { DynamicColorIOS } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <NativeTabs 
      tintColor={ Colors[colorScheme ?? 'light'].tint}
    >
      <NativeTabs.Trigger name="index">
        <Icon sf="chart.xyaxis.line"/>
        <Label hidden />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="menu">
       <Icon sf="scroll" />,
        <Label hidden />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="add">
       <Icon sf="square.and.pencil" />,
       <Label hidden />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="lists">
       <Icon sf="basket" />,
       <Label hidden />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="workouts">
       <Icon sf="figure.walk" />,
       <Label hidden />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
