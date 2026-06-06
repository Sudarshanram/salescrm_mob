import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type LeadStatus =
  | 'new'
  | 'hot'
  | 'warm'
  | 'cold'
  | 'appt_fixed'
  | 'quotation_send'
  | 'junk'
  | 'negotiation'
  | 'order_confirmed';

export interface HistoryItem {
  id: string;
  type: 'status_change' | 'note' | 'appointment' | 'quotation' | 'call';
  message: string;
  timestamp: string;
  remark?: string;
  status?: LeadStatus;
}

export interface Lead {
  id: string;
  name: string;
  category: string;
  phone: string;
  email: string;
  date: string;
  status: LeadStatus;
  assignedTo: string;
  notes?: string;
  history: HistoryItem[];
}

export interface Appointment {
  id: string;
  leadId: string;
  leadName: string;
  title: string;
  dateTime: string;
  status: 'pending' | 'completed' | 'cancelled';
  notes?: string;
}

export interface Quotation {
  id: string;
  leadId: string;
  leadName: string;
  title: string;
  amount: number;
  dateTime: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected';
  notes?: string;
}

interface LeadsContextType {
  leads: Lead[];
  appointments: Appointment[];
  quotations: Quotation[];
  loading: boolean;
  addLead: (lead: Omit<Lead, 'id' | 'history'>) => Promise<void>;
  updateLead: (leadId: string, updates: Partial<Omit<Lead, 'id' | 'history'>> & { remark?: string }) => Promise<void>;
  deleteLead: (leadId: string) => Promise<void>;
  addLeadHistory: (leadId: string, type: HistoryItem['type'], message: string, remark?: string) => Promise<void>;
  addAppointment: (appt: Omit<Appointment, 'id' | 'status'>) => Promise<void>;
  updateAppointmentStatus: (apptId: string, status: Appointment['status']) => Promise<void>;
  addQuotation: (quote: Omit<Quotation, 'id'>) => Promise<void>;
  updateQuotationStatus: (quoteId: string, status: Quotation['status']) => Promise<void>;
}

const LeadsContext = createContext<LeadsContextType | undefined>(undefined);

const STORAGE_KEY = '@leads_management_data';

const getPastDateStr = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const getPastDateTimeStr = (daysAgo: number, timeStr: string) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const dateStr = d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  return `${dateStr}, ${timeStr}`;
};

