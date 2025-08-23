import React, { useState, useRef, useEffect, useCallback } from "react";
import ChatHistory from "./ChatHistory.jsx";
import SettingsModal from "./SettingsModal.jsx";
import Welcome from "./Welcome.jsx";
import MemoizedChatMessage from "./ChatMessage.jsx";
import { CustomPromptInput } from "./components/ui/custom-prompt-input.jsx";
import API_CONFIG from "./config.js";

const promptSuggestions = [
  "What are you working on?",
  "What's on your mind today?",
  "Where should we begin?",
  "What's on the agenda today?",
];

export default function App() {
  const [url, setUrl] = useState("https://mcp.zapier.com/api/mcp/s/NTgzNzgzZTctZWQ2Ni00ZjUwLTkwYzMtNTIwNTM2ZGFmN2JjOjFiNDcyMTEzLWRmMTEtNGNiOS1hNzY3LTRkM2VmZGNlOGRiNg==/mcp");
  const [userPrompt, setUserPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState("openai");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [autoExecute, setAutoExecute] = useState(false);
  const [chats, setChats] = useState({ "1": { title: "New Chat", messages: [] } });
  const [activeChatId, setActiveChatId] = useState("1");
  const [suggestion, setSuggestion] = useState("");

  const messagesEndRef = useRef(null);
  const textAreaRef = useRef(null);
  const messages = chats[activeChatId]?.messages || [];

  useEffect(() => {
    setSuggestion(promptSuggestions[Math.floor(Math.random() * promptSuggestions.length)]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [userPrompt]);

  const addMessage = useCallback((message) => {
    setChats(prev => {
        const currentMessages = prev[activeChatId]?.messages || [];
        return {
            ...prev,
            [activeChatId]: {
                ...prev[activeChatId],
                messages: [...currentMessages, message]
            }
        };
    });
  }, [activeChatId]);

  // **BUG FIX**: This function now only populates the text area and focuses it.
  // It no longer triggers the submission automatically.
  const handleStarterPromptClick = (prompt) => {
    setUserPrompt(prompt);
    textAreaRef.current?.focus();
  };

  const analyzePromptWithAI = async () => {
    const currentPrompt = userPrompt.trim();
    if (!currentPrompt) return;
    if (!url) {
        addMessage({id: Date.now(), role: 'error', content: 'Please set the MCP Webhook URL in settings.', type: 'text', timestamp: new Date()});
        setIsSettingsOpen(true);
        return;
    }

    setIsLoading(true);
    
    let currentChatId = activeChatId;
    const isNewChat = (chats[currentChatId]?.messages.length || 0) === 0;

    if (isNewChat) {
        const newChatId = Date.now().toString();
        const newTitle = currentPrompt.substring(0, 30) + (currentPrompt.length > 30 ? '...' : '');
        
        setChats(prev => {
            const newChats = { ...prev };
            newChats[newChatId] = { title: newTitle, messages: [] };
            if (newChats["1"]?.messages.length === 0) delete newChats["1"];
            return newChats;
        });
        setActiveChatId(newChatId);
        currentChatId = newChatId;
    }

    const userMessage = {id: Date.now(), role: 'user', content: currentPrompt, type: 'text', timestamp: new Date()};
    const thinkingMessage = {id: Date.now() + 1, role: 'assistant', content: 'Thinking...', type: 'thinking', timestamp: new Date()};

    setChats(prev => ({
        ...prev,
        [currentChatId]: {
            ...prev[currentChatId],
            messages: [...(prev[currentChatId]?.messages || []), userMessage, thinkingMessage]
        }
    }));
    setUserPrompt("");

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AI}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: selectedProvider, prompt: currentPrompt, mcpUrl: url })
      });
      const data = await response.json();
      
      let finalMessage;
      if (data.error) {
        finalMessage = {id: Date.now(), role: 'error', content: data.error, type: 'text', timestamp: new Date()};
      } else if (data.mode === "chat") {
        finalMessage = {id: Date.now(), role: 'assistant', content: data.response || data.plan, type: 'text', timestamp: new Date()};
      } else {
        if (autoExecute) {
            executePlan(data);
        } else {
            finalMessage = {id: Date.now(), role: 'assistant', content: formatPlanMessage(data), type: 'plan', actions: data.actions || [], timestamp: new Date()};
        }
      }

      setChats(prev => {
        const newChats = { ...prev };
        const updatedMessages = newChats[currentChatId].messages.filter(msg => msg.type !== 'thinking');
        if (finalMessage) {
            updatedMessages.push(finalMessage);
        }
        newChats[currentChatId] = { ...newChats[currentChatId], messages: updatedMessages };
        return newChats;
      });

    } catch (err) {
        const errorMessage = {id: Date.now(), role: 'error', content: `Failed to analyze prompt: ${err.message}`, type: 'text', timestamp: new Date()};
        setChats(prev => {
            const newChats = { ...prev };
            const updatedMessages = newChats[currentChatId].messages.filter(msg => msg.type !== 'thinking');
            updatedMessages.push(errorMessage);
            newChats[currentChatId] = { ...newChats[currentChatId], messages: updatedMessages };
            return newChats;
        });
    } finally {
      setIsLoading(false);
    }
  };

  const executePlan = async (plan) => {
    if (!plan.actions?.length) {
        addMessage({id: Date.now(), role: 'error', content: 'No actions to execute.', type: 'text', timestamp: new Date()});
        return;
    }
    
    addMessage({id: Date.now(), role: 'assistant', content: 'Executing...', type: 'executing', timestamp: new Date()});

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EXECUTE}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actions: plan.actions, mcpUrl: url })
      });
      const data = await response.json();
      
      let resultMessageContent;
      if (data.error) {
        resultMessageContent = data.error;
      } else {
        resultMessageContent = "**Execution Results:**\n\n" + data.results.map((res, i) => `**${i + 1}. ${res.action}** - ${res.success ? "✅ Success" : "❌ Failed"}\n` + (res.success && res.result ? `   - **Result:** \`${JSON.stringify(res.result)}\`\n` : '') + (res.error ? `   - **Error:** ${res.error}\n` : '')).join('');
      }
      const resultMessage = {id: Date.now(), role: 'assistant', content: resultMessageContent, type: 'markdown', timestamp: new Date()};

      setChats(prev => {
        const newChats = { ...prev };
        const updatedMessages = newChats[activeChatId].messages.filter(msg => msg.type !== 'executing');
        updatedMessages.push(resultMessage);
        newChats[activeChatId] = { ...newChats[activeChatId], messages: updatedMessages };
        return newChats;
      });

    } catch (err) {
        const errorMessage = {id: Date.now(), role: 'error', content: `Failed to execute plan: ${err.message}`, type: 'text', timestamp: new Date()};
        setChats(prev => {
            const newChats = { ...prev };
            const updatedMessages = newChats[activeChatId].messages.filter(msg => msg.type !== 'executing');
            updatedMessages.push(errorMessage);
            newChats[activeChatId] = { ...newChats[activeChatId], messages: updatedMessages };
            return newChats;
        });
    }
  };

  const formatPlanMessage = (plan) => {
    let message = `**I have a plan to address your request:**\n\n${plan.plan}\n\n`;
    if (plan.actions?.length > 0) {
      message += "**Actions:**\n" + plan.actions.map((act, i) => `\n**${i + 1}. ${act.tool}**\n   - **Reasoning:** ${act.reasoning}\n   - **Parameters:** \`${JSON.stringify(act.parameters)}\``).join('');
      message += "\n\nShall I proceed?";
    }
    return message;
  };

  const startNewChat = () => {
    const newChatId = Date.now().toString();
    setChats(prev => ({ ...prev, [newChatId]: { title: "New Chat", messages: [] } }));
    setActiveChatId(newChatId);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      analyzePromptWithAI();
    }
  };

  const onConfirmExecution = (messageId, actions) => {
    if (!actions) return;
    setChats(prev => {
      const newChats = { ...prev };
      const currentMessages = newChats[activeChatId]?.messages || [];
      newChats[activeChatId] = { ...newChats[activeChatId], messages: currentMessages.filter(msg => msg.id !== messageId) };
      return newChats;
    });
    executePlan({ actions });
  };

  const onCancelExecution = (messageId) => {
    setChats(prev => {
      const newChats = { ...prev };
      const currentMessages = newChats[activeChatId]?.messages || [];
      newChats[activeChatId] = { ...newChats[activeChatId], messages: currentMessages.filter(msg => msg.id !== messageId) };
      return newChats;
    });
    addMessage({id: Date.now(), role: 'assistant', content: 'Execution cancelled. How else can I help you?', type: 'text', timestamp: new Date()});
  };

  const handleEditMessage = (messageId, content) => {
    setUserPrompt(content);
    // Focus on the input field
    const inputElement = document.querySelector('textarea');
    if (inputElement) {
      inputElement.focus();
    }
  };

  const hasStartedChat = messages.length > 0;

  return (
    <div className="font-sans antialiased bg-white flex h-screen overflow-hidden">
      <ChatHistory chats={chats} activeChatId={activeChatId} setActiveChatId={setActiveChatId} startNewChat={startNewChat} onSettingsClick={() => setIsSettingsOpen(true)} />
      <div className="flex-1 flex flex-col h-screen relative bg-white">
        <main className={`flex-1 overflow-y-auto transition-all duration-500 ${!hasStartedChat ? 'flex items-center justify-center' : 'pt-6 pb-6'}`}>
          {!hasStartedChat ? <Welcome suggestion={suggestion} onPromptClick={handleStarterPromptClick} /> : (
            <div className="w-full max-w-4xl mx-auto px-6 space-y-0 overflow-hidden">
              {messages.map((message, index) => (
                <MemoizedChatMessage key={message.id} message={message} onConfirm={onConfirmExecution} onCancel={onCancelExecution} onEdit={handleEditMessage} style={{ '--animation-delay': `${index * 100}ms` }} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </main>
        <footer className={`p-4 transition-all duration-500 w-full border-t border-gray-200 bg-white ${!hasStartedChat ? 'absolute bottom-1/4 left-1/2 -translate-x-1/2 max-w-4xl border-none' : ''}`}>
          <div className="max-w-4xl mx-auto">
            <CustomPromptInput
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              onSubmit={analyzePromptWithAI}
              placeholder="Ask me anything..."
              disabled={isLoading}
              selectedProvider={selectedProvider}
              onProviderChange={setSelectedProvider}
              className="shadow-sm border-gray-300 focus-within:ring-1 focus-within:ring-gray-400 focus-within:border-gray-400 transition-all rounded-xl"
            />
          </div>
        </footer>
      </div>
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} url={url} setUrl={setUrl} selectedProvider={selectedProvider} setSelectedProvider={setSelectedProvider} autoExecute={autoExecute} setAutoExecute={setAutoExecute} />
    </div>
  );
}