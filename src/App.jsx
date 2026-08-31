import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { 
  Calendar as CalendarIcon, DollarSign, Users, ArrowRightLeft, 
  Trash2, Menu, X, UserPlus, ChevronLeft, ChevronRight, LogOut, CheckCircle, Camera, Printer, FileText, ExternalLink, Sun, Moon, AlertCircle, Info
} from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(amount);
};
const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

// --- EVENT CARD COMPONENT ---
const EventCard = ({ e, expenses, salaries, isOwner, handleDelete, handleMarkPaid, setEvents, events, setInvoiceEvent, darkMode }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const eExpensesList = expenses.filter(x => x.event_id === e.id);
  const eSalariesList = salaries.filter(x => x.event_id === e.id);
  
  const eExpensesTotal = eExpensesList.reduce((sum, x) => sum + Number(x.amount), 0);
  const eSalariesTotal = eSalariesList.reduce((sum, x) => sum + Number(x.amount), 0);
  const eProfit = Number(e.total_fee) - (eExpensesTotal + eSalariesTotal);
  const advance = Number(e.advance_payment || 0);
  const balance = Number(e.total_fee) - advance;

  return (
    <div className={`border rounded-xl shadow-sm hover:shadow-md transition overflow-hidden flex flex-col ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
      <div className="p-5 flex-1">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h4 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>{e.title}</h4>
            <div className={`text-sm mt-1 mb-2 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
              {formatDate(e.event_date)} {e.end_date && e.end_date !== e.event_date ? ` to ${formatDate(e.end_date)}` : ''} 
              <span className="mx-2">•</span> 
              <span className={`font-semibold px-2 py-0.5 rounded-full text-xs ${darkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-50 text-blue-600'}`}>{e.time_type}</span>
            </div>
            
            {/* Payment Status Badge */}
            <div className="flex items-center space-x-2 mb-2">
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${e.status === 'Completed' ? (darkMode ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-700') : (darkMode ? 'bg-yellow-900/50 text-yellow-400' : 'bg-yellow-100 text-yellow-700')}`}>
                {e.status === 'Completed' ? '✅ Fully Paid' : '⏳ Pending Payment'}
              </span>
              {e.client_name && <span className={`text-xs ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>Client: {e.client_name}</span>}
            </div>

            {e.equipment_notes && (
              <div className={`mt-2 text-xs p-2 rounded border ${darkMode ? 'bg-slate-700/50 border-slate-600 text-slate-300' : 'bg-gray-50 border-gray-100 text-gray-600'}`}>
                <span className={`font-bold ${darkMode ? 'text-slate-200' : 'text-gray-700'}`}>Setup:</span> {e.equipment_notes}
              </div>
            )}
          </div>
          <div className="flex space-x-2">
            {/* Mark as Paid Button */}
            {!isOwner && e.status !== 'Completed' && (
              <button onClick={() => handleMarkPaid(e.id)} className={`p-2 rounded transition ${darkMode ? 'bg-green-900/30 hover:bg-green-900/60 text-green-400' : 'bg-green-50 hover:bg-green-100 text-green-600'}`} title="Mark as Fully Paid">
                <CheckCircle className="w-4 h-4"/>
              </button>
            )}
            <button onClick={() => setInvoiceEvent(e)} className={`p-2 rounded transition ${darkMode ? 'hover:bg-blue-900/50 text-blue-400' : 'hover:bg-blue-100 text-blue-600'}`} title="Print Invoice">
              <Printer className="w-4 h-4"/>
            </button>
            {!isOwner && (
              <button onClick={() => handleDelete('events', e.id, setEvents, events)} className={`p-2 rounded transition ${darkMode ? 'hover:bg-red-900/50 text-red-400' : 'hover:bg-red-100 text-red-500'}`} title="Delete Match">
                <Trash2 className="w-4 h-4"/>
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className={`grid grid-cols-3 gap-2 border-t p-4 text-center divide-x ${darkMode ? 'bg-slate-800/50 border-slate-700 divide-slate-700' : 'bg-gray-50 border-gray-200 divide-gray-200'}`}>
        <div>
          <div className={`text-xs uppercase tracking-wider mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Total Fee</div>
          <div className={`font-bold ${darkMode ? 'text-slate-200' : 'text-gray-800'}`}>{formatCurrency(e.total_fee)}</div>
        </div>
        <div>
          <div className={`text-xs uppercase tracking-wider mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Advance</div>
          <div className="font-bold text-green-500">{formatCurrency(advance)}</div>
        </div>
        <div>
          <div className={`text-xs uppercase tracking-wider mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Balance Due</div>
          <div className="font-bold text-blue-500">{formatCurrency(balance)}</div>
        </div>
      </div>

      <button 
        onClick={() => setIsExpanded(!isExpanded)} 
        className={`text-xs font-bold py-2.5 border-t transition-colors flex justify-center items-center w-full ${darkMode ? 'bg-slate-700 hover:bg-slate-600 text-slate-200 border-slate-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200'}`}
      >
        {isExpanded ? 'Hide Financial Breakdown ▲' : 'View Financial Breakdown ▼'}
      </button>

      {isExpanded && (
        <div className={`p-4 border-t text-sm ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
          <div className={`mb-4 p-3 rounded-lg border flex justify-between items-center ${darkMode ? 'bg-green-900/20 border-green-900/50' : 'bg-green-50 border-green-100'}`}>
             <span className={`font-bold ${darkMode ? 'text-green-400' : 'text-green-800'}`}>Expected Profit (Income - Costs):</span>
             <span className={`font-black text-lg ${eProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>{formatCurrency(eProfit)}</span>
          </div>

          <div className="mb-4">
            <h5 className={`font-bold border-b pb-1 mb-2 ${darkMode ? 'text-slate-200 border-slate-700' : 'text-gray-700 border-gray-200'}`}>Expenses Breakdown</h5>
            {eExpensesList.length === 0 ? (
              <div className={`italic text-xs ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>No expenses recorded yet.</div>
            ) : (
              <ul className="space-y-1.5">
                {eExpensesList.map(exp => (
                  <li key={exp.id} className={`flex justify-between text-xs ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                    <span>• {exp.category} <span className={darkMode ? 'text-slate-500' : 'text-gray-400'}>{exp.description ? `(${exp.description})` : ''}</span></span>
                    <span className="font-medium text-red-500">{formatCurrency(exp.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h5 className={`font-bold border-b pb-1 mb-2 ${darkMode ? 'text-slate-200 border-slate-700' : 'text-gray-700 border-gray-200'}`}>Salaries Breakdown</h5>
            {eSalariesList.length === 0 ? (
              <div className={`italic text-xs ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>No salaries recorded yet.</div>
            ) : (
              <ul className="space-y-1.5">
                {eSalariesList.map(sal => (
                  <li key={sal.id} className={`flex justify-between text-xs ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                    <span>• {sal.person_name}</span>
                    <span className="font-medium text-blue-500">{formatCurrency(sal.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// --- MAIN APP ---
function App() {
  const [session, setSession] = useState(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const [darkMode, setDarkMode] = useState(false);
  const [popup, setPopup] = useState({ show: false, message: '', type: 'success', onConfirm: null });

  const showPopup = (message, type = 'success', onConfirm = null) => {
    setPopup({ show: true, message, type, onConfirm });
  };

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [events, setEvents] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [salaries, setSalaries] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [team, setTeam] = useState([]); 
  const [equipment, setEquipment] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false); 
  const [calendarDate, setCalendarDate] = useState(new Date());
  
  const [invoiceEvent, setInvoiceEvent] = useState(null);
  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const [startMonth, setStartMonth] = useState(currentMonthStr);
  const [endMonth, setEndMonth] = useState(currentMonthStr);
  const [showReport, setShowReport] = useState(false);

  const [newEvent, setNewEvent] = useState({ title: '', event_date: '', end_date: '', time_type: 'Day', client_name: '', total_fee: 0, advance_payment: 0, equipment_notes: '', status: 'Pending' });
  const [newExpense, setNewExpense] = useState({ event_id: '', category: 'Food', description: '', amount: 0 });
  const [newSalary, setNewSalary] = useState({ event_id: '', person_name: '', amount: 0 }); 
  const [newTransfer, setNewTransfer] = useState({ transfer_date: '', amount: 0, reference_note: '' });
  const [slipFile, setSlipFile] = useState(null);

  const [newMember, setNewMember] = useState({ full_name: '', phone: '', role: 'Camera Operator', bank_details: '' });
  const [newEquipment, setNewEquipment] = useState({ item_name: '', category: 'Camera', serial_number: '', condition: 'Good' });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsAuthLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) fetchData();
  }, [session]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsAuthLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
    if (error) { showPopup("Login Error: " + error.message, "error"); setIsAuthLoading(false); }
  };

  const handleLogout = async () => await supabase.auth.signOut();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [eventsRes, expensesRes, salariesRes, transfersRes, teamRes, equipmentRes] = await Promise.all([
        supabase.from('events').select('*').order('event_date', { ascending: false }),
        supabase.from('expenses').select('*').order('created_at', { ascending: false }),
        supabase.from('salaries').select('*').order('created_at', { ascending: false }),
        supabase.from('owner_transfers').select('*').order('transfer_date', { ascending: false }),
        supabase.from('team_members').select('*').order('created_at', { ascending: false }),
        supabase.from('equipment').select('*').order('created_at', { ascending: false }),
      ]);
      
      if (eventsRes.data) setEvents(eventsRes.data);
      if (expensesRes.data) setExpenses(expensesRes.data);
      if (salariesRes.data) setSalaries(salariesRes.data);
      if (transfersRes.data) setTransfers(transfersRes.data);
      if (teamRes.data) setTeam(teamRes.data);
      if (equipmentRes.data) setEquipment(equipmentRes.data);
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.from('events').insert([newEvent]).select();
    if (error) showPopup("Save Error: " + error.message, "error");
    else { 
      setEvents([data[0], ...events]); 
      setNewEvent({ title: '', event_date: '', end_date: '', time_type: 'Day', client_name: '', total_fee: 0, advance_payment: 0, equipment_notes: '', status: 'Pending' }); 
      showPopup("Match Record Saved Successfully!", "success"); 
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.from('expenses').insert([newExpense]).select();
    if (error) showPopup("Save Error: " + error.message, "error");
    else { 
      setExpenses([data[0], ...expenses]); 
      setNewExpense({ event_id: '', category: 'Food', description: '', amount: 0 }); 
      showPopup("Expense Added Successfully!", "success"); 
    }
  };

  const handleAddSalary = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.from('salaries').insert([newSalary]).select();
    if (error) showPopup("Save Error: " + error.message, "error");
    else { 
      setSalaries([data[0], ...salaries]); 
      setNewSalary({ event_id: '', person_name: '', amount: 0 }); 
      showPopup("Salary Added Successfully!", "success"); 
    }
  };

  const handleAddTransfer = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    let slip_url = null;

    if (slipFile) {
      const fileExt = slipFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('slips').upload(fileName, slipFile);
      if (uploadError) {
        showPopup("Slip Upload Error: " + uploadError.message, "error");
        setIsUploading(false);
        return;
      }
      const { data: publicUrlData } = supabase.storage.from('slips').getPublicUrl(fileName);
      slip_url = publicUrlData.publicUrl;
    }

    const transferData = { ...newTransfer, slip_url };
    const { data, error } = await supabase.from('owner_transfers').insert([transferData]).select();
    
    if (error) {
      showPopup("Save Error: " + error.message, "error");
    } else { 
      setTransfers([data[0], ...transfers]); 
      setNewTransfer({ transfer_date: '', amount: 0, reference_note: '' }); 
      setSlipFile(null); 
      showPopup("Transfer Recorded Successfully!", "success"); 
    }
    setIsUploading(false);
  };

  const handleAddTeamMember = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.from('team_members').insert([newMember]).select();
    if (error) showPopup("Save Error: " + error.message, "error");
    else { setTeam([data[0], ...team]); setNewMember({ full_name: '', phone: '', role: 'Camera Operator', bank_details: '' }); showPopup("Team Member Saved!", "success"); }
  };

  const handleAddEquipment = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.from('equipment').insert([newEquipment]).select();
    if (error) showPopup("Save Error: " + error.message, "error");
    else { setEquipment([data[0], ...equipment]); setNewEquipment({ item_name: '', category: 'Camera', serial_number: '', condition: 'Good' }); showPopup("Equipment Saved Successfully!", "success"); }
  };

  const handleDelete = (table, id, setFn, state) => {
    showPopup("Are you sure you want to delete this record?", "confirm", async () => {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) showPopup("Delete Error: " + error.message, "error");
      else {
        setFn(state.filter(item => item.id !== id));
        showPopup("Record Deleted Successfully!", "success");
      }
    });
  };

  const handleConfirmTransfer = (id) => {
    showPopup("ඔබට මෙම මුදල නිවැරදිව ලැබුණු බව තහවුරු කරනවාද?", "confirm", async () => {
      const { error } = await supabase.from('owner_transfers').update({ status: 'Confirmed' }).eq('id', id);
      if (error) showPopup("Error: " + error.message, "error");
      else { 
        setTransfers(transfers.map(t => t.id === id ? { ...t, status: 'Confirmed' } : t)); 
        showPopup("Payment Confirmed Successfully!", "success"); 
      }
    });
  };

  // --- NEW: Handle Mark Event as Paid ---
  const handleMarkPaid = (id) => {
    showPopup("සම්පූර්ණ මුදල ලැබුණු බව තහවුරු කරනවාද?", "confirm", async () => {
      const { error } = await supabase.from('events').update({ status: 'Completed' }).eq('id', id);
      if (error) showPopup("Error: " + error.message, "error");
      else {
        setEvents(events.map(ev => ev.id === id ? { ...ev, status: 'Completed' } : ev));
        showPopup("Event marked as Fully Paid!", "success");
      }
    });
  };

  const handleSetThisYear = () => {
    const y = new Date().getFullYear();
    setStartMonth(`${y}-01`);
    setEndMonth(`${y}-12`);
  };

  const handleSetThisMonth = () => {
    const cur = new Date().toISOString().slice(0, 7);
    setStartMonth(cur);
    setEndMonth(cur);
  };

  // --- FINANCIAL CALCULATIONS (CASH-FLOW BASIS) ---
  const getReceivedIncome = (ev) => ev.status === 'Completed' ? Number(ev.total_fee) : Number(ev.advance_payment || 0);

  const filteredEvents = events.filter(e => {
    const eventMonth = e.event_date.slice(0, 7);
    return eventMonth >= startMonth && eventMonth <= endMonth;
  });

  const filteredExpenses = expenses.filter(x => filteredEvents.some(e => e.id === x.event_id));
  const filteredSalaries = salaries.filter(s => filteredEvents.some(e => e.id === s.event_id));

  // Period Stats
  const rangeIncome = filteredEvents.reduce((sum, e) => sum + getReceivedIncome(e), 0);
  const rangeExpensesTotal = filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const rangeSalariesTotal = filteredSalaries.reduce((sum, e) => sum + Number(e.amount), 0);
  const rangeCosts = rangeExpensesTotal + rangeSalariesTotal; 
  const rangeProfit = rangeIncome - rangeCosts;

  // All-Time Stats
  const totalIncomeAll = events.reduce((sum, e) => sum + getReceivedIncome(e), 0);
  const totalExpensesAll = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalSalariesAll = salaries.reduce((sum, e) => sum + Number(e.amount), 0);
  const allTimeNetProfit = totalIncomeAll - (totalExpensesAll + totalSalariesAll);
  
  const confirmedTransfers = transfers.filter(t => t.status === 'Confirmed').reduce((sum, t) => sum + Number(t.amount), 0);
  const pendingTransfers = transfers.filter(t => t.status !== 'Confirmed').reduce((sum, t) => sum + Number(t.amount), 0);
  const balanceToSend = allTimeNetProfit - (confirmedTransfers + pendingTransfers);

  // Pending Receivables (Salli Enna Thiyena Gaana)
  const totalPendingReceivables = events.reduce((sum, e) => {
    if (e.status !== 'Completed') {
      return sum + Math.max(0, Number(e.total_fee) - Number(e.advance_payment || 0));
    }
    return sum;
  }, 0);

  const expensesByCategory = filteredExpenses.reduce((acc, curr) => {
    const existing = acc.find(item => item.name === curr.category);
    if (existing) existing.value += Number(curr.amount);
    else acc.push({ name: curr.category, value: Number(curr.amount) });
    return acc;
  }, []);
  const PIE_COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6'];

  const matchChartData = filteredEvents.slice(0, 10).map(e => {
    const matchEx = expenses.filter(x => x.event_id === e.id).reduce((sum, x) => sum + Number(x.amount), 0);
    const matchSal = salaries.filter(x => x.event_id === e.id).reduce((sum, x) => sum + Number(x.amount), 0);
    return { name: e.title.length > 10 ? e.title.substring(0, 10) + '..' : e.title, Income: getReceivedIncome(e), Cost: matchEx + matchSal };
  }).reverse(); 

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <CalendarIcon className="w-5 h-5 mr-3" /> },
    { id: 'events', label: 'Match/Events', icon: <CalendarIcon className="w-5 h-5 mr-3" /> },
    { id: 'expenses', label: 'Expenses', icon: <DollarSign className="w-5 h-5 mr-3" /> },
    { id: 'team', label: 'Team Profiles', icon: <UserPlus className="w-5 h-5 mr-3" /> },
    { id: 'equipment', label: 'Equipment', icon: <Camera className="w-5 h-5 mr-3" /> },
    { id: 'salaries', label: 'Salaries', icon: <Users className="w-5 h-5 mr-3" /> },
    { id: 'transfers', label: 'Owner Transfers', icon: <ArrowRightLeft className="w-5 h-5 mr-3" /> },
  ];

  const prevMonth = () => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1));
  const nextMonth = () => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1));
  
  const daysInMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), 1).getDay();
  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(new Date(calendarDate.getFullYear(), calendarDate.getMonth(), i));

  if (isAuthLoading) return <div className="flex justify-center items-center h-screen text-xl font-bold text-gray-500">Checking Auth...</div>;

  if (!session) {
    return (
      <div className={`flex items-center justify-center h-screen px-4 ${darkMode ? 'bg-slate-900' : 'bg-gray-100'}`}>
        <div className={`p-8 rounded-2xl shadow-lg w-full max-w-md border-t-4 border-blue-600 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black text-blue-600 mb-1">NGC <span className="text-red-500">SPORTS</span></h1>
            <p className={`font-medium ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>System Management Portal</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className={`block text-sm font-bold mb-1 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>Email Address</label>
              <input type="email" required value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'}`} placeholder="admin@ngclive.com" />
            </div>
            <div>
              <label className={`block text-sm font-bold mb-1 ${darkMode ? 'text-slate-300' : 'text-gray-700'}`}>Password</label>
              <input type="password" required value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'}`} placeholder="••••••••" />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-bold transition duration-200">
              Sign In
            </button>
          </form>
          <div className="mt-4 flex justify-center">
             <button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-full ${darkMode ? 'bg-slate-700 text-yellow-400' : 'bg-gray-200 text-gray-600'}`}>
                {darkMode ? <Sun className="w-5 h-5"/> : <Moon className="w-5 h-5"/>}
             </button>
          </div>
        </div>

        {/* CUSTOM POPUP OVERLAY FOR LOGIN */}
        {popup.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 print:hidden">
            <div className={`w-full max-w-sm p-6 rounded-2xl shadow-2xl transform transition-all scale-100 ${darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-100'}`}>
              <div className="flex flex-col items-center text-center">
                {popup.type === 'success' && <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-4"><CheckCircle className="w-8 h-8 text-green-600"/></div>}
                {popup.type === 'error' && <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-4"><AlertCircle className="w-8 h-8 text-red-600"/></div>}
                {popup.type === 'confirm' && <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mb-4"><Info className="w-8 h-8 text-blue-600"/></div>}
                
                <h3 className={`text-xl font-black mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {popup.type === 'success' ? 'Success!' : popup.type === 'error' ? 'Oops! Error' : 'Please Confirm'}
                </h3>
                <p className={`text-sm mb-6 ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>{popup.message}</p>
                
                <div className="flex space-x-3 w-full">
                  {popup.type === 'confirm' ? (
                    <>
                      <button onClick={() => setPopup({ show: false, message: '', type: 'success', onConfirm: null })} className={`flex-1 py-2.5 rounded-lg font-bold transition ${darkMode ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>Cancel</button>
                      <button onClick={() => { popup.onConfirm(); setPopup({ show: false, message: '', type: 'success', onConfirm: null }); }} className="flex-1 py-2.5 rounded-lg font-bold bg-blue-600 hover:bg-blue-700 text-white transition shadow-md">Confirm</button>
                    </>
                  ) : (
                    <button onClick={() => setPopup({ show: false, message: '', type: 'success', onConfirm: null })} className="w-full py-2.5 rounded-lg font-bold bg-blue-600 hover:bg-blue-700 text-white transition shadow-md">OK, Got it!</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const currentUserEmail = session.user.email;
  const isOwner = currentUserEmail === 'owner@ngclive.com';

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcomingEvents = events.filter(e => { const d = e.end_date ? new Date(e.end_date) : new Date(e.event_date); d.setHours(0,0,0,0); return d >= today; });
  const pastEvents = events.filter(e => { const d = e.end_date ? new Date(e.end_date) : new Date(e.event_date); d.setHours(0,0,0,0); return d < today; });

  // --- REPORTS & INVOICES ---
  if (showReport) {
    const isSingleMonth = startMonth === endMonth;
    const reportTitle = isSingleMonth 
      ? new Date(startMonth + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })
      : `${new Date(startMonth + '-01').toLocaleString('default', { month: 'short', year: 'numeric' })} – ${new Date(endMonth + '-01').toLocaleString('default', { month: 'short', year: 'numeric' })}`;
    
    return (
      <div className="min-h-screen bg-gray-200 p-8 print:p-0 print:bg-white text-gray-900">
        <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden">
          <button onClick={() => setShowReport(false)} className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-2 rounded-lg font-bold transition">
            ← Back to Dashboard
          </button>
          <button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-bold flex items-center transition shadow-lg">
            <Printer className="w-5 h-5 mr-2" /> Print / Save as PDF
          </button>
        </div>

        <div className="max-w-4xl mx-auto bg-white p-12 rounded-xl shadow-xl print:shadow-none print:p-8">
          <div className="flex justify-between items-start border-b-4 border-blue-800 pb-6 mb-8">
            <div className="flex items-center">
              <div className="mr-6 bg-black p-1 rounded-xl shadow-md">
                <img src="/logo.jpg" alt="NGC Sports" className="w-20 h-20 object-contain rounded-lg" onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/100?text=LOGO"; }} />
              </div>
              <div>
                <h1 className="text-3xl font-black text-blue-800 tracking-tighter">NGC <span className="text-red-600">SPORTS</span></h1>
                <p className="text-gray-500 text-sm font-bold">Live Streaming & Broadcasting</p>
                <p className="text-gray-400 text-xs">Kotapola, Sri Lanka • 076 6 461 116</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-black text-gray-800 mb-1 uppercase tracking-widest">Financial Report</h2>
              <p className="text-blue-600 font-bold text-lg">{reportTitle}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg">
              <div className="text-xs font-bold text-gray-500 uppercase">Period Income</div>
              <div className="text-xl font-black text-gray-800">{formatCurrency(rangeIncome)}</div>
            </div>
            <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded-r-lg">
              <div className="text-xs font-bold text-gray-500 uppercase">Period Costs (Exp + Sal)</div>
              <div className="text-xl font-black text-red-600">{formatCurrency(rangeCosts)}</div>
            </div>
            <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded-r-lg">
              <div className="text-xs font-bold text-gray-500 uppercase">Period Net Profit</div>
              <div className={`text-xl font-black ${rangeProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(rangeProfit)}</div>
            </div>
          </div>

          <h3 className="font-bold text-gray-800 border-b pb-2 mb-4">Matches & Events Covered ({filteredEvents.length})</h3>
          {filteredEvents.length === 0 ? (
            <p className="text-gray-500 italic mb-8">No events recorded for this selected time period.</p>
          ) : (
            <table className="w-full text-left border-collapse mb-8 text-sm">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="p-3 border-b font-bold">Date</th>
                  <th className="p-3 border-b font-bold">Match Name</th>
                  <th className="p-3 border-b font-bold text-right">Income</th>
                  <th className="p-3 border-b font-bold text-right">Cost</th>
                  <th className="p-3 border-b font-bold text-right">Profit</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map(e => {
                  const eExp = expenses.filter(x => x.event_id === e.id).reduce((sum, x) => sum + Number(x.amount), 0);
                  const eSal = salaries.filter(x => x.event_id === e.id).reduce((sum, x) => sum + Number(x.amount), 0);
                  const eProf = getReceivedIncome(e) - (eExp + eSal);
                  return (
                    <tr key={e.id} className="border-b border-gray-100">
                      <td className="p-3 text-gray-600">{formatDate(e.event_date)}</td>
                      <td className="p-3 font-medium text-gray-800">{e.title}</td>
                      <td className="p-3 text-right text-gray-600">{formatCurrency(getReceivedIncome(e))}</td>
                      <td className="p-3 text-right text-red-500">{formatCurrency(eExp + eSal)}</td>
                      <td className="p-3 text-right font-bold text-green-600">{formatCurrency(eProf)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}

          <div className="flex justify-end pt-8 border-t-2 border-gray-200">
            <div className="text-right">
              <p className="text-gray-500 text-sm font-bold mb-1">Total Balance Payable to Owner (All-Time)</p>
              <h2 className="text-3xl font-black text-blue-800">{formatCurrency(balanceToSend)}</h2>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (invoiceEvent) {
    const advance = Number(invoiceEvent.advance_payment || 0);
    const balanceDue = Number(invoiceEvent.total_fee) - advance;

    return (
      <div className="min-h-screen bg-gray-200 p-8 print:p-0 print:bg-white text-gray-900">
        <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden">
          <button onClick={() => setInvoiceEvent(null)} className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-2 rounded-lg font-bold transition">
            ← Back to System
          </button>
          <button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-bold flex items-center transition shadow-lg">
            <Printer className="w-5 h-5 mr-2" /> Print / Save as PDF
          </button>
        </div>

        <div className="max-w-4xl mx-auto bg-white p-12 rounded-xl shadow-xl print:shadow-none print:p-8">
          <div className="flex justify-between items-start border-b-4 border-blue-800 pb-8 mb-8">
            <div className="flex items-center">
              <div className="mr-6 bg-black p-1 rounded-xl shadow-md">
                <img src="/logo.jpg" alt="NGC Sports" className="w-24 h-24 object-contain rounded-lg" onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/100?text=LOGO"; }} />
              </div>
              <div>
                <h1 className="text-4xl font-black text-blue-800 tracking-tighter">NGC <span className="text-red-600">SPORTS</span></h1>
                <p className="text-gray-500 mt-1 font-bold">Live Streaming & Broadcasting Solutions</p>
                <div className="mt-3 text-sm text-gray-600 space-y-1 font-medium">
                  <p>📍 Kotapola, Sri Lanka</p>
                  <p>📞 076 6 461 116 | +972 50 391 2106</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-black text-gray-800 mb-2 tracking-widest">INVOICE</h2>
              <p className="text-gray-600"><span className="font-bold">Date:</span> {new Date().toLocaleDateString()}</p>
              <p className="text-gray-600"><span className="font-bold">Invoice #:</span> INV-{invoiceEvent.id.substring(0,6).toUpperCase()}</p>
            </div>
          </div>

          <div className="mb-10 flex border-l-4 border-red-600 pl-4">
            <div>
              <h3 className="text-gray-400 font-bold mb-1 text-sm tracking-widest uppercase">Bill To:</h3>
              <p className="text-xl font-bold text-gray-800">{invoiceEvent.client_name || 'Valued Client'}</p>
              <p className="text-gray-500">{invoiceEvent.title}</p>
            </div>
          </div>

          <table className="w-full text-left border-collapse mb-10">
            <thead>
              <tr className="bg-blue-50 border-y-2 border-blue-800 text-blue-900">
                <th className="p-4 font-bold uppercase tracking-wider text-sm">Description</th>
                <th className="p-4 font-bold text-center uppercase tracking-wider text-sm">Event Date</th>
                <th className="p-4 font-bold text-center uppercase tracking-wider text-sm">Time</th>
                <th className="p-4 font-bold text-right uppercase tracking-wider text-sm">Amount (LKR)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b-2 border-gray-100">
                <td className="p-4 py-6 text-gray-800 font-bold">
                  Professional Live Streaming & Broadcasting Services<br/>
                  <span className="text-sm text-gray-500 font-normal">For: {invoiceEvent.title}</span>
                  {invoiceEvent.equipment_notes && (
                    <div className="mt-3 bg-gray-50 border border-gray-200 p-3 rounded-lg text-sm text-gray-600 font-normal">
                      <span className="font-bold text-gray-800">Equipment / Setup Details:</span><br/>
                      {invoiceEvent.equipment_notes}
                    </div>
                  )}
                </td>
                <td className="p-4 py-6 text-center text-gray-600 font-medium">{formatDate(invoiceEvent.event_date)}</td>
                <td className="p-4 py-6 text-center text-gray-600 font-medium">{invoiceEvent.time_type}</td>
                <td className="p-4 py-6 text-right font-black text-gray-800 text-lg">{formatCurrency(invoiceEvent.total_fee)}</td>
              </tr>
            </tbody>
          </table>

          <div className="flex justify-end mb-16">
            <div className="w-1/2 space-y-2">
              <div className="flex justify-between font-bold text-lg text-gray-600 border-t-2 border-gray-200 pt-4">
                <span>Total Fee:</span>
                <span>{formatCurrency(invoiceEvent.total_fee)}</span>
              </div>
              
              {advance > 0 && (
                <div className="flex justify-between font-bold text-lg text-green-600">
                  <span>Advance Received:</span>
                  <span>-{formatCurrency(advance)}</span>
                </div>
              )}

              <div className="flex justify-between font-black text-2xl border-t-4 border-blue-800 pt-4 mt-2">
                <span className="text-gray-800">Balance Due:</span>
                <span className="text-red-600">{formatCurrency(balanceDue)}</span>
              </div>
            </div>
          </div>

          <div className="text-center text-gray-400 text-sm border-t-2 border-gray-100 pt-8 mt-8">
            <p className="font-bold text-gray-800 mb-1">Thank you for your business!</p>
            <p>If you have any questions concerning this invoice, please contact NGC SPORTS.</p>
          </div>
        </div>
      </div>
    );
  }

  // MAIN LAYOUT
  return (
    <div className={`flex h-screen text-sm md:text-base ${darkMode ? 'bg-slate-900 text-slate-100' : 'bg-gray-50 text-gray-900'}`}>
      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col transform transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} print:hidden ${darkMode ? 'bg-slate-950 border-r border-slate-800' : 'bg-slate-900'}`}>
        <div className={`flex items-center justify-between h-20 px-6 border-b ${darkMode ? 'border-slate-800' : 'border-slate-800'}`}>
          <h1 className="text-2xl font-black text-white">NGC <span className="text-red-500">SPORTS</span></h1>
          <button className="md:hidden text-white" onClick={() => setIsSidebarOpen(false)}><X/></button>
        </div>
        
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }} className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors font-medium ${activeTab === item.id ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300 hover:text-white'}`}>
              {item.icon} <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className={`p-4 border-t ${darkMode ? 'border-slate-800' : 'border-slate-800'}`}>
          <button onClick={handleLogout} className="flex items-center w-full px-4 py-3 rounded-lg text-red-400 hover:bg-slate-800 transition-colors">
            <LogOut className="w-5 h-5 mr-3" /> <span className="font-medium">Log Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* HEADER */}
        <header className={`flex items-center justify-between h-16 px-6 border-b shadow-sm z-10 print:hidden ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center">
            <button className="md:hidden mr-4" onClick={() => setIsSidebarOpen(true)}><Menu/></button>
            <h2 className="text-xl font-bold">{navItems.find(i => i.id === activeTab)?.label}</h2>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-full transition ${darkMode ? 'bg-slate-700 text-yellow-400 hover:bg-slate-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${isOwner ? (darkMode ? 'bg-indigo-900/50 text-indigo-300 border-indigo-700' : 'bg-indigo-100 text-indigo-800 border-indigo-200') : (darkMode ? 'bg-blue-900/50 text-blue-300 border-blue-700' : 'bg-blue-100 text-blue-800 border-blue-200')}`}>
              {isOwner ? '👀 View Only (Owner)' : '👑 Admin Access'}
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8">
          
          {activeTab === 'dashboard' && (
            <div className="max-w-6xl mx-auto space-y-6">
              
              {/* Filter Row */}
              <div className={`flex flex-wrap justify-between items-center p-4 rounded-xl shadow-sm border gap-4 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-bold text-sm">Time Range:</span>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs font-semibold ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>From:</span>
                    <input type="month" value={startMonth} onChange={(e) => setStartMonth(e.target.value)} className={`border p-1.5 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300 text-blue-700'}`} />
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`text-xs font-semibold ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>To:</span>
                    <input type="month" value={endMonth} onChange={(e) => setEndMonth(e.target.value)} className={`border p-1.5 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300 text-blue-700'}`} />
                  </div>

                  <div className="flex space-x-1 pl-2">
                    <button onClick={handleSetThisMonth} className={`px-2.5 py-1 text-xs rounded font-semibold transition ${darkMode ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>This Month</button>
                    <button onClick={handleSetThisYear} className={`px-2.5 py-1 text-xs rounded font-semibold transition ${darkMode ? 'bg-blue-900/50 hover:bg-blue-800 text-blue-300' : 'bg-blue-50 hover:bg-blue-100 text-blue-700'}`}>Full Year</button>
                  </div>
                </div>

                <button onClick={() => setShowReport(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold flex items-center transition shadow-sm text-sm">
                  <FileText className="w-4 h-4 mr-2" /> Generate Financial Report
                </button>
              </div>

              {/* Stats Cards Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-5 rounded-xl shadow-sm border-t-4 border-t-blue-500 flex flex-col border min-h-[140px] ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                  <div className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Period Income (Received)</div>
                  <div className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(rangeIncome)}</div>
                </div>
                <div className={`p-5 rounded-xl shadow-sm border-t-4 border-t-red-500 flex flex-col border min-h-[140px] ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                  <div className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Period Costs</div>
                  <div className="text-2xl font-black text-red-500">{formatCurrency(rangeCosts)}</div>
                  <div className={`mt-auto text-[11px] font-medium p-2 rounded flex justify-between border ${darkMode ? 'bg-slate-700/50 border-slate-600 text-slate-400' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
                    <span>Exp: <b className={darkMode ? 'text-slate-200' : 'text-gray-700'}>{formatCurrency(rangeExpensesTotal)}</b></span>
                    <span>Sal: <b className={darkMode ? 'text-slate-200' : 'text-gray-700'}>{formatCurrency(rangeSalariesTotal)}</b></span>
                  </div>
                </div>
                <div className={`p-5 rounded-xl shadow-sm border-t-4 border-t-green-500 flex flex-col border min-h-[140px] ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                  <div className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Period Net Profit</div>
                  <div className={`text-2xl font-black ${rangeProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>{formatCurrency(rangeProfit)}</div>
                </div>
              </div>

              {/* Stats Cards Row 2 (All-Time Totals) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-5 rounded-xl shadow-sm border-t-4 border-t-orange-400 flex flex-col border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-orange-50 border-orange-200'}`}>
                  <div className="text-[11px] font-bold uppercase tracking-wider mb-1 text-orange-600">Pending Receivables (All-Time)</div>
                  <div className="text-2xl font-black text-orange-600">{formatCurrency(totalPendingReceivables)}</div>
                  <div className={`text-xs mt-1 font-medium ${darkMode ? 'text-slate-400' : 'text-orange-700/70'}`}>එළියෙන් ලැබීමට ඇති මුළු මුදල</div>
                </div>
                <div className={`p-5 rounded-xl shadow-sm border-t-4 border-t-blue-400 flex flex-col border ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-900 border-slate-800'}`}>
                  <div className="text-[11px] font-bold uppercase tracking-wider mb-1 text-slate-400">Total Balance Owed to Owner (In Hand)</div>
                  <div className="text-2xl font-black text-white">{formatCurrency(balanceToSend)}</div>
                  <div className={`text-xs mt-1 font-medium text-slate-500`}>ඇත්තටම අතට ලැබුණු ආදායමින් ඉතිරිය</div>
                </div>
              </div>

              {/* Charts & Calendar Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Side: Charts (2 Columns Wide) */}
                <div className="lg:col-span-2 flex flex-col space-y-6">
                  
                  {/* Bar Chart */}
                  <div className={`p-5 rounded-xl shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                    <h3 className={`text-sm font-bold mb-4 border-b pb-2 ${darkMode ? 'text-white border-slate-700' : 'text-gray-800 border-gray-200'}`}>Match Performance in Selected Range</h3>
                    {matchChartData.length > 0 ? (
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={matchChartData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                            <XAxis dataKey="name" fontSize={10} tick={{fill: darkMode ? '#9ca3af' : '#6b7280'}} />
                            <YAxis fontSize={10} tick={{fill: darkMode ? '#9ca3af' : '#6b7280'}} tickFormatter={(val) => `Rs ${val/1000}k`} />
                            <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ fontSize: '12px', borderRadius: '8px', backgroundColor: darkMode ? '#1e293b' : '#fff', borderColor: darkMode ? '#334155' : '#e5e7eb', color: darkMode ? '#f8fafc' : '#000' }} />
                            <Legend wrapperStyle={{ fontSize: '12px', color: darkMode ? '#f8fafc' : '#000' }} />
                            <Bar dataKey="Income" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Cost" fill="#ef4444" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className={`h-64 flex items-center justify-center text-sm italic ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>No events found in this date range.</div>
                    )}
                  </div>

                  {/* Pie Chart */}
                  <div className={`p-5 rounded-xl shadow-sm border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                    <h3 className={`text-sm font-bold mb-4 border-b pb-2 ${darkMode ? 'text-white border-slate-700' : 'text-gray-800 border-gray-200'}`}>Expenses Breakdown in Selected Range</h3>
                    {expensesByCategory.length > 0 ? (
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={expensesByCategory} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                              {expensesByCategory.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke={darkMode ? '#1e293b' : '#fff'} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ fontSize: '12px', borderRadius: '8px', backgroundColor: darkMode ? '#1e293b' : '#fff', borderColor: darkMode ? '#334155' : '#e5e7eb', color: darkMode ? '#f8fafc' : '#000' }} />
                            <Legend wrapperStyle={{ fontSize: '12px', color: darkMode ? '#f8fafc' : '#000' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className={`h-64 flex items-center justify-center text-sm italic ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>No expenses in this date range.</div>
                    )}
                  </div>

                </div>

                {/* Right Side: Calendar (1 Column Wide) */}
                <div className={`p-5 rounded-xl shadow-sm border h-max ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                  <div className={`flex justify-between items-center mb-4 border-b pb-3 ${darkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                    <h3 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Booking Calendar</h3>
                    <div className="flex items-center space-x-2">
                      <button onClick={prevMonth} className={`p-1.5 rounded-md transition ${darkMode ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}><ChevronLeft className="w-4 h-4"/></button>
                      <span className={`font-bold text-sm min-w-[120px] text-center ${darkMode ? 'text-slate-200' : 'text-gray-800'}`}>
                        {calendarDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                      </span>
                      <button onClick={nextMonth} className={`p-1.5 rounded-md transition ${darkMode ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}><ChevronRight className="w-4 h-4"/></button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-1.5 text-center">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                      <div key={d} className={`font-bold text-xs py-1 ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>{d}</div>
                    ))}
                    
                    {calendarDays.map((date, idx) => {
                      if (!date) return <div key={idx} className="p-1"></div>;
                      const dayEvents = events.filter(e => {
                        const start = new Date(e.event_date); start.setHours(0,0,0,0);
                        const end = e.end_date ? new Date(e.end_date) : new Date(start); end.setHours(0,0,0,0);
                        const current = date.getTime();
                        return current >= start.getTime() && current <= end.getTime();
                      });
                      const isBooked = dayEvents.length > 0;
                      return (
                        <div key={idx} className={`p-1.5 border rounded-lg flex flex-col items-center min-h-[60px] transition-all ${
                          isBooked 
                            ? (darkMode ? 'bg-slate-700 border-slate-600 shadow-sm' : 'bg-gray-50 border-gray-200 shadow-sm') 
                            : (darkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white border-gray-100 hover:bg-gray-50')
                        }`}>
                          <div className={`font-bold text-sm ${isBooked ? (darkMode ? 'text-white' : 'text-gray-800') : (darkMode ? 'text-slate-400' : 'text-gray-500')}`}>{date.getDate()}</div>
                          {isBooked && (
                            <div className="mt-0.5 flex flex-col items-center w-full space-y-0.5">
                              {dayEvents.map((ev, i) => {
                                const hasAdvanceOrPaid = ev.status === 'Completed' || Number(ev.advance_payment) > 0;
                                const badgeColor = hasAdvanceOrPaid 
                                  ? (darkMode ? 'bg-green-600 text-white' : 'bg-green-500 text-white') 
                                  : (darkMode ? 'bg-yellow-600 text-white' : 'bg-yellow-500 text-white');
                                
                                return (
                                  <span key={i} className={`text-[9px] leading-tight px-1 py-0.5 rounded w-full truncate text-center ${badgeColor}`} title={ev.title}>
                                    {ev.title}
                                  </span>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* OTHER TABS */}
          {activeTab !== 'dashboard' && (
            <>
              {!isOwner && (
                <div className={`p-6 rounded-xl shadow-sm border mb-6 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                  <h3 className={`text-lg font-bold mb-4 border-b pb-2 ${darkMode ? 'border-slate-700 text-white' : 'border-gray-200 text-gray-800'}`}>Add New Record</h3>
                  
                  {activeTab === 'events' && (
                    <form onSubmit={handleAddEvent} className="grid grid-cols-1 md:grid-cols-6 gap-4">
                      <div className="flex flex-col md:col-span-3">
                        <span className={`text-xs mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Event/Match Name</span>
                        <input type="text" required placeholder="Tournament Name" value={newEvent.title} onChange={e=>setNewEvent({...newEvent, title: e.target.value})} className={`border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-gray-300'}`} />
                      </div>
                      <div className="flex flex-col md:col-span-3">
                        <span className={`text-xs mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Client Name (For Invoice)</span>
                        <input type="text" placeholder="Ex: Sri Lanka Cricket Board" value={newEvent.client_name} onChange={e=>setNewEvent({...newEvent, client_name: e.target.value})} className={`border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-gray-300'}`} />
                      </div>
                      <div className="flex flex-col md:col-span-2">
                        <span className={`text-xs mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Start Date</span>
                        <input type="date" required value={newEvent.event_date} onChange={e=>setNewEvent({...newEvent, event_date: e.target.value})} className={`border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'}`} />
                      </div>
                      <div className="flex flex-col md:col-span-2">
                        <span className={`text-xs mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>End Date (Optional)</span>
                        <input type="date" value={newEvent.end_date} onChange={e=>setNewEvent({...newEvent, end_date: e.target.value})} className={`border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'}`} />
                      </div>
                      <div className="flex flex-col md:col-span-2">
                        <span className={`text-xs mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Day / Night</span>
                        <select value={newEvent.time_type} onChange={e=>setNewEvent({...newEvent, time_type: e.target.value})} className={`border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'}`}>
                          <option value="Day">Day</option>
                          <option value="Night">Night</option>
                          <option value="Day & Night">Day & Night</option>
                        </select>
                      </div>
                      <div className="flex flex-col md:col-span-6">
                        <span className={`text-xs mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Equipment / Setup Details (Cameras, Drones, etc.)</span>
                        <textarea placeholder="Ex: 5 Cameras, 1 Drone, 1 Switcher..." value={newEvent.equipment_notes} onChange={e=>setNewEvent({...newEvent, equipment_notes: e.target.value})} className={`border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 h-16 resize-none ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-gray-300'}`} />
                      </div>
                      <div className="flex flex-col md:col-span-3">
                        <span className={`text-xs mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Total Fee (LKR)</span>
                        <input type="number" required placeholder="Total Fee (LKR)" value={newEvent.total_fee} onChange={e=>setNewEvent({...newEvent, total_fee: e.target.value})} className={`border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-gray-300'}`} />
                      </div>
                      <div className="flex flex-col md:col-span-3">
                        <span className={`text-xs mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Advance Received (LKR) - Optional</span>
                        <input type="number" placeholder="Advance Amount" value={newEvent.advance_payment} onChange={e=>setNewEvent({...newEvent, advance_payment: e.target.value})} className={`border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-gray-300'}`} />
                      </div>
                      
                      <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded p-3 font-bold transition md:col-span-6 mt-2">Save Match Record</button>
                    </form>
                  )}

                  {activeTab === 'team' && (
                    <form onSubmit={handleAddTeamMember} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="flex flex-col">
                        <span className={`text-xs mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Full Name</span>
                        <input type="text" required placeholder="Ex: Nimal Silva" value={newMember.full_name} onChange={e=>setNewMember({...newMember, full_name: e.target.value})} className={`border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-gray-300'}`} />
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-xs mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Phone Number</span>
                        <input type="text" placeholder="07XXXXXXXX" value={newMember.phone} onChange={e=>setNewMember({...newMember, phone: e.target.value})} className={`border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-gray-300'}`} />
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-xs mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Role / Job</span>
                        <select value={newMember.role} onChange={e=>setNewMember({...newMember, role: e.target.value})} className={`border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'}`}>
                          <option value="Manager">Manager</option>
                          <option value="Camera Operator">Camera Operator</option>
                          <option value="Video Editor">Video Editor</option>
                          <option value="Sound Engineer">Sound Engineer</option>
                          <option value="Helper">Helper</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-xs mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Bank Details (Optional)</span>
                        <input type="text" placeholder="Bank Name & Acc No" value={newMember.bank_details} onChange={e=>setNewMember({...newMember, bank_details: e.target.value})} className={`border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-gray-300'}`} />
                      </div>
                      <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded p-2 font-bold transition md:col-span-4 mt-2">Save Profile</button>
                    </form>
                  )}

                  {activeTab === 'equipment' && (
                    <form onSubmit={handleAddEquipment} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="flex flex-col">
                        <span className={`text-xs mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Item Name</span>
                        <input type="text" required placeholder="Ex: Sony A7III" value={newEquipment.item_name} onChange={e=>setNewEquipment({...newEquipment, item_name: e.target.value})} className={`border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-gray-300'}`} />
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-xs mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Category</span>
                        <select value={newEquipment.category} onChange={e=>setNewEquipment({...newEquipment, category: e.target.value})} className={`border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'}`}>
                          <option value="Camera">Camera</option>
                          <option value="Lens">Lens</option>
                          <option value="Audio">Audio / Mic</option>
                          <option value="Lighting">Lighting</option>
                          <option value="Accessories">Cables / Accessories</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-xs mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Serial Number / Note</span>
                        <input type="text" placeholder="SN or small note" value={newEquipment.serial_number} onChange={e=>setNewEquipment({...newEquipment, serial_number: e.target.value})} className={`border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-gray-300'}`} />
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-xs mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Condition</span>
                        <select value={newEquipment.condition} onChange={e=>setNewEquipment({...newEquipment, condition: e.target.value})} className={`border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'}`}>
                          <option value="Good">🟢 Good / Working</option>
                          <option value="Needs Repair">🟠 Needs Repair</option>
                          <option value="Lost/Broken">🔴 Lost / Broken</option>
                        </select>
                      </div>
                      <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded p-2 font-bold transition md:col-span-4 mt-2">Save Equipment</button>
                    </form>
                  )}

                  {activeTab === 'expenses' && (
                    <form onSubmit={handleAddExpense} className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <select required value={newExpense.event_id} onChange={e=>setNewExpense({...newExpense, event_id: e.target.value})} className={`border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'}`}>
                        <option value="">-- Select Match --</option>{events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
                      </select>
                      <select required value={newExpense.category} onChange={e=>setNewExpense({...newExpense, category: e.target.value})} className={`border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'}`}>
                        <option value="Food">Food</option><option value="Transport">Transport</option><option value="Rent">Rent (Camera etc)</option><option value="Other">Other</option>
                      </select>
                      <input type="text" placeholder="Description (Optional)" value={newExpense.description} onChange={e=>setNewExpense({...newExpense, description: e.target.value})} className={`border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-gray-300'}`} />
                      <input type="number" required placeholder="Amount (LKR)" value={newExpense.amount} onChange={e=>setNewExpense({...newExpense, amount: e.target.value})} className={`border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-gray-300'}`} />
                      <button type="submit" className="bg-red-600 hover:bg-red-700 text-white rounded p-2 font-bold transition">Add Expense</button>
                    </form>
                  )}

                  {activeTab === 'salaries' && (
                    <form onSubmit={handleAddSalary} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <select required value={newSalary.event_id} onChange={e=>setNewSalary({...newSalary, event_id: e.target.value})} className={`border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'}`}>
                        <option value="">-- Select Match --</option>{events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
                      </select>
                      <select required value={newSalary.person_name} onChange={e=>setNewSalary({...newSalary, person_name: e.target.value})} className={`border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'}`}>
                        <option value="">-- Select Staff Member --</option>
                        {team.length === 0 && <option value="" disabled>Please add members in 'Team Profiles' first</option>}
                        {team.map(member => <option key={member.id} value={member.full_name}>{member.full_name} ({member.role})</option>)}
                      </select>
                      <input type="number" required placeholder="Salary Amount" value={newSalary.amount} onChange={e=>setNewSalary({...newSalary, amount: e.target.value})} className={`border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-gray-300'}`} />
                      <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded p-2 font-bold transition">Add Salary</button>
                    </form>
                  )}
                  
                  {activeTab === 'transfers' && (
                    <form onSubmit={handleAddTransfer} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                       <div className="flex flex-col">
                         <span className={`text-xs mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Transfer Date</span>
                         <input type="date" required value={newTransfer.transfer_date} onChange={e=>setNewTransfer({...newTransfer, transfer_date: e.target.value})} className={`border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300'}`} />
                       </div>
                       <div className="flex flex-col">
                         <span className={`text-xs mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Bank Ref / Note</span>
                         <input type="text" placeholder="Note/Bank Ref" value={newTransfer.reference_note} onChange={e=>setNewTransfer({...newTransfer, reference_note: e.target.value})} className={`border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-gray-300'}`} />
                       </div>
                       <div className="flex flex-col">
                         <span className={`text-xs mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Amount (LKR)</span>
                         <input type="number" required placeholder="Amount Sent" value={newTransfer.amount} onChange={e=>setNewTransfer({...newTransfer, amount: e.target.value})} className={`border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-white border-gray-300'}`} />
                       </div>
                       <div className="flex flex-col">
                         <span className={`text-xs mb-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Upload Receipt (Optional)</span>
                         <input type="file" accept="image/*,.pdf" onChange={e => setSlipFile(e.target.files[0])} className={`border p-1.5 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${darkMode ? 'bg-slate-700 border-slate-600 text-slate-300' : 'bg-white border-gray-300'}`} />
                       </div>
                       <button type="submit" disabled={isUploading} className={`text-white rounded p-2 font-bold transition ${isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                         {isUploading ? 'Uploading...' : 'Record Transfer'}
                       </button>
                    </form>
                  )}
                </div>
              )}

              {/* EVENTS CARDS LIST */}
              {activeTab === 'events' ? (
                <div className="space-y-8">
                  <div>
                    <h3 className={`text-xl font-bold mb-4 flex items-center ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      <span className={`p-2 rounded-lg mr-3 ${darkMode ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>📅</span> Upcoming Matches
                    </h3>
                    {upcomingEvents.length === 0 ? (
                      <div className={`p-8 rounded-xl border text-center ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-500' : 'bg-white border-gray-200 text-gray-500'}`}>No upcoming matches found.</div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {upcomingEvents.map(e => <EventCard key={e.id} e={e} expenses={expenses} salaries={salaries} isOwner={isOwner} handleDelete={handleDelete} handleMarkPaid={handleMarkPaid} setEvents={setEvents} events={events} setInvoiceEvent={setInvoiceEvent} darkMode={darkMode} />)}
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className={`text-xl font-bold mb-4 flex items-center ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      <span className={`p-2 rounded-lg mr-3 ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-200 text-gray-600'}`}>✅</span> Past Matches
                    </h3>
                    {pastEvents.length === 0 ? (
                      <div className={`p-8 rounded-xl border text-center ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-500' : 'bg-white border-gray-200 text-gray-500'}`}>No past matches found.</div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {pastEvents.map(e => <EventCard key={e.id} e={e} expenses={expenses} salaries={salaries} isOwner={isOwner} handleDelete={handleDelete} handleMarkPaid={handleMarkPaid} setEvents={setEvents} events={events} setInvoiceEvent={setInvoiceEvent} darkMode={darkMode} />)}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className={`rounded-xl shadow-sm border overflow-hidden ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                   <div className={`p-4 border-b font-bold ${darkMode ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>Saved Records</div>
                   <div className="p-0 overflow-auto">
                     <table className="w-full text-left border-collapse">
                        <tbody>
                          {/* EQUIPMENT TABLE */}
                          {activeTab === 'equipment' && equipment.map(eq => (
                            <tr key={eq.id} className={`border-b ${darkMode ? 'border-slate-700 hover:bg-slate-700/50' : 'border-gray-100 hover:bg-gray-50'}`}>
                              <td className={`p-4 font-bold ${darkMode ? 'text-slate-200' : 'text-gray-800'}`}>{eq.item_name} <br/><span className={`text-xs font-normal ${darkMode ? 'text-slate-500' : 'text-gray-500'}`}>{eq.category}</span></td>
                              <td className={`p-4 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>{eq.serial_number || '-'}</td>
                              <td className="p-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${eq.condition === 'Good' ? (darkMode ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-700') : eq.condition === 'Needs Repair' ? (darkMode ? 'bg-orange-900/50 text-orange-400' : 'bg-orange-100 text-orange-700') : (darkMode ? 'bg-red-900/50 text-red-400' : 'bg-red-100 text-red-700')}`}>
                                  {eq.condition}
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                {!isOwner && <button onClick={()=>handleDelete('equipment', eq.id, setEquipment, equipment)} className={`p-2 rounded ${darkMode ? 'hover:bg-red-900/50 text-red-400' : 'hover:bg-red-100 text-red-500'}`}><Trash2 className="w-4 h-4"/></button>}
                              </td>
                            </tr>
                          ))}

                          {/* TEAM TABLE */}
                          {activeTab === 'team' && team.map(m => (
                            <tr key={m.id} className={`border-b ${darkMode ? 'border-slate-700 hover:bg-slate-700/50' : 'border-gray-100 hover:bg-gray-50'}`}>
                              <td className={`p-4 font-bold ${darkMode ? 'text-blue-400' : 'text-blue-800'}`}>{m.full_name} <br/><span className={`text-xs font-normal ${darkMode ? 'text-slate-500' : 'text-gray-500'}`}>{m.role}</span></td>
                              <td className={`p-4 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>{m.phone || '-'}</td>
                              <td className={`p-4 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>{m.bank_details || '-'}</td>
                              <td className="p-4 text-right">
                                {!isOwner && <button onClick={()=>handleDelete('team_members', m.id, setTeam, team)} className={`p-2 rounded ${darkMode ? 'hover:bg-red-900/50 text-red-400' : 'hover:bg-red-100 text-red-500'}`}><Trash2 className="w-4 h-4"/></button>}
                              </td>
                            </tr>
                          ))}

                          {/* DETAILED EXPENSES TABLE */}
                          {activeTab === 'expenses' && expenses.map(e => {
                            const relatedEvent = events.find(ev => ev.id === e.event_id);
                            return (
                              <tr key={e.id} className={`border-b ${darkMode ? 'border-slate-700 hover:bg-slate-700/50' : 'border-gray-100 hover:bg-gray-50'}`}>
                                <td className="p-4">
                                  <div className={`font-bold ${darkMode ? 'text-slate-200' : 'text-gray-900'}`}>{e.category}</div>
                                  <div className={`text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>{e.description || 'No description'}</div>
                                </td>
                                <td className="p-4">
                                  <div className="flex items-center space-x-1.5">
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${darkMode ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-50 text-blue-700'}`}>
                                      {relatedEvent ? relatedEvent.title : 'General Match'}
                                    </span>
                                  </div>
                                  <div className={`text-xs mt-1 ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                                    {formatDate(e.created_at || (relatedEvent ? relatedEvent.event_date : null))}
                                  </div>
                                </td>
                                <td className="p-4 text-red-500 font-bold text-base">
                                  -{formatCurrency(e.amount)}
                                </td>
                                <td className="p-4 text-right">
                                  {!isOwner && <button onClick={()=>handleDelete('expenses', e.id, setExpenses, expenses)} className={`p-2 rounded ${darkMode ? 'hover:bg-red-900/50 text-red-400' : 'hover:bg-red-100 text-red-500'}`}><Trash2 className="w-4 h-4"/></button>}
                                </td>
                              </tr>
                            );
                          })}

                          {/* DETAILED SALARIES TABLE */}
                          {activeTab === 'salaries' && salaries.map(e => {
                            const relatedEvent = events.find(ev => ev.id === e.event_id);
                            return (
                              <tr key={e.id} className={`border-b ${darkMode ? 'border-slate-700 hover:bg-slate-700/50' : 'border-gray-100 hover:bg-gray-50'}`}>
                                <td className="p-4">
                                  <div className={`font-bold ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>{e.person_name}</div>
                                </td>
                                <td className="p-4">
                                  <div className="flex items-center space-x-1.5">
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${darkMode ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-50 text-blue-700'}`}>
                                      {relatedEvent ? relatedEvent.title : 'General Match'}
                                    </span>
                                  </div>
                                  <div className={`text-xs mt-1 ${darkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                                    {formatDate(e.created_at || (relatedEvent ? relatedEvent.event_date : null))}
                                  </div>
                                </td>
                                <td className={`p-4 font-bold text-base ${darkMode ? 'text-slate-200' : 'text-gray-900'}`}>
                                  {formatCurrency(e.amount)}
                                </td>
                                <td className="p-4 text-right">
                                  {!isOwner && <button onClick={()=>handleDelete('salaries', e.id, setSalaries, salaries)} className={`p-2 rounded ${darkMode ? 'hover:bg-red-900/50 text-red-400' : 'hover:bg-red-100 text-red-500'}`}><Trash2 className="w-4 h-4"/></button>}
                                </td>
                              </tr>
                            );
                          })}
                          
                          {/* TRANSFERS TABLE */}
                          {activeTab === 'transfers' && transfers.map(e => (
                            <tr key={e.id} className={`border-b ${darkMode ? 'border-slate-700 hover:bg-slate-700/50' : 'border-gray-100 hover:bg-gray-50'}`}>
                              <td className={`p-4 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                                {formatDate(e.transfer_date)}
                                {e.slip_url && (
                                  <div className="mt-1">
                                    <a href={e.slip_url} target="_blank" rel="noreferrer" className={`flex items-center text-xs font-bold ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}>
                                      <ExternalLink className="w-3 h-3 mr-1"/> View Slip
                                    </a>
                                  </div>
                                )}
                              </td>
                              <td className={`p-4 font-bold ${darkMode ? 'text-indigo-400' : 'text-indigo-700'}`}>{formatCurrency(e.amount)}</td>
                              <td className={`p-4 ${darkMode ? 'text-slate-400' : 'text-gray-600'}`}>{e.reference_note}</td>
                              <td className="p-4 text-center">
                                {e.status === 'Confirmed' ? (
                                  <span className={`px-2 py-1 rounded text-xs font-bold flex items-center justify-center w-max ${darkMode ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-700'}`}><CheckCircle className="w-3 h-3 mr-1"/> Confirmed</span>
                                ) : (
                                  <span className={`px-2 py-1 rounded text-xs font-bold ${darkMode ? 'bg-yellow-900/50 text-yellow-400' : 'bg-yellow-100 text-yellow-700'}`}>Pending</span>
                                )}
                              </td>
                              <td className="p-4 text-right flex justify-end space-x-2">
                                {isOwner && e.status !== 'Confirmed' && (
                                  <button onClick={() => handleConfirmTransfer(e.id)} className="px-3 py-1 bg-green-600 text-white rounded text-xs font-bold hover:bg-green-700 transition">
                                    Confirm Receipt
                                  </button>
                                )}
                                {!isOwner && <button onClick={()=>handleDelete('owner_transfers', e.id, setTransfers, transfers)} className={`p-2 rounded ${darkMode ? 'hover:bg-red-900/50 text-red-400' : 'hover:bg-red-100 text-red-500'}`}><Trash2 className="w-4 h-4"/></button>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                     </table>
                   </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* CUSTOM POPUP OVERLAY */}
        {popup.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 print:hidden">
            <div className={`w-full max-w-sm p-6 rounded-2xl shadow-2xl transform transition-all scale-100 ${darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-gray-100'}`}>
              <div className="flex flex-col items-center text-center">
                {popup.type === 'success' && <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-4"><CheckCircle className="w-8 h-8 text-green-600"/></div>}
                {popup.type === 'error' && <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-4"><AlertCircle className="w-8 h-8 text-red-600"/></div>}
                {popup.type === 'confirm' && <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mb-4"><Info className="w-8 h-8 text-blue-600"/></div>}
                
                <h3 className={`text-xl font-black mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {popup.type === 'success' ? 'Success!' : popup.type === 'error' ? 'Oops! Error' : 'Please Confirm'}
                </h3>
                <p className={`text-sm mb-6 ${darkMode ? 'text-slate-300' : 'text-gray-600'}`}>{popup.message}</p>
                
                <div className="flex space-x-3 w-full">
                  {popup.type === 'confirm' ? (
                    <>
                      <button onClick={() => setPopup({ show: false, message: '', type: 'success', onConfirm: null })} className={`flex-1 py-2.5 rounded-lg font-bold transition ${darkMode ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}>Cancel</button>
                      <button onClick={() => { popup.onConfirm(); setPopup({ show: false, message: '', type: 'success', onConfirm: null }); }} className="flex-1 py-2.5 rounded-lg font-bold bg-blue-600 hover:bg-blue-700 text-white transition shadow-md">Confirm</button>
                    </>
                  ) : (
                    <button onClick={() => setPopup({ show: false, message: '', type: 'success', onConfirm: null })} className="w-full py-2.5 rounded-lg font-bold bg-blue-600 hover:bg-blue-700 text-white transition shadow-md">OK, Got it!</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;