import React, { useState, useCallback } from 'react';
import { useLeads } from '../hooks/useLeads';
import { useDebounce } from '../hooks/useDebounce';
import { LeadFiltersBar } from '../components/leads/LeadFiltersBar';
import { LeadTable } from '../components/leads/LeadTable';
import { Pagination } from '../components/leads/Pagination';
import { Modal } from '../components/ui/Modal';
import { LeadForm } from '../components/leads/LeadForm';
import { Button } from '../components/ui/Button';
import { PageLoader } from '../components/ui/Spinner';
import { leadsApi } from '../api/leads';
import { Lead, LeadFilters } from '../types';
import toast from 'react-hot-toast';

export const LeadsPage = () => {
  const [filters, setFilters] = useState<LeadFilters>({ sort: 'latest', page: 1 });
  const [searchInput, setSearchInput] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | undefined>();
  const [exporting, setExporting] = useState(false);

  const debouncedSearch = useDebounce(searchInput, 400);

  const activeFilters: LeadFilters = { ...filters, search: debouncedSearch || undefined };
  const { leads, pagination, loading, error, refetch, deleteLead } = useLeads(activeFilters);

  const handleFilterChange = useCallback((partial: Partial<LeadFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial, page: 1 }));
  }, []);

  const handleEdit = (lead: Lead) => {
    setEditingLead(lead);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingLead(undefined);
  };

  const handleFormSuccess = () => {
    handleModalClose();
    refetch();
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const { data } = await leadsApi.exportCSV({ status: filters.status, source: filters.source, search: debouncedSearch || undefined });
      const url = URL.createObjectURL(new Blob([data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'leads.csv';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('CSV exported');
    } catch {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leads</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage and track your sales leads</p>
        </div>
        <Button onClick={() => { setEditingLead(undefined); setModalOpen(true); }}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Lead
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        <LeadFiltersBar
          filters={activeFilters}
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          onFilterChange={handleFilterChange}
          onExport={handleExport}
          exporting={exporting}
        />

        {loading ? (
          <PageLoader />
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
            <p className="font-medium">{error}</p>
            <Button variant="secondary" size="sm" onClick={refetch} className="mt-3">Retry</Button>
          </div>
        ) : (
          <LeadTable leads={leads} onEdit={handleEdit} onDelete={deleteLead} />
        )}

        {pagination && <Pagination pagination={pagination} onPageChange={(page) => setFilters((p) => ({ ...p, page }))} />}
      </div>

      <Modal open={modalOpen} onClose={handleModalClose} title={editingLead ? 'Edit Lead' : 'Add New Lead'}>
        <LeadForm lead={editingLead} onSuccess={handleFormSuccess} onCancel={handleModalClose} />
      </Modal>
    </div>
  );
};
