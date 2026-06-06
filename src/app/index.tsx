import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import { router } from 'expo-router';
import {
  Search,
  SlidersHorizontal,
  Plus,
  Phone,
  Calendar as CalendarIcon,
  User,
  Users,
  Pencil,
  ArrowUpDown,
  X,
  FileText,
  UserCheck,
  CheckCircle2,
  Trash2,
  Edit2,
  Sparkles,
  Flame,
  Thermometer,
  Snowflake,
  AlertTriangle,
  ArrowLeft,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Save,
  MoreVertical,
  Contact,
  History,
} from 'lucide-react-native';
import { useLeads, Lead, LeadStatus } from '@/context/leads-context';

export default function LeadsScreen() {
  const {
    leads,
    addLead,
    updateLead,
    deleteLead,
    addLeadHistory,
    addAppointment,
    addQuotation,
  } = useLeads();

  // Active Lead States
  const [activeLeadId, setActiveLeadId] = useState<string | null>(null);
  const activeLead = activeLeadId ? leads.find((l) => l.id === activeLeadId) || null : null;

  // Navigation State
  const [currentView, setCurrentView] = useState<'leads-list' | 'add-lead' | 'edit-lead' | 'lead-details'>('leads-list');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'name'>('newest');
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const categoryFilter = 'All';
  const assigneeFilter = 'All';
  
  // Date filter state
  const todayDateObj = new Date();
  const [selectedStartDate, setSelectedStartDate] = useState<string | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<string | null>(null);
  const [calendarMonthYear, setCalendarMonthYear] = useState({
    month: todayDateObj.getMonth(),
    year: todayDateObj.getFullYear()
  });
  const [showMonthYearPicker, setShowMonthYearPicker] = useState(false);

  const selectEntireMonth = (m: number, y: number) => {
    const startOf = new Date(y, m, 1).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const endOf = new Date(y, m + 1, 0).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    setSelectedStartDate(startOf);
    setSelectedEndDate(endOf);
  };

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
    setCalendarMonthYear((prev) => {
      if (prev.month === 0) {
        return { month: 11, year: prev.year - 1 };
      }
      return { month: prev.month - 1, year: prev.year };
    });
  };

  const handleNextMonth = () => {
    setCalendarMonthYear((prev) => {
      if (prev.month === 11) {
        return { month: 0, year: prev.year + 1 };
      }
      return { month: prev.month + 1, year: prev.year };
    });
  };

  const renderCalendarDays = () => {
    const { month, year } = calendarMonthYear;
    const days = [];
    const firstDayIndex = new Date(year, month, 1).getDay();
    const numDays = new Date(year, month + 1, 0).getDate();
    
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ day: null, key: `empty-${i}` });
    }
    for (let d = 1; d <= numDays; d++) {
      days.push({ day: d, key: `day-${d}` });
    }
    return days;
  };

  // Modal States
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showApptModal, setShowApptModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  
  // Status Change Remark States
  const [showStatusRemarkModal, setShowStatusRemarkModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<LeadStatus | null>(null);
  const [statusRemarkText, setStatusRemarkText] = useState('');



  // Form States (Add/Edit)
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState(''); // Service
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formStatus, setFormStatus] = useState<LeadStatus>('new');
  const [formAssignee, setFormAssignee] = useState('Sarah Smith');
  const [formNotes, setFormNotes] = useState('');
  const [formSource, setFormSource] = useState('');

  // Dropdown UI States
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [showEditServiceDropdown, setShowEditServiceDropdown] = useState(false);
  const [showEditSourceDropdown, setShowEditSourceDropdown] = useState(false);
  const [showEditStatusDropdown, setShowEditStatusDropdown] = useState(false);
  const [showEditAssigneeDropdown, setShowEditAssigneeDropdown] = useState(false);

  const services = ['Commercial Interior', 'Office Renovation', 'Residential Design', 'Space Planning'];
  const sources = ['Website', 'Referral', 'Google Search', 'Social Media'];

  // Sub-Form States (Appointment)
  const [apptTitle, setApptTitle] = useState('');
  const [apptDate, setApptDate] = useState('');
  const [apptNotes, setApptNotes] = useState('');

  // Sub-Form States (Quotation)
  const [quoteTitle, setQuoteTitle] = useState('');
  const [quoteAmount, setQuoteAmount] = useState('');
  const [quoteNotes, setQuoteNotes] = useState('');

  // Custom Log State
  const [customLogText, setCustomLogText] = useState('');

  // Calculate Metrics
  const metrics = {
    total: leads.length,
    new: leads.filter((l) => l.status === 'new').length,
    hot: leads.filter((l) => l.status === 'hot').length,
    warm: leads.filter((l) => l.status === 'warm').length,
    cold: leads.filter((l) => l.status === 'cold').length,
    appt_fixed: leads.filter((l) => l.status === 'appt_fixed').length,
    quotation_send: leads.filter((l) => l.status === 'quotation_send').length,
    junk: leads.filter((l) => l.status === 'junk').length,
    negotiation: leads.filter((l) => l.status === 'negotiation').length,
    order_confirmed: leads.filter((l) => l.status === 'order_confirmed').length,
  };

  // Status visual mapping (matching design palette and icons)
  const statusStyles: Record<
    LeadStatus,
    { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
  > = {
    new: {
      label: 'New Leads',
      bg: '#eff6ff',
      text: '#1d4ed8',
      border: '#bfdbfe',
      icon: <Sparkles size={16} color="#1d4ed8" />,
    },
    hot: {
      label: 'Hot Leads',
      bg: '#fff5f5',
      text: '#b91c1c',
      border: '#fee2e2',
      icon: <Flame size={16} color="#b91c1c" />,
    },
    warm: {
      label: 'Warm Leads',
      bg: '#fff7ed',
      text: '#c2410c',
      border: '#ffedd5',
      icon: <Thermometer size={16} color="#c2410c" />,
    },
    cold: {
      label: 'Cold Leads',
      bg: '#f8fafc',
      text: '#334155',
      border: '#cbd5e1',
      icon: <Snowflake size={16} color="#334155" />,
    },
    appt_fixed: {
      label: 'Appt. Fixed',
      bg: '#f0fdf4',
      text: '#15803d',
      border: '#bbf7d0',
      icon: <CalendarIcon size={16} color="#15803d" />,
    },
    quotation_send: {
      label: 'Quotation Send',
      bg: '#fdf2f8',
      text: '#be185d',
      border: '#fbcfe8',
      icon: <FileText size={16} color="#be185d" />,
    },
    junk: {
      label: 'Junk',
      bg: '#fafafa',
      text: '#374151',
      border: '#e5e7eb',
      icon: <Trash2 size={16} color="#374151" />,
    },
    negotiation: {
      label: 'Negotiation',
      bg: '#fefce8',
      text: '#854d0e',
      border: '#fef08a',
      icon: <Pencil size={16} color="#854d0e" />,
    },
    order_confirmed: {
      label: 'Order Confirmed',
      bg: '#ecfeff',
      text: '#0e7490',
      border: '#cffafe',
      icon: <CheckCircle2 size={16} color="#0e7490" />,
    },
  };



  // Filtering & Sorting Logic
  const filteredLeads = leads
    .filter((lead) => {
      const matchesSearch =
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        selectedStatusFilter === 'all' || lead.status === selectedStatusFilter;

      const matchesCategory = categoryFilter === 'All' || lead.category === categoryFilter;

      const matchesAssignee = assigneeFilter === 'All' || lead.assignedTo === assigneeFilter;

      const matchesDateFilter = (() => {
        if (!selectedStartDate) return true;
        const leadDate = new Date(lead.date);
        if (isNaN(leadDate.getTime())) return true;
        
        const start = new Date(selectedStartDate);
        start.setHours(0, 0, 0, 0);
        
        if (selectedEndDate) {
          const end = new Date(selectedEndDate);
          end.setHours(23, 59, 59, 999);
          return leadDate >= start && leadDate <= end;
        } else {
          return (
            leadDate.getDate() === start.getDate() &&
            leadDate.getMonth() === start.getMonth() &&
            leadDate.getFullYear() === start.getFullYear()
          );
        }
      })();

      return matchesSearch && matchesStatus && matchesCategory && matchesAssignee && matchesDateFilter;
    })
    .sort((a, b) => {
      if (sortOrder === 'newest') {
        return b.id.localeCompare(a.id);
      } else if (sortOrder === 'oldest') {
        return a.id.localeCompare(b.id);
      } else {
        return a.name.localeCompare(b.name);
      }
    });

  // Action: Add Lead
  const handleAddLead = async () => {
    if (!formName || !formCategory || !formPhone || !formAssignee) {
      Alert.alert('Missing Fields', 'Please fill in Name, Category, Phone, and Assigned Person.');
      return;
    }
    const today = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    await addLead({
      name: formName,
      category: formCategory,
      phone: formPhone,
      email: formEmail,
      date: today,
      status: formStatus,
      assignedTo: formAssignee,
      notes: formNotes,
    });

    resetLeadForm();
  };

  const handleSaveLead = async () => {
    if (!formName || !formCategory || !formPhone || !formSource) {
      Alert.alert('Missing Fields', 'Please fill in Customer Name, Service, Phone, and Lead Source.');
      return;
    }

    const today = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    await addLead({
      name: formName,
      category: formCategory,
      phone: formPhone,
      email: '',
      date: today,
      status: 'new',
      assignedTo: 'Sarah Smith',
      notes: `Lead Source: ${formSource}`,
    });

    resetLeadForm();
    setCurrentView('leads-list');
  };

  // Action: Open Edit Lead Screen
  const openEditModal = (lead: Lead) => {
    setActiveLeadId(lead.id);
    setFormName(lead.name);
    setFormCategory(lead.category);
    setFormPhone(lead.phone);
    setFormEmail(lead.email || '');
    setFormStatus(lead.status);
    setFormAssignee(lead.assignedTo);
    
    if (lead.notes && lead.notes.startsWith('Lead Source: ')) {
      const parts = lead.notes.split('\n');
      setFormSource(parts[0].replace('Lead Source: ', ''));
      setFormNotes(parts.slice(1).join('\n'));
    } else {
      setFormSource('Website');
      setFormNotes(lead.notes || '');
    }
    
    setCurrentView('edit-lead');
  };

  // Action: Save Edit Lead
  const handleEditLead = async () => {
    if (!activeLead) return;
    if (!formName || !formCategory || !formPhone || !formAssignee || !formSource) {
      Alert.alert('Missing Fields', 'Please fill in Name, Category, Phone, Source, and Assignee.');
      return;
    }

    const fullNotes = `Lead Source: ${formSource}\n${formNotes}`;

    await updateLead(activeLead.id, {
      name: formName,
      category: formCategory,
      phone: formPhone,
      email: formEmail,
      status: formStatus,
      assignedTo: formAssignee,
      notes: fullNotes,
      remark: statusRemarkText || undefined,
    });

    setStatusRemarkText('');
    resetLeadForm();
    setCurrentView('lead-details');
  };

  // Action: Delete Lead
  const handleDeleteLead = (leadId: string) => {
    Alert.alert('Delete Lead', 'Are you sure you want to permanently delete this lead and its items?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteLead(leadId);
          setShowDetailsModal(false);
          setActiveLeadId(null);
        },
      },
    ]);
  };

  // Action: Add Custom Timeline Log
  const handleAddCustomLog = async () => {
    if (!activeLead || !customLogText.trim()) return;
    await addLeadHistory(activeLead.id, 'note', customLogText.trim());
    setCustomLogText('');
  };

  // Action: Make Call
  const handleMakeCall = (phoneNumber: string, leadId: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  // Action: Add Appointment
  const handleAddAppointment = async () => {
    if (!activeLead) return;
    if (!apptTitle || !apptDate) {
      Alert.alert('Missing Fields', 'Please specify a title and date/time.');
      return;
    }

    await addAppointment({
      leadId: activeLead.id,
      leadName: activeLead.name,
      title: apptTitle,
      dateTime: apptDate,
      notes: apptNotes,
    });

    setApptTitle('');
    setApptDate('');
    setApptNotes('');
    setShowApptModal(false);
  };

  // Action: Add Quotation
  const handleAddQuotation = async () => {
    if (!activeLead) return;
    if (!quoteTitle || !quoteAmount) {
      Alert.alert('Missing Fields', 'Please specify a title and amount.');
      return;
    }

    const amountNum = parseFloat(quoteAmount);
    if (isNaN(amountNum)) {
      Alert.alert('Invalid Amount', 'Please input a valid numeric amount.');
      return;
    }

    const todayStr = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    await addQuotation({
      leadId: activeLead.id,
      leadName: activeLead.name,
      title: quoteTitle,
      amount: amountNum,
      dateTime: todayStr,
      status: 'sent',
      notes: quoteNotes,
    });

    setQuoteTitle('');
    setQuoteAmount('');
    setQuoteNotes('');
    setShowQuoteModal(false);
  };

  const resetLeadForm = () => {
    setFormName('');
    setFormCategory('');
    setFormPhone('');
    setFormEmail('');
    setFormStatus('new');
    setFormAssignee('Sarah Smith');
    setFormNotes('');
    setFormSource('');
    setStatusRemarkText('');
  };

  const toggleSortOrder = () => {
    if (sortOrder === 'newest') setSortOrder('oldest');
    else if (sortOrder === 'oldest') setSortOrder('name');
    else setSortOrder('newest');
  };

  if (currentView === 'add-lead') {
    return (
      <SafeAreaView style={styles.container}>
        {/* Top Header */}
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity onPress={() => setCurrentView('leads-list')} style={styles.backBtn}>
              <ArrowLeft size={22} color="#1e1b4b" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Add New Lead</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.formContainer} showsVerticalScrollIndicator={false}>
          <Text style={styles.label}>Customer Name</Text>
          <TextInput
            value={formName}
            onChangeText={setFormName}
            placeholder="e.g. John Doe"
            style={styles.input}
            placeholderTextColor="#94a3b8"
          />

          <Text style={styles.label}>Service</Text>
          <TouchableOpacity 
            style={styles.dropdownTrigger}
            onPress={() => {
              setShowServiceDropdown(!showServiceDropdown);
              setShowSourceDropdown(false);
            }}>
            <Text style={[styles.dropdownTriggerText, !formCategory && styles.dropdownPlaceholder]}>
              {formCategory || 'Select a service...'}
            </Text>
            <ChevronDown size={20} color="#64748b" />
          </TouchableOpacity>
          {showServiceDropdown && (
            <View style={styles.dropdownList}>
              {services.map((service) => (
                <TouchableOpacity
                  key={service}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setFormCategory(service);
                    setShowServiceDropdown(false);
                  }}>
                  <Text style={styles.dropdownItemText}>{service}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            value={formPhone}
            onChangeText={setFormPhone}
            placeholder="+1 (555) 000-0000"
            keyboardType="phone-pad"
            style={styles.input}
            placeholderTextColor="#94a3b8"
          />

          <Text style={styles.label}>Lead Source</Text>
          <TouchableOpacity 
            style={styles.dropdownTrigger}
            onPress={() => {
              setShowSourceDropdown(!showSourceDropdown);
              setShowServiceDropdown(false);
            }}>
            <Text style={[styles.dropdownTriggerText, !formSource && styles.dropdownPlaceholder]}>
              {formSource || 'Select source...'}
            </Text>
            <ChevronDown size={20} color="#64748b" />
          </TouchableOpacity>
          {showSourceDropdown && (
            <View style={styles.dropdownList}>
              {sources.map((source) => (
                <TouchableOpacity
                  key={source}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setFormSource(source);
                    setShowSourceDropdown(false);
                  }}>
                  <Text style={styles.dropdownItemText}>{source}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity style={styles.submitBtnLarge} onPress={handleSaveLead}>
            <Save size={18} color="#ffffff" style={{ marginRight: 8 }} />
            <Text style={styles.submitBtnText}>Save Lead</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (currentView === 'edit-lead') {
    return (
      <SafeAreaView style={styles.container}>
        {/* Top Header */}
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity onPress={() => setCurrentView('leads-list')} style={styles.backBtn}>
              <ArrowLeft size={22} color="#1e1b4b" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Lead</Text>
          </View>
          <TouchableOpacity style={styles.searchIconBtn}>
            <MoreVertical size={20} color="#1e1b4b" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.formContainer} showsVerticalScrollIndicator={false}>
          {/* Section 1: Lead Information */}
          <View style={styles.sectionHeaderRow}>
            <UserCheck size={18} color="#4338ca" />
            <Text style={styles.sectionHeaderText}>Lead Information</Text>
          </View>

          <Text style={styles.label}>Customer Name</Text>
          <TextInput
            value={formName}
            onChangeText={setFormName}
            style={styles.input}
            placeholderTextColor="#94a3b8"
          />

          <Text style={styles.label}>Service</Text>
          <TouchableOpacity 
            style={styles.dropdownTrigger}
            onPress={() => {
              setShowEditServiceDropdown(!showEditServiceDropdown);
              setShowEditSourceDropdown(false);
              setShowEditStatusDropdown(false);
              setShowEditAssigneeDropdown(false);
            }}>
            <Text style={styles.dropdownTriggerText}>
              {formCategory || 'Select a service...'}
            </Text>
            <ChevronDown size={20} color="#64748b" />
          </TouchableOpacity>
          {showEditServiceDropdown && (
            <View style={styles.dropdownList}>
              {services.map((service) => (
                <TouchableOpacity
                  key={service}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setFormCategory(service);
                    setShowEditServiceDropdown(false);
                  }}>
                  <Text style={styles.dropdownItemText}>{service}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.phoneInputContainer}>
            <TextInput
              value={formPhone}
              onChangeText={setFormPhone}
              keyboardType="phone-pad"
              style={styles.phoneInput}
              placeholderTextColor="#94a3b8"
            />
            <Phone size={16} color="#64748b" style={styles.phoneInputIcon} />
          </View>

          {/* Lead Source and Status side by side */}
          <View style={styles.twoColumnRow}>
            <View style={styles.columnHalf}>
              <Text style={styles.label}>Lead Source</Text>
              <TouchableOpacity 
                style={styles.dropdownTrigger}
                onPress={() => {
                  setShowEditSourceDropdown(!showEditSourceDropdown);
                  setShowEditServiceDropdown(false);
                  setShowEditStatusDropdown(false);
                  setShowEditAssigneeDropdown(false);
                }}>
                <Text style={styles.dropdownTriggerText}>
                  {formSource || 'Select source...'}
                </Text>
                <ChevronDown size={20} color="#64748b" />
              </TouchableOpacity>
              {showEditSourceDropdown && (
                <View style={styles.dropdownList}>
                  {sources.map((source) => (
                    <TouchableOpacity
                      key={source}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setFormSource(source);
                        setShowEditSourceDropdown(false);
                      }}>
                      <Text style={styles.dropdownItemText}>{source}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.columnHalf}>
              <Text style={styles.label}>Lead Status</Text>
              <TouchableOpacity 
                style={styles.dropdownTrigger}
                onPress={() => {
                  setShowEditStatusDropdown(!showEditStatusDropdown);
                  setShowEditServiceDropdown(false);
                  setShowEditSourceDropdown(false);
                  setShowEditAssigneeDropdown(false);
                }}>
                <Text style={styles.dropdownTriggerText}>
                  {formStatus.charAt(0).toUpperCase() + formStatus.slice(1).replace('_', ' ')}
                </Text>
                <ChevronDown size={20} color="#64748b" />
              </TouchableOpacity>
              {showEditStatusDropdown && (
                <View style={styles.dropdownList}>
                  {Object.keys(statusStyles).map((statusKey) => (
                    <TouchableOpacity
                      key={statusKey}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setFormStatus(statusKey as LeadStatus);
                        setShowEditStatusDropdown(false);
                      }}>
                      <Text style={styles.dropdownItemText}>
                        {statusKey.charAt(0).toUpperCase() + statusKey.slice(1).replace('_', ' ')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          <Text style={styles.label}>Assigned To</Text>
          <TouchableOpacity 
            style={styles.dropdownTrigger}
            onPress={() => {
              setShowEditAssigneeDropdown(!showEditAssigneeDropdown);
              setShowEditServiceDropdown(false);
              setShowEditSourceDropdown(false);
              setShowEditStatusDropdown(false);
            }}>
            <Text style={styles.dropdownTriggerText}>
              {formAssignee || 'Select assignee...'}
            </Text>
            <ChevronDown size={20} color="#64748b" />
          </TouchableOpacity>
          {showEditAssigneeDropdown && (
            <View style={styles.dropdownList}>
              {['Sarah Smith', 'Sarah Miller', 'Mike Johnson'].map((assignee) => (
                <TouchableOpacity
                  key={assignee}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setFormAssignee(assignee);
                    setShowEditAssigneeDropdown(false);
                  }}>
                  <Text style={styles.dropdownItemText}>{assignee}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Section 2: Additional Details */}
          <View style={[styles.sectionHeaderRow, { marginTop: 24 }]}>
            <FileText size={18} color="#4338ca" />
            <Text style={styles.sectionHeaderText}>Additional Details</Text>
          </View>

          <Text style={styles.label}>Remarks</Text>
          <TextInput
            value={formNotes}
            onChangeText={setFormNotes}
            multiline
            numberOfLines={4}
            style={[styles.input, styles.multilineInput]}
            placeholderTextColor="#94a3b8"
          />

          <View style={styles.editActionRow}>
            <TouchableOpacity 
              style={styles.cancelBtnOutline} 
              onPress={() => {
                resetLeadForm();
                setCurrentView('lead-details');
              }}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.updateBtnFilled} onPress={handleEditLead}>
              <Text style={styles.updateBtnText}>Update Lead</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (currentView === 'lead-details' && activeLead) {
    // Parse Lead Source
    let leadSource = 'WEBSITE ENQUIRY';
    if (activeLead.notes && activeLead.notes.startsWith('Lead Source: ')) {
      const parts = activeLead.notes.split('\n');
      leadSource = parts[0].replace('Lead Source: ', '').toUpperCase();
    }

    const visual = statusStyles[activeLead.status];

    // Handler to delete lead from details view
    const handleDeleteFromDetails = () => {
      Alert.alert('Delete Lead', 'Are you sure you want to permanently delete this lead?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteLead(activeLead.id);
            setCurrentView('leads-list');
            setActiveLeadId(null);
          },
        },
      ]);
    };

    const handleAddNotePrompt = () => {
      if (Platform.OS === 'web') {
        const noteText = window.prompt("Enter new activity log note:");
        if (noteText && noteText.trim()) {
          addLeadHistory(activeLead.id, 'note', noteText.trim());
        }
      } else {
        Alert.prompt(
          "Add Note",
          "Enter new activity log note:",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Add",
              onPress: (text) => {
                if (text && text.trim()) {
                  addLeadHistory(activeLead.id, 'note', text.trim());
                }
              }
            }
          ],
          "plain-text"
        );
      }
    };

    return (
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity onPress={() => setCurrentView('leads-list')} style={styles.backBtn}>
              <ArrowLeft size={22} color="#1e1b4b" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Leads</Text>
          </View>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={styles.formContainer} showsVerticalScrollIndicator={false}>
          {/* Card 1: Main Info */}
          <View style={[styles.detailCard, styles.mainDetailCard]}>
            <View style={styles.detailCardHeaderRow}>
              <Text style={styles.detailCardIdText}>{activeLead.id}</Text>
              <View style={[styles.statusBadge, { backgroundColor: visual.bg, borderColor: visual.border, flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
                {visual.icon}
                <Text style={[styles.statusBadgeText, { color: visual.text }]}>
                  {activeLead.status.toUpperCase().replace('_', ' ')}
                </Text>
              </View>
            </View>

            <Text style={styles.detailCardNameText}>{activeLead.name}</Text>
            
            <View style={styles.detailCardSubRow}>
              <Text style={styles.detailCardSubText}>🏢 {activeLead.category}</Text>
            </View>

            <View style={styles.detailCardActionRow}>
              <TouchableOpacity 
                style={styles.detailContactBtn}
                onPress={() => handleMakeCall(activeLead.phone, activeLead.id)}>
                <Phone size={14} color="#ffffff" style={{ marginRight: 6 }} />
                <Text style={styles.detailContactBtnText}>Contact</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.detailEditBtnCircle}
                onPress={() => openEditModal(activeLead)}>
                <Pencil size={14} color="#475569" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.detailDeleteBtnCircle}
                onPress={handleDeleteFromDetails}>
                <Trash2 size={14} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Card 2: Contact Information */}
          <View style={styles.detailCard}>
            <View style={styles.cardHeaderWithIcon}>
              <Contact size={16} color="#1e1b4b" />
              <Text style={styles.cardHeaderWithIconText}>Contact Information</Text>
            </View>

            <View style={styles.detailInfoRow}>
              <Text style={styles.detailInfoLabel}>Phone Number</Text>
              <Text style={styles.detailInfoValueBlue}>{activeLead.phone}</Text>
            </View>
            <View style={styles.detailInfoRow}>
              <Text style={styles.detailInfoLabel}>Email Address</Text>
              <Text style={styles.detailInfoValueBlue}>{activeLead.email || 'johndoe@example.com'}</Text>
            </View>
            <View style={styles.detailInfoRow}>
              <Text style={styles.detailInfoLabel}>Location</Text>
              <Text style={styles.detailInfoValue}>New York, NY</Text>
            </View>
          </View>

          {/* Card 3: Lead Origins */}
          <View style={styles.detailCard}>
            <View style={styles.cardHeaderWithIcon}>
              <FileText size={16} color="#1e1b4b" />
              <Text style={styles.cardHeaderWithIconText}>Lead Origins</Text>
            </View>

            <View style={styles.detailInfoRow}>
              <Text style={styles.detailInfoLabel}>Lead Source</Text>
              <View style={styles.sourceOriginBadge}>
                <Text style={styles.sourceOriginBadgeText}>{leadSource}</Text>
              </View>
            </View>
            <View style={styles.detailInfoRow}>
              <Text style={styles.detailInfoLabel}>Date Added</Text>
              <Text style={styles.detailInfoValue}>{activeLead.date}</Text>
            </View>
            <View style={styles.detailInfoRow}>
              <Text style={styles.detailInfoLabel}>Assigned To</Text>
              <View style={styles.assigneeValueRow}>
                <View style={styles.smallAvatar}>
                  <Text style={styles.smallAvatarText}>
                    {activeLead.assignedTo
                      ? activeLead.assignedTo
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                      : 'U'}
                  </Text>
                </View>
                <Text style={styles.detailInfoValue}>{activeLead.assignedTo}</Text>
              </View>
            </View>
          </View>

          {/* Card 4: Recent Activity */}
          <View style={styles.detailCard}>
            <View style={styles.cardHeaderWithAction}>
              <View style={styles.cardHeaderWithIcon}>
                <History size={16} color="#1e1b4b" />
                <Text style={styles.cardHeaderWithIconText}>Recent Activity</Text>
              </View>
            </View>

            <View style={styles.timelineListContainer}>
              {activeLead.history.map((log, index) => {
                const isStatusHot = log.message.includes('HOT');
                const dotColor = log.status && statusStyles[log.status]
                  ? statusStyles[log.status].text
                  : (index === 0 ? '#6366f1' : '#cbd5e1');
                return (
                  <View key={log.id} style={styles.timelineRow}>
                    <View style={styles.timelineIndicatorColumn}>
                      <View style={[styles.timelineDotCircle, { backgroundColor: dotColor }]} />
                      {index < activeLead.history.length - 1 && (
                        <View style={styles.timelineConnectorLine} />
                      )}
                    </View>
                    <View style={[
                      styles.timelineContentBody,
                      log.status && statusStyles[log.status] && {
                        backgroundColor: statusStyles[log.status].bg,
                        borderColor: statusStyles[log.status].border,
                        borderWidth: 1,
                        borderRadius: 8,
                        padding: 12,
                        marginBottom: 12,
                      }
                    ]}>
                      <Text style={styles.timelineTimestampText}>{log.timestamp}</Text>
                      <Text style={[
                        styles.timelineMessageText,
                        log.status && statusStyles[log.status] && {
                          color: statusStyles[log.status].text,
                          fontWeight: '600',
                        }
                      ]}>
                        {isStatusHot ? (
                          <>
                            {log.message.split('HOT')[0]}
                            <Text style={{ color: '#ef4444', fontWeight: 'bold' }}>HOT</Text>
                            {log.message.split('HOT')[1]}
                          </>
                        ) : (
                          log.message
                        )}
                      </Text>
                      {log.remark ? (
                        <Text style={[
                          styles.timelineRemarkText,
                          log.status && statusStyles[log.status] && {
                            backgroundColor: 'rgba(255, 255, 255, 0.7)',
                            borderLeftColor: statusStyles[log.status].text,
                          }
                        ]}>
                          {log.remark}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                );
              })}
            </View>
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
            <Text style={styles.avatarText}>AK</Text>
          </View>
          <Text style={styles.headerTitle}>Leads</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Search and Filters buttons */}
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Search size={18} color="#94a3b8" style={styles.searchBarIcon} />
            <TextInput
              placeholder="Search leads..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
              placeholderTextColor="#94a3b8"
            />
          </View>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedStartDate !== null && styles.filterActiveBtn,
            ]}
            onPress={() => setShowFiltersModal(true)}>
            <SlidersHorizontal size={18} color={selectedStartDate !== null ? '#ffffff' : '#1e1b4b'} />
            <Text
              style={[
                styles.filterButtonText,
                selectedStartDate !== null && styles.filterActiveBtnText,
              ]}>
              Filters
            </Text>
          </TouchableOpacity>
        </View>

        {/* Status Metrics Cards Grid */}
        <View style={styles.metricsContainer}>
          <View style={styles.metricsGrid}>
            {/* Total Leads Card */}
            <TouchableOpacity
              style={[
                styles.metricCard,
                { borderColor: '#c7d2fe', backgroundColor: '#faf5ff' },
                selectedStatusFilter === 'all' && styles.selectedMetricCard,
              ]}
              onPress={() => setSelectedStatusFilter('all')}>
              <View style={styles.metricCardHeader}>
                <Text style={[styles.metricCardTitle, { color: '#4338ca' }]}>Total Leads</Text>
                <Users size={16} color="#818cf8" />
              </View>
              <View>
                <Text style={styles.metricCardCount}>{metrics.total}</Text>
                <Text style={styles.metricCardSubtitle}>All leads in system</Text>
              </View>
            </TouchableOpacity>

            {/* Loop status metrics */}
            {(Object.keys(statusStyles) as LeadStatus[]).map((status) => {
              const info = statusStyles[status];
              const isSelected = selectedStatusFilter === status;
              return (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.metricCard,
                    { borderColor: info.border, backgroundColor: info.bg },
                    isSelected && styles.selectedMetricCard,
                  ]}
                  onPress={() => setSelectedStatusFilter(status)}>
                  <View style={styles.metricCardHeader}>
                    <Text style={[styles.metricCardTitle, { color: info.text }]} numberOfLines={1}>
                      {info.label}
                    </Text>
                    {info.icon}
                  </View>
                  <View>
                    <Text style={styles.metricCardCount}>{metrics[status]}</Text>
                    <Text style={styles.metricCardSubtitle}>
                      {status === 'new' && 'Freshly received'}
                      {status === 'hot' && 'High conversion'}
                      {status === 'warm' && 'Nurturing'}
                      {status === 'cold' && 'Re-engage'}
                      {status === 'appt_fixed' && 'Scheduled'}
                      {status === 'quotation_send' && 'Awaiting response'}
                      {status === 'junk' && 'Unqualified leads'}
                      {status === 'negotiation' && 'In discussion'}
                      {status === 'order_confirmed' && 'Closed'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Leads List Header */}
        <View style={styles.listHeaderRow}>
          <Text style={styles.sectionTitle}>
            {selectedStatusFilter === 'all' ? 'All Leads' : statusStyles[selectedStatusFilter as LeadStatus].label}
          </Text>
          <TouchableOpacity style={styles.sortBtn} onPress={toggleSortOrder}>
            <Text style={styles.sortBtnText}>
              Sort
            </Text>
            <ArrowUpDown size={14} color="#1e1b4b" />
          </TouchableOpacity>
        </View>

        {/* Lead List Cards */}
        {filteredLeads.length === 0 ? (
          <View style={styles.emptyContainer}>
            <AlertTriangle size={48} color="#cbd5e1" />
            <Text style={styles.emptyText}>No leads found matching criteria.</Text>
          </View>
        ) : (
          filteredLeads.map((item) => {
            const visual = statusStyles[item.status];
            return (
              <View key={item.id} style={styles.leadCard}>
                <View style={styles.leadCardHeader}>
                  <View style={styles.leadCardHeaderLeft}>
                    <Text style={styles.leadCardName}>{item.name}</Text>
                    <Text style={styles.leadCardId}>
                      {item.id} • {item.category}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: visual.bg, borderColor: visual.border }]}>
                    <Text style={[styles.statusBadgeText, { color: visual.text }]}>
                      {item.status.toUpperCase().replace('_', ' ')}
                    </Text>
                  </View>
                </View>

                {/* Quick Info Grid */}
                <View style={styles.leadInfoGrid}>
                  <TouchableOpacity
                    style={styles.infoRow}
                    onPress={() => handleMakeCall(item.phone, item.id)}>
                    <Phone size={14} color="#64748b" style={styles.infoIcon} />
                    <Text style={styles.infoText}>{item.phone}</Text>
                  </TouchableOpacity>
                  <View style={styles.infoRow}>
                    <CalendarIcon size={14} color="#64748b" style={styles.infoIcon} />
                    <Text style={styles.infoText}>{item.date}</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                {/* Assigned User */}
                <View style={styles.cardFooter}>
                  <View style={styles.assigneeRow}>
                    <View style={styles.smallAvatar}>
                      <Text style={styles.smallAvatarText}>
                        {item.assignedTo
                          ? item.assignedTo
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()
                          : 'U'}
                      </Text>
                    </View>
                    <Text style={styles.assigneeText}>Assigned to {item.assignedTo}</Text>
                  </View>

                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={styles.editActionBtn}
                      onPress={() => openEditModal(item)}>
                      <Pencil size={14} color="#64748b" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.viewDetailsBtn}
                      onPress={() => {
                        setActiveLeadId(item.id);
                        setCurrentView('lead-details');
                      }}>
                      <Text style={styles.viewDetailsBtnText}>View Details</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })
        )}
        {/* Extra spacing at the bottom to scroll above bottom tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          resetLeadForm();
          setCurrentView('add-lead');
        }}>
        <Plus size={24} color="#ffffff" />
      </TouchableOpacity>

      {/* ================= EDIT LEAD MODAL ================= */}
      <Modal visible={showEditModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Lead Details</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <X size={24} color="#475569" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.formContainer}>
              <Text style={styles.label}>Lead Name *</Text>
              <TextInput value={formName} onChangeText={setFormName} style={styles.input} />

              <Text style={styles.label}>Category *</Text>
              <TextInput value={formCategory} onChangeText={setFormCategory} style={styles.input} />

              <Text style={styles.label}>Phone Number *</Text>
              <TextInput
                value={formPhone}
                onChangeText={setFormPhone}
                keyboardType="phone-pad"
                style={styles.input}
              />

              <Text style={styles.label}>Email Address</Text>
              <TextInput
                value={formEmail}
                onChangeText={setFormEmail}
                keyboardType="email-address"
                style={styles.input}
              />

              <Text style={styles.label}>Status</Text>
              <View style={styles.pickerContainer}>
                {(Object.keys(statusStyles) as LeadStatus[]).map((status) => (
                  <TouchableOpacity
                    key={status}
                    onPress={() => {
                      if (status !== formStatus) {
                        setPendingStatus(status);
                        setStatusRemarkText('');
                        setShowStatusRemarkModal(true);
                      } else {
                        setFormStatus(status);
                      }
                    }}
                    style={[
                      styles.pickerOption,
                      formStatus === status && { backgroundColor: statusStyles[status].bg },
                    ]}>
                    <Text
                      style={[
                        styles.pickerOptionText,
                        { color: formStatus === status ? statusStyles[status].text : '#475569' },
                      ]}>
                      {statusStyles[status].label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Assigned To *</Text>
              <TextInput value={formAssignee} onChangeText={setFormAssignee} style={styles.input} />

              <Text style={styles.label}>Internal Notes</Text>
              <TextInput
                value={formNotes}
                onChangeText={setFormNotes}
                multiline
                numberOfLines={3}
                style={[styles.input, styles.multilineInput]}
              />

              <TouchableOpacity style={styles.submitBtn} onPress={handleEditLead}>
                <Text style={styles.submitBtnText}>Save Changes</Text>
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* ================= LEAD DETAILS & TIMELINE MODAL ================= */}
      <Modal visible={showDetailsModal} animationType="slide" transparent>
        {activeLead && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContentLarge}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Lead Details: {activeLead.id}</Text>
                <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
                  <X size={24} color="#475569" />
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={styles.detailsScrollContent}>
                {/* Visual Status Header */}
                <View
                  style={[
                    styles.detailsStatusBanner,
                    { backgroundColor: statusStyles[activeLead.status].bg },
                  ]}>
                  <Text
                    style={[
                      styles.detailsStatusBannerText,
                      { color: statusStyles[activeLead.status].text },
                    ]}>
                    CURRENT STATUS:{' '}
                    {activeLead.status.toUpperCase().replace('_', ' ')}
                  </Text>
                </View>

                {/* Information block */}
                <View style={styles.detailsInfoBlock}>
                  <Text style={styles.detailsName}>{activeLead.name}</Text>
                  <Text style={styles.detailsCategory}>{activeLead.category}</Text>

                  <View style={styles.detailsGrid}>
                    <TouchableOpacity
                      style={styles.detailsRow}
                      onPress={() => handleMakeCall(activeLead.phone, activeLead.id)}>
                      <Phone size={16} color="#4f46e5" />
                      <Text style={styles.detailsValue}>{activeLead.phone}</Text>
                    </TouchableOpacity>

                    <View style={styles.detailsRow}>
                      <UserCheck size={16} color="#64748b" />
                      <Text style={styles.detailsValue}>Assignee: {activeLead.assignedTo}</Text>
                    </View>

                    {activeLead.email ? (
                      <View style={styles.detailsRow}>
                        <FileText size={16} color="#64748b" />
                        <Text style={styles.detailsValue}>{activeLead.email}</Text>
                      </View>
                    ) : null}

                    <View style={styles.detailsRow}>
                      <CalendarIcon size={16} color="#64748b" />
                      <Text style={styles.detailsValue}>Created: {activeLead.date}</Text>
                    </View>
                  </View>

                  {activeLead.notes ? (
                    <View style={styles.detailsNotesBlock}>
                      <Text style={styles.detailsNotesHeader}>Notes:</Text>
                      <Text style={styles.detailsNotesContent}>{activeLead.notes}</Text>
                    </View>
                  ) : null}
                </View>

                {/* Sub-Action buttons */}
                <View style={styles.detailsActionsGrid}>
                  <TouchableOpacity
                    style={[styles.subActionBtn, { backgroundColor: '#eef2ff' }]}
                    onPress={() => setShowApptModal(true)}>
                    <CalendarIcon size={18} color="#4f46e5" />
                    <Text style={[styles.subActionBtnText, { color: '#4f46e5' }]}>Schedule Visit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.subActionBtn, { backgroundColor: '#fdf2f8' }]}
                    onPress={() => setShowQuoteModal(true)}>
                    <FileText size={18} color="#db2777" />
                    <Text style={[styles.subActionBtnText, { color: '#db2777' }]}>Create Quote</Text>
                  </TouchableOpacity>
                </View>

                {/* Timeline / Activity Logs */}
                <Text style={styles.timelineTitle}>Activity History</Text>
                <View style={styles.timelineContainer}>
                  {activeLead.history.map((log, index) => (
                    <View key={log.id} style={styles.timelineItem}>
                      <View style={styles.timelineLineContainer}>
                        <View style={styles.timelineDot} />
                        {index < activeLead.history.length - 1 && (
                          <View style={styles.timelineLine} />
                        )}
                      </View>
                      <View style={styles.timelineBody}>
                        <Text style={styles.timelineMessage}>{log.message}</Text>
                        <Text style={styles.timelineTime}>{log.timestamp}</Text>
                        {log.remark ? (
                          <Text style={styles.timelineRemarkText}>{log.remark}</Text>
                        ) : null}
                      </View>
                    </View>
                  ))}
                </View>

                {/* Add Custom Log Note */}
                <View style={styles.logNoteBlock}>
                  <Text style={styles.label}>Log Activity Note</Text>
                  <View style={styles.logInputContainer}>
                    <TextInput
                      value={customLogText}
                      onChangeText={setCustomLogText}
                      placeholder="e.g. Followed up on pricing quote via text..."
                      style={styles.logInput}
                    />
                    <TouchableOpacity style={styles.logSubmitBtn} onPress={handleAddCustomLog}>
                      <Text style={styles.logSubmitText}>Log</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={{ height: 20 }} />

                {/* Secondary action: Edit / Delete */}
                <View style={styles.detailsFooterActions}>
                  <TouchableOpacity
                    style={styles.detailsEditBtn}
                    onPress={() => {
                      openEditModal(activeLead);
                    }}>
                    <Text style={styles.detailsEditBtnText}>Edit Details</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.detailsDeleteBtn}
                    onPress={() => handleDeleteLead(activeLead.id)}>
                    <Trash2 size={16} color="#ef4444" />
                    <Text style={styles.detailsDeleteBtnText}>Delete Lead</Text>
                  </TouchableOpacity>
                </View>

                <View style={{ height: 40 }} />
              </ScrollView>
            </View>
          </View>
        )}
      </Modal>

      {/* ================= SCHEDULE VISIT / APPOINTMENT MODAL ================= */}
      <Modal visible={showApptModal} animationType="fade" transparent>
        <View style={styles.modalOverlayCenter}>
          <KeyboardAvoidingView behavior="padding" style={styles.modalContentCenter}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Schedule Appointment</Text>
              <TouchableOpacity onPress={() => setShowApptModal(false)}>
                <X size={24} color="#475569" />
              </TouchableOpacity>
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.label}>Appointment Title *</Text>
              <TextInput
                value={apptTitle}
                onChangeText={setApptTitle}
                placeholder="e.g. Site Visit & Measurement"
                style={styles.input}
              />

              <Text style={styles.label}>Date and Time *</Text>
              <TextInput
                value={apptDate}
                onChangeText={setApptDate}
                placeholder="e.g. Oct 28, 2026, 11:00 AM"
                style={styles.input}
              />

              <Text style={styles.label}>Special Notes</Text>
              <TextInput
                value={apptNotes}
                onChangeText={setApptNotes}
                placeholder="Instructions or requirements..."
                multiline
                numberOfLines={2}
                style={[styles.input, styles.multilineInput]}
              />

              <TouchableOpacity style={styles.submitBtn} onPress={handleAddAppointment}>
                <Text style={styles.submitBtnText}>Schedule Visit</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* ================= CREATE QUOTATION MODAL ================= */}
      <Modal visible={showQuoteModal} animationType="fade" transparent>
        <View style={styles.modalOverlayCenter}>
          <KeyboardAvoidingView behavior="padding" style={styles.modalContentCenter}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Generate New Quote</Text>
              <TouchableOpacity onPress={() => setShowQuoteModal(false)}>
                <X size={24} color="#475569" />
              </TouchableOpacity>
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.label}>Quotation Title *</Text>
              <TextInput
                value={quoteTitle}
                onChangeText={setQuoteTitle}
                placeholder="e.g. Phase 1 Flooring Quote"
                style={styles.input}
              />

              <Text style={styles.label}>Amount ($) *</Text>
              <TextInput
                value={quoteAmount}
                onChangeText={setQuoteAmount}
                placeholder="e.g. 14500"
                keyboardType="numeric"
                style={styles.input}
              />

              <Text style={styles.label}>Scope notes</Text>
              <TextInput
                value={quoteNotes}
                onChangeText={setQuoteNotes}
                placeholder="Details of materials or installation included..."
                multiline
                numberOfLines={2}
                style={[styles.input, styles.multilineInput]}
              />

              <TouchableOpacity style={styles.submitBtn} onPress={handleAddQuotation}>
                <Text style={styles.submitBtnText}>Submit Quotation</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* ================= STATUS CHANGE REMARK MODAL ================= */}
      <Modal visible={showStatusRemarkModal} animationType="fade" transparent>
        <View style={styles.modalOverlayCenter}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContentCenter}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Status Remark</Text>
              <TouchableOpacity onPress={() => setShowStatusRemarkModal(false)}>
                <X size={24} color="#475569" />
              </TouchableOpacity>
            </View>

            <View style={styles.formContainer}>
              <Text style={{ fontSize: 14, color: '#475569', marginBottom: 12, lineHeight: 20 }}>
                Please add a remark/note for changing status to:{' '}
                <Text style={{ fontWeight: '700', color: pendingStatus ? statusStyles[pendingStatus].text : '#110e3d' }}>
                  {pendingStatus ? statusStyles[pendingStatus].label : ''}
                </Text>
              </Text>

              <TextInput
                value={statusRemarkText}
                onChangeText={setStatusRemarkText}
                placeholder="Write remark here..."
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={3}
                style={[styles.input, styles.multilineInput, { height: 80, marginBottom: 16 }]}
              />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
                <TouchableOpacity
                  style={[styles.submitBtn, { flex: 1, backgroundColor: '#f1f0f5', borderWidth: 0 }]}
                  onPress={() => setShowStatusRemarkModal(false)}>
                  <Text style={{ color: '#475569', fontWeight: '600' }}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.submitBtn, { flex: 1.2, backgroundColor: '#4c49ed' }]}
                  onPress={() => {
                    if (pendingStatus) {
                      setFormStatus(pendingStatus);
                    }
                    setShowStatusRemarkModal(false);
                  }}>
                  <Text style={{ color: '#ffffff', fontWeight: '600' }}>Save Remark</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* ================= FILTERS MODAL ================= */}
      <Modal visible={showFiltersModal} animationType="fade" transparent>
        <View style={styles.modalOverlayCenter}>
          <View style={[styles.modalContentCenter, { maxHeight: '90%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Leads</Text>
              <TouchableOpacity onPress={() => setShowFiltersModal(false)}>
                <X size={24} color="#475569" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.formContainer}>
                <Text style={styles.label}>Select Date</Text>
                <View style={styles.inlineCalendarContainer}>
                  <View style={styles.calendarHeader}>
                    <TouchableOpacity
                      onPress={() => setShowMonthYearPicker(!showMonthYearPicker)}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.calendarMonthYear}>
                        {new Date(calendarMonthYear.year, calendarMonthYear.month).toLocaleString('default', {
                          month: 'long',
                          year: 'numeric',
                        })}
                      </Text>
                      <ChevronDown size={18} color="#110e3d" />
                    </TouchableOpacity>
                    <View style={{ flexDirection: 'row', gap: 12 }}>
                      <TouchableOpacity onPress={handlePrevMonth} style={styles.calendarNavBtn}>
                        <ChevronLeft size={16} color="#475569" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={handleNextMonth} style={styles.calendarNavBtn}>
                        <ChevronRight size={16} color="#475569" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {showMonthYearPicker ? (
                    <View style={styles.monthYearPickerContainer}>
                      <View style={styles.pickerColumns}>
                        {/* Months Column */}
                        <ScrollView style={styles.pickerColumn} showsVerticalScrollIndicator={false}>
                          {[
                            'January', 'February', 'March', 'April', 'May', 'June',
                            'July', 'August', 'September', 'October', 'November', 'December'
                          ].map((mName, mIdx) => {
                            const isSelected = calendarMonthYear.month === mIdx;
                            return (
                              <TouchableOpacity
                                key={mName}
                                style={[
                                  styles.pickerItem,
                                  isSelected && styles.pickerItemLightSelected
                                ]}
                                onPress={() => {
                                  setCalendarMonthYear(prev => ({ ...prev, month: mIdx }));
                                }}>
                                <Text style={[
                                  styles.pickerItemText,
                                  isSelected && styles.pickerItemTextSelected
                                ]}>
                                  {mName}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </ScrollView>

                        {/* Years Column */}
                        <ScrollView style={styles.pickerColumn} showsVerticalScrollIndicator={false}>
                          {Array.from({ length: 15 }, (_, i) => new Date().getFullYear() - 7 + i).map((yVal) => {
                            const isSelected = calendarMonthYear.year === yVal;
                            return (
                              <TouchableOpacity
                                key={yVal}
                                style={[
                                  styles.pickerItem,
                                  isSelected && styles.pickerItemLightSelected
                                ]}
                                onPress={() => {
                                  setCalendarMonthYear(prev => ({ ...prev, year: yVal }));
                                }}>
                                <Text style={[
                                  styles.pickerItemText,
                                  isSelected && styles.pickerItemTextSelected
                                ]}>
                                  {yVal}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </ScrollView>
                      </View>

                      <View style={styles.pickerFooter}>
                        <TouchableOpacity
                          style={styles.pickerSelectMonthBtn}
                          onPress={() => {
                            selectEntireMonth(calendarMonthYear.month, calendarMonthYear.year);
                            setShowMonthYearPicker(false);
                          }}>
                          <Text style={styles.pickerSelectMonthBtnText}>Select Entire Month</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                          style={styles.pickerCloseBtn}
                          onPress={() => setShowMonthYearPicker(false)}>
                          <Text style={styles.pickerCloseBtnText}>Show Calendar</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <>
                      <View style={styles.weekdaysRow}>
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((wd, index) => (
                          <Text key={index} style={styles.weekdayText}>
                            {wd}
                          </Text>
                        ))}
                      </View>

                      <View style={styles.daysGrid}>
                        {renderCalendarDays().map((dInfo) => {
                          if (dInfo.day === null) {
                            return <View key={dInfo.key} style={styles.dayCellEmpty} />;
                          }

                          const formattedDate = new Date(
                            calendarMonthYear.year,
                            calendarMonthYear.month,
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
                            dInfo.day === todayDateObj.getDate() &&
                            calendarMonthYear.month === todayDateObj.getMonth() &&
                            calendarMonthYear.year === todayDateObj.getFullYear();

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
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                      {selectedStartDate && (
                        <Text style={styles.selectedDateText}>
                          Selected: {selectedStartDate}{selectedEndDate ? ` to ${selectedEndDate}` : ''}
                        </Text>
                      )}
                    </>
                  )}
                </View>

                <View style={styles.filterActionButtons}>
                  <TouchableOpacity
                    style={styles.filterResetBtn}
                    onPress={() => {
                      setSelectedStatusFilter('all');
                      setSelectedStartDate(null);
                      setSelectedEndDate(null);
                    }}>
                    <Text style={styles.filterResetText}>Reset All</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.filterApplyBtn}
                    onPress={() => setShowFiltersModal(false)}>
                    <Text style={styles.filterApplyText}>Apply Filters</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FCFBFE',
    borderBottomWidth: 1,
    borderBottomColor: '#f1eef6',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1d1947',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e1b4b',
  },
  searchIconBtn: {
    padding: 6,
  },
  scrollContent: {
    padding: 16,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e8e4f0',
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 46,
  },
  searchBarIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: '#1e293b',
    outlineStyle: 'none',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e8e4f0',
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 46,
  },
  filterActiveBtn: {
    backgroundColor: '#e5e1fa',
    borderColor: '#4338ca',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e1b4b',
  },
  filterActiveBtnText: {
    color: '#4338ca',
  },
  metricsContainer: {
    marginBottom: 20,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 8,
    rowGap: 10,
    justifyContent: 'space-between',
  },
  metricCard: {
    width: '48.5%',
    height: 110,
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    justifyContent: 'space-between',
  },
  selectedMetricCard: {
    borderWidth: 1.5,
    shadowColor: '#4338ca',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  metricCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  metricCardTitle: {
    fontSize: 10.5,
    fontWeight: '700',
    flex: 1,
    flexWrap: 'wrap',
    lineHeight: 13,
  },
  metricCardCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e1b4b',
    marginBottom: 2,
  },
  metricCardSubtitle: {
    fontSize: 8.5,
    color: '#64748b',
    lineHeight: 10,
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e1b4b',
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sortBtnText: {
    fontSize: 14,
    color: '#1e1b4b',
    fontWeight: '700',
  },
  leadCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1eef6',
    marginBottom: 16,
    shadowColor: '#1e1b4b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  leadCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  leadCardHeaderLeft: {
    flex: 1,
    paddingRight: 8,
  },
  leadCardName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1e1b4b',
    marginBottom: 2,
  },
  leadCardId: {
    fontSize: 13,
    color: '#64748b',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  leadInfoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    marginRight: 6,
  },
  infoText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1eef6',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assigneeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  smallAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e5e1fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallAvatarText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#4338ca',
  },
  assigneeText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  editActionBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#e8e4f0',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewDetailsBtn: {
    backgroundColor: '#110e3d',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  viewDetailsBtnText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    bottom: 84,
    right: 20,
    backgroundColor: '#110e3d',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#110e3d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 99,
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#64748b',
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalOverlayCenter: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalContentFullScreen: {
    flex: 1,
    backgroundColor: '#FCFBFE',
  },
  closeModalBtn: {
    padding: 6,
    borderWidth: 1,
    borderColor: '#e8e4f0',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  modalContentLarge: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    flex: 1,
  },
  modalContentCenter: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  formContainer: {
    padding: 20,
  },
  detailsScrollContent: {
    paddingBottom: 40,
  },
  detailsStatusBanner: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsStatusBannerText: {
    fontWeight: 'bold',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  detailsInfoBlock: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  detailsName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  detailsCategory: {
    fontSize: 15,
    color: '#64748b',
    marginBottom: 16,
  },
  detailsGrid: {
    gap: 12,
    marginBottom: 16,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailsValue: {
    fontSize: 14,
    color: '#334155',
  },
  detailsNotesBlock: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  detailsNotesHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#475569',
    marginBottom: 4,
  },
  detailsNotesContent: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
  },
  detailsActionsGrid: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  subActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  subActionBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  timelineContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 12,
  },
  timelineLineContainer: {
    alignItems: 'center',
    width: 16,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4f46e5',
    marginTop: 6,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#e2e8f0',
  },
  timelineBody: {
    flex: 1,
    paddingBottom: 16,
  },
  timelineMessage: {
    fontSize: 14,
    color: '#334155',
  },
  timelineTime: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  logNoteBlock: {
    padding: 20,
    backgroundColor: '#f8fafc',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
  },
  logInputContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  logInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    height: 44,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  logSubmitBtn: {
    backgroundColor: '#4f46e5',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  logSubmitText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  detailsFooterActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 16,
  },
  detailsEditBtn: {
    flex: 1,
    backgroundColor: '#e2e8f0',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  detailsEditBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  detailsDeleteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderColor: '#ef4444',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
  },
  detailsDeleteBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
    backgroundColor: '#ffffff',
    color: '#0f172a',
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
    paddingVertical: 10,
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 6,
  },
  pickerOption: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pickerOptionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  submitBtn: {
    backgroundColor: '#1e1b4b',
    borderRadius: 8,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 20,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  filterChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterChipActive: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
  },
  filterChipText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  filterChipActiveText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  filterActionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 20,
  },
  filterResetBtn: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterResetText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '600',
  },
  filterApplyBtn: {
    flex: 2,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#1e1b4b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterApplyText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  backBtn: {
    padding: 6,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
  },
  dropdownTriggerText: {
    fontSize: 15,
    color: '#0f172a',
  },
  dropdownPlaceholder: {
    color: '#94a3b8',
  },
  dropdownList: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    zIndex: 1000,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#0f172a',
  },
  submitBtnLarge: {
    flexDirection: 'row',
    backgroundColor: '#110e3d',
    borderRadius: 8,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    marginTop: 8,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e1b4b',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    paddingRight: 12,
  },
  phoneInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#0f172a',
    outlineStyle: 'none',
  },
  phoneInputIcon: {
    marginLeft: 8,
  },
  twoColumnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  columnHalf: {
    flex: 1,
  },
  editActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 32,
    marginBottom: 16,
  },
  cancelBtnOutline: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: '#4338ca',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  cancelBtnText: {
    color: '#4338ca',
    fontWeight: 'bold',
    fontSize: 15,
  },
  updateBtnFilled: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#110e3d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  detailCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1eef6',
    marginBottom: 16,
    shadowColor: '#1e1b4b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  mainDetailCard: {
    borderTopWidth: 4,
    borderTopColor: '#6366f1',
  },
  detailCardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailCardIdText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  detailCardNameText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1e1b4b',
    marginBottom: 6,
  },
  detailCardSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailCardSubText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  detailCardActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailContactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#110e3d',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  detailContactBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  detailEditBtnCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e8e4f0',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailDeleteBtnCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardHeaderWithIconText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e1b4b',
  },
  detailInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1eef6',
  },
  detailInfoRowNoBorder: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  detailInfoLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  detailInfoValue: {
    fontSize: 14,
    color: '#1e1b4b',
    fontWeight: '600',
  },
  detailInfoValueBlue: {
    fontSize: 14,
    color: '#4338ca',
    fontWeight: '600',
  },
  sourceOriginBadge: {
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#e8e4f0',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  sourceOriginBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: 0.5,
  },
  assigneeValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardHeaderWithAction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addNoteLinkText: {
    color: '#4338ca',
    fontSize: 13,
    fontWeight: '700',
  },
  addNoteButton: {
    borderWidth: 1,
    borderColor: '#f59e0b',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#ffffff',
  },
  addNoteButtonText: {
    color: '#4338ca',
    fontSize: 12,
    fontWeight: '700',
  },
  timelineListContainer: {
    marginTop: 8,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timelineIndicatorColumn: {
    alignItems: 'center',
    width: 16,
  },
  timelineDotCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  timelineDotActive: {
    backgroundColor: '#6366f1',
  },
  timelineDotInactive: {
    backgroundColor: '#cbd5e1',
  },
  timelineConnectorLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#f1eef6',
    marginVertical: 4,
  },
  timelineContentBody: {
    flex: 1,
    paddingBottom: 16,
  },
  timelineTimestampText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '500',
    marginBottom: 2,
  },
  timelineMessageText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 20,
    fontWeight: '500',
  },
  timelineRemarkText: {
    fontSize: 13,
    color: '#475569',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#4338ca',
    lineHeight: 18,
  },
  inlineCalendarContainer: {
    borderWidth: 1,
    borderColor: '#e5e1fa',
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#ffffff',
    marginTop: 12,
    marginBottom: 16,
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
  selectedDateText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4338ca',
    marginTop: 8,
    textAlign: 'center',
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
  monthYearPickerContainer: {
    height: 230,
    backgroundColor: '#ffffff',
    justifyContent: 'space-between',
  },
  pickerColumns: {
    flexDirection: 'row',
    flex: 1,
    gap: 12,
    marginBottom: 12,
  },
  pickerColumn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#f1eef6',
    borderRadius: 8,
    paddingHorizontal: 4,
  },
  pickerItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginVertical: 2,
    alignItems: 'center',
  },
  pickerItemLightSelected: {
    backgroundColor: '#e5e1fa',
  },
  pickerItemText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  pickerItemTextSelected: {
    color: '#4338ca',
    fontWeight: '700',
  },
  pickerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1eef6',
    paddingTop: 10,
  },
  pickerSelectMonthBtn: {
    flex: 1.2,
    backgroundColor: '#110e3d',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerSelectMonthBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  pickerCloseBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e8e4f0',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerCloseBtnText: {
    color: '#110e3d',
    fontSize: 13,
    fontWeight: '600',
  },
});
