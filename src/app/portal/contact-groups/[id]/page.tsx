'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Users, Trash2, Edit, Plus, X } from 'lucide-react';
import Link from 'next/link';
import apiClient from '@/lib/api/client';

interface ContactGroup {
  id: string;
  name: string;
  description: string | null;
  member_count: number;
  created_at: string;
}

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  mobile: string | null;
}

export default function ContactGroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [group, setGroup] = useState<ContactGroup | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [removingContactId, setRemovingContactId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [groupRes, contactsRes] = await Promise.all([
          apiClient.get(`/contact-groups/${params.id}`),
          apiClient.get(`/contact-groups/${params.id}/contacts`, { params: { page: 1, limit: 100 } }),
        ]);
        setGroup(groupRes.data.data);
        setContacts(contactsRes.data.data);
      } catch (error) {
        console.error('Failed to fetch contact group:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  const handleDelete = async () => {
    if (!group) return;
    
    setDeleting(true);
    try {
      await apiClient.delete(`/contact-groups/${group.id}`);
      router.push('/portal/contact-groups');
    } catch (error) {
      console.error('Failed to delete contact group:', error);
      alert('Failed to delete contact group. Please try again.');
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleRemoveContact = async (contactId: string) => {
    if (!group) return;
    
    setRemovingContactId(contactId);
    try {
      await apiClient.delete(`/contact-groups/${group.id}/contacts/${contactId}`);
      setContacts(contacts.filter(c => c.id !== contactId));
      setGroup({ ...group, member_count: group.member_count - 1 });
    } catch (error) {
      console.error('Failed to remove contact:', error);
      alert('Failed to remove contact. Please try again.');
    } finally {
      setRemovingContactId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-600">Loading contact group...</div>
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="rounded-lg border border-gray-200 bg-white p-2 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4 text-gray-900" />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
            {group.name}
          </h1>
          <p className="text-gray-600">Contact Group Details</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/portal/contact-groups/${group.id}/edit`}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50 transition-all"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Link>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-4 py-2 font-semibold text-red-700 hover:bg-red-100 transition-all"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Group Information</h2>
            <div className="space-y-4">
              {group.description && (
                <div>
                  <div className="text-sm text-gray-500 mb-1">Description</div>
                  <p className="text-gray-900">{group.description}</p>
                </div>
              )}
              <div>
                <div className="text-sm text-gray-500 mb-1">Member Count</div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-900 font-medium">
                    {group.member_count} {group.member_count === 1 ? 'contact' : 'contacts'}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Created</div>
                <span className="text-gray-900">
                  {new Date(group.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Contacts in Group</h2>
              <Link
                href={`/portal/contact-groups/${group.id}/add-contacts`}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#DC2626] via-[#991B1B] to-[#F43F5E] text-white px-4 py-2 font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl text-sm"
              >
                <Plus className="h-4 w-4" />
                Add Contacts
              </Link>
            </div>
            {contacts.length === 0 ? (
              <div className="py-8 text-center text-gray-600">
                <Users className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p className="mb-4">No contacts in this group yet</p>
                <Link
                  href={`/portal/contact-groups/${group.id}/add-contacts`}
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#DC2626] via-[#991B1B] to-[#F43F5E] text-white px-4 py-2 font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
                >
                  <Plus className="h-4 w-4" />
                  Add Contacts
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                  >
                    <Link
                      href={`/portal/contacts/${contact.id}`}
                      className="flex-1 hover:text-[#DC2626] transition-colors"
                    >
                      <div className="font-medium text-gray-900">
                        {contact.first_name} {contact.last_name}
                      </div>
                      {contact.email && (
                        <div className="text-sm text-gray-500">{contact.email}</div>
                      )}
                      {contact.mobile && (
                        <div className="text-sm text-gray-500">{contact.mobile}</div>
                      )}
                    </Link>
                    <button
                      onClick={() => handleRemoveContact(contact.id)}
                      disabled={removingContactId === contact.id}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Remove from group"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                href={`/portal/contact-groups/${group.id}/add-contacts`}
                className="flex items-center justify-center gap-2 w-full rounded-lg bg-gradient-to-r from-[#DC2626] via-[#991B1B] to-[#F43F5E] text-white px-4 py-2 font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
              >
                <Plus className="h-4 w-4" />
                Add Contacts
              </Link>
              <Link
                href={`/portal/campaigns/new?group=${group.id}`}
                className="flex items-center justify-center gap-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50 transition-all"
              >
                Create Campaign
              </Link>
            </div>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-2 text-gray-900">Delete Contact Group</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{group.name}"? This will remove all contact memberships from this group. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

