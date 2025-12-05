import type { ComponentType } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  TrendingUp, 
  CheckSquare, 
  FileText,
  BarChart3,
  MessageSquare,
  Zap,
  Activity,
  UserCog,
  Bot
} from 'lucide-react';

export type NavigationItem = {
  title: string;
  description?: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  requiredRole?: string; // Role required to see this navigation item
};

export const navigation: NavigationItem[] = [
  {
    title: 'Dashboard',
    description: 'Overview of your CRM metrics and activities',
    href: '/portal',
    icon: LayoutDashboard,
  },
  {
    title: 'Customers',
    description: 'Manage customer contacts and track lifecycle',
    href: '/portal/contacts',
    icon: Users,
  },
  {
    title: 'Companies',
    description: 'Manage company accounts and business relationships',
    href: '/portal/accounts',
    icon: Building2,
    requiredRole: 'super_admin', // Only super_admin can see Companies tab
  },
  {
    title: 'AI Agent Configs',
    description: 'Manage ElevenLabs agent configurations',
    href: '/portal/ai-agent-configs',
    icon: Bot,
    requiredRole: 'super_admin', // Only super_admin can see AI Agent Configs tab
  },
  {
    title: 'Employees',
    description: 'Manage your internal team members',
    href: '/portal/employees',
    icon: UserCog,
  },
  {
    title: 'Deals',
    description: 'Sales pipeline and deal tracking',
    href: '/portal/deals',
    icon: TrendingUp,
  },
  {
    title: 'Tasks',
    description: 'Manage tasks and follow-ups',
    href: '/portal/tasks',
    icon: CheckSquare,
  },
  {
    title: 'Surveys',
    description: 'Create and manage customer surveys',
    href: '/portal/surveys',
    icon: FileText,
  },
  {
    title: 'Campaigns',
    description: 'Marketing and subscription reactivation campaigns',
    href: '/portal/campaigns',
    icon: MessageSquare,
  },
  {
    title: 'Templates',
    description: 'Email and SMS templates',
    href: '/portal/templates',
    icon: FileText,
  },
  {
    title: 'Subscription Reactivation',
    description: 'AI-powered subscription reactivation',
    href: '/portal/subscription-reactivation',
    icon: Zap,
  },
  {
    title: 'Analytics',
    description: 'Reports and insights',
    href: '/portal/analytics',
    icon: BarChart3,
  },
  {
    title: 'Activity',
    description: 'View all customer interactions',
    href: '/portal/activity',
    icon: Activity,
  },
];

