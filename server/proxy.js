import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import dotenv from 'dotenv';
import IntentParser from './intentParser.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

let rpcCounter = 1; // auto-increment JSON-RPC IDs
const intentParser = new IntentParser();

// SSE endpoint for streaming responses
app.post("/proxy/stream", async (req, res) => {
  const { url, action, toolName, args = {}, headers = {}, rawPayload } = req.body;

  if (!url) {
    return res.status(400).json({ error: "Missing MCP webhook URL" });
  }

  // Set up SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  // Build payload
  let payload = rawPayload;
  if (!payload) {
    if (action === "listTools") {
      payload = {
        jsonrpc: "2.0",
        id: String(rpcCounter++),
        method: "tools/list",
        params: {}
      };
    } else if (action === "callTool") {
      if (!toolName) {
        res.write(`data: ${JSON.stringify({ error: "Missing toolName for callTool" })}\n\n`);
        res.end();
        return;
      }
      payload = {
        jsonrpc: "2.0",
        id: String(rpcCounter++),
        method: "tools/call",
        params: { name: toolName, arguments: args }
      };
    } else {
      res.write(`data: ${JSON.stringify({ error: "Invalid action or payload" })}\n\n`);
      res.end();
      return;
    }
  }

  try {
    console.log("➡️ Sent to MCP:", JSON.stringify(payload, null, 2));

    // Send initial status
    res.write(`data: ${JSON.stringify({ 
      type: "status", 
      message: "Sending request to MCP server...",
      payload: payload
    })}\n\n`);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json, text/event-stream",
        ...headers
      },
      body: JSON.stringify(payload)
    });

    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('text/event-stream')) {
      // Handle SSE response from MCP server - use text parsing instead of streaming
      const text = await response.text();
      console.log("⬅️ SSE Response from MCP:", text);

      res.write(`data: ${JSON.stringify({ 
        type: "status", 
        message: "Processing SSE response..." 
      })}\n\n`);

      const lines = text.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const eventData = line.slice(6).trim();
          if (eventData) {
            try {
              const parsed = JSON.parse(eventData);
              res.write(`data: ${JSON.stringify({ 
                type: "chunk", 
                data: parsed 
              })}\n\n`);
            } catch {
              res.write(`data: ${JSON.stringify({ 
                type: "chunk", 
                data: { raw: eventData } 
              })}\n\n`);
            }
          }
        }
      }

      res.write(`data: ${JSON.stringify({ 
        type: "status", 
        message: "Response complete" 
      })}\n\n`);
    } else {
      // Handle regular JSON response
      const text = await response.text();
      console.log("⬅️ Received from MCP:", text);

      let data;
      try {
        // Check if response is SSE format
        if (text.startsWith('event:') || text.includes('data:')) {
          console.log("🔄 Detected SSE format, parsing...");
          const lines = text.split('\n');
          let jsonData = null;
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const eventData = line.slice(6).trim();
              if (eventData) {
                try {
                  jsonData = JSON.parse(eventData);
                  break;
                } catch (e) {
                  console.log("⚠️ Failed to parse SSE data line:", eventData);
                }
              }
            }
          }
          
          data = jsonData || { raw: text, error: "Could not parse SSE data" };
        } else {
          // Regular JSON parsing
          data = JSON.parse(text);
        }
      } catch {
        data = { raw: text };
      }

      res.write(`data: ${JSON.stringify({ 
        type: "complete", 
        data: data 
      })}\n\n`);
    }

    res.write(`data: ${JSON.stringify({ 
      type: "status", 
      message: "Response complete" 
    })}\n\n`);
    
  } catch (err) {
    console.error("Proxy error:", err);
    res.write(`data: ${JSON.stringify({ 
      type: "error", 
      error: "Failed to reach MCP server",
      details: err.message 
    })}\n\n`);
  }

  res.end();
});

