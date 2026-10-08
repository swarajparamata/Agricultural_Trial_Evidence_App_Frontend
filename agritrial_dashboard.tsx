import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { 
  Table, 
  GitCompare, 
  Bot, 
  Search, 
  Filter, 
  CheckSquare, 
  Square,
  FileText,
  Activity,
  X,
  MessageSquare,
  ChevronUp,
  ChevronDown,
  User
} from 'lucide-react';

const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const mockTrials = [
  { id: 'T001', crop: 'Wheat', product: 'Harvest Plus', country: 'France', year: 2022, trial_type: 'Scientific', yield_result: 5.2, unit: 't/ha', source_file: 'report_FR_2022.pdf', findings: 'Consistent yield improvement in temperate climates.' },
  { id: 'T002', crop: 'Wheat', product: 'Harvest Plus', country: 'Germany', year: 2022, trial_type: 'Scientific', yield_result: 5100, unit: 'kg/ha', source_file: 'de_wheat_Hplus_22.xlsx', findings: 'Yield equivalent to 5.1 t/ha, slight delay in maturation.' },
  { id: 'T003', crop: 'Potato', product: 'Root Boost', country: 'UK', year: 2021, trial_type: 'Commercial', yield_result: 42.5, unit: 't/ha', source_file: 'RB_UK_21_commercial.pdf', findings: 'Significant tuber size increase compared to control.' },
  { id: 'T004', crop: 'Rice', product: 'Harvest Plus', country: 'Spain', year: 2023, trial_type: 'Scientific', yield_result: 8.1, unit: 't/ha', source_file: 'spain_rice_HP_2023.csv', findings: 'Strong performance under irrigation protocols.' },
  { id: 'T005', crop: 'Wheat', product: 'Standard NPK', country: 'France', year: 2024, trial_type: 'Commercial', yield_result: 4.8, unit: 't/ha', source_file: 'std_npk_fr_24.pdf', findings: 'Baseline control data.' },
  { id: 'T006', crop: 'Potato', product: 'Root Boost', country: 'Netherlands', year: 2025, trial_type: 'Scientific', yield_result: 45000, unit: 'kg/ha', source_file: 'nld_root_25.pdf', findings: 'Excellent yield, 45 t/ha equivalent, high disease resistance.' },
  { id: 'T007', crop: 'Wheat', product: 'Harvest Plus', country: 'France', year: 2023, trial_type: 'Commercial', yield_result: 5.5, unit: 't/ha', source_file: 'fr_wheat_com_23.pdf', findings: 'Farmer reported higher than average returns.' },
  { id: 'T008', crop: 'Rice', product: 'Standard NPK', country: 'Italy', year: 2021, trial_type: 'Scientific', yield_result: 7.5, unit: 't/ha', source_file: 'it_rice_std_21.csv', findings: 'Standard baseline for Mediterranean rice.' },
  { id: 'T009', crop: 'Wheat', product: 'Harvest Plus', country: 'Poland', year: 2025, trial_type: 'Scientific', yield_result: 5.4, unit: 't/ha', source_file: 'pl_wheat_25.pdf', findings: 'Drought resistant properties observed.' },
];

