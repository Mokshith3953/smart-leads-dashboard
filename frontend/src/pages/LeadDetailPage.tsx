import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { leadsApi } from '../api/leads';
import { Lead } from '../types';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { LeadForm } from '../components/leads/LeadForm';
import { PageLoader } from '../components/ui/Spinner';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export const LeadDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchLead = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data } = await leadsApi.getById(id);
      setLead(data.data ?? null);
    } catch {
      toast.error('Lead not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLead(); }, [id]);

  const handleDelete = async () => {
    if (!lead || !window.confirm('Delete this lead?')) return;
    try {
      await leadsApi.delete(lead._id);
      toast.success('Lead deleted');
      navigate('/');
    } catch {
      toast.error('Failed to delete lead');
    }
  };

  if (loading) return <PageLoader />;
  if (!lead) return null;

  const canEdit = user?.role === 'admin' || lead.createdBy?._id === user?.id;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
      <div className="mb-6">
        <Link to="/" className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          ← Back to Leads
        </Link>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{lead.name}</h1>
            <p className="mt-1 text-gray-500 dark:text-gray-400">{lead.email}</p>
          </div>
          {canEdit && (
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => setModalOpen(true)}>Edit</Button>
              <Button variant="danger" size="sm" onClick={handleDelete}>Delete</Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Status</p>
            <div className="mt-2"><Badge type="status" value={lead.status} /></div>
          </div>
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Source</p>
            <div className="mt-2"><Badge type="source" value={lead.source} /></div>
          </div>
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Created By</p>
            <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{lead.createdBy?.name ?? 'Unknown'}</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Created At</p>
            <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{new Date(lead.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Edit Lead">
        <LeadForm lead={lead} onSuccess={() => { setModalOpen(false); fetchLead(); }} onCancel={() => setModalOpen(false)} />
      </Modal>
    </div>
  );
};
