'use client';

import { useState } from 'react';
import { Filter, X, Calendar } from 'lucide-react';

export interface FilterState {
  lifecycle_stage?: string[];
  account_id?: string; // Kept for backward compatibility, maps to customer_company_id in backend
  customer_company_id?: string; // New: use this for filtering by customer company
  date_from?: string;
  date_to?: string;
  search?: string;
}

interface AdvancedFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClear: () => void;
  filterOptions?: {
    lifecycle_stages?: string[];
    accounts?: Array<{ id: string; name: string }>;
  };
}

export default function AdvancedFilters({
  filters,
  onFiltersChange,
  onClear,
  filterOptions = {},
}: AdvancedFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  const lifecycleStages = filterOptions.lifecycle_stages || [
    'lead',
    'qualified',
    'customer',
    'churned',
  ];

  const hasActiveFilters = 
    (localFilters.lifecycle_stage && localFilters.lifecycle_stage.length > 0) ||
    localFilters.account_id ||
    localFilters.date_from ||
    localFilters.date_to ||
    localFilters.search;

  const handleApply = () => {
    onFiltersChange(localFilters);
    setShowFilters(false);
  };

  const handleClear = () => {
    const cleared = {};
    setLocalFilters(cleared);
    onFiltersChange(cleared);
    onClear();
  };

  const toggleLifecycleStage = (stage: string) => {
    const current = localFilters.lifecycle_stage || [];
    const updated = current.includes(stage)
      ? current.filter((s) => s !== stage)
      : [...current, stage];
    setLocalFilters({ ...localFilters, lifecycle_stage: updated.length > 0 ? updated : undefined });
  };

  const activeFilterCount =
    (localFilters.lifecycle_stage?.length || 0) +
    (localFilters.account_id ? 1 : 0) +
    (localFilters.date_from ? 1 : 0) +
    (localFilters.date_to ? 1 : 0);

  return (
    <div className="relative">
      <button
        onClick={() => setShowFilters(!showFilters)}
        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
          hasActiveFilters 
            ? 'border-primary bg-primary/20 text-foreground glow-cyan' 
            : 'border-border bg-surface text-text-secondary hover:bg-surface-elevated'
        }`}
      >
        <Filter className="h-4 w-4" />
        Filters
        {activeFilterCount > 0 && (
          <span className="rounded-full bg-primary text-primary-foreground px-1.5 py-0.5 text-xs font-semibold">
            {activeFilterCount}
          </span>
        )}
      </button>

      {showFilters && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowFilters(false)}
          />
          <div className="absolute top-full left-0 mt-2 w-80 rounded-2xl border border-border bg-card backdrop-blur-md shadow-2xl z-50 p-4 space-y-4 glass">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Filters</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Search</label>
              <input
                type="text"
                value={localFilters.search || ''}
                onChange={(e) =>
                  setLocalFilters({ ...localFilters, search: e.target.value || undefined })
                }
                placeholder="Search by name, email..."
                className="w-full rounded-lg border border-border bg-background backdrop-blur-sm px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* Lifecycle Stage Multi-select */}
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Lifecycle Stage</label>
              <div className="space-y-2">
                {lifecycleStages.map((stage) => (
                  <label
                    key={stage}
                    className="flex items-center gap-2 cursor-pointer hover:bg-surface-elevated p-2 rounded transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={localFilters.lifecycle_stage?.includes(stage) || false}
                      onChange={() => toggleLifecycleStage(stage)}
                      className="rounded border-border bg-background"
                    />
                    <span className="text-sm capitalize text-foreground">{stage}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Account Filter */}
            {filterOptions.accounts && filterOptions.accounts.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Account</label>
                <select
                  value={localFilters.account_id || ''}
                  onChange={(e) =>
                    setLocalFilters({
                      ...localFilters,
                      account_id: e.target.value || undefined,
                    })
                  }
                  className="w-full rounded-lg border border-border bg-background backdrop-blur-sm px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="" className="bg-card">All Accounts</option>
                  {filterOptions.accounts.map((account) => (
                    <option key={account.id} value={account.id} className="bg-card">
                      {account.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">Created Date</label>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">From</label>
                  <input
                    type="date"
                    value={localFilters.date_from || ''}
                    onChange={(e) =>
                      setLocalFilters({
                        ...localFilters,
                        date_from: e.target.value || undefined,
                      })
                    }
                    className="w-full rounded-lg border border-border bg-background backdrop-blur-sm px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">To</label>
                  <input
                    type="date"
                    value={localFilters.date_to || ''}
                    onChange={(e) =>
                      setLocalFilters({
                        ...localFilters,
                        date_to: e.target.value || undefined,
                      })
                    }
                    className="w-full rounded-lg border border-border bg-background backdrop-blur-sm px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="pt-2 border-t border-border">
                <div className="flex flex-wrap gap-2 mb-3">
                  {localFilters.lifecycle_stage?.map((stage) => (
                    <span
                      key={stage}
                      className="inline-flex items-center gap-1 rounded-full bg-surface-elevated px-2 py-1 text-xs text-foreground"
                    >
                      Stage: {stage}
                      <button
                        onClick={() => toggleLifecycleStage(stage)}
                        className="hover:text-primary transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  {localFilters.account_id && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-surface-elevated px-2 py-1 text-xs text-foreground">
                      Account
                      <button
                        onClick={() =>
                          setLocalFilters({ ...localFilters, account_id: undefined })
                        }
                        className="hover:text-primary transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {localFilters.date_from && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-surface-elevated px-2 py-1 text-xs text-foreground">
                      From: {localFilters.date_from}
                      <button
                        onClick={() =>
                          setLocalFilters({ ...localFilters, date_from: undefined })
                        }
                        className="hover:text-primary transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {localFilters.date_to && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-surface-elevated px-2 py-1 text-xs text-foreground">
                      To: {localFilters.date_to}
                      <button
                        onClick={() =>
                          setLocalFilters({ ...localFilters, date_to: undefined })
                        }
                        className="hover:text-primary transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t border-border">
              <button
                onClick={handleClear}
                className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-secondary hover:bg-surface-elevated transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={handleApply}
                className="flex-1 rounded-lg bg-gradient-tech text-white px-3 py-2 text-sm font-semibold hover:opacity-90 transition-all btn-tech"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

