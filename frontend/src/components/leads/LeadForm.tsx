import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { leadsApi } from '../../api/leads';
import { Lead, LeadStatus, LeadSource } from '../../types';
import toast from 'react-hot-toast';

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

interface FormState {
  name: string;
  email: string;
  status: LeadStatus;
  source: LeadSource | '';
}

interface FormErrors {
  name?: string;
  email?: string;
  source?: string;
}

interface LeadFormProps {
  lead?: Lead;
  onSuccess: () => void;
  onCancel: () => void;
}

export const LeadForm = ({ lead, onSuccess, onCancel }: LeadFormProps) => {
  const [form, setForm] = useState<FormState>({
    name: lead?.name ?? '',
    email: lead?.email ?? '',
    status: lead?.status ?? 'New',
    source: lead?.source ?? '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email';
    if (!form.source) errs.source = 'Source is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = { ...form, source: form.source as LeadSource };
      if (lead) {
        await leadsApi.update(lead._id, payload);
        toast.success('Lead updated successfully');
      } else {
        await leadsApi.create(payload);
        toast.success('Lead created successfully');
      }
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input label="Full Name" value={form.name} onChange={set('name')} error={errors.name} placeholder="John Doe" />
      <Input label="Email Address" type="email" value={form.email} onChange={set('email')} error={errors.email} placeholder="john@example.com" />
      <Select label="Status" value={form.status} onChange={set('status')} options={STATUS_OPTIONS} />
      <Select label="Source" value={form.source} onChange={set('source')} options={SOURCE_OPTIONS} placeholder="Select source" error={errors.source} />
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={loading}>{lead ? 'Update Lead' : 'Create Lead'}</Button>
      </div>
    </form>
  );
};
