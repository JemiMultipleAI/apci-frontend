'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowRight,
  ChevronDown,
  Sparkles,
  Zap,
  Shield,
  TrendingUp,
  Twitter,
  Linkedin,
  Github,
  Contact,
  Building2,
  Briefcase,
  Megaphone,
  Brain,
  Check,
  Star,
  Cpu,
  Globe,
  Lock,
  BarChart3
} from 'lucide-react';

// Animated counter component
function AnimatedCounter({ end, suffix = '', duration = 2000 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    
    let startTime: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }, [isVisible, end, duration]);

  return <span>{count}{suffix}</span>;
}

// Floating particles component
function FloatingParticles() {
  const [particles, setParticles] = useState<Array<{ left: number; top: number; duration: number; delay: number }>>([]);

  useEffect(() => {
    // Generate random values only on client side to avoid hydration mismatch
    setParticles(
      Array.from({ length: 20 }, () => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        duration: 3 + Math.random() * 4,
        delay: Math.random() * 2,
      }))
    );
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-cyan-400/30"
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            animation: `float ${particle.duration}s ease-in-out infinite`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

// Animated grid background
function GridBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 grid-pattern opacity-50" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-glow-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-glow-pulse delay-700" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial-glow" />
    </div>
  );
}

// Glowing orb component
function GlowingOrb({ className = '', color = 'cyan' }: { className?: string; color?: 'cyan' | 'purple' | 'pink' }) {
  const colorClasses = {
    cyan: 'bg-cyan-500/20 shadow-cyan-500/50',
    purple: 'bg-purple-500/20 shadow-purple-500/50',
    pink: 'bg-pink-500/20 shadow-pink-500/50',
  };
  
  return (
    <div className={`absolute rounded-full blur-xl animate-morph-blob ${colorClasses[color]} ${className}`} />
  );
}

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState('Contacts');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const tabs = ['Contacts', 'Accounts', 'Deals', 'Campaigns', 'Analytics', 'AI Insights'];
  
  const features = {
    'Contacts': {
      icon: Contact,
      title: 'Contact Management',
      description: 'Comprehensive contact management with advanced search, filtering, and segmentation. Track all customer interactions, manage lifecycle stages, and maintain detailed contact profiles with custom fields.',
      details: [
        'Create, update, and manage contacts with custom fields',
        'Advanced search and multi-select filtering',
        'Contact segmentation by lifecycle stage',
        'Activity timeline and interaction history',
        'CSV import/export and bulk operations'
      ]
    },
    'Accounts': {
      icon: Building2,
      title: 'Account Management',
      description: 'Manage company accounts with hierarchy support, account scoring, and comprehensive metrics. Track relationships, revenue, and deal counts for each account.',
      details: [
        'Account hierarchy with parent-child relationships',
        'Account scoring and health metrics',
        'Contact and deal tracking per account',
        'Revenue and pipeline metrics',
        'CSV import/export capabilities'
      ]
    },
    'Deals': {
      icon: Briefcase,
      title: 'Pipeline & Deal Management',
      description: 'Visual pipeline management with customizable stages, deal tracking, and revenue forecasting. Monitor deal progress, probability, and value throughout the sales cycle.',
      details: [
        'Visual pipeline with customizable stages',
        'Deal value and probability tracking',
        'Revenue forecasting and pipeline analytics',
        'Deal detail pages with stage visualization',
        'Activity tracking for each deal'
      ]
    },
    'Campaigns': {
      icon: Megaphone,
      title: 'Marketing Campaigns',
      description: 'Create and execute multi-channel campaigns with email, SMS, and voice calls. Manage templates, track campaign performance, and automate customer engagement.',
      details: [
        'Multi-channel campaigns (email, SMS, voice)',
        'Template management with variable support',
        'Campaign activation and status tracking',
        'Automatic activity logging',
        'Subscription reactivation campaigns'
      ]
    },
    'Analytics': {
      icon: BarChart3,
      title: 'Analytics & Reporting',
      description: 'Comprehensive analytics dashboard with key metrics, revenue trends, pipeline analysis, and activity insights. Make data-driven decisions with real-time reporting.',
      details: [
        'Key metrics overview (contacts, accounts, deals, revenue)',
        'Revenue trends over time',
        'Pipeline by stage analysis',
        'Contact lifecycle distribution',
        'Activity by type breakdown'
      ]
    },
    'AI Insights': {
      icon: Brain,
      title: 'AI-Powered Intelligence',
      description: 'Leverage AI for subscription reactivation, sentiment analysis, churn prediction, and next best action recommendations. Get intelligent insights to improve customer relationships.',
      details: [
        'Subscription reactivation scoring',
        'Sentiment analysis and churn prediction',
        'Next best action recommendations',
        'Contact health scoring',
        'Survey management with AI insights'
      ]
    }
  };

  const testimonials = [
    {
      name: 'Sarah Mitchell',
      role: 'CEO, TechCorp',
      quote: 'From CRM to Analytics, this platform gave our team the tools to not only manage projects but to seamlessly streamline our workflow. It has become an essential part of our daily operations.',
      avatar: 'SM',
      rating: 5,
    },
    {
      name: 'David Clark',
      role: 'Sales Director, GrowthCo',
      quote: 'This platform has revolutionized our project management. The seamless flow between different modules saves time and enhances team productivity significantly.',
      avatar: 'DC',
      rating: 5,
    },
    {
      name: 'Michael Johnson',
      role: 'Operations Manager, ScaleUp',
      quote: 'This platform has truly transformed how we manage our CRM and analytics system, making our operations more efficient and productive across all departments.',
      avatar: 'MJ',
      rating: 5,
    },
  ];

  const faqs = [
    {
      question: 'How can your CRM product help improve customer relationships?',
      answer: 'Our CRM provides comprehensive contact management, activity tracking, and AI-powered insights to help you understand and engage with your customers more effectively. With automated workflows and personalized campaigns, you can build stronger relationships and increase customer satisfaction.',
    },
    {
      question: 'Can your system be customized for specific business needs?',
      answer: 'Yes, CRMatIQ is highly customizable. You can create custom fields, configure workflows, set up automated campaigns, and tailor the platform to match your specific business processes and requirements.',
    },
    {
      question: 'How does your Chat tool enhance team communication?',
      answer: 'Our Chat tool provides real-time messaging, AI-powered chatbots for customer support, and seamless integration with your CRM to ensure all communications are tracked and accessible in one place.',
    },
    {
      question: 'What features does your Calendar offer for team collaboration?',
      answer: 'Our Calendar includes scheduling, meeting management, team availability views, and integration with your CRM to automatically track customer interactions and follow-ups.',
    },
    {
      question: 'What kind of support is available with your products?',
      answer: 'We offer comprehensive support including documentation, email support, live chat, and dedicated account managers for enterprise customers. Our team is committed to helping you succeed.',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isLoaded ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
        <div className="bg-white/95 backdrop-blur-md border-b border-gray-200">
        <div className="container mx-auto px-6 md:px-8 lg:px-12 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center group">
              <img 
                src="/logo.png" 
                alt="CRMatIQ Logo" 
                className="h-14 w-auto"
              />
          </Link>
            
          <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-gray-700 hover:text-gray-900 transition-colors font-medium text-sm relative group">
                Features
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#2563EB] group-hover:w-full transition-all duration-300" />
              </Link>
              <Link href="#pricing" className="text-gray-700 hover:text-gray-900 transition-colors font-medium text-sm relative group">
                Pricing
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#2563EB] group-hover:w-full transition-all duration-300" />
              </Link>
              <Link href="#testimonials" className="text-gray-700 hover:text-gray-900 transition-colors font-medium text-sm relative group">
                Testimonials
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#2563EB] group-hover:w-full transition-all duration-300" />
              </Link>
          </div>
            
            <div className="flex items-center gap-4">
            <Link
              href="/login"
                className="px-6 py-2.5 rounded-lg font-semibold text-sm bg-[#2563EB] text-white hover:bg-[#1D4ED8] transition-all duration-300 shadow-md hover:shadow-lg"
              >
                Get Started
            </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-24 pb-12 overflow-hidden">
        <GridBackground />
        <FloatingParticles />
        
        {/* Animated orbs */}
        <GlowingOrb className="w-64 h-64 top-20 -left-32" color="cyan" />
        <GlowingOrb className="w-96 h-96 -top-48 right-0" color="purple" />
        <GlowingOrb className="w-48 h-48 bottom-20 right-20" color="pink" />
        
        <div className="container mx-auto px-6 md:px-8 lg:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
          {/* Left Column - Content */}
          <div className="space-y-6">
              {/* Animated badge */}
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className="relative">
                  <Sparkles className="h-4 w-4 text-[#2563EB]" />
                  <Sparkles className="h-4 w-4 text-[#2563EB] absolute inset-0 animate-ping opacity-50" />
                </div>
                <span className="text-[#2563EB] text-sm font-medium">AI-Powered CRM Platform</span>
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            </div>
            
              {/* Main headline with staggered animation */}
              <h1 className={`text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight transition-all duration-700 delay-100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <span className="text-gray-900">Run Your</span>
                <br />
                <span className="text-gray-900">Business </span>
                <span className="relative">
                  <span className="text-[#2563EB]">
                    On Auto-Pilot
                  </span>
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                    <path 
                      d="M2 10C50 2 100 2 150 6C200 10 250 4 298 8" 
                      stroke="#2563EB" 
                      strokeWidth="3" 
                      strokeLinecap="round"
                      className="animate-fade-in delay-500"
                      style={{ strokeDasharray: 300, strokeDashoffset: isLoaded ? 0 : 300, transition: 'stroke-dashoffset 1s ease-out 0.5s' }}
                    />
                  </svg>
                </span>
            </h1>
            
            {/* Description */}
              <p className={`text-lg md:text-xl text-gray-600 leading-relaxed max-w-xl transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                Automate your CRM workflows, engage customers intelligently, and scale your business without the manual work. 
                <span className="text-cyan-400"> AI-powered insights</span> at your fingertips.
            </p>
            
            {/* CTA Buttons */}
              <div className={`flex flex-col sm:flex-row gap-4 transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <Link 
                  href="/login" 
                  className="group px-8 py-4 rounded-xl font-semibold text-base bg-[#2563EB] text-white hover:bg-[#1D4ED8] transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                >
                  <span>Start Free Trial</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            {/* Trust indicators */}
              <div className={`flex flex-wrap items-center gap-8 pt-4 transition-all duration-700 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {['bg-cyan-500', 'bg-purple-500', 'bg-pink-500', 'bg-green-500'].map((color, i) => (
                      <div key={i} className={`w-8 h-8 rounded-full ${color} border-2 border-[#0A0F1C] flex items-center justify-center text-xs font-bold`}>
                        {String.fromCharCode(65 + i)}
                      </div>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    <span className="text-gray-900 font-semibold">10,000+</span> teams
                  </span>
                </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                ))}
                  <span className="text-sm text-gray-600 ml-2">4.9/5 rating</span>
              </div>
            </div>
          </div>
          
          {/* Right Column - Dashboard Visual */}
            <div className={`relative transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}>
              {/* Main dashboard card */}
          <div className="relative">
                <div className="absolute inset-0 bg-[#2563EB]/10 rounded-2xl blur-xl" />
                <div className="relative glass rounded-2xl p-6 md:p-8 border border-cyan-500/20 animate-float-slow">
              {/* Dashboard Header */}
              <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <div className="flex items-center gap-2 text-green-400">
                      <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-medium">+23.5%</span>
                </div>
              </div>
              
                  {/* Revenue Display */}
              <div className="mb-6">
                    <p className="text-gray-600 text-sm mb-1">Monthly Revenue</p>
                    <p className="text-4xl md:text-5xl font-bold text-gray-900">
                      $<AnimatedCounter end={847} suffix=",320" />
                    </p>
              </div>
              
                  {/* Animated Line Chart */}
              <div className="mb-6">
                    <div className="relative h-36">
                      <svg className="w-full h-full" viewBox="0 0 280 100" preserveAspectRatio="none">
                        {/* Grid lines */}
                        <defs>
                          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#06B6D4" />
                            <stop offset="50%" stopColor="#8B5CF6" />
                            <stop offset="100%" stopColor="#EC4899" />
                          </linearGradient>
                          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
                          </linearGradient>
                          <filter id="glow">
                            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                            <feMerge>
                              <feMergeNode in="coloredBlur"/>
                              <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                          </filter>
                        </defs>
                        
                        {/* Horizontal grid lines */}
                        {[25, 50, 75].map((y) => (
                          <line 
                            key={y} 
                            x1="0" 
                            y1={y} 
                            x2="280" 
                            y2={y} 
                            stroke="#E5E7EB" 
                            strokeWidth="0.5" 
                            strokeDasharray="4,4"
                          />
                        ))}
                        
                        {/* Area fill */}
                        <path
                          d="M0,60 L40,45 L80,55 L120,35 L160,50 L200,30 L240,15 L280,15 L280,100 L0,100 Z"
                          fill="url(#areaGradient)"
                          className={`transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                          style={{ transitionDelay: '800ms' }}
                        />
                        
                        {/* Main line */}
                        <path
                          d="M0,60 L40,45 L80,55 L120,35 L160,50 L200,30 L240,15 L280,15"
                          fill="none"
                          stroke="url(#lineGradient)"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          filter="url(#glow)"
                          className={`transition-all duration-1500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                          style={{ 
                            strokeDasharray: 400,
                            strokeDashoffset: isLoaded ? 0 : 400,
                            transition: 'stroke-dashoffset 1.5s ease-out 0.5s, opacity 0.3s ease'
                          }}
                        />
                        
                        {/* Data points */}
                        {[
                          { x: 0, y: 60 },
                          { x: 40, y: 45 },
                          { x: 80, y: 55 },
                          { x: 120, y: 35 },
                          { x: 160, y: 50 },
                          { x: 200, y: 30 },
                          { x: 240, y: 15 },
                        ].map((point, i) => (
                          <g key={i}>
                            {/* Outer glow */}
                            <circle
                              cx={point.x}
                              cy={point.y}
                              r="6"
                              fill="#06B6D4"
                              opacity="0.3"
                              className={`transition-all duration-500 ${isLoaded ? 'scale-100' : 'scale-0'}`}
                              style={{ 
                                transformOrigin: `${point.x}px ${point.y}px`,
                                transitionDelay: `${i * 100 + 1000}ms`
                              }}
                            />
                            {/* Inner point */}
                            <circle
                              cx={point.x}
                              cy={point.y}
                              r="3"
                              fill={i === 6 ? '#EC4899' : '#06B6D4'}
                              className={`transition-all duration-500 ${isLoaded ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
                              style={{ 
                                transformOrigin: `${point.x}px ${point.y}px`,
                                transitionDelay: `${i * 100 + 1000}ms`
                              }}
                            />
                          </g>
                        ))}
                      </svg>
                      
                      {/* X-axis labels */}
                      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-0 -mb-5">
                        {['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, i) => (
                          <span 
                            key={month} 
                            className={`text-xs transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'} ${i === 6 ? 'text-gray-900' : 'text-gray-600'}`}
                            style={{ transitionDelay: `${i * 50 + 1200}ms` }}
                          >
                            {month}
                          </span>
                        ))}
                    </div>
                </div>
              </div>
              
              {/* Metrics Cards */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-gray-300 transition-all duration-300 group">
                      <div className="flex items-center gap-2 mb-2">
                        <Briefcase className="h-4 w-4 text-gray-700" />
                        <span className="text-xs text-gray-600">Active Deals</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors">
                        <AnimatedCounter end={248} />
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-gray-300 transition-all duration-300 group">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-gray-700" />
                        <span className="text-xs text-gray-600">Pipeline</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors">$2.4M</p>
                    </div>
                  </div>
                </div>
                
                {/* Floating AI Insight Card */}
                <div className="absolute -bottom-6 -left-6 md:-left-12 animate-float-delayed">
                  <div className="glass rounded-xl p-4 border border-purple-500/30 shadow-2xl max-w-[260px] glow-purple">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#2563EB] flex items-center justify-center flex-shrink-0">
                        <Brain className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 mb-1">AI Insight</p>
                        <p className="text-xs text-gray-600">"Acme Corp is <span className="text-green-600 font-medium">87% likely</span> to close this week"</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating notification */}
                <div className="absolute -top-4 -right-4 md:-right-8 animate-float">
                  <div className="glass rounded-xl p-3 border border-cyan-500/30 shadow-2xl glow-cyan">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#2563EB] flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
              </div>
                  <div>
                        <p className="text-xs font-medium text-gray-900">Deal Won!</p>
                        <p className="text-xs text-gray-600">$45,000</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-xs text-gray-600">Scroll to explore</span>
          <ChevronDown className="h-5 w-5 text-cyan-400" />
        </div>
      </section>
      
      {/* Statistics Section - Dark with Glow */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-mesh" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full glass border border-cyan-500/30 text-cyan-400 text-sm font-medium mb-4">
              Trusted Worldwide
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Powering the best sales teams
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Join thousands of companies transforming their sales with AI
            </p>
          </div>
          
          {/* Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto mb-16">
            {[
              { value: 3, suffix: 'x', label: 'Faster Deal Closure', sublabel: 'Average improvement' },
              { value: 89, suffix: '%', label: 'Prediction Accuracy', sublabel: 'AI-powered forecasting' },
              { value: 10, suffix: 'k+', label: 'Teams Worldwide', sublabel: 'Trust CRMatIQ daily' },
              { value: 40, suffix: '%', label: 'Time Saved', sublabel: 'On administrative tasks' },
            ].map((stat, index) => (
              <div 
                key={index} 
                className="text-center group"
              >
                <div className="relative inline-block">
                  <div className="text-5xl md:text-6xl font-bold text-[#2563EB] mb-2">
                    <AnimatedCounter end={stat.value} suffix={stat.suffix} />
            </div>
                  <div className="absolute inset-0 bg-[#2563EB]/20 blur-2xl opacity-30 group-hover:opacity-50 transition-opacity" />
            </div>
                <div className="text-gray-900 font-semibold mb-1">{stat.label}</div>
                <div className="text-gray-600 text-sm">{stat.sublabel}</div>
            </div>
            ))}
          </div>
          
          {/* Company Logos */}
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-8">Powering sales teams at</p>
            <div className="flex flex-wrap items-center justify-center gap-12 opacity-40 hover:opacity-60 transition-opacity">
              {['Stripe', 'Vercel', 'Linear', 'Notion', 'Figma', 'Slack'].map((company, index) => (
                <div 
                  key={index} 
                  className="text-gray-700 font-medium text-xl hover:text-gray-900 transition-colors cursor-default"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {company}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section with Tabs */}
      <section id="features" className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <GlowingOrb className="w-96 h-96 -top-48 -left-48" color="purple" />
        <GlowingOrb className="w-64 h-64 bottom-0 right-0" color="cyan" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full glass border border-purple-500/30 text-purple-400 text-sm font-medium mb-4">
              Features
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Powerful Features That{' '}
              <span className="text-[#2563EB]">
                Drive Results
              </span>
          </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Discover powerful tools designed to streamline your workflow and boost productivity
          </p>
        </div>
          
          {/* Tab buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === tab
                    ? 'bg-[#2563EB] text-white shadow-lg hover:bg-[#1D4ED8]'
                    : 'bg-white text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
          
          {/* Feature content */}
          <div className="bg-white rounded-2xl p-8 md:p-12 border border-gray-200 hover:border-gray-300 transition-all duration-500 shadow-sm">
          {features[activeTab as keyof typeof features] && (() => {
            const feature = features[activeTab as keyof typeof features];
            const Icon = feature.icon;
            return (
                <div className="animate-fade-in">
                  {/* Header */}
                  <div className="flex items-center gap-4 mb-8">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-xl bg-[#2563EB] flex items-center justify-center">
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                      <div className="absolute inset-0 w-14 h-14 rounded-xl bg-[#2563EB]/50 blur-lg opacity-50" />
                  </div>
                  <div>
                      <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                      {feature.title}
                    </h3>
                      <p className="text-gray-600 text-sm mt-1">{activeTab}</p>
                    </div>
                  </div>
                  
                  {/* Description */}
                  <p className="text-gray-700 text-lg leading-relaxed mb-8">
                  {feature.description}
                </p>
                  
                  {/* Bullet points in balanced grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {feature.details.map((detail, index) => (
                      <div 
                        key={index} 
                        className="flex items-start gap-3 group p-4 rounded-xl bg-gray-50 border border-gray-200 hover:border-gray-300 hover:bg-gray-100 transition-all duration-300"
                      >
                        <div className="w-6 h-6 rounded-full bg-[#2563EB] flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                          <Check className="w-3.5 h-3.5 text-white" />
                      </div>
                        <p className="text-gray-700 text-sm leading-relaxed group-hover:text-gray-900 transition-colors">{detail}</p>
                    </div>
                  ))}
                </div>
                  
                  {/* AI Powered badge - bottom right */}
                  <div className="flex justify-end">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#2563EB]/10 border border-[#2563EB]/20">
                      <Sparkles className="h-4 w-4 text-[#2563EB]" />
                      <span className="text-[#2563EB] text-sm font-medium">AI Powered</span>
                    </div>
                  </div>
                </div>
            );
          })()}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-mesh opacity-50" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full glass border border-pink-500/30 text-pink-400 text-sm font-medium mb-4">
              Testimonials
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Loved by Teams{' '}
              <span className="text-[#2563EB]">
                Worldwide
              </span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              See what our customers have to say about their experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:border-gray-300 transition-all duration-500 group hover:-translate-y-2 shadow-sm"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full bg-[#2563EB] flex items-center justify-center text-white font-bold text-lg">
                    {testimonial.avatar}
                    </div>
                    <div className="absolute inset-0 w-14 h-14 rounded-full bg-[#2563EB]/50 blur-lg opacity-0 group-hover:opacity-50 transition-opacity" />
                  </div>
                  <div>
                    <h4 className="text-gray-900 font-bold">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                    <div className="flex gap-1 mt-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{testimonial.quote}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <GlowingOrb className="w-64 h-64 top-0 right-1/4" color="cyan" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full glass border border-cyan-500/30 text-cyan-400 text-sm font-medium mb-4">
              FAQ
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Frequently Asked{' '}
              <span className="text-[#2563EB]">
                Questions
              </span>
          </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Everything you need to know about CRMatIQ
          </p>
        </div>
          
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-gray-300 transition-all duration-300 shadow-sm"
            >
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors group"
              >
                  <span className="text-gray-900 font-semibold pr-4 group-hover:text-gray-700 transition-colors">{faq.question}</span>
                <ChevronDown
                    className={`h-5 w-5 text-gray-600 transition-all duration-300 flex-shrink-0 group-hover:text-gray-900 ${
                      openFaq === index ? 'rotate-180 text-gray-900' : ''
                  }`}
                />
              </button>
                <div className={`overflow-hidden transition-all duration-300 ${openFaq === index ? 'max-h-96' : 'max-h-0'}`}>
                  <div className="px-6 pb-5 border-t border-gray-200">
                    <p className="text-gray-600 text-sm leading-relaxed pt-4">{faq.answer}</p>
                  </div>
                </div>
            </div>
          ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-24 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-[#2563EB]" />
            <div className="absolute inset-0 bg-gradient-mesh opacity-50" />
            <div className="absolute inset-0">
              <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float" />
              <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-float-delayed" />
            </div>
            
            <div className="relative p-12 md:p-20 text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to close more deals?
            </h2>
              <p className="text-white/95 text-lg mb-10 max-w-2xl mx-auto">
              Join 10,000+ sales teams already using CRMatIQ to hit their targets consistently.
            </p>
              <div className="flex justify-center">
                <Link 
                  href="/login" 
                  className="group bg-white text-gray-900 px-8 py-4 rounded-xl font-semibold hover:bg-slate-100 transition-all flex items-center justify-center gap-2 shadow-2xl hover:shadow-white/20"
                >
                Start Free Trial
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-16 border-t border-gray-200 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center mb-6">
                <img 
                  src="/logo.png" 
                  alt="CRMatIQ Logo" 
                  className="h-14 w-auto"
                />
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                The AI-powered CRM that helps sales teams close more deals, faster.
              </p>
              <div className="flex items-center gap-4">
                {[Twitter, Linkedin, Github].map((Icon, index) => (
                  <Link 
                    key={index}
                    href="#" 
                    className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:border-gray-300 transition-all"
                  >
                    <Icon className="h-5 w-5" />
                </Link>
                ))}
              </div>
            </div>
            
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Integration', 'API'] },
              { title: 'Company', links: ['About', 'Blog', 'Career', 'Press'] },
              { title: 'Support', links: ['Help Center', 'Contact', 'Status', 'Security'] },
            ].map((column, index) => (
              <div key={index}>
                <h4 className="text-gray-900 font-semibold mb-4">{column.title}</h4>
                <ul className="space-y-3 text-sm">
                  {column.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                        {link}
                      </Link>
                    </li>
                  ))}
              </ul>
            </div>
            ))}
          </div>
          
          <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600">© 2024 CRMatIQ. All rights reserved.</p>
            <div className="flex gap-6 text-sm text-gray-600">
              <Link href="/privacy" className="hover:text-gray-900 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-gray-900 transition-colors">Terms of Service</Link>
              <Link href="/cookies" className="hover:text-gray-900 transition-colors">Cookie Settings</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
