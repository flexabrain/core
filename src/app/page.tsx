import { Brain, Zap, Shield, BookOpen } from 'lucide-react'
import { AgentDemo } from '@/components/ai/agent-demo'
import { ScrollButton } from '@/components/ui/scroll-button'

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">FlexaBrain</span>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">v3.0.0</span>
          </div>
          <nav className="hidden md:flex space-x-6">
            <a href="#agents" className="text-gray-600 hover:text-gray-900 transition-colors">Agents</a>
            <a href="#demo" className="text-gray-600 hover:text-gray-900 transition-colors">Demo</a>
            <a href="/api/health" className="text-gray-600 hover:text-gray-900 transition-colors">Health</a>
          </nav>
          <div className="flex items-center space-x-2">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Intelligence <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Without Limits</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Self-hosted AI platform with three specialized agents for enterprise-grade intelligence.
              Complete data sovereignty with Oracle, Sentinel, and Sage agents.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <ScrollButton 
                targetId="demo"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg font-medium hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                🚀 Try Live Demo
              </ScrollButton>
              <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-medium hover:bg-gray-50 transition-all">
                📖 View Documentation
              </button>
            </div>
            
            {/* Status Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">15K+</div>
                <div className="text-sm text-gray-500">GitHub Stars</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">5K+</div>
                <div className="text-sm text-gray-500">Discord Members</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">500+</div>
                <div className="text-sm text-gray-500">Enterprise Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">50+</div>
                <div className="text-sm text-gray-500">Countries</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Demo Section */}
      <section id="demo" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
              🔴 Live Demo - Real AI Agents
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Try FlexaBrain <span className="text-blue-600">Right Now</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience real AI agents powered by advanced language models. 
              Oracle is free to try - no signup required!
            </p>
          </div>
          
          {/* Interactive Demo Component */}
          <AgentDemo />
        </div>
      </section>

      {/* AI Agents Section */}
      <section id="agents" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
              🧠 Three Specialized AI Agents
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Meet Your AI Team
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Purpose-built agents for predictive analytics, monitoring, and business intelligence.
              Each agent specializes in specific enterprise needs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Oracle Agent */}
            <div className="group bg-white border-2 border-gray-100 rounded-2xl p-8 hover:border-yellow-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Oracle</h3>
              <p className="text-yellow-600 font-semibold mb-4">The Predictor</p>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Specialized in predictive analytics and forecasting. Oracle sees patterns in your data 
                and predicts future trends with enterprise-grade accuracy.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-700">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                  Sales forecasting & revenue prediction
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                  Market trend analysis & insights
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                  Risk assessment & mitigation
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                  Demand prediction & planning
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
                    🆓 Free Tier: 5 queries/day
                  </span>
                  <ScrollButton 
                    targetId="demo"
                    className="text-yellow-600 hover:text-yellow-700 font-medium text-sm"
                  >
                    Try Oracle →
                  </ScrollButton>
                </div>
              </div>
            </div>

            {/* Sentinel Agent */}
            <div className="group bg-white border-2 border-gray-100 rounded-2xl p-8 hover:border-red-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Sentinel</h3>
              <p className="text-red-600 font-semibold mb-4">The Guardian</p>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Advanced monitoring and anomaly detection. Sentinel watches over your systems 
                24/7, detecting issues before they become problems.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-700">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                  Real-time system monitoring
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                  Anomaly detection & alerts
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                  Data quality assurance
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                  Security threat analysis
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                    💼 Pro Tier Required
                  </span>
                  <ScrollButton 
                    targetId="demo"
                    className="text-red-600 hover:text-red-700 font-medium text-sm"
                  >
                    Try Demo →
                  </ScrollButton>
                </div>
              </div>
            </div>

            {/* Sage Agent */}
            <div className="group bg-white border-2 border-gray-100 rounded-2xl p-8 hover:border-green-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Sage</h3>
              <p className="text-green-600 font-semibold mb-4">The Analyst</p>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Business intelligence and strategic insights. Sage transforms raw data into 
                actionable business intelligence for strategic decision making.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Customer segmentation analysis
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Strategic recommendations
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Performance optimization
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Market intelligence insights
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                    💼 Pro Tier Required
                  </span>
                  <ScrollButton 
                    targetId="demo"
                    className="text-green-600 hover:text-green-700 font-medium text-sm"
                  >
                    Try Demo →
                  </ScrollButton>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-16">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8 max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to Experience AI Without Limits?
              </h3>
              <p className="text-gray-600 mb-6">
                Start with Oracle agent for free, then upgrade to unlock Sentinel and Sage.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <ScrollButton 
                  targetId="demo"
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  🔮 Try Oracle Agent
                </ScrollButton>
                <button className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                  📋 View Pricing
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Self-Hosted</h3>
              <p className="text-gray-600 text-sm">Complete data sovereignty. Your AI, your infrastructure, your control.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Enterprise Ready</h3>
              <p className="text-gray-600 text-sm">Production-grade performance with sub-2-second response times.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Privacy First</h3>
              <p className="text-gray-600 text-sm">Zero external dependencies. GDPR, HIPAA, SOC 2 compliance ready.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Brain className="h-6 w-6 text-blue-400" />
              <span className="text-lg font-bold">FlexaBrain Core</span>
              <span className="text-sm text-gray-400">v3.0.0</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <a href="https://github.com/flexabrain/core" className="hover:text-white transition-colors">GitHub</a>
              <a href="/api/agents/status" className="hover:text-white transition-colors">API Status</a>
              <a href="https://discord.gg/flexabrain" className="hover:text-white transition-colors">Discord</a>
              <a href="/api/health" className="hover:text-white transition-colors">Health Check</a>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 FlexaBrain. Intelligence Without Limits. MIT Licensed.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}