import React, { useState } from 'react';
import { 
  ArrowRight, 
  ArrowLeft, 
  Users, 
  Layout, 
  Globe, 
  MessageSquare, 
  Sparkles, 
  Check, 
  Sliders
} from 'lucide-react';
import type { SourceOfTruth, GeneratedContent } from '../types';
import { 
  orchestrationService, 
  ROLES, 
  FORMATS, 
  LANGUAGES, 
  CHANNELS 
} from '../services/orchestrationService';
import { generationService } from '../services/generationService';

interface Props {
  sourceOfTruth: SourceOfTruth;
  setGeneratedContents: (contents: GeneratedContent[]) => void;
  onNext: () => void;
  onBack: () => void;
  isDemoMode: boolean;
}

export default function Orchestrator({ 
  sourceOfTruth, 
  setGeneratedContents, 
  onNext, 
  onBack,
  isDemoMode
}: Props) {
  // Pre-select recommended demo suite
  const [selectedRoles, setSelectedRoles] = useState<string[]>(['Citizen', 'Field Officer', 'Senior Official']);
  const [selectedFormats, setSelectedFormats] = useState<string[]>(['Public Advisory', 'Action Checklist', 'Executive Summary']);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['English', 'Tamil']);
  const [selectedChannels, setSelectedChannels] = useState<string[]>(['WhatsApp', 'Dashboard']);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('ORCHESTRATING COMMUNICATION...');

  const toggleItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    setter(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const applyPreset = (presetId: string) => {
    const preset = orchestrationService.getPresets().find(p => p.id === presetId);
    if (!preset) return;
    setSelectedRoles(preset.roles);
    setSelectedFormats(preset.formats);
    setSelectedLanguages(preset.languages);
    setSelectedChannels(preset.channels);
  };

  const handleGenerate = async () => {
    if (!selectedRoles.length || !selectedFormats.length || !selectedLanguages.length || !selectedChannels.length) {
      alert('Please select at least one Role, Format, Language, and Channel.');
      return;
    }

    setLoading(true);
    setLoadingMsg('ORCHESTRATING COMMUNICATION...');
    
    setTimeout(() => {
      setLoadingMsg('GENERATING OUTPUT...');
    }, 400);

    try {
      const results = await generationService.generate(
        sourceOfTruth,
        selectedRoles,
        selectedFormats,
        selectedLanguages,
        selectedChannels,
        isDemoMode
      );
      setGeneratedContents(results);
      onNext();
    } catch {
      // Fallback seamlessly to deterministic generation
      const results = await generationService.generate(
        sourceOfTruth,
        selectedRoles,
        selectedFormats,
        selectedLanguages,
        selectedChannels,
        true
      );
      setGeneratedContents(results);
      onNext();
    } finally {
      setLoading(false);
    }
  };

  const totalCombinations = selectedRoles.length * selectedFormats.length * selectedLanguages.length * selectedChannels.length;

  const DimensionSection = ({ 
    title,
    subTitle,
    icon: Icon, 
    items, 
    selected, 
    setter
  }: {
    title: string;
    subTitle: string;
    icon: any;
    items: readonly string[];
    selected: string[];
    setter: React.Dispatch<React.SetStateAction<string[]>>;
  }) => (
    <div className="nexora-card p-5 sm:p-6 rounded-2xl border border-stone-800 bg-[#161210]">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-800">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-stone-900 border border-stone-800 text-red-500">
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-black text-white text-sm tracking-wider uppercase">{title}</h3>
            <p className="text-[11px] font-bold text-red-400 uppercase">{subTitle}</p>
          </div>
        </div>
        <span className="text-xs font-mono font-bold text-stone-400 bg-stone-900 px-2 py-0.5 rounded border border-stone-800">
          {selected.length} selected
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {items.map((item) => {
          const isSelected = selected.includes(item);
          return (
            <button
              key={item}
              onClick={() => toggleItem(setter, item)}
              className={`touch-target px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-1.5 ${
                isSelected
                  ? 'bg-red-950/90 border border-red-600 text-white shadow-sm shadow-red-950'
                  : 'bg-[#100d0b] border border-stone-800 text-stone-400 hover:border-stone-700 hover:text-stone-200'
              }`}
            >
              {isSelected && <Check className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />}
              <span>{item}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Title & Presets Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-red-500" />
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Communication Orchestrator
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-stone-400 mt-0.5">
            Role × Format × Language × Channel orchestration matrix
          </p>
        </div>

        {/* Quick Demo Presets */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-stone-400 font-bold">Presets:</span>
          {orchestrationService.getPresets().map((preset) => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset.id)}
              className="touch-target px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-700 text-xs font-bold text-stone-200 transition-colors flex items-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{preset.badge}</span>
            </button>
          ))}
        </div>
      </div>

      {/* FOUR LARGE SELECTION SECTIONS: ROLE, FORMAT, LANGUAGE, CHANNEL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <DimensionSection
          title="ROLE"
          subTitle="WHO?"
          icon={Users}
          items={ROLES}
          selected={selectedRoles}
          setter={setSelectedRoles}
        />

        <DimensionSection
          title="FORMAT"
          subTitle="WHAT?"
          icon={Layout}
          items={FORMATS}
          selected={selectedFormats}
          setter={setSelectedFormats}
        />

        <DimensionSection
          title="LANGUAGE"
          subTitle="WHICH LANGUAGE?"
          icon={Globe}
          items={LANGUAGES}
          selected={selectedLanguages}
          setter={setSelectedLanguages}
        />

        <DimensionSection
          title="CHANNEL"
          subTitle="WHERE?"
          icon={MessageSquare}
          items={CHANNELS}
          selected={selectedChannels}
          setter={setSelectedChannels}
        />
      </div>

      {/* LIVE PREVIEW BANNER */}
      <div className="p-5 rounded-2xl bg-[#171210] border border-stone-800 space-y-3 shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-stone-300 uppercase tracking-wider">
            LIVE CONFIGURATION PREVIEW
          </span>
          <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-black bg-red-950 text-red-300 border border-red-800/60">
            {totalCombinations} Packages Configured
          </span>
        </div>

        {/* Example live preview */}
        <div className="p-4 rounded-xl bg-black/50 border border-stone-800 font-mono text-xs sm:text-sm font-bold text-stone-200 flex flex-wrap items-center gap-2">
          <span className="text-red-400">{selectedRoles[0] || 'CITIZEN'}</span>
          <span className="text-stone-500">•</span>
          <span className="text-amber-400">{selectedFormats[0] || 'PUBLIC ADVISORY'}</span>
          <span className="text-stone-500">•</span>
          <span className="text-blue-400">{selectedLanguages[0] || 'TAMIL'}</span>
          <span className="text-stone-500">•</span>
          <span className="text-emerald-400">{selectedChannels[0] || 'WHATSAPP'}</span>
        </div>
      </div>

      {/* GENERATE COMMUNICATION ACTION BUTTON */}
      <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-4 pt-6 border-t border-stone-800">
        <button
          onClick={onBack}
          className="touch-target w-full sm:w-auto px-5 py-2.5 nexora-btn-secondary rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Source of Truth</span>
        </button>

        <button
          onClick={handleGenerate}
          disabled={loading || totalCombinations === 0}
          className="touch-target w-full sm:w-auto px-8 py-3.5 nexora-btn-primary rounded-xl font-black text-sm sm:text-base flex items-center justify-center space-x-2 shadow-lg shadow-red-600/30 disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
              {loadingMsg}
            </span>
          ) : (
            <>
              <span>GENERATE COMMUNICATION</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
