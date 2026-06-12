import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import { router } from 'expo-router';
import {
  Clock,
  Check,
  X,
  Plus,
  AlertCircle,
  User,
  Phone,
  MapPin,
  Calendar as CalendarIcon,
  Search,
  SlidersHorizontal,
  ChevronDown,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  CheckSquare,
  CheckCircle2,
  Upload,
  Menu,
  Users,
  FileText,
  FolderOpen,
  DollarSign,
  BarChart2,
  Bell,
} from 'lucide-react-native';
import { useLeads, Appointment } from '@/context/leads-context';

export default function AppointmentsScreen() {
  const { leads, appointments, addAppointment, updateAppointmentStatus, addLeadHistory } = useLeads();

  // Navigation and UI state
  const [currentView, setCurrentView] = useState<'list' | 'add' | 'start-appointment'>('list');
  const [showMenu, setShowMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFabMenu, setShowFabMenu] = useState(false);
  const [addType, setAddType] = useState<'appointment' | 'visit'>('appointment');
  const [activeSubTab, setActiveSubTab] = useState<'appointment' | 'visits'>('appointment');
  const [selectedMetricsFilter, setSelectedMetricsFilter] = useState<'all' | 'visit_planned' | 'completed_appt' | 'completed_visit'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAppt, setSelectedAppt] = useState<any | null>(null);

  // Reschedule Modal State
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [reschedulingAppt, setReschedulingAppt] = useState<any | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('15 - 05 - 2026');
  const [rescheduleStartTime, setRescheduleStartTime] = useState('02:00 PM');
  const [rescheduleEndTime, setRescheduleEndTime] = useState('03:30 PM');

  // End Appointment Modal State
  const [showEndApptModal, setShowEndApptModal] = useState(false);
  const [endingAppt, setEndingAppt] = useState<any | null>(null);
  const [measurementNote, setMeasurementNote] = useState('');
  const [measurementImage, setMeasurementImage] = useState<string | null>(null);
  const [siteImage, setSiteImage] = useState<string | null>(null);
  const [designRequest, setDesignRequest] = useState('None');
  const [showDesignDropdown, setShowDesignDropdown] = useState(false);
  const [endApptRemarks, setEndApptRemarks] = useState('');

  // Start Appointment Form State
  const [startLocation, setStartLocation] = useState('Main Office');
  const [startTimeText, setStartTimeText] = useState('01:07 PM');

  // Address editing states for Reschedule and Start Appointment
  const [rescheduleAddress, setRescheduleAddress] = useState('');
  const [isEditingRescheduleAddress, setIsEditingRescheduleAddress] = useState(false);
  const [isEditingStartLocation, setIsEditingStartLocation] = useState(false);

  // Local list to track appointments state dynamically
  const [localAppts, setLocalAppts] = useState<any[]>([]);

  const getCurrentTimeFormatted = () => {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    const hoursStr = hours < 10 ? '0' + hours : hours;
    return `${hoursStr}:${minutesStr} ${ampm}`;
  };

  useEffect(() => {
    if (localAppts.length === 0) {
      setLocalAppts([
        {
          id: 'APT-101',
          leadId: 'LD-1029',
          leadName: 'Priya Sharma',
          title: 'Initial Consultation',
          dateTime: '20 MAY 2026, 04:00 PM - 05:00 PM',
          status: 'pending', // WAITING in appt tab, completes as ASSIGNED in visits
          notes: 'Main Office, DLF Cyber City',
        },
        {
          id: 'APT-102',
          leadId: 'LD-1030',
          leadName: 'Rahul Mehta',
          title: 'Site Inspection Visit',
          dateTime: '21 MAY 2026, 11:30 AM - 12:30 PM',
          status: 'completed', // ASSIGNED
          notes: 'Skyline Residency, Site B',
        },
        {
          id: 'APT-103',
          leadId: 'LD-1029',
          leadName: 'Priya Sharma',
          title: 'Site Inspection Visit',
          dateTime: '21 MAY 2026, 11:30 AM - 12:30 PM',
          status: 'in_progress', // IN-APPOINTMENT
          notes: 'Skyline Residency, Site B',
          startTime: '03:32 PM',
        },
        {
          id: 'APT-104',
          leadId: 'LD-1031',
          leadName: 'Anjali Desai',
          title: 'Contract Signing',
          dateTime: '22 MAY 2026, 02:00 PM - 03:00 PM',
          status: 'pending', // WAITING
          notes: 'South City Business Park',
        }
      ]);
    } else {
      const newItems = appointments.filter(a => !localAppts.some(la => la.id === a.id));
      if (newItems.length > 0) {
        setLocalAppts(prev => [...newItems, ...prev]);
      }
    }
  }, [appointments]);

  // Calendar state
  const [selectedStartDate, setSelectedStartDate] = useState<string | null>("May 20, 2026");
  const [selectedEndDate, setSelectedEndDate] = useState<string | null>(null);
  const [currentMonthYear, setCurrentMonthYear] = useState({ month: 4, year: 2026 }); // 4 = May

  const handleDatePress = (formattedDate: string) => {
    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      setSelectedStartDate(formattedDate);
      setSelectedEndDate(null);
    } else {
      const start = new Date(selectedStartDate);
      const clicked = new Date(formattedDate);
      if (clicked >= start) {
        setSelectedEndDate(formattedDate);
      } else {
        setSelectedStartDate(formattedDate);
        setSelectedEndDate(null);
      }
    }
  };

  const handlePrevMonth = () => {
    setCurrentMonthYear((prev) => {
      if (prev.month === 0) {
        return { month: 11, year: prev.year - 1 };
      }
      return { month: prev.month - 1, year: prev.year };
    });
  };

  const handleNextMonth = () => {
    setCurrentMonthYear((prev) => {
      if (prev.month === 11) {
        return { month: 0, year: prev.year + 1 };
      }
      return { month: prev.month + 1, year: prev.year };
    });
  };
  
  // Add Appointment Form State
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [apptTitle, setApptTitle] = useState('');
  const [apptDate, setApptDate] = useState('2026-05-20, 04:00 PM');
  const [apptNotes, setApptNotes] = useState('');
  const [showLeadDropdown, setShowLeadDropdown] = useState(false);

  // Sync state if form opens
  const resetForm = () => {
    setApptTitle('');
    setApptDate('2026-05-20, 04:00 PM');
    setApptNotes('');
    setSelectedLeadId('');
    setShowLeadDropdown(false);
  };

  const openAddForm = (type: 'appointment' | 'visit') => {
    setAddType(type);
    setSelectedLeadId('');
    setApptNotes('');
    setApptDate('2026-05-20, 04:00 PM');
    setShowLeadDropdown(false);
    if (type === 'visit') {
      setApptTitle('Site Inspection Visit');
    } else {
      setApptTitle('');
    }
    setCurrentView('add');
    setShowFabMenu(false);
  };

  const handleAutoDetectLocation = (callback: (loc: string) => void) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const detectedAddr = `Sector 24, Cyber City, Gurgaon (GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
          callback(detectedAddr);
          Alert.alert('Location Detected', `Successfully auto-detected location:\n${detectedAddr}`);
        },
        (error) => {
          console.log(error);
          const fallbackAddr = "Main Office, DLF Cyber City Phase 3, Gurgaon";
          callback(fallbackAddr);
          Alert.alert('Location Detected', `Auto-detected location (mock fallback):\n${fallbackAddr}`);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 10000 }
      );
    } else {
      Alert.alert('Error', 'Geolocation is not supported on this device.');
    }
  };

  // Mock bases to match the screenshot (42, 18, 28, 12)
  const metrics = {
    total: appointments.length + 38,
    visitPlanned: appointments.filter(a => a.title.toLowerCase().includes('visit') || a.title.toLowerCase().includes('site')).length + 16,
    completed: appointments.filter(a => a.status === 'completed').length + 26,
    completedWeek: appointments.filter(a => a.status === 'completed').length + 11,
  };

  // Static Calendar calculation for May 2026 (Starts on Friday, 31 days)
  const renderCalendarDays = () => {
    const days = [];
    // May 2026: Starts on Friday (index 5)
    // So add 5 empty slots
    for (let i = 0; i < 5; i++) {
      days.push({ day: null, key: `empty-${i}` });
    }
    for (let d = 1; d <= 31; d++) {
      days.push({ day: d, key: `day-${d}` });
    }
    return days;
  };

  // Days with appointments: e.g. 5, 12, 20, 21, 22
  const appointmentDays = [5, 12, 20, 21, 22];

  const handleCreateAppointment = async () => {
    if (!selectedLeadId || !apptTitle || !apptDate) {
      Alert.alert('Missing Fields', 'Please select a lead, title, and date.');
      return;
    }

    const lead = leads.find((l) => l.id === selectedLeadId);
    if (!lead) return;

    await addAppointment({
      leadId: lead.id,
      leadName: lead.name,
      title: apptTitle,
      dateTime: apptDate,
      notes: apptNotes,
    });

    resetForm();
    setCurrentView('list');
    Alert.alert('Success', addType === 'visit' ? 'Visit scheduled successfully.' : 'Appointment scheduled successfully.');
  };

  const handleOpenStartAppointment = (appt: any) => {
    setSelectedAppt(appt);
    setStartLocation(appt.notes || 'Main Office');
    setStartTimeText(getCurrentTimeFormatted());
    setIsEditingStartLocation(false);
    setCurrentView('start-appointment');
  };

  const handleConfirmStartAppointment = () => {
    if (!selectedAppt) return;
    const targetStatus = 'in_progress';
    const successMsg = 'Session started and moved to the Visits page.';
    
    const updated = localAppts.map(a => 
      a.id === selectedAppt.id 
        ? { ...a, status: targetStatus, notes: startLocation, startTime: startTimeText } 
        : a
    );
    setLocalAppts(updated);
    setActiveSubTab('visits');
    setCurrentView('list');
    Alert.alert('Success', successMsg);
  };

  const handleConfirmReschedule = async () => {
    if (!reschedulingAppt) return;
    
    // Parse rescheduleDate (which is in "DD - MM - YYYY" format)
    const parts = rescheduleDate.split(' - ');
    let formattedDateTime = `${rescheduleDate}, ${rescheduleStartTime} - ${rescheduleEndTime}`;
    if (parts.length === 3) {
      const day = parseInt(parts[0]);
      const monthIdx = parseInt(parts[1]) - 1;
      const year = parseInt(parts[2]);
      const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      if (monthIdx >= 0 && monthIdx < 12) {
        formattedDateTime = `${day} ${months[monthIdx]} ${year}, ${rescheduleStartTime} - ${rescheduleEndTime}`;
      }
    }

    const updated = localAppts.map(a => 
      a.id === reschedulingAppt.id 
        ? { ...a, dateTime: formattedDateTime, notes: rescheduleAddress } 
        : a
    );
    setLocalAppts(updated);

    // Also log in history
    await addLeadHistory(
      reschedulingAppt.leadId,
      'appointment',
      `Appointment rescheduled to ${formattedDateTime}`
    );

    setShowRescheduleModal(false);
    setReschedulingAppt(null);
    Alert.alert('Success', 'Appointment rescheduled successfully.');
  };

  const handleConfirmEndAppointment = async () => {
    if (!endingAppt) return;
    if (!siteImage) {
      Alert.alert('Required Field', 'Please upload a Site Image to end the appointment.');
      return;
    }

    const updated = localAppts.map(a => 
      a.id === endingAppt.id 
        ? { ...a, status: 'completed' } 
        : a
    );
    setLocalAppts(updated);

    // Also log in history with remarks and measurement details
    const msg = `Appointment ended. Measurement Note: "${measurementNote || 'None'}". Design Request: "${designRequest}". Remarks: "${endApptRemarks || 'None'}"`;
    await addLeadHistory(
      endingAppt.leadId,
      'appointment',
      msg
    );

    // Reset and close
    setMeasurementNote('');
    setMeasurementImage(null);
    setSiteImage(null);
    setDesignRequest('None');
    setEndApptRemarks('');
    setShowEndApptModal(false);
    setEndingAppt(null);

    Alert.alert('Success', 'Appointment ended successfully.');
  };

  // Filter list based on selected calendar range
  const getDisplayAppointments = () => {
    let filtered = localAppts;
    if (selectedMetricsFilter === 'visit_planned') {
      filtered = filtered.filter(a => (a.title.toLowerCase().includes('visit') || a.title.toLowerCase().includes('site')) && (a.status === 'pending' || a.status === 'in_progress'));
    } else if (selectedMetricsFilter === 'completed_appt') {
      filtered = filtered.filter(a => a.status === 'completed');
    } else if (selectedMetricsFilter === 'completed_visit') {
      filtered = filtered.filter(a => a.status === 'completed');
    } else {
      if (activeSubTab === 'visits') {
        filtered = filtered.filter(a => a.status === 'completed' || a.status === 'in_progress');
      } else {
        filtered = filtered.filter(a => a.status === 'pending' || a.status === 'completed');
      }
    }

    if (selectedStartDate) {
      const start = new Date(selectedStartDate);
      start.setHours(0, 0, 0, 0);

      filtered = filtered.filter(a => {
        // Parse date from a.dateTime, which is formatted like: "20 MAY 2026, 04:00 PM - 05:00 PM"
        const datePart = a.dateTime.split(',')[0];
        const apptDate = new Date(datePart);
        if (isNaN(apptDate.getTime())) return true;

        if (selectedEndDate) {
          const end = new Date(selectedEndDate);
          end.setHours(23, 59, 59, 999);
          return apptDate >= start && apptDate <= end;
        } else {
          return (
            apptDate.getDate() === start.getDate() &&
            apptDate.getMonth() === start.getMonth() &&
            apptDate.getFullYear() === start.getFullYear()
          );
        }
      });
    }

    return filtered;
  };

  const handleCall = (phoneNum: string) => {
    Linking.openURL(`tel:${phoneNum}`);
  };



  if (currentView === 'add') {
    const selectedLead = leads.find(l => l.id === selectedLeadId);
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity onPress={() => { resetForm(); setCurrentView('list'); }} style={styles.backBtn}>
              <ArrowLeft size={22} color="#1e1b4b" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{addType === 'visit' ? 'Schedule Visit' : 'Schedule Appt'}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.formContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.formSection}>
            <Text style={styles.formSectionTitle}>{addType === 'visit' ? 'Visit Information' : 'Appointment Information'}</Text>

            {/* Select Lead Dropdown */}
            <Text style={styles.label}>Select Customer / Lead *</Text>
            <TouchableOpacity
              style={styles.dropdownTrigger}
              onPress={() => setShowLeadDropdown(!showLeadDropdown)}>
              <Text style={styles.dropdownTriggerText}>
                {selectedLead ? `${selectedLead.name} (${selectedLead.category})` : 'Select a lead'}
              </Text>
              <ChevronDown size={20} color="#64748b" />
            </TouchableOpacity>

            {showLeadDropdown && (
              <View style={styles.dropdownMenu}>
                {leads.length === 0 ? (
                  <Text style={styles.dropdownItemText}>No leads available. Please create one.</Text>
                ) : (
                  leads.map((l) => (
                    <TouchableOpacity
                      key={l.id}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setSelectedLeadId(l.id);
                        setShowLeadDropdown(false);
                      }}>
                      <Text style={styles.dropdownItemText}>{l.name} - {l.category}</Text>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            )}

            <Text style={styles.label}>{addType === 'visit' ? 'Visit Title *' : 'Appointment Title *'}</Text>
            <TextInput
              style={styles.input}
              value={apptTitle}
              onChangeText={setApptTitle}
              placeholder={addType === 'visit' ? "e.g. Site Inspection Visit" : "e.g. Initial Consultation"}
              placeholderTextColor="#94a3b8"
            />

            <Text style={styles.label}>Date & Time *</Text>
            <TextInput
              style={styles.input}
              value={apptDate}
              onChangeText={setApptDate}
              placeholder="e.g. 20 MAY 2026, 04:00 PM - 05:00 PM"
              placeholderTextColor="#94a3b8"
            />

            <Text style={styles.label}>Additional Description / Notes</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={apptNotes}
              onChangeText={setApptNotes}
              placeholder="Provide meeting agenda or notes..."
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.formActions}>
            <TouchableOpacity
              style={styles.cancelBtnFilled}
              onPress={() => { resetForm(); setCurrentView('list'); }}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.submitBtnFilled} onPress={handleCreateAppointment}>
              <Text style={styles.submitBtnText}>{addType === 'visit' ? 'Save Visit' : 'Save Appointment'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>AS</Text>
          </View>
          <Text style={styles.headerTitle}>Appointments</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity style={styles.searchIconBtn}>
            <Search size={22} color="#1e1b4b" />
          </TouchableOpacity>
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
                style={[styles.menuItem, styles.menuItemActive]} 
                onPress={() => { setShowMenu(false); }}>
                <CalendarIcon size={18} color="#4338ca" />
                <Text style={[styles.menuItemText, styles.menuItemTextActive]}>Appointments</Text>
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
                style={styles.menuItem} 
                onPress={() => { setShowMenu(false); router.push('/reports'); }}>
                <User size={18} color="#64748b" />
                <Text style={styles.menuItemText}>Profile</Text>
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

        {/* 2x2 Metrics Cards Grid */}
        <View style={styles.metricsContainer}>
          <View style={styles.metricsGrid}>
            
            {/* Card 1: Total Appointments */}
            <TouchableOpacity 
              onPress={() => {
                setActiveSubTab('appointment');
                setSelectedMetricsFilter('all');
              }}
              style={[
                styles.metricCard, 
                { 
                  backgroundColor: '#f0f4ff', 
                  borderColor: selectedMetricsFilter === 'all' && activeSubTab === 'appointment' ? '#4f46e5' : '#c7d2fe',
                  borderWidth: selectedMetricsFilter === 'all' && activeSubTab === 'appointment' ? 2 : 1 
                }
              ]}>
              <View style={styles.metricCardHeader}>
                <Text style={styles.metricCardLabel}>Total{"\n"}Appointment</Text>
                <CalendarIcon size={20} color="#4f46e5" />
              </View>
              <Text style={styles.metricCardValue}>{metrics.total}</Text>
              <Text style={styles.metricCardSubText}>Scheduled this month</Text>
            </TouchableOpacity>

            {/* Card 2: Total Visit Planned */}
            <TouchableOpacity 
              onPress={() => {
                setActiveSubTab('visits');
                setSelectedMetricsFilter('visit_planned');
              }}
              style={[
                styles.metricCard, 
                { 
                  backgroundColor: '#faf5ff', 
                  borderColor: selectedMetricsFilter === 'visit_planned' ? '#9333ea' : '#e9d5ff',
                  borderWidth: selectedMetricsFilter === 'visit_planned' ? 2 : 1 
                }
              ]}>
              <View style={styles.metricCardHeader}>
                <Text style={styles.metricCardLabel}>Total visit{"\n"}planned</Text>
                <MapPin size={20} color="#9333ea" />
              </View>
              <Text style={styles.metricCardValue}>{metrics.visitPlanned}</Text>
              <Text style={styles.metricCardSubText}>Planned site visits</Text>
            </TouchableOpacity>

            {/* Card 3: Completed Appointments */}
            <TouchableOpacity 
              onPress={() => {
                setActiveSubTab('appointment');
                setSelectedMetricsFilter('completed_appt');
              }}
              style={[
                styles.metricCard, 
                { 
                  backgroundColor: '#ecfdf5', 
                  borderColor: selectedMetricsFilter === 'completed_appt' ? '#10b981' : '#a7f3d0',
                  borderWidth: selectedMetricsFilter === 'completed_appt' ? 2 : 1 
                }
              ]}>
              <View style={styles.metricCardHeader}>
                <Text style={styles.metricCardLabel}>Completed{"\n"}Appointment</Text>
                <CheckCircle2 size={20} color="#10b981" />
              </View>
              <Text style={styles.metricCardValue}>{metrics.completed}</Text>
              <Text style={[styles.metricCardSubText, { color: '#059669', fontWeight: '700' }]}>+5 Completed Today</Text>
            </TouchableOpacity>

            {/* Card 4: Total Visits Completed */}
            <TouchableOpacity 
              onPress={() => {
                setActiveSubTab('visits');
                setSelectedMetricsFilter('completed_visit');
              }}
              style={[
                styles.metricCard, 
                { 
                  backgroundColor: '#fffbeb', 
                  borderColor: selectedMetricsFilter === 'completed_visit' ? '#f97316' : '#fed7aa',
                  borderWidth: selectedMetricsFilter === 'completed_visit' ? 2 : 1 
                }
              ]}>
              <View style={styles.metricCardHeader}>
                <Text style={styles.metricCardLabel}>Total Visit{"\n"}completed</Text>
                <CheckCircle2 size={20} color="#f97316" />
              </View>
              <Text style={styles.metricCardValue}>{metrics.completedWeek}</Text>
              <Text style={styles.metricCardSubText}>Done this week</Text>
            </TouchableOpacity>

          </View>
        </View>

        {/* Custom Calendar Card */}
        <View style={styles.calendarCard}>
          <View style={styles.calendarHeader}>
            <Text style={styles.calendarMonthYear}>
              {new Date(currentMonthYear.year, currentMonthYear.month).toLocaleString('default', {
                month: 'long',
                year: 'numeric',
              })}
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity onPress={handlePrevMonth} style={styles.calendarNavBtn}>
                <ChevronLeft size={16} color="#475569" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleNextMonth} style={styles.calendarNavBtn}>
                <ChevronRight size={16} color="#475569" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Weekday headers */}
          <View style={styles.weekdaysRow}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((wd, index) => (
              <Text key={index} style={styles.weekdayText}>{wd}</Text>
            ))}
          </View>

          {/* Days Grid */}
          <View style={styles.daysGrid}>
            {renderCalendarDays().map((dInfo) => {
              if (dInfo.day === null) {
                return <View key={dInfo.key} style={styles.dayCellEmpty} />;
              }

              const formattedDate = new Date(
                currentMonthYear.year,
                currentMonthYear.month,
                dInfo.day
              ).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              const isStart = selectedStartDate === formattedDate;
              const isEnd = selectedEndDate === formattedDate;
              const isSelected = isStart || isEnd;
              const isInRange = (() => {
                if (!selectedStartDate || !selectedEndDate) return false;
                const current = new Date(formattedDate);
                const start = new Date(selectedStartDate);
                const end = new Date(selectedEndDate);
                return current > start && current < end;
              })();

              const isToday =
                dInfo.day === new Date().getDate() &&
                currentMonthYear.month === new Date().getMonth() &&
                currentMonthYear.year === new Date().getFullYear();

              const hasAppt = appointmentDays.includes(dInfo.day);

              return (
                <TouchableOpacity
                  key={dInfo.key}
                  style={styles.dayCell}
                  onPress={() => handleDatePress(formattedDate)}>
                  <View
                    style={[
                      styles.dayTextContainer,
                      isToday && styles.dayTodayCircle,
                      isInRange && styles.dayInRangeHighlight,
                      isSelected && styles.daySelectedCircle,
                    ]}>
                    <Text
                      style={[
                        styles.dayNumberText,
                        isToday && styles.dayNumberTodayText,
                        isInRange && styles.dayNumberInRangeText,
                        isSelected && styles.dayNumberSelectedText,
                      ]}>
                      {dInfo.day}
                    </Text>
                  </View>
                  {hasAppt && !isSelected && !isInRange && (
                    <View style={styles.dayDotIndicator} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
          {selectedStartDate && (
            <Text style={styles.selectedDateText}>
              Selected Range: {selectedStartDate}{selectedEndDate ? ` to ${selectedEndDate}` : ''}
            </Text>
          )}
        </View>

        {/* Custom Tabs Navigation (Appointment / Visits) */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabItem, activeSubTab === 'appointment' && styles.tabItemActive]}
            onPress={() => {
              setActiveSubTab('appointment');
              setSelectedMetricsFilter('all');
            }}>
            <Text style={[styles.tabText, activeSubTab === 'appointment' && styles.tabTextActive]}>
              Appointment
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabItem, activeSubTab === 'visits' && styles.tabItemActive]}
            onPress={() => {
              setActiveSubTab('visits');
              setSelectedMetricsFilter('all');
            }}>
            <Text style={[styles.tabText, activeSubTab === 'visits' && styles.tabTextActive]}>
              Visits
            </Text>
          </TouchableOpacity>
        </View>

        {/* Appointment list content */}
        <View style={styles.listContainer}>
          {getDisplayAppointments().length === 0 ? (
            <View style={styles.emptyContainer}>
              <AlertCircle size={40} color="#94a3b8" />
              <Text style={styles.emptyText}>No appointments listed for this filter.</Text>
            </View>
          ) : (
            getDisplayAppointments().map((appt) => {
              // Find matching lead for details
              const lead = leads.find((l) => l.id === appt.leadId);
              const phoneStr = lead ? lead.phone : '+91 98765 43210';
              const locationStr = appt.notes ? appt.notes : (lead ? `${lead.category}, Office` : 'Main Office, DLF Cyber City');
              const personName = appt.leadName;

              // Parse date and time from appt.dateTime
              const dateTimeParts = appt.dateTime.split(', ');
              const datePart = dateTimeParts[0] || appt.dateTime;
              const timePart = dateTimeParts[1] || '';

              // Extract date info or use default format
              const isAssigned = appt.status === 'completed' || (activeSubTab === 'visits' && appt.id === 'APT-101');
              const isInProgress = appt.status === 'in_progress';
              const isWaiting = !isAssigned && !isInProgress;

              let badgeStyle = styles.badgeWaiting;
              let badgeTextStyle = styles.badgeTextWaiting;
              let badgeLabel = 'WAITING';

              if (isAssigned) {
                badgeStyle = styles.badgeAssigned;
                badgeTextStyle = styles.badgeTextAssigned;
                badgeLabel = 'ASSIGNED';
              } else if (isInProgress) {
                badgeStyle = styles.badgeInProgress;
                badgeTextStyle = styles.badgeTextInProgress;
                badgeLabel = 'IN-APPOINTMENT';
              }

              return (
                <View key={appt.id} style={styles.apptCard}>
                  <View style={styles.cardHeaderRow}>
                    <View>
                      <Text style={styles.apptDateLabel}>{datePart}</Text>
                      <Text style={styles.apptTimeLabel}>{timePart}</Text>
                    </View>
                    <View style={[styles.statusBadge, badgeStyle]}>
                      <Text style={[styles.statusBadgeText, badgeTextStyle]}>
                        {badgeLabel}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.apptCardTitle}>{appt.title}</Text>

                  <View style={styles.metaRow}>
                    <User size={15} color="#94a3b8" />
                    <Text style={styles.metaValueText}>{personName}</Text>
                  </View>

                  <TouchableOpacity onPress={() => handleCall(phoneStr)} style={styles.metaRow}>
                    <Phone size={15} color="#94a3b8" />
                    <Text style={[styles.metaValueText, { color: '#4338ca', fontWeight: '600' }]}>{phoneStr}</Text>
                  </TouchableOpacity>

                  <View style={styles.metaRow}>
                    <MapPin size={15} color="#94a3b8" />
                    <Text style={styles.metaValueText}>{locationStr}</Text>
                  </View>

                  {isInProgress && (
                    <View style={styles.inProgressPanel}>
                      <View style={styles.inProgressStatusRow}>
                        <View style={styles.inProgressDot} />
                        <Text style={styles.inProgressStatusText}>IN PROGRESS</Text>
                      </View>
                      
                      <View style={styles.progressDetailRow}>
                        <MapPin size={16} color="#ef4444" />
                        <Text style={styles.progressDetailLabel}>
                          Google Location: <Text style={styles.progressDetailValueBlue}>{appt.notes || 'Main Office'}</Text>
                        </Text>
                      </View>

                      <View style={styles.progressDetailRow}>
                        <Clock size={16} color="#8b5cf6" />
                        <Text style={styles.progressDetailLabel}>
                          Start Time: <Text style={styles.progressDetailValueTime}>{appt.startTime || '03:32 PM'}</Text>
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={styles.endApptButton}
                        onPress={() => {
                          setEndingAppt(appt);
                          setMeasurementNote('');
                          setMeasurementImage(null);
                          setSiteImage(null);
                          setDesignRequest('None');
                          setEndApptRemarks('');
                          setShowEndApptModal(true);
                        }}>
                        <Text style={styles.endApptButtonText}>End Appointment</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {!isInProgress && (
                    <View style={styles.actionButtonsRow}>
                      <TouchableOpacity
                        style={styles.rescheduleBtn}
                        onPress={() => {
                          setReschedulingAppt(appt);
                          const dateTimeParts = appt.dateTime.split(', ');
                          const datePart = dateTimeParts[0];
                          const timePart = dateTimeParts[1] || '';
                          
                          let formattedDate = '15 - 05 - 2026';
                          const dateSubparts = datePart.split(' ');
                          if (dateSubparts.length === 3) {
                            const dVal = dateSubparts[0].padStart(2, '0');
                            const mVal = dateSubparts[1].toUpperCase();
                            const yVal = dateSubparts[2];
                            const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
                            const mIdx = months.indexOf(mVal) + 1;
                            const mIdxStr = mIdx ? mIdx.toString().padStart(2, '0') : '05';
                            formattedDate = `${dVal} - ${mIdxStr} - ${yVal}`;
                          }
                          setRescheduleDate(formattedDate);

                          const timeSubparts = timePart.split(' - ');
                          setRescheduleStartTime(timeSubparts[0] || '02:00 PM');
                          setRescheduleEndTime(timeSubparts[1] || '03:30 PM');

                          setRescheduleAddress(appt.notes || '');
                          setIsEditingRescheduleAddress(false);
                          setShowRescheduleModal(true);
                        }}>
                        <Text style={styles.rescheduleBtnText}>Reschedule</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.startBtn}
                        onPress={() => handleOpenStartAppointment(appt)}>
                        <Text style={styles.startBtnText}>
                          {activeSubTab === 'visits' ? 'Start Visit' : 'Appointment Start'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Action Button */}
      {!showFabMenu && (
        <TouchableOpacity style={styles.fab} onPress={() => setShowFabMenu(true)}>
          <Plus size={26} color="#ffffff" />
        </TouchableOpacity>
      )}

      {/* ================= FAB MENU OVERLAY ================= */}
      {showFabMenu && (
        <TouchableOpacity 
          style={styles.fabMenuOverlayAbsolute} 
          activeOpacity={1} 
          onPress={() => setShowFabMenu(false)}>
          
          <View style={styles.fabMenuContainerAbsolute}>
            <TouchableOpacity 
              style={[styles.fabMenuItem, { marginRight: 8 }]} 
              onPress={() => openAddForm('appointment')}>
              <Text style={styles.fabMenuText}>Appointment</Text>
              <View style={[styles.miniFab, { backgroundColor: '#4f46e5' }]}>
                <CalendarIcon size={16} color="#ffffff" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.fabMenuItem, { marginRight: 8 }]} 
              onPress={() => openAddForm('visit')}>
              <Text style={styles.fabMenuText}>Visit</Text>
              <View style={[styles.miniFab, { backgroundColor: '#9333ea' }]}>
                <MapPin size={16} color="#ffffff" />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={{
                backgroundColor: '#110e3d',
                width: 56,
                height: 56,
                borderRadius: 28,
                alignItems: 'center',
                justifyContent: 'center',
                elevation: 8,
                shadowColor: '#110e3d',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 6,
                marginTop: 12,
              }} 
              onPress={() => setShowFabMenu(false)}>
              <X size={26} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}

      {/* ================= RESCHEDULE VISIT MODAL ================= */}
      <Modal visible={showRescheduleModal} animationType="fade" transparent>
        <View style={styles.modalOverlayCenter}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContentCenter}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {activeSubTab === 'visits' ? 'Reschedule Visit' : 'Reschedule Appointment'}
              </Text>
              <TouchableOpacity onPress={() => setShowRescheduleModal(false)}>
                <X size={24} color="#475569" />
              </TouchableOpacity>
            </View>

            <View style={styles.formContainerModal}>
              <Text style={styles.modalLabel}>New Date</Text>
              <View style={styles.inputIconContainer}>
                <TextInput
                  value={rescheduleDate}
                  onChangeText={setRescheduleDate}
                  placeholder="DD - MM - YYYY"
                  placeholderTextColor="#94a3b8"
                  style={styles.modalInput}
                />
                <CalendarIcon size={18} color="#94a3b8" style={styles.inputIcon} />
              </View>

              <Text style={styles.modalLabel}>Time Duration</Text>
              <View style={styles.durationRow}>
                <View style={styles.inputIconContainerHalf}>
                  <TextInput
                    value={rescheduleStartTime}
                    onChangeText={setRescheduleStartTime}
                    placeholder="02:00 PM"
                    placeholderTextColor="#94a3b8"
                    style={styles.modalInput}
                  />
                  <Clock size={16} color="#94a3b8" style={styles.inputIcon} />
                </View>
                
                <Text style={styles.durationToText}>to</Text>
                
                <View style={styles.inputIconContainerHalf}>
                  <TextInput
                    value={rescheduleEndTime}
                    onChangeText={setRescheduleEndTime}
                    placeholder="03:30 PM"
                    placeholderTextColor="#94a3b8"
                    style={styles.modalInput}
                  />
                  <Clock size={16} color="#94a3b8" style={styles.inputIcon} />
                </View>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <Text style={styles.modalLabel}>Address</Text>
                {!isEditingRescheduleAddress && (
                  <TouchableOpacity 
                    style={{ backgroundColor: '#e5e1fa', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 }}
                    onPress={() => {
                      setIsEditingRescheduleAddress(true);
                      handleAutoDetectLocation((addr) => setRescheduleAddress(addr));
                    }}>
                    <Text style={{ fontSize: 11, color: '#4338ca', fontWeight: '700' }}>Change Address</Text>
                  </TouchableOpacity>
                )}
              </View>
              {isEditingRescheduleAddress ? (
                <TextInput
                  value={rescheduleAddress}
                  onChangeText={setRescheduleAddress}
                  placeholder="Enter address..."
                  placeholderTextColor="#94a3b8"
                  style={[styles.modalInput, { marginBottom: 12 }]}
                  autoFocus
                />
              ) : (
                <TextInput
                  value={rescheduleAddress || 'No address set'}
                  style={[styles.modalInput, { backgroundColor: '#f8fafc', color: '#64748b', marginBottom: 12 }]}
                  editable={false}
                />
              )}

              <View style={styles.modalFooterActions}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setShowRescheduleModal(false)}>
                  <Text style={styles.modalCancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalConfirmBtn}
                  onPress={handleConfirmReschedule}>
                  <Text style={styles.modalConfirmBtnText}>Confirm Reschedule</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* ================= START APPOINTMENT MODAL OVERLAY ================= */}
      <Modal visible={currentView === 'start-appointment'} animationType="fade" transparent>
        <View style={styles.startApptCardWrapper}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.startApptCard}>
            
            {/* Header */}
            <View style={styles.startApptHeader}>
              <Text style={styles.startApptTitle}>
                {activeSubTab === 'visits' ? 'Start Visit' : 'Start Appointment'}
              </Text>
              <TouchableOpacity onPress={() => setCurrentView('list')}>
                <X size={22} color="#475569" />
              </TouchableOpacity>
            </View>

            {/* Field 1: GOOGLE LOCATION */}
            <View style={styles.startApptField}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text style={styles.startApptLabel}>GOOGLE LOCATION URL / ADDRESS</Text>
                {!isEditingStartLocation && (
                  <TouchableOpacity 
                    style={{ backgroundColor: '#e5e1fa', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 }}
                    onPress={() => {
                      setIsEditingStartLocation(true);
                      handleAutoDetectLocation((addr) => setStartLocation(addr));
                    }}>
                    <Text style={{ fontSize: 11, color: '#4338ca', fontWeight: '700' }}>Change Address</Text>
                  </TouchableOpacity>
                )}
              </View>
              {isEditingStartLocation ? (
                <TextInput
                  style={styles.startApptInput}
                  value={startLocation}
                  onChangeText={setStartLocation}
                  placeholder="Enter Google Location Address"
                  placeholderTextColor="#94a3b8"
                  autoFocus
                />
              ) : (
                <TextInput
                  style={[styles.startApptInput, { backgroundColor: '#f8fafc', color: '#64748b' }]}
                  value={startLocation || 'No location set'}
                  editable={false}
                />
              )}
            </View>

            {/* Field 2: START TIME */}
            <View style={styles.startApptField}>
              <Text style={styles.startApptLabel}>START TIME</Text>
              <View style={styles.timeInputRow}>
                <View style={styles.timeInputContainer}>
                  <TextInput
                    style={styles.timeInput}
                    value={startTimeText}
                    onChangeText={setStartTimeText}
                    placeholder="Time"
                    placeholderTextColor="#94a3b8"
                  />
                  <Clock size={18} color="#94a3b8" />
                </View>
                
                <TouchableOpacity
                  style={styles.currentTimeBtn}
                  onPress={() => setStartTimeText(getCurrentTimeFormatted())}>
                  <Text style={styles.currentTimeBtnText}>Current Time</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Buttons Row */}
            <View style={styles.startApptActions}>
              <TouchableOpacity
                style={styles.startApptCancelBtn}
                onPress={() => setCurrentView('list')}>
                <Text style={styles.startApptCancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.startApptConfirmBtn}
                onPress={handleConfirmStartAppointment}>
                <Text style={styles.startApptConfirmBtnText}>
                  {activeSubTab === 'visits' ? 'Start Visit' : 'Start Appointment'}
                </Text>
              </TouchableOpacity>
            </View>

          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* ================= END APPOINTMENT DETAILS MODAL OVERLAY ================= */}
      <Modal visible={showEndApptModal} animationType="fade" transparent>
        <View style={styles.modalOverlayCenter}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.modalContentCenter, { maxWidth: 420 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>End Appointment Details</Text>
              <TouchableOpacity onPress={() => setShowEndApptModal(false)}>
                <X size={24} color="#475569" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formContainerModal}>
              
              <Text style={styles.modalLabel}>Measurement Note</Text>
              <TextInput
                value={measurementNote}
                onChangeText={setMeasurementNote}
                placeholder="Enter measurement value in square feet"
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={3}
                style={[styles.input, styles.multilineInput, { height: 80 }]}
              />

              {/* Row for Labels */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginTop: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modalLabel, { marginTop: 0, marginBottom: 0 }]}>Measurement Image (Optional)</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modalLabel, { marginTop: 0, marginBottom: 0 }]}>Site Image *</Text>
                </View>
              </View>

              {/* Row for Upload Boxes */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginTop: 8 }}>
                
                {/* Measurement Image */}
                <View style={{ flex: 1 }}>
                  <TouchableOpacity
                    style={[
                      styles.uploadBox,
                      measurementImage ? styles.uploadBoxSuccess : styles.uploadBoxOptional
                    ]}
                    onPress={() => {
                      setMeasurementImage('measurement_layout.png');
                      Alert.alert('Upload Successful', 'Mock measurement layout uploaded.');
                    }}>
                    <Upload size={22} color={measurementImage ? '#10b981' : '#4c49ed'} />
                    <Text style={styles.uploadText}>
                      {measurementImage ? 'Uploaded' : 'Upload Measurement\n(Optional)'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Site Image */}
                <View style={{ flex: 1 }}>
                  <TouchableOpacity
                    style={[
                      styles.uploadBox,
                      siteImage ? styles.uploadBoxSuccess : styles.uploadBoxRequired
                    ]}
                    onPress={() => {
                      setSiteImage('site_overview.jpg');
                      Alert.alert('Upload Successful', 'Mock site photo uploaded.');
                    }}>
                    <Upload size={22} color={siteImage ? '#10b981' : '#4c49ed'} />
                    <Text style={styles.uploadText}>
                      {siteImage ? 'Uploaded (Required)' : 'Upload Site Image\n(Required)'}
                    </Text>
                  </TouchableOpacity>
                </View>

              </View>

              {/* Design Request Select */}
              <Text style={styles.modalLabel}>Design Request</Text>
              <TouchableOpacity
                style={styles.dropdownTrigger}
                onPress={() => setShowDesignDropdown(!showDesignDropdown)}>
                <Text style={styles.dropdownTriggerText}>{designRequest}</Text>
                <ChevronDown size={20} color="#64748b" />
              </TouchableOpacity>

              {showDesignDropdown && (
                <View style={styles.dropdownMenu}>
                  {['None', '2D', '3D'].map((item) => (
                    <TouchableOpacity
                      key={item}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setDesignRequest(item);
                        setShowDesignDropdown(false);
                      }}>
                      <Text style={styles.dropdownItemText}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <Text style={styles.modalLabel}>Remarks</Text>
              <TextInput
                value={endApptRemarks}
                onChangeText={setEndApptRemarks}
                placeholder="Enter feedback and remarks..."
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={3}
                style={[styles.input, styles.multilineInput, { height: 80 }]}
              />

              <View style={styles.modalFooterActions}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setShowEndApptModal(false)}>
                  <Text style={styles.modalCancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalConfirmBtn, { backgroundColor: '#dc2626' }]}
                  onPress={handleConfirmEndAppointment}>
                  <Text style={styles.modalConfirmBtnText}>End Appointment</Text>
                </TouchableOpacity>
              </View>

            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1eef6',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#110e3d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#110e3d',
  },
  searchIconBtn: {
    padding: 6,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#e5e1fa',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
  },
  filterPillText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
  },
  metricsContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
    marginTop: 20,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  metricCard: {
    width: '48.5%',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'space-between',
    minHeight: 120,
  },
  metricCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  metricCardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    lineHeight: 16,
  },
  metricCardValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#110e3d',
    marginVertical: 4,
  },
  metricCardSubText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
  },
  calendarCard: {
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: '#e5e1fa',
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#ffffff',
    marginBottom: 20,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarMonthYear: {
    fontSize: 16,
    fontWeight: '700',
    color: '#110e3d',
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  weekdayText: {
    width: 32,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 8,
  },
  dayCellEmpty: {
    width: 32,
    height: 32,
  },
  dayCell: {
    width: 32,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayTextContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  daySelectedCircle: {
    backgroundColor: '#110e3d',
  },
  dayNumberText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  dayNumberSelectedText: {
    color: '#ffffff',
  },
  dayDotIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#4338ca',
    marginTop: 2,
  },
  dayTodayCircle: {
    borderWidth: 1.5,
    borderColor: '#4338ca',
  },
  dayNumberTodayText: {
    color: '#4338ca',
    fontWeight: 'bold',
  },
  calendarNavBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e1fa',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dayInRangeHighlight: {
    backgroundColor: '#e5e1fa',
    borderRadius: 14,
  },
  dayNumberInRangeText: {
    color: '#4338ca',
    fontWeight: '600',
  },
  selectedDateText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4338ca',
    marginTop: 8,
    textAlign: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f1eef6',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: '#4338ca',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
  },
  tabTextActive: {
    color: '#4338ca',
    fontWeight: '700',
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  apptCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e1fa',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  apptDateLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#110e3d',
  },
  apptTimeLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeWaiting: {
    backgroundColor: '#ffedd5',
  },
  badgeAssigned: {
    backgroundColor: '#dcfce7',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  badgeTextWaiting: {
    color: '#c2410c',
  },
  badgeTextAssigned: {
    color: '#15803d',
  },
  apptCardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#110e3d',
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  metaValueText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 16,
  },
  rescheduleBtn: {
    flex: 1,
    height: 40,
    borderWidth: 1.5,
    borderColor: '#110e3d',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rescheduleBtnText: {
    color: '#110e3d',
    fontSize: 13,
    fontWeight: '700',
  },
  startBtn: {
    flex: 1.2,
    height: 40,
    backgroundColor: '#110e3d',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    bottom: 84, // Higher placement to float above the bottom tabs safely
    right: 20,
    backgroundColor: '#110e3d',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#110e3d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    zIndex: 99,
  },
  // Form Design
  formContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  backBtn: {
    padding: 4,
  },
  formSection: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e1fa',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  formSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#110e3d',
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#110e3d',
    backgroundColor: '#ffffff',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingVertical: 10,
  },
  dropdownTrigger: {
    height: 44,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
  },
  dropdownTriggerText: {
    fontSize: 14,
    color: '#110e3d',
  },
  dropdownMenu: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    marginTop: 4,
    padding: 4,
    maxHeight: 150,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#334155',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelBtnFilled: {
    flex: 1,
    height: 48,
    borderWidth: 1.5,
    borderColor: '#4338ca',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  cancelBtnText: {
    color: '#4338ca',
    fontSize: 15,
    fontWeight: '700',
  },
  submitBtnFilled: {
    flex: 1,
    height: 48,
    backgroundColor: '#110e3d',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  badgeInProgress: {
    backgroundColor: '#fef3c7',
  },
  badgeTextInProgress: {
    color: '#b45309',
  },
  inProgressPanel: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#e5e1fa',
  },
  inProgressStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  inProgressDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2563eb',
  },
  inProgressStatusText: {
    color: '#2563eb',
    fontSize: 12,
    fontWeight: '800',
  },
  progressDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  progressDetailLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  progressDetailValueBlue: {
    color: '#2563eb',
    fontWeight: '700',
  },
  progressDetailValueTime: {
    color: '#6366f1',
    fontWeight: '700',
  },
  endApptButton: {
    backgroundColor: '#dc2626',
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  endApptButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  // Start Appointment View Styles
  startApptCardWrapper: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  startApptCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e5e1fa',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    elevation: 4,
    shadowColor: '#1e1b4b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  startApptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1eef6',
    paddingBottom: 16,
    marginBottom: 20,
  },
  startApptTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#110e3d',
  },
  startApptField: {
    marginBottom: 20,
  },
  startApptLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  startApptInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#e5e1fa',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#110e3d',
    backgroundColor: '#f8fafc',
  },
  timeInputRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  timeInputContainer: {
    flex: 1.2,
    height: 48,
    borderWidth: 1,
    borderColor: '#e5e1fa',
    borderRadius: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
  },
  timeInput: {
    flex: 1,
    fontSize: 14,
    color: '#110e3d',
  },
  currentTimeBtn: {
    flex: 1,
    height: 48,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#dbeafe',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentTimeBtnText: {
    color: '#2563eb',
    fontSize: 13,
    fontWeight: '700',
  },
  startApptActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
  },
  startApptCancelBtn: {
    flex: 1,
    height: 48,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startApptCancelBtnText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '700',
  },
  startApptConfirmBtn: {
    flex: 1.5,
    height: 48,
    backgroundColor: '#6366f1',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startApptConfirmBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  modalOverlayCenter: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContentCenter: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 360,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1eef6',
    borderStyle: 'dashed',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#110e3d',
  },
  formContainerModal: {
    padding: 20,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
    marginTop: 12,
  },
  inputIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    height: 48,
    paddingHorizontal: 12,
  },
  inputIconContainerHalf: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    height: 48,
    paddingHorizontal: 12,
  },
  modalInput: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: '#110e3d',
    fontWeight: '500',
    outlineStyle: 'none',
  },
  inputIcon: {
    marginLeft: 8,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  durationToText: {
    fontSize: 14,
    color: '#64748b',
  },
  modalFooterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 24,
  },
  modalCancelBtn: {
    flex: 1,
    height: 48,
    backgroundColor: '#f1f0f5',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelBtnText: {
    color: '#1e293b',
    fontSize: 14,
    fontWeight: '600',
  },
  modalConfirmBtn: {
    flex: 1.3,
    height: 48,
    backgroundColor: '#4c49ed',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalConfirmBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  uploadBox: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 12,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 8,
  },
  uploadBoxOptional: {
    borderColor: '#cbd5e1', // Light slate blue/grey
  },
  uploadBoxRequired: {
    borderColor: '#fca5a5', // Light red/coral
  },
  uploadBoxSuccess: {
    borderColor: '#10b981', // Green
    borderStyle: 'solid',
    backgroundColor: '#f0fdf4',
  },
  uploadText: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 14,
    fontWeight: '500',
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
  fabMenuOverlayAbsolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    zIndex: 98,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingRight: 20,
    paddingBottom: 84,
  },
  fabMenuContainerAbsolute: {
    alignItems: 'flex-end',
    gap: 12,
    zIndex: 99,
  },
  fabMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  fabMenuText: {
    backgroundColor: '#ffffff',
    color: '#1e1b4b',
    fontWeight: '700',
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#1e1b4b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  miniFab: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1e1b4b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
});
