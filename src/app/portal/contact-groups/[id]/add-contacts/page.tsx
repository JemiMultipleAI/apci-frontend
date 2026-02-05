'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Search, Users, Check, X } from 'lucide-react';
import Link from 'next/link';
import apiClient from '@/lib/api/client';
import { Button, Card, Input } from '@/components/ui';

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
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Contact group not found</div>
      </div>
    );
  }

  const filteredContacts = getFilteredContacts();
  const allFilteredSelected = filteredContacts.length > 0 && selectedIds.size === filteredContacts.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 flex-wrap">
        <Link
          href={`/portal/contact-groups/${group.id}`}
          className="inline-flex items-center justify-center rounded-lg border border-border bg-transparent p-2 text-foreground hover:bg-surface-elevated transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Add Contacts to {group.name}
          </h1>
          <p className="text-muted-foreground">Select contacts to add to this group</p>
        </div>
        <Button
          onClick={handleAddContacts}
          disabled={adding || selectedIds.size === 0}
          variant="primary"
          className="gap-2"
        >
          {adding ? 'Adding...' : `Add ${selectedIds.size} Contact${selectedIds.size !== 1 ? 's' : ''}`}
        </Button>
      </div>

      <Card>
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
            <Input
              type="text"
              placeholder="Search contacts by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="secondary" onClick={toggleSelectAll} className="gap-2">
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
          </Button>
        </div>

        {filteredContacts.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-foreground">{searchTerm ? 'No contacts found matching your search' : 'No contacts available'}</p>
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
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:bg-surface-elevated'
                  }`}
                >
                  <div className={`flex items-center justify-center w-5 h-5 rounded border-2 shrink-0 ${
                    isSelected
                      ? 'bg-primary border-primary'
                      : 'border-border'
                  }`}>
                    {isSelected && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground">
                      {contact.first_name} {contact.last_name}
                    </div>
                    <div className="text-sm text-muted-foreground space-x-4">
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
      </Card>
    </div>
  );
}