// Regular JSON endpoint (fallback)
app.post("/proxy", async (req, res) => {
  const { url, action, toolName, args = {}, headers = {}, rawPayload } = req.body;

  if (!url) {
    return res.status(400).json({ error: "Missing MCP webhook URL" });
  }

  // Build payload
  let payload = rawPayload;
  if (!payload) {
    if (action === "listTools") {
      payload = {
        jsonrpc: "2.0",
        id: String(rpcCounter++),
        method: "tools/list",
        params: {}
      };
    } else if (action === "callTool") {
      if (!toolName) {
        return res.status(400).json({ error: "Missing toolName for callTool" });
      }
      payload = {
        jsonrpc: "2.0",
        id: String(rpcCounter++),
        method: "tools/call",
        params: { name: toolName, arguments: args }
      };
    } else {
      return res.status(400).json({ error: "Invalid action or payload" });
    }
  }

  try {
    console.log("➡️ Sent to MCP:", JSON.stringify(payload, null, 2));

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json, text/event-stream",
        ...headers
      },
      body: JSON.stringify(payload)
    });

    console.log("📊 Response Status:", response.status, response.statusText);
    console.log("📋 Response Headers:", Object.fromEntries(response.headers.entries()));

    const text = await response.text();
    console.log("⬅️ Received Raw from MCP:", text);

    let data;
    try {
      // Check if response is SSE format
      if (text.startsWith('event:') || text.includes('data:')) {
        console.log("🔄 Detected SSE format, parsing...");
        const lines = text.split('\n');
        let jsonData = null;
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const eventData = line.slice(6).trim();
            if (eventData) {
              try {
                jsonData = JSON.parse(eventData);
                break;
              } catch (e) {
                console.log("⚠️ Failed to parse SSE data line:", eventData);
              }
            }
          }
        }
        
        data = jsonData || { raw: text, error: "Could not parse SSE data" };
      } else {
        // Regular JSON parsing
        data = JSON.parse(text);
      }
      
      console.log("✅ Parsed JSON:", JSON.stringify(data, null, 2));
      
      // Debug tools parsing specifically
      if (data.result && data.result.tools) {
        console.log("🔧 Found tools:", data.result.tools.length);
        data.result.tools.forEach((tool, idx) => {
          console.log(`  Tool ${idx + 1}: ${tool.name} - ${tool.description}`);
        });
      } else {
        console.log("❌ No tools found in result. Full response structure:", Object.keys(data));
        if (data.result) {
          console.log("📝 Result keys:", Object.keys(data.result));
        }
      }
    } catch (parseError) {
      console.log("❌ JSON Parse Error:", parseError.message);
      data = { raw: text, parseError: parseError.message };
    }

    res.json(data);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: "Failed to reach MCP server" });
  }
});

