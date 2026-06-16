"use client";

import React, { useRef, useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [highlightMatch, setHighlightMatch] = useState<string | null>(null);
  
  // 🔴 Dynamic Loading Message සඳහා State
  const [loadingMessage, setLoadingMessage] = useState("කරුණාකර රැඳී සිටින්න...\nAI මගින් ගොනු විශ්ලේෂණය කරමින් පවතී.");

  const handleBrowseClick = () => fileInputRef.current?.click();
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) addFiles(Array.from(event.target.files));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(false); };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) addFiles(Array.from(e.dataTransfer.files));
  };

  const addFiles = (newFiles: File[]) => {
    setSelectedFiles(prevFiles => {
      const combinedFiles = [...prevFiles, ...newFiles];
      return combinedFiles.filter((file, index, self) => index === self.findIndex((f) => f.name === file.name));
    });
  };

  const removeFile = (indexToRemove: number) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
  };

  const handleAnalyze = async () => {
    if (selectedFiles.length === 0) return;
    setIsAnalyzing(true);
    setSummary(null);
    setExtractedText(null);
    setHighlightMatch(null);
    setLoadingMessage("කරුණාකර රැඳී සිටින්න...\nAI මගින් ගොනු විශ්ලේෂණය කරමින් පවතී.");

    // 🔴 තත්පර 12කට පසුව Server Busy පණිවිඩය පෙන්වයි
    const slowServerTimer = setTimeout(() => {
      setLoadingMessage("Server කාර්යබහුල බැවින් වෙනත් සේවාදායකයක් භාවිතා කරමින් පවතී.\nකරුණාකර රැඳී සිටින්න...");
    }, 12000);

    const formData = new FormData();
    selectedFiles.forEach(file => formData.append('files', file));

    try {
      const response = await fetch('http://localhost:3000/analyzer/upload', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      
      clearTimeout(slowServerTimer);
      setIsAnalyzing(false);
      
      if (result.success) {
        setSummary(result.message);
        setExtractedText(result.fullText);
      } else {
        // 🔴 ඔයා ඉල්ලපු පැහැදිලි Error පණිවිඩය
        alert(result.message || "කණගාටුයි! තාක්ෂණික දෝෂයක් සිදුවිය.");
      }
    } catch (error) {
      clearTimeout(slowServerTimer);
      setIsAnalyzing(false);
      alert("කණගාටුයි! මේ මොහොතේ ඔබගේ සේවාව තාක්ෂණික ගැටලුවක් නිසා ලබා දිය නොහැකියි. ගොනු ප්‍රමාණය අඩු කර හෝ මඳ වේලාවකට පසු නැවත උත්සාහ කරන්න.");
    }
  };

  const handleReset = () => {
    setSummary(null);
    setExtractedText(null);
    setSelectedFiles([]);
    setHighlightMatch(null);
  };

  const handleTextClick = (clickedContent: string) => {
    if (!extractedText || !clickedContent) return;
    const cleanQuery = clickedContent.replace(/[^a-zA-Z0-9\s]/g, ' ').toLowerCase().trim();
    const queryWords = cleanQuery.split(/\s+/).filter(w => w.length > 3); 
    if (queryWords.length === 0) return;
    const sentences = extractedText.split(/(?<=[.!?\n])/);
    let bestMatch = ""; let maxScore = 0;

    sentences.forEach(sentence => {
      const cleanSentence = sentence.toLowerCase();
      let score = 0;
      queryWords.forEach(word => { if (cleanSentence.includes(word)) score++; });
      if (score > maxScore) { maxScore = score; bestMatch = sentence; }
    });

    if (maxScore >= 2 && bestMatch) {
      setHighlightMatch(bestMatch);
      setTimeout(() => {
        const element = document.getElementById('highlighted-section');
        if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } else {
      setHighlightMatch(null); 
    }
  };

  const handleDownloadPDF = () => { window.print(); };

  const renderOriginalText = () => {
    if (!extractedText) return null;
    if (!highlightMatch) return extractedText;
    const parts = extractedText.split(highlightMatch);
    if (parts.length === 1) return extractedText;
    return (
      <>
        {parts[0]}
        <span id="highlighted-section" className="bg-yellow-500/40 text-yellow-100 font-bold px-1.5 py-0.5 rounded shadow-[0_0_15px_rgba(234,179,8,0.4)] transition-all duration-700 animate-pulse">
          {highlightMatch}
        </span>
        {parts.slice(1).join(highlightMatch)}
      </>
    );
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; background-color: #0f172a !important; }
          @page { margin: 1cm; }
        }
      `}} />

      <main className="min-h-screen bg-[#0a0f1c] text-white flex flex-col lg:flex-row font-sans overflow-hidden">
        
        {/* වම් පැත්ත */}
        <div className="w-full lg:w-5/12 h-screen overflow-y-auto border-r border-slate-800 p-8 lg:p-12 bg-gradient-to-br from-slate-900 to-[#0a0f1c] flex flex-col custom-scrollbar relative scroll-smooth print:hidden">
          
          {!extractedText ? (
            <>
              {/* 🔴 නව Vibe එක සහ Marketing Labels */}
              <div className="mb-10">
                <div className="inline-block px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-semibold tracking-wide mb-4">
                  🦊 Powered By Capital D 👑
                </div>
                <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 leading-snug">
                  සංකීර්ණ ඉංග්‍රීසි ලියවිලි, <br/>සරල සිංහලෙන්.
                </h1>
                <p className="text-slate-400 text-sm leading-relaxed mb-2">
                  ඔබගේ ගොනු මෙහි උඩුගත කරන්න. ඉන්පසු පහත ඇති <strong className="text-slate-300">✨ Analyze with AI 🤖</strong> බොත්තම ඔබන්න.
                </p>
                <p className="text-slate-500 text-xs leading-relaxed">
                  AI තාක්ෂණය මගින් තත්පර කිහිපයකින් මුළු ගොනුවම කියවා, එහි සාරාංශය සරල සිංහලෙන් දකුණු පසින් පෙන්වනු ඇත.
                </p>
              </div>

              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all duration-300 mb-6 ${isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 hover:border-slate-500 bg-slate-800/30'}`}
              >
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 text-blue-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-200 mb-2">ගොනු මෙතැනට අදින්න (Drag & Drop)</h3>
                <p className="text-slate-500 text-xs mb-6">Supports English & Sinhala PDF, DOCX, TXT</p>
                
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.docx,.txt" multiple />
                
                <button onClick={handleBrowseClick} className="bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium py-2.5 px-6 rounded-full transition-colors cursor-pointer shadow-lg">
                  Browse Files
                </button>
              </div>
              
              {selectedFiles.length > 0 && (
                <div className="flex flex-col flex-grow">
                  <div className="bg-slate-900/50 rounded-xl p-4 mb-6 border border-slate-800 flex-grow max-h-48 overflow-y-auto custom-scrollbar">
                    <p className="text-xs text-slate-500 mb-3 font-semibold uppercase tracking-wider">තෝරාගත් ගොනු ({selectedFiles.length})</p>
                    <ul className="space-y-2">
                      {selectedFiles.map((file, index) => (
                        <li key={index} className="flex items-center justify-between bg-slate-800/50 px-3 py-2.5 rounded-lg border border-slate-700/50 group">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <span className="text-blue-400">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M4.462 2.5a.5.5 0 00-.5.5v14a.5.5 0 00.5.5h11.076a.5.5 0 00.5-.5v-14a.5.5 0 00-.5-.5H4.462zm1.038 2a.5.5 0 01.5-.5h7.5a.5.5 0 01.5.5v11a.5.5 0 01-.5.5H6a.5.5 0 01-.5-.5V4.5z" clipRule="evenodd" /></svg>
                            </span> 
                            <span className="truncate text-sm text-slate-300">{file.name}</span>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); removeFile(index); }} className="text-slate-500 hover:text-red-400 p-1 rounded transition-colors opacity-0 group-hover:opacity-100" title="ඉවත් කරන්න">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <button 
                    onClick={handleAnalyze} 
                    disabled={isAnalyzing}
                    className={`w-full font-bold py-3.5 px-8 rounded-xl shadow-lg transition-all duration-300 ${isAnalyzing ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/20 cursor-pointer'}`}
                  >
                    {isAnalyzing ? 'Analyzing...' : '✨ Analyze with AI 🤖'}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col h-full animate-fade-in">
              <div className="flex items-center justify-between mb-6 sticky top-0 bg-gradient-to-b from-[#0a0f1c] to-transparent pb-4 z-10">
                <div>
                  <h2 className="text-xl font-bold text-slate-200">මුල් අන්තර්ගතය</h2>
                  <p className="text-xs text-slate-500 mt-1">දකුණු පස ඇති සාරාංශයේ වාක්‍යයක් Click කර මෙහි බලන්න.</p>
                </div>
                <button onClick={handleReset} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg transition-colors border border-slate-700">
                  ආපසු යන්න
                </button>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 flex-grow font-mono text-[13px] text-slate-400 leading-relaxed whitespace-pre-wrap shadow-inner relative">
                {renderOriginalText()}
              </div>
            </div>
          )}
        </div>

        {/* දකුණු පැත්ත */}
        <div className="w-full lg:w-7/12 h-screen overflow-y-auto p-8 lg:p-14 bg-slate-900 custom-scrollbar relative print:w-full print:h-auto print:overflow-visible print:p-0">
          
          {!isAnalyzing && !summary && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40 print:hidden">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-24 h-24 mb-6 text-slate-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <h2 className="text-xl font-medium text-slate-300">ප්‍රතිඵල මෙහි දිස්වනු ඇත</h2>
              <p className="text-slate-500 mt-2 text-sm max-w-sm">ගොනුවක් තෝරා "Analyze with AI" බොත්තම ඔබන්න.</p>
            </div>
          )}

          {isAnalyzing && (
            <div className="h-full flex flex-col items-center justify-center print:hidden px-4">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin"></div>
                <div className="absolute inset-2 rounded-full border-r-2 border-indigo-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
                <div className="absolute inset-4 rounded-full border-b-2 border-purple-500 animate-spin" style={{ animationDuration: '2s' }}></div>
              </div>
              {/* 🔴 නව Loading Messages මෙහි දිස්වේ */}
              <h3 className="text-lg font-medium text-blue-400 mt-8 text-center leading-relaxed whitespace-pre-wrap animate-pulse">
                {loadingMessage}
              </h3>
              <p className="text-slate-500 mt-3 text-sm text-center bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700/50">
                ඔබ ඇතුලත් කළ ගොනු වල ප්‍රමාණය අනුව ගතවන කාලය තීරණය වේ.
              </p>
            </div>
          )}

          {summary && (
            <div className="animate-fade-in pb-10">
              <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="text-blue-500">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7"><path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.577 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.577 2.577l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.577-2.577l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5zM16.5 15a.75.75 0 01.712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 010 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 01-1.422 0l-.395-1.183a1.5 1.5 0 00-.948-.948l-1.183-.395a.75.75 0 010-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0116.5 15z" clipRule="evenodd" /></svg>
                  </span>
                  විශ්ලේෂණ ප්‍රතිඵලය
                </h2>
                
                <button 
                  onClick={handleDownloadPDF} 
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all text-sm border bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-blue-500/30 print:hidden cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                  Save as PDF
                </button>
              </div>
              
              <div id="pdf-content" className="text-slate-300 leading-relaxed font-light">
                <ReactMarkdown
                  components={{
                    h3: ({node, ...props}) => <h3 onClick={(e) => handleTextClick((e.currentTarget as HTMLElement).textContent || '')} className="text-xl font-bold text-indigo-400 mt-8 mb-4 border-l-4 border-indigo-500 pl-3 cursor-pointer hover:text-indigo-300 transition-colors" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-6 space-y-2 marker:text-blue-500" {...props} />,
                    li: ({node, ...props}) => <li onClick={(e) => { e.stopPropagation(); handleTextClick((e.currentTarget as HTMLElement).textContent || ''); }} className="pl-1 cursor-pointer hover:bg-indigo-500/10 hover:text-indigo-200 rounded px-2 py-1.5 transition-colors border-l-2 border-transparent hover:border-indigo-400 mb-2" {...props} />,
                    p: ({node, ...props}) => <p onClick={(e) => { e.stopPropagation(); handleTextClick((e.currentTarget as HTMLElement).textContent || ''); }} className="mb-4 cursor-pointer hover:bg-indigo-500/10 hover:text-indigo-200 rounded px-2 py-1.5 transition-colors border-l-2 border-transparent hover:border-indigo-400" {...props} />,
                    code: ({node, ...props}) => <span className="hidden" {...props} />,
                    hr: ({node, ...props}) => <hr className="border-slate-800 my-8" {...props} />,
                    strong: ({node, ...props}) => <strong className="text-slate-200 font-semibold" {...props} />,
                  }}
                >
                  {summary}
                </ReactMarkdown>
              </div>
            </div>
          )}

        </div>
      </main>
    </>
  );
}