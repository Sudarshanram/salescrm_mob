import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { ArrowLeft, Sparkles, Flame, Thermometer, Snowflake, Calendar as CalendarIcon, FileText, Trash2, Pencil, CheckCircle2 } from 'lucide-react-native';
import { router } from 'expo-router';
import { useLeads, LeadStatus } from '@/context/leads-context';

export default function AddLeadScreen() {
  const { addLead } = useLeads();

  // Form States
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formStatus, setFormStatus] = useState<LeadStatus>('new');
  const [formAssignee, setFormAssignee] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Status visual mapping
  const statusStyles: Record<
    LeadStatus,
    { label: string; bg: string; text: string; border: string }
  > = {
    new: { label: 'New Leads', bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
    hot: { label: 'Hot Leads', bg: '#fff5f5', text: '#b91c1c', border: '#fee2e2' },
    warm: { label: 'Warm Leads', bg: '#fff7ed', text: '#c2410c', border: '#ffedd5' },
    cold: { label: 'Cold Leads', bg: '#f8fafc', text: '#334155', border: '#cbd5e1' },
    appt_fixed: { label: 'Appt. Fixed', bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
    quotation_send: { label: 'Quotation Send', bg: '#fdf2f8', text: '#be185d', border: '#fbcfe8' },
    junk: { label: 'Junk', bg: '#fafafa', text: '#374151', border: '#e5e7eb' },
    negotiation: { label: 'Negotiation', bg: '#fefce8', text: '#854d0e', border: '#fef08a' },
    order_confirmed: { label: 'Order Confirmed', bg: '#ecfeff', text: '#0e7490', border: '#cffafe' },
  };

  const handleCreateLead = async () => {
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

    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color="#1e1b4b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Lead</Text>
        <View style={{ width: 36 }} /> {/* spacer */}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.formContainer} showsVerticalScrollIndicator={false}>
          
          <Text style={styles.label}>Lead Name *</Text>
          <TextInput
            value={formName}
            onChangeText={setFormName}
            placeholder="e.g. John Doe"
            style={styles.input}
            placeholderTextColor="#94a3b8"
          />

          <Text style={styles.label}>Category / Project *</Text>
          <TextInput
            value={formCategory}
            onChangeText={setFormCategory}
            placeholder="e.g. Commercial Interior"
            style={styles.input}
            placeholderTextColor="#94a3b8"
          />

          <Text style={styles.label}>Phone Number *</Text>
          <TextInput
            value={formPhone}
            onChangeText={setFormPhone}
            placeholder="e.g. +1 234 567 8900"
            keyboardType="phone-pad"
            style={styles.input}
            placeholderTextColor="#94a3b8"
          />

          <Text style={styles.label}>Email Address</Text>
          <TextInput
            value={formEmail}
            onChangeText={setFormEmail}
            placeholder="e.g. john@example.com"
            keyboardType="email-address"
            style={styles.input}
            placeholderTextColor="#94a3b8"
          />

          <Text style={styles.label}>Initial Status</Text>
          <View style={styles.pickerContainer}>
            {(Object.keys(statusStyles) as LeadStatus[]).map((status) => {
              const style = statusStyles[status];
              const isSelected = formStatus === status;
              return (
                <TouchableOpacity
                  key={status}
                  onPress={() => setFormStatus(status)}
                  style={[
                    styles.pickerOption,
                    {
                      backgroundColor: isSelected ? style.bg : '#ffffff',
                      borderColor: isSelected ? style.border : '#e2e8f0',
                    },
                  ]}>
                  <Text
                    style={[
                      styles.pickerOptionText,
                      { color: isSelected ? style.text : '#475569' },
                    ]}>
                    {style.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>Assigned To *</Text>
          <TextInput
            value={formAssignee}
            onChangeText={setFormAssignee}
            placeholder="e.g. Sarah Smith"
            style={styles.input}
            placeholderTextColor="#94a3b8"
          />

          <Text style={styles.label}>Internal Notes</Text>
          <TextInput
            value={formNotes}
            onChangeText={setFormNotes}
            placeholder="Brief background or requirements..."
            multiline
            numberOfLines={4}
            style={[styles.input, styles.multilineInput]}
            placeholderTextColor="#94a3b8"
          />

          <TouchableOpacity style={styles.submitBtn} onPress={handleCreateLead}>
            <Text style={styles.submitBtnText}>Create Lead</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 16,
    paddingVertical: 15,
    backgroundColor: '#FCFBFE',
    borderBottomWidth: 1,
    borderBottomColor: '#f1eef6',
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e1b4b',
  },
  formContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#344054',
    marginBottom: 6,
    marginTop: 16,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#d0d5dd',
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#1d2939',
    outlineStyle: 'none',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingVertical: 12,
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 6,
  },
  pickerOption: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  pickerOptionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  submitBtn: {
    backgroundColor: '#110e3d',
    borderRadius: 8,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
