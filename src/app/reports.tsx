import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, SafeAreaView, Image, TouchableOpacity, Alert, Modal, Platform } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, MapPin, Users, Lock, Bell, ChevronRight, HelpCircle, Shield, LogOut, Edit2, Menu, X, Calendar as CalendarIcon, FileText, User, FolderOpen, DollarSign, BarChart2 } from 'lucide-react-native';
import { useLeads } from '@/context/leads-context';

export default function ReportsScreen() {
  const { leads } = useLeads();
  const leadsCount = leads.length || 124;
  const [showMenu, setShowMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

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
        <View style={styles.profileSection}>
          <View style={styles.avatarMini}>
            <Text style={styles.avatarMiniText}>AK</Text>
          </View>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity style={{ padding: 6 }} onPress={() => setShowNotifications(true)}>
            <View style={{ position: 'relative' }}>
              <Bell size={22} color="#1e1b4b" />
              <View style={{
                position: 'absolute',
                right: 0,
                top: 0,
                backgroundColor: '#ef4444',
                borderRadius: 4,
                width: 8,
                height: 8,
                borderWidth: 1.5,
                borderColor: '#ffffff'
              }} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.hamburgerBtn} onPress={() => setShowMenu(true)}>
            <Menu size={24} color="#1e1b4b" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ================= HAMBURGER NAV MENU ================= */}
      <Modal visible={showMenu} animationType="fade" transparent>
        <TouchableOpacity 
          style={styles.menuOverlay} 
          activeOpacity={1} 
          onPress={() => setShowMenu(false)}>
          <View style={styles.menuContainer}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Navigation</Text>
              <TouchableOpacity onPress={() => setShowMenu(false)} style={styles.menuCloseBtn}>
                <X size={18} color="#475569" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.menuItems}>
              <TouchableOpacity 
                style={styles.menuItem} 
                onPress={() => { setShowMenu(false); router.push('/'); }}>
                <Users size={18} color="#64748b" />
                <Text style={styles.menuItemText}>Leads</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItem} 
                onPress={() => { setShowMenu(false); router.push('/appts'); }}>
                <CalendarIcon size={18} color="#64748b" />
                <Text style={styles.menuItemText}>Appointments</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItem} 
                onPress={() => { setShowMenu(false); router.push('/quotations'); }}>
                <FileText size={18} color="#64748b" />
                <Text style={styles.menuItemText}>Quotations</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItem} 
                onPress={() => { setShowMenu(false); Alert.alert('Project file', 'Project file details are under construction.'); }}>
                <FolderOpen size={18} color="#64748b" />
                <Text style={styles.menuItemText}>Project file</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItem} 
                onPress={() => { setShowMenu(false); Alert.alert('Payment Collection', 'Payment collection details are under construction.'); }}>
                <DollarSign size={18} color="#64748b" />
                <Text style={styles.menuItemText}>Payment Collection</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItem} 
                onPress={() => { setShowMenu(false); Alert.alert('Reports', 'Reporting dashboard is under construction.'); }}>
                <BarChart2 size={18} color="#64748b" />
                <Text style={styles.menuItemText}>Reports</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.menuItem, styles.menuItemActive]} 
                onPress={() => { setShowMenu(false); }}>
                <User size={18} color="#4338ca" />
                <Text style={[styles.menuItemText, styles.menuItemTextActive]}>Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ================= NOTIFICATIONS MODAL ================= */}
      <Modal visible={showNotifications} animationType="fade" transparent>
        <TouchableOpacity 
          style={styles.menuOverlay} 
          activeOpacity={1} 
          onPress={() => setShowNotifications(false)}>
          <View style={styles.notificationContainer}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Notifications</Text>
              <TouchableOpacity onPress={() => setShowNotifications(false)} style={styles.menuCloseBtn}>
                <X size={18} color="#475569" />
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.notificationItems}>
                <View style={[styles.notificationItem, { backgroundColor: '#f0f4ff' }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Text style={styles.notificationItemTitle}>New Appointment Scheduled</Text>
                    <View style={styles.unreadDot} />
                  </View>
                  <Text style={styles.notificationItemDesc}>Priya Sharma initial consultation at 04:00 PM</Text>
                  <Text style={styles.notificationItemTime}>2 hours ago</Text>
                </View>

                <View style={[styles.notificationItem, { backgroundColor: '#f0f4ff' }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Text style={styles.notificationItemTitle}>Quotation Approved</Text>
                    <View style={styles.unreadDot} />
                  </View>
                  <Text style={styles.notificationItemDesc}>Quotation QT-4029 for Rahul Mehta has been approved</Text>
                  <Text style={styles.notificationItemTime}>5 hours ago</Text>
                </View>

                <View style={styles.notificationItem}>
                  <Text style={styles.notificationItemTitle}>Lead Assigned</Text>
                  <Text style={styles.notificationItemDesc}>New lead Anjali Desai has been assigned to you</Text>
                  <Text style={styles.notificationItemTime}>1 day ago</Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1eef6',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarMini: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1d1947',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarMiniText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e1b4b',
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
  hamburgerBtn: {
    padding: 8,
    marginRight: -8,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  menuContainer: {
    backgroundColor: '#ffffff',
    width: 280,
    height: '100%',
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    shadowColor: '#1e1b4b',
    shadowOffset: { width: -10, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1eef6',
    marginBottom: 16,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1e1b4b',
  },
  menuCloseBtn: {
    padding: 4,
  },
  menuItems: {
    gap: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  menuItemActive: {
    backgroundColor: '#e5e1fa',
  },
  menuItemText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  menuItemTextActive: {
    color: '#4338ca',
    fontWeight: '700',
  },
  notificationContainer: {
    backgroundColor: '#ffffff',
    width: 320,
    height: '100%',
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    shadowColor: '#1e1b4b',
    shadowOffset: { width: -10, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  notificationItems: {
    gap: 12,
  },
  notificationItem: {
    backgroundColor: '#f8fafc',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  notificationItemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e1b4b',
    flex: 1,
    marginRight: 8,
  },
  notificationItemDesc: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    lineHeight: 16,
  },
  notificationItemTime: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 6,
    fontWeight: '600',
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ef4444',
    marginTop: 4,
  },
});
