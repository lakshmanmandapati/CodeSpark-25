import { MoveRight, Brain, MessageSquare, Zap, Eye, Headphones, Sparkles, Database, Settings } from "lucide-react";
import { Button } from "./button"
import { ConfettiButton } from "./confetti"
import { BrandScroller } from "./brand-scoller"

function Hero1({ onSignUp, onSignIn }) {
  return (
    <div className="w-full">
      <div className="container mx-auto">
        <div
          className="flex gap-6 py-12 lg:py-16 items-center justify-center flex-col">
          <div>
            <Button variant="secondary" size="sm" className="gap-4">
              🚀 Powered by AI & MCP <MoveRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex gap-4 flex-col">
            <ConfettiButton
              options={{
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
              }}
              className="text-5xl md:text-7xl max-w-4xl tracking-tighter text-center font-regular bg-transparent hover:bg-transparent border-none shadow-none p-0 h-auto text-foreground"
            >
              NeuroNodes
            </ConfettiButton>
            <h2 className="text-3xl md:text-4xl max-w-3xl tracking-tight text-center font-medium text-muted-foreground">
              Where AI Meets Infinite Possibilities
            </h2>
            <p
              className="text-lg md:text-xl leading-relaxed tracking-tight text-muted-foreground max-w-3xl text-center">
              Connect your entire digital ecosystem through intelligent AI conversations. 
              From Gmail to Notion, Slack to Sheets - NeuroNodes transforms how you interact 
              with your tools. One chat interface, unlimited integrations, infinite productivity.
            </p>
          </div>
          <div className="flex flex-row gap-3">
            <Button size="lg" className="gap-4" variant="outline" onClick={onSignIn}>
              Sign In <Brain className="w-4 h-4" />
            </Button>
            <Button size="lg" className="gap-4" onClick={onSignUp}>
              Get Started Free <MoveRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Brand Scroller Section */}
        <div className="py-6">
          <div className="container mx-auto px-4">
            <h3 className="text-center text-base font-medium text-gray-700 mb-4">
              Seamlessly integrate with your favorite tools
            </h3>
            <BrandScroller />
          </div>
        </div>
        
        {/* Features Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Start building</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <div className="flex items-start gap-4 p-6 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex-shrink-0">
                <MessageSquare className="w-6 h-6 text-gray-700" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Intelligent AI Conversations</h4>
                <p className="text-gray-600">Use natural language to interact with all your tools and services through our unified chat interface</p>
              </div>
            </div>
            
            {/* Feature 2 */}
            <div className="flex items-start gap-4 p-6 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex-shrink-0">
                <Eye className="w-6 h-6 text-gray-700" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Multiple AI Tools Capability</h4>
                <p className="text-gray-600">Access and leverage multiple AI providers and models simultaneously - OpenAI, Claude, Gemini, and Groq - all from one unified interface</p>
              </div>
            </div>
            
            {/* Feature 3 */}
            <div className="flex items-start gap-4 p-6 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex-shrink-0">
                <Zap className="w-6 h-6 text-gray-700" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Automated Task Execution</h4>
                <p className="text-gray-600">Create and execute complex workflows across multiple platforms with intelligent automation</p>
              </div>
            </div>
            
            {/* Feature 4 */}
            <div className="flex items-start gap-4 p-6 rounded-lg hover:bg-gray-50 transition-colors relative">
              <div className="flex-shrink-0">
                <Headphones className="w-6 h-6 text-gray-700" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-lg font-semibold text-gray-900">Voice and Audio Processing</h4>
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Coming Soon</span>
                </div>
                <p className="text-gray-600">Analyze, transcribe, and generate audio content with advanced AI audio capabilities</p>
              </div>
            </div>
            
            {/* Feature 5 */}
            <div className="flex items-start gap-4 p-6 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex-shrink-0">
                <Sparkles className="w-6 h-6 text-gray-700" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Advanced Reasoning Engine</h4>
                <p className="text-gray-600">Leverage sophisticated AI reasoning to solve complex problems and make intelligent decisions</p>
              </div>
            </div>
            
            {/* Feature 6 */}
            <div className="flex items-start gap-4 p-6 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex-shrink-0">
                <Settings className="w-6 h-6 text-gray-700" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Customizable Integration Hub</h4>
                <p className="text-gray-600">Tailor integrations to your specific needs with flexible configuration and fine-tuning options</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Hero1 };
