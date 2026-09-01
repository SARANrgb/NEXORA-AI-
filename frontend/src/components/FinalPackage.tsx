import { ArrowLeft, CheckCircle2, Download, FileText, ShieldCheck, ShieldAlert } from 'lucide-react';
import type { GeneratedContent, ValidationResult } from '../types';

interface Props {
  contents: GeneratedContent[];
  validationResults: Record<string, ValidationResult>;
  onBack: () => void;
  onStartOver: () => void;
}

export default function FinalPackage({ contents, validationResults, onBack, onStartOver }: Props) {
  
  const handleExport = (type: string) => {
    alert(`Exporting package as ${type}... (Demo Feature)`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center space-y-4 mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Communication Package Ready</h2>
        <p className="text-lg text-slate-600">All outputs have been generated and validated.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
         <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-lg flex items-center">
              <FileText className="w-5 h-5 mr-2 text-slate-500" />
              Package Contents ({contents.length} items)
            </h3>
         </div>
         <div className="divide-y divide-slate-100">
           {contents.map((item, idx) => {
             const valRes = validationResults[item.id];
             const isPass = valRes?.status === 'PASS';
             return (
               <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="text-slate-400 font-medium text-sm w-6">{idx + 1}.</div>
                    <div>
                      <p className="font-semibold text-slate-800">{item.format}</p>
                      <p className="text-sm text-slate-500">{item.role} • {item.language} • {item.channel}</p>
                    </div>
                  </div>
                  <div>
                    {valRes ? (
                      isPass ? (
                        <span className="flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                          <ShieldCheck className="w-3 h-3 mr-1" /> VALIDATED
                        </span>
                      ) : (
                        <span className="flex items-center text-xs font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                          <ShieldAlert className="w-3 h-3 mr-1" /> REVIEWED
                        </span>
                      )
                    ) : (
                      <span className="text-xs font-bold text-slate-400 border border-slate-200 px-2 py-1 rounded">UNVALIDATED</span>
                    )}
                  </div>
               </div>
             );
           })}
         </div>
      </div>

      <div className="bg-blue-50 rounded-xl border border-blue-100 p-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h3 className="font-bold text-blue-900 mb-1">Export Package</h3>
          <p className="text-sm text-blue-700">Download the complete set of communications.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => handleExport('PDF')} className="flex items-center px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 shadow-sm"><Download className="w-4 h-4 mr-2"/> PDF</button>
          <button onClick={() => handleExport('DOCX')} className="flex items-center px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 shadow-sm"><Download className="w-4 h-4 mr-2"/> DOCX</button>
          <button onClick={() => handleExport('ZIP')} className="flex items-center px-4 py-2 bg-blue-600 text-white border border-transparent rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm"><Download className="w-4 h-4 mr-2"/> ZIP Archive</button>
        </div>
      </div>

      <div className="flex justify-between pt-8 border-t border-slate-200">
        <button onClick={onBack} className="flex items-center px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Generated Outputs
        </button>
        <button 
          onClick={onStartOver}
          className="flex items-center px-6 py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors shadow-sm"
        >
          Start New Project
        </button>
      </div>
    </div>
  );
}
