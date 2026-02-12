'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Users, Trash2, Edit, Plus, X } from 'lucide-react';
import Link from 'next/link';
import apiClient from '@/lib/api/client';
import { Button, Card } from '@/components/ui';
import { useUser } from '@/hooks/useUser';
import { canUpdate, canDelete } from '@/utils/rolePermissions';

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
  const { role } = useUser();
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
        <div className="text-muted-foreground">Loading contact group...</div>
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()} className="p-2">
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            {group.name}
          </h1>
          <p className="text-muted-foreground">Contact Group Details</p>
        </div>
        {(canUpdate(role) || canDelete(role)) && (
          <div className="flex items-center gap-2">
            {canUpdate(role) && (
              <Link
                href={`/portal/contact-groups/${group.id}/edit`}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 font-semibold text-text-secondary hover:bg-surface-elevated transition-all"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Link>
            )}
            {canDelete(role) && (
              <Button
                variant="danger"
                className="gap-2"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h2 className="text-lg font-semibold mb-4 text-foreground">Group Information</h2>
            <div className="space-y-4">
              {group.description && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Description</div>
                  <p className="text-foreground">{group.description}</p>
                </div>
              )}
              <div>
                <div className="text-sm text-muted-foreground mb-1">Member Count</div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground shrink-0" />
                  <span className="text-foreground font-medium">
                    {group.member_count} {group.member_count === 1 ? 'contact' : 'contacts'}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Created</div>
                <span className="text-foreground">
                  {new Date(group.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Contacts in Group</h2>
              <Link
                href={`/portal/contact-groups/${group.id}/add-contacts`}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-tech text-white px-4 py-2 font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl btn-tech text-sm"
              >
                <Plus className="h-4 w-4" />
                Add Contacts
              </Link>
            </div>
            {contacts.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="mb-4 text-foreground">No contacts in this group yet</p>
                <Link
                  href={`/portal/contact-groups/${group.id}/add-contacts`}
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-tech text-white px-4 py-2 font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl btn-tech"
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
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-surface-elevated transition-colors"
                  >
                    <Link
                      href={`/portal/contacts/${contact.id}`}
                      className="flex-1 hover:text-primary transition-colors"
                    >
                      <div className="font-medium text-foreground">
                        {contact.first_name} {contact.last_name}
                      </div>
                      {contact.email && (
                        <div className="text-sm text-muted-foreground">{contact.email}</div>
                      )}
                      {contact.mobile && (
                        <div className="text-sm text-muted-foreground">{contact.mobile}</div>
                      )}
                    </Link>
                    <button
                      onClick={() => handleRemoveContact(contact.id)}
                      disabled={removingContactId === contact.id}
                      className="p-2 text-error hover:bg-error/20 rounded-lg transition-colors disabled:opacity-50"
                      title="Remove from group"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold mb-4 text-foreground">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                href={`/portal/contact-groups/${group.id}/add-contacts`}
                className="inline-flex items-center justify-center gap-2 w-full rounded-lg font-semibold bg-gradient-tech text-white hover:opacity-90 shadow-lg hover:shadow-xl btn-tech px-4 py-2 text-sm transition-all"
              >
                <Plus className="h-4 w-4" />
                Add Contacts
              </Link>
              <Link
                href={`/portal/campaigns/new?group=${group.id}`}
                className="inline-flex items-center justify-center gap-2 w-full rounded-lg border border-border bg-surface px-4 py-2 font-semibold text-text-secondary hover:bg-surface-elevated transition-all"
              >
                Create Campaign
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold mb-2 text-foreground">Delete Contact Group</h3>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete &quot;{group.name}&quot;? This will remove all contact memberships from this group. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)} disabled={deleting}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

