'use client';

import React, { useState, useEffect } from 'react';
import { Brain, Zap, Shield, BookOpen, Github, Star, Building, Globe, ArrowRight, Check, Play, Sparkles, Lock, BarChart3, Users, Cpu, Database, Cloud, ChevronDown, Menu, X, MessageCircle } from 'lucide-react';

// Type definitions
interface StatsCounterProps {
  end: number;
  label: string;
  icon: React.ReactNode;
  suffix?: string;
}

interface GlowButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
  onClick?: () => void;
}

interface Agent {
  type: 'oracle' | 'sentinel' | 'sage';
  name: string;
  role: string;
  description: string;
  capabilities: string[];
  availability: string;
}

interface AgentCardProps {
  agent: Agent;
  isLocked?: boolean;
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  company: string;
}

// Interactive Demo Component
const InteractiveDemo: React.FC = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [userInput, setUserInput] = useState('');
  
  const demoSteps = [
    "📊 Initializing Oracle Analytics Engine...",
    "🔍 Processing market data and trends...", 
    "📈 Analyzing seasonal patterns...",
    "🎯 Generating predictions with confidence scores...",
    "✅ Analysis complete!"
  ];
  
  const handleAnalyze = () => {
    if (!userInput.trim()) return;
    
    setIsAnalyzing(true);
    setCurrentStep(0);
    
    const timer = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= demoSteps.length - 1) {
          clearInterval(timer);
          setIsAnalyzing(false);
          return prev;
        }
        return prev + 1;
      });
    }, 800);
  };
  
  return (
    <div className="bg-slate-950/50 rounded-xl p-8 border border-slate-700/30">
      {/* Terminal Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        <span className="text-slate-400 text-sm ml-4">Oracle Analytics Dashboard</span>
      </div>
      
      {/* Input Section */}
      <div className="mb-6">
        <label className="block text-slate-300 text-sm mb-2">Ask Oracle a prediction question:</label>
        <div className="flex space-x-3">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="e.g., What will our Q2 sales be?"
            className="flex-1 bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            disabled={isAnalyzing}
          />
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !userInput.trim()}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-medium hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
      </div>
      
      {/* Demo Output */}
      <div className="space-y-4">
        {isAnalyzing && (
          <div className="space-y-3">
            {demoSteps.slice(0, currentStep + 1).map((step, idx) => (
              <div key={idx} className="text-amber-400 text-sm animate-pulse">
                {step}
              </div>
            ))}
          </div>
        )}
        
        {!isAnalyzing && currentStep === demoSteps.length - 1 && userInput && (
          <div className="space-y-4">
            <div className="text-slate-300">
              <span className="text-blue-400 font-semibold">Oracle:</span> Based on current market trends, historical data, and seasonal patterns, I predict a{' '}
              <span className="text-green-400 font-semibold">18-25% increase</span> in your key metrics for the next quarter, with peak performance expected in the enterprise segment.
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-sm">
                Confidence: 92%
              </div>
              <div className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm">
                Response time: 1.4s
              </div>
              <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">
                Self-hosted
              </div>
              <div className="bg-violet-500/20 text-violet-400 px-3 py-1 rounded-full text-sm">
                Data secure
              </div>
            </div>
          </div>
        )}
        
        {!isAnalyzing && currentStep === 0 && (
          <div className="text-slate-400 text-center py-8">
            👆 Enter a question above to see Oracle's predictive analytics in action
          </div>
        )}
      </div>
    </div>
  );
};

