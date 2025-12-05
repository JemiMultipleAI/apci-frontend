'use client';

import { useState } from 'react';
import { Filter, X, Calendar } from 'lucide-react';

export interface FilterState {
  lifecycle_stage?: string[];
  account_id?: string;
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
            ? 'border-red-600 bg-red-900/50 text-white' 
            : 'border-red-800/30 bg-red-900/30 text-white hover:bg-red-900/50'
        }`}
      >
        <Filter className="h-4 w-4" />
        Filters
        {activeFilterCount > 0 && (
          <span className="rounded-full bg-white text-red-700 px-1.5 py-0.5 text-xs font-semibold">
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
          <div className="absolute top-full left-0 mt-2 w-80 rounded-2xl border border-red-800/50 bg-gradient-to-br from-red-900/95 to-rose-900/95 backdrop-blur-md shadow-2xl z-50 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white">Filters</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="text-red-200 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium mb-2 text-white">Search</label>
              <input
                type="text"
                value={localFilters.search || ''}
                onChange={(e) =>
                  setLocalFilters({ ...localFilters, search: e.target.value || undefined })
                }
                placeholder="Search by name, email..."
                className="w-full rounded-lg border border-red-800/50 bg-white/10 backdrop-blur-sm px-3 py-2 text-sm text-white placeholder-red-300/60 focus:outline-none focus:ring-2 focus:ring-red-500/50"
              />
            </div>

            {/* Lifecycle Stage Multi-select */}
            <div>
              <label className="block text-sm font-medium mb-2 text-white">Lifecycle Stage</label>
              <div className="space-y-2">
                {lifecycleStages.map((stage) => (
                  <label
                    key={stage}
                    className="flex items-center gap-2 cursor-pointer hover:bg-red-900/50 p-2 rounded transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={localFilters.lifecycle_stage?.includes(stage) || false}
                      onChange={() => toggleLifecycleStage(stage)}
                      className="rounded border-red-700/50 bg-white/10"
                    />
                    <span className="text-sm capitalize text-white">{stage}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Account Filter */}
            {filterOptions.accounts && filterOptions.accounts.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Account</label>
                <select
                  value={localFilters.account_id || ''}
                  onChange={(e) =>
                    setLocalFilters({
                      ...localFilters,
                      account_id: e.target.value || undefined,
                    })
                  }
                  className="w-full rounded-lg border border-red-800/50 bg-white/10 backdrop-blur-sm px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
                >
                  <option value="" className="bg-red-900">All Accounts</option>
                  {filterOptions.accounts.map((account) => (
                    <option key={account.id} value={account.id} className="bg-red-900">
                      {account.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium mb-2 text-white">Created Date</label>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-red-200/70 mb-1">From</label>
                  <input
                    type="date"
                    value={localFilters.date_from || ''}
                    onChange={(e) =>
                      setLocalFilters({
                        ...localFilters,
                        date_from: e.target.value || undefined,
                      })
                    }
                    className="w-full rounded-lg border border-red-800/50 bg-white/10 backdrop-blur-sm px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-red-200/70 mb-1">To</label>
                  <input
                    type="date"
                    value={localFilters.date_to || ''}
                    onChange={(e) =>
                      setLocalFilters({
                        ...localFilters,
                        date_to: e.target.value || undefined,
                      })
                    }
                    className="w-full rounded-lg border border-red-800/50 bg-white/10 backdrop-blur-sm px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  />
                </div>
              </div>
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="pt-2 border-t border-red-800/30">
                <div className="flex flex-wrap gap-2 mb-3">
                  {localFilters.lifecycle_stage?.map((stage) => (
                    <span
                      key={stage}
                      className="inline-flex items-center gap-1 rounded-full bg-red-800/50 px-2 py-1 text-xs text-white"
                    >
                      Stage: {stage}
                      <button
                        onClick={() => toggleLifecycleStage(stage)}
                        className="hover:text-red-300 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  {localFilters.account_id && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-800/50 px-2 py-1 text-xs text-white">
                      Account
                      <button
                        onClick={() =>
                          setLocalFilters({ ...localFilters, account_id: undefined })
                        }
                        className="hover:text-red-300 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {localFilters.date_from && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-800/50 px-2 py-1 text-xs text-white">
                      From: {localFilters.date_from}
                      <button
                        onClick={() =>
                          setLocalFilters({ ...localFilters, date_from: undefined })
                        }
                        className="hover:text-red-300 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {localFilters.date_to && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-800/50 px-2 py-1 text-xs text-white">
                      To: {localFilters.date_to}
                      <button
                        onClick={() =>
                          setLocalFilters({ ...localFilters, date_to: undefined })
                        }
                        className="hover:text-red-300 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2 border-t border-red-800/30">
              <button
                onClick={handleClear}
                className="flex-1 rounded-lg border border-red-800/50 bg-red-900/30 px-3 py-2 text-sm text-white hover:bg-red-900/50 transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={handleApply}
                className="flex-1 rounded-lg bg-white text-red-700 px-3 py-2 text-sm font-semibold hover:bg-red-50 transition-all"
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

