import React from 'react';

const ChatMessage = ({ message, onConfirm, onCancel, onEdit, style }) => {
  const formatJsonResult = (text) => {
    try {
      // Extract JSON from backticks if present
      const jsonMatch = text.match(/`({.*})`/s);
      if (jsonMatch) {
        const jsonData = JSON.parse(jsonMatch[1]);
        
        // Format execution results
        if (jsonData.results && Array.isArray(jsonData.results)) {
          let formatted = '';
          jsonData.results.forEach((result, index) => {
            if (result.url) {
              formatted += `\n📎 **Generated Link:** [View Result](${result.url})`;
            }
          });
          
          if (jsonData.execution) {
            const exec = jsonData.execution;
            formatted += `\n\n📋 **Execution Details:**`;
            if (exec.instructions) formatted += `\n• Instructions: ${exec.instructions}`;
            if (exec.params && exec.params.comment) {
              formatted += `\n• Content: "${exec.params.comment.substring(0, 200)}${exec.params.comment.length > 200 ? '...' : ''}"`;
            }
            if (exec.params && exec.params.visibility__code) {
              formatted += `\n• Visibility: ${exec.params.visibility__code}`;
            }
          }
          
          if (jsonData.feedbackUrl) {
            formatted += `\n\n🔗 **Feedback:** [View Execution History](${jsonData.feedbackUrl})`;
          }
          
          return formatted;
        }
      }
    } catch (e) {
      // If parsing fails, return original text
    }
    return text;
  };

  const renderContent = () => {
    if (message.type === 'thinking' || message.type === 'executing') {
      return (
        <div className="flex items-center space-x-1.5 text-gray-600">
          <span className="text-sm">{message.type === 'thinking' ? 'Thinking...' : 'Executing...'}</span>
          <div className="h-2 w-2 bg-gray-600 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
          <div className="h-2 w-2 bg-gray-600 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
          <div className="h-2 w-2 bg-gray-600 rounded-full animate-pulse"></div>
        </div>
      );
    }
    
    if (message.type === 'plan' || message.type === 'markdown') {
      return (
        // **FIX APPLIED HERE**: Added `break-words` to handle long text within markdown/plan content.
        <div className="prose prose-sm max-w-full text-current prose-p:mb-2 prose-strong:text-current break-words overflow-hidden" style={{wordBreak: 'break-all', overflowWrap: 'anywhere'}}>
          {message.content.split('\n').map((line, i) => {
            if (line.startsWith('**') && line.endsWith('**')) return <strong key={i} className="block">{line.substring(2, line.length - 2)}</strong>;
            if (line.startsWith('`') && line.endsWith('`')) {
              const formattedContent = formatJsonResult(line);
              if (formattedContent !== line) {
                return <div key={i} className="bg-blue-50 border-l-4 border-blue-400 p-3 my-2 rounded-r-md">
                  {formattedContent.split('\n').map((subLine, j) => {
                    if (subLine.startsWith('📎 **') || subLine.startsWith('📋 **') || subLine.startsWith('🔗 **')) {
                      const parts = subLine.split('**');
                      return <div key={j} className="font-semibold text-blue-800 mb-1">{parts[0]}<strong>{parts[1]}</strong>{parts[2]}</div>;
                    }
                    if (subLine.startsWith('• ')) {
                      return <div key={j} className="text-gray-700 ml-4 mb-1">{subLine}</div>;
                    }
                    if (subLine.includes('[View Result]') || subLine.includes('[View Execution History]')) {
                      const linkMatch = subLine.match(/\[([^\]]+)\]\(([^\)]+)\)/);
                      if (linkMatch) {
                        return <div key={j} className="ml-4"><a href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">{linkMatch[1]}</a></div>;
                      }
                    }
                    return subLine.trim() ? <div key={j} className="text-gray-700">{subLine}</div> : <div key={j} className="h-1" />;
                  })}
                </div>;
              }
              return <div key={i} className="px-1.5 py-1 bg-slate-100 text-slate-800 text-xs rounded-md font-mono max-w-full block" style={{wordBreak: 'break-all', overflowWrap: 'break-word', whiteSpace: 'pre-wrap', width: '100%', overflow: 'hidden'}}>{line.substring(1, line.length - 1)}</div>;
            }
            if (line.trim() === '') return <div key={i} className="h-2" />;
            return <p key={i} className="break-words word-break-break-all overflow-wrap-anywhere max-w-full">{line}</p>;
          })}
          
        </div>
      );
    }
    
    // **FIX APPLIED HERE**: Added `break-words` to handle long text in simple messages.
    return <div className="break-words word-break-break-all whitespace-pre-wrap overflow-wrap-anywhere max-w-full">{message.content}</div>;
  };
  
  return (
    <div style={style} className={`group hover:bg-gray-50 transition-colors duration-200 -mx-4 px-4 py-3`}>
      <div className={`max-w-4xl mx-auto flex items-start gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
          message.role === 'user' 
            ? 'bg-gray-800 text-white' 
            : 'bg-black text-white'
        }`}>
          {message.role === 'user' ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        
        {/* Message content */}
        <div className={`flex-1 space-y-1 ${message.role === 'user' ? 'text-right' : ''} group`}>
          <div className={`text-xs font-medium text-gray-600 ${
            message.role === 'user' ? 'text-right' : ''
          }`}>
            {message.role === 'user' ? 'You' : 'Assistant'}
          </div>
          
          <div className="relative">
            <div className={`${
              message.role === 'user' 
                ? 'bg-gray-800 text-white rounded-2xl px-4 py-2.5 inline-block max-w-xs ml-auto break-words word-break-break-all' 
                : 'text-gray-800 leading-relaxed max-w-full overflow-hidden break-words word-break-break-all'
            } ${message.role === 'error' ? 'text-red-600' : ''}`} style={{wordBreak: 'break-all', overflowWrap: 'break-word', width: '100%', overflow: 'hidden'}}>
              {renderContent()}
            </div>
            
            {/* Copy and Edit buttons for user messages */}
            {message.role === 'user' && (
              <div className="absolute -bottom-8 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
                <button 
                  onClick={() => navigator.clipboard.writeText(message.content)}
                  className="p-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-colors"
                  title="Copy message"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
                <button 
                  onClick={() => onEdit && onEdit(message.id, message.content)}
                  className="p-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-colors"
                  title="Edit message"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </div>
            )}
          </div>
          
          {message.type === 'plan' && (
            <div className="flex gap-3 mt-4">
              <button 
                onClick={() => onConfirm(message.id, message.actions)} 
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Execute
              </button>
              <button 
                onClick={() => onCancel(message.id)} 
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MemoizedChatMessage = React.memo(ChatMessage);
export default MemoizedChatMessage;