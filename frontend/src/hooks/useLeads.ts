import { useState, useEffect, useCallback } from 'react';
import { leadsApi } from '../api/leads';
import { Lead, LeadFilters, PaginationMeta } from '../types';
import toast from 'react-hot-toast';

export const useLeads = (filters: LeadFilters) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await leadsApi.getAll(filters);
      setLeads(data.data ?? []);
      setPagination(data.pagination ?? null);
    } catch {
      setError('Failed to load leads');
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => { fetch(); }, [fetch]);

  const deleteLead = async (id: string) => {
    try {
      await leadsApi.delete(id);
      toast.success('Lead deleted');
      fetch();
    } catch {
      toast.error('Failed to delete lead');
    }
  };

  return { leads, pagination, loading, error, refetch: fetch, deleteLead };
};

export const useLeadStats = () => {
  const [stats, setStats] = useState<{ total: number; byStatus: Record<string, number>; bySource: Record<string, number> } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    leadsApi.getStats()
      .then(({ data }) => setStats(data.data ?? null))
      .finally(() => setLoading(false));
  }, []);

  return { stats, loading };
};
