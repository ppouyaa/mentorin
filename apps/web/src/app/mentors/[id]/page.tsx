'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Star, 
  MapPin, 
  Clock, 
  DollarSign, 
  Users, 
  Calendar,
  ArrowLeft,
  MessageCircle,
  Video,
  Award,
  GraduationCap,
  Briefcase,
  Globe,
  Mail,
  Phone,
  ExternalLink,
  CheckCircle,
  X
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
    website?: string;
    socialLinks?: any;
  };
  mentorProfile: {
    headline: string;
    experienceYears: number;
    specializations: string[];
    rating: number;
    totalSessions: number;
    totalReviews: number;
    responseTimeHours: number;
    education?: any[];
    certifications?: any[];
    achievements?: any[];
    availability?: any;
  };
  skills: Array<{
    name: string;
    category: string;
    level: string;
  }>;
  offerings: Array<{
    id: string;
    title: string;
    description: string;
    type: string;
    durationMinutes: number;
    price: number;
    currency: string;
    tags: string[];
  }>;
  reviews: Array<{
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    rater: {
      id: string;
      displayName?: string;
      avatarUrl?: string;
    };
  }>;
}

export default function MentorDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const mentorId = params.id as string;
  
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOffering, setSelectedOffering] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/auth/login');
      return;
    }
    
    fetchMentor();
  }, [session, status, router, mentorId]);

  const fetchMentor = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/users/mentors/${mentorId}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.error) {
          setError(data.error);
        } else {
          setMentor(data);
        }
      } else {
        setError('Mentor not found');
      }
    } catch (error) {
      console.error('Error fetching mentor:', error);
      setError('Failed to load mentor profile');
    } finally {
      setLoading(false);
    }
  };

  const handleBookSession = (offeringId: string) => {
    setSelectedOffering(offeringId);
    setShowBookingModal(true);
  };

  const handleContact = () => {
    // TODO: Implement contact functionality
    alert('Contact functionality coming soon!');
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <Users className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Mentor Not Found</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link href="/mentors">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Mentors
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!mentor) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/mentors">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Mentors
              </Button>
            </Link>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleContact}>
                <MessageCircle className="mr-2 h-4 w-4" />
                Contact
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Header */}
            <Card>
              <div className="p-6">
                <div className="flex items-start space-x-6">
                  <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center">
                    {mentor.profile.avatarUrl ? (
                      <img
                        src={mentor.profile.avatarUrl}
                        alt={mentor.profile.displayName}
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-indigo-600 font-semibold text-3xl">
                        {mentor.profile.displayName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {mentor.profile.displayName}
                    </h1>
                    <p className="text-xl text-gray-600 mb-4">
                      {mentor.mentorProfile.headline}
                    </p>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {mentor.profile.city && mentor.profile.country
                            ? `${mentor.profile.city}, ${mentor.profile.country}`
                            : 'Remote'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>Responds within {mentor.mentorProfile.responseTimeHours}h</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{mentor.mentorProfile.totalSessions} sessions</span>
                      </div>
                    </div>
                  </div>
                                     <div className="text-right">
                     <div className="flex items-center space-x-1 mb-2">
                       <Star className="h-5 w-5 text-yellow-400 fill-current" />
                       <span className="text-lg font-semibold">
                         {mentor.mentorProfile.rating.toFixed(1)}
                       </span>
                       <span className="text-gray-500">
                         ({mentor.mentorProfile.totalReviews} reviews)
                       </span>
                     </div>
                   </div>
                </div>
              </div>
            </Card>

            {/* About */}
            {mentor.profile.bio && (
              <Card>
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
                  <p className="text-gray-600 leading-relaxed">{mentor.profile.bio}</p>
                </div>
              </Card>
            )}

            {/* Skills */}
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills & Expertise</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mentor.skills.map((skill) => (
                    <div key={skill.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">{skill.name}</div>
                        <div className="text-sm text-gray-500">{skill.category}</div>
                      </div>
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full capitalize">
                        {skill.level}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Education */}
            {mentor.mentorProfile.education && mentor.mentorProfile.education.length > 0 && (
              <Card>
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <GraduationCap className="mr-2 h-5 w-5" />
                    Education
                  </h2>
                  <div className="space-y-4">
                    {mentor.mentorProfile.education.map((edu: any, index: number) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <div className="font-medium text-gray-900">{edu.degree}</div>
                          <div className="text-gray-600">{edu.institution}</div>
                          <div className="text-sm text-gray-500">{edu.year}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {/* Certifications */}
            {mentor.mentorProfile.certifications && mentor.mentorProfile.certifications.length > 0 && (
              <Card>
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                    <Award className="mr-2 h-5 w-5" />
                    Certifications
                  </h2>
                  <div className="space-y-4">
                    {mentor.mentorProfile.certifications.map((cert: any, index: number) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <div className="font-medium text-gray-900">{cert.name}</div>
                          <div className="text-gray-600">{cert.issuer}</div>
                          <div className="text-sm text-gray-500">{cert.year}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {/* Reviews */}
            {mentor.reviews.length > 0 && (
              <Card>
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Reviews</h2>
                  <div className="space-y-4">
                    {mentor.reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                              {review.rater.avatarUrl ? (
                                <img
                                  src={review.rater.avatarUrl}
                                  alt={review.rater.displayName || 'Reviewer'}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-gray-600 text-sm font-medium">
                                  {review.rater.displayName?.charAt(0).toUpperCase() || 'R'}
                                </span>
                              )}
                            </div>
                            <span className="font-medium text-gray-900">
                              {review.rater.displayName || 'Anonymous'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm font-medium">{review.rating}</span>
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm">{review.comment}</p>
                        <div className="text-xs text-gray-500 mt-2">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Experience</span>
                    <span className="font-medium">{mentor.mentorProfile.experienceYears} years</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Sessions</span>
                    <span className="font-medium">{mentor.mentorProfile.totalSessions}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Rating</span>
                    <span className="font-medium">{mentor.mentorProfile.rating.toFixed(1)}/5</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Response Time</span>
                    <span className="font-medium">{mentor.mentorProfile.responseTimeHours}h</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Offerings */}
            {mentor.offerings.length > 0 && (
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Sessions</h3>
                  <div className="space-y-3">
                    {mentor.offerings.map((offering) => (
                      <div key={offering.id} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">{offering.title}</h4>
                        <p className="text-sm text-gray-600 mb-3">{offering.description}</p>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <Clock className="h-4 w-4" />
                            <span>{offering.durationMinutes} min</span>
                          </div>
                          <div className="text-lg font-bold text-green-600">
                            ${offering.price}
                          </div>
                        </div>
                        <Button 
                          onClick={() => handleBookSession(offering.id)}
                          className="w-full"
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          Book Session
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {/* Contact Info */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{mentor.email}</span>
                  </div>
                  {mentor.profile.website && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Globe className="h-4 w-4" />
                      <a 
                        href={mentor.profile.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 flex items-center"
                      >
                        Website
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {mentor.profile.city && mentor.profile.country
                        ? `${mentor.profile.city}, ${mentor.profile.country}`
                        : 'Remote'}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Book Session</h3>
              <button
                onClick={() => setShowBookingModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Booking functionality is coming soon! This will allow you to schedule sessions with {mentor.profile.displayName}.
            </p>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowBookingModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowBookingModal(false);
                  handleContact();
                }}
                className="flex-1"
              >
                Contact Instead
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
