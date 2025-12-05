'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'What is CRMatIQ?',
    answer: 'CRMatIQ (AI Powered Customer Intelligence) is a modern CRM platform that combines traditional customer relationship management with AI-powered features like subscription reactivation, survey automation, and predictive analytics to help businesses build stronger customer relationships.',
  },
  {
    question: 'How does subscription reactivation work?',
    answer: 'Subscription reactivation automatically identifies dormant contacts (contacts with no activity for a specified period) and calculates a reactivation score based on factors like days since last activity, lifecycle stage, and engagement history. It then helps you prioritize which contacts to engage with first through automated subscription reactivation campaigns.',
  },
  {
    question: 'What is the Surveybot agent?',
    answer: 'The Surveybot agent allows you to create and distribute customer feedback surveys via email, SMS, or in-app. It collects responses and uses AI to analyze sentiment, extract key topics, and provide insights to help you understand customer satisfaction and needs.',
  },
  {
    question: 'Can I import my existing contacts?',
    answer: 'Yes! CRMatIQ supports CSV import for contacts, accounts, and other data. You can upload your existing customer data and the system will help you deduplicate and organize it. Export functionality is also available to backup or migrate your data.',
  },
  {
    question: 'What integrations are available?',
    answer: 'CRMatIQ is designed to integrate with popular services including email providers (SendGrid, Resend), SMS services (Twilio), AI services (OpenAI, Anthropic), and external CRMs (HubSpot, Salesforce). Integration setup is done through environment variables for easy configuration.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Absolutely. CRMatIQ follows industry best practices for security including data encryption, secure authentication with JWT tokens, role-based access control, and GDPR compliance. Your data is stored securely in PostgreSQL databases and all communications are encrypted.',
  },
  {
    question: 'How does the sales pipeline work?',
    answer: 'The sales pipeline allows you to track deals through customizable stages (Lead, Qualified, Proposal, Negotiation, Closed Won/Lost). You can set deal values, probabilities, expected close dates, and get revenue forecasting based on your pipeline data.',
  },
  {
    question: 'What kind of analytics does CRMatIQ provide?',
    answer: 'CRMatIQ provides comprehensive analytics including dashboard metrics (total contacts, deals, revenue), pipeline analysis, revenue trends, contact lifecycle distribution, activity tracking, and AI-powered insights like churn prediction and next best action recommendations.',
  },
  {
    question: 'Can I customize the CRM to fit my business?',
    answer: 'Yes! CRMatIQ offers customizable fields, lifecycle stages, deal stages, user roles, and permissions. You can also create custom email and SMS templates with variables for personalization. The platform is designed to be flexible and adaptable to different business needs.',
  },
  {
    question: 'How do campaigns work?',
    answer: 'Campaigns allow you to create multi-channel marketing and subscription reactivation campaigns. You can target specific contact segments, choose channels (email, SMS, call, or multi-channel), schedule campaigns, and track performance metrics. Campaigns can be activated, paused, or completed as needed.',
  },
  {
    question: 'What is the difference between contacts and accounts?',
    answer: 'Contacts represent individual people (customers, prospects, leads) while accounts represent companies or organizations. Contacts can be associated with accounts, allowing you to manage both individual relationships and company-level relationships. This is especially useful for B2B scenarios.',
  },
  {
    question: 'How does task management work?',
    answer: 'Tasks help you track follow-ups, meetings, and other activities. You can assign tasks to team members, set priorities (low, medium, high, urgent), due dates, and link them to contacts, accounts, or deals. Tasks can be filtered by status, priority, or assignee.',
  },
  {
    question: 'Can multiple users collaborate?',
    answer: 'Yes! CRMatIQ supports team collaboration with user roles (Admin, Manager, Sales Rep, Viewer), team structures, and activity tracking. Team members can see each other\'s activities, share notes, and collaborate on deals and accounts.',
  },
  {
    question: 'What happens if I need help or support?',
    answer: 'CRMatIQ includes comprehensive documentation and setup guides. For technical support, you can refer to the SETUP.md file for configuration help, check the API documentation, or review the codebase which is well-documented and follows best practices.',
  },
  {
    question: 'Is there a mobile app?',
    answer: 'Currently, CRMatIQ is a web-based application that works on all modern browsers and is mobile-responsive. Native mobile apps for iOS and Android are planned for future releases.',
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-950 via-red-900 to-rose-950">
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-red-950/80 border-b border-red-800/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/30">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            <span className="text-white font-bold text-xl">CRMatIQ</span>
          </Link>
          <Link
            href="/signup"
            className="bg-white text-red-700 px-6 py-2.5 rounded-lg font-semibold hover:bg-red-50 transition-all shadow-lg hover:shadow-xl"
          >
            Register
          </Link>
        </div>
      </nav>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-red-400 text-sm font-semibold uppercase tracking-wider">FAQ</span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mt-3 mb-4">Frequently Asked Questions</h1>
            <p className="text-red-200/80 text-lg">
              Everything you need to know about CRMatIQ CRM
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-red-900/40 to-rose-900/40 backdrop-blur-md rounded-xl border border-red-800/30 overflow-hidden hover:border-red-700/50 transition-all"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-red-900/30 transition-colors group"
                >
                  <span className="font-semibold text-lg pr-4 text-white group-hover:text-red-200 transition-colors">{faq.question}</span>
                  {openIndex === index ? (
                    <ChevronUp className="h-5 w-5 text-red-300 shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-red-300 shrink-0" />
                  )}
                </button>
                {openIndex === index && (
                  <div className="px-6 pb-6 border-t border-red-800/30">
                    <p className="text-red-100 leading-relaxed pt-4">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-red-200/80 mb-4">
              Still have questions? We're here to help.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-lg bg-white text-red-700 px-6 py-3 font-semibold hover:bg-red-50 transition-all shadow-lg hover:shadow-xl"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

