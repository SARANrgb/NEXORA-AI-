import { ArrowLeft, ShieldAlert, ShieldCheck, Edit3, RefreshCw, CheckCircle2 } from 'lucide-react';
import type { GeneratedContent, ValidationResult } from '../types';

interface Props {
  contents: GeneratedContent[];
  validationResults: Record<string, ValidationResult>;
  onValidate: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
  onInjectFailure: () => void;
}

export default function GeneratedPackage({ contents, validationResults, onValidate, onNext, onBack, onInjectFailure }: Props) {
  
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Generated Communications</h2>
          <p className="text-slate-600 mt-1">Review the generated outputs across all selected dimensions.</p>
        </div>
        <div className="flex space-x-3">
           <button 
             onClick={onInjectFailure} 
             className="px-4 py-2 bg-rose-100 text-rose-700 font-medium rounded-lg hover:bg-rose-200 text-sm"
           >
             DEMO VALIDATION FAILURE
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {contents.map((item) => {
          const valRes = validationResults[item.id];
          const isValidated = !!valRes;
          const isPass = valRes?.status === 'PASS';

          return (
            <div key={item.id} className={`bg-white rounded-xl border ${isValidated ? (isPass ? 'border-emerald-200 ring-1 ring-emerald-50' : 'border-rose-300 ring-1 ring-rose-50') : 'border-slate-200'} shadow-sm flex flex-col overflow-hidden`}>
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-start">
                <div className="flex flex-wrap gap-1.5 mb-2">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded">{item.role}</span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded">{item.format}</span>
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded">{item.language}</span>
                  <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-xs font-semibold rounded">{item.channel}</span>
                </div>
                {isValidated ? (
                  isPass ? (
                    <span className="flex items-center text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full">
                      <ShieldCheck className="w-3 h-3 mr-1" /> VALIDATED
                    </span>
                  ) : (
                    <span className="flex items-center text-xs font-bold text-rose-700 bg-rose-100 px-2 py-1 rounded-full">
                      <ShieldAlert className="w-3 h-3 mr-1" /> REVIEW REQUIRED
                    </span>
                  )
                ) : (
                   <span className="text-xs font-semibold text-slate-400 border border-slate-200 px-2 py-1 rounded-full">PENDING</span>
                )}
              </div>
              
              <div className="p-5 flex-1 bg-white">
                 <p className="text-slate-700 text-sm whitespace-pre-wrap font-serif leading-relaxed">
                   {item.content}
                 </p>
              </div>

              <div className="p-3 border-t border-slate-100 bg-slate-50 flex justify-between items-center gap-2">
                 <div className="flex space-x-2">
                   <button className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Edit">
                     <Edit3 className="w-4 h-4" />
                   </button>
                   <button className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Regenerate">
                     <RefreshCw className="w-4 h-4" />
                   </button>
                 </div>
                 
                 <button 
                   onClick={() => onValidate(item.id)}
                   className={`flex items-center px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                     isValidated 
                       ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                       : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                   }`}
                 >
                   {isValidated ? 'View Validation' : 'Run Validation'}
                 </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between pt-6 border-t border-slate-200">
        <button onClick={onBack} className="flex items-center px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orchestrator
        </button>
        <button 
          onClick={onNext}
          className="flex items-center px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          Proceed to Final Package
          <CheckCircle2 className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
