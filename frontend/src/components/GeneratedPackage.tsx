import { useState } from 'react';
import { 
  ArrowLeft, 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  Check, 
  FileText,
  Edit3,
  RefreshCw,
  Play
} from 'lucide-react';
import type { GeneratedContent, ValidationResult, SourceOfTruth } from '../types';
import { exportService } from '../services/exportService';
import { generationService } from '../services/generationService';

interface Props {
  contents: GeneratedContent[];
  validationResults: Record<string, ValidationResult>;
  sourceOfTruth: SourceOfTruth | null;
  onValidate: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
  onInjectFailure: () => void;
  onUpdateContent: (id: string, newContent: string) => void;
}

export default function GeneratedPackage({
  contents,
  validationResults,
  sourceOfTruth,
  onValidate,
  onNext,
  onBack,
  onInjectFailure,
  onUpdateContent
}: Props) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);

  const handleCopy = async (id: string, text: string) => {
    await exportService.copyToClipboard(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleStartEdit = (item: GeneratedContent) => {
    setEditingId(item.id);
    setEditText(item.content);
  };

  const handleSaveEdit = (id: string) => {
    onUpdateContent(id, editText);
    setEditingId(null);
  };

  const handleSingleRegenerate = async (item: GeneratedContent) => {
    if (!sourceOfTruth) return;
    setRegeneratingId(item.id);
    try {
      const freshText = await generationService.regenerateSingle(
        sourceOfTruth,
        item.role,
        item.format,
        item.language,
        item.channel
      );
      onUpdateContent(item.id, freshText);
    } catch {
      alert('Failed to regenerate output.');
    } finally {
      setRegeneratingId(null);
    }
  };

  const totalValidated = Object.keys(validationResults).length;
  const passedCount = Object.values(validationResults).filter(v => v.status === 'PASS').length;
  const reviewCount = Object.values(validationResults).filter(v => v.status === 'REVIEW').length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header & Controls */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#161210] border border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-red-500" />
            <h2 className="text-xl sm:text-2xl font-black text-white">Generated Communications</h2>
          </div>
          <p className="text-xs sm:text-sm text-stone-400">
            {contents.length} packages tailored to recipient roles, formats, and channels.
          </p>
          <div className="flex items-center space-x-3 text-xs pt-1">
            <span className="text-stone-400 font-bold">Status:</span>
            <span className="text-emerald-400 font-bold">✓ {passedCount} Validated</span>
            {reviewCount > 0 && (
              <span className="text-rose-400 font-bold">⚠ {reviewCount} Review Required</span>
            )}
            <span className="text-stone-400">{contents.length - totalValidated} Pending</span>
          </div>
        </div>

        {/* Action Buttons: TEST VALIDATION & PROCEED */}
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={onInjectFailure}
            className="touch-target px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white text-xs sm:text-sm font-black flex items-center justify-center space-x-2 shadow-lg shadow-red-950/40 border border-red-400/50 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            title="Inject intentional hallucination to test real-time validation guardrail"
          >
            <AlertTriangle className="w-4 h-4 text-white fill-white/20 animate-pulse" />
            <span>[ TEST VALIDATION ]</span>
          </button>

          <button
            onClick={onNext}
            className="touch-target px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 text-xs sm:text-sm font-bold flex items-center justify-center space-x-1.5 border border-stone-700 transition-all"
          >
            <span>Proceed to Package</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </button>
        </div>
      </div>

      {/* Grid of Generated Deliverable Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {contents.map((item) => {
          const valRes = validationResults[item.id];
          const isValidated = !!valRes;
          const isPass = valRes?.status === 'PASS';
          const isReview = valRes?.status === 'REVIEW';
          const isEditingThis = editingId === item.id;
          const isRegenThis = regeneratingId === item.id;

          return (
            <div
              key={item.id}
              className={`nexora-card rounded-2xl overflow-hidden flex flex-col justify-between border transition-all ${
                item.isFlawed
                  ? 'border-rose-600/80 bg-[#1c1110] shadow-lg shadow-rose-950/40'
                  : isValidated
                  ? isPass
                    ? 'border-emerald-700/60 bg-[#121814]'
                    : 'border-rose-600/80 bg-[#1a1110]'
                  : 'border-stone-800 bg-[#151210]'
              }`}
            >
              {/* Card Header: Role, Format, Language, Channel + Validation Status */}
              <div className="p-4 border-b border-stone-800 bg-black/30 flex flex-wrap justify-between items-center gap-2">
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 text-[11px] font-black uppercase">
                    {item.role}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-stone-900 text-stone-300 text-[11px] font-bold">
                    {item.format}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 text-[11px] font-bold">
                    {item.language}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[11px] font-bold">
                    {item.channel}
                  </span>
                  {item.isFlawed && (
                    <span className="px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-black uppercase animate-pulse">
                      Intentional Test Flaw
                    </span>
                  )}
                </div>

                {/* VALIDATION STATUS BADGE */}
                {isValidated ? (
                  isPass ? (
                    <span className="inline-flex items-center text-[11px] font-black text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-700/60">
                      <ShieldCheck className="w-3.5 h-3.5 mr-1" /> VALIDATED
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-[11px] font-black text-rose-300 bg-rose-950 px-2.5 py-1 rounded-full border border-rose-600/60">
                      <ShieldAlert className="w-3.5 h-3.5 mr-1 text-rose-400" /> REVIEW REQUIRED
                    </span>
                  )
                ) : (
                  <span className="text-[11px] font-bold text-stone-400 bg-stone-900 px-2 py-0.5 rounded border border-stone-800">
                    PENDING
                  </span>
                )}
              </div>

              {/* Card Content Area */}
              <div className="p-4 sm:p-5 flex-1 bg-[#120f0e]/60">
                {isEditingThis ? (
                  <div className="space-y-2">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={6}
                      className="w-full text-xs sm:text-sm bg-[#0a0807] border border-stone-700 rounded-xl p-3 text-stone-200 outline-none focus:border-red-500 font-sans resize-none"
                    ></textarea>
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 rounded-lg bg-stone-800 text-stone-300 text-xs font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveEdit(item.id)}
                        className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-stone-200 text-xs sm:text-sm font-sans whitespace-pre-wrap leading-relaxed">
                    {item.content}
                  </div>
                )}
              </div>

              {/* CARD ACTION BUTTONS: EDIT, REGENERATE, VALIDATE */}
              <div className="p-3 border-t border-stone-800 bg-black/40 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-1">
                  {/* EDIT Button */}
                  <button
                    onClick={() => handleStartEdit(item)}
                    className="touch-target px-2.5 py-1.5 text-stone-400 hover:text-white hover:bg-stone-800/80 rounded-lg text-xs font-bold flex items-center space-x-1 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>EDIT</span>
                  </button>

                  {/* REGENERATE Button */}
                  <button
                    onClick={() => handleSingleRegenerate(item)}
                    disabled={isRegenThis}
                    className="touch-target px-2.5 py-1.5 text-stone-400 hover:text-white hover:bg-stone-800/80 rounded-lg text-xs font-bold flex items-center space-x-1 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRegenThis ? 'animate-spin text-red-400' : ''}`} />
                    <span>{isRegenThis ? 'Regenerating...' : 'REGENERATE'}</span>
                  </button>

                  {/* Copy Button */}
                  <button
                    onClick={() => handleCopy(item.id, item.content)}
                    className="p-1.5 text-stone-400 hover:text-white rounded-lg text-xs"
                    title="Copy text"
                  >
                    {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* VALIDATE Button */}
                <button
                  onClick={() => onValidate(item.id)}
                  className={`touch-target px-4 py-1.5 text-xs font-black rounded-lg transition-all flex items-center space-x-1.5 ${
                    isValidated
                      ? isReview
                        ? 'bg-rose-600 text-white hover:bg-rose-500 shadow-md shadow-rose-950'
                        : 'bg-stone-800 text-stone-200 hover:bg-stone-700'
                      : 'bg-red-600 hover:bg-red-500 text-white shadow-sm'
                  }`}
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>VALIDATE</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Navigation */}
      <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-4 pt-6 border-t border-stone-800">
        <button
          onClick={onBack}
          className="touch-target w-full sm:w-auto px-5 py-2.5 nexora-btn-secondary rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Orchestrator</span>
        </button>

        <button
          onClick={onNext}
          className="touch-target w-full sm:w-auto px-7 py-3 nexora-btn-primary rounded-xl font-black text-sm flex items-center justify-center space-x-2 shadow-lg shadow-red-600/30"
        >
          <span>Proceed to Final Package</span>
          <CheckCircle2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
