'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Menu, X, LogOut, ChevronDown, ChevronRight } from 'lucide-react';
import { getGroupedNavigation, type NavigationCategory, navigation } from '@/config/navigation';
import { cn } from '@/lib/utils';
import apiClient from '@/lib/api/client';
import { clearTokens, setCompanyId, getCompanyId } from '@/lib/cookies';

interface UserInfo {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  company_id?: string | null;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['CRM', 'Marketing'])); // Default expanded
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Fetch user info and sync company_id with retry logic
  useEffect(() => {
    const fetchUser = async (retries = 3): Promise<void> => {
      try {
        const response = await apiClient.get('/auth/me');
        if (response.data.success) {
          const userData = response.data.data;
          setUser(userData);
          
          // Sync company_id cookie if it changed
          const currentCompanyId = getCompanyId();
          const newCompanyId = userData.company_id || null;
          if (currentCompanyId !== newCompanyId) {
            setCompanyId(newCompanyId);
          }
          setLoading(false);
        }
      } catch (error) {
        // Retry on failure
        if (retries > 0) {
          setTimeout(() => fetchUser(retries - 1), 1000);
        } else {
          // User info fetch failed after retries, but don't block the UI
          console.error('Failed to fetch user info after retries:', error);
          setLoading(false);
        }
      }
    };

    fetchUser();
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

  const handleLogout = () => {
    clearTokens();
    window.location.href = '/login';
  };

  const getUserInitials = () => {
    if (!user) return 'U';
    const first = user.first_name?.[0] || '';
    const last = user.last_name?.[0] || '';
    return (first + last).toUpperCase() || user.email[0].toUpperCase();
  };

  const getUserDisplayName = () => {
    if (!user) return 'User';
    if (user.first_name || user.last_name) {
      return `${user.first_name || ''} ${user.last_name || ''}`.trim();
    }
    return user.email;
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/80">
        <div className="w-full flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <button
              type="button"
              className="lg:hidden text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
            <Link href="/portal" className="flex items-center">
              <img 
                src="/logo.png" 
                alt="CRMatIQ Logo" 
                className="h-12 w-auto"
              />
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {/* User menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-lg border border-border bg-surface-elevated px-3 py-1.5 hover:bg-secondary transition-colors"
                aria-label="User menu"
              >
                <div className="h-8 w-8 rounded-full bg-gradient-tech flex items-center justify-center text-white font-semibold text-sm">
                  {loading ? '...' : getUserInitials()}
                </div>
                {!loading && user && (
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-sm font-medium text-foreground">
                      {getUserDisplayName()}
                    </span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {user.role}
                    </span>
                  </div>
                )}
              </button>

              {/* User dropdown menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-card backdrop-blur-md shadow-2xl z-50 overflow-hidden glass">
                  {user && (
                    <div className="px-4 py-3 border-b border-border">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-tech flex items-center justify-center text-white font-semibold">
                          {getUserInitials()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {getUserDisplayName()}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {user.email}
                          </p>
                          <p className="text-xs text-muted-foreground capitalize mt-0.5">
                            {user.role}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:bg-surface-elevated transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={cn(
            'fixed top-16 bottom-0 left-0 z-30 w-64 border-r border-border bg-white transition-transform lg:translate-x-0 flex flex-col',
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <nav className="flex-1 flex flex-col gap-1 overflow-y-auto overflow-x-hidden px-3 py-4 scroll-smooth">
            {getGroupedNavigation(user?.role).map((item, index) => {
              // Regular navigation item (Dashboard)
              if ('href' in item) {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all hover:bg-surface-elevated hover:text-foreground hover:shadow-sm',
                      isActive
                        ? 'bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 text-foreground shadow-sm border border-primary/30 glow-cyan'
                        : 'text-text-secondary'
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <div className="flex flex-col gap-0.5">
                      <span>{item.title}</span>
                      {item.description ? (
                        <span className="text-xs font-normal text-muted-foreground">
                          {item.description}
                        </span>
                      ) : null}
                    </div>
                  </Link>
                );
              }

              // Category section
              const category = item as NavigationCategory;
              const isExpanded = expandedSections.has(category.title);
              const hasActiveItem = category.items.some(subItem => pathname === subItem.href);

              return (
                <div key={category.title} className="space-y-1">
                  <button
                    onClick={() => {
                      setExpandedSections(prev => {
                        const next = new Set(prev);
                        if (next.has(category.title)) {
                          next.delete(category.title);
                        } else {
                          next.add(category.title);
                        }
                        return next;
                      });
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-all hover:bg-surface-elevated',
                      hasActiveItem ? 'text-foreground' : 'text-text-secondary'
                    )}
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 shrink-0" />
                    )}
                    <category.icon className="h-4 w-4 shrink-0" />
                    <span>{category.title}</span>
                  </button>
                  
                  {isExpanded && (
                    <div className="ml-7 space-y-1">
                      {category.items.map((subItem) => {
                        const isActive = pathname === subItem.href;
                        return (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={cn(
                              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-surface-elevated hover:text-foreground',
                              isActive
                                ? 'bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 text-foreground shadow-sm border border-primary/30 glow-cyan'
                                : 'text-text-muted'
                            )}
                          >
                            <subItem.icon className="h-4 w-4 shrink-0" />
                            <div className="flex flex-col gap-0.5">
                              <span>{subItem.title}</span>
                              {subItem.description ? (
                                <span className="text-xs font-normal text-muted-foreground">
                                  {subItem.description}
                                </span>
                              ) : null}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </aside>

        {mobileMenuOpen && (
          <button
            type="button"
            aria-label="Close navigation"
            className="fixed inset-0 z-20 bg-gray-900/10 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex w-full flex-1 flex-col lg:pl-64">
          <div className="container flex-1 px-4 py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