// Animated Background Component
const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Gradient mesh background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-violet-950" />
      
      {/* Animated grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          animation: 'grid-move 20s linear infinite'
        }} />
      </div>
      
      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      
      <style>{`
        @keyframes grid-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
      `}</style>
    </div>
  );
};

// Stats Counter Component
const StatsCounter: React.FC<StatsCounterProps> = ({ end, label, icon, suffix = "" }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (count < end) {
        setCount(Math.min(count + Math.ceil(end / 100), end));
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [count, end]);
  
  return (
    <div className="text-center group">
      <div className="flex items-center justify-center mb-2 text-blue-400 group-hover:text-blue-300 transition-colors">
        {icon}
      </div>
      <div className="text-3xl font-bold text-white mb-1">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-slate-400 text-sm">{label}</div>
    </div>
  );
};

// Glowing Button Component
const GlowButton: React.FC<GlowButtonProps> = ({ children, variant = "primary", className = "", ...props }) => {
  const baseClasses = "relative overflow-hidden px-8 py-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105";
  const variants: Record<string, string> = {
    primary: "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40",
    secondary: "bg-white/10 text-white border border-white/20 backdrop-blur-sm hover:bg-white/20",
    ghost: "text-slate-300 hover:text-white hover:bg-white/10"
  };
  
  return (
    <button className={`${baseClasses} ${variants[variant]} ${className}`} {...props}>
      <span className="relative z-10">{children}</span>
      {variant === "primary" && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-violet-600 to-blue-600 opacity-0 hover:opacity-100 transition-opacity duration-300" 
             style={{ backgroundSize: "200% 100%", animation: "shimmer 2s infinite" }} />
      )}
    </button>
  );
};

// AI Agent Card Component
const AgentCard: React.FC<AgentCardProps> = ({ agent, isLocked = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const agentStyles: Record<Agent['type'], { gradient: string; icon: React.ReactNode; color: string; border: string }> = {
    oracle: {
      gradient: "from-amber-400/20 to-orange-600/20",
      icon: <Zap className="h-8 w-8" />,
      color: "text-amber-400",
      border: "border-amber-500/30"
    },
    sentinel: {
      gradient: "from-emerald-400/20 to-teal-600/20",
      icon: <Shield className="h-8 w-8" />,
      color: "text-emerald-400",
      border: "border-emerald-500/30"
    },
    sage: {
      gradient: "from-violet-400/20 to-purple-600/20",
      icon: <BookOpen className="h-8 w-8" />,
      color: "text-violet-400",
      border: "border-violet-500/30"
    }
  };
  
  const style = agentStyles[agent.type];
  
  return (
    <div 
      className={`relative p-8 rounded-2xl bg-slate-900/50 backdrop-blur-xl border ${style.border} 
                  transition-all duration-500 hover:scale-105 hover:shadow-2xl ${isLocked ? 'opacity-75' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glow effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient} rounded-2xl opacity-0 
                       ${isHovered ? 'opacity-100' : ''} transition-opacity duration-500`} />
      
      {/* Lock overlay */}
      {isLocked && (
        <div className="absolute top-4 right-4 p-2 bg-slate-800/80 rounded-lg backdrop-blur-sm">
          <Lock className="h-4 w-4 text-slate-400" />
        </div>
      )}
      
      <div className="relative z-10">
        {/* Icon */}
        <div className={`${style.color} mb-6 transform transition-transform duration-300 
                         ${isHovered ? 'scale-110' : ''}`}>
          {style.icon}
        </div>
        
        {/* Title */}
        <h3 className="text-2xl font-bold text-white mb-2">{agent.name}</h3>
        <p className={`${style.color} text-sm font-medium mb-4`}>{agent.role}</p>
        
        {/* Description */}
        <p className="text-slate-300 mb-6 leading-relaxed">{agent.description}</p>
        
        {/* Capabilities */}
        <div className="space-y-3 mb-6">
          {agent.capabilities.map((capability: string, idx: number) => (
            <div key={idx} className="flex items-center text-sm text-slate-300">
              <div className={`w-2 h-2 rounded-full ${style.color.replace('text', 'bg')} mr-3`} />
              {capability}
            </div>
          ))}
        </div>
        
        {/* Availability badge */}
        <div className="flex items-center justify-between">
          <span className={`px-3 py-1 rounded-full text-xs font-medium 
                           ${isLocked ? 'bg-slate-700 text-slate-400' : 'bg-green-500/20 text-green-400'}`}>
            {agent.availability}
          </span>
          {!isLocked && (
            <button className={`${style.color} hover:scale-110 transition-transform`}>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Feature Card Component
const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <div className="group relative p-6 rounded-xl bg-slate-900/30 backdrop-blur-sm border border-slate-700/50 
                    hover:bg-slate-800/50 transition-all duration-300 hover:scale-105">
      <div className="text-blue-400 mb-4 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
};

// Testimonial Component
const TestimonialCard: React.FC<TestimonialCardProps> = ({ quote, author, role, company }) => {
  return (
    <div className="relative p-8 rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-slate-700/50">
      <div className="text-slate-300 text-lg leading-relaxed mb-6">
        "{quote}"
      </div>
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-violet-400 rounded-full flex items-center justify-center text-white font-bold">
          {author.charAt(0)}
        </div>
        <div>
          <div className="text-white font-semibold">{author}</div>
          <div className="text-slate-400 text-sm">{role} at {company}</div>
        </div>
      </div>
    </div>
  );
};

// Main Landing Page Component
export default function FlexaBrainLanding() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  
  const agents: Agent[] = [
    {
      type: "oracle",
      name: "Oracle",
      role: "The Predictor",
      description: "Advanced predictive analytics and forecasting powered by cutting-edge ML algorithms.",
      capabilities: ["Sales forecasting", "Trend analysis", "Risk assessment", "Demand prediction"],
      availability: "🆓 Free Tier: 5 queries/day"
    },
    {
      type: "sentinel", 
      name: "Sentinel",
      role: "The Guardian",
      description: "Real-time monitoring and anomaly detection with enterprise-grade security.",
      capabilities: ["Data quality monitoring", "Anomaly detection", "System health checks", "Real-time alerts"],
      availability: "💼 Pro Tier and above"
    },
    {
      type: "sage",
      name: "Sage", 
      role: "The Analyst",
      description: "Strategic business intelligence and insights for data-driven decision making.",
      capabilities: ["Customer segmentation", "Strategic recommendations", "Performance analysis", "Market insights"],
      availability: "💼 Pro Tier and above"
    }
  ];
  
  const features = [
    {
      icon: <Lock className="h-8 w-8" />,
      title: "Complete Data Sovereignty",
      description: "Your data never leaves your infrastructure. Zero external dependencies, complete control."
    },
    {
      icon: <Cpu className="h-8 w-8" />,
      title: "Enterprise Performance",
      description: "Sub-2-second response times with 99.9% uptime. Built for mission-critical workloads."
    },
    {
      icon: <Database className="h-8 w-8" />,
      title: "Unlimited Scale",
      description: "Kubernetes-ready architecture that scales horizontally with your business needs."
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Advanced Analytics",
      description: "Real-time insights and monitoring with comprehensive audit trails and compliance."
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Multi-Tenant Ready",
      description: "Enterprise-grade multi-tenancy with role-based access control and isolation."
    },
    {
      icon: <Cloud className="h-8 w-8" />,
      title: "Hybrid Deployment",
      description: "Deploy on-premise, in the cloud, or hybrid. Your infrastructure, your choice."
    }
  ];
  
  const testimonials = [
    {
      quote: "FlexaBrain changed how we think about AI infrastructure. Complete data control with enterprise performance.",
      author: "Sarah Chen",
      role: "CTO",
      company: "DataFlow Industries"
    },
    {
      quote: "Finally, an AI platform that doesn't send our data to external APIs. FlexaBrain runs on our hardware, our rules.",
      author: "Marcus Rodriguez", 
      role: "Lead Engineer",
      company: "SecureBank"
    },
    {
      quote: "The three-agent approach is brilliant. Oracle for predictions, Sentinel for monitoring, Sage for strategy. Genius.",
      author: "Dr. Lisa Kim",
      role: "AI Research Director",
      company: "TechCorp"
    }
  ];
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);
  
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      <AnimatedBackground />
      
      {/* Navigation */}
      <nav className="relative z-50 border-b border-slate-800/50 bg-slate-950/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Brain className="h-10 w-10 text-blue-400" />
                <div className="absolute inset-0 bg-blue-400 blur-lg opacity-30 animate-pulse" />
              </div>
              <div>
                <span className="text-2xl font-bold">FlexaBrain</span>
                <span className="ml-2 px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-full">v3.0</span>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <a href="#agents" className="text-slate-300 hover:text-white transition-colors">Agents</a>
              <a href="#features" className="text-slate-300 hover:text-white transition-colors">Features</a>
              <a href="#pricing" className="text-slate-300 hover:text-white transition-colors">Pricing</a>
              <a href="#" className="text-slate-300 hover:text-white transition-colors">Docs</a>
            </div>
            
            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center space-x-4">
              <button className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors">
                <Github className="h-5 w-5" />
                <span>GitHub</span>
              </button>
              <GlowButton>
                Start Building
                <ArrowRight className="ml-2 h-4 w-4" />
              </GlowButton>
            </div>
            
            {/* Mobile menu button */}
            <button 
              className="lg:hidden text-slate-300 hover:text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/50">
            <div className="px-6 py-6 space-y-4">
              <a href="#agents" className="block text-slate-300 hover:text-white transition-colors">Agents</a>
              <a href="#features" className="block text-slate-300 hover:text-white transition-colors">Features</a>
              <a href="#pricing" className="block text-slate-300 hover:text-white transition-colors">Pricing</a>
              <a href="#" className="block text-slate-300 hover:text-white transition-colors">Docs</a>
              <div className="pt-4 border-t border-slate-800">
                <GlowButton className="w-full">Start Building</GlowButton>
              </div>
            </div>
          </div>
        )}
      </nav>
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6">
        <div className="max-w-7xl mx-auto text-center">
          {/* Hero Badge */}
          <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 
                          rounded-full px-6 py-3 mb-8 backdrop-blur-sm">
            <Sparkles className="h-5 w-5 text-blue-400" />
            <span className="text-blue-400 font-medium">Intelligence Without Limits</span>
            <Sparkles className="h-5 w-5 text-blue-400" />
          </div>
          
          {/* Main Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-8xl font-bold mb-8 bg-gradient-to-r from-white via-blue-100 to-violet-100 
                         bg-clip-text text-transparent leading-tight">
            The Future of
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
              Self-Hosted AI
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl lg:text-2xl text-slate-300 max-w-4xl mx-auto mb-12 leading-relaxed">
            Enterprise-grade AI platform with three specialized agents. Complete data sovereignty, 
            zero external dependencies, unlimited scale.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16">
            <GlowButton className="text-lg px-12 py-6">
              <Play className="mr-3 h-5 w-5" />
              Try Live Demo
            </GlowButton>
            <GlowButton variant="secondary" className="text-lg px-12 py-6">
              <Github className="mr-3 h-5 w-5" />
              View on GitHub
            </GlowButton>
          </div>
          
          {/* Trust Indicators */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <StatsCounter end={15000} label="GitHub Stars" icon={<Star className="h-5 w-5" />} suffix="+" />
            <StatsCounter end={5000} label="Community Members" icon={<MessageCircle className="h-5 w-5" />} suffix="+" />
            <StatsCounter end={500} label="Enterprise Customers" icon={<Building className="h-5 w-5" />} suffix="+" />
            <StatsCounter end={50} label="Countries" icon={<Globe className="h-5 w-5" />} suffix="+" />
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="h-6 w-6 text-slate-400" />
        </div>
      </section>
      
      {/* AI Agents Section */}
      <section id="agents" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-2 bg-violet-500/10 border border-violet-500/20 
                            rounded-full px-6 py-3 mb-8">
              <Brain className="h-5 w-5 text-violet-400" />
              <span className="text-violet-400 font-medium">Three Specialized AI Agents</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-slate-300 
                           bg-clip-text text-transparent">
              Meet Your AI Team
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Oracle predicts the future, Sentinel guards your systems, and Sage analyzes everything. 
              Each agent specialized for enterprise excellence.
            </p>
          </div>
          
          {/* Agent Cards */}
          <div className="grid lg:grid-cols-3 gap-8 mb-20">
            <AgentCard agent={agents[0]} />
            <AgentCard agent={agents[1]} isLocked={true} />
            <AgentCard agent={agents[2]} isLocked={true} />
          </div>
          
          {/* Interactive Demo Section */}
          <div className="relative" id="demo">
            <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl 
                            rounded-3xl p-12 border border-slate-700/50">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-white mb-4">Experience Oracle in Action</h3>
                <p className="text-slate-400">Try our predictive analytics with real-time data processing</p>
              </div>
              
              {/* Interactive Demo Interface */}
              <InteractiveDemo />
              
              <div className="text-center mt-8">
                <GlowButton>
                  Try Full Platform
                  <ArrowRight className="ml-2 h-4 w-4" />
                </GlowButton>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="py-32 px-6 bg-slate-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 
                            rounded-full px-6 py-3 mb-8">
              <Shield className="h-5 w-5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Enterprise-Grade Features</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-slate-300 
                           bg-clip-text text-transparent">
              Built for Production
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Everything you need to deploy, scale, and secure AI in your organization with complete control.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <FeatureCard key={idx} {...feature} />
            ))}
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-2 bg-rose-500/10 border border-rose-500/20 
                            rounded-full px-6 py-3 mb-8">
              <MessageCircle className="h-5 w-5 text-rose-400" />
              <span className="text-rose-400 font-medium">Developer Love</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-slate-300 
                           bg-clip-text text-transparent">
              Trusted by Thousands
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
              See what developers and enterprises are saying about FlexaBrain
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <TestimonialCard {...testimonials[currentTestimonial]} />
            
            {/* Testimonial indicators */}
            <div className="flex justify-center space-x-2 mt-8">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  className={`w-2 h-2 rounded-full transition-colors duration-300 
                             ${idx === currentTestimonial ? 'bg-blue-400' : 'bg-slate-600'}`}
                  onClick={() => setCurrentTestimonial(idx)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-6 bg-slate-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-slate-300 
                           bg-clip-text text-transparent">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Start free, scale as you grow. No hidden fees, no vendor lock-in.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Tier */}
            <div className="relative p-8 rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-slate-700/50">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">Free</h3>
                <div className="text-4xl font-bold text-white mb-4">$0<span className="text-slate-400 text-lg">/month</span></div>
                <p className="text-slate-400">Perfect for exploration and testing</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-400 mr-3" />
                  <span className="text-slate-300">Oracle agent access</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-400 mr-3" />
                  <span className="text-slate-300">5 queries per day</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-400 mr-3" />
                  <span className="text-slate-300">Community support</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-400 mr-3" />
                  <span className="text-slate-300">Open source license</span>
                </li>
              </ul>
              
              <GlowButton variant="secondary" className="w-full">
                Start Free
              </GlowButton>
            </div>
            
            {/* Pro Tier */}
            <div className="relative p-8 rounded-2xl bg-gradient-to-br from-blue-600/20 to-violet-600/20 
                            backdrop-blur-xl border border-blue-500/50 scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r 
                              from-blue-600 to-violet-600 text-white px-6 py-2 rounded-full text-sm font-medium">
                Most Popular
              </div>
              
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
                <div className="text-4xl font-bold text-white mb-4">$97<span className="text-slate-400 text-lg">/month</span></div>
                <p className="text-slate-400">For serious projects and teams</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-400 mr-3" />
                  <span className="text-slate-300">All three AI agents</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-400 mr-3" />
                  <span className="text-slate-300">Unlimited queries</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-400 mr-3" />
                  <span className="text-slate-300">Priority support</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-400 mr-3" />
                  <span className="text-slate-300">Advanced analytics</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-400 mr-3" />
                  <span className="text-slate-300">API access</span>
                </li>
              </ul>
              
              <GlowButton className="w-full">
                Start 7-Day Trial
              </GlowButton>
            </div>
            
            {/* Enterprise Tier */}
            <div className="relative p-8 rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-slate-700/50">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">Enterprise</h3>
                <div className="text-4xl font-bold text-white mb-4">Custom</div>
                <p className="text-slate-400">For large organizations</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-400 mr-3" />
                  <span className="text-slate-300">White-label options</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-400 mr-3" />
                  <span className="text-slate-300">Dedicated support</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-400 mr-3" />
                  <span className="text-slate-300">Custom integrations</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-400 mr-3" />
                  <span className="text-slate-300">SLA guarantees</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-5 w-5 text-green-400 mr-3" />
                  <span className="text-slate-300">On-premise deployment</span>
                </li>
              </ul>
              
              <GlowButton variant="secondary" className="w-full">
                Contact Sales
              </GlowButton>
            </div>
          </div>
          
          {/* Enterprise CTA */}
          <div className="text-center mt-16">
            <div className="bg-gradient-to-r from-slate-900/50 to-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50 max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-4">Ready for Enterprise?</h3>
              <p className="text-slate-400 mb-6">Join 500+ companies using FlexaBrain for mission-critical AI workloads</p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                <GlowButton>
                  Schedule Demo
                </GlowButton>
                <GlowButton variant="secondary">
                  Download Enterprise Guide
                </GlowButton>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Quick Start Section */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-2 bg-cyan-500/10 border border-cyan-500/20 
                            rounded-full px-6 py-3 mb-8">
              <Cpu className="h-5 w-5 text-cyan-400" />
              <span className="text-cyan-400 font-medium">15-Minute Setup</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-slate-300 
                           bg-clip-text text-transparent">
              Get Started in Minutes
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Deploy FlexaBrain on your infrastructure with our streamlined setup process
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Clone & Configure</h3>
              <p className="text-slate-400 leading-relaxed">
                Clone the repository and run our automated setup script. No complex configuration required.
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Deploy with Docker</h3>
              <p className="text-slate-400 leading-relaxed">
                Single command deployment with Docker Compose. Production-ready in under 15 minutes.
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Start Building</h3>
              <p className="text-slate-400 leading-relaxed">
                Access your AI agents through our intuitive dashboard or REST API. Scale as needed.
              </p>
            </div>
          </div>
          
          {/* Code Example */}
          <div className="bg-slate-950/50 rounded-2xl p-8 border border-slate-700/30 max-w-4xl mx-auto">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-slate-400 text-sm ml-4">Terminal</span>
            </div>
            <div className="font-mono text-sm space-y-2">
              <div className="text-slate-400"># Clone FlexaBrain Core</div>
              <div className="text-cyan-400">git clone https://github.com/flexabrain/core.git</div>
              <div className="text-cyan-400">cd flexabrain-core</div>
              <div className="text-slate-400 mt-4"># Deploy with Docker Compose</div>
              <div className="text-cyan-400">docker-compose up -d</div>
              <div className="text-slate-400 mt-4"># Access FlexaBrain</div>
              <div className="text-cyan-400">open http://localhost:3000</div>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <GlowButton>
              <Github className="mr-3 h-5 w-5" />
              Get Started Now
            </GlowButton>
          </div>
        </div>
      </section>
      
      {/* Community Section */}
      <section className="py-32 px-6 bg-slate-900/30">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-20">
            <div className="inline-flex items-center space-x-2 bg-orange-500/10 border border-orange-500/20 
                            rounded-full px-6 py-3 mb-8">
              <Users className="h-5 w-5 text-orange-400" />
              <span className="text-orange-400 font-medium">Join the Community</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-slate-300 
                           bg-clip-text text-transparent">
              Build the Future Together
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Join thousands of developers, engineers, and AI enthusiasts building the future of self-hosted intelligence
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {/* GitHub */}
            <div className="p-6 rounded-xl bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 hover:border-slate-600 transition-colors">
              <Github className="h-8 w-8 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">GitHub</h3>
              <p className="text-slate-400 text-sm mb-4">Contribute code, report issues, and shape the roadmap</p>
              <div className="text-blue-400 font-semibold">15K+ Stars</div>
            </div>
            
            {/* Community Chat */}
            <div className="p-6 rounded-xl bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 hover:border-slate-600 transition-colors">
              <MessageCircle className="h-8 w-8 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Community</h3>
              <p className="text-slate-400 text-sm mb-4">Get help, share ideas, and connect with peers</p>
              <div className="text-blue-400 font-semibold">5K+ Members</div>
            </div>
            
            {/* Documentation */}
            <div className="p-6 rounded-xl bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 hover:border-slate-600 transition-colors">
              <BookOpen className="h-8 w-8 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Documentation</h3>
              <p className="text-slate-400 text-sm mb-4">Comprehensive guides and API references</p>
              <div className="text-blue-400 font-semibold">Always Updated</div>
            </div>
            
            {/* Blog */}
            <div className="p-6 rounded-xl bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 hover:border-slate-600 transition-colors">
              <Sparkles className="h-8 w-8 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Blog</h3>
              <p className="text-slate-400 text-sm mb-4">Latest insights on AI and self-hosted intelligence</p>
              <div className="text-blue-400 font-semibold">Weekly Posts</div>
            </div>
          </div>
          
          <GlowButton>
            Join Our Community
            <ArrowRight className="ml-2 h-4 w-4" />
          </GlowButton>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-20 px-6 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <Brain className="h-8 w-8 text-blue-400" />
                <span className="text-2xl font-bold">FlexaBrain</span>
              </div>
              <p className="text-slate-400 mb-6 max-w-md leading-relaxed">
                Building the future of self-hosted AI. Intelligence without limits, 
                infrastructure without dependencies.
              </p>
              <div className="flex items-center space-x-4">
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <Github className="h-6 w-6" />
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <MessageCircle className="h-6 w-6" />
                </a>
              </div>
            </div>
            
            {/* Product */}
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-3 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Enterprise</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Roadmap</a></li>
              </ul>
            </div>
            
            {/* Resources */}
            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-3 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-800 text-center text-slate-400">
            <p>&copy; 2025 FlexaBrain. All rights reserved. Intelligence Without Limits.</p>
          </div>
        </div>
      </footer>
      
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}