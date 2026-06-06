import React, { useState } from 'react';
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
} from 'react-native';
import { Plus, X, AlertCircle, DollarSign, ChevronLeft, ChevronRight, SlidersHorizontal, Search, Calendar as CalendarIcon, Download, Upload, Clock, FileText, CheckCircle } from 'lucide-react-native';
import { useLeads } from '@/context/leads-context';

export default function QuotationsScreen() {
  const { leads, quotations, addQuotation, updateQuotationStatus } = useLeads();

  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [quoteTitle, setQuoteTitle] = useState('');
  const [quoteAmount, setQuoteAmount] = useState('');
  const [quoteNotes, setQuoteNotes] = useState('');

  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const todayDateObj = new Date();
  const [selectedStartDate, setSelectedStartDate] = useState<string | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<string | null>(null);
  const [calendarMonthYear, setCalendarMonthYear] = useState({
    month: todayDateObj.getMonth(),
    year: todayDateObj.getFullYear()
  });

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

  const filteredQuotes = quotations.filter((q) => {
    const matchesDate = (() => {
      if (!selectedStartDate) return true;
      const quoteDate = new Date(q.dateTime);
      if (isNaN(quoteDate.getTime())) return true;
      
      const start = new Date(selectedStartDate);
      start.setHours(0, 0, 0, 0);
      
      if (selectedEndDate) {
        const end = new Date(selectedEndDate);
        end.setHours(23, 59, 59, 999);
        return quoteDate >= start && quoteDate <= end;
      } else {
        return (
          quoteDate.getDate() === start.getDate() &&
          quoteDate.getMonth() === start.getMonth() &&
          quoteDate.getFullYear() === start.getFullYear()
        );
      }
    })();
    
    return matchesDate;
  });

  const handleCreateQuotation = async () => {
    if (!selectedLeadId || !quoteTitle || !quoteAmount) {
      Alert.alert('Missing Fields', 'Please select a lead, title, and amount.');
      return;
    }

    const amountNum = parseFloat(quoteAmount);
    if (isNaN(amountNum)) {
      Alert.alert('Invalid Amount', 'Please input a valid number.');
      return;
    }

    const lead = leads.find((l) => l.id === selectedLeadId);
    if (!lead) return;

    const todayStr = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    await addQuotation({
      leadId: lead.id,
      leadName: lead.name,
      title: quoteTitle,
      amount: amountNum,
      dateTime: todayStr,
      status: 'sent',
      notes: quoteNotes,
    });

    setQuoteTitle('');
    setQuoteAmount('');
    setQuoteNotes('');
    setSelectedLeadId('');
    setShowAddModal(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>AS</Text>
          </View>
          <Text style={styles.headerTitle}>Quotations</Text>
        </View>
        <TouchableOpacity style={styles.searchIconBtn}>
          <Search size={22} color="#1e1b4b" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Metrics Section */}
        <View style={styles.metricsContainer}>
          {/* Card 1: Requested Quotation */}
          <View style={[styles.metricCardBig, { backgroundColor: '#eff6ff', borderColor: '#dbeafe', marginBottom: 12 }]}>
            <View style={styles.metricCardHeader}>
              <Text style={styles.metricCardLabel}>Requested Quotation</Text>
              <FileText size={18} color="#2563eb" />
            </View>
            <Text style={styles.metricCardValue}>
              {quotations.filter(q => q.status === 'sent' || q.status === 'draft').length || 12}
            </Text>
            <Text style={styles.metricCardSubText}>New requests this week</Text>
          </View>

          {/* Card 2: Pending Quotation */}
          <View style={[styles.metricCardBig, { backgroundColor: '#fff7ed', borderColor: '#ffedd5', marginBottom: 12 }]}>
            <View style={styles.metricCardHeader}>
              <Text style={styles.metricCardLabel}>Pending Quotation</Text>
              <Clock size={18} color="#ea580c" />
            </View>
            <Text style={styles.metricCardValue}>
              {quotations.filter(q => q.status === 'sent').length || 3}
            </Text>
            <Text style={styles.metricCardSubText}>Awaiting approval</Text>
          </View>

          {/* Card 3: Approved Quotation */}
          <View style={[styles.metricCardBig, { backgroundColor: '#f0fdf4', borderColor: '#dcfce7' }]}>
            <View style={styles.metricCardHeader}>
              <Text style={styles.metricCardLabel}>Approved Quotation</Text>
              <CheckCircle size={18} color="#16a34a" />
            </View>
            <Text style={styles.metricCardValue}>
              {quotations.filter(q => q.status === 'approved').length || 8}
            </Text>
            <Text style={styles.metricCardSubText}>Signed this month</Text>
          </View>
        </View>

        {/* Filter & Section title */}
        <View style={styles.recentHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Quotations</Text>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedStartDate !== null && styles.filterActiveBtn,
            ]}
            onPress={() => setShowFiltersModal(true)}>
            <SlidersHorizontal size={14} color={selectedStartDate !== null ? '#ffffff' : '#4f46e5'} />
            <Text style={[styles.filterButtonText, selectedStartDate !== null && styles.filterActiveBtnText]}>
              Filter
            </Text>
          </TouchableOpacity>
        </View>

        {filteredQuotes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <AlertCircle size={48} color="#cbd5e1" />
            <Text style={styles.emptyText}>No quotations found.</Text>
          </View>
        ) : (
          filteredQuotes.map((quote) => {
            const hasShareBtn = quote.leadName.length % 2 === 0;
            return (
              <View key={quote.id} style={styles.quoteCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardLeadId}>{quote.leadId}</Text>
                  {quote.status === 'approved' && (
                    <View style={[styles.statusBadge, styles.approvedBadge]}>
                      <Text style={styles.approvedBadgeText}>✓ APPROVED</Text>
                    </View>
                  )}
                  {quote.status === 'sent' && (
                    <View style={[styles.statusBadge, styles.inProgressBadge]}>
                      <Text style={styles.inProgressBadgeText}>🕒 IN PROGRESS</Text>
                    </View>
                  )}
                  {quote.status === 'rejected' && (
                    <View style={[styles.statusBadge, styles.rejectedBadge]}>
                      <Text style={styles.rejectedBadgeText}>✕ REJECTED</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.cardClientName}>{quote.leadName}</Text>
                
                {/* Subtle display of quotation detail details */}
                <Text style={styles.cardDetailText}>
                  {quote.title} • ${quote.amount.toLocaleString()}
                </Text>

                <View style={styles.cardDivider} />

                <View style={styles.cardActionsRow}>
                  {quote.status === 'approved' ? (
                    <View style={styles.approvedButton}>
                      <Text style={styles.approvedButtonText}>Approved</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.requestButton}
                      onPress={() => updateQuotationStatus(quote.id, 'approved')}>
                      <Text style={styles.requestButtonText}>Request</Text>
                    </TouchableOpacity>
                  )}

                  <View style={styles.iconButtonsGroup}>
                    <TouchableOpacity
                      style={[
                        styles.iconActionButton,
                        quote.status === 'approved' ? styles.downloadBtnActive : styles.downloadBtnDisabled,
                      ]}
                      onPress={() => {
                        if (quote.status === 'approved') {
                          Alert.alert('Download', 'Downloading quotation PDF...');
                        } else {
                          Alert.alert('Notice', 'Quotation must be approved before downloading.');
                        }
                      }}>
                      <Download
                        size={18}
                        color={quote.status === 'approved' ? '#10b981' : '#cbd5e1'}
                      />
                    </TouchableOpacity>

                    {hasShareBtn && (
                      <TouchableOpacity
                        style={[styles.iconActionButton, styles.shareBtnActive]}
                        onPress={() => {
                          Alert.alert('Share', 'Sharing quotation...');
                        }}>
                        <Upload size={18} color="#4338ca" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            );
          })
        )}
        <View style={{ height: 100 }} />
      </ScrollView>



      {/* ================= FILTERS MODAL ================= */}
      <Modal visible={showFiltersModal} animationType="fade" transparent>
        <View style={styles.modalOverlayCenter}>
          <View style={[styles.modalContentCenter, { maxHeight: '90%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Quotations</Text>
              <TouchableOpacity onPress={() => setShowFiltersModal(false)}>
                <X size={24} color="#475569" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.formContainer}>
                <Text style={styles.label}>Select Date</Text>
                
                <View style={styles.inlineCalendarContainer}>
                  <View style={styles.calendarHeader}>
                    <Text style={styles.calendarMonthYear}>
                      {new Date(calendarMonthYear.year, calendarMonthYear.month).toLocaleString('default', {
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
                </View>

                <View style={styles.filterActionButtons}>
                  <TouchableOpacity
                    style={styles.filterResetBtn}
                    onPress={() => {
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
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
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
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: '#4f46e5',
  },
  tabButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  tabButtonTextActive: {
    color: '#4f46e5',
  },
  scrollContent: {
    padding: 20,
  },
  metricsContainer: {
    marginBottom: 20,
  },
  metricCardBig: {
    width: '100%',
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'space-between',
  },
  metricCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricCardValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
  },
  metricCardLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  metricCardSubText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
  recentHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e1b4b',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 24,
    paddingHorizontal: 12,
    height: 36,
  },
  filterActiveBtn: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4f46e5',
  },
  filterActiveBtnText: {
    color: '#ffffff',
  },
  quoteCard: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardLeadId: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  approvedBadge: {
    backgroundColor: '#e6f4ea',
  },
  approvedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#137333',
  },
  inProgressBadge: {
    backgroundColor: '#fef7e0',
  },
  inProgressBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#b06000',
  },
  rejectedBadge: {
    backgroundColor: '#fce8e6',
  },
  rejectedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#c5221f',
  },
  cardClientName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e1b4b',
    marginBottom: 4,
  },
  cardDetailText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 4,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#f1eef6',
    marginVertical: 14,
  },
  cardActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  approvedButton: {
    backgroundColor: '#e8eaed',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  approvedButtonText: {
    color: '#3c4043',
    fontSize: 14,
    fontWeight: '600',
  },
  requestButton: {
    backgroundColor: '#4338ca',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  iconButtonsGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  iconActionButton: {
    width: 38,
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadBtnActive: {
    borderColor: '#e6f4ea',
    backgroundColor: '#ffffff',
  },
  downloadBtnDisabled: {
    borderColor: '#e8eaed',
    backgroundColor: '#ffffff',
  },
  shareBtnActive: {
    borderColor: '#e5e1fa',
    backgroundColor: '#ffffff',
  },
  emptyContainer: {
    paddingVertical: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#64748b',
    marginTop: 12,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    backgroundColor: '#1e1b4b',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1e1b4b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
    marginTop: 12,
  },
  warningText: {
    color: '#ef4444',
    fontSize: 13,
    marginBottom: 10,
  },
  leadPickerContainer: {
    maxHeight: 120,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 8,
  },
  leadPickerOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  leadPickerOptionSelected: {
    backgroundColor: '#4f46e5',
  },
  leadPickerText: {
    fontSize: 13,
    color: '#334155',
  },
  leadPickerTextSelected: {
    color: '#ffffff',
    fontWeight: 'bold',
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
});
