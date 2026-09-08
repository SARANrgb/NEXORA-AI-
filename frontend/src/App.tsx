import { useState, useEffect } from 'react';
import { 
  FileText, 
  Settings, 
  FileOutput, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  Sliders, 
  Flame, 
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import SourceOfTruthView from './components/SourceOfTruthView';
import Orchestrator from './components/Orchestrator';
import GeneratedPackage from './components/GeneratedPackage';
import ValidationView from './components/ValidationView';
import FinalPackage from './components/FinalPackage';
import type { SourceOfTruth, GeneratedContent, ValidationResult } from './types';
import { DEMO_SOURCE_OF_TRUTH } from './services/sourceOfTruthService';
import { validationService } from './services/validationService';
import { API_BASE } from './apiConfig';

const steps = [
  { id: 1, name: 'SOURCE', shortName: 'Source', icon: FileText },
  { id: 2, name: 'SOURCE OF TRUTH', shortName: 'Truth', icon: Settings },
  { id: 3, name: 'ORCHESTRATE', shortName: 'Config', icon: Sliders },
  { id: 4, name: 'GENERATE', shortName: 'Generated', icon: FileOutput },
  { id: 5, name: 'VALIDATE', shortName: 'Audit', icon: ShieldCheck },
  { id: 6, name: 'APPROVE', shortName: 'Package', icon: CheckCircle2 },
];

export default function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [sourceOfTruth, setSourceOfTruth] = useState<SourceOfTruth | null>(DEMO_SOURCE_OF_TRUTH);
  const [generatedContents, setGeneratedContents] = useState<GeneratedContent[]>([]);
  const [validationResults, setValidationResults] = useState<Record<string, ValidationResult>>({});
  const [selectedContentId, setSelectedContentId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);
  const [backendMode, setBackendMode] = useState<'local' | 'fallback' | 'offline'>('fallback');
  const [backendModel, setBackendModel] = useState<string | null>(null);

  // Probe backend health
  useEffect(() => {
    fetch(`${API_BASE}/health`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'ok') {
          setBackendOnline(true);
          if (data.mode === 'local') {
            setBackendMode('local');
            setBackendModel(data.model || 'Open-Source LLM');
          } else {
            setBackendMode('fallback');
            setBackendModel(null);
          }
        }
      })
      .catch(() => {
        setBackendOnline(false);
        setBackendMode('offline');
      });
  }, []);

  // Scroll to top on step transition
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentStep]);

  const handleToggleMode = () => {
    if (isDemoMode) {
      setIsDemoMode(false);
      setSourceOfTruth(null);
      setGeneratedContents([]);
      setValidationResults({});
      setSelectedContentId(null);
      setCurrentStep(1);
    } else {
      setIsDemoMode(true);
      setSourceOfTruth(DEMO_SOURCE_OF_TRUTH);
      setGeneratedContents([]);
      setValidationResults({});
      setSelectedContentId(null);
      setCurrentStep(1);
    }
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 6));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  const goToStep = (step: number) => {
    setCurrentStep(step);
    setMobileMenuOpen(false);
  };

  // PRIORITY 7 DEMO FAILURE INJECTOR
  const handleInjectFailure = () => {
    const flawedId = 'demo-flawed-p7';
    const sotToUse = sourceOfTruth || DEMO_SOURCE_OF_TRUTH;
    const flawedItem: GeneratedContent = {
      id: flawedId,
      role: 'Field Officer',
      format: 'Action Checklist',
      language: 'English',
      channel: 'WhatsApp',
      content: validationService.getFlawedTextForSot(sotToUse),
      isFlawed: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Prepend flawed item and jump straight into Validation screen
    const existingWithoutFlawed = generatedContents.filter(c => c.id !== flawedId);
    setGeneratedContents([flawedItem, ...existingWithoutFlawed]);
    setSelectedContentId(flawedId);
    setCurrentStep(5); // Jump directly to Validation View
  };

  const handleStartOver = () => {
    setCurrentStep(1);
    setSourceOfTruth(DEMO_SOURCE_OF_TRUTH);
    setGeneratedContents([]);
    setValidationResults({});
    setSelectedContentId(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0908] text-stone-100 selection:bg-red-600 selection:text-white">
      {/* Top Enterprise Header */}
      <header className="sticky top-0 z-40 bg-[#120f0e]/95 backdrop-blur-md border-b border-stone-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Brand Logo & Tagline */}
            <div 
              onClick={() => goToStep(1)} 
              className="flex items-center space-x-3 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-md shadow-red-950 text-white font-extrabold text-lg border border-red-500/30 group-hover:scale-105 transition-transform">
                <Flame className="w-5 h-5 fill-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-black tracking-tight text-white font-sans">
                    NEXORA <span className="text-red-500">AI</span>
                  </span>
                  <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-stone-800 text-stone-300 border border-stone-700">
                    v1.0 MVP
                  </span>
                </div>
                <p className="hidden md:block text-[11px] text-stone-400 font-medium -mt-0.5">
                  Intelligent Communication Orchestration Platform
                </p>
              </div>
            </div>

            {/* Step Progress Indicators (Desktop) */}
            <div className="hidden lg:flex items-center space-x-1">
              {steps.map((step, idx) => {
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                return (
                  <div key={step.id} className="flex items-center">
                    <button
                      onClick={() => goToStep(step.id)}
                      className={`flex items-center px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-red-950/80 text-red-300 border border-red-600/70 shadow-sm shadow-red-950'
                          : isCompleted
                          ? 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/20'
                          : 'text-stone-500 hover:text-stone-300'
                      }`}
                    >
                      <step.icon className={`w-3.5 h-3.5 ${isActive ? 'text-red-400 mr-1.5' : isCompleted ? 'text-emerald-500 mr-1.5' : 'mr-1.5 text-stone-500'}`} />
                      <span>{step.name}</span>
                    </button>
                    {idx < steps.length - 1 && (
                      <ChevronRight className="w-3.5 h-3.5 text-stone-600 mx-0.5" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Right Controls: [ DEMO MODE ] badge & Backend status */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Mode Toggle: DEMO MODE vs UPLOADED SOURCE */}
              <button
                onClick={handleToggleMode}
                className={`touch-target px-3.5 py-1.5 rounded-xl text-xs font-black tracking-wider flex items-center space-x-1.5 border transition-all ${
                  isDemoMode
                    ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-900/40'
                    : 'bg-emerald-950 text-emerald-300 border-emerald-600 shadow-md shadow-emerald-950/40'
                }`}
                title={isDemoMode ? "Currently in Demo Mode (Zero API dependency, deterministic outputs)" : "Currently in Uploaded Source / Custom Mode"}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isDemoMode ? '[ DEMO MODE ]' : '[ UPLOADED SOURCE ]'}</span>
              </button>

              {/* Status Badge */}
              <div 
                className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-stone-900 border border-stone-800 text-[11px] font-mono"
                title={
                  backendOnline 
                    ? backendMode === 'local'
                      ? `Local Open-Source LLM Active (${backendModel})`
                      : 'Local AI Ready • Demo Fallback Active (Deterministic Engine)'
                    : 'Autonomous Client Engine Active'
                }
              >
                <span className={`w-2 h-2 rounded-full ${
                  backendOnline 
                    ? (backendMode === 'local' ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-amber-400') 
                    : 'bg-stone-500'
                }`}></span>
                <span className={backendOnline ? (backendMode === 'local' ? 'text-emerald-400 font-bold' : 'text-stone-300') : 'text-stone-500'}>
                  {backendOnline 
                    ? (backendMode === 'local' ? `LOCAL AI: ${backendModel}` : 'DEMO FALLBACK') 
                    : 'LOCAL ENGINE'}
                </span>
              </div>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg bg-stone-900 text-stone-300 border border-stone-800"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer / Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden px-4 py-3 bg-[#151210] border-t border-stone-800 space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500 px-2 py-1">
              Workflow Navigation:
            </div>
            {steps.map((step) => (
              <button
                key={step.id}
                onClick={() => goToStep(step.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold ${
                  currentStep === step.id
                    ? 'bg-red-950 text-red-300 border border-red-800/60'
                    : 'text-stone-400 hover:bg-stone-800'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <step.icon className="w-4 h-4" />
                  <span>{step.name}</span>
                </div>
                {currentStep === step.id && (
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Horizontal Progress Banner on Mobile/Tablet */}
        <div className="lg:hidden bg-[#161210] border-t border-stone-800/80 px-3 py-1.5 flex items-center justify-between overflow-x-auto text-[11px] font-bold">
          <span className="text-stone-400">Step {currentStep}/6:</span>
          <span className="text-red-400 font-mono uppercase tracking-wider">
            {steps[currentStep - 1]?.name}
          </span>
          <div className="flex space-x-1">
            {steps.map(s => (
              <span
                key={s.id}
                className={`w-2 h-2 rounded-full ${
                  currentStep === s.id
                    ? 'bg-red-500 ring-2 ring-red-900'
                    : currentStep > s.id
                    ? 'bg-emerald-500'
                    : 'bg-stone-700'
                }`}
              ></span>
            ))}
          </div>
        </div>
      </header>

      {/* Main Viewport Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentStep === 1 && (
          <Dashboard 
            onNext={nextStep} 
            setSourceOfTruth={setSourceOfTruth}
            isDemoMode={isDemoMode}
            setIsDemoMode={setIsDemoMode}
          />
        )}

        {currentStep === 2 && (
          <SourceOfTruthView 
            sourceOfTruth={sourceOfTruth} 
            onNext={nextStep} 
            onBack={prevStep}
            setSourceOfTruth={setSourceOfTruth}
          />
        )}

        {currentStep === 3 && (
          <Orchestrator 
            sourceOfTruth={sourceOfTruth!} 
            setGeneratedContents={setGeneratedContents}
            onNext={nextStep}
            onBack={prevStep}
            isDemoMode={isDemoMode}
          />
        )}

        {currentStep === 4 && (
          <GeneratedPackage 
            contents={generatedContents}
            validationResults={validationResults}
            sourceOfTruth={sourceOfTruth}
            onValidate={(id) => {
              setSelectedContentId(id);
              goToStep(5);
            }}
            onNext={nextStep}
            onBack={prevStep}
            onInjectFailure={handleInjectFailure}
            onUpdateContent={(id, newContent) => {
              setGeneratedContents(prev =>
                prev.map(c => c.id === id ? { ...c, content: newContent, isFlawed: false } : c)
              );
              setValidationResults(prev => {
                const copy = { ...prev };
                delete copy[id];
                return copy;
              });
            }}
          />
        )}

        {currentStep === 5 && (
          <ValidationView 
            content={
              generatedContents.find(c => c.id === selectedContentId) || 
              generatedContents[0] || {
                id: 'fallback-01',
                role: 'Field Officer',
                format: 'Action Checklist',
                language: 'English',
                channel: 'WhatsApp',
                content: validationService.getCorrectedDemoText()
              }
            }
            sourceOfTruth={sourceOfTruth || DEMO_SOURCE_OF_TRUTH}
            onResult={(res) => {
              if (selectedContentId) {
                setValidationResults(prev => ({ ...prev, [selectedContentId]: res }));
              }
            }}
            onBack={() => goToStep(4)}
            onRegenerate={(newContent) => {
              if (selectedContentId) {
                setGeneratedContents(prev =>
                  prev.map(c => c.id === selectedContentId ? { ...c, content: newContent, isFlawed: false } : c)
                );
              }
            }}
            onApprove={() => goToStep(6)}
          />
        )}

        {currentStep === 6 && (
          <FinalPackage 
            contents={generatedContents}
            validationResults={validationResults}
            sourceOfTruth={sourceOfTruth}
            onBack={() => goToStep(4)}
            onStartOver={handleStartOver}
          />
        )}
      </main>

      {/* Global Footer */}
      <footer className="bg-[#0f0d0c] border-t border-stone-800/80 py-4 px-4 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span className="font-semibold text-stone-400">Nexora AI</span> • Intelligent Communication Orchestration Platform
          </div>
          <div className="font-mono text-[11px] text-stone-600">
            One Source → Source of Truth → Orchestrate → Generate → Validate → Approve
          </div>
        </div>
      </footer>
    </div>
  );
}
