/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  BrainCircuit, 
  Search, 
  Package, 
  ArrowRight, 
  Plus, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  FileText, 
  Send, 
  Loader2, 
  Mail, 
  UserPlus, 
  ChevronRight,
  AlertCircle,
  X,
  CheckCircle2
} from 'lucide-react';
import Markdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { generateAgentOutput, AgentType } from './services/geminiService';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---

type AppState = 'welcome' | 'workspace';
type GenerationState = 'idle' | 'composing' | 'generating' | 'ready' | 'error';

interface Agent {
  id: AgentType;
  name: string;
  description: string;
  icon: React.ReactNode;
  bullets: string[];
}

const AGENTS: Agent[] = [
  {
    id: 'brainstorm',
    name: 'Brainstorm',
    description: 'Expand → critique → synthesize into one strong option',
    icon: <BrainCircuit className="w-5 h-5" />,
    bullets: [
      'Wide-range idea expansion',
      'Critical analysis of options',
      'Synthesis into one strong concept',
      'Feasibility assessment',
      'Refined interaction model'
    ]
  },
  {
    id: 'ux-audit',
    name: 'UX Audit',
    description: 'Checks quality (consistency + accessibility) and prioritizes fixes',
    icon: <Search className="w-5 h-5" />,
    bullets: [
      'Accessibility compliance check',
      'Consistency & pattern audit',
      'Usability heuristic evaluation',
      'Impact vs. Effort prioritization',
      'Actionable fix recommendations'
    ]
  },
  {
    id: 'handoff',
    name: 'Handoff Pack',
    description: 'Generates dev-ready specs: states, edge cases, criteria',
    icon: <Package className="w-5 h-5" />,
    bullets: [
      'Comprehensive state definitions',
      'Edge case identification',
      'Clear acceptance criteria',
      'Technical constraint notes',
      'Developer-ready documentation'
    ]
  }
];

// --- Components ---

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-[var(--color-surface-white)] rounded-[var(--radius-lg)] shadow-2xl w-full max-w-md overflow-hidden border border-[var(--color-border-subtle)]">
        <div className="px-6 py-4 border-b border-[var(--color-border-subtle)] flex items-center justify-between">
          <h3 className="font-semibold text-[var(--color-text-primary)]">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-[var(--color-surface-light)] rounded-full transition-colors">
            <X className="w-5 h-5 text-[var(--color-text-muted)]/40" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

