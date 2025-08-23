'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Search, 
  Filter, 
  Star, 
  MapPin, 
  Clock, 
  DollarSign, 
  Users, 
  Calendar,
  ArrowRight,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button, Card } from '@mentorship/ui';

interface Mentor {
  id: string;
  email: string;
  profile: {
    displayName: string;
    avatarUrl?: string;
    bio?: string;
    languages: string[];
    country?: string;
    city?: string;
  };
  mentorProfile: {
    headline: string;
    hourlyRate: number;
    experienceYears: number;
    specializations: string[];
    rating: number;
    totalSessions: number;
    totalReviews: number;
    responseTimeHours: number;
  };
  skills: Array<{
    name: string;
    category: string;
    level: string;
  }>;
}

interface Skill {
  id: string;
  name: string;
  category: string;
  description?: string;
}

export default function MentorsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [maxRate, setMaxRate] = useState<number | ''>('');
  const [experienceYears, setExperienceYears] = useState<number | ''>('');
  const [showFilters, setShowFilters] = useState(false);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/login');
      return;
    }
    
    fetchSkills();
    fetchMentors();
  }, [session, status, router]);

  const fetchSkills = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/users/skills`);
      if (response.ok) {
        const data = await response.json();
        setSkills(data);
      }
    } catch (error) {
      console.error('Error fetching skills:', error);
    }
  };

  const fetchMentors = async (isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedSkills.length > 0) params.append('skills', selectedSkills.join(','));
      if (maxRate) params.append('maxRate', maxRate.toString());
      if (experienceYears) params.append('experienceYears', experienceYears.toString());
      if (isLoadMore) {
        params.append('offset', offset.toString());
      }
      params.append('limit', '12');

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/users/mentors?${params}`
      );

      if (response.ok) {
        const data = await response.json();
        if (isLoadMore) {
          setMentors(prev => [...prev, ...data.mentors]);
          setOffset(prev => prev + 12);
        } else {
          setMentors(data.mentors);
          setOffset(12);
        }
        setTotal(data.total);
        setHasMore(data.hasMore);
      }
    } catch (error) {
      console.error('Error fetching mentors:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleSearch = () => {
    setOffset(0);
    fetchMentors();
  };

  const handleSkillToggle = (skillName: string) => {
    setSelectedSkills(prev => 
      prev.includes(skillName) 
        ? prev.filter(s => s !== skillName)
        : [...prev, skillName]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSkills([]);
    setMaxRate('');
    setExperienceYears('');
    setOffset(0);
    fetchMentors();
  };

  const loadMore = () => {
    if (hasMore && !loadingMore) {
      fetchMentors(true);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Find Mentors</h1>
              <p className="text-gray-600 mt-1">Connect with experienced professionals</p>
            </div>
            <Link href="/dashboard">
              <Button variant="outline">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search mentors by name, skills, or expertise..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>

            <Button onClick={handleSearch} className="px-8">
              Search
            </Button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Skills Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skills
                  </label>
                  <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2">
                    {skills.map((skill) => (
                      <label key={skill.id} className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          checked={selectedSkills.includes(skill.name)}
                          onChange={() => handleSkillToggle(skill.name)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>{skill.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Max Rate Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Hourly Rate ($)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 100"
                    value={maxRate}
                    onChange={(e) => setMaxRate(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                {/* Experience Years Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Experience (years)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 5"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              {total} mentor{total !== 1 ? 's' : ''} found
            </p>
            {selectedSkills.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Active filters:</span>
                {selectedSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full"
                  >
                    {skill}
                    <button
                      onClick={() => handleSkillToggle(skill)}
                      className="hover:text-indigo-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mentor Grid */}
        {mentors.length === 0 && !loading ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Users className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No mentors found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.map((mentor) => (
              <Card key={mentor.id} className="hover:shadow-lg transition-shadow">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                        {mentor.profile.avatarUrl ? (
                          <img
                            src={mentor.profile.avatarUrl}
                            alt={mentor.profile.displayName}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-indigo-600 font-semibold text-lg">
                            {mentor.profile.displayName.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {mentor.profile.displayName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {mentor.mentorProfile.headline}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Rating and Stats */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">
                        {mentor.mentorProfile.rating.toFixed(1)}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({mentor.mentorProfile.totalReviews} reviews)
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Users className="h-4 w-4" />
                      <span>{mentor.mentorProfile.totalSessions} sessions</span>
                    </div>
                  </div>

                  {/* Bio */}
                  {mentor.profile.bio && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {mentor.profile.bio}
                    </p>
                  )}

                  {/* Skills */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {mentor.skills.slice(0, 3).map((skill) => (
                        <span
                          key={skill.name}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          {skill.name}
                        </span>
                      ))}
                      {mentor.skills.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          +{mentor.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Location and Rate */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {mentor.profile.city && mentor.profile.country
                          ? `${mentor.profile.city}, ${mentor.profile.country}`
                          : 'Remote'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm font-medium text-green-600">
                      <DollarSign className="h-4 w-4" />
                      <span>${mentor.mentorProfile.hourlyRate}/hr</span>
                    </div>
                  </div>

                  {/* Response Time */}
                  <div className="flex items-center space-x-1 text-sm text-gray-500 mb-4">
                    <Clock className="h-4 w-4" />
                    <span>Responds within {mentor.mentorProfile.responseTimeHours}h</span>
                  </div>

                  {/* Action Button */}
                  <Link href={`/mentors/${mentor.id}`}>
                    <Button className="w-full">
                      View Profile
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Load More */}
        {hasMore && (
          <div className="text-center mt-8">
            <Button
              variant="outline"
              onClick={loadMore}
              disabled={loadingMore}
              className="px-8"
            >
              {loadingMore ? 'Loading...' : 'Load More Mentors'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
