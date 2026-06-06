import React from 'react';
import { StyleSheet, View, Text, ScrollView, SafeAreaView, Image, TouchableOpacity, Alert } from 'react-native';
import { ArrowLeft, MapPin, Users, Lock, Bell, ChevronRight, HelpCircle, Shield, LogOut, Edit2 } from 'lucide-react-native';
import { useLeads } from '@/context/leads-context';

export default function ReportsScreen() {
  const { leads } = useLeads();
  const leadsCount = leads.length || 124;

  const handleBack = () => {
    Alert.alert('Navigation', 'Back button pressed.');
  };

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Profile editing is not available in mock mode.');
  };

  const handleSettingPress = (name: string) => {
    Alert.alert(name, `Navigating to ${name}...`);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => Alert.alert('Logged Out', 'Successfully logged out.') }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Image 
              source={require('@/assets/images/avatar_akash.png')} 
              style={styles.avatar} 
            />
            <TouchableOpacity style={styles.editBadge} onPress={handleEditProfile}>
              <Edit2 size={12} color="#ffffff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.nameText}>Akash</Text>
          <Text style={styles.roleText}>Sales Manager</Text>
          
          <View style={styles.locationRow}>
            <MapPin size={14} color="#64748b" />
            <Text style={styles.locationText}>DLF Cyber City, Chennai</Text>
          </View>
        </View>

        {/* Leads Managed Card */}
        <View style={styles.leadsCard}>
          <View>
            <Text style={styles.leadsLabel}>LEADS MANAGED</Text>
            <Text style={styles.leadsValue}>{leadsCount}</Text>
          </View>
          <View style={styles.leadsIconWrapper}>
            <Users size={24} color="#4c49ed" />
          </View>
        </View>

        {/* Preferences Section */}
        <Text style={styles.sectionHeading}>PREFERENCES</Text>
        <View style={styles.settingsGroup}>
          <TouchableOpacity style={styles.settingsRow} onPress={() => handleSettingPress('Security & Password')}>
            <View style={styles.settingsLeft}>
              <Lock size={18} color="#110e3d" style={styles.settingsIcon} />
              <Text style={styles.settingsText}>Security & Password</Text>
            </View>
            <ChevronRight size={18} color="#64748b" />
          </TouchableOpacity>
          
          <View style={styles.rowDivider} />

          <TouchableOpacity style={styles.settingsRow} onPress={() => handleSettingPress('Notification Settings')}>
            <View style={styles.settingsLeft}>
              <Bell size={18} color="#110e3d" style={styles.settingsIcon} />
              <Text style={styles.settingsText}>Notification Settings</Text>
            </View>
            <ChevronRight size={18} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* Support & Legal Section */}
        <Text style={styles.sectionHeading}>SUPPORT & LEGAL</Text>
        <View style={styles.settingsGroup}>
          <TouchableOpacity style={styles.settingsRow} onPress={() => handleSettingPress('Help & Support')}>
            <View style={styles.settingsLeft}>
              <HelpCircle size={18} color="#110e3d" style={styles.settingsIcon} />
              <Text style={styles.settingsText}>Help & Support</Text>
            </View>
            <ChevronRight size={18} color="#64748b" />
          </TouchableOpacity>

          <View style={styles.rowDivider} />

          <TouchableOpacity style={styles.settingsRow} onPress={() => handleSettingPress('Privacy Policy')}>
            <View style={styles.settingsLeft}>
              <Shield size={18} color="#110e3d" style={styles.settingsIcon} />
              <Text style={styles.settingsText}>Privacy Policy</Text>
            </View>
            <ChevronRight size={18} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut size={18} color="#dc2626" />
          <Text style={styles.logoutBtnText}>Logout</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Version 1.0</Text>
          <Text style={styles.footerText}>© 2026 Tesco sales CRM. All rights reserved.</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCFBFE',
  },
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1eef6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#110e3d',
    textAlign: 'center',
  },
  scrollContent: {
    padding: 20,
  },
  profileCard: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 10,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: '#ffffff',
    backgroundColor: '#e2e8f0',
  },
  editBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#110e3d',
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  nameText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#110e3d',
    marginBottom: 4,
  },
  roleText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  leadsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  leadsLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  leadsValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#110e3d',
  },
  leadsIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f5f4fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    marginBottom: 8,
    marginTop: 8,
    letterSpacing: 0.5,
  },
  settingsGroup: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 20,
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  settingsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsIcon: {
    marginRight: 12,
  },
  settingsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginHorizontal: 16,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fee2e2',
    borderRadius: 16,
    height: 52,
    gap: 8,
    marginTop: 8,
    marginBottom: 24,
  },
  logoutBtnText: {
    color: '#dc2626',
    fontWeight: '700',
    fontSize: 15,
  },
  footer: {
    alignItems: 'center',
    gap: 4,
    marginVertical: 12,
  },
  footerText: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
  },
});
