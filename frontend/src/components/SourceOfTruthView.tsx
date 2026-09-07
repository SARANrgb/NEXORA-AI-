import { useState } from 'react';
import { 
  ArrowRight, 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  AlertTriangle, 
  CheckSquare, 
  Info, 
  ShieldCheck, 
  Plus, 
  X,
  RotateCcw
} from 'lucide-react';
import type { SourceOfTruth } from '../types';
import { sourceOfTruthService } from '../services/sourceOfTruthService';

interface Props {
  sourceOfTruth: SourceOfTruth | null;
  onNext: () => void;
  onBack: () => void;
  setSourceOfTruth: (sot: SourceOfTruth) => void;
}

export default function SourceOfTruthView({ sourceOfTruth, onNext, onBack, setSourceOfTruth }: Props) {
  const [newWarning, setNewWarning] = useState('');
  const [showAddWarning, setShowAddWarning] = useState(false);

  if (!sourceOfTruth) {
    return (
      <div className="max-w-md mx-auto text-center py-12 space-y-4">
        <p className="text-stone-400">No source of truth loaded.</p>
        <button onClick={onBack} className="px-4 py-2 nexora-btn-primary rounded-lg text-sm font-bold">
          Return to Input
        </button>
      </div>
    );
  }

  const handleReset = () => {
    setSourceOfTruth(sourceOfTruthService.getDemoSourceOfTruth());
  };

  const handleAddWarning = () => {
    if (!newWarning.trim()) return;
    setSourceOfTruth({
      ...sourceOfTruth,
      warnings: [...sourceOfTruth.warnings, newWarning.trim()]
    });
    setNewWarning('');
    setShowAddWarning(false);
  };

  const handleRemoveWarning = (index: number) => {
    setSourceOfTruth({
      ...sourceOfTruth,
      warnings: sourceOfTruth.warnings.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* 1. MAIN HEADING & AUTHORITATIVE SOURCE BADGE */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#161210] border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="px-3 py-1 bg-red-600 text-white text-xs font-black tracking-wider uppercase rounded-md shadow-sm">
              AUTHORITATIVE SOURCE
            </span>
            <span className="text-xs text-stone-400 font-mono">
              VERIFIED GROUND TRUTH
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white mt-2 tracking-tight">
            SOURCE OF TRUTH
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 mt-1 font-medium flex items-center">
            <ShieldCheck className="w-4 h-4 text-emerald-400 mr-1.5 flex-shrink-0" />
            <span>All generated content is checked against these verified facts.</span>
          </p>
        </div>

        <button
          onClick={handleReset}
          className="text-xs text-stone-400 hover:text-stone-200 flex items-center space-x-1.5 self-start sm:self-center px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-800 transition-colors"
          title="Reset to official demo facts"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {/* 2. TOPIC CARD */}
      <div className="nexora-card p-5 sm:p-6 rounded-2xl border border-stone-800 shadow-md">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-black tracking-wider uppercase text-red-400">
            TOPIC
          </span>
          <span className="text-[11px] font-mono text-stone-400">
            Directive Focus
          </span>
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-white">
          {sourceOfTruth.topic}
        </h3>
        {sourceOfTruth.context && (
          <p className="text-xs text-stone-400 mt-1.5">
            Context: {sourceOfTruth.context}
          </p>
        )}
      </div>

      {/* 3. DATES, LOCATIONS, KEY FACTS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* DATES */}
        <div className="nexora-card p-5 rounded-2xl border border-stone-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-3 pb-2.5 border-b border-stone-800">
              <Calendar className="w-4 h-4 text-blue-400" />
              <h4 className="font-black text-white text-xs uppercase tracking-wider">DATES</h4>
            </div>
            <div className="space-y-2">
              {sourceOfTruth.dates.map((date, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-blue-950/40 border border-blue-900/40 text-blue-200 font-mono font-bold text-sm">
                  {date}
                </div>
              ))}
            </div>
          </div>
          <span className="text-[11px] text-stone-400 mt-4 block">Fixed operational window</span>
        </div>

        {/* LOCATIONS */}
        <div className="nexora-card p-5 rounded-2xl border border-stone-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-3 pb-2.5 border-b border-stone-800">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <h4 className="font-black text-white text-xs uppercase tracking-wider">LOCATIONS</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {sourceOfTruth.locations.map((loc, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-lg bg-emerald-950/50 border border-emerald-800/40 text-emerald-300 font-bold text-xs"
                >
                  {loc}
                </span>
              ))}
            </div>
          </div>
          <span className="text-[11px] text-stone-400 mt-4 block">Affected geographical perimeters</span>
        </div>

        {/* KEY FACTS */}
        <div className="nexora-card p-5 rounded-2xl border border-stone-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-3 pb-2.5 border-b border-stone-800">
              <Info className="w-4 h-4 text-purple-400" />
              <h4 className="font-black text-white text-xs uppercase tracking-wider">KEY FACTS</h4>
            </div>
            <ul className="space-y-2 text-xs text-stone-300">
              {sourceOfTruth.key_facts.map((fact, idx) => (
                <li key={idx} className="flex items-start leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mr-2 mt-1.5 flex-shrink-0"></span>
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </div>
          <span className="text-[11px] text-stone-400 mt-4 block">Authoritative background facts</span>
        </div>
      </div>

      {/* 4. CRITICAL LIFE-SAFETY CARDS: WARNINGS & INSTRUCTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* WARNINGS */}
        <div className="nexora-card p-5 rounded-2xl border border-red-800/50 bg-[#1b1210] flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-red-900/40">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <h4 className="font-black text-red-300 text-xs uppercase tracking-wider">WARNINGS</h4>
              </div>
              <button
                onClick={() => setShowAddWarning(!showAddWarning)}
                className="text-xs text-stone-400 hover:text-stone-200 p-1 rounded"
                title="Add warning"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {sourceOfTruth.warnings.map((warn, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-red-950/60 border border-red-800/60 text-red-200 text-xs sm:text-sm font-bold flex items-start justify-between gap-2"
                >
                  <div className="flex items-start">
                    <span className="mr-2 text-red-400 font-bold">⚠️</span>
                    <span>{warn}</span>
                  </div>
                  {sourceOfTruth.warnings.length > 1 && (
                    <button
                      onClick={() => handleRemoveWarning(idx)}
                      className="text-stone-500 hover:text-stone-300"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}

              {showAddWarning && (
                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={newWarning}
                    onChange={(e) => setNewWarning(e.target.value)}
                    placeholder="Enter additional warning..."
                    className="flex-1 text-xs bg-[#0e0c0b] border border-stone-800 rounded-lg px-2.5 py-1.5 text-stone-200 outline-none focus:border-red-500"
                  />
                  <button
                    onClick={handleAddWarning}
                    className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
          </div>
          <span className="text-[11px] text-red-400 font-bold mt-4 block">
            Mandatory: Must be preserved in all public communications
          </span>
        </div>

        {/* INSTRUCTIONS */}
        <div className="nexora-card p-5 rounded-2xl border border-amber-800/50 bg-[#19140f] flex flex-col justify-between shadow-lg">
          <div>
            <div className="flex items-center space-x-2 mb-3 pb-2.5 border-b border-amber-900/40">
              <CheckSquare className="w-4 h-4 text-amber-500" />
              <h4 className="font-black text-amber-300 text-xs uppercase tracking-wider">INSTRUCTIONS</h4>
            </div>

            <div className="space-y-2">
              {sourceOfTruth.instructions.map((instr, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-amber-950/50 border border-amber-800/50 text-amber-200 text-xs sm:text-sm font-bold flex items-start"
                >
                  <span className="text-amber-400 mr-2 font-bold">✓</span>
                  <span>{instr}</span>
                </div>
              ))}
            </div>
          </div>
          <span className="text-[11px] text-amber-400 font-bold mt-4 block">
            Mandatory: Ground team activation & response protocols
          </span>
        </div>
      </div>

      {/* 5. CONTACT & INQUIRIES SECTION */}
      {sourceOfTruth.contact && sourceOfTruth.contact.length > 0 && (
        <div className="nexora-card p-4 sm:p-5 rounded-2xl border border-stone-800 bg-[#141210] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center space-x-3">
            <span className="px-2.5 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800/60 text-xs font-black rounded-lg">
              CONTACT & HELPLINE
            </span>
            <span className="text-xs sm:text-sm font-bold text-stone-200">
              {sourceOfTruth.contact.join(' • ')}
            </span>
          </div>
          <span className="text-[11px] font-mono text-stone-400">
            Authoritative Response Liaison
          </span>
        </div>
      )}

      {/* FOOTER NAVIGATION */}
      <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-4 pt-6 border-t border-stone-800">
        <button
          onClick={onBack}
          className="touch-target w-full sm:w-auto px-5 py-2.5 nexora-btn-secondary rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Edit Source Input</span>
        </button>

        <button
          onClick={onNext}
          className="touch-target w-full sm:w-auto px-7 py-3 nexora-btn-primary rounded-xl font-bold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-red-600/30"
        >
          <span>Continue to Orchestrator</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
