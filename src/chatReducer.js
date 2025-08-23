export const initialState = {
  chats: { "1": { title: "New Chat", messages: [] } },
  activeChatId: "1",
};

export function chatReducer(state, action) {
  const activeChat = state.chats[state.activeChatId];

  switch (action.type) {
    case 'START_NEW_CHAT': {
      const newChatId = Date.now().toString();
      return {
        ...state,
        chats: {
          ...state.chats,
          [newChatId]: { title: "New Chat", messages: [] }
        },
        activeChatId: newChatId,
      };
    }
    
    case 'SET_ACTIVE_CHAT': {
      return { ...state, activeChatId: action.payload };
    }

    case 'SEND_PROMPT': {
      const { prompt } = action.payload;
      const messages = activeChat?.messages || [];
      const isNewChat = messages.length === 0;

      const userMessage = { id: Date.now(), role: 'user', content: prompt, timestamp: new Date() };
      const thinkingMessage = { id: Date.now() + 1, role: 'assistant', content: 'AI is typing...', type: 'thinking', timestamp: new Date() };
      
      let newChats = { ...state.chats };
      let newActiveChatId = state.activeChatId;

      if (isNewChat) {
        newActiveChatId = Date.now().toString();
        const newTitle = prompt.substring(0, 30) + (prompt.length > 30 ? '...' : '');
        newChats[newActiveChatId] = { title: newTitle, messages: [userMessage, thinkingMessage] };
        if (newChats["1"]?.messages.length === 0) {
          delete newChats["1"];
        }
      } else {
        newChats[state.activeChatId] = {
          ...activeChat,
          messages: [...messages, userMessage, thinkingMessage],
        };
      }

      return { ...state, chats: newChats, activeChatId: newActiveChatId };
    }

    case 'RECEIVE_RESPONSE': {
      const { finalMessage } = action.payload;
      if (!activeChat) return state;

      const updatedMessages = activeChat.messages.filter(msg => msg.type !== 'thinking' && msg.type !== 'executing');
      
      if (finalMessage) updatedMessages.push(finalMessage);
      
      return {
        ...state,
        chats: { ...state.chats, [state.activeChatId]: { ...activeChat, messages: updatedMessages } },
      };
    }
    
    // **BUG FIX**: Added a dedicated action to remove a message by its ID.
    // This is used to remove the plan message after "Execute" is clicked.
    case 'REMOVE_MESSAGE': {
      const { messageId } = action.payload;
      if (!activeChat) return state;

      return {
        ...state,
        chats: {
          ...state.chats,
          [state.activeChatId]: {
            ...activeChat,
            messages: activeChat.messages.filter((msg) => msg.id !== messageId),
          },
        },
      };
    }
    
    default:
      return state;
  }
}