import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import {
  BarChart3,
  Calendar,
  ClipboardList,
  User
} from 'lucide-react-native';

export default function AppTabs() {
  return (
    <Tabs style={styles.tabsContainer}>
      <TabSlot style={{ flex: 1, paddingBottom: 68 }} />
      <TabList asChild>
        <View style={styles.tabListContainer}>
          <TabTrigger name="index" href="/" asChild>
            <TabButton icon={BarChart3}>Leads</TabButton>
          </TabTrigger>
          <TabTrigger name="appts" href="/appts" asChild>
            <TabButton icon={Calendar}>Appts</TabButton>
          </TabTrigger>
          <TabTrigger name="quotations" href="/quotations" asChild>
            <TabButton icon={ClipboardList}>Qutations</TabButton>
          </TabTrigger>
          <TabTrigger name="reports" href="/reports" asChild>
            <TabButton icon={User}>Profile</TabButton>
          </TabTrigger>
        </View>
      </TabList>
    </Tabs>
  );
}

interface CustomTabButtonProps extends TabTriggerSlotProps {
  icon: React.ComponentType<{ size: number; color: string }>;
}

export function TabButton({ children, isFocused, icon: Icon, ...props }: CustomTabButtonProps) {
  const activeColor = '#4338ca';
  const inactiveColor = '#64748b';

  return (
    <Pressable {...props} style={styles.tabButton}>
      <View style={[styles.iconContainer, isFocused && styles.iconContainerActive]}>
        <Icon size={20} color={isFocused ? activeColor : inactiveColor} />
      </View>
      <View style={styles.textContainer}>
        <Text style={{
          fontSize: 11,
          fontWeight: isFocused ? '700' : '500',
          color: isFocused ? activeColor : inactiveColor,
          marginTop: 2
        }}>
          {children}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tabsContainer: {
    flex: 1,
    height: '100%',
  },
  tabListContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 68,
    backgroundColor: '#FCFBFE',
    borderTopWidth: 1,
    borderTopColor: '#f1eef6',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 10,
    paddingTop: 8,
    zIndex: 10,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  iconContainer: {
    paddingHorizontal: 20,
    paddingVertical: 4,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerActive: {
    backgroundColor: '#e5e1fa',
  },
  textContainer: {
    alignItems: 'center',
  },
});

