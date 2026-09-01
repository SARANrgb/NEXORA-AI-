import { useState } from 'react';
import { FileText, Settings, FileOutput, ShieldCheck, CheckCircle } from 'lucide-react';
import Dashboard from './components/Dashboard';
import SourceOfTruthView from './components/SourceOfTruthView';
import Orchestrator from './components/Orchestrator';
import GeneratedPackage from './components/GeneratedPackage';
import ValidationView from './components/ValidationView';
import FinalPackage from './components/FinalPackage';
import type { SourceOfTruth, GeneratedContent, ValidationResult } from './types';

const steps = [
  { id: 1, name: 'Dashboard', icon: FileText },
  { id: 2, name: 'Source of Truth', icon: Settings },
  { id: 3, name: 'Orchestrator', icon: Settings },
  { id: 4, name: 'Generated Package', icon: FileOutput },
  { id: 5, name: 'Validation', icon: ShieldCheck },
  { id: 6, name: 'Final Package', icon: CheckCircle },
];

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [sourceOfTruth, setSourceOfTruth] = useState<SourceOfTruth | null>(null);
  const [generatedContents, setGeneratedContents] = useState<GeneratedContent[]>([]);
  const [validationResults, setValidationResults] = useState<Record<string, ValidationResult>>({});
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 6));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  const goToStep = (step: number) => setCurrentStep(step);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <ShieldCheck className="h-8 w-8 text-blue-600 mr-2" />
              <div>
                <h1 className="text-xl font-bold text-slate-900 leading-tight">COMMUNI-AI</h1>
                <p className="text-xs text-slate-500 font-medium">Intelligent Communication Orchestration</p>
              </div>
            </div>
            <div className="flex space-x-1">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    currentStep === step.id
                      ? 'bg-blue-100 text-blue-700'
                      : currentStep > step.id
                      ? 'text-green-600'
                      : 'text-slate-400'
                  }`}
                >
                  <step.icon className={`h-4 w-4 ${currentStep === step.id ? 'mr-2' : ''}`} />
                  {currentStep === step.id && <span>{step.name}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentStep === 1 && (
          <Dashboard 
            onNext={nextStep} 
            setSourceOfTruth={setSourceOfTruth} 
          />
        )}
        {currentStep === 2 && (
          <SourceOfTruthView 
            sourceOfTruth={sourceOfTruth} 
            onNext={nextStep} 
            onBack={prevStep} 
          />
        )}
        {currentStep === 3 && (
          <Orchestrator 
            sourceOfTruth={sourceOfTruth!} 
            setGeneratedContents={setGeneratedContents}
            onNext={nextStep}
            onBack={prevStep}
          />
        )}
        {currentStep === 4 && (
          <GeneratedPackage 
            contents={generatedContents}
            validationResults={validationResults}
            onValidate={(id) => {
              setSelectedContentId(id);
              goToStep(5);
            }}
            onNext={nextStep}
            onBack={prevStep}
            onInjectFailure={() => {
              const badItem: GeneratedContent = {
                id: 'demo-failure-123',
                role: 'Field Officer',
                format: 'Action Checklist',
                language: 'English',
                channel: 'WhatsApp',
                content: 'Heavy rainfall is expected in District A and District B until August 24. Ensure basic provisions.'
              };
              setGeneratedContents([badItem, ...generatedContents]);
            }}
          />
        )}
        {currentStep === 5 && selectedContentId && (
          <ValidationView 
            content={generatedContents.find(c => c.id === selectedContentId)!}
            sourceOfTruth={sourceOfTruth!}
            onResult={(res) => {
              setValidationResults(prev => ({...prev, [selectedContentId]: res}));
            }}
            onBack={() => goToStep(4)}
            onRegenerate={(newContent) => {
               setGeneratedContents(prev => prev.map(c => c.id === selectedContentId ? { ...c, content: newContent } : c));
               setValidationResults(prev => {
                  const updated = {...prev};
                  delete updated[selectedContentId];
                  return updated;
               });
            }}
          />
        )}
        {currentStep === 6 && (
          <FinalPackage 
            contents={generatedContents}
            validationResults={validationResults}
            onBack={() => goToStep(4)}
            onStartOver={() => {
              setCurrentStep(1);
              setSourceOfTruth(null);
              setGeneratedContents([]);
              setValidationResults({});
            }}
          />
        )}
      </main>
    </div>
  );
}

export default App;
