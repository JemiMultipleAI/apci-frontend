'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Search, Users, Check, X } from 'lucide-react';
import Link from 'next/link';
import apiClient from '@/lib/api/client';

interface ContactGroup {
  id: string;
  name: string;
  description: string | null;
}

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  mobile: string | null;
  lifecycle_stage: string;
}

export default function AddContactsToGroupPage() {
  const params = useParams();
  const router = useRouter();
  const [group, setGroup] = useState<ContactGroup | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [groupRes, contactsRes] = await Promise.all([
          apiClient.get(`/contact-groups/${params.id}`),
          apiClient.get('/contacts', { params: { page: 1, limit: 1000 } }),
        ]);
        setGroup(groupRes.data.data);
        setContacts(contactsRes.data.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    const filteredContacts = getFilteredContacts();
    if (selectedIds.size === filteredContacts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredContacts.map(c => c.id)));
    }
  };

  const getFilteredContacts = () => {
    if (!searchTerm.trim()) return contacts;
    const term = searchTerm.toLowerCase();
    return contacts.filter(
      c =>
        c.first_name?.toLowerCase().includes(term) ||
        c.last_name?.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term) ||
        c.mobile?.toLowerCase().includes(term)
    );
  };

  const handleAddContacts = async () => {
    if (selectedIds.size === 0) {
      alert('Please select at least one contact to add');
      return;
    }

    setAdding(true);
    try {
      await apiClient.post(`/contact-groups/${params.id}/contacts`, {
        contact_ids: Array.from(selectedIds),
      });
      router.push(`/portal/contact-groups/${params.id}`);
    } catch (error: any) {
      console.error('Failed to add contacts:', error);
      alert(error.response?.data?.error?.message || 'Failed to add contacts to group. Please try again.');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-600">Contact group not found</div>
      </div>
    );
  }

  const filteredContacts = getFilteredContacts();
  const allFilteredSelected = filteredContacts.length > 0 && selectedIds.size === filteredContacts.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/portal/contact-groups/${group.id}`}
          className="rounded-lg border border-gray-200 bg-white p-2 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4 text-gray-900" />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
            Add Contacts to {group.name}
          </h1>
          <p className="text-gray-600">Select contacts to add to this group</p>
        </div>
        <button
          onClick={handleAddContacts}
          disabled={adding || selectedIds.size === 0}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#DC2626] via-[#991B1B] to-[#F43F5E] text-white px-6 py-2 font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {adding ? 'Adding...' : `Add ${selectedIds.size} Contact${selectedIds.size !== 1 ? 's' : ''}`}
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search contacts by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#DC2626] focus:border-transparent"
            />
          </div>
          <button
            onClick={toggleSelectAll}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {allFilteredSelected ? (
              <>
                <X className="h-4 w-4" />
                Deselect All
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Select All
              </>
            )}
          </button>
        </div>

        {filteredContacts.length === 0 ? (
          <div className="py-12 text-center text-gray-600">
            <Users className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p>{searchTerm ? 'No contacts found matching your search' : 'No contacts available'}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredContacts.map((contact) => {
              const isSelected = selectedIds.has(contact.id);
              return (
                <div
                  key={contact.id}
                  onClick={() => toggleSelect(contact.id)}
                  className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#DC2626] bg-red-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className={`flex items-center justify-center w-5 h-5 rounded border-2 ${
                    isSelected
                      ? 'bg-[#DC2626] border-[#DC2626]'
                      : 'border-gray-300'
                  }`}>
                    {isSelected && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {contact.first_name} {contact.last_name}
                    </div>
                    <div className="text-sm text-gray-500 space-x-4">
                      {contact.email && <span>{contact.email}</span>}
                      {contact.mobile && <span>{contact.mobile}</span>}
                      <span className="capitalize">{contact.lifecycle_stage}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

