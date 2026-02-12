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
  Bot,
  MessageCircle
} from 'lucide-react';

export type NavigationItem = {
  title: string;
  description?: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  requiredRole?: string; // Role required to see this navigation item
  category?: string; // Category for grouping
};

export type NavigationCategory = {
  title: string;
  icon: ComponentType<{ className?: string }>;
  items: NavigationItem[];
};

export const navigation: NavigationItem[] = [
  {
    title: 'Dashboard',
    description: 'Overview of your CRM metrics and activities',
    href: '/portal',
    icon: LayoutDashboard,
  },
  // Contact Management Section
  {
    title: 'Customers',
    description: 'Manage customer contacts and track lifecycle',
    href: '/portal/contacts',
    icon: Users,
    category: 'Contact Management',
  },
  {
    title: 'Companies',
    description: 'Manage company accounts and business relationships',
    href: '/portal/accounts',
    icon: Building2,
    requiredRole: 'super_admin',
    category: 'Contact Management',
  },
  // Temporarily hidden
  // {
  //   title: 'Deals',
  //   description: 'Sales pipeline and deal tracking',
  //   href: '/portal/deals',
  //   icon: TrendingUp,
  //   category: 'Contact Management',
  // },
  // {
  //   title: 'Tasks',
  //   description: 'Manage tasks and follow-ups',
  //   href: '/portal/tasks',
  //   icon: CheckSquare,
  //   category: 'Contact Management',
  // },
  {
    title: 'Contact Groups',
    description: 'Organize contacts into groups for campaigns',
    href: '/portal/contact-groups',
    icon: Users,
    category: 'Contact Management',
  },
  {
    title: 'Dormant Contacts',
    description: 'Find and reactivate dormant customers',
    href: '/portal/dormant-contacts',
    icon: Zap,
    category: 'Contact Management',
  },
  // Marketing Section
  {
    title: 'Campaigns',
    description: 'Create and manage marketing campaigns',
    href: '/portal/campaigns',
    icon: MessageSquare,
    category: 'Marketing',
  },
  // Tools Section
  // {
  //   title: 'Surveys',
  //   description: 'Create and manage customer surveys',
  //   href: '/portal/surveys',
  //   icon: FileText,
  //   category: 'Tools',
  // },
  {
    title: 'Analytics',
    description: 'Reports and insights',
    href: '/portal/analytics',
    icon: BarChart3,
    category: 'Tools',
  },
  {
    title: 'Activity',
    description: 'View all customer interactions',
    href: '/portal/activity',
    icon: Activity,
    category: 'Tools',
  },
  // {
  //   title: 'AI Chat',
  //   description: 'Test and interact with the AI agent',
  //   href: '/portal/chat',
  //   icon: MessageCircle,
  //   category: 'Tools',
  // },
  // Settings Section
  {
    title: 'Employees',
    description: 'Manage your internal team members',
    href: '/portal/employees',
    icon: UserCog,
    requiredRole: 'super_admin',
    category: 'Settings',
  },
  {
    title: 'AI Agent Configs',
    description: 'Manage ElevenLabs agent configurations',
    href: '/portal/ai-agent-configs',
    icon: Bot,
    requiredRole: 'super_admin',
    category: 'Settings',
  },
];

// Helper function to group navigation items by category
export function getGroupedNavigation(userRole?: string): (NavigationItem | NavigationCategory)[] {
  const filteredItems = navigation.filter((item) => {
    if (item.requiredRole) {
      return userRole === item.requiredRole;
    }
    return true;
  });

  const dashboard = filteredItems.find(item => !item.category);
  const categorized = filteredItems.filter(item => item.category);
  
  const grouped = categorized.reduce((acc, item) => {
    const category = item.category!;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, NavigationItem[]>);

  const result: (NavigationItem | NavigationCategory)[] = [];
  
  if (dashboard) {
    result.push(dashboard);
  }

  // Add categories in order
  const categoryOrder = ['Contact Management', 'Marketing', 'Tools', 'Settings'];
  const categoryIcons: Record<string, ComponentType<{ className?: string }>> = {
    'Contact Management': Users,
    'Marketing': MessageSquare,
    'Tools': BarChart3,
    'Settings': UserCog,
  };

  categoryOrder.forEach(category => {
    if (grouped[category] && grouped[category].length > 0) {
      result.push({
        title: category,
        icon: categoryIcons[category],
        items: grouped[category],
      });
    }
  });

  return result;
}

