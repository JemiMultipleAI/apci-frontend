'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Phone, Building2, Calendar, Trash2, Edit } from 'lucide-react';
import Link from 'next/link';
import apiClient from '@/lib/api/client';
import { Button, Card, PageHeader } from '@/components/ui';

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  mobile: string | null;
  job_title: string | null;
  department: string | null;
  lifecycle_stage: string;
  notes: string | null;
  account_id: string | null;
  created_at: string;
}

interface Activity {
  id: string;
  type: string;
  subject: string | null;
  description: string | null;
  performed_by_name: string | null;
  created_at: string;
}

interface ContactGroup {
  id: string;
  name: string;
  description: string | null;
}

export default function ContactDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [contact, setContact] = useState<Contact | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [groups, setGroups] = useState<ContactGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
      const [contactRes, activitiesRes, groupsRes] = await Promise.all([
        apiClient.get(`/contacts/${params.id}`),
        apiClient.get(`/activities/timeline/contact/${params.id}`),
        apiClient.get(`/contact-groups/contacts/${params.id}/groups`),
      ]);
      setContact(contactRes.data.data);
      setActivities(activitiesRes.data.data);
      setGroups(groupsRes.data.data || []);
      } catch (error) {
        console.error('Failed to fetch contact:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  const handleDelete = async () => {
    if (!contact) return;
    
    setDeleting(true);
    try {
      await apiClient.delete(`/contacts/${contact.id}`);
      router.push('/portal/contacts');
    } catch (error) {
      console.error('Failed to delete contact:', error);
      alert('Failed to delete contact. Please try again.');
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading customer...</div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Customer not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()} className="p-2">
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </Button>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            {contact.first_name} {contact.last_name}
          </h1>
          <p className="text-muted-foreground">Customer Details</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h2 className="text-lg font-semibold mb-4 text-foreground">Customer Information</h2>
            <div className="space-y-4">
              {contact.email && (
                <div className="flex items-center gap-3 text-foreground">
                  <Mail className="h-5 w-5 text-muted-foreground shrink-0" />
                  <span>{contact.email}</span>
                </div>
              )}
              {contact.mobile && (
                <div className="flex items-center gap-3 text-foreground">
                  <Phone className="h-5 w-5 text-muted-foreground shrink-0" />
                  <span>{contact.mobile}</span>
                </div>
              )}
              {contact.job_title && (
                <div className="flex items-center gap-3 text-foreground">
                  <Building2 className="h-5 w-5 text-muted-foreground shrink-0" />
                  <span>{contact.job_title}</span>
                  {contact.department && <span className="text-muted-foreground">- {contact.department}</span>}
                </div>
              )}
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground shrink-0" />
                <span className="text-sm text-muted-foreground">
                  Created {new Date(contact.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </Card>

          {contact.notes && (
            <Card>
              <h2 className="text-lg font-semibold mb-4 text-foreground">Notes</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">{contact.notes}</p>
            </Card>
          )}

          <Card>
            <h2 className="text-lg font-semibold mb-4 text-foreground">Activity Timeline</h2>
            {activities.length === 0 ? (
              <p className="text-muted-foreground">No activities yet</p>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div key={activity.id} className="border-l-2 border-primary pl-4 pb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium capitalize text-foreground">{activity.type}</span>
                      {activity.subject && (
                        <span className="text-muted-foreground">- {activity.subject}</span>
                      )}
                    </div>
                    {activity.description && (
                      <p className="text-sm text-muted-foreground mb-2">{activity.description}</p>
                    )}
                    <div className="text-xs text-muted-foreground">
                      {activity.performed_by_name && <span>By {activity.performed_by_name} • </span>}
                      {new Date(activity.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold mb-4 text-foreground">Details</h2>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-muted-foreground">Lifecycle Stage</div>
                <div className="mt-1">
                  <span className="rounded-full bg-surface-elevated border border-border px-2 py-1 text-xs font-medium capitalize text-foreground">
                    {contact.lifecycle_stage}
                  </span>
                </div>
              </div>
              {contact.account_id && (
                <div>
                  <div className="text-sm text-muted-foreground">Company</div>
                  <Link
                    href={`/portal/accounts/${contact.account_id}`}
                    className="mt-1 text-sm font-medium text-primary hover:underline"
                  >
                    View Company
                  </Link>
                </div>
              )}
              <div>
                <div className="text-sm text-muted-foreground mb-2">Contact Groups</div>
                {groups.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No groups assigned</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {groups.map((group) => (
                      <Link
                        key={group.id}
                        href={`/portal/contact-groups/${group.id}`}
                        className="inline-flex items-center rounded-full bg-surface-elevated border border-border px-2 py-1 text-xs font-medium text-foreground hover:bg-surface transition-colors"
                      >
                        {group.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card className="space-y-3">
            <Link
              href={`/portal/contacts/${contact.id}/edit`}
              className="inline-flex items-center justify-center gap-2 w-full rounded-lg font-semibold bg-gradient-tech text-white hover:opacity-90 shadow-lg hover:shadow-xl btn-tech px-4 py-2 text-sm transition-all"
            >
              <Edit className="h-4 w-4" />
              Edit Customer
            </Link>
            <Button
              variant="danger"
              className="w-full gap-2"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="h-4 w-4" />
              Delete Customer
            </Button>
          </Card>

          {showDeleteConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <Card className="max-w-md w-full mx-4 shadow-xl">
                <h3 className="text-lg font-semibold mb-2 text-foreground">Delete Customer</h3>
                <p className="text-muted-foreground mb-6">
                  Are you sure you want to delete {contact?.first_name} {contact?.last_name}? This action cannot be undone.
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
      </div>
    </div>
  );
}

