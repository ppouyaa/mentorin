'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import AppLayout from '@/components/layout/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@mentorship/ui';
import { Button } from '@mentorship/ui';
import { Badge } from '@mentorship/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@mentorship/ui';
import { 
  Star, 
  MessageSquare, 
  Calendar, 
  User, 
  ThumbsUp,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';

interface Review {
  id: string;
  rating: number;
  comment: string;
  rater: {
    id: string;
    profile: {
      displayName: string;
      avatarUrl?: string;
    };
  };
  ratee: {
    id: string;
    profile: {
      displayName: string;
      avatarUrl?: string;
    };
  };
  bookingId?: string;
  offeringTitle?: string;
  createdAt: string;
  updatedAt: string;
}

export default function ReviewsPage() {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'given' | 'received'>('all');

  useEffect(() => {
    if (session?.user) {
      fetchReviews();
    }
  }, [session]);

  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/reviews', {
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getAverageRating = (reviews: Review[]) => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  const getRatingDistribution = (reviews: Review[]) => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++;
    });
    return distribution;
  };

  const filteredReviews = reviews.filter(review => {
    const isGiven = review.rater.id === session?.user?.id;
    const isReceived = review.ratee.id === session?.user?.id;
    
    switch (filter) {
      case 'given':
        return isGiven;
      case 'received':
        return isReceived;
      default:
        return true;
    }
  });

  const givenReviews = reviews.filter(review => review.rater.id === session?.user?.id);
  const receivedReviews = reviews.filter(review => review.ratee.id === session?.user?.id);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Reviews</h1>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="given">Given Reviews</TabsTrigger>
          <TabsTrigger value="received">Received Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Average Rating</p>
                    <p className="text-2xl font-bold">{getAverageRating(receivedReviews)}</p>
                  </div>
                  <div className="flex">
                    {renderStars(parseFloat(getAverageRating(receivedReviews).toString()))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                    <p className="text-2xl font-bold">{receivedReviews.length}</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Reviews Given</p>
                    <p className="text-2xl font-bold">{givenReviews.length}</p>
                  </div>
                  <ThumbsUp className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Rating Distribution */}
          {receivedReviews.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Rating Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = getRatingDistribution(receivedReviews)[rating as keyof ReturnType<typeof getRatingDistribution>];
                    const percentage = receivedReviews.length > 0 ? (count / receivedReviews.length) * 100 : 0;
                    
                    return (
                      <div key={rating} className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1 w-16">
                          <span className="text-sm font-medium">{rating}</span>
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        </div>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-400 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-12">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Reviews */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredReviews.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No reviews yet
                  </h3>
                  <p className="text-gray-500">
                    {session?.user?.role === 'mentor' 
                      ? "You haven't received any reviews yet."
                      : "You haven't given any reviews yet."
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredReviews.slice(0, 5).map((review) => (
                    <div key={review.id} className="border-b pb-4 last:border-b-0">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="flex">
                            {renderStars(review.rating)}
                          </div>
                          <span className="text-sm text-gray-600">
                            by {review.rater.profile.displayName}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDate(review.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-2">{review.comment}</p>
                      {review.offeringTitle && (
                        <p className="text-sm text-gray-600">
                          Session: {review.offeringTitle}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="given" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Reviews You've Given</h2>
            <Button className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Write Review
            </Button>
          </div>

          {givenReviews.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No reviews given
                </h3>
                <p className="text-gray-500 mb-4">
                  You haven't written any reviews yet. Share your experience with mentors!
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Write Your First Review
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {givenReviews.map((review) => (
                <Card key={review.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="flex">
                            {renderStars(review.rating)}
                          </div>
                          <span className="text-sm text-gray-600">
                            for {review.ratee.profile.displayName}
                          </span>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                        {review.offeringTitle && (
                          <p className="text-sm text-gray-600 mt-2">
                            Session: {review.offeringTitle}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>Posted {formatDate(review.createdAt)}</span>
                      {review.updatedAt !== review.createdAt && (
                        <span>Updated {formatDate(review.updatedAt)}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="received" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Reviews You've Received</h2>
          </div>

          {receivedReviews.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No reviews received
                </h3>
                <p className="text-gray-500">
                  {session?.user?.role === 'mentor' 
                    ? "You haven't received any reviews from mentees yet."
                    : "You haven't received any reviews from mentors yet."
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {receivedReviews.map((review) => (
                <Card key={review.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="flex">
                            {renderStars(review.rating)}
                          </div>
                          <span className="text-sm text-gray-600">
                            from {review.rater.profile.displayName}
                          </span>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                        {review.offeringTitle && (
                          <p className="text-sm text-gray-600 mt-2">
                            Session: {review.offeringTitle}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>Posted {formatDate(review.createdAt)}</span>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          Reply
                        </Button>
                        <Button size="sm" variant="outline">
                          Report
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      </div>
    </AppLayout>
  );
}