const Toast = ({ message, type = 'error', onClose }: { message: string; type?: 'error' | 'success'; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={cn(
      "fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium z-[100] animate-in fade-in slide-in-from-bottom-4",
      type === 'error' ? "bg-[var(--color-error)] text-white" : "bg-[var(--color-brand-primary)] text-white"
    )}>
      {type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
      {message}
    </div>
  );
};

export default function App() {
  const [view, setView] = useState<AppState>('welcome');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [genState, setGenState] = useState<GenerationState>('idle');
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [output, setOutput] = useState('');
  const [version, setVersion] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [email, setEmail] = useState('');

  const outputRef = useRef<HTMLDivElement>(null);

  const handleSelectAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setView('workspace');
    setGenState('composing');
  };

  const handleAddAttachment = (type: string) => {
    if (genState === 'ready') return;
    setAttachments(prev => [...prev, type]);
  };

  const handleRun = async () => {
    if (!input && attachments.length === 0) return;
    if (!selectedAgent) return;

    setGenState('generating');
    try {
      const result = await generateAgentOutput(selectedAgent.id, input || "Demo request with attachments");
      setOutput(result || '');
      setGenState('ready');
      setVersion(`V1 · ${selectedAgent.name} Output`);
    } catch (error) {
      setGenState('error');
      setToast({ message: "We couldn't process your request. Please try again", type: 'error' });
    }
  };

  const handleRetry = () => {
    handleRun();
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSignupOpen(true);
  };

  // --- Render Views ---

  if (view === 'welcome') {
    return (
      <div className="min-h-screen bg-[var(--color-surface-default)] text-[var(--color-text-primary)] font-sans selection:bg-[var(--color-brand-primary)]/10">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <header className="mb-16 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] text-xs font-bold uppercase tracking-wider mb-6">
              <Sparkles className="w-3 h-3" />
              waand beta
            </div>
            <h1 className="text-5xl font-bold tracking-tight mb-4">What are you designing today?</h1>
            <p className="text-xl text-[var(--color-text-muted)] max-w-2xl mx-auto">
              Pick an agent and get a structured output in minutes. 
              <span className="block mt-2 text-sm font-medium text-[var(--color-text-muted)]/60">Try one run without an account. Sign up to save and run again.</span>
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {AGENTS.map((agent) => (
              <button
                key={agent.id}
                onClick={() => handleSelectAgent(agent)}
                className="group relative bg-[var(--color-surface-white)] p-8 rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] shadow-sm hover:shadow-xl hover:border-[var(--color-brand-primary)]/30 transition-all text-left flex flex-col h-full"
              >
                <div className="w-12 h-12 rounded-xl bg-[var(--color-surface-light)] flex items-center justify-center mb-6 group-hover:bg-[var(--color-brand-primary)]/10 group-hover:text-[var(--color-brand-primary)] transition-colors">
                  {agent.icon}
                </div>
                <h3 className="text-lg font-bold mb-2">{agent.name}</h3>
                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed mb-8 flex-grow">
                  {agent.description}
                </p>
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-brand-primary)] opacity-0 group-hover:opacity-100 transition-opacity">
                  Start session <ArrowRight className="w-3 h-3" />
                </div>
              </button>
            ))}
          </div>

          <footer className="text-center pt-8 border-t border-[var(--color-border-subtle)]">
            <p className="text-sm text-[var(--color-text-muted)] mb-4">Want to save your work from the start?</p>
            <button 
              onClick={() => setIsSignupOpen(true)}
              className="btn btn--primary !text-sm !h-12 !px-8 whitespace-nowrap"
            >
              <UserPlus className="w-4 h-4" />
              Create account
            </button>
          </footer>
        </div>

        <Modal isOpen={isSignupOpen} onClose={() => setIsSignupOpen(false)} title="Demo mode">
          <div className="space-y-6">
            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
              This is a demo version. Registration will be available later
            </p>
            <button 
              onClick={() => setIsSignupOpen(false)}
              className="btn btn--primary w-full !h-12 !text-sm"
            >
              Got it
            </button>
          </div>
        </Modal>

        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    );
  }

  return (
    <div className="h-screen bg-[var(--color-surface-white)] flex flex-col text-[var(--color-text-primary)] font-sans overflow-hidden">
      {/* Header */}
      <header className="h-14 border-b border-[var(--color-border-subtle)] px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setView('welcome')}
            className="font-bold text-lg tracking-tight hover:text-[var(--color-brand-primary)] transition-colors"
          >
            waand
          </button>
          <div className="h-4 w-px bg-[var(--color-border-subtle)]" />
          <div className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-muted)]">
            <span className="bg-[var(--color-surface-default)] px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider text-[var(--color-text-muted)]/60">Demo</span>
            <ChevronRight className="w-4 h-4 text-[var(--color-border-subtle)]" />
            <span className="text-[var(--color-text-primary)]">{selectedAgent?.name}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSignupOpen(true)}
            className="text-sm font-bold px-4 py-1.5 rounded-full border border-[var(--color-border-subtle)] hover:bg-[var(--color-surface-light)] transition-colors"
          >
            Sign up
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-grow flex overflow-hidden">
        {/* Left Panel: Prompt */}
        <div className="w-80 border-r border-[var(--color-border-subtle)] flex flex-col p-6 shrink-0 bg-[var(--color-surface-light)]">
          <div className="flex-grow">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)]/60 mb-4">Prompt</h2>
            <p className="text-sm text-[var(--color-text-muted)] mb-6 leading-relaxed">
              Add a prompt or drop materials to get a structured output
            </p>
            
            <div className="bg-[var(--color-brand-primary)]/5 border border-[var(--color-brand-primary)]/10 rounded-[var(--radius-lg)] p-4 mb-6">
              <p className="text-xs text-[var(--color-brand-primary)] leading-relaxed">
                <span className="font-bold">Tip:</span> To get a good demo, share a bit of context — a short brief + a link or screenshot.
                <br />
                1 run available in demo
              </p>
            </div>

            <div className="relative mb-4">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={genState === 'ready' || genState === 'generating'}
                placeholder="Describe your task, paste context, or add links and screenshots"
                className="input-field !h-48 !p-4 text-sm resize-none focus:ring-0 outline-none transition-all disabled:opacity-50 disabled:bg-[var(--color-surface-default)]"
              />
              
              <div className="flex flex-wrap gap-2 mt-3">
                {attachments.map((at, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-2 py-1 bg-[var(--color-surface-white)] border border-[var(--color-border-subtle)] rounded-md text-[10px] font-bold text-[var(--color-text-muted)] animate-in zoom-in-95">
                    {at === 'link' && <LinkIcon className="w-3 h-3" />}
                    {at === 'image' && <ImageIcon className="w-3 h-3" />}
                    {at === 'file' && <FileText className="w-3 h-3" />}
                    {at.toUpperCase()}
                    <button 
                      onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))}
                      className="hover:text-[var(--color-error)]"
                      disabled={genState === 'ready' || genState === 'generating'}
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 mb-8">
              <button 
                onClick={() => handleAddAttachment('link')}
                disabled={genState === 'ready' || genState === 'generating'}
                className="p-2 rounded-lg border border-[var(--color-border-subtle)] hover:bg-[var(--color-surface-white)] hover:border-[var(--color-brand-primary)]/30 transition-all text-[var(--color-text-muted)] hover:text-[var(--color-brand-primary)] disabled:opacity-50"
                title="Add link"
              >
                <LinkIcon className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleAddAttachment('image')}
                disabled={genState === 'ready' || genState === 'generating'}
                className="p-2 rounded-lg border border-[var(--color-border-subtle)] hover:bg-[var(--color-surface-white)] hover:border-[var(--color-brand-primary)]/30 transition-all text-[var(--color-text-muted)] hover:text-[var(--color-brand-primary)] disabled:opacity-50"
                title="Upload image"
              >
                <ImageIcon className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleAddAttachment('file')}
                disabled={genState === 'ready' || genState === 'generating'}
                className="p-2 rounded-lg border border-[var(--color-border-subtle)] hover:bg-[var(--color-surface-white)] hover:border-[var(--color-brand-primary)]/30 transition-all text-[var(--color-text-muted)] hover:text-[var(--color-brand-primary)] disabled:opacity-50"
                title="Upload file"
              >
                <FileText className="w-4 h-4" />
              </button>
            </div>
          </div>

          <button
            onClick={handleRun}
            disabled={(!input && attachments.length === 0) || genState === 'generating' || genState === 'ready'}
            className={cn(
              "btn btn--primary w-full !text-lg !h-14 whitespace-nowrap",
              genState === 'ready' && "is-disabled"
            )}
          >
            {genState === 'generating' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Run {selectedAgent?.name}
              </>
            )}
          </button>
        </div>

        {/* Center Panel: Output */}
        <div className="flex-grow flex flex-col overflow-hidden bg-[var(--color-surface-white)]">
          <div className="flex-grow overflow-y-auto p-12" ref={outputRef}>
            {genState === 'composing' && (
              <div className="max-w-2xl mx-auto py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-light)] flex items-center justify-center mx-auto mb-8 text-[var(--color-text-muted)]/30">
                  {selectedAgent?.icon}
                </div>
                <h2 className="text-2xl font-bold mb-4">Your output will appear here</h2>
                <p className="text-[var(--color-text-muted)] mb-12">Run waand to generate a structured result you can review and refine</p>
                
                <div className="grid grid-cols-1 gap-3 text-left max-w-md mx-auto">
                  {selectedAgent?.bullets.map((bullet, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-surface-light)]/50 text-sm font-medium text-[var(--color-text-muted)]">
                      <div className="w-5 h-5 rounded-full bg-[var(--color-surface-white)] border border-[var(--color-border-subtle)] flex items-center justify-center text-[10px] font-bold text-[var(--color-text-muted)]/40">
                        {i + 1}
                      </div>
                      {bullet}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {genState === 'generating' && (
              <div className="max-w-2xl mx-auto py-20">
                <div className="flex flex-col items-center text-center">
                  <div className="relative w-20 h-20 mb-8">
                    <div className="absolute inset-0 border-4 border-[var(--color-brand-primary)]/10 rounded-full" />
                    <div className="absolute inset-0 border-4 border-[var(--color-brand-primary)] rounded-full border-t-transparent animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center text-[var(--color-brand-primary)]">
                      {selectedAgent?.icon}
                    </div>
                  </div>
                  <h2 className="text-xl font-bold mb-2">Generating output...</h2>
                  <div className="space-y-2 w-full max-w-xs">
                    <div className="h-1 bg-[var(--color-surface-default)] rounded-full overflow-hidden">
                      <div className="h-full bg-[var(--color-brand-primary)] w-1/3 animate-[loading_2s_infinite]" />
                    </div>
                    <p className="text-xs text-[var(--color-text-muted)] font-medium animate-pulse">Analyzing context and requirements</p>
                    <p className="text-xs text-[var(--color-text-muted)] font-medium animate-pulse delay-75">Structuring design directions</p>
                  </div>
                </div>
              </div>
            )}

            {genState === 'ready' && (
              <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="prose prose-indigo max-w-none">
                  <div className="markdown-body">
                    <Markdown>{output}</Markdown>
                  </div>
                </div>

                {/* Post-generation Banners */}
                <div className="mt-20 space-y-6">
                  <div className="bg-[var(--color-neutral-900)] text-[var(--color-surface-white)] p-8 rounded-3xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                      <Sparkles className="w-32 h-32" />
                    </div>
                    <div className="relative z-10">
                      <h3 className="text-xl font-bold mb-2">Want to keep working in waand?</h3>
                      <p className="text-[var(--color-neutral-400)] mb-6 max-w-md">
                        Create an account to unlock copy, saved versions, and unlimited runs. Pick a plan that fits your needs.
                      </p>
                      <button 
                        onClick={() => setIsSignupOpen(true)}
                        className="btn btn--secondary !text-sm !h-12 !px-6 !bg-white !text-black hover:!bg-[var(--color-neutral-100)] whitespace-nowrap shrink-0"
                      >
                        Create account
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-[var(--color-surface-light)] border border-[var(--color-border-subtle)] p-8 rounded-3xl">
                    <h3 className="text-xl font-bold mb-2">Want to come back to this later?</h3>
                    <p className="text-[var(--color-text-muted)] mb-6">
                      Demo results aren’t saved automatically. Email yourself a copy so you don’t lose it.
                    </p>
                    <form onSubmit={handleEmailSubmit} className="flex gap-3 max-w-md">
                      <input 
                        type="email" 
                        required
                        placeholder="Work email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input-field !h-12 !px-4 !text-sm flex-grow"
                      />
                      <button 
                        type="submit"
                        className="btn btn--primary !text-sm !h-12 !px-6 whitespace-nowrap shrink-0"
                      >
                        <Mail className="w-4 h-4" />
                        Email me
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {genState === 'error' && (
              <div className="max-w-2xl mx-auto py-20">
                <div className="bg-red-50 border border-red-100 p-8 rounded-2xl">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                      <AlertCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-red-900 mb-2">Generation interrupted</h3>
                      <p className="text-red-700 mb-6">
                        We generated a partial result, but something went wrong. Please retry to finish the output.
                      </p>
                      <button 
                        onClick={handleRetry}
                        className="btn btn--primary !bg-red-600 hover:!bg-red-700 !text-sm !h-10 !px-6 whitespace-nowrap"
                      >
                        Retry generation
                      </button>
                    </div>
                  </div>
                </div>
                {output && (
                  <div className="mt-12 opacity-50 grayscale pointer-events-none">
                    <div className="markdown-body">
                      <Markdown>{output}</Markdown>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Versions */}
        <div className="w-64 border-l border-[var(--color-border-subtle)] flex flex-col p-6 shrink-0 bg-[var(--color-surface-light)]">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)]/60 mb-6">Versions</h2>
          
          {!version ? (
            <div className="flex-grow flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full border border-dashed border-[var(--color-border-subtle)] flex items-center justify-center mb-4 text-[var(--color-text-muted)]/30">
                <Plus className="w-5 h-5" />
              </div>
              <p className="text-xs text-[var(--color-text-muted)]/60 font-medium px-4">
                Your version history will show up here after the first run
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="p-3 bg-[var(--color-surface-white)] border border-[var(--color-brand-primary)]/20 rounded-[var(--radius-lg)] shadow-sm flex items-center gap-3 animate-in slide-in-from-right-4">
                <div className="w-2 h-2 rounded-full bg-[var(--color-brand-primary)] animate-pulse" />
                <span className="text-xs font-bold">{version}</span>
              </div>
              <p className="text-[10px] text-[var(--color-text-muted)]/60 font-medium px-1">
                Each run creates a new version
              </p>
            </div>
          )}

          <div className="mt-auto pt-6 border-t border-[var(--color-border-subtle)]">
            <div className="bg-[var(--color-surface-white)] p-4 rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] shadow-sm">
              <p className="text-[10px] font-bold text-[var(--color-text-muted)]/60 uppercase tracking-wider mb-2">Pro Tip</p>
              <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed">
                Connect your Figma account to import components directly into waand.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Modal isOpen={isSignupOpen} onClose={() => setIsSignupOpen(false)} title="Demo mode">
        <div className="space-y-6">
          <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
            This is a demo version. Registration will be available later
          </p>
          <button 
            onClick={() => setIsSignupOpen(false)}
            className="btn btn--primary w-full !h-12 !text-sm"
          >
            Got it
          </button>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
        .markdown-body h1 { font-size: 2.25rem; font-weight: 800; margin-bottom: 1.5rem; letter-spacing: -0.025em; }
        .markdown-body h2 { font-size: 1.5rem; font-weight: 700; margin-top: 2.5rem; margin-bottom: 1rem; letter-spacing: -0.025em; }
        .markdown-body h3 { font-size: 1.25rem; font-weight: 700; margin-top: 2rem; margin-bottom: 0.75rem; }
        .markdown-body p { margin-bottom: 1.25rem; line-height: 1.75; color: #4B5563; }
        .markdown-body ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1.5rem; }
        .markdown-body li { margin-bottom: 0.5rem; color: #4B5563; }
        .markdown-body strong { color: #111827; font-weight: 600; }
      `}</style>
    </div>
  );
}
