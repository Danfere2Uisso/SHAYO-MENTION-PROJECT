import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Phone,
  Mail,
  Building,
  Shield,
  CreditCard,
  Target,
  Clock,
  Briefcase,
  X,
  Check,
  Filter,
  DollarSign,
  Calendar,
  Printer,
  History,
  Eye,
  Radio as RadioIcon,
  FileSpreadsheet,
} from 'lucide-react';
import { useRadioApp } from '../context/RadioAppContext';
import { Client, ClientTier, BillingStatus, Campaign, AdMention, ScheduledSpotItem } from '../types';
import { ClientTimetableReportModal } from './ClientTimetableReportModal';

interface ClientManagerProps {
  onSelectClientForCampaign?: (client: Client) => void;
  onCreateCampaignForClient?: (clientId: string) => void;
}

export const ClientManager: React.FC<ClientManagerProps> = ({
  onSelectClientForCampaign,
  onCreateCampaignForClient,
}) => {
  const { clients, campaigns, ads, addClient, updateClient, deleteClient, language, t } = useRadioApp();

  const handleCreateCampaign = (client: Client) => {
    if (onSelectClientForCampaign) {
      onSelectClientForCampaign(client);
    } else if (onCreateCampaignForClient) {
      onCreateCampaignForClient(client.id);
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Client Directory & Ad History View State
  const [viewHistoryClient, setViewHistoryClient] = useState<Client | null>(null);

  // Client Timetable Report Modal State
  const [reportModalState, setReportModalState] = useState<{
    isOpen: boolean;
    client: Client | null;
    campaign?: Campaign;
    adMention?: AdMention;
    spots?: ScheduledSpotItem[];
  }>({
    isOpen: false,
    client: null,
  });

  // Form fields
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('Telecommunications');
  const [tier, setTier] = useState<ClientTier>('B');
  const [billingStatus, setBillingStatus] = useState<BillingStatus>('pending');
  const [targetAudience, setTargetAudience] = useState('');
  const [preferredTimeSlots, setPreferredTimeSlots] = useState('');
  const [budgetTier, setBudgetTier] = useState('TZS 1M - 5M');
  const [rateCardCode, setRateCardCode] = useState('PRIME-A1');
  const [notes, setNotes] = useState('');

  const categories = [
    'Telecommunications',
    'Banking & Finance',
    'Health Campaign',
    'Building & Construction',
    'Agriculture & Industry',
    'Food & Beverages',
    'Sports & Gaming',
    'Humanitarian & Community',
    'Education & Schools',
    'Government & Public Notices',
  ];

  const resetForm = () => {
    setName('');
    setCompany('');
    setContactPerson('');
    setPhone('');
    setEmail('');
    setCategory('Telecommunications');
    setTier('B');
    setBillingStatus('pending');
    setTargetAudience('');
    setPreferredTimeSlots('');
    setBudgetTier('TZS 1M - 5M');
    setRateCardCode('PRIME-A1');
    setNotes('');
    setEditingClient(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (client: Client) => {
    setEditingClient(client);
    setName(client.name);
    setCompany(client.company || '');
    setContactPerson(client.contactPerson);
    setPhone(client.phone);
    setEmail(client.email);
    setCategory(client.category);
    setTier(client.tier || 'B');
    setBillingStatus(client.billingStatus || 'pending');
    setTargetAudience(client.targetAudience || '');
    setPreferredTimeSlots((client.preferredTimeSlots || []).join(', '));
    setBudgetTier(client.budgetTier || 'TZS 1M - 5M');
    setRateCardCode(client.rateCardCode || 'PRIME-A1');
    setNotes(client.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const slotsArr = preferredTimeSlots
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingClient) {
      updateClient(editingClient.id, {
        name,
        company,
        contactPerson,
        phone,
        email,
        category,
        tier,
        billingStatus,
        targetAudience,
        preferredTimeSlots: slotsArr,
        budgetTier,
        rateCardCode,
        notes,
      });
    } else {
      addClient({
        name,
        company,
        contactPerson,
        phone,
        email,
        category,
        tier,
        billingStatus,
        targetAudience,
        preferredTimeSlots: slotsArr,
        budgetTier,
        rateCardCode,
        notes,
      });
    }

    setIsModalOpen(false);
    resetForm();
  };

  const handleDelete = (id: string, clientName: string) => {
    if (window.confirm(`Je, una uhakika unataka kufuta mteja "${clientName}" kutoka saraka?`)) {
      deleteClient(id);
    }
  };

  // Filtered clients
  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const q = searchQuery.toLowerCase();
      const matchQuery =
        c.name.toLowerCase().includes(q) ||
        (c.company && c.company.toLowerCase().includes(q)) ||
        c.contactPerson.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.email.toLowerCase().includes(q);

      const matchTier = tierFilter === 'all' || c.tier === tierFilter;
      const matchStatus = statusFilter === 'all' || c.billingStatus === statusFilter;
      const matchCategory = categoryFilter === 'all' || c.category === categoryFilter;

      return matchQuery && matchTier && matchStatus && matchCategory;
    });
  }, [clients, searchQuery, tierFilter, statusFilter, categoryFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = clients.length;
    const tierA = clients.filter((c) => c.tier === 'A').length;
    const pendingBilling = clients.filter((c) => c.billingStatus === 'pending' || c.billingStatus === 'overdue').length;
    const activeCampaigns = clients.reduce((sum, c) => sum + (c.activeCampaigns || 0), 0);
    return { total, tierA, pendingBilling, activeCampaigns };
  }, [clients]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-xs">
          <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
            <Users className="w-3.5 h-3.5 text-blue-400" />
            {language === 'sw' ? 'Jumla ya Wateja' : 'Total Clients'}
          </div>
          <div className="text-2xl font-bold text-white">{stats.total}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            {language === 'sw' ? 'Kwenye kanzidata rasmi' : 'In master CRM directory'}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-xs">
          <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            {language === 'sw' ? 'Wateja wa Tier A (VIP)' : 'Tier A Clients (VIP)'}
          </div>
          <div className="text-2xl font-bold text-amber-400">{stats.tierA}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            {language === 'sw' ? 'Makampuni makubwa ya kitaifa' : 'National corporate partners'}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-xs">
          <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            {language === 'sw' ? 'Kampeni Zinazoruka' : 'Active Campaigns'}
          </div>
          <div className="text-2xl font-bold text-emerald-400">{stats.activeCampaigns}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            {language === 'sw' ? 'Matangazo hewani sasa' : 'Currently broadcasting'}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-xs">
          <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
            <CreditCard className="w-3.5 h-3.5 text-red-400" />
            {language === 'sw' ? 'Malipo Yanayosubiriwa' : 'Pending Invoices'}
          </div>
          <div className="text-2xl font-bold text-red-400">{stats.pendingBilling}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            {language === 'sw' ? 'Ankara zinazosubiri malipo' : 'Pending / overdue billing'}
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Filters & Add Button */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={
              language === 'sw'
                ? 'Tafuta mteja, kampuni, mtu wa mawasiliano, simu...'
                : 'Search client, company, contact person, phone...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 text-slate-100 placeholder-slate-500 text-xs rounded-lg pl-9 pr-3 py-2 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {/* Tier Filter */}
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="all">{language === 'sw' ? 'Ngazi Zote (All Tiers)' : 'All Tiers'}</option>
            <option value="A">Tier A (National / Corporate)</option>
            <option value="B">Tier B (Medium Regional)</option>
            <option value="C">Tier C (Local Small Biz)</option>
            <option value="D">Tier D (Community / NGO)</option>
          </select>

          {/* Billing Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="all">{language === 'sw' ? 'Hali ya Bili Zote' : 'All Billing Statuses'}</option>
            <option value="paid">{language === 'sw' ? 'Imelipwa (Paid)' : 'Paid'}</option>
            <option value="partially_paid">{language === 'sw' ? 'Nusu (Partially Paid)' : 'Partially Paid'}</option>
            <option value="pending">{language === 'sw' ? 'Inasubiri (Pending)' : 'Pending'}</option>
            <option value="overdue">{language === 'sw' ? 'Imechelewa (Overdue)' : 'Overdue'}</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none max-w-[150px]"
          >
            <option value="all">{language === 'sw' ? 'Sekta Zote' : 'All Categories'}</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Add New Client Button */}
          <button
            type="button"
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'sw' ? 'Sajili Mteja Mpya' : 'Add New Client'}</span>
          </button>
        </div>
      </div>

      {/* Clients Table / Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">{language === 'sw' ? 'Mteja / Kampuni' : 'Client / Company'}</th>
                <th className="py-3 px-4">{language === 'sw' ? 'Sekta & Ngazi' : 'Category & Tier'}</th>
                <th className="py-3 px-4">{language === 'sw' ? 'Mawasiliano' : 'Contact Person'}</th>
                <th className="py-3 px-4">{language === 'sw' ? 'Hali ya Bili' : 'Billing Status'}</th>
                <th className="py-3 px-4">{language === 'sw' ? 'Bajeti & Hadhira' : 'Budget & Target'}</th>
                <th className="py-3 px-4 text-center">{language === 'sw' ? 'Kampeni' : 'Campaigns'}</th>
                <th className="py-3 px-4 text-right">{language === 'sw' ? 'Vitendo' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300 font-sans">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 italic">
                    {language === 'sw'
                      ? 'Hakuna mteja aliyepatikana kwa vigezo hivi.'
                      : 'No clients found matching selected filters.'}
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => {
                  const tierColors: { [key: string]: string } = {
                    A: 'bg-amber-950/70 text-amber-300 border-amber-700',
                    B: 'bg-blue-950/70 text-blue-300 border-blue-700',
                    C: 'bg-emerald-950/70 text-emerald-300 border-emerald-700',
                    D: 'bg-purple-950/70 text-purple-300 border-purple-700',
                  };

                  const billingColors: { [key: string]: string } = {
                    paid: 'bg-emerald-950 text-emerald-300 border-emerald-700',
                    partially_paid: 'bg-amber-950 text-amber-300 border-amber-700',
                    pending: 'bg-slate-800 text-slate-300 border-slate-700',
                    overdue: 'bg-red-950 text-red-300 border-red-700 animate-pulse',
                  };

                  return (
                    <tr key={client.id} className="hover:bg-slate-850/50 transition">
                      {/* Name & Company */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-white text-sm">{client.name}</div>
                        {client.company && (
                          <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Building className="w-3 h-3 text-slate-500" />
                            {client.company}
                          </div>
                        )}
                      </td>

                      {/* Category & Tier */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-200">{client.category}</div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                              tierColors[client.tier || 'B']
                            }`}
                          >
                            Tier {client.tier || 'B'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {client.rateCardCode || 'PRIME-A1'}
                          </span>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-3 px-4 space-y-1">
                        <div className="text-slate-200 font-medium">{client.contactPerson}</div>
                        <div className="text-slate-400 flex items-center gap-1 text-[11px]">
                          <Phone className="w-3 h-3 text-emerald-400" />
                          <span>{client.phone}</span>
                        </div>
                        <div className="text-slate-400 flex items-center gap-1 text-[11px]">
                          <Mail className="w-3 h-3 text-blue-400" />
                          <span>{client.email}</span>
                        </div>
                      </td>

                      {/* Billing Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                            billingColors[client.billingStatus || 'pending']
                          }`}
                        >
                          {client.billingStatus === 'paid'
                            ? (language === 'sw' ? 'Imelipwa (Paid)' : 'Paid')
                            : client.billingStatus === 'partially_paid'
                            ? (language === 'sw' ? 'Imelipwa Nusu' : 'Partially Paid')
                            : client.billingStatus === 'overdue'
                            ? (language === 'sw' ? 'Imechelewa (Overdue)' : 'Overdue')
                            : (language === 'sw' ? 'Inasubiri (Pending)' : 'Pending')}
                        </span>
                        {client.notes && (
                          <div className="text-[10px] text-slate-500 mt-1 truncate max-w-[140px]" title={client.notes}>
                            {client.notes}
                          </div>
                        )}
                      </td>

                      {/* Budget Tier & Preferred Times */}
                      <td className="py-3 px-4">
                        <div className="text-slate-200 font-mono text-[11px]">{client.budgetTier || 'TZS 1M - 5M'}</div>
                        {client.targetAudience && (
                          <div
                            className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[150px]"
                            title={client.targetAudience}
                          >
                            {language === 'sw' ? 'Hadhira:' : 'Audience:'} {client.targetAudience}
                          </div>
                        )}
                      </td>

                      {/* Active Campaigns */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setViewHistoryClient(client)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-indigo-300 font-bold font-mono border border-slate-700 hover:border-indigo-500 transition cursor-pointer"
                          title={language === 'sw' ? 'Tazama historia ya matangazo ya mteja huyu' : 'View ad history for this client'}
                        >
                          {client.activeCampaigns || 0}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Client Directory & Ad History Button */}
                          <button
                            type="button"
                            onClick={() => setViewHistoryClient(client)}
                            className="flex items-center gap-1 px-2 py-1 rounded bg-indigo-950/70 hover:bg-indigo-900/90 text-indigo-300 hover:text-white border border-indigo-700/60 text-[11px] font-semibold transition cursor-pointer"
                            title={language === 'sw' ? 'Tazama historia ya kampeni & chapisha ratiba' : 'View campaign history & print timetable'}
                          >
                            <History className="w-3.5 h-3.5 text-indigo-400" />
                            <span className="hidden sm:inline">{language === 'sw' ? 'Historia & Ads' : 'History & Ads'}</span>
                          </button>

                          {(onSelectClientForCampaign || onCreateCampaignForClient) && (
                            <button
                              type="button"
                              onClick={() => handleCreateCampaign(client)}
                              className="px-2 py-1 rounded bg-blue-600/80 hover:bg-blue-600 text-white font-medium text-[11px] transition shadow-xs cursor-pointer"
                              title={language === 'sw' ? 'Tengeneza kampeni mpya kwa mteja huyu' : 'Create new campaign for this client'}
                            >
                              + {language === 'sw' ? 'Kampeni' : 'Campaign'}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(client)}
                            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
                            title={language === 'sw' ? 'Hariri mteja' : 'Edit client'}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(client.id, client.name)}
                            className="p-1.5 rounded hover:bg-red-950/60 text-slate-400 hover:text-red-400 transition"
                            title={language === 'sw' ? 'Futa mteja' : 'Delete client'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add or Edit Client */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-red-500" />
                {editingClient
                  ? (language === 'sw' ? `Hariri Taarifa za ${editingClient.name}` : `Edit Client: ${editingClient.name}`)
                  : (language === 'sw' ? 'Sajili Mteja Mpya wa Kibiashara' : 'Register New Commercial Client')}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {language === 'sw' ? 'Jina la Mteja / Chapa *' : 'Client / Brand Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={language === 'sw' ? 'k.m. Vodacom Tanzania' : 'e.g. Vodacom Tanzania'}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {language === 'sw' ? 'Jina la Kampuni (Legal Entity)' : 'Company Legal Entity'}
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder={language === 'sw' ? 'k.m. Vodacom Tanzania Plc' : 'e.g. Vodacom Tanzania Plc'}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {language === 'sw' ? 'Sekta ya Biashara *' : 'Business Category *'}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {language === 'sw' ? 'Ngazi ya Mteja (Client Tier) *' : 'Client Tier *'}
                  </label>
                  <select
                    value={tier}
                    onChange={(e) => setTier(e.target.value as ClientTier)}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="A">Tier A - VIP / National Corporate</option>
                    <option value="B">Tier B - Regional Medium Enterprise</option>
                    <option value="C">Tier C - Local Business / Retail</option>
                    <option value="D">Tier D - NGO / Community Partner</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {language === 'sw' ? 'Mtu wa Mawasiliano *' : 'Contact Person *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder={language === 'sw' ? 'k.m. Asha Bakari' : 'e.g. Asha Bakari'}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {language === 'sw' ? 'Namba ya Simu *' : 'Phone Number *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+255 754 000 000"
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {language === 'sw' ? 'Barua Pepe (Email)' : 'Email Address'}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@kampuni.co.tz"
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {language === 'sw' ? 'Hali ya Malipo (Billing Status) *' : 'Billing Status *'}
                  </label>
                  <select
                    value={billingStatus}
                    onChange={(e) => setBillingStatus(e.target.value as BillingStatus)}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="paid">{language === 'sw' ? 'Imelipwa Kabisa (Paid)' : 'Paid in Full'}</option>
                    <option value="partially_paid">{language === 'sw' ? 'Imelipwa Nusu (Partially Paid)' : 'Partially Paid'}</option>
                    <option value="pending">{language === 'sw' ? 'Inasubiri Malipo (Pending)' : 'Pending Payment'}</option>
                    <option value="overdue">{language === 'sw' ? 'Imechelewa (Overdue)' : 'Overdue'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {language === 'sw' ? 'Kiwango cha Bajeti (Budget Tier)' : 'Budget Tier'}
                  </label>
                  <select
                    value={budgetTier}
                    onChange={(e) => setBudgetTier(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="TZS 5,000,000+">TZS 5,000,000+ (Prime Enterprise)</option>
                    <option value="TZS 1M - 5M">TZS 1,000,000 - 5,000,000 (Standard)</option>
                    <option value="TZS 500k - 1M">TZS 500,000 - 1,000,000 (Basic)</option>
                    <option value="Chini ya 500k">{language === 'sw' ? 'Chini ya TZS 500,000 (Community)' : 'Under TZS 500,000 (Community)'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Rate Card Code
                  </label>
                  <input
                    type="text"
                    value={rateCardCode}
                    onChange={(e) => setRateCardCode(e.target.value)}
                    placeholder="PRIME-A1 / STD-B1"
                    className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {language === 'sw' ? 'Muda Unaopendelewa (Preferred Time Slots - koma kutenganisha)' : 'Preferred Time Slots (comma-separated)'}
                </label>
                <input
                  type="text"
                  value={preferredTimeSlots}
                  onChange={(e) => setPreferredTimeSlots(e.target.value)}
                  placeholder="07:30 - 07:45, 13:15 - 13:30, 17:15 - 17:30"
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {language === 'sw' ? 'Hadhira Lengwa (Target Audience)' : 'Target Audience'}
                </label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder={language === 'sw' ? 'k.m. Wakulima wa kahawa, wafanyabiashara, vijana' : 'e.g. Coffee farmers, merchants, youth sports enthusiasts'}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {language === 'sw' ? 'Maelezo ya Ziada (Internal Notes)' : 'Internal Notes'}
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={language === 'sw' ? 'Maelezo yoyote kuhusu mteja, masharti maalum...' : 'Any notes regarding client, discounts, terms...'}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer"
                >
                  {t.actions.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-md transition cursor-pointer"
                >
                  {editingClient
                    ? (language === 'sw' ? 'Hifadhi Mabadiliko' : 'Save Changes')
                    : (language === 'sw' ? 'Sajili Mteja' : 'Register Client')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Client Directory & Ad History Modal */}
      {viewHistoryClient && (
        <div
          id="client-history-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
        >
          <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh] text-slate-200">
            {/* Modal Header */}
            <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/40">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>{viewHistoryClient.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800 font-mono">
                      Tier {viewHistoryClient.tier || 'B'}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-sans">
                      {viewHistoryClient.category}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    {language === 'sw'
                      ? 'Daftari la Mteja & Historia ya Matangazo na Kampeni'
                      : 'Client Directory & Commercial Broadcast History'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {(onSelectClientForCampaign || onCreateCampaignForClient) && (
                  <button
                    type="button"
                    onClick={() => {
                      const c = viewHistoryClient;
                      setViewHistoryClient(null);
                      handleCreateCampaign(c);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{language === 'sw' ? 'Kampeni Mpya' : 'New Campaign'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setViewHistoryClient(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto p-6 space-y-6">
              {/* Client Profile Details Card */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-500 block mb-1 font-semibold">
                    {language === 'sw' ? 'Mawasiliano:' : 'Contact Info:'}
                  </span>
                  <div className="font-bold text-white">{viewHistoryClient.contactPerson}</div>
                  <div className="text-slate-400 flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3 text-emerald-400" />
                    <span>{viewHistoryClient.phone}</span>
                  </div>
                  <div className="text-slate-400 flex items-center gap-1 mt-0.5">
                    <Mail className="w-3 h-3 text-blue-400" />
                    <span>{viewHistoryClient.email}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 block mb-1 font-semibold">
                    {language === 'sw' ? 'Kiwango cha Bili & Malipo:' : 'Rate Card & Billing:'}
                  </span>
                  <div className="font-mono font-bold text-emerald-400">
                    {viewHistoryClient.rateCardCode || 'PRIME-A1'}
                  </div>
                  <div className="text-slate-400 mt-0.5">
                    {language === 'sw' ? 'Hali:' : 'Status:'}{' '}
                    <span className="capitalize font-semibold text-slate-200">
                      {viewHistoryClient.billingStatus || 'pending'}
                    </span>
                  </div>
                  <div className="text-slate-400 mt-0.5">
                    {language === 'sw' ? 'Bajeti:' : 'Budget:'} {viewHistoryClient.budgetTier || 'TZS 1M - 5M'}
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 block mb-1 font-semibold">
                    {language === 'sw' ? 'Muda Unaopendekezwa & Hadhira:' : 'Preferences & Target:'}
                  </span>
                  <div className="text-slate-300">
                    {viewHistoryClient.preferredTimeSlots && viewHistoryClient.preferredTimeSlots.length > 0
                      ? viewHistoryClient.preferredTimeSlots.join(', ')
                      : '06:00 - 10:00 (Prime Morning)'}
                  </div>
                  {viewHistoryClient.targetAudience && (
                    <div className="text-slate-400 text-[11px] mt-1">
                      {language === 'sw' ? 'Walengwa:' : 'Target:'} {viewHistoryClient.targetAudience}
                    </div>
                  )}
                </div>
              </div>

              {/* Section 1: Associated Multi-Spot Campaigns */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-purple-400" />
                    <span>
                      {language === 'sw' ? 'Kampeni Zilizopangwa' : 'Scheduled Campaigns'}
                    </span>
                    <span className="text-xs font-mono text-purple-400">
                      (
                      {
                        campaigns.filter(
                          (c) =>
                            c.clientId === viewHistoryClient.id ||
                            c.clientName.toLowerCase() === viewHistoryClient.name.toLowerCase()
                        ).length
                      }
                      )
                    </span>
                  </h4>
                </div>

                {(() => {
                  const clientCampaigns = campaigns.filter(
                    (c) =>
                      c.clientId === viewHistoryClient.id ||
                      c.clientName.toLowerCase() === viewHistoryClient.name.toLowerCase()
                  );

                  if (clientCampaigns.length === 0) {
                    return (
                      <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-500">
                        {language === 'sw'
                          ? 'Hakuna kampeni za matangazo zilizorekodiwa kwa mteja huyu bado.'
                          : 'No commercial campaigns recorded for this client yet.'}
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-2">
                      {clientCampaigns.map((camp) => {
                        const spotCount = camp.scheduledSpots?.length || camp.totalSpots || 0;
                        return (
                          <div
                            key={camp.id}
                            className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-white">{camp.name}</span>
                                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                                  {camp.durationSec || 45}s • {camp.type || 'Commercial'}
                                </span>
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                                  {spotCount} spots
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-400 flex items-center gap-3">
                                <span>
                                  {language === 'sw' ? 'Kipindi:' : 'Period:'} {camp.startDate} - {camp.endDate}
                                </span>
                                {camp.totalBudgetTzs && (
                                  <>
                                    <span>•</span>
                                    <span className="text-emerald-400 font-mono font-semibold">
                                      TZS {camp.totalBudgetTzs.toLocaleString()}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Print Timetable Action Button */}
                            <div className="shrink-0 flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setReportModalState({
                                    isOpen: true,
                                    client: viewHistoryClient,
                                    campaign: camp,
                                    spots: camp.scheduledSpots || [],
                                  })
                                }
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                <span>{language === 'sw' ? 'Chapisha Ratiba' : 'Print Timetable'}</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* Section 2: Studio Live Mentions & Spots */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                    <RadioIcon className="w-4 h-4 text-red-400" />
                    <span>
                      {language === 'sw' ? 'Matangazo ya Studio (Live Mentions)' : 'Studio Live Mentions & Spots'}
                    </span>
                    <span className="text-xs font-mono text-red-400">
                      (
                      {
                        ads.filter(
                          (a) => a.clientName.toLowerCase() === viewHistoryClient.name.toLowerCase()
                        ).length
                      }
                      )
                    </span>
                  </h4>
                </div>

                {(() => {
                  const clientAds = ads.filter(
                    (a) => a.clientName.toLowerCase() === viewHistoryClient.name.toLowerCase()
                  );

                  if (clientAds.length === 0) {
                    return (
                      <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-500">
                        {language === 'sw'
                          ? 'Hakuna matangazo ya papo hapo yaliyosajiliwa kwa mteja huyu.'
                          : 'No live mentions currently active for this client.'}
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-2">
                      {clientAds.map((ad) => (
                        <div
                          key={ad.id}
                          className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-white">{ad.campaignTitle}</span>
                              <span className="text-xs font-mono text-blue-400 bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-900">
                                {ad.scheduledTime}
                              </span>
                              <span className="text-xs font-medium text-slate-300">
                                {ad.programName}
                              </span>
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                                {ad.adType}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 line-clamp-1 italic">
                              "{ad.scriptText}"
                            </div>
                          </div>

                          <div className="shrink-0 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setReportModalState({
                                  isOpen: true,
                                  client: viewHistoryClient,
                                  adMention: ad,
                                })
                              }
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold transition cursor-pointer"
                            >
                              <Printer className="w-3.5 h-3.5 text-blue-400" />
                              <span>{language === 'sw' ? 'Chapisha Ratiba' : 'Print Timetable'}</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>
                {language === 'sw'
                  ? 'Kituo cha Mawasiliano: +255 739 030 333 / +255 743 872 983'
                  : 'Contact Sales: +255 739 030 333 / +255 743 872 983'}
              </span>
              <button
                type="button"
                onClick={() => setViewHistoryClient(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold cursor-pointer"
              >
                {language === 'sw' ? 'Funga' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Client Timetable Report Modal */}
      {reportModalState.isOpen && reportModalState.client && (
        <ClientTimetableReportModal
          isOpen={reportModalState.isOpen}
          onClose={() =>
            setReportModalState({
              isOpen: false,
              client: null,
            })
          }
          client={reportModalState.client}
          campaign={reportModalState.campaign}
          adMention={reportModalState.adMention}
          spots={reportModalState.spots}
        />
      )}
    </div>
  );
};
