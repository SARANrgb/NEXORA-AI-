import { useState, useEffect } from 'react';
import { ArrowLeft, ShieldCheck, ShieldAlert, Check, X, AlertCircle, RefreshCw, UserCheck } from 'lucide-react';
import type { SourceOfTruth, GeneratedContent, ValidationResult } from '../types';
import { validateContent, generateCommunication } from '../api';

interface Props {
  content: GeneratedContent;
  sourceOfTruth: SourceOfTruth;
  onResult: (res: ValidationResult) => void;
  onBack: () => void;
  onRegenerate: (newContent: string) => void;
}

export default function ValidationView({ content, sourceOfTruth, onResult, onBack, onRegenerate }: Props) {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    runValidation();
  }, []);

  const runValidation = async () => {
    setLoading(true);
    try {
      const res = await validateContent({
        source_of_truth: sourceOfTruth,
        generated_content: content.content
      });
      setResult(res);
      onResult(res);
    } catch (error) {
      console.error(error);
      alert('Validation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      // Regenerate just this one
      const results = await generateCommunication({
        roles: [content.role],
        formats: [content.format],
        languages: [content.language],
        channels: [content.channel],
        source_of_truth: sourceOfTruth
      });
      if(results && results.length > 0) {
        onRegenerate(results[0].content);
        onBack(); // Go back to see the newly generated content
      }
    } catch (error) {
      console.error(error);
      alert('Failed to regenerate');
    } finally {
      setRegenerating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-slate-600 font-medium animate-pulse">Running AI Validation Engine...</p>
      </div>
    );
  }

  if (!result) return null;

  const isPass = result.status === 'PASS';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <button onClick={onBack} className="flex items-center text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Generated Packages
        </button>
        <div className={`px-4 py-1.5 rounded-full flex items-center font-bold ${isPass ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
          {isPass ? <ShieldCheck className="w-5 h-5 mr-2" /> : <ShieldAlert className="w-5 h-5 mr-2" />}
          {isPass ? 'VALIDATED' : 'REVIEW REQUIRED'}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
              <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">1</span>
              Source of Truth Reference
            </h3>
            <div className="space-y-3">
               <div><span className="text-xs font-bold text-slate-400 uppercase">Topic</span><p className="text-sm font-medium">{sourceOfTruth.topic}</p></div>
               {sourceOfTruth.dates.length > 0 && <div><span className="text-xs font-bold text-slate-400 uppercase">Dates</span><p className="text-sm">{sourceOfTruth.dates.join(', ')}</p></div>}
               {sourceOfTruth.locations.length > 0 && <div><span className="text-xs font-bold text-slate-400 uppercase">Locations</span><p className="text-sm">{sourceOfTruth.locations.join(', ')}</p></div>}
               {sourceOfTruth.warnings.length > 0 && <div><span className="text-xs font-bold text-slate-400 uppercase">Warnings</span><p className="text-sm text-rose-600">{sourceOfTruth.warnings.join(', ')}</p></div>}
               {sourceOfTruth.instructions.length > 0 && <div><span className="text-xs font-bold text-slate-400 uppercase">Instructions</span><p className="text-sm text-amber-600">{sourceOfTruth.instructions.join(', ')}</p></div>}
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
              <span className="bg-indigo-100 text-indigo-700 w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">2</span>
              Generated Content
            </h3>
            <div className="flex gap-2 mb-3">
              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded">{content.role}</span>
              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded">{content.format}</span>
            </div>
            <p className="text-sm text-slate-700 whitespace-pre-wrap font-serif bg-slate-50 p-4 rounded-lg border border-slate-100">{content.content}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-slate-900 flex items-center">
                <span className="bg-emerald-100 text-emerald-700 w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">3</span>
                Validation Analysis
              </h3>
              <span className="text-2xl font-black text-slate-800">{result.score}% <span className="text-sm font-medium text-slate-500 block text-right -mt-1">Match</span></span>
            </div>
            
            <div className="space-y-4 flex-1">
              {result.preserved_facts.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center"><Check className="w-3 h-3 text-emerald-500 mr-1"/> Preserved Facts</h4>
                  <ul className="space-y-1.5">
                    {result.preserved_facts.map((fact, i) => (
                      <li key={i} className="text-sm text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded flex items-start">
                        <Check className="w-4 h-4 mr-1.5 mt-0.5 flex-shrink-0" /> {fact}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.missing_facts.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase mt-4 mb-2 flex items-center"><X className="w-3 h-3 text-rose-500 mr-1"/> Missing Facts</h4>
                  <ul className="space-y-1.5">
                    {result.missing_facts.map((fact, i) => (
                      <li key={i} className="text-sm text-rose-700 bg-rose-50 px-2.5 py-1.5 rounded flex items-start">
                        <X className="w-4 h-4 mr-1.5 mt-0.5 flex-shrink-0" /> {fact}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.altered_facts.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-500 uppercase mt-4 mb-2 flex items-center"><AlertCircle className="w-3 h-3 text-amber-500 mr-1"/> Altered Facts</h4>
                  <ul className="space-y-1.5">
                    {result.altered_facts.map((fact, i) => (
                      <li key={i} className="text-sm text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded flex items-start">
                        <AlertCircle className="w-4 h-4 mr-1.5 mt-0.5 flex-shrink-0" /> {fact}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {!isPass && (
              <div className="mt-8 space-y-3 pt-6 border-t border-slate-100">
                <button 
                  onClick={handleRegenerate}
                  disabled={regenerating}
                  className="w-full flex items-center justify-center px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${regenerating ? 'animate-spin' : ''}`} />
                  {regenerating ? 'Regenerating...' : 'Regenerate Content'}
                </button>
                <button className="w-full flex items-center justify-center px-4 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors">
                  <UserCheck className="w-4 h-4 mr-2" />
                  Request Human Review
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
