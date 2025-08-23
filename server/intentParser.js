/**
 * Intent Parser for Dual-Mode AI Assistant
 * Determines whether user input requires chat response or tool calling
 */

export class IntentParser {
  constructor() {
    // Keywords that typically indicate tool usage
    this.toolKeywords = [
      'send', 'email', 'schedule', 'create', 'post', 'share', 'book', 'reserve',
      'add', 'update', 'delete', 'search', 'find', 'get', 'fetch', 'download',
      'upload', 'save', 'export', 'import', 'notify', 'remind', 'calendar',
      'meeting', 'appointment', 'task', 'todo', 'contact', 'message', 'call',
      'linkedin', 'twitter', 'facebook', 'instagram', 'gmail', 'outlook',
      'slack', 'teams', 'zoom', 'drive', 'dropbox', 'notion', 'trello',
      'jira', 'salesforce', 'hubspot', 'zapier'
    ];

    // Chat-only patterns (greetings, questions, reasoning)
    this.chatPatterns = [
      /^(hi|hello|hey|good morning|good afternoon|good evening)/i,
      /^(how are you|what's up|what can you do)/i,
      /^(what is|what are|explain|tell me about|how does)/i,
      /^(calculate|solve|what's|whats)/i,
      /\?$/,  // Questions ending with ?
      /^(thank you|thanks|bye|goodbye)/i
    ];
  }

  /**
   * Analyzes user input and returns intent classification
   * @param {string} userInput - The user's message
   * @param {Array} availableTools - List of available MCP tools
   * @returns {Object} Intent classification with mode, application, action, and parameters
   */
  async analyzeIntent(userInput, availableTools = []) {
    const input = userInput.trim().toLowerCase();
    
    // Check for explicit chat patterns first
    if (this.isChatIntent(input)) {
      return {
        mode: "chat",
        application: null,
        action: null,
        parameters: {},
        reasoning: "Detected conversational/informational request"
      };
    }

    // Check for tool-related keywords and available tools
    const toolMatch = this.findToolMatch(input, availableTools);
    if (toolMatch) {
      return {
        mode: "tool",
        application: toolMatch.application,
        action: toolMatch.action,
        parameters: toolMatch.parameters,
        reasoning: `Detected request for ${toolMatch.application} integration`
      };
    }

    // Default to chat mode for ambiguous cases
    return {
      mode: "chat",
      application: null,
      action: null,
      parameters: {},
      reasoning: "Ambiguous intent, defaulting to conversational mode"
    };
  }

  /**
   * Checks if the input is clearly a chat/conversational intent
   * @param {string} input - Lowercase user input
   * @returns {boolean}
   */
  isChatIntent(input) {
    // Check explicit chat patterns
    for (const pattern of this.chatPatterns) {
      if (pattern.test(input)) {
        return true;
      }
    }

    // Check for mathematical expressions
    if (/[\d\+\-\*\/\(\)=]/.test(input) && !/send|email|create/.test(input)) {
      return true;
    }

    // Check for general knowledge questions
    if (input.includes('what is') || input.includes('who is') || input.includes('when is')) {
      return true;
    }

    return false;
  }

  /**
   * Finds matching tools for the user input
   * @param {string} input - Lowercase user input
   * @param {Array} availableTools - Available MCP tools
   * @returns {Object|null} Tool match or null
   */
  findToolMatch(input, availableTools) {
    // Check for tool keywords
    const hasToolKeyword = this.toolKeywords.some(keyword => input.includes(keyword));
    
    if (!hasToolKeyword) {
      return null;
    }

    // Try to match with available tools
    for (const tool of availableTools) {
      const toolName = tool.name.toLowerCase();
      const toolDesc = (tool.description || '').toLowerCase();
      
      // Direct tool name match
      if (input.includes(toolName)) {
        return {
          application: this.extractApplication(tool),
          action: tool.name,
          parameters: this.extractParameters(input, tool)
        };
      }

      // Description-based matching
      if (this.matchesToolDescription(input, toolDesc)) {
        return {
          application: this.extractApplication(tool),
          action: tool.name,
          parameters: this.extractParameters(input, tool)
        };
      }
    }

    // Generic tool intent detected but no specific match
    return {
      application: "generic",
      action: "unknown",
      parameters: { originalInput: input }
    };
  }

  /**
   * Extracts application name from tool information
   * @param {Object} tool - Tool object
   * @returns {string}
   */
  extractApplication(tool) {
    const toolName = tool.name.toLowerCase();
    
    // Common application mappings
    if (toolName.includes('email') || toolName.includes('gmail')) return 'gmail';
    if (toolName.includes('calendar')) return 'calendar';
    if (toolName.includes('linkedin')) return 'linkedin';
    if (toolName.includes('slack')) return 'slack';
    if (toolName.includes('drive')) return 'drive';
    if (toolName.includes('leave') || toolName.includes('vacation')) return 'leave_manager';
    
    // Default to first word of tool name
    return toolName.split('_')[0] || 'unknown';
  }

  /**
   * Checks if input matches tool description patterns
   * @param {string} input - User input
   * @param {string} description - Tool description
   * @returns {boolean}
   */
  matchesToolDescription(input, description) {
    const descWords = description.split(/\s+/).filter(word => word.length > 3);
    return descWords.some(word => input.includes(word.toLowerCase()));
  }

  /**
   * Extracts parameters from user input based on tool schema
   * @param {string} input - User input
   * @param {Object} tool - Tool object with input schema
   * @returns {Object}
   */
  extractParameters(input, tool) {
    const parameters = {};
    const schema = tool.inputSchema?.properties || {};
    
    // Basic parameter extraction patterns
    const emailPattern = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
    const emails = input.match(emailPattern);
    
    if (emails && ('to' in schema || 'email' in schema || 'recipient' in schema)) {
      parameters.to = emails[0];
      parameters.email = emails[0];
      parameters.recipient = emails[0];
    }

    // Extract quoted content as message/body
    const quotedContent = input.match(/"([^"]+)"/);
    if (quotedContent && ('message' in schema || 'body' in schema || 'content' in schema)) {
      parameters.message = quotedContent[1];
      parameters.body = quotedContent[1];
      parameters.content = quotedContent[1];
    }

    return parameters;
  }

  /**
   * Enhanced system prompt for dual-mode operation
   * @param {Array} toolsInfo - Available tools information
   * @param {string} userPrompt - User's request
   * @param {string} mode - Detected mode (chat or tool)
   * @returns {string}
   */
  getEnhancedSystemPrompt(toolsInfo, userPrompt, mode) {
    if (mode === "chat") {
      return `You are a helpful AI assistant. The user is having a conversation with you.

USER REQUEST: "${userPrompt}"

Respond naturally and conversationally. You can:
- Answer questions
- Explain concepts
- Help with math and calculations
- Provide general information
- Have friendly conversations

Respond directly as a helpful assistant. Do NOT suggest using tools or mention any integrations.

RESPONSE FORMAT: Respond with plain text, no JSON structure needed.`;
    }

    return `You are an expert AI assistant that helps users accomplish tasks using available tools.

AVAILABLE TOOLS:
${JSON.stringify(toolsInfo, null, 2)}

USER REQUEST: "${userPrompt}"

YOUR TASK:
1. Analyze the user's request and break it down into specific actions
2. For each action, select the most appropriate tool
3. Generate detailed, high-quality content for content creation tasks
4. Extract all necessary parameters from the user's request
5. If the request involves multiple steps, create a sequence of actions

RESPONSE FORMAT:
Return a JSON object with this structure:
{
  "plan": "Brief description of your overall plan",
  "actions": [
    {
      "tool": "exact_name_of_tool",
      "reasoning": "Why this tool is appropriate",
      "parameters": { ... }  // All required parameters with detailed values
    }
  ],
  "confidence": 0-100  // Your confidence in this plan
}

CONTENT GUIDELINES:
- For emails: Write complete emails with subject, body, and proper formatting
- For social posts: Create engaging, well-written content with appropriate hashtags
- For any content: Be specific, detailed, and professional
- Don't just repeat the user's request - expand on it with quality content`;
  }
}

export default IntentParser;
