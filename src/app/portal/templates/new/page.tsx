'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api/client';

export default function NewTemplatePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    type: 'email' as 'email' | 'sms',
    subject: '',
    body: '',
  });
  const [variables, setVariables] = useState<string[]>(['first_name', 'last_name', 'email']);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const payload = {
        name: formData.name,
        type: formData.type,
        subject: formData.type === 'email' ? (formData.subject || null) : null,
        body: formData.body,
        variables: variables.filter(v => v.trim() !== ''),
      };
      
      const response = await apiClient.post('/templates', payload);
      router.push('/portal/templates');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create template');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleVariableChange = (index: number, value: string) => {
    const updated = [...variables];
    updated[index] = value;
    setVariables(updated);
  };

  const addVariable = () => {
    setVariables([...variables, '']);
  };

  const removeVariable = (index: number) => {
    if (variables.length > 1) {
      setVariables(variables.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Create New Template</h1>
        <p className="text-gray-600">Create a new email or SMS template</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <label htmlFor="name" className="block text-sm font-medium mb-2 text-gray-900">
              Template Name *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DC2626]/50 focus:border-[#DC2626]"
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium mb-2 text-gray-900">
              Template Type *
            </label>
            <select
              id="type"
              name="type"
              required
              value={formData.type}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#DC2626]/50 focus:border-[#DC2626]"
            >
              <option value="email">Email</option>
              <option value="sms">SMS</option>
            </select>
          </div>

          {formData.type === 'email' && (
            <div>
              <label htmlFor="subject" className="block text-sm font-medium mb-2 text-gray-900">
                Email Subject
              </label>
              <input
                id="subject"
                name="subject"
                type="text"
                value={formData.subject}
                onChange={handleChange}
                placeholder="e.g., Welcome to our service!"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DC2626]/50 focus:border-[#DC2626]"
              />
            </div>
          )}
        </div>

        <div>
          <label htmlFor="body" className="block text-sm font-medium mb-2 text-gray-900">
            Template Body *
          </label>
          <textarea
            id="body"
            name="body"
            rows={formData.type === 'sms' ? 4 : 8}
            required
            value={formData.body}
            onChange={handleChange}
            placeholder={formData.type === 'email' 
              ? 'Hi {{first_name}},\n\nThank you for joining us!\n\nBest regards,\nThe Team'
              : 'Hi {{first_name}}, thank you for joining us!'
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DC2626]/50 focus:border-[#DC2626] font-mono text-sm"
          />
          <p className="mt-2 text-xs text-gray-600">
            Use {'{{variable_name}}'} to insert variables (e.g., {'{{first_name}}'}, {'{{email}}'})
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-900">Available Variables</label>
            <button
              type="button"
              onClick={addVariable}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              + Add Variable
            </button>
          </div>
          <div className="space-y-2">
            {variables.map((variable, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={variable}
                  onChange={(e) => handleVariableChange(index, e.target.value)}
                  placeholder="variable_name"
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#DC2626]/50 focus:border-[#DC2626]"
                />
                {variables.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariable(index)}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-600">
            Common variables: first_name, last_name, email, mobile, full_name
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-gradient-to-r from-[#DC2626] via-[#991B1B] to-[#F43F5E] text-white px-4 py-2 font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            {saving ? 'Creating...' : 'Create Template'}
          </button>
        </div>
      </form>
    </div>
  );
}