const getUniqueValues = (data, key) => {
  return [...new Set(data.map(item => item[key]))].sort();
};

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        }
      } catch (err) {
        console.error("Auth init error", err);
      }
    };
    initAuth();
    
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  const [trials, setTrials] = useState(mockTrials);
  const [selectedTrials, setSelectedTrials] = useState([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  const [newTrialForm, setNewTrialForm] = useState({
    id: '', crop: '', product: '', country: '', year: new Date().getFullYear(), trial_type: 'Scientific', yield_result: '', unit: 't/ha', source_file: '', findings: ''
  });

  const crops = React.useMemo(() => getUniqueValues(trials, 'crop'), [trials]);
  const products = React.useMemo(() => getUniqueValues(trials, 'product'), [trials]);
  const countries = React.useMemo(() => getUniqueValues(trials, 'country'), [trials]);
  const years = React.useMemo(() => getUniqueValues(trials, 'year'), [trials]);
  const trialTypes = React.useMemo(() => getUniqueValues(trials, 'trial_type'), [trials]);

  // Filters State
  const [filters, setFilters] = useState({
    crop: '',
    product: '',
    country: '',
    year: '',
    trial_type: ''
  });

  // Chat/Agent State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatTab, setChatTab] = useState('chat'); // 'chat' or 'logs'
  const [chatHistory, setChatHistory] = useState([
    { role: 'model', text: 'Hello! I am your AI Evidence Agent. How can I help you analyze the trial data today?' }
  ]);
  const [agentLogs, setAgentLogs] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const chatEndRef = useRef(null);
  const logEndRef = useRef(null);

  useEffect(() => {
    if (chatTab === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, chatTab, isAgentTyping]);

  useEffect(() => {
    if (chatTab === 'logs') {
      logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [agentLogs, chatTab]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filteredTrials = trials.filter(trial => {
    return (
      (filters.crop === '' || trial.crop === filters.crop) &&
      (filters.product === '' || trial.product === filters.product) &&
      (filters.country === '' || trial.country === filters.country) &&
      (filters.year === '' || trial.year.toString() === filters.year.toString()) &&
      (filters.trial_type === '' || trial.trial_type === filters.trial_type)
    );
  });

  const toggleTrialSelection = (id) => {
    setSelectedTrials(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsAgentTyping(true);

    const newLogs = [];
    const addLog = (msg, status = 'info') => {
      const logEntry = { id: Date.now() + Math.random(), time: new Date().toLocaleTimeString(), msg, status };
      setAgentLogs(prev => [...prev, logEntry]);
    };

    addLog(`[Intent] Received request: "${userMessage.substring(0, 30)}..."`, 'processing');
    
    // Simulate AI thinking and tool calling
    await new Promise(resolve => setTimeout(resolve, 600));
    
    addLog(`[Tool] Calling search_trials(query)`, 'processing');
    await new Promise(resolve => setTimeout(resolve, 800));
    addLog(`[Tool] search_trials() Success. Retrieved contextual records.`, 'success');
    addLog(`[Agent] Formatting context for LLM generation...`, 'processing');

    try {
      const apiKey = ""; // Canvas injects API key here automatically
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;
      
      const systemPrompt = `You are a knowledgeable AI assistant for an Agricultural Trial Evidence App. 
      Answer the user's question based strictly on this JSON database: ${JSON.stringify(trials)}. 
      When answering, provide concrete numbers, handle unit discrepancies (e.g., 5100 kg/ha is 5.1 t/ha), and mention the source_file. Be concise.`;

      const payload = {
        contents: [
          ...chatHistory.map(msg => ({
            role: msg.role === 'model' ? 'model' : 'user',
            parts: [{ text: msg.text }]
          })),
          { role: 'user', parts: [{ text: userMessage }] }
        ],
        systemInstruction: { parts: [{ text: systemPrompt }] }
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (result.candidates && result.candidates[0]?.content?.parts?.[0]?.text) {
        setChatHistory(prev => [...prev, { role: 'model', text: result.candidates[0].content.parts[0].text }]);
        addLog(`[Agent] Response generated successfully.`, 'success');
      } else {
        throw new Error("Invalid response structure from Gemini API");
      }
    } catch (error) {
      console.error("API Error:", error);
      setChatHistory(prev => [...prev, { role: 'model', text: 'I encountered an error while trying to process the data. Please try again later.' }]);
      addLog(`[Error] Failed to communicate with LLM.`, 'error');
    } finally {
      setIsAgentTyping(false);
    }
  };

  const handleAddTrialSubmit = (e) => {
    e.preventDefault();
    setTrials(prev => [...prev, { 
      ...newTrialForm, 
      year: parseInt(newTrialForm.year), 
      yield_result: parseFloat(newTrialForm.yield_result) 
    }]);
    setIsAddModalOpen(false);
    setNewTrialForm({ id: '', crop: '', product: '', country: '', year: new Date().getFullYear(), trial_type: 'Scientific', yield_result: '', unit: 't/ha', source_file: '', findings: '' });
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-stone-50 text-emerald-900 font-medium">Loading AgriEvidence...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-stone-200">
          <div className="flex items-center gap-3 justify-center mb-6">
            <Activity className="text-emerald-600" size={32} />
            <h1 className="text-2xl font-bold text-stone-800 tracking-tight">AgriEvidence</h1>
          </div>
          <h2 className="text-lg font-semibold text-center text-stone-600 mb-6">
            {isSignUp ? 'Create an Account' : 'Sign in to your account'}
          </h2>
          {authError && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{authError}</div>}
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Password</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg py-2.5 font-medium transition-colors shadow-sm">
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
          </form>
          <div className="mt-6 text-center text-sm text-stone-500">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <button onClick={() => setIsSignUp(!isSignUp)} className="ml-1 text-emerald-600 font-semibold hover:underline">
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900 flex flex-col relative">
      
      {/* Header (No Sidebar) */}
      <header className="bg-emerald-900 text-white p-4 shadow-md flex justify-between items-center z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <Activity className="text-emerald-400" size={28} />
          <div>
            <h1 className="text-xl font-bold tracking-tight leading-tight">AgriEvidence</h1>
            <p className="text-emerald-400/80 text-xs">Trial Data Platform</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* User Menu Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} 
              className="p-2 rounded-full bg-emerald-800/50 text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors"
            >
              <User size={20} />
            </button>
            
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 border border-stone-200 z-50">
                <button 
                  onClick={() => setIsUserMenuOpen(false)}
                  className="block w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-emerald-50 transition-colors"
                >
                  About
                </button>
                <button 
                  onClick={() => setIsUserMenuOpen(false)}
                  className="block w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-emerald-50 transition-colors"
                >
                  My Settings
                </button>
                <div className="h-px bg-stone-100 my-1"></div>
                <button 
                  onClick={() => { setIsUserMenuOpen(false); handleLogout(); }}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full flex flex-col gap-6">
        
        {/* Filters */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-stone-200 flex flex-wrap gap-4 items-end">
          <div className="flex items-center gap-2 text-stone-800 mb-2 w-full font-semibold text-lg border-b border-stone-100 pb-2">
            <Filter size={20} className="text-emerald-600" /> Filter Trials
          </div>
          
          {[
            { label: 'Crop', key: 'crop', options: crops },
            { label: 'Product', key: 'product', options: products },
            { label: 'Country', key: 'country', options: countries },
            { label: 'Year', key: 'year', options: years },
            { label: 'Trial Type', key: 'trial_type', options: trialTypes }
          ].map(filter => (
            <div key={filter.key} className="flex flex-col min-w-[160px] flex-1">
              <label className="text-xs font-semibold text-stone-500 uppercase mb-1.5">{filter.label}</label>
              <select 
                className="bg-stone-50 border border-stone-300 text-stone-900 text-sm rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 block w-full p-2.5 outline-none transition-all cursor-pointer hover:bg-stone-100"
                value={filters[filter.key]}
                onChange={(e) => handleFilterChange(filter.key, e.target.value)}
              >
                <option value="">All {filter.label}s</option>
                {filter.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          ))}
          <button 
            onClick={() => setFilters({crop:'', product:'', country:'', year:'', trial_type:''})}
            className="ml-auto text-sm text-stone-500 hover:text-stone-800 hover:bg-stone-100 font-medium px-4 py-2.5 rounded-lg border border-transparent hover:border-stone-200 transition-all"
          >
            Reset Filters
          </button>
        </div>

        <div className="flex justify-end w-full gap-3">
          <button 
            onClick={() => setIsCompareModalOpen(true)}
            disabled={selectedTrials.length === 0}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all shadow-sm text-sm ${
              selectedTrials.length > 0 
                ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-200' 
                : 'bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200'
            }`}
          >
            <GitCompare size={18} />
            Compare Selected ({selectedTrials.length})
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-stone-800 hover:bg-stone-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-sm flex items-center gap-2 text-sm"
          >
            + Add New Trial (Admin)
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden flex-1">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-stone-600">
              <thead className="text-xs text-stone-500 uppercase bg-stone-50 border-b border-stone-200">
                <tr>
                  <th className="p-4 w-12 text-center">
                    {/* Checkbox placeholder */}
                  </th>
                  <th className="p-4 font-semibold">ID</th>
                  <th className="p-4 font-semibold">Crop</th>
                  <th className="p-4 font-semibold">Product</th>
                  <th className="p-4 font-semibold">Country</th>
                  <th className="p-4 font-semibold">Year</th>
                  <th className="p-4 font-semibold">Type</th>
                  <th className="p-4 font-semibold">Yield</th>
                  <th className="p-4 font-semibold">Source File</th>
                </tr>
              </thead>
              <tbody>
                {filteredTrials.map(trial => {
                  const isSelected = selectedTrials.includes(trial.id);
                  return (
                    <tr 
                      key={trial.id} 
                      className={`border-b border-stone-100 hover:bg-emerald-50/60 transition-colors cursor-pointer ${isSelected ? 'bg-emerald-50/40' : ''}`}
                      onClick={() => toggleTrialSelection(trial.id)}
                    >
                      <td className="p-4 text-center">
                        {isSelected ? <CheckSquare className="text-emerald-600 inline" size={20}/> : <Square className="text-stone-300 inline" size={20}/>}
                      </td>
                      <td className="p-4 font-medium text-stone-900">{trial.id}</td>
                      <td className="p-4">{trial.crop}</td>
                      <td className="p-4 font-semibold text-emerald-800">{trial.product}</td>
                      <td className="p-4">{trial.country}</td>
                      <td className="p-4">{trial.year}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                          trial.trial_type === 'Scientific' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-orange-50 text-orange-700 border-orange-200'
                        }`}>
                          {trial.trial_type}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-medium text-stone-800">
                        {trial.yield_result} <span className="text-stone-400 text-xs">{trial.unit}</span>
                      </td>
                      <td className="p-4 flex items-center gap-2 text-stone-500 text-xs">
                        <FileText size={14} className="text-emerald-600/60" /> {trial.source_file}
                      </td>
                    </tr>
                  )
                })}
                {filteredTrials.length === 0 && (
                  <tr>
                    <td colSpan="9" className="p-12 text-center text-stone-500 bg-stone-50">
                      <Search className="mx-auto mb-3 text-stone-300" size={32} />
                      <p className="font-medium text-stone-600">No trials found matching current filters.</p>
                      <p className="text-xs mt-1">Try adjusting your filters or clearing them to see more results.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add Trial Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-stone-100 flex justify-between items-center bg-stone-50 rounded-t-2xl">
              <h2 className="text-xl font-bold text-stone-800">Add New Trial</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddTrialSubmit} className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Trial ID</label>
                  <input required type="text" value={newTrialForm.id} onChange={e => setNewTrialForm({...newTrialForm, id: e.target.value})} className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g. T010" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Crop</label>
                  <input required type="text" value={newTrialForm.crop} onChange={e => setNewTrialForm({...newTrialForm, crop: e.target.value})} className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g. Corn" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Product</label>
                  <input required type="text" value={newTrialForm.product} onChange={e => setNewTrialForm({...newTrialForm, product: e.target.value})} className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g. GrowMax" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Country</label>
                  <input required type="text" value={newTrialForm.country} onChange={e => setNewTrialForm({...newTrialForm, country: e.target.value})} className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g. USA" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Year</label>
                  <input required type="number" value={newTrialForm.year} onChange={e => setNewTrialForm({...newTrialForm, year: e.target.value})} className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="2026" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Type</label>
                  <select required value={newTrialForm.trial_type} onChange={e => setNewTrialForm({...newTrialForm, trial_type: e.target.value})} className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none">
                    <option value="Scientific">Scientific</option>
                    <option value="Commercial">Commercial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Yield</label>
                  <input required type="number" step="any" value={newTrialForm.yield_result} onChange={e => setNewTrialForm({...newTrialForm, yield_result: e.target.value})} className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g. 5.5" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Unit</label>
                  <input required type="text" value={newTrialForm.unit} onChange={e => setNewTrialForm({...newTrialForm, unit: e.target.value})} className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g. t/ha" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Source File</label>
                  <input required type="text" value={newTrialForm.source_file} onChange={e => setNewTrialForm({...newTrialForm, source_file: e.target.value})} className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="e.g. report.pdf" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-stone-500 uppercase mb-1">Findings</label>
                  <textarea required value={newTrialForm.findings} onChange={e => setNewTrialForm({...newTrialForm, findings: e.target.value})} className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Trial summary..."></textarea>
                </div>
              </div>
              <div className="pt-4 border-t border-stone-100 flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg font-medium transition-colors text-sm">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors shadow-sm text-sm">Save Trial</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isCompareModalOpen && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-stone-100 flex justify-between items-center bg-stone-50 rounded-t-2xl">
              <h2 className="text-xl font-bold text-emerald-900 flex items-center gap-2">
                <GitCompare size={22} className="text-emerald-600" />
                Trial Comparison
              </h2>
              <button 
                onClick={() => setIsCompareModalOpen(false)}
                className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-stone-100/50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {selectedTrials.map(id => {
                  const trial = trials.find(t => t.id === id);
                  if(!trial) return null;
                  return (
                    <div key={trial.id} className="bg-white p-5 rounded-xl shadow-sm border border-emerald-100 flex flex-col h-full">
                      <div className="mb-4 pb-4 border-b border-stone-100 flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">{trial.id}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${trial.trial_type === 'Scientific' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                            {trial.trial_type}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-emerald-900 leading-tight">{trial.product}</h3>
                        <p className="text-sm text-stone-500 font-medium mt-1">{trial.crop} • {trial.country} • {trial.year}</p>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
                          <p className="text-xs text-stone-500 uppercase font-semibold mb-1">Yield Result</p>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-mono font-bold text-emerald-800">{trial.yield_result}</span>
                            <span className="text-sm font-medium text-emerald-600">{trial.unit}</span>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-xs text-stone-500 uppercase font-semibold mb-1">Findings</p>
                          <p className="text-sm text-stone-700 leading-snug">{trial.findings}</p>
                        </div>

                        <div>
                          <p className="text-xs text-stone-500 uppercase font-semibold mb-1">Source</p>
                          <p className="text-sm text-blue-600 hover:underline cursor-pointer flex items-center gap-1.5 truncate">
                            <FileText size={14} className="shrink-0"/> {trial.source_file}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
        {/* Chat Window */}
        {isChatOpen && (
          <div className="bg-white w-80 sm:w-96 rounded-2xl shadow-2xl border border-stone-200 overflow-hidden mb-4 flex flex-col h-[500px] animate-in slide-in-from-bottom-5 fade-in duration-200">
            {/* Chat Header & Tabs */}
            <div className="bg-emerald-900 text-white border-b border-emerald-800">
              <div className="p-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Bot size={20} className="text-emerald-400" />
                  <span className="font-semibold">Evidence Assistant</span>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="text-emerald-400 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="flex text-sm font-medium border-t border-emerald-800/50 bg-emerald-950/30">
                <button 
                  onClick={() => setChatTab('chat')}
                  className={`flex-1 py-2 flex items-center justify-center gap-2 transition-colors ${chatTab === 'chat' ? 'bg-emerald-800 text-white' : 'text-emerald-400/80 hover:text-white'}`}
                >
                  <MessageSquare size={16} /> Chat
                </button>
                <button 
                  onClick={() => setChatTab('logs')}
                  className={`flex-1 py-2 flex items-center justify-center gap-2 transition-colors ${chatTab === 'logs' ? 'bg-emerald-800 text-white' : 'text-emerald-400/80 hover:text-white'}`}
                >
                  <Activity size={16} /> Inspection
                </button>
              </div>
            </div>

            {/* Chat Content */}
            <div className={`flex-1 flex flex-col ${chatTab !== 'chat' ? 'hidden' : ''}`}>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50">
                {chatHistory.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                      msg.role === 'user' 
                        ? 'bg-emerald-600 text-white rounded-br-sm' 
                        : 'bg-white text-stone-800 rounded-bl-sm shadow-sm border border-stone-200'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                ))}
                {isAgentTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white text-stone-500 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-stone-200 flex items-center gap-2">
                      <span className="flex space-x-1">
                        <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                        <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
                      </span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <div className="p-3 border-t border-stone-200 bg-white">
                <form onSubmit={handleSendMessage} className="relative flex items-center">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask about trials..."
                    className="w-full bg-stone-100 border-none rounded-full pl-4 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    disabled={isAgentTyping}
                  />
                  <button 
                    type="submit" 
                    disabled={isAgentTyping || !chatInput.trim()}
                    className="absolute right-1.5 p-1.5 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                  >
                    <ChevronUp size={16} />
                  </button>
                </form>
              </div>
            </div>

            {/* Agent Inspection Logs Tab */}
            <div className={`flex-1 flex flex-col bg-slate-900 ${chatTab !== 'logs' ? 'hidden' : ''}`}>
              <div className="p-2 bg-slate-950 text-slate-400 text-[10px] uppercase tracking-wider font-semibold flex justify-between items-center">
                <span>Agent Workflow Logs</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span> Active</span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs font-mono">
                {agentLogs.length === 0 ? (
                  <div className="text-slate-600 italic text-center mt-10">Waiting for agent activity...</div>
                ) : (
                  agentLogs.map((log) => (
                    <div key={log.id} className="flex gap-2 items-start border-l-2 pl-2 py-0.5" style={{
                      borderColor: log.status === 'success' ? '#10b981' : log.status === 'error' ? '#ef4444' : '#3b82f6'
                    }}>
                      <span className="text-slate-500 shrink-0">[{log.time}]</span>
                      <span className={`${
                        log.status === 'success' ? 'text-emerald-400' : 
                        log.status === 'processing' ? 'text-blue-400' : 'text-red-400'
                      } flex-1 break-words`}>
                        {log.msg}
                      </span>
                    </div>
                  ))
                )}
                <div ref={logEndRef} />
              </div>
            </div>
          </div>
        )}

        {/* Floating Toggle Button */}
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`p-4 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center ${
            isChatOpen ? 'bg-stone-800 hover:bg-stone-700 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:scale-105'
          }`}
          title="Toggle AI Agent"
        >
          {isChatOpen ? <ChevronDown size={24} /> : <Bot size={28} />}
        </button>
      </div>

    </div>
  );
}