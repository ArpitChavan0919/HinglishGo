
import React, { useState, useCallback, useRef } from 'react';
import { 
  Languages, 
  Upload, 
  Copy, 
  Download, 
  Trash2, 
  Settings2, 
  Check,
  Loader2,
  FileText,
  X
} from 'lucide-react';
import Header from './components/Header';
import { translateToHinglish } from './services/geminiService';
import { extractTextFromFile } from './utils/documentParser';
import { TranslationTone, TranslationState } from './types';

const App: React.FC = () => {
  const [state, setState] = useState<TranslationState>({
    inputText: '',
    outputText: '',
    isTranslating: false,
    error: null,
    tone: TranslationTone.CASUAL,
    fileName: null
  });
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTranslate = async () => {
    if (!state.inputText.trim()) {
      setState(prev => ({ ...prev, error: "Please enter some text or upload a file." }));
      return;
    }

    setState(prev => ({ ...prev, isTranslating: true, error: null }));
    try {
      const result = await translateToHinglish(state.inputText, state.tone);
      setState(prev => ({ ...prev, outputText: result, isTranslating: false }));
    } catch (err: any) {
      setState(prev => ({ ...prev, error: err.message, isTranslating: false }));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setState(prev => ({ ...prev, isTranslating: true, error: null, fileName: file.name }));
    try {
      const text = await extractTextFromFile(file);
      setState(prev => ({ 
        ...prev, 
        inputText: text, 
        isTranslating: false 
      }));
    } catch (err: any) {
      setState(prev => ({ 
        ...prev, 
        error: err.message, 
        isTranslating: false, 
        fileName: null 
      }));
    }
    // Reset file input so same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCopy = () => {
    if (!state.outputText) return;
    navigator.clipboard.writeText(state.outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!state.outputText) return;
    const blob = new Blob([state.outputText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `translated_${state.fileName?.split('.')[0] || 'text'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    setState({
      inputText: '',
      outputText: '',
      isTranslating: false,
      error: null,
      tone: TranslationTone.CASUAL,
      fileName: null
    });
  };

  const wordCount = state.inputText.trim() ? state.inputText.trim().split(/\s+/).length : 0;
  const charCount = state.inputText.length;

  return (
    <div className="min-h-screen flex flex-col pb-20">
      <Header />

      <main className="flex-grow max-w-5xl mx-auto w-full px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          
          {/* Input Section */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[500px]">
            <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                <Languages size={18} className="text-blue-500" />
                <span>Source Text</span>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500 flex items-center gap-1.5 text-xs font-medium"
                  title="Upload Document"
                >
                  <Upload size={16} />
                  <span className="hidden sm:inline">Upload</span>
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  className="hidden" 
                  accept=".txt,.docx,.pdf"
                />
                <button 
                  onClick={handleClear}
                  className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors text-gray-500"
                  title="Clear All"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="relative flex-grow flex flex-col">
              <textarea
                value={state.inputText}
                onChange={(e) => setState(prev => ({ ...prev, inputText: e.target.value }))}
                placeholder="Paste English or Hindi text here..."
                className="w-full flex-grow p-6 text-lg bg-transparent focus:outline-none resize-none custom-scrollbar"
              />
              {state.fileName && (
                <div className="mx-6 mb-4 p-3 bg-blue-50 rounded-xl flex items-center justify-between text-sm text-blue-700">
                  <div className="flex items-center gap-2">
                    <FileText size={16} />
                    <span className="font-medium truncate max-w-[150px]">{state.fileName}</span>
                  </div>
                  <button onClick={() => setState(prev => ({ ...prev, fileName: null, inputText: '' }))}>
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-50 flex items-center justify-between text-[11px] text-gray-400 font-medium">
              <span>{wordCount} words / {charCount} chars</span>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                   <Settings2 size={12} />
                   <select 
                    value={state.tone} 
                    onChange={(e) => setState(prev => ({ ...prev, tone: e.target.value as TranslationTone }))}
                    className="bg-transparent border-none focus:ring-0 cursor-pointer hover:text-gray-600 transition-colors"
                   >
                     <option value={TranslationTone.CASUAL}>Casual Spoken</option>
                     <option value={TranslationTone.FORMAL}>Formal Respectful</option>
                   </select>
                </div>
              </div>
            </div>
          </div>

          {/* Output Section */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[500px]">
            <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                <Check size={18} className="text-green-500" />
                <span>Hinglish Output</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleCopy}
                  disabled={!state.outputText}
                  className="p-2 hover:bg-gray-200 disabled:opacity-30 rounded-full transition-colors text-gray-500"
                  title="Copy Text"
                >
                  {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                </button>
                <button 
                  onClick={handleDownload}
                  disabled={!state.outputText}
                  className="p-2 hover:bg-gray-200 disabled:opacity-30 rounded-full transition-colors text-gray-500"
                  title="Download as .txt"
                >
                  <Download size={16} />
                </button>
              </div>
            </div>

            <div className="flex-grow p-6 text-lg text-gray-700 bg-gray-50/30 overflow-y-auto custom-scrollbar whitespace-pre-wrap leading-relaxed">
              {state.isTranslating ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3">
                  <Loader2 className="animate-spin text-blue-500" size={32} />
                  <p className="text-sm font-medium">Creating magic...</p>
                </div>
              ) : state.outputText ? (
                state.outputText
              ) : (
                <div className="h-full flex items-center justify-center text-gray-300 text-base italic text-center px-10">
                  Click the translate button to see results here
                </div>
              )}
            </div>
            
            {state.error && (
              <div className="mx-6 mt-4 p-3 bg-red-50 rounded-xl text-xs text-red-600 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <span className="font-bold">Error:</span> {state.error}
              </div>
            )}

            <div className="p-4">
              <button
                onClick={handleTranslate}
                disabled={state.isTranslating || !state.inputText.trim()}
                className={`w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all transform active:scale-[0.98] shadow-lg shadow-blue-500/20
                  ${state.isTranslating || !state.inputText.trim() 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' 
                    : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-blue-500/30'}
                `}
              >
                {state.isTranslating ? (
                   <span className="flex items-center justify-center gap-2">
                     <Loader2 size={20} className="animate-spin" />
                     Translating...
                   </span>
                ) : (
                  "Translate to Hinglish"
                )}
              </button>
            </div>
          </div>

        </div>

        {/* Info Cards */}
        <section className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100">
            <div className="w-10 h-10 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center mb-4">
              <Languages size={20} />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Natural flow</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              We focus on how people actually speak. "How are you?" becomes "Aap kaise ho?" instead of literal translation.
            </p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-gray-100">
            <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center mb-4">
              <FileText size={20} />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Docs Support</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Upload PDF, DOCX, or TXT files. We extract the content and convert the whole document to Hinglish.
            </p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-gray-100">
            <div className="w-10 h-10 bg-green-50 text-green-500 rounded-xl flex items-center justify-center mb-4">
              <Settings2 size={20} />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Formal & Casual</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Switch between "Tu" and "Aap" effortlessly by toggling our Formal and Casual tone settings.
            </p>
          </div>
        </section>
      </main>

      <footer className="mt-20 py-8 px-6 border-t border-gray-100 text-center text-sm text-gray-400">
        <p>&copy; {new Date().getFullYear()} HinglishGo. Built for natural conversations.</p>
      </footer>
    </div>
  );
};

export default App;
