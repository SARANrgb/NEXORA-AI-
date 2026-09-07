import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  ArrowRight, 
  Play, 
  CheckCircle2, 
  ShieldCheck, 
  Flame
} from 'lucide-react';
import { sourceOfTruthService, DEMO_SOURCE_TEXT } from '../services/sourceOfTruthService';
import type { SourceOfTruth } from '../types';

interface Props {
  onNext: () => void;
  setSourceOfTruth: (sot: SourceOfTruth) => void;
  isDemoMode: boolean;
  setIsDemoMode: (val: boolean) => void;
}

export default function Dashboard({ onNext, setSourceOfTruth, isDemoMode, setIsDemoMode }: Props) {
  const [text, setText] = useState(isDemoMode ? DEMO_SOURCE_TEXT : '');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('EXTRACTING SOURCE...');
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const sourceInputRef = useRef<HTMLDivElement | null>(null);

  const handleStartDemo = async () => {
    setIsDemoMode(true);
    setText(DEMO_SOURCE_TEXT);
    setFileName(null);
    setLoading(true);
    setLoadingMessage('BUILDING SOURCE OF TRUTH...');
    try {
      const sot = await sourceOfTruthService.extract(DEMO_SOURCE_TEXT, true);
      setSourceOfTruth(sot);
      onNext();
    } catch {
      // Guaranteed autonomous fallback
      setSourceOfTruth(sourceOfTruthService.getDemoSourceOfTruth());
      onNext();
    } finally {
      setLoading(false);
    }
  };

  const handleProcessText = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setLoadingMessage('EXTRACTING SOURCE...');
    try {
      const isRainfall = text.trim() === DEMO_SOURCE_TEXT.trim();
      setIsDemoMode(isRainfall);
      const sot = await sourceOfTruthService.extract(text, isRainfall);
      setSourceOfTruth(sot);
      onNext();
    } catch {
      alert('Unable to extract text from this document.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setLoading(true);
    setLoadingMessage('EXTRACTING DOCUMENT TEXT...');
    
    try {
      const uploadResult = await sourceOfTruthService.uploadFile(file);
      setText(uploadResult.extracted_text);
      setIsDemoMode(false);
      setSourceOfTruth(uploadResult.source_of_truth);
      if (sourceInputRef.current) {
        sourceInputRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (err: any) {
      // If backend error, try local text reading if TXT
      if (file.name.endsWith('.txt')) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const content = event.target?.result as string;
          if (content) {
            setText(content);
            setIsDemoMode(false);
            const sot = await sourceOfTruthService.extract(content, false);
            setSourceOfTruth(sot);
            if (sourceInputRef.current) {
              sourceInputRef.current.scrollIntoView({ behavior: 'smooth' });
            }
          }
        };
        reader.readAsText(file);
      } else {
        alert(err.message || 'Unable to extract text from this file. Please ensure backend is running for PDF/DOCX parsing.');
      }
    } finally {
      setLoading(false);
    }
  };

  const triggerUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* 1. HERO SECTION */}
      <div className="text-center space-y-3 pt-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-stone-900 border border-stone-800 text-red-400 text-xs font-semibold uppercase tracking-wider">
          <Flame className="w-3.5 h-3.5 fill-red-500 text-red-500" />
          <span>Intelligent Communication Orchestration</span>
        </div>
        
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white font-sans">
          NEXORA <span className="text-red-500">AI</span>
        </h1>
        
        <p className="text-lg sm:text-xl font-medium text-stone-300 max-w-2xl mx-auto">
          One Source. Every Audience. Verified Communication.
        </p>

        <p className="text-xs sm:text-sm text-stone-400 max-w-xl mx-auto">
          Transform one authoritative source into communication tailored to different audiences, formats, languages and channels.
        </p>

        {/* Primary CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
          <button
            onClick={handleStartDemo}
            disabled={loading}
            className="touch-target px-7 py-3.5 bg-red-600 hover:bg-red-500 text-white font-bold text-sm sm:text-base rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-red-950/40 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                {loadingMessage}
              </span>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>START DEMO</span>
              </>
            )}
          </button>

          <button
            onClick={triggerUploadClick}
            disabled={loading}
            className="touch-target px-6 py-3.5 bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-700 font-semibold text-sm sm:text-base rounded-xl flex items-center justify-center space-x-2 transition-colors"
          >
            <UploadCloud className="w-4 h-4 text-stone-400" />
            <span>UPLOAD SOURCE</span>
          </button>
        </div>
      </div>

      {/* 2. COMPACT WORKFLOW DIAGRAM */}
      <div className="nexora-card p-4 sm:p-5 rounded-2xl border border-stone-800/80 bg-[#13100e]/80">
        <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-3 text-center">
          ORCHESTRATION PIPELINE
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm font-bold">
          <div className="px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-stone-200">
            SOURCE
          </div>
          <span className="text-red-500 font-bold">↓</span>
          <div className="px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-stone-200">
            UNDERSTAND
          </div>
          <span className="text-red-500 font-bold">↓</span>
          <div className="px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-stone-200">
            ORCHESTRATE
          </div>
          <span className="text-red-500 font-bold">↓</span>
          <div className="px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-stone-200">
            GENERATE
          </div>
          <span className="text-red-500 font-bold">↓</span>
          <div className="px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-700 text-stone-200">
            VALIDATE
          </div>
          <span className="text-red-500 font-bold">↓</span>
          <div className="px-3 py-1.5 rounded-lg bg-red-950 border border-red-700 text-red-300">
            APPROVE
          </div>
        </div>
      </div>

      {/* 3. DEMO DIRECTIVE HIGHLIGHT BOX */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#171210] border border-stone-800 shadow-md space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 bg-red-600 text-white text-[11px] font-extrabold rounded">
              OFFICIAL DEMO SOURCE
            </span>
            <span className="text-xs text-stone-400 font-medium">
              Heavy Rainfall Advisory
            </span>
          </div>
          <button
            onClick={() => setText(DEMO_SOURCE_TEXT)}
            className="text-xs text-red-400 hover:text-red-300 underline font-medium"
          >
            Reset to Sample Source
          </button>
        </div>

        <p className="text-xs sm:text-sm text-stone-300 font-mono bg-black/40 p-3 rounded-xl border border-stone-800 leading-relaxed">
          "{DEMO_SOURCE_TEXT}"
        </p>

        <div className="flex flex-wrap gap-2 text-xs text-stone-400 pt-1">
          <span className="flex items-center text-stone-300">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-red-400" /> Topic: Heavy Rainfall Warning
          </span>
          <span className="flex items-center text-stone-300">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-red-400" /> Dates: August 23–25
          </span>
          <span className="flex items-center text-stone-300">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-red-400" /> Sectors: District A, B, C
          </span>
          <span className="flex items-center text-stone-300">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-red-400" /> Fishermen & Emergency Directives
          </span>
        </div>
      </div>

      {/* 4. SOURCE INPUT SECTION */}
      <div ref={sourceInputRef} className="nexora-card rounded-2xl overflow-hidden shadow-lg border border-stone-800">
        <div className="p-4 sm:p-5 border-b border-stone-800 bg-[#161210] flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-red-500" />
            <h3 className="font-bold text-stone-100 text-sm sm:text-base">Input Source Document or Directive</h3>
          </div>
          
          {/* Presets */}
          <div className="flex items-center space-x-1.5 text-xs">
            <span className="text-stone-400">Presets:</span>
            {sourceOfTruthService.getSamplePresets().map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setText(preset.text);
                  setFileName(null);
                }}
                className="px-2.5 py-1 rounded bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 text-[11px] transition-colors"
              >
                {preset.badge}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          <input 
            ref={fileInputRef}
            type="file" 
            accept=".txt,.pdf,.docx,.md" 
            onChange={handleFileUpload}
            className="hidden" 
          />

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            placeholder="Paste your source document content here..."
            className="w-full rounded-xl bg-[#0e0c0b] border border-stone-800 p-4 text-stone-200 text-xs sm:text-sm focus:border-red-600 focus:ring-1 focus:ring-red-600 outline-none resize-none transition-all placeholder:text-stone-600 font-sans"
          ></textarea>

          {fileName && (
            <div className="text-xs text-stone-400 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Attached: <strong className="text-stone-200">{fileName}</strong></span>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-5 bg-[#120f0d] border-t border-stone-800 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="text-xs text-stone-400 flex items-center">
            <ShieldCheck className="w-4 h-4 text-emerald-500 mr-1.5 flex-shrink-0" />
            <span>Downstream outputs will be strictly bounded by these verified facts.</span>
          </div>

          <button
            onClick={handleProcessText}
            disabled={loading || !text.trim()}
            className="touch-target w-full sm:w-auto px-6 py-2.5 nexora-btn-primary rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{loading ? loadingMessage : 'Extract Source of Truth'}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
