import { useState } from 'react';
import { UploadCloud, FileText, ArrowRight } from 'lucide-react';
import { extractSourceOfTruth } from '../api';
import type { SourceOfTruth } from '../types';

interface Props {
  onNext: () => void;
  setSourceOfTruth: (sot: SourceOfTruth) => void;
}

const DEMO_TEXT = "Heavy rainfall is expected in District A, District B and District C from August 23–25. Fishermen should not venture into the sea. Emergency response teams should remain active.";

export default function Dashboard({ onNext, setSourceOfTruth }: Props) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleProcess = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const sot = await extractSourceOfTruth(text);
      setSourceOfTruth(sot);
      onNext();
    } catch (error) {
      console.error(error);
      alert('Failed to extract source of truth');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create a Communication Package</h2>
        <p className="text-lg text-slate-600">Start by providing your authoritative source of truth document or text.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
           <h3 className="text-lg font-semibold text-slate-800">Source Input</h3>
           <button 
             onClick={() => setText(DEMO_TEXT)}
             className="text-sm font-medium text-blue-600 hover:text-blue-700 underline"
           >
             Use Demo Source
           </button>
        </div>
        <div className="p-6 space-y-6">
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer">
            <UploadCloud className="h-10 w-10 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">Click to upload PDF, DOCX, or TXT</p>
            <p className="text-sm text-slate-400 mt-1">or drag and drop files here</p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500 font-medium">OR PASTE TEXT</span>
            </div>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            className="w-full rounded-xl border border-slate-300 p-4 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none resize-none"
            placeholder="Paste your source document content here..."
          ></textarea>
        </div>
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={handleProcess}
            disabled={loading || !text.trim()}
            className="flex items-center px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Processing...' : 'Extract Source of Truth'}
            {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start space-x-4">
           <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
             <FileText className="h-6 w-6" />
           </div>
           <div>
             <h4 className="font-semibold text-slate-900 mb-1">Recent Projects</h4>
             <p className="text-sm text-slate-500">Resume work on previous communication packages.</p>
           </div>
        </div>
      </div>
    </div>
  );
}
