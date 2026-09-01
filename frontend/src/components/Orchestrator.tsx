import { useState } from 'react';
import { ArrowRight, ArrowLeft, Users, Layout, Globe, MessageSquare } from 'lucide-react';
import type { SourceOfTruth } from '../types';
import { generateCommunication } from '../api';

interface Props {
  sourceOfTruth: SourceOfTruth;
  setGeneratedContents: (contents: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const roles = ['Senior Official', 'Field Officer', 'Citizen', 'Media Team', 'Social Media Team'];
const formats = ['Executive Summary', 'Public Advisory', 'Action Checklist', 'Press Release', 'Social Media Post', 'Presentation', 'Q&A / FAQ'];
const languages = ['English', 'Tamil', 'Hindi', 'Telugu', 'Malayalam', 'Kannada'];
const channels = ['Dashboard', 'WhatsApp', 'Email', 'PDF', 'Social Media'];

export default function Orchestrator({ sourceOfTruth, setGeneratedContents, onNext, onBack }: Props) {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleSelection = (setter: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    setter(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const handleGenerate = async () => {
    if (!selectedRoles.length || !selectedFormats.length || !selectedLanguages.length || !selectedChannels.length) {
      alert('Please select at least one item from each category.');
      return;
    }
    setLoading(true);
    try {
      const results = await generateCommunication({
        roles: selectedRoles,
        formats: selectedFormats,
        languages: selectedLanguages,
        channels: selectedChannels,
        source_of_truth: sourceOfTruth
      });
      setGeneratedContents(results);
      onNext();
    } catch (error) {
      console.error(error);
      alert('Failed to generate communications');
    } finally {
      setLoading(false);
    }
  };

  const SelectGroup = ({ title, icon: Icon, items, selected, setter }: any) => (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-slate-100">
        <Icon className="h-5 w-5 text-slate-500" />
        <h3 className="font-semibold text-slate-800">{title}</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item: string) => (
          <button
            key={item}
            onClick={() => toggleSelection(setter, item)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
              selected.includes(item)
                ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm'
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Communication Orchestrator</h2>
        <p className="text-slate-600 mt-1">Select dimensions to generate tailored communications.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SelectGroup title="Role / Audience" icon={Users} items={roles} selected={selectedRoles} setter={setSelectedRoles} />
        <SelectGroup title="Format" icon={Layout} items={formats} selected={selectedFormats} setter={setSelectedFormats} />
        <SelectGroup title="Language" icon={Globe} items={languages} selected={selectedLanguages} setter={setSelectedLanguages} />
        <SelectGroup title="Channel" icon={MessageSquare} items={channels} selected={selectedChannels} setter={setSelectedChannels} />
      </div>

      {/* Selected Configuration Summary */}
      <div className="mt-8 bg-slate-100 p-6 rounded-xl border border-slate-200">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Orchestration Summary</h3>
        <div className="flex flex-wrap items-center gap-2 text-slate-700 font-medium text-lg">
          {selectedRoles.length > 0 ? <span className="text-blue-700">{selectedRoles.join(', ')}</span> : <span className="text-slate-400 italic">Select Roles</span>}
          <span className="text-slate-400">×</span>
          {selectedFormats.length > 0 ? <span className="text-emerald-700">{selectedFormats.join(', ')}</span> : <span className="text-slate-400 italic">Select Formats</span>}
          <span className="text-slate-400">×</span>
          {selectedLanguages.length > 0 ? <span className="text-purple-700">{selectedLanguages.join(', ')}</span> : <span className="text-slate-400 italic">Select Languages</span>}
          <span className="text-slate-400">×</span>
          {selectedChannels.length > 0 ? <span className="text-rose-700">{selectedChannels.join(', ')}</span> : <span className="text-slate-400 italic">Select Channels</span>}
        </div>
        <p className="text-sm text-slate-500 mt-2">
           Will generate {Math.max(1, selectedRoles.length) * Math.max(1, selectedFormats.length) * Math.max(1, selectedLanguages.length) * Math.max(1, selectedChannels.length)} unique packages.
        </p>
      </div>

      <div className="flex justify-between pt-6 border-t border-slate-200">
        <button onClick={onBack} className="flex items-center px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Source of Truth
        </button>
        <button 
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
        >
          {loading ? 'Generating...' : 'Generate Communication Package'}
          {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
