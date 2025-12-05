'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Calendar,
  MessageSquare,
  Users,
  BarChart3,
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
  FileText
} from 'lucide-react';

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState('Contacts');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [email, setEmail] = useState('');

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
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#DC2626] via-[#991B1B] to-[#F43F5E] flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="text-gray-900 font-bold text-lg tracking-tight">CRMatIQ</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-gray-600 hover:text-gray-900 transition-colors font-medium text-sm">Features</Link>
            <Link href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors font-medium text-sm">Pricing</Link>
            <Link href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors font-medium text-sm">Testimonials</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-gray-700 hover:text-gray-900 px-4 py-2 rounded-lg font-medium text-sm transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="bg-gradient-to-r from-[#DC2626] via-[#991B1B] to-[#F43F5E] text-white px-5 py-2 rounded-lg font-semibold hover:opacity-90 transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - Two Column Layout */}
      <section className="relative bg-gradient-to-br from-white via-red-50/30 to-white py-12 md:py-20 overflow-hidden">
        {/* Subtle red gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#DC2626]/5 via-transparent to-transparent pointer-events-none"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          {/* Left Column - Content */}
          <div className="space-y-8">
            {/* Small badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#DC2626]/10 border border-[#DC2626]/20">
              <Sparkles className="h-3.5 w-3.5 text-[#DC2626]" />
              <span className="text-[#DC2626] text-xs font-medium">Your CRM — On Auto-Pilot</span>
            </div>
            
            {/* Main headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
              Run Your Business{' '}
              <span className="bg-gradient-to-r from-[#DC2626] via-[#991B1B] to-[#F43F5E] bg-clip-text text-transparent">On Auto-Pilot</span>
            </h1>
            
            {/* Description */}
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-xl">
              Automate your CRM workflows, engage customers intelligently, and scale your business without the manual work. AI-powered insights at your fingertips.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-gradient-to-r from-[#DC2626] via-[#991B1B] to-[#F43F5E] text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-sm">
                Start Free Trial
                <ArrowRight className="h-5 w-5" />
              </button>
              <button className="bg-white text-gray-700 px-6 py-3 rounded-lg font-semibold border-2 border-gray-300 hover:border-gray-400 transition-all flex items-center justify-center gap-2">
                Watch Demo
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              </button>
            </div>
            
            {/* Trust indicators */}
            <div className="flex items-center gap-6 pt-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-lg">★</span>
                ))}
              </div>
              <p className="text-sm text-gray-600">Trusted by 10,000+ sales teams</p>
            </div>
          </div>
          
          {/* Right Column - Dashboard Visual */}
          <div className="relative">
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-200 shadow-xl">
              {/* Dashboard Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base md:text-lg font-semibold text-gray-900">Monthly Revenue</h3>
                <div className="flex items-center gap-1 text-green-600">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  <span className="text-sm font-medium">+23.5%</span>
                </div>
              </div>
              
              {/* Revenue Amount */}
              <div className="mb-6">
                <p className="text-3xl md:text-4xl font-bold text-gray-900">$847,320</p>
              </div>
              
              {/* Bar Chart */}
              <div className="mb-6">
                <div className="flex items-end gap-2 h-32">
                  {[40, 55, 45, 65, 50, 70, 85].map((height, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div 
                        className={`w-full rounded-t ${
                          i === 6 
                            ? 'bg-[#DC2626]' 
                            : 'bg-gray-300'
                        }`}
                        style={{ height: `${height}%` }}
                      ></div>
                      <span className="text-xs text-gray-500">{['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Metrics Cards */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="text-xl md:text-2xl font-bold text-gray-900">248</p>
                  <p className="text-xs md:text-sm text-gray-600 mt-1">Active Deals</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="text-xl md:text-2xl font-bold text-[#DC2626]">$2.4M</p>
                  <p className="text-xs md:text-sm text-gray-600 mt-1">Pipeline</p>
                </div>
              </div>
              
              {/* AI Insight Card - Positioned as overlay */}
              <div className="absolute -mt-8 ml-4 bg-white border border-[#DC2626]/20 rounded-lg p-3 shadow-lg max-w-[240px]">
                <div className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-[#DC2626] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-gray-900 mb-1">AI Insight</p>
                    <p className="text-xs text-gray-600">"Acme Corp is 87% likely to close this week"</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </section>
      
      {/* Statistics Section - Dark Background */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Trusted by industry leaders
            </h2>
            <p className="text-gray-400 text-lg">
              Join thousands of companies transforming their sales with AI
            </p>
          </div>
          
          {/* Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto mb-12">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-[#EF4444] mb-2">3x</div>
              <div className="text-white font-semibold mb-1">Faster Deal Closure</div>
              <div className="text-gray-400 text-sm">Average improvement</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-[#EF4444] mb-2">89%</div>
              <div className="text-white font-semibold mb-1">Prediction Accuracy</div>
              <div className="text-gray-400 text-sm">AI-powered forecasting</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-[#EF4444] mb-2">10k+</div>
              <div className="text-white font-semibold mb-1">Teams Worldwide</div>
              <div className="text-gray-400 text-sm">Trust CRMatIQ daily</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-[#EF4444] mb-2">40%</div>
              <div className="text-white font-semibold mb-1">Time Saved</div>
              <div className="text-gray-400 text-sm">On administrative tasks</div>
            </div>
          </div>
          
          {/* Company Logos */}
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-6">Powering sales teams at</p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-60">
              {['Stripe', 'Vercel', 'Linear', 'Notion', 'Figma', 'Slack'].map((company, index) => (
                <div key={index} className="text-gray-300 font-medium text-lg">
                  {company}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section with Tabs */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <span className="text-[#DC2626] text-sm font-semibold uppercase tracking-wider">Features</span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-3 mb-4">
            Powerful Features That Drive Results
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Discover powerful tools designed to streamline your workflow and boost productivity
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                activeTab === tab
                  ? 'bg-[#DC2626] text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="bg-white rounded-2xl p-8 md:p-12 border border-gray-200 shadow-lg">
          {features[activeTab as keyof typeof features] && (() => {
            const feature = features[activeTab as keyof typeof features];
            const Icon = feature.icon;
            return (
              <>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#DC2626] via-[#991B1B] to-[#F43F5E] flex items-center justify-center">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">{activeTab}</p>
                  </div>
                </div>
                <p className="text-gray-700 text-lg mb-8 max-w-3xl leading-relaxed">
                  {feature.description}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {feature.details.map((detail, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#DC2626] via-[#991B1B] to-[#F43F5E] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">{detail}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-gray-50 rounded-xl p-12 h-64 flex items-center justify-center border border-gray-200">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-xl bg-[#DC2626]/10 border border-[#DC2626]/20 flex items-center justify-center">
                      <Icon className="h-10 w-10 text-[#DC2626]" />
                    </div>
                    <p className="text-gray-600 text-sm">{feature.title} Preview</p>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-[#DC2626] text-sm font-semibold uppercase tracking-wider">Testimonials</span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-3 mb-4">
              Loved by Teams Worldwide
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              See what our customers have to say about their experience
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:border-[#DC2626]/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#DC2626] via-[#991B1B] to-[#F43F5E] flex items-center justify-center text-white font-bold text-base">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="text-gray-900 font-bold">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                    <div className="flex gap-1 mt-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <span key={i} className="text-yellow-400 text-xs">★</span>
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
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <span className="text-[#DC2626] text-sm font-semibold uppercase tracking-wider">FAQ</span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-3 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Everything you need to know about CRMatIQ
          </p>
        </div>
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-[#DC2626]/50 transition-all"
            >
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors group"
              >
                <span className="text-gray-900 font-semibold pr-4 group-hover:text-[#DC2626] transition-colors">{faq.question}</span>
                <ChevronDown
                  className={`h-5 w-5 text-gray-500 transition-transform flex-shrink-0 group-hover:text-[#DC2626] ${
                    openFaq === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openFaq === index && (
                <div className="px-6 pb-5 border-t border-gray-200">
                  <p className="text-gray-700 text-sm leading-relaxed pt-4">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-[#DC2626] via-[#991B1B] to-[#F43F5E] rounded-2xl p-12 md:p-16 text-center shadow-xl">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to close more deals?
            </h2>
            <p className="text-white text-lg mb-8 max-w-2xl mx-auto">
              Join 10,000+ sales teams already using CRMatIQ to hit their targets consistently.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button className="bg-white text-[#DC2626] px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all flex items-center justify-center gap-2 shadow-lg">
                Start Free Trial
                <ArrowRight className="h-5 w-5" />
              </button>
              <button className="bg-transparent text-white px-8 py-4 rounded-lg font-semibold border-2 border-white hover:bg-white/10 transition-all">
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#DC2626] via-[#991B1B] to-[#F43F5E] flex items-center justify-center">
                  <span className="text-white font-bold text-sm">C</span>
                </div>
                <span className="text-gray-900 font-bold text-lg tracking-tight">CRMatIQ</span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                The AI-powered CRM that helps sales teams close more deals, faster.
              </p>
              <div className="flex items-center gap-4">
                <Link href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900 transition-colors">
                  <Twitter className="h-5 w-5" />
                </Link>
                <Link href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900 transition-colors">
                  <Linkedin className="h-5 w-5" />
                </Link>
                <Link href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900 transition-colors">
                  <Github className="h-5 w-5" />
                </Link>
              </div>
            </div>
            <div>
              <h4 className="text-gray-900 font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="#features" className="hover:text-gray-900 transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-gray-900 transition-colors">Pricing</Link></li>
                <li><Link href="#features" className="hover:text-gray-900 transition-colors">Integration</Link></li>
                <li><Link href="/api" className="hover:text-gray-900 transition-colors">API</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-gray-900 font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/about" className="hover:text-gray-900 transition-colors">About</Link></li>
                <li><Link href="/blog" className="hover:text-gray-900 transition-colors">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-gray-900 transition-colors">Career</Link></li>
                <li><Link href="/press" className="hover:text-gray-900 transition-colors">Press</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-gray-900 font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/faq" className="hover:text-gray-900 transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-gray-900 transition-colors">Contact</Link></li>
                <li><Link href="/status" className="hover:text-gray-900 transition-colors">Status</Link></li>
                <li><Link href="/security" className="hover:text-gray-900 transition-colors">Security</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-center items-center gap-4">
            <p className="text-sm text-gray-600">© 2024 CRMatIQ. All rights reserved.</p>
            <div className="flex gap-4 text-sm text-gray-600">
              <Link href="/privacy" className="hover:text-gray-900 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-gray-900 transition-colors">Terms of Service</Link>
              <Link href="/cookies" className="hover:text-gray-900 transition-colors">Cookie Setting</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