// AI endpoint for processing prompts
app.post("/proxy/ai", async (req, res) => {
  const { provider, prompt, mcpUrl } = req.body;
  
  const apiKeys = {
    gemini: process.env.GEMINI_API_KEY,
    // Other keys can be added here in the future
  };

  // Always check for the Gemini key since all requests are routed to it.
  if (!apiKeys.gemini) {
    return res.status(400).json({ error: `API key for Gemini not configured. All models are currently routed to Gemini.` });
  }

  try {
    // First, fetch available tools from MCP
    let tools = [];
    if (mcpUrl) {
      try {
        console.log("Fetching tools from MCP server:", mcpUrl);
        const toolsResponse = await fetch(`http://localhost:${PORT}/proxy`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            url: mcpUrl, 
            action: "listTools" 
          })
        });
        
        const toolsData = await toolsResponse.json();
        tools = toolsData.result?.tools || [];
        console.log("Found tools:", tools.length);
      } catch (toolsError) {
        console.error("Failed to fetch tools:", toolsError);
        // Continue without tools for chat mode
        tools = [];
      }
    }

    // Analyze intent using the intent parser
    const intent = await intentParser.analyzeIntent(prompt, tools);
    console.log("Detected intent:", intent);

    // Handle chat mode - direct LLM response
    if (intent.mode === "chat") {
      return await handleChatMode(provider, prompt, apiKeys, res);
    }

    // Handle tool mode - existing behavior
    // Prepare tools information for the AI
    const toolsInfo = tools.map(tool => ({
      name: tool.name,
      description: tool.description,
      parameters: tool.inputSchema?.properties || {},
      required: tool.inputSchema?.required || []
    }));

    const systemPrompt = intentParser.getEnhancedSystemPrompt(toolsInfo, prompt, "tool");

    // Use faster models for better performance
    const models = {
      openai: "gpt-3.5-turbo", // Faster than GPT-4
      gemini: "gemini-2.5-flash",
      claude: "claude-3-haiku-20240307", // Faster model
      groq: "llama3-8b-8192" // Fast model
    };

    // --- KEY CHANGE: Force all requests to use Gemini ---
    const effectiveProvider = "gemini";
    console.log(`User selected '${provider}', but routing to '${effectiveProvider}' as per configuration.`);

    let endpoint, headers, body;

    switch (effectiveProvider) {
      case "openai":
        endpoint = "https://api.openai.com/v1/chat/completions";
        headers = {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKeys.openai}`
        };
        body = {
          model: models.openai,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: "Please analyze my request and provide a detailed plan with specific actions." }
          ],
          temperature: 0.7,
          max_tokens: 2000,
          response_format: { type: "json_object" }
        };
        break;

      case "gemini": // This case will always be executed
        endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKeys.gemini}`;
        headers = {
          "Content-Type": "application/json"
        };
        body = {
          contents: [{
            parts: [{
              text: systemPrompt + "\n\nPlease analyze my request and provide a detailed plan with specific actions."
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2000,
            response_mime_type: "application/json"
          }
        };
        break;

      case "claude":
        endpoint = "https://api.anthropic.com/v1/messages";
        headers = {
          "Content-Type": "application/json",
          "x-api-key": apiKeys.claude,
          "anthropic-version": "2023-06-01"
        };
        body = {
          model: models.claude,
          max_tokens: 2000,
          temperature: 0.7,
          system: systemPrompt,
          messages: [
            { role: "user", content: "Please analyze my request and provide a detailed plan with specific actions." }
          ]
        };
        break;

      case "groq":
        endpoint = "https://api.groq.com/openai/v1/chat/completions";
        headers = {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKeys.groq}`
        };
        body = {
          model: models.groq,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: "Please analyze my request and provide a detailed plan with specific actions." }
          ],
          temperature: 0.7,
          max_tokens: 2000,
          response_format: { type: "json_object" }
        };
        break;

      default:
        return res.status(400).json({ error: `Unsupported effective provider: ${effectiveProvider}` });
    }

    console.log(`Sending request to ${effectiveProvider} API`);
    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`${effectiveProvider} API error:`, errorData);
      return res.status(500).json({ error: `${effectiveProvider} API error: ${errorData.error?.message || response.statusText}` });
    }

    const data = await response.json();
    console.log("🔍 Raw Gemini API Response:", JSON.stringify(data, null, 2));
    
    // Parse response based on the effective provider
    let responseText;
    try {
      switch (effectiveProvider) {
        case "openai":
        case "groq":
          responseText = data.choices?.[0]?.message?.content;
          break;
        case "gemini": // This case will always be used for parsing
          // Check if response has error
          if (data.error) {
            console.error("Gemini API Error:", data.error);
            return res.status(500).json({ 
              error: `Gemini API Error: ${data.error.message || 'Unknown error'}`,
              details: data.error
            });
          }
          
          // Handle different Gemini response formats
          if (data.candidates && data.candidates.length > 0) {
            const candidate = data.candidates[0];
            if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
              responseText = candidate.content.parts[0].text;
            } else if (candidate.finishReason === 'SAFETY') {
              return res.status(400).json({ 
                error: "Content blocked by safety filters",
                details: "The request was blocked due to safety concerns. Try rephrasing your request."
              });
            }
          }
          break;
        case "claude":
          responseText = data.content?.[0]?.text;
          break;
        default:
          return res.status(400).json({ error: `Unsupported effective provider: ${effectiveProvider}` });
      }

      if (!responseText) {
        console.error("❌ Failed to extract response text from:", JSON.stringify(data, null, 2));
        return res.status(500).json({ 
          error: "AI response format is invalid", 
          details: `Could not extract response text. Response structure: ${Object.keys(data).join(', ')}`
        });
      }
      
      console.log("✅ Extracted response text:", responseText.substring(0, 200) + "...");
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      console.error("Raw response data:", JSON.stringify(data, null, 2));
      return res.status(500).json({ 
        error: "Failed to parse AI response", 
        details: parseError.message 
      });
    }

    // Extract JSON from response
    let aiResponse;
    try {
      aiResponse = JSON.parse(responseText);
    } catch (e) {
      // Try to extract JSON from the response if it's not pure JSON
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          aiResponse = JSON.parse(jsonMatch[0]);
        } catch (parseError) {
          console.error("Failed to parse AI response:", parseError);
          return res.status(500).json({ error: "AI response is not valid JSON" });
        }
      } else {
        console.error("No JSON found in AI response:", responseText);
        return res.status(500).json({ error: "AI response is not valid JSON" });
      }
    }

    // Return the AI plan without executing it
    res.json({ ...aiResponse, mode: "tool" });
  } catch (err) {
    console.error("AI processing error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Execute AI plan endpoint
app.post("/proxy/ai/execute", async (req, res) => {
  const { actions, mcpUrl } = req.body;

  if (!actions || !Array.isArray(actions)) {
    return res.status(400).json({ error: "Invalid actions" });
  }

  try {
    const results = [];
    for (const action of actions) {
      try {
        console.log("Executing action:", action.tool);
        const actionResponse = await fetch(`http://localhost:${PORT}/proxy`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            url: mcpUrl, 
            action: "callTool",
            toolName: action.tool,
            args: action.parameters
          })
        });
        
        const actionResult = await actionResponse.json();
        results.push({
          action: action.tool,
          success: !actionResult.error,
          result: actionResult.result,
          error: actionResult.error
        });
        
        // Add a small delay between actions
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (actionError) {
        console.error("Error executing action:", actionError);
        results.push({
          action: action.tool,
          success: false,
          error: actionError.message
        });
      }
    }
    
    // Return the execution results
    res.json({
      status: "completed",
      results: results
    });
  } catch (executionError) {
    console.error("Error executing AI plan:", executionError);
    res.status(500).json({ 
      error: "Failed to execute AI plan",
      details: executionError.message
    });
  }
});

