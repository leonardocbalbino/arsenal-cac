import { Tabs } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '@/constants/theme';

type Shape = 'square' | 'circle' | 'bar' | 'capsule' | 'rect';

function TabIcon({ shape, focused }: { shape: Shape; focused: boolean }) {
  const color = focused ? colors.text : colors.tabInactive;
  const stroke = { borderColor: color, borderWidth: 1.6 };
  if (shape === 'square') return <View style={[styles.icon17, stroke, { borderRadius: 4 }]} />;
  if (shape === 'circle') return <View style={[styles.icon17, stroke, { borderRadius: 99 }]} />;
  if (shape === 'bar') return <View style={[stroke, { width: 17, height: 6, borderRadius: 2, marginVertical: 5.5 }]} />;
  if (shape === 'capsule') return <View style={[stroke, { width: 9, height: 17, borderRadius: 5 }]} />;
  return <View style={[stroke, { width: 13, height: 17, borderRadius: 2 }]} />;
}

function TabLabel({ label, focused }: { label: string; focused: boolean }) {
  return <Text style={[styles.label, { color: focused ? colors.text : colors.tabInactive }]}>{label}</Text>;
}

export default function AppTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: { paddingTop: 0 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ focused }) => <TabIcon shape="square" focused={focused} />,
          tabBarLabel: ({ focused }) => <TabLabel label="Início" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="habitualidade/index"
        options={{
          title: 'Habitualidade',
          tabBarIcon: ({ focused }) => <TabIcon shape="circle" focused={focused} />,
          tabBarLabel: ({ focused }) => <TabLabel label="Habitualidade" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="arsenal/index"
        options={{
          title: 'Arsenal',
          tabBarIcon: ({ focused }) => <TabIcon shape="bar" focused={focused} />,
          tabBarLabel: ({ focused }) => <TabLabel label="Arsenal" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="municao/index"
        options={{
          title: 'Munição',
          tabBarIcon: ({ focused }) => <TabIcon shape="capsule" focused={focused} />,
          tabBarLabel: ({ focused }) => <TabLabel label="Munição" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="documentos/index"
        options={{
          title: 'Docs',
          tabBarIcon: ({ focused }) => <TabIcon shape="rect" focused={focused} />,
          tabBarLabel: ({ focused }) => <TabLabel label="Docs" focused={focused} />,
        }}
      />

      {/* Vencimentos entra por push a partir do Início, mas mantém a tab bar (spec). */}
      <Tabs.Screen name="vencimentos/index" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'rgba(13,15,14,0.94)',
    borderTopColor: colors.borderSoft,
    borderTopWidth: 1,
    height: 78,
    paddingTop: 9,
    paddingBottom: 26,
    paddingHorizontal: 8,
  },
  icon17: { width: 17, height: 17 },
  label: { fontFamily: fonts.sansMedium, fontSize: 9.5 },
});
