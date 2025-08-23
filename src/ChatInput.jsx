import React, { useState, useRef, useEffect } from 'react';

export default function ChatInput({ isLoading, onSubmit, selectedProvider, setSelectedProvider, hasStartedChat }) {
  const [prompt, setPrompt] = useState("");
  const textAreaRef = useRef(null);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [prompt]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };
  
  const handleSubmit = () => {
    if (prompt.trim()) {
      onSubmit(prompt);
      setPrompt("");
    }
  };

  return (
    <footer className={`p-4 transition-all duration-500 w-full ${!hasStartedChat ? 'absolute bottom-1/4 left-1/2 -translate-x-1/2 max-w-3xl' : 'bg-transparent'}`}>
      <div className={`max-w-3xl mx-auto transition-opacity ${isLoading ? 'opacity-75' : 'opacity-100'}`}>
        <div className="relative bg-white rounded-2xl shadow-lg border border-slate-200/50 focus-within:ring-2 focus-within:ring-brand-blue transition-all">
          <textarea
            ref={textAreaRef}
            rows={1}
            className="w-full pl-4 pr-32 py-3.5 border-none rounded-2xl focus:outline-none resize-none bg-transparent max-h-48"
            placeholder="Ask me anything..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            autoFocus={!hasStartedChat}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <select
              className="text-xs bg-slate-100 border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-blue transition hover:bg-slate-200"
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              disabled={isLoading}
            >
              <option value="openai">OpenAI</option>
              <option value="gemini">Gemini</option>
              <option value="claude">Claude</option>
              <option value="groq">Groq</option>
            </select>
            <button
              onClick={handleSubmit}
              disabled={isLoading || !prompt.trim()}
              className="bg-brand-blue hover:bg-brand-blue-hover disabled:bg-slate-400 disabled:cursor-not-allowed text-white w-9 h-9 flex items-center justify-center rounded-lg transition-all"
              title="Send"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}