'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@mentorship/ui';
import { Button } from '@mentorship/ui';
import { Input } from '@mentorship/ui';
import { Textarea } from '@mentorship/ui';
import { Badge } from '@mentorship/ui';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@mentorship/ui';
import AppLayout from '@/components/layout/app-layout';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Clock, 
  DollarSign, 
  Users, 
  Search, 
  Filter,
  Star,
  Calendar,
  MapPin
} from 'lucide-react';

interface Offering {
  id: string;
  title: string;
  description: string;
  type: 'one_on_one' | 'group' | 'cohort' | 'office_hours';
  durationMinutes: number;
  priceCents: number;
  currency: string;
  maxParticipants: number;
  isActive: boolean;
  tags: string[];
  requirements?: string;
  mentor: {
    id: string;
    profile: {
      displayName: string;
      avatarUrl?: string;
    };
    mentorProfile: {
      rating: number;
      totalReviews: number;
      specializations: string[];
    };
  };
  createdAt: string;
  updatedAt: string;
}

export default function OfferingsPage() {
  const { data: session } = useSession();
  const [offerings, setOfferings] = useState<Offering[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingOffering, setEditingOffering] = useState<Offering | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'one_on_one' as 'one_on_one' | 'group' | 'cohort' | 'office_hours',
    durationMinutes: 60,
    priceCents: 5000,
    currency: 'USD',
    maxParticipants: 1,
    tags: [] as string[],
    requirements: '',
    isActive: true
  });

  const isMentor = session?.user?.role === 'mentor';

  useEffect(() => {
    if (session?.user) {
      fetchOfferings();
    }
  }, [session]);

  const fetchOfferings = async () => {
    try {
      const url = isMentor ? '/api/offerings/my' : '/api/offerings';
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setOfferings(data);
      }
    } catch (error) {
      console.error('Error fetching offerings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOffering = async () => {
    try {
      const response = await fetch('/api/offerings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const newOffering = await response.json();
        setOfferings(prev => [...prev, newOffering]);
        setShowCreateDialog(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error creating offering:', error);
    }
  };

  const handleUpdateOffering = async () => {
    if (!editingOffering) return;

    try {
      const response = await fetch(`/api/offerings/${editingOffering.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const updatedOffering = await response.json();
        setOfferings(prev => prev.map(o => o.id === editingOffering.id ? updatedOffering : o));
        setEditingOffering(null);
        resetForm();
      }
    } catch (error) {
      console.error('Error updating offering:', error);
    }
  };

  const handleDeleteOffering = async (offeringId: string) => {
    if (!confirm('Are you sure you want to delete this offering?')) return;

    try {
      const response = await fetch(`/api/offerings/${offeringId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`
        }
      });

      if (response.ok) {
        setOfferings(prev => prev.filter(o => o.id !== offeringId));
      }
    } catch (error) {
      console.error('Error deleting offering:', error);
    }
  };

  const handleEditOffering = (offering: Offering) => {
    setEditingOffering(offering);
    setFormData({
      title: offering.title,
      description: offering.description,
      type: offering.type,
      durationMinutes: offering.durationMinutes,
      priceCents: offering.priceCents,
      currency: offering.currency,
      maxParticipants: offering.maxParticipants,
      tags: offering.tags,
      requirements: offering.requirements || '',
      isActive: offering.isActive
    });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'one_on_one',
      durationMinutes: 60,
      priceCents: 5000,
      currency: 'USD',
      maxParticipants: 1,
      tags: [],
      requirements: '',
      isActive: true
    });
  };

  const formatCurrency = (cents: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(cents / 100);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'one_on_one': return 'One-on-One';
      case 'group': return 'Group Session';
      case 'cohort': return 'Cohort Program';
      case 'office_hours': return 'Office Hours';
      default: return type;
    }
  };

  const filteredOfferings = offerings.filter(offering => {
    const matchesSearch = offering.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         offering.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         offering.mentor.profile.displayName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === 'all' || offering.type === filterType;
    
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

    return (
    <AppLayout>
      <div className="flex justify-between items-center mb-8">
        {isMentor && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                Create Offering
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Offering</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g., React Development Coaching"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={4}
                    placeholder="Describe what you'll cover in this session..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="one_on_one">One-on-One</option>
                      <option value="group">Group Session</option>
                      <option value="cohort">Cohort Program</option>
                      <option value="office_hours">Office Hours</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                    <Input
                      type="number"
                      value={formData.durationMinutes}
                      onChange={(e) => setFormData({...formData, durationMinutes: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price (cents)</label>
                    <Input
                      type="number"
                      value={formData.priceCents}
                      onChange={(e) => setFormData({...formData, priceCents: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Participants</label>
                    <Input
                      type="number"
                      value={formData.maxParticipants}
                      onChange={(e) => setFormData({...formData, maxParticipants: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma-separated)</label>
                  <Input
                    value={formData.tags.join(', ')}
                    onChange={(e) => setFormData({
                      ...formData, 
                      tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                    })}
                    placeholder="React, JavaScript, Frontend"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Requirements</label>
                  <Textarea
                    value={formData.requirements}
                    onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                    rows={2}
                    placeholder="Any prerequisites or requirements..."
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleCreateOffering} className="flex-1">
                    Create Offering
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search offerings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="all">All Types</option>
            <option value="one_on_one">One-on-One</option>
            <option value="group">Group</option>
            <option value="cohort">Cohort</option>
            <option value="office_hours">Office Hours</option>
          </select>
        </div>
      </div>

      {filteredOfferings.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No offerings found
            </h3>
            <p className="text-gray-500 mb-4">
              {isMentor 
                ? "You haven't created any offerings yet."
                : "No offerings match your search criteria."
              }
            </p>
            {isMentor && (
              <Button onClick={() => setShowCreateDialog(true)}>
                Create Your First Offering
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOfferings.map((offering) => (
            <Card key={offering.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{offering.title}</CardTitle>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <Star className="h-4 w-4 mr-1 text-yellow-400" />
                      <span>{offering.mentor.mentorProfile.rating.toFixed(1)}</span>
                      <span className="mx-1">•</span>
                      <span>{offering.mentor.mentorProfile.totalReviews} reviews</span>
                    </div>
                    <p className="text-sm text-gray-600">{offering.mentor.profile.displayName}</p>
                  </div>
                  {isMentor && (
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditOffering(offering)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteOffering(offering.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4 line-clamp-3">{offering.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="secondary">{getTypeLabel(offering.type)}</Badge>
                  {offering.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">{tag}</Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{offering.durationMinutes} min</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    <span>Max {offering.maxParticipants}</span>
                  </div>
                  <div className="flex items-center font-medium">
                    <DollarSign className="h-4 w-4 mr-1" />
                    <span>{formatCurrency(offering.priceCents, offering.currency)}</span>
                  </div>
                </div>

                {!isMentor && (
                  <Button className="w-full" onClick={() => window.location.href = `/mentors/${offering.mentor.id}`}>
                    Book Session
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      {editingOffering && (
        <Dialog open={!!editingOffering} onOpenChange={() => setEditingOffering(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Offering</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="one_on_one">One-on-One</option>
                    <option value="group">Group Session</option>
                    <option value="cohort">Cohort Program</option>
                    <option value="office_hours">Office Hours</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                  <Input
                    type="number"
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({...formData, durationMinutes: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price (cents)</label>
                  <Input
                    type="number"
                    value={formData.priceCents}
                    onChange={(e) => setFormData({...formData, priceCents: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Participants</label>
                  <Input
                    type="number"
                    value={formData.maxParticipants}
                    onChange={(e) => setFormData({...formData, maxParticipants: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma-separated)</label>
                <Input
                  value={formData.tags.join(', ')}
                  onChange={(e) => setFormData({
                    ...formData, 
                    tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                  })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Requirements</label>
                <Textarea
                  value={formData.requirements}
                  onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                  rows={2}
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleUpdateOffering} className="flex-1">
                  Update Offering
                </Button>
                <Button variant="outline" onClick={() => setEditingOffering(null)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AppLayout>
  );
}
