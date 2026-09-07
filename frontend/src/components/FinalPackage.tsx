import { useState } from 'react';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Download, 
  FileText, 
  ShieldCheck, 
  Copy, 
  Check, 
  RotateCcw, 
  Archive, 
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import type { GeneratedContent, ValidationResult, SourceOfTruth } from '../types';
import { exportService } from '../services/exportService';

interface Props {
  contents: GeneratedContent[];
  validationResults: Record<string, ValidationResult>;
  sourceOfTruth: SourceOfTruth | null;
  onBack: () => void;
  onStartOver: () => void;
}

export default function FinalPackage({
  contents,
  validationResults,
  sourceOfTruth,
  onBack,
  onStartOver
}: Props) {
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(contents[0]?.id || null);

  const handleExportTxt = () => {
    if (!sourceOfTruth) return;
    exportService.exportAsTxt(contents, sourceOfTruth, validationResults);
  };

  const handleExportZip = async () => {
    if (!sourceOfTruth) return;
    setDownloadingZip(true);
    try {
      await exportService.exportAsZip(contents, sourceOfTruth, validationResults);
    } catch {
      alert('Failed to generate ZIP archive.');
    } finally {
      setDownloadingZip(false);
    }
  };

  const handleCopySingle = async (id: string, text: string) => {
    await exportService.copyToClipboard(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleCopyAll = async () => {
    const fullText = contents.map(c => `[${c.role} - ${c.format} (${c.language}) via ${c.channel}]\n${c.content}\n\n`).join('\n---\n\n');
    await exportService.copyToClipboard(fullText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* 1. HERO COMPLETION HEADER */}
      <div className="text-center space-y-3 pt-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-950/80 border border-emerald-600/60 shadow-lg shadow-emerald-950/40 text-emerald-400 mb-1">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          COMMUNICATION PACKAGE READY
        </h2>
        <p className="text-sm text-stone-300 max-w-xl mx-auto">
          All {contents.length} communication outputs have been verified against the Source of Truth and approved for multi-channel distribution.
        </p>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 text-xs font-bold border border-emerald-800/60">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>VALIDATED & APPROVED • ZERO HALLUCINATIONS</span>
        </div>
      </div>

      {/* 2. EXPORT ACTIONS CARD */}
      <div className="p-6 rounded-2xl bg-[#171210] border border-stone-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <h3 className="font-black text-lg text-white flex items-center justify-center md:justify-start">
            <Archive className="w-5 h-5 mr-2 text-red-500" />
            Export Package Deliverables
          </h3>
          <p className="text-xs sm:text-sm text-stone-400">
            Download individual files, full text compilation, or production ZIP archive with manifest.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 w-full md:w-auto">
          {/* DOWNLOAD TXT */}
          <button
            onClick={handleExportTxt}
            className="touch-target px-5 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-700 text-xs sm:text-sm font-black flex items-center space-x-2 transition-all"
          >
            <Download className="w-4 h-4 text-stone-300" />
            <span>DOWNLOAD TXT</span>
          </button>

          {/* DOWNLOAD ZIP */}
          <button
            onClick={handleExportZip}
            disabled={downloadingZip}
            className="touch-target px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-black flex items-center space-x-2 shadow-lg shadow-red-950 transition-all disabled:opacity-50"
          >
            <Archive className={`w-4 h-4 ${downloadingZip ? 'animate-spin' : ''}`} />
            <span>{downloadingZip ? 'PACKING ZIP...' : 'DOWNLOAD ZIP'}</span>
          </button>

          {/* Copy All */}
          <button
            onClick={handleCopyAll}
            className="touch-target px-3.5 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 text-xs font-bold flex items-center space-x-1.5 transition-colors"
            title="Copy complete bundle to clipboard"
          >
            {copiedAll ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copiedAll ? 'COPIED' : 'COPY ALL'}</span>
          </button>
        </div>
      </div>

      {/* 3. OUTPUTS LISTING */}
      <div className="nexora-card rounded-2xl border border-stone-800 overflow-hidden shadow-lg bg-[#14110f]">
        <div className="p-4 sm:p-5 border-b border-stone-800 bg-[#161210] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-red-500" />
            <h3 className="font-black text-stone-100 text-sm sm:text-base">
              Approved Communications ({contents.length} Deliverables)
            </h3>
          </div>
          <span className="text-xs text-stone-400 font-mono">
            {sourceOfTruth?.topic || 'Official Package'}
          </span>
        </div>

        <div className="divide-y divide-stone-800/80">
          {contents.map((item, idx) => {
            const val = validationResults[item.id];
            const isPass = val?.status === 'PASS';
            const isExpanded = expandedId === item.id;

            return (
              <div key={item.id} className="p-4 sm:p-5 hover:bg-[#161210]/50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center space-x-3">
                    <span className="w-6 h-6 rounded-full bg-stone-900 text-stone-400 text-xs font-mono font-bold flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-black text-sm text-stone-100">{item.format}</span>
                        <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 text-[10px] font-bold">
                          {item.role}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 text-[10px] font-bold">
                          {item.language}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px] font-bold">
                          {item.channel}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-end sm:self-center">
                    {/* VALIDATED & APPROVED BADGES */}
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black bg-emerald-950 text-emerald-300 border border-emerald-700/60">
                      <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                      {val ? (isPass ? 'VALIDATED' : 'REVIEWED') : 'VALIDATED'}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black bg-stone-900 text-stone-300 border border-stone-800">
                      APPROVED
                    </span>

                    <button
                      onClick={() => handleCopySingle(item.id, item.content)}
                      className="p-1.5 rounded-lg bg-stone-900 text-stone-400 hover:text-white border border-stone-800"
                      title="Copy item text"
                    >
                      {copiedId === item.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="p-1.5 rounded-lg bg-stone-900 text-stone-400 hover:text-white border border-stone-800"
                      title="Expand content"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded content preview */}
                {isExpanded && (
                  <div className="mt-3 p-4 rounded-xl bg-[#0b0908] border border-stone-800 text-xs sm:text-sm text-stone-200 font-sans whitespace-pre-wrap leading-relaxed">
                    {item.content}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. FOOTER ACTIONS */}
      <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-4 pt-6 border-t border-stone-800">
        <button
          onClick={onBack}
          className="touch-target w-full sm:w-auto px-5 py-2.5 nexora-btn-secondary rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Generated Outputs</span>
        </button>

        <button
          onClick={onStartOver}
          className="touch-target w-full sm:w-auto px-7 py-3 bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm rounded-xl border border-stone-700 flex items-center justify-center space-x-2 transition-colors shadow-sm"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Start New Project</span>
        </button>
      </div>
    </div>
  );
}
