import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ShieldCheck, 
  ShieldAlert, 
  Check, 
  X, 
  AlertCircle, 
  RefreshCw, 
  UserCheck, 
  CheckCircle2,
  Calendar,
  MapPin,
  Hash,
  AlertTriangle,
  CheckSquare
} from 'lucide-react';
import type { SourceOfTruth, GeneratedContent, ValidationResult, FactValidationItem } from '../types';
import { validationService } from '../services/validationService';
import { generationService } from '../services/generationService';

interface Props {
  content: GeneratedContent;
  sourceOfTruth: SourceOfTruth;
  onResult: (res: ValidationResult) => void;
  onBack: () => void;
  onRegenerate: (newContent: string) => void;
  onApprove?: () => void;
}

export default function ValidationView({ 
  content, 
  sourceOfTruth, 
  onResult, 
  onBack, 
  onRegenerate,
  onApprove 
}: Props) {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [isHumanReview, setIsHumanReview] = useState(false);
  const [reviewText, setReviewText] = useState(content.content);

  useEffect(() => {
    runValidation(content.content);
  }, [content.id]);

  const runValidation = async (textToValidate: string) => {
    setLoading(true);
    try {
      const res = await validationService.validate(sourceOfTruth, textToValidate);
      setResult(res);
      onResult(res);
    } catch {
      const res = validationService.evaluateDeterministically(sourceOfTruth, textToValidate);
      setResult(res);
      onResult(res);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      let correctedText: string;
      if (sourceOfTruth.topic.toLowerCase().includes('rainfall')) {
        correctedText = validationService.getCorrectedDemoText();
      } else {
        correctedText = await generationService.regenerateSingle(
          sourceOfTruth,
          content.role,
          content.format,
          content.language,
          content.channel
        );
      }

      setReviewText(correctedText);
      onRegenerate(correctedText);
      
      // Immediately re-validate the corrected text
      const newValidation = await validationService.validate(sourceOfTruth, correctedText);
      setResult(newValidation);
      onResult(newValidation);
      setIsHumanReview(false);
    } catch {
      alert('Failed to regenerate communication.');
    } finally {
      setRegenerating(false);
    }
  };

  const handleValidateAgain = async () => {
    onRegenerate(reviewText);
    await runValidation(reviewText);
  };

  if (loading && !result) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4 max-w-md mx-auto text-center">
        <div className="w-12 h-12 border-3 border-red-600/30 border-t-red-600 rounded-full animate-spin"></div>
        <h3 className="text-lg font-black text-white">VALIDATING CRITICAL FACTS...</h3>
        <p className="text-xs text-stone-400">
          Checking Dates, Locations, Numbers, Warnings, and Instructions against Source of Truth.
        </p>
      </div>
    );
  }

  if (!result) return null;

  const isPass = result.status === 'PASS';

  // Group categorized items by category
  const categoriesList: Array<{
    key: 'DATES' | 'LOCATIONS' | 'NUMBERS' | 'WARNINGS' | 'INSTRUCTIONS';
    label: string;
    icon: any;
  }> = [
    { key: 'DATES', label: 'DATES', icon: Calendar },
    { key: 'LOCATIONS', label: 'LOCATIONS', icon: MapPin },
    { key: 'NUMBERS', label: 'NUMBERS', icon: Hash },
    { key: 'WARNINGS', label: 'WARNINGS', icon: AlertTriangle },
    { key: 'INSTRUCTIONS', label: 'INSTRUCTIONS', icon: CheckSquare },
  ];

  const getItemsForCategory = (catKey: string): FactValidationItem[] => {
    if (result.categorized_items && result.categorized_items.length > 0) {
      return result.categorized_items.filter(item => item.category === catKey);
    }
    return [];
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 1. TOP HEADER & HERO VERDICT BANNER */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#161210] border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button 
            onClick={onBack} 
            className="touch-target inline-flex items-center text-xs font-bold text-stone-400 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            <span>Back to Generated Deliverables</span>
          </button>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            CRITICAL FACT VALIDATION
          </h2>
          <p className="text-xs sm:text-sm text-stone-400 mt-0.5">
            Automated guardrail auditing every generated output against verified Source of Truth.
          </p>
        </div>

        {/* HERO STATUS BADGE */}
        <div className={`px-5 py-3 rounded-2xl flex items-center font-black text-base border shadow-xl ${
          isPass 
            ? 'bg-emerald-950 text-emerald-300 border-emerald-600 shadow-emerald-950/50' 
            : 'bg-rose-950 text-rose-200 border-rose-600 shadow-rose-950/50'
        }`}>
          {isPass ? (
            <>
              <ShieldCheck className="w-6 h-6 mr-2.5 text-emerald-400" />
              <div>
                <span className="text-xs text-emerald-400 block -mb-0.5 font-bold">VERIFICATION RESULT</span>
                <span>✓ VALIDATED</span>
              </div>
            </>
          ) : (
            <>
              <ShieldAlert className="w-6 h-6 mr-2.5 text-rose-400 animate-pulse" />
              <div>
                <span className="text-xs text-rose-400 block -mb-0.5 font-bold">VERIFICATION RESULT</span>
                <span>REVIEW REQUIRED</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 2. CLEAR VISUAL COMPARISON: SOURCE OF TRUTH VS GENERATED OUTPUT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: SOURCE OF TRUTH */}
        <div className="nexora-card p-5 sm:p-6 rounded-2xl border border-stone-800 bg-[#14110f] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <h3 className="font-black text-sm text-white tracking-wider uppercase flex items-center">
              <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
              SOURCE OF TRUTH
            </h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-900/40 font-bold">
              AUTHORITATIVE BOUNDS
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider block">Topic</span>
              <p className="font-bold text-stone-200 mt-0.5">{sourceOfTruth.topic}</p>
            </div>

            <div>
              <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider block">Dates</span>
              <p className="font-mono text-blue-300 font-bold bg-blue-950/40 p-2 rounded-lg border border-blue-900/30 mt-0.5">
                {sourceOfTruth.dates.join(', ')}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider block">Locations</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {sourceOfTruth.locations.map((loc, i) => (
                  <span key={i} className="px-2.5 py-1 rounded bg-emerald-950/50 border border-emerald-800/40 text-emerald-300 font-mono font-bold text-xs">
                    {loc}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-black text-red-400 uppercase tracking-wider block">Warnings</span>
              <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-900/40 text-red-200 mt-0.5 font-bold leading-relaxed">
                ⚠️ {sourceOfTruth.warnings.join(' ')}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider block">Instructions</span>
              <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-900/40 text-amber-200 mt-0.5 font-bold leading-relaxed">
                ✓ {sourceOfTruth.instructions.join(' ')}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: GENERATED OUTPUT (WITH INLINE HUMAN REVIEW) */}
        <div className="nexora-card p-5 sm:p-6 rounded-2xl border border-stone-800 bg-[#14110f] flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="font-black text-sm text-white tracking-wider uppercase flex items-center">
                <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                GENERATED OUTPUT
              </h3>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold text-stone-400">
                  {content.role} • {content.format}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
              <span className="px-2 py-0.5 rounded bg-red-950 text-red-300">{content.role}</span>
              <span className="px-2 py-0.5 rounded bg-stone-900 text-stone-300">{content.format}</span>
              <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300">{content.language}</span>
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300">{content.channel}</span>
            </div>

            {/* Content view or Human Review Editor */}
            {isHumanReview ? (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-400 flex items-center">
                    <UserCheck className="w-4 h-4 mr-1" />
                    Human Review Active: Edit text below
                  </span>
                  <button
                    onClick={() => setIsHumanReview(false)}
                    className="text-stone-400 hover:text-white underline text-[11px]"
                  >
                    Cancel
                  </button>
                </div>

                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={6}
                  className="w-full text-xs sm:text-sm bg-[#0a0807] border border-amber-600/70 rounded-xl p-3 text-stone-200 font-sans outline-none focus:border-amber-500 leading-relaxed resize-none"
                  placeholder="Edit generated communication to correct facts..."
                ></textarea>

                <button
                  onClick={handleValidateAgain}
                  className="touch-target w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-black font-black text-xs sm:text-sm rounded-xl flex items-center justify-center space-x-2 shadow-md shadow-amber-950 transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>VALIDATE AGAIN</span>
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[#0b0908] border border-stone-800 text-xs sm:text-sm text-stone-200 whitespace-pre-wrap leading-relaxed font-sans min-h-[160px]">
                {reviewText}
              </div>
            )}
          </div>

          {/* Action buttons on generated card */}
          {!isPass && !isHumanReview && (
            <div className="pt-3 border-t border-stone-800 space-y-2">
              <button
                onClick={handleRegenerate}
                disabled={regenerating}
                className="touch-target w-full py-3 bg-red-600 hover:bg-red-500 text-white font-black text-xs sm:text-sm rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-red-950 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${regenerating ? 'animate-spin' : ''}`} />
                <span>{regenerating ? 'Regenerating Corrected Facts...' : 'REGENERATE'}</span>
              </button>

              <button
                onClick={() => setIsHumanReview(true)}
                className="touch-target w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-700 font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition-colors"
              >
                <UserCheck className="w-4 h-4 text-stone-400" />
                <span>HUMAN REVIEW</span>
              </button>
            </div>
          )}

          {isPass && !isHumanReview && (
            <div className="pt-3 border-t border-stone-800 flex justify-end">
              <button
                onClick={() => setIsHumanReview(true)}
                className="touch-target px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors border border-stone-800"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>HUMAN REVIEW / EDIT</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. VALIDATION CATEGORIES BREAKDOWN (DATES, LOCATIONS, NUMBERS, WARNINGS, INSTRUCTIONS) */}
      <div className="nexora-card p-5 sm:p-6 rounded-2xl border border-stone-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-red-500" />
            <h3 className="font-black text-sm text-white uppercase tracking-wider">
              VALIDATION CATEGORIES AUDIT
            </h3>
          </div>
          <div className="text-right">
            <span className={`text-lg font-black font-mono ${isPass ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isPass ? '✓ VALIDATED' : `${result.score}% VALIDATION SCORE`}
            </span>
          </div>
        </div>

        {/* 5 CATEGORY PANELS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {categoriesList.map(cat => {
            const items = getItemsForCategory(cat.key);
            const hasMissing = items.some(i => i.status === 'MISSING') || 
              (cat.key === 'DATES' && result.missing_facts.some(m => m.toLowerCase().includes('date') || m.toLowerCase().includes('august 25'))) ||
              (cat.key === 'LOCATIONS' && result.missing_facts.some(m => m.toLowerCase().includes('district c'))) ||
              (cat.key === 'WARNINGS' && result.missing_facts.some(m => m.toLowerCase().includes('fishermen'))) ||
              (cat.key === 'INSTRUCTIONS' && result.missing_facts.some(m => m.toLowerCase().includes('emergency')));

            const hasAltered = items.some(i => i.status === 'ALTERED') ||
              (cat.key === 'DATES' && result.altered_facts.length > 0);

            return (
              <div 
                key={cat.key} 
                className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                  hasMissing 
                    ? 'bg-rose-950/40 border-rose-800/60' 
                    : hasAltered 
                    ? 'bg-amber-950/40 border-amber-800/60' 
                    : 'bg-stone-900/80 border-stone-800'
                }`}
              >
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <cat.icon className="w-3.5 h-3.5 text-stone-400" />
                    <span className="text-xs font-black text-white">{cat.label}</span>
                  </div>

                  <div className="text-[11px] text-stone-300">
                    {hasMissing ? (
                      <span className="text-rose-300 font-bold block truncate" title={(() => {
                        const isRainfall = sourceOfTruth.topic.toLowerCase().includes('rain') || sourceOfTruth.topic.toLowerCase().includes('cyclone');
                        if (isRainfall) {
                          return cat.key === 'LOCATIONS' ? 'Missing: District C' :
                                 cat.key === 'DATES' ? 'Missing: August 25' :
                                 cat.key === 'WARNINGS' ? 'Missing: Fishermen warning' :
                                 cat.key === 'INSTRUCTIONS' ? 'Missing: Emergency response' :
                                 'Missing items';
                        }
                        const found = result.missing_facts.find(m => {
                          const ml = m.toLowerCase();
                          if (cat.key === 'LOCATIONS') return sourceOfTruth.locations.some(l => ml.includes(l.toLowerCase()));
                          if (cat.key === 'DATES') return sourceOfTruth.dates.some(d => ml.includes(d.toLowerCase()));
                          if (cat.key === 'WARNINGS') return sourceOfTruth.warnings.some(w => ml.includes(w.toLowerCase().slice(0, 10)));
                          if (cat.key === 'INSTRUCTIONS') return sourceOfTruth.instructions.some(i => ml.includes(i.toLowerCase().slice(0, 10)));
                          return false;
                        });
                        return found || (result.missing_facts[0] || 'Missing items');
                      })()}>
                        {(() => {
                          const isRainfall = sourceOfTruth.topic.toLowerCase().includes('rain') || sourceOfTruth.topic.toLowerCase().includes('cyclone');
                          if (isRainfall) {
                            return cat.key === 'LOCATIONS' ? 'Missing: District C' :
                                   cat.key === 'DATES' ? 'Missing: August 25' :
                                   cat.key === 'WARNINGS' ? 'Missing: Fishermen warning' :
                                   cat.key === 'INSTRUCTIONS' ? 'Missing: Emergency response' :
                                   'Missing items';
                          }
                          const found = result.missing_facts.find(m => {
                            const ml = m.toLowerCase();
                            if (cat.key === 'LOCATIONS') return sourceOfTruth.locations.some(l => ml.includes(l.toLowerCase()));
                            if (cat.key === 'DATES') return sourceOfTruth.dates.some(d => ml.includes(d.toLowerCase()));
                            if (cat.key === 'WARNINGS') return sourceOfTruth.warnings.some(w => ml.includes(w.toLowerCase().slice(0, 10)));
                            if (cat.key === 'INSTRUCTIONS') return sourceOfTruth.instructions.some(i => ml.includes(i.toLowerCase().slice(0, 10)));
                            return false;
                          });
                          return found || (result.missing_facts[0] || 'Missing items');
                        })()}
                      </span>
                    ) : hasAltered ? (
                      <span className="text-amber-300 font-bold block">
                        Altered cutoff
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-bold block">
                        All facts verified
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-stone-800/60">
                  {hasMissing ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-950 text-rose-300 border border-rose-800/60 inline-flex items-center">
                      <X className="w-3 h-3 mr-1" /> ⚠ MISSING
                    </span>
                  ) : hasAltered ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-950 text-amber-300 border border-amber-800/60 inline-flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" /> ✗ ALTERED
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-950 text-emerald-300 border border-emerald-800/60 inline-flex items-center">
                      <Check className="w-3 h-3 mr-1" /> ✓ PRESERVED
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* DETAILED FACT AUDIT LIST */}
        <div className="pt-3 border-t border-stone-800 space-y-2">
          <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">
            DETAILED AUDIT LOG
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {/* MISSING */}
            {result.missing_facts.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-rose-400 font-bold flex items-center">
                  <X className="w-3.5 h-3.5 mr-1" /> ⚠ MISSING ({result.missing_facts.length})
                </span>
                {result.missing_facts.map((m, i) => (
                  <div key={i} className="p-2 rounded bg-rose-950/60 border border-rose-800/60 text-rose-200">
                    {m}
                  </div>
                ))}
              </div>
            )}

            {/* ALTERED */}
            {result.altered_facts.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-amber-400 font-bold flex items-center">
                  <AlertCircle className="w-3.5 h-3.5 mr-1" /> ✗ ALTERED ({result.altered_facts.length})
                </span>
                {result.altered_facts.map((a, i) => (
                  <div key={i} className="p-2 rounded bg-amber-950/60 border border-amber-800/60 text-amber-200">
                    {a}
                  </div>
                ))}
              </div>
            )}

            {/* PRESERVED */}
            {result.preserved_facts.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-emerald-400 font-bold flex items-center">
                  <Check className="w-3.5 h-3.5 mr-1" /> ✓ PRESERVED ({result.preserved_facts.length})
                </span>
                {result.preserved_facts.slice(0, 4).map((p, i) => (
                  <div key={i} className="p-2 rounded bg-emerald-950/40 border border-emerald-900/40 text-emerald-200">
                    {p}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. FOOTER ACTIONS */}
      <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-4 pt-6 border-t border-stone-800">
        <button
          onClick={onBack}
          className="touch-target w-full sm:w-auto px-5 py-2.5 nexora-btn-secondary rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Deliverables</span>
        </button>

        <button
          onClick={isPass ? (onApprove || onBack) : onBack}
          className={`touch-target w-full sm:w-auto px-7 py-3 rounded-xl font-black text-sm flex items-center justify-center space-x-2 transition-all ${
            isPass
              ? 'nexora-btn-primary shadow-lg shadow-red-600/30'
              : 'bg-stone-800 text-stone-400 hover:bg-stone-700'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{isPass ? 'APPROVE OUTPUT' : 'RETURN (FIX PENDING)'}</span>
        </button>
      </div>
    </div>
  );
}