// Handle chat mode - direct conversational response
async function handleChatMode(provider, prompt, apiKeys, res) {
  try {
    // --- KEY CHANGE: Force all chat requests to use Gemini ---
    const effectiveProvider = "gemini";
    console.log(`Chat Mode: User selected '${provider}', routing to '${effectiveProvider}'.`);

    const models = {
      openai: "gpt-3.5-turbo",
      gemini: "gemini-2.5-flash", 
      claude: "claude-3-haiku-20240307",
      groq: "llama3-8b-8192"
    };

    const systemPrompt = intentParser.getEnhancedSystemPrompt([], prompt, "chat");
    let endpoint, headers, body;

    switch (effectiveProvider) {
      case "openai":
        endpoint = "https://api.openai.com/v1/chat/completions";
        headers = {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKeys.openai}`
        };
        body = {
          model: models.openai,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 1000
        };
        break;

      case "gemini": // This case will always be executed
        endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKeys.gemini}`;
        headers = { "Content-Type": "application/json" };
        body = {
          contents: [{ parts: [{ text: systemPrompt + "\n\nUser: " + prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 1000 }
        };
        break;

      case "claude":
        endpoint = "https://api.anthropic.com/v1/messages";
        headers = {
          "Content-Type": "application/json",
          "x-api-key": apiKeys.claude,
          "anthropic-version": "2023-06-01"
        };
        body = {
          model: models.claude,
          max_tokens: 1000,
          temperature: 0.7,
          system: systemPrompt,
          messages: [{ role: "user", content: prompt }]
        };
        break;

      case "groq":
        endpoint = "https://api.groq.com/openai/v1/chat/completions";
        headers = {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKeys.groq}`
        };
        body = {
          model: models.groq,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 1000
        };
        break;

      default:
        return res.status(400).json({ error: `Unsupported effective provider: ${effectiveProvider}` });
    }

    console.log(`Sending chat request to ${effectiveProvider} API`);
    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`${effectiveProvider} API error:`, errorData);
      return res.status(500).json({ 
        error: `${effectiveProvider} API error: ${errorData.error?.message || response.statusText}` 
      });
    }

    const data = await response.json();
    
    // Parse response based on the effective provider
    let responseText;
    try {
      switch (effectiveProvider) {
        case "openai":
        case "groq":
          responseText = data.choices?.[0]?.message?.content;
          break;
        case "gemini": // This case will always be used for parsing
          responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          break;
        case "claude":
          responseText = data.content?.[0]?.text;
          break;
      }

      if (!responseText) {
        console.error("Chat mode - Failed to parse AI response:", JSON.stringify(data, null, 2));
        return res.status(500).json({ 
          error: "AI response format is invalid", 
          details: "Could not extract response text from API response" 
        });
      }
    } catch (parseError) {
      console.error("Chat mode - Error parsing AI response:", parseError);
      console.error("Raw response data:", JSON.stringify(data, null, 2));
      return res.status(500).json({ 
        error: "Failed to parse AI response", 
        details: parseError.message 
      });
    }

    // Return chat response in a format compatible with the frontend
    return res.json({
      mode: "chat",
      response: responseText,
      plan: "Conversational response",
      actions: [],
      confidence: 100
    });

  } catch (err) {
    console.error("Chat mode error:", err);
    return res.status(500).json({ 
      error: "I tried to respond but something went wrong. Please try again.",
      details: err.message 
    });
  }
}

// Health check endpoint for Docker
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 MCP Proxy running at http://0.0.0.0:${PORT}`);
});