const getPastDateTimeStrUpper = (daysAgo: number, timeRange: string) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${timeRange}`;
};

const initialLeads: Lead[] = [
  {
    id: 'LD-1029',
    name: 'Priya Sharma',
    category: 'Commercial Interior',
    phone: '+91 98765 43210',
    email: 'priya.sharma@example.com',
    date: getPastDateStr(2),
    status: 'hot',
    assignedTo: 'Sarah Smith',
    notes: 'Lead Source: Website\nInterested in Main Office, DLF Cyber City.',
    history: [
      {
        id: 'h1',
        type: 'status_change',
        message: 'Lead created & assigned to Sarah Smith',
        status: 'hot',
        timestamp: getPastDateTimeStr(2, '10:00 AM'),
      },
    ],
  },
  {
    id: 'LD-1030',
    name: 'Rahul Mehta',
    category: 'Office Renovation',
    phone: '+91 98223 34455',
    email: 'rahul.mehta@example.com',
    date: getPastDateStr(1),
    status: 'appt_fixed',
    assignedTo: 'Mike Johnson',
    notes: 'Lead Source: Referral\nSkyline Residency, Site B.',
    history: [
      {
        id: 'h2',
        type: 'status_change',
        message: 'Lead created & assigned to Mike Johnson',
        status: 'appt_fixed',
        timestamp: getPastDateTimeStr(1, '02:00 PM'),
      },
    ],
  },
];

const initialAppointments: Appointment[] = [
  {
    id: 'APT-101',
    leadId: 'LD-1029',
    leadName: 'Priya Sharma',
    title: 'Initial Consultation',
    dateTime: getPastDateTimeStrUpper(2, '04:00 PM - 05:00 PM'),
    status: 'pending',
    notes: 'Main Office, DLF Cyber City',
  },
  {
    id: 'APT-102',
    leadId: 'LD-1030',
    leadName: 'Rahul Mehta',
    title: 'Site Inspection Visit',
    dateTime: getPastDateTimeStrUpper(1, '11:30 AM - 12:30 PM'),
    status: 'completed',
    notes: 'Skyline Residency, Site B',
  },
];

const initialQuotations: Quotation[] = [
  {
    id: 'QT-501',
    leadId: 'LD-1029',
    leadName: 'Priya Sharma',
    title: 'Premium Interior Fitout Quote',
    amount: 14500,
    dateTime: getPastDateStr(1),
    status: 'sent',
    notes: 'Sent PDF invoice to email address.',
  },
];

export const LeadsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);

  // Load from AsyncStorage
  useEffect(() => {
    async function loadData() {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const { leadsData, appointmentsData, quotationsData } = JSON.parse(stored);
          
          // Migrate any mock dates loaded from storage to today's real past dates
          const activeLeads = (leadsData || initialLeads).map((lead: Lead) => {
            if (lead.id === 'LD-1029') {
              return {
                ...lead,
                date: getPastDateStr(2),
                history: lead.history.map(h => {
                  if (h.id === 'h1' || h.timestamp.includes('May 20, 2026') || h.timestamp.includes('Oct 24, 2026')) {
                    return { ...h, timestamp: getPastDateTimeStr(2, '10:00 AM') };
                  }
                  return h;
                })
              };
            }
            if (lead.id === 'LD-1030') {
              return {
                ...lead,
                date: getPastDateStr(1),
                history: lead.history.map(h => {
                  if (h.id === 'h2' || h.timestamp.includes('May 21, 2026') || h.timestamp.includes('Oct 25, 2026')) {
                    return { ...h, timestamp: getPastDateTimeStr(1, '02:00 PM') };
                  }
                  return h;
                })
              };
            }
            return lead;
          });

          const activeAppts = (appointmentsData || initialAppointments).map((appt: Appointment) => {
            if (appt.id === 'APT-101') {
              return { ...appt, dateTime: getPastDateTimeStrUpper(2, '04:00 PM - 05:00 PM') };
            }
            if (appt.id === 'APT-102') {
              return { ...appt, dateTime: getPastDateTimeStrUpper(1, '11:30 AM - 12:30 PM') };
            }
            return appt;
          });

          const activeQuotes = (quotationsData || initialQuotations).map((q: Quotation) => {
            if (q.id === 'QT-501') {
              return { ...q, dateTime: getPastDateStr(1) };
            }
            return q;
          });

          setLeads(activeLeads);
          setAppointments(activeAppts);
          setQuotations(activeQuotes);
        } else {
          setLeads(initialLeads);
          setAppointments(initialAppointments);
          setQuotations(initialQuotations);
        }
      } catch (e) {
        console.error('Error loading leads data', e);
        setLeads(initialLeads);
        setAppointments(initialAppointments);
        setQuotations(initialQuotations);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Save to AsyncStorage whenever state changes
  const saveToStorage = async (
    newLeads: Lead[],
    newAppts: Appointment[],
    newQuotes: Quotation[]
  ) => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          leadsData: newLeads,
          appointmentsData: newAppts,
          quotationsData: newQuotes,
        })
      );
    } catch (e) {
      console.error('Error saving leads data', e);
    }
  };

  const addLead = async (leadData: Omit<Lead, 'id' | 'history'>) => {
    const nextNum = leads.length > 0 
      ? Math.max(...leads.map(l => parseInt(l.id.split('-')[1]) || 1000)) + 1 
      : 1029;
    const newId = `LD-${nextNum}`;
    const timestamp = new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    
    const newLead: Lead = {
      ...leadData,
      id: newId,
      history: [
        {
          id: Math.random().toString(),
          type: 'status_change',
          message: `Lead created & assigned to ${leadData.assignedTo}`,
          status: leadData.status,
          timestamp,
        },
      ],
    };

    const updatedLeads = [newLead, ...leads];
    setLeads(updatedLeads);
    await saveToStorage(updatedLeads, appointments, quotations);
  };

  const updateLead = async (leadId: string, updates: Partial<Omit<Lead, 'id' | 'history'>> & { remark?: string }) => {
    const timestamp = new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    const updatedLeads = leads.map((lead) => {
      if (lead.id === leadId) {
        const history: HistoryItem[] = [...lead.history];
        if (updates.status && updates.status !== lead.status) {
          history.push({
            id: Math.random().toString(),
            type: 'status_change',
            message: `Status updated from ${lead.status.replace('_', ' ').toUpperCase()} to ${updates.status.replace('_', ' ').toUpperCase()}`,
            status: updates.status,
            timestamp,
            remark: updates.remark,
          });
        }
        if (updates.assignedTo && updates.assignedTo !== lead.assignedTo) {
          history.push({
            id: Math.random().toString(),
            type: 'status_change',
            message: `Assigned person updated to ${updates.assignedTo}`,
            timestamp,
          });
        }
        if (updates.name && updates.name !== lead.name) {
          history.push({
            id: Math.random().toString(),
            type: 'note',
            message: `Customer name updated from "${lead.name}" to "${updates.name}"`,
            timestamp,
          });
        }
        if (updates.category && updates.category !== lead.category) {
          history.push({
            id: Math.random().toString(),
            type: 'note',
            message: `Service category updated from "${lead.category}" to "${updates.category}"`,
            timestamp,
          });
        }
        if (updates.phone && updates.phone !== lead.phone) {
          history.push({
            id: Math.random().toString(),
            type: 'note',
            message: `Phone number updated from "${lead.phone}" to "${updates.phone}"`,
            timestamp,
          });
        }
        if (updates.email !== undefined && updates.email !== lead.email) {
          history.push({
            id: Math.random().toString(),
            type: 'note',
            message: `Email updated from "${lead.email || 'None'}" to "${updates.email || 'None'}"`,
            timestamp,
          });
        }
        if (updates.notes && updates.notes !== lead.notes) {
          const getSourceAndDesc = (text: string) => {
            if (text.startsWith('Lead Source: ')) {
              const parts = text.split('\n');
              return { source: parts[0].replace('Lead Source: ', ''), desc: parts.slice(1).join('\n') };
            }
            return { source: '', desc: text };
          };

          const oldNotes = getSourceAndDesc(lead.notes || '');
          const newNotes = getSourceAndDesc(updates.notes || '');

          if (oldNotes.source !== newNotes.source && newNotes.source) {
            history.push({
              id: Math.random().toString(),
              type: 'note',
              message: `Lead source updated from "${oldNotes.source}" to "${newNotes.source}"`,
              timestamp,
            });
          }
          if (oldNotes.desc !== newNotes.desc) {
            history.push({
              id: Math.random().toString(),
              type: 'note',
              message: `Lead notes updated`,
              remark: newNotes.desc,
              timestamp,
            });
          }
        }
        return {
          ...lead,
          ...updates,
          history,
        };
      }
      return lead;
    });

    setLeads(updatedLeads);
    await saveToStorage(updatedLeads, appointments, quotations);
  };

  const deleteLead = async (leadId: string) => {
    const updatedLeads = leads.filter((l) => l.id !== leadId);
    const updatedAppts = appointments.filter((a) => a.leadId !== leadId);
    const updatedQuotes = quotations.filter((q) => q.leadId !== leadId);
    setLeads(updatedLeads);
    setAppointments(updatedAppts);
    setQuotations(updatedQuotes);
    await saveToStorage(updatedLeads, updatedAppts, updatedQuotes);
  };

  const addLeadHistory = async (leadId: string, type: HistoryItem['type'], message: string, remark?: string) => {
    const timestamp = new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    
    const updatedLeads = leads.map((l) => {
      if (l.id === leadId) {
        return {
          ...l,
          history: [...l.history, { id: Math.random().toString(), type, message, timestamp, remark }],
        };
      }
      return l;
    });

    setLeads(updatedLeads);
    await saveToStorage(updatedLeads, appointments, quotations);
  };

  const addAppointment = async (apptData: Omit<Appointment, 'id' | 'status'>) => {
    const nextNum = appointments.length > 0 
      ? Math.max(...appointments.map(a => parseInt(a.id.split('-')[1]) || 100)) + 1 
      : 101;
    
    const newAppt: Appointment = {
      ...apptData,
      id: `APT-${nextNum}`,
      status: 'pending',
    };

    const updatedAppts = [newAppt, ...appointments];
    setAppointments(updatedAppts);
    
    // Add history item to lead
    await addLeadHistory(
      apptData.leadId,
      'appointment',
      `Appointment scheduled: "${apptData.title}" for ${apptData.dateTime}`
    );

    // If appointment is fixed, automatically transition lead status to appt_fixed
    const lead = leads.find(l => l.id === apptData.leadId);
    if (lead && lead.status !== 'appt_fixed') {
      await updateLead(apptData.leadId, { status: 'appt_fixed' });
    } else {
      await saveToStorage(leads, updatedAppts, quotations);
    }
  };

  const updateAppointmentStatus = async (apptId: string, status: Appointment['status']) => {
    const updatedAppts = appointments.map((appt) => {
      if (appt.id === apptId) {
        return { ...appt, status };
      }
      return appt;
    });
    setAppointments(updatedAppts);

    const appt = appointments.find(a => a.id === apptId);
    if (appt) {
      await addLeadHistory(
        appt.leadId,
        'appointment',
        `Appointment "${appt.title}" marked as ${status}`
      );
    } else {
      await saveToStorage(leads, updatedAppts, quotations);
    }
  };

  const addQuotation = async (quoteData: Omit<Quotation, 'id'>) => {
    const nextNum = quotations.length > 0 
      ? Math.max(...quotations.map(q => parseInt(q.id.split('-')[1]) || 500)) + 1 
      : 501;

    const newQuote: Quotation = {
      ...quoteData,
      id: `QT-${nextNum}`,
    };

    const updatedQuotes = [newQuote, ...quotations];
    setQuotations(updatedQuotes);

    // Add history item to lead
    await addLeadHistory(
      quoteData.leadId,
      'quotation',
      `Quotation created: "${quoteData.title}" ($${quoteData.amount})`
    );

    // Transition status to quotation_send if it was less progressed
    const lead = leads.find(l => l.id === quoteData.leadId);
    if (lead && ['new', 'hot', 'warm', 'cold', 'appt_fixed'].includes(lead.status)) {
      await updateLead(quoteData.leadId, { status: 'quotation_send' });
    } else {
      await saveToStorage(leads, appointments, updatedQuotes);
    }
  };

  const updateQuotationStatus = async (quoteId: string, status: Quotation['status']) => {
    const updatedQuotes = quotations.map((q) => {
      if (q.id === quoteId) {
        return { ...q, status };
      }
      return q;
    });
    setQuotations(updatedQuotes);

    const quote = quotations.find(q => q.id === quoteId);
    if (quote) {
      await addLeadHistory(
        quote.leadId,
        'quotation',
        `Quotation "${quote.title}" status updated to ${status}`
      );

      // If approved, transition lead to order_confirmed
      if (status === 'approved') {
        await updateLead(quote.leadId, { status: 'order_confirmed' });
      }
    } else {
      saveToStorage(leads, appointments, updatedQuotes);
    }
  };

  return (
    <LeadsContext.Provider
      value={{
        leads,
        appointments,
        quotations,
        loading,
        addLead,
        updateLead,
        deleteLead,
        addLeadHistory,
        addAppointment,
        updateAppointmentStatus,
        addQuotation,
        updateQuotationStatus,
      }}>
      {children}
    </LeadsContext.Provider>
  );
};

export const useLeads = () => {
  const context = useContext(LeadsContext);
  if (context === undefined) {
    throw new Error('useLeads must be used within a LeadsProvider');
  }
  return context;
};
