import { ArrowRight, ArrowLeft, Info, Calendar, MapPin, AlertTriangle, Users, CheckSquare } from 'lucide-react';
import type { SourceOfTruth } from '../types';

interface Props {
  sourceOfTruth: SourceOfTruth | null;
  onNext: () => void;
  onBack: () => void;
}

export default function SourceOfTruthView({ sourceOfTruth, onNext, onBack }: Props) {
  if (!sourceOfTruth) return null;

  const sections = [
    { title: 'Dates & Times', icon: Calendar, data: sourceOfTruth.dates, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Locations', icon: MapPin, data: sourceOfTruth.locations, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Entities & Stakeholders', icon: Users, data: sourceOfTruth.entities, color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'Warnings & Risks', icon: AlertTriangle, data: sourceOfTruth.warnings, color: 'text-rose-600', bg: 'bg-rose-50' },
    { title: 'Instructions & Actions', icon: CheckSquare, data: sourceOfTruth.instructions, color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: 'Key Facts', icon: Info, data: sourceOfTruth.key_facts, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Extracted Source of Truth</h2>
          <p className="text-slate-600 mt-1">This structured data will ground all generated communications.</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Topic</h3>
        <p className="text-xl font-medium text-slate-900">{sourceOfTruth.topic}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
            <div className="flex items-center space-x-3 mb-4">
              <div className={`p-2 rounded-lg ${section.bg} ${section.color}`}>
                <section.icon className="h-5 w-5" />
              </div>
              <h4 className="font-semibold text-slate-800">{section.title}</h4>
            </div>
            <ul className="space-y-2 flex-1">
              {section.data.length > 0 ? (
                section.data.map((item, i) => (
                  <li key={i} className="text-slate-600 text-sm flex items-start">
                    <span className="mr-2 mt-1 block h-1.5 w-1.5 rounded-full bg-slate-300 flex-shrink-0"></span>
                    <span>{item}</span>
                  </li>
                ))
              ) : (
                <li className="text-slate-400 text-sm italic">None extracted</li>
              )}
            </ul>
          </div>
        ))}
      </div>

      <div className="flex justify-between pt-8 border-t border-slate-200 mt-8">
        <button onClick={onBack} className="flex items-center px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Input
        </button>
        <button onClick={onNext} className="flex items-center px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
          Configure Orchestration
          <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
