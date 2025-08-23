import Link from 'next/link';
import { Button } from '@mentorship/ui';
import { 
  Users, 
  Calendar, 
  MessageCircle, 
  Video, 
  Star, 
  Globe,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-mentor-50 via-white to-mentee-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="gradient-text">Connect. Learn. Grow.</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Join our global mentorship platform where knowledge meets opportunity. 
              Connect with experienced mentors or share your expertise with eager learners.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="text-lg px-8 py-3">
                  Find a Mentor
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                  Become a Mentor
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose Our Platform?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need for meaningful mentorship relationships
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-mentor-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-mentor-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Matching</h3>
              <p className="text-gray-600">
                Our AI-powered algorithm connects you with the perfect mentor or mentee based on skills, goals, and availability.
              </p>
            </div>

            <div className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-mentee-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video className="h-8 w-8 text-mentee-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Video Calls</h3>
              <p className="text-gray-600">
                High-quality video calls with screen sharing and collaborative whiteboards for effective learning sessions.
              </p>
            </div>

            <div className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Flexible Scheduling</h3>
              <p className="text-gray-600">
                Easy calendar integration with Google and Microsoft, plus smart availability management.
              </p>
            </div>

            <div className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Chat</h3>
              <p className="text-gray-600">
                Stay connected with in-app messaging, voice notes, and file sharing between sessions.
              </p>
            </div>

            <div className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Verified Mentors</h3>
              <p className="text-gray-600">
                All mentors are verified with proven expertise and positive reviews from the community.
              </p>
            </div>

            <div className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Global Community</h3>
              <p className="text-gray-600">
                Connect with mentors and mentees from around the world, supporting multiple languages including Farsi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-mentor-600 mb-2">10,000+</div>
              <div className="text-gray-600">Active Mentors</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-mentee-600 mb-2">50,000+</div>
              <div className="text-gray-600">Happy Mentees</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">100,000+</div>
              <div className="text-gray-600">Sessions Completed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">4.9/5</div>
              <div className="text-gray-600">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-mentor-500 to-mentee-500">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of learners and experts who are already growing together on our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
              Get Started Free
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-mentor-500">
              Learn More
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}