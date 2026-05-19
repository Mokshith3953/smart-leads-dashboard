import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { LeadFilters, LeadStatus, LeadSource, SortOrder } from '../../types';

const STATUS_OPTIONS = [
  { value: 'New', label: 'New' },
  { value: 'Contacted', label: 'Contacted' },
  { value: 'Qualified', label: 'Qualified' },
  { value: 'Lost', label: 'Lost' },
];

const SOURCE_OPTIONS = [
  { value: 'Website', label: 'Website' },
  { value: 'Instagram', label: 'Instagram' },
  { value: 'Referral', label: 'Referral' },
];

const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest First' },
  { value: 'oldest', label: 'Oldest First' },
];

interface LeadFiltersBarProps {
  filters: LeadFilters;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onFilterChange: (filters: Partial<LeadFilters>) => void;
  onExport: () => void;
  exporting?: boolean;
}

export const LeadFiltersBar = ({ filters, searchValue, onSearchChange, onFilterChange, onExport, exporting }: LeadFiltersBarProps) => {
  const hasActiveFilters = filters.status || filters.source || filters.search;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Input
            placeholder="Search by name or email..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            leftIcon={
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
        </div>

        <Select
          value={filters.status ?? ''}
          onChange={(e) => onFilterChange({ status: (e.target.value as LeadStatus) || undefined })}
          options={STATUS_OPTIONS}
          placeholder="All Statuses"
          className="sm:w-40"
        />

        <Select
          value={filters.source ?? ''}
          onChange={(e) => onFilterChange({ source: (e.target.value as LeadSource) || undefined })}
          options={SOURCE_OPTIONS}
          placeholder="All Sources"
          className="sm:w-40"
        />

        <Select
          value={filters.sort ?? 'latest'}
          onChange={(e) => onFilterChange({ sort: e.target.value as SortOrder })}
          options={SORT_OPTIONS}
          className="sm:w-40"
        />

        <Button variant="ghost" size="sm" onClick={onExport} loading={exporting} className="whitespace-nowrap">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export CSV
        </Button>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">Active filters:</span>
          {filters.status && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900 dark:text-blue-300">
              {filters.status}
              <button onClick={() => onFilterChange({ status: undefined })} className="ml-1">×</button>
            </span>
          )}
          {filters.source && (
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-700 dark:bg-purple-900 dark:text-purple-300">
              {filters.source}
              <button onClick={() => onFilterChange({ source: undefined })} className="ml-1">×</button>
            </span>
          )}
          {filters.search && (
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-300">
              "{filters.search}"
              <button onClick={() => { onSearchChange(''); onFilterChange({ search: undefined }); }} className="ml-1">×</button>
            </span>
          )}
          <button
            onClick={() => { onSearchChange(''); onFilterChange({ status: undefined, source: undefined, search: undefined }); }}
            className="ml-auto text-xs text-red-500 hover:underline"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
};
