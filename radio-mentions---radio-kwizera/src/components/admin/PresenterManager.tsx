import React, { useState } from 'react';
import { useRadioApp } from '../../context/RadioAppContext';
import {
  Users,
  UserPlus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Radio,
  Mic,
  ShieldCheck,
  Search,
} from 'lucide-react';

export const PresenterManager: React.FC = () => {
  const {
    presentersList,
    addPresenter,
    deletePresenter,
    selectedPresenter,
    setSelectedPresenter,
    ads,
    language,
  } = useRadioApp();

  const [newName, setNewName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) {
      setFeedback({
        type: 'error',
        message: language === 'sw' ? 'Tafadhali andika jina la mtangazaji.' : 'Please enter a presenter name.',
      });
      return;
    }

    if (presentersList.some((p) => p.toLowerCase() === trimmed.toLowerCase())) {
      setFeedback({
        type: 'error',
        message: language === 'sw' ? 'Mtangazaji huyu tayari yupo kwenye orodha.' : 'Presenter already exists in the list.',
      });
      return;
    }

    addPresenter(trimmed);
    setNewName('');
    setFeedback({
      type: 'success',
      message: language === 'sw' ? `Mtangazaji "${trimmed}" ameongezwa kikamilifu!` : `Presenter "${trimmed}" added successfully!`,
    });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleDelete = (name: string) => {
    if (window.confirm(
      language === 'sw'
        ? `Je, una uhakika unataka kumfuta mtangazaji "${name}"?`
        : `Are you sure you want to remove presenter "${name}"?`
    )) {
      deletePresenter(name);
      setFeedback({
        type: 'success',
        message: language === 'sw' ? `Mtangazaji "${name}" amefutwa.` : `Presenter "${name}" removed.`,
      });
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleSeedDefaults = () => {
    const defaults = ['Aloyce Ndunguru', 'Devotha Mwombeki', 'Emmanuel Ntiruhungwa', 'Regina Rutashobya'];
    defaults.forEach((name) => {
      if (!presentersList.includes(name)) {
        addPresenter(name);
      }
    });
    setFeedback({
      type: 'success',
      message: language === 'sw' ? 'Watangazaji wa kiwango cha Radio Kwizera wameongezwa.' : 'Standard Radio Kwizera presenters added.',
    });
    setTimeout(() => setFeedback(null), 3000);
  };

  // Count signed ads per presenter
  const getSignCount = (presenterName: string) => {
    let count = 0;
    ads.forEach((ad) => {
      if (ad.checkIns) {
        ad.checkIns.forEach((ci) => {
          if (ci.signedBy?.toLowerCase() === presenterName.toLowerCase()) {
            count++;
          }
        });
      }
    });
    return count;
  };

  const filteredList = presentersList.filter((p) =>
    p.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-950/80 border border-purple-700 flex items-center justify-center text-purple-400 shrink-0">
            <Mic className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <span>{language === 'sw' ? 'Usimamizi wa Watangazaji' : 'Presenter Management'}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 font-mono">
                {presentersList.length}
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {language === 'sw'
                ? 'Ongeza na dhibiti watangazaji watakaoonekana kwenye orodha ya kusaini matangazo studioni (Presenter Sign-Off).'
                : 'Add and manage presenters authorized to sign off commercial ads in the on-air studio.'}
            </p>
          </div>
        </div>

        {presentersList.length === 0 && (
          <button
            type="button"
            onClick={handleSeedDefaults}
            className="px-4 py-2 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-700 text-xs font-bold transition flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            <span>{language === 'sw' ? 'Weka Watangazaji wa Msingi' : 'Add Default Presenters'}</span>
          </button>
        )}
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300'
              : 'bg-red-950/80 border-red-700 text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Add New Presenter Form */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-emerald-400" />
          <span>{language === 'sw' ? 'Sajili Mtangazaji Mpya' : 'Register New Presenter'}</span>
        </h3>

        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={language === 'sw' ? 'Jina Kamili la Mtangazaji (k.m. Aloyce Ndunguru)' : 'Presenter Full Name (e.g. Aloyce Ndunguru)'}
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
          />
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-500 hover:to-purple-500 text-white text-xs font-black uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>{language === 'sw' ? 'Ongeza Mtangazaji' : 'Add Presenter'}</span>
          </button>
        </form>
      </div>

      {/* Presenters Table / Cards */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" />
            <span className="font-bold text-sm text-white">
              {language === 'sw' ? 'Orodha ya Watangazaji Walioidhinishwa' : 'Authorized Presenters List'}
            </span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'sw' ? 'Tafuta mtangazaji...' : 'Search presenter...'}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {filteredList.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-semibold">
              {language === 'sw' ? 'Hakuna watangazaji waliosajiliwa.' : 'No presenters registered yet.'}
            </p>
            <p className="text-xs text-slate-600 mt-1">
              {language === 'sw' ? 'Tumia fomu hapo juu kuongeza mtangazaji wa kwanza.' : 'Use the form above to add your first presenter.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {filteredList.map((presenter, idx) => {
              const signCount = getSignCount(presenter);
              const isDefaultSelected = selectedPresenter === presenter;

              return (
                <div
                  key={presenter}
                  className="p-4 flex items-center justify-between gap-4 hover:bg-slate-850/50 transition"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center text-purple-300 font-black text-sm shrink-0 shadow-inner">
                      {presenter.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-white truncate">{presenter}</span>
                        {isDefaultSelected && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800">
                            {language === 'sw' ? 'Kwenye Dawati Sasa' : 'Current Studio Default'}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                        <span className="text-emerald-400 flex items-center gap-1 font-mono">
                          <CheckCircle2 className="w-3 h-3" />
                          {signCount} {language === 'sw' ? 'matangazo yalisainiwa' : 'ads signed'}
                        </span>
                        <span>•</span>
                        <span className="text-slate-500 font-mono">ID: kwz-pre-00{idx + 1}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setSelectedPresenter(presenter)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        isDefaultSelected
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                      }`}
                      title="Set as active presenter for studio tablet"
                    >
                      {isDefaultSelected
                        ? (language === 'sw' ? 'Imechaguliwa' : 'Selected')
                        : (language === 'sw' ? 'Weka Studioni' : 'Set Active')}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(presenter)}
                      className="p-2 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-400 border border-red-800/80 transition cursor-pointer"
                      title={`Remove ${presenter}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
