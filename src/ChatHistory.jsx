import React, { useState } from 'react';

export default function ChatHistory({ chats, activeChatId, setActiveChatId, startNewChat, onSettingsClick }) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <aside className={`bg-card border-r border-border text-card-foreground flex flex-col transition-all duration-300 ease-in-out ${isCollapsed ? 'w-16' : 'w-64'}`}>
      <div className={`p-4 flex items-center border-b border-border ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && <h2 className="text-lg font-semibold text-foreground">History</h2>}
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
           <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          <button onClick={startNewChat} className={`w-full text-left flex items-center gap-3 p-2.5 rounded-lg font-medium text-foreground bg-background border border-border hover:bg-accent transition-colors ${isCollapsed ? 'justify-center' : ''}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
            {!isCollapsed && <span>New Chat</span>}
          </button>
        </div>
        
        <nav className="mt-2 p-2 space-y-1">
          {Object.entries(chats).reverse().map(([id, chat]) => (
            <button key={id} onClick={() => setActiveChatId(id)} className={`block w-full text-left p-2.5 rounded-lg truncate transition-colors font-medium ${activeChatId === id ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'} ${isCollapsed ? 'text-center' : ''}`} title={chat.title}>
              {isCollapsed ? chat.title.charAt(0).toUpperCase() : chat.title}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-2 border-t border-border">
        <button onClick={onSettingsClick} className={`w-full text-left flex items-center gap-3 p-2.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground font-medium transition-colors ${isCollapsed ? 'justify-center' : ''}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>
          {!isCollapsed && <span>Settings</span>}
        </button>
      </div>
    </aside>
  );
}