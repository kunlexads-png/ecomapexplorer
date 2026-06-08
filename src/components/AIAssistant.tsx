import React, { useState, useRef, useEffect } from "react";
import { ChatMessage } from "../types";
import { Sparkles, Send, RefreshCcw, AlertTriangle, HelpCircle, Flame, ShieldAlert, Footprints } from "lucide-react";

interface AIAssistantProps {
  isDark: boolean;
}

export default function AIAssistant({ isDark }: AIAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-msg",
      role: "assistant",
      content: `Hello! I am the **EcoMap AI Environmental Assistant**, powered by the Google GenAI framework. 

I can help you:
- Analyze regional environmental scorecards.
- Suggest practical corporate and household sustainability roadmaps.
- Explain climate risk dynamics or wildlife conservation strategies.

What ecological topic can I assist you with today?`,
      timestamp: new Date().toLocaleTimeString()
    }
  ]);

  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `m-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const historyMsg = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: historyMsg })
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMsg: ChatMessage = {
          id: `m-${Date.now() + 1}`,
          role: "assistant",
          content: data.text,
          timestamp: new Date().toLocaleTimeString()
        };
        setMessages(prev => [...prev, assistantMsg]);
      } else {
        throw new Error("Failed to compile advice.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage("Connection to environmental intelligence service interrupted. Please retry your query.");
    } finally {
      setIsLoading(false);
    }
  };

  // Clickable preset advisor queries
  const handlePresetClick = (preset: string) => {
    setInput(preset);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: "welcome-msg-reset",
        role: "assistant",
        content: `Conversation logs refreshed. Let me know what air quality indicators, biodiversity studies, or carbon mitigation plans we should discuss next!`,
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
    setErrorMessage(null);
  };

  return (
    <div id="ecological-ai-chat-panel" className="flex flex-col h-[520px] lg:h-[580px] rounded-2xl overflow-hidden border border-emerald-500/15">
      
      {/* Header bar */}
      <div className="bg-slate-900/90 text-white p-4 flex items-center justify-between border-b border-emerald-500/15">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Sparkles className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider font-display">
              EcoAI Environmental Assistant
            </h2>
            <p className="text-[10px] text-slate-400">Secure full-stack carbon-planning Q&A</p>
          </div>
        </div>

        <button
          id="clear-chat-logs"
          onClick={handleClearChat}
          className="text-slate-400 hover:text-white transition-colors p-2 text-xs font-mono"
          title="Reset conversation locks"
        >
          <RefreshCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Messages core container scroll panel */}
      <div className={`flex-1 p-4 overflow-y-auto ${
        isDark ? "bg-slate-950/60" : "bg-slate-50/70"
      }`}>
        <div className="space-y-4">
          
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col max-w-[85%] ${
                msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
              }`}
            >
              <span className="text-[8px] text-slate-500 font-mono mb-1">{msg.timestamp}</span>
              <div className={`p-3 rounded-2xl text-xs leading-relaxed md:text-[12.5px] ${
                msg.role === "user"
                  ? "bg-emerald-500 text-white rounded-br-none"
                  : isDark 
                    ? "bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none"
                    : "bg-white border border-slate-200 text-slate-800 rounded-bl-none"
              }`}>
                {/* Simplified markdown formatter for cleaner display without extra large dependencies */}
                <span className="whitespace-pre-line">
                  {msg.content.split("\n").map((line, idx) => {
                    let formatted = line;
                    // Format lists
                    if (formatted.startsWith("- ")) {
                      return <span key={idx} className="block pl-3 relative mt-1"><span className="absolute left-0">•</span>{formatted.substring(2)}</span>;
                    }
                    if (formatted.match(/^\d+\.\s/)) {
                      return <span key={idx} className="block mt-1 font-semibold text-emerald-400">{formatted}</span>;
                    }
                    // Bold tags
                    if (formatted.includes("**")) {
                      const chunks = formatted.split("**");
                      return (
                        <span key={idx} className="block mt-0.5">
                          {chunks.map((ch, ci) => ci % 2 === 1 ? <strong key={ci} className="text-emerald-400 font-bold">{ch}</strong> : ch)}
                        </span>
                      );
                    }
                    return <span key={idx} className="block mt-0.5">{formatted}</span>;
                  })}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="mr-auto items-start flex flex-col">
              <span className="text-[8px] text-slate-500 font-mono mb-1">EcoAI is thinking...</span>
              <div className="p-3 bg-slate-900 text-slate-400 text-xs rounded-xl rounded-bl-none flex items-center gap-2 border border-slate-800">
                <RefreshCcw className="w-3.5 h-3.5 animate-spin" />
                <span>Reading ecological registers...</span>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="mx-auto text-center p-3 rounded-xl border border-red-500/20 bg-red-950/15 max-w-[80%] text-xs flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Preset Fast Advisors */}
      <div className={`p-2.5 border-t border-slate-900 border-b border-slate-850 flex items-center gap-2 overflow-x-auto ${
        isDark ? "bg-slate-950" : "bg-slate-100/50"
      }`}>
        <span className="text-[9.5px] uppercase font-mono font-bold text-slate-500 flex items-center gap-1 shrink-0">
          <HelpCircle className="w-3 h-3 text-emerald-400" /> Presets:
        </span>
        <button
          id="preset-aquatic"
          onClick={() => handlePresetClick("Explain how temperature rises affect Great Barrier Reef Bleaching?")}
          className="px-2.5 py-1 text-[10px] rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/20 whitespace-nowrap transition-all"
        >
          礁 Great Barrier Heat
        </button>
        <button
          id="preset-footprints"
          onClick={() => handlePresetClick("Suggest 4 easy steps to offset personal household carbon footprints.")}
          className="px-2.5 py-1 text-[10px] rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/20 whitespace-nowrap transition-all"
        >
          👣 Offset Footprints
        </button>
        <button
          id="preset-canopy"
          onClick={() => handlePresetClick("Explain the Sahel 'Great Green Wall' progress & Acacia agroforests.")}
          className="px-2.5 py-1 text-[10px] rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/20 whitespace-nowrap transition-all"
        >
          🌳 Great Green Wall
        </button>
      </div>

      {/* Inputs tray */}
      <form onSubmit={handleSendMessage} className={`p-3.5 flex gap-2 border-t ${
        isDark ? "bg-slate-950/90 border-slate-900" : "bg-white border-slate-200"
      }`}>
        <input
          id="chat-user-input"
          type="text"
          placeholder="Ask about global carbon goals, wildlife passages..."
          className={`flex-1 text-xs px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
            isDark 
              ? "bg-slate-900/80 border-slate-800 text-white placeholder-slate-500" 
              : "bg-white border-slate-200 text-slate-800 placeholder-slate-400"
          }`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
        />
        <button
          id="send-chat-msg"
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg px-4 flex items-center gap-1.5 transition-all text-xs font-semibold shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send</span>
        </button>
      </form>

    </div>
  );
}
