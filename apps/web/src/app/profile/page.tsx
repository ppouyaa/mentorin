'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  Clock, 
  Edit, 
  Save, 
  X,
  Star,
  Calendar,
  DollarSign,
  Award,
  BookOpen
} from 'lucide-react';

interface Profile {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  languages: string[];
  timezone: string;
  country?: string;
  city?: string;
  website?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
}

interface MentorProfile {
  userId: string;
  headline: string;
  hourlyRateCents: number;
  experienceYears: number;
  introVideoUrl?: string;
  isPublic: boolean;
  specializations: string[];
  education?: {
    degree: string;
    institution: string;
    year: number;
  }[];
  certifications?: {
    name: string;
    issuer: string;
    year: number;
  }[];
  achievements?: {
    title: string;
    description: string;
    year: number;
  }[];
  rating: number;
  totalSessions: number;
  totalReviews: number;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [mentorProfile, setMentorProfile] = useState<MentorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Profile>>({});

  useEffect(() => {
    if (session?.user) {
      fetchProfile();
    }
  }, [session]);

  const fetchProfile = async () => {
    try {
      const [profileRes, mentorRes] = await Promise.all([
        fetch('/api/users/profile', {
          headers: { 'Authorization': `Bearer ${session?.accessToken}` }
        }),
        session?.user?.role === 'mentor' ? 
          fetch('/api/users/mentor-profile', {
            headers: { 'Authorization': `Bearer ${session?.accessToken}` }
          }) : Promise.resolve(null)
      ]);

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData);
        setEditData(profileData);
      }

      if (mentorRes?.ok) {
        const mentorData = await mentorRes.json();
        setMentorProfile(mentorData);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`
        },
        body: JSON.stringify(editData)
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile(updatedProfile);
        setEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleCancel = () => {
    setEditData(profile || {});
    setEditing(false);
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
            <div className="lg:col-span-2">
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Profile not found
            </h3>
            <p className="text-gray-500">Unable to load your profile information.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Profile</h1>
        {!editing && (
          <Button onClick={() => setEditing(true)} className="flex items-center">
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <Avatar className="h-24 w-24 mx-auto mb-4">
                <AvatarImage src={profile.avatarUrl} />
                <AvatarFallback className="text-2xl">
                  {profile.displayName?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-semibold">{profile.displayName}</h2>
              <p className="text-gray-600">{session?.user?.email}</p>
              <Badge className="mt-2">
                {session?.user?.role === 'mentor' ? 'Mentor' : 'Mentee'}
              </Badge>
            </div>

            {mentorProfile && (
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Rating</span>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    <span className="font-medium">{mentorProfile.rating.toFixed(1)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Sessions</span>
                  <span className="font-medium">{mentorProfile.totalSessions}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Reviews</span>
                  <span className="font-medium">{mentorProfile.totalReviews}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Rate</span>
                  <span className="font-medium">{formatCurrency(mentorProfile.hourlyRateCents)}/hr</span>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {profile.languages.length > 0 && (
                <div className="flex items-center text-sm text-gray-600">
                  <Globe className="h-4 w-4 mr-2" />
                  <span>{profile.languages.join(', ')}</span>
                </div>
              )}
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-2" />
                <span>{profile.timezone}</span>
              </div>
              {profile.country && (
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{profile.city && `${profile.city}, `}{profile.country}</span>
                </div>
              )}
              {profile.website && (
                <div className="flex items-center text-sm text-gray-600">
                  <Globe className="h-4 w-4 mr-2" />
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" 
                     className="text-blue-600 hover:underline">
                    {profile.website}
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              {session?.user?.role === 'mentor' && (
                <TabsTrigger value="mentor">Mentor Details</TabsTrigger>
              )}
              <TabsTrigger value="social">Social Links</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Display Name
                    </label>
                    {editing ? (
                      <Input
                        value={editData.displayName || ''}
                        onChange={(e) => setEditData({...editData, displayName: e.target.value})}
                      />
                    ) : (
                      <p className="text-gray-900">{profile.displayName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    {editing ? (
                      <Textarea
                        value={editData.bio || ''}
                        onChange={(e) => setEditData({...editData, bio: e.target.value})}
                        rows={4}
                      />
                    ) : (
                      <p className="text-gray-900">{profile.bio || 'No bio added yet.'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Languages
                    </label>
                    {editing ? (
                      <Input
                        value={editData.languages?.join(', ') || ''}
                        onChange={(e) => setEditData({
                          ...editData, 
                          languages: e.target.value.split(',').map(l => l.trim()).filter(Boolean)
                        })}
                        placeholder="English, Spanish, French"
                      />
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {profile.languages.map((lang, index) => (
                          <Badge key={index} variant="secondary">{lang}</Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country
                      </label>
                      {editing ? (
                        <Input
                          value={editData.country || ''}
                          onChange={(e) => setEditData({...editData, country: e.target.value})}
                        />
                      ) : (
                        <p className="text-gray-900">{profile.country || 'Not specified'}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      {editing ? (
                        <Input
                          value={editData.city || ''}
                          onChange={(e) => setEditData({...editData, city: e.target.value})}
                        />
                      ) : (
                        <p className="text-gray-900">{profile.city || 'Not specified'}</p>
                      )}
                    </div>
                  </div>

                  {editing && (
                    <div className="flex space-x-2 pt-4">
                      <Button onClick={handleSave} className="flex items-center">
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={handleCancel} className="flex items-center">
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {session?.user?.role === 'mentor' && mentorProfile && (
              <TabsContent value="mentor" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Mentor Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Headline
                      </label>
                      <p className="text-gray-900">{mentorProfile.headline}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Experience (Years)
                        </label>
                        <p className="text-gray-900">{mentorProfile.experienceYears} years</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Hourly Rate
                        </label>
                        <p className="text-gray-900">{formatCurrency(mentorProfile.hourlyRateCents)}</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Specializations
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {mentorProfile.specializations.map((spec, index) => (
                          <Badge key={index} variant="secondary">{spec}</Badge>
                        ))}
                      </div>
                    </div>

                    {mentorProfile.education && mentorProfile.education.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Education
                        </label>
                        <div className="space-y-2">
                          {mentorProfile.education.map((edu, index) => (
                            <div key={index} className="flex items-center text-sm">
                              <Award className="h-4 w-4 mr-2 text-gray-400" />
                              <span>{edu.degree} from {edu.institution} ({edu.year})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {mentorProfile.certifications && mentorProfile.certifications.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Certifications
                        </label>
                        <div className="space-y-2">
                          {mentorProfile.certifications.map((cert, index) => (
                            <div key={index} className="flex items-center text-sm">
                              <BookOpen className="h-4 w-4 mr-2 text-gray-400" />
                              <span>{cert.name} by {cert.issuer} ({cert.year})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            <TabsContent value="social" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Social Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile.socialLinks ? (
                    <div className="space-y-3">
                      {profile.socialLinks.linkedin && (
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-700 w-20">LinkedIn:</span>
                          <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
                             className="text-blue-600 hover:underline">
                            {profile.socialLinks.linkedin}
                          </a>
                        </div>
                      )}
                      {profile.socialLinks.twitter && (
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-700 w-20">Twitter:</span>
                          <a href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                             className="text-blue-600 hover:underline">
                            {profile.socialLinks.twitter}
                          </a>
                        </div>
                      )}
                      {profile.socialLinks.github && (
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-700 w-20">GitHub:</span>
                          <a href={profile.socialLinks.github} target="_blank" rel="noopener noreferrer"
                             className="text-blue-600 hover:underline">
                            {profile.socialLinks.github}
                          </a>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500">No social links added yet.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
