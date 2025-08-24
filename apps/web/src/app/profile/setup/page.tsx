'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Button } from '@mentorship/ui';
import { 
  User, 
  GraduationCap, 
  Briefcase, 
  MapPin, 
  Globe, 
  Calendar,
  Star,
  Award,
  BookOpen,
  Users,
  Clock,
  DollarSign
} from 'lucide-react';

// Base profile schema
const baseProfileSchema = z.object({
  displayName: z.string().min(2, 'Display name must be at least 2 characters'),
  bio: z.string().min(10, 'Bio must be at least 10 characters').max(500, 'Bio must be less than 500 characters'),
  location: z.string().min(2, 'Location is required'),
  timezone: z.string().min(1, 'Timezone is required'),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  linkedin: z.string().url().optional().or(z.literal('')),
  github: z.string().url().optional().or(z.literal('')),
});

// Mentor-specific schema
const mentorProfileSchema = baseProfileSchema.extend({
  expertise: z.array(z.string()).min(1, 'Please select at least one area of expertise'),
  experience: z.number().min(1, 'Years of experience must be at least 1').max(50, 'Years of experience must be less than 50'),
  education: z.string().min(1, 'Education background is required'),
  certifications: z.array(z.string()).optional(),

  availability: z.array(z.string()).min(1, 'Please select at least one availability option'),
  languages: z.array(z.string()).min(1, 'Please select at least one language'),
  mentoringStyle: z.enum(['structured', 'casual', 'hands-on', 'theoretical']),
  maxMentees: z.number().min(1, 'Maximum mentees must be at least 1').max(20, 'Maximum mentees must be less than 20'),
});

// Mentee-specific schema
const menteeProfileSchema = baseProfileSchema.extend({
  goals: z.array(z.string()).min(1, 'Please select at least one goal'),
  currentRole: z.string().min(1, 'Current role is required'),
  experience: z.number().min(0, 'Years of experience cannot be negative').max(50, 'Years of experience must be less than 50'),
  education: z.string().min(1, 'Education background is required'),
  skills: z.array(z.string()).min(1, 'Please select at least one skill you want to develop'),
  preferredMentoringStyle: z.enum(['structured', 'casual', 'hands-on', 'theoretical']),
  availability: z.array(z.string()).min(1, 'Please select at least one availability option'),
  budget: z.enum(['low', 'medium', 'high', 'flexible']),
  timeCommitment: z.enum(['1-2 hours/week', '3-5 hours/week', '5-10 hours/week', '10+ hours/week']),
});

type BaseProfileData = z.infer<typeof baseProfileSchema>;
type MentorProfileData = z.infer<typeof mentorProfileSchema>;
type MenteeProfileData = z.infer<typeof menteeProfileSchema>;

const expertiseOptions = [
  'Software Development', 'Data Science', 'Product Management', 'UX/UI Design',
  'Marketing', 'Sales', 'Finance', 'Operations', 'Leadership', 'Entrepreneurship',
  'Machine Learning', 'DevOps', 'Cybersecurity', 'Mobile Development', 'Web Development'
];

const goalOptions = [
  'Career Transition', 'Skill Development', 'Leadership Growth', 'Industry Knowledge',
  'Networking', 'Project Guidance', 'Interview Preparation', 'Business Strategy',
  'Technical Skills', 'Soft Skills', 'Personal Branding', 'Work-Life Balance'
];

const skillOptions = [
  'Programming', 'Data Analysis', 'Project Management', 'Communication',
  'Leadership', 'Problem Solving', 'Time Management', 'Public Speaking',
  'Technical Writing', 'Team Collaboration', 'Strategic Thinking', 'Innovation'
];

const availabilityOptions = [
  'Weekdays (9 AM - 5 PM)', 'Weekdays (6 PM - 9 PM)', 'Weekends (9 AM - 5 PM)',
  'Weekends (6 PM - 9 PM)', 'Flexible Schedule', 'By Appointment Only'
];

const languageOptions = [
  'English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Korean',
  'Arabic', 'Hindi', 'Portuguese', 'Russian', 'Italian'
];

export default function ProfileSetupPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState<'mentor' | 'mentee' | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/login');
      return;
    }

    // Get user role from session
    setUserRole(session.user?.role as 'mentor' | 'mentee');
  }, [session, status, router]);

  const MentorProfileForm = () => {
    const {
      register,
      handleSubmit,
      formState: { errors },
      watch,
      setValue,
    } = useForm<MentorProfileData>({
      resolver: zodResolver(mentorProfileSchema),
      defaultValues: {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        expertise: [],
        availability: [],
        languages: [],
        certifications: [],
        mentoringStyle: 'structured',
        maxMentees: 5,
      },
    });

    const onSubmit = async (data: MentorProfileData) => {
      setIsLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/users/profile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({ ...data, role: 'mentor' }),
        });

        if (response.ok) {
          toast.success('Mentor profile created successfully!');
          router.push('/dashboard');
        } else {
          const error = await response.json();
          toast.error(error.message || 'Failed to create profile');
        }
      } catch (error) {
        toast.error('Something went wrong. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Name *
              </label>
              <input
                {...register('displayName')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your display name"
              />
              {errors.displayName && (
                <p className="text-red-500 text-sm mt-1">{errors.displayName.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location *
              </label>
              <input
                {...register('location')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="City, Country"
              />
              {errors.location && (
                <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio *
              </label>
              <textarea
                {...register('bio')}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tell us about yourself, your experience, and what you can offer as a mentor..."
              />
              {errors.bio && (
                <p className="text-red-500 text-sm mt-1">{errors.bio.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Briefcase className="w-5 h-5 mr-2" />
            Professional Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Years of Experience *
              </label>
              <input
                {...register('experience', { valueAsNumber: true })}
                type="number"
                min="1"
                max="50"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.experience && (
                <p className="text-red-500 text-sm mt-1">{errors.experience.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Education Background *
              </label>
              <input
                {...register('education')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Bachelor's in Computer Science"
              />
              {errors.education && (
                <p className="text-red-500 text-sm mt-1">{errors.education.message}</p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Areas of Expertise *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {expertiseOptions.map((expertise) => (
                  <label key={expertise} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      value={expertise}
                      {...register('expertise')}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">{expertise}</span>
                  </label>
                ))}
              </div>
              {errors.expertise && (
                <p className="text-red-500 text-sm mt-1">{errors.expertise.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Mentoring Details */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Mentoring Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Mentees *
              </label>
              <input
                {...register('maxMentees', { valueAsNumber: true })}
                type="number"
                min="1"
                max="20"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="5"
              />
              {errors.maxMentees && (
                <p className="text-red-500 text-sm mt-1">{errors.maxMentees.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mentoring Style *
              </label>
              <select
                {...register('mentoringStyle')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="structured">Structured (Follow a curriculum)</option>
                <option value="casual">Casual (Informal discussions)</option>
                <option value="hands-on">Hands-on (Project-based learning)</option>
                <option value="theoretical">Theoretical (Concept-focused)</option>
              </select>
              {errors.mentoringStyle && (
                <p className="text-red-500 text-sm mt-1">{errors.mentoringStyle.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Languages *
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                {languageOptions.map((language) => (
                  <label key={language} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      value={language}
                      {...register('languages')}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">{language}</span>
                  </label>
                ))}
              </div>
              {errors.languages && (
                <p className="text-red-500 text-sm mt-1">{errors.languages.message}</p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Availability *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {availabilityOptions.map((option) => (
                  <label key={option} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      value={option}
                      {...register('availability')}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">{option}</span>
                  </label>
                ))}
              </div>
              {errors.availability && (
                <p className="text-red-500 text-sm mt-1">{errors.availability.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Globe className="w-5 h-5 mr-2" />
            Contact Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <input
                {...register('website')}
                type="url"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://yourwebsite.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                LinkedIn
              </label>
              <input
                {...register('linkedin')}
                type="url"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GitHub
              </label>
              <input
                {...register('github')}
                type="url"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://github.com/yourusername"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isLoading}
            className="px-8 py-3"
          >
            {isLoading ? 'Creating Profile...' : 'Create Mentor Profile'}
          </Button>
        </div>
      </form>
    );
  };

  const MenteeProfileForm = () => {
    const {
      register,
      handleSubmit,
      formState: { errors },
    } = useForm<MenteeProfileData>({
      resolver: zodResolver(menteeProfileSchema),
      defaultValues: {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        goals: [],
        skills: [],
        availability: [],
        preferredMentoringStyle: 'structured',
        budget: 'medium',
        timeCommitment: '3-5 hours/week',
      },
    });

    const onSubmit = async (data: MenteeProfileData) => {
      setIsLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/users/profile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({ ...data, role: 'mentee' }),
        });

        if (response.ok) {
          toast.success('Mentee profile created successfully!');
          router.push('/dashboard');
        } else {
          const error = await response.json();
          toast.error(error.message || 'Failed to create profile');
        }
      } catch (error) {
        toast.error('Something went wrong. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Name *
              </label>
              <input
                {...register('displayName')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your display name"
              />
              {errors.displayName && (
                <p className="text-red-500 text-sm mt-1">{errors.displayName.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location *
              </label>
              <input
                {...register('location')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="City, Country"
              />
              {errors.location && (
                <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio *
              </label>
              <textarea
                {...register('bio')}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tell us about yourself, your background, and what you hope to achieve through mentoring..."
              />
              {errors.bio && (
                <p className="text-red-500 text-sm mt-1">{errors.bio.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Briefcase className="w-5 h-5 mr-2" />
            Professional Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Role *
              </label>
              <input
                {...register('currentRole')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Junior Developer, Student, etc."
              />
              {errors.currentRole && (
                <p className="text-red-500 text-sm mt-1">{errors.currentRole.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Years of Experience
              </label>
              <input
                {...register('experience', { valueAsNumber: true })}
                type="number"
                min="0"
                max="50"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
              {errors.experience && (
                <p className="text-red-500 text-sm mt-1">{errors.experience.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Education Background *
              </label>
              <input
                {...register('education')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Bachelor's in Computer Science"
              />
              {errors.education && (
                <p className="text-red-500 text-sm mt-1">{errors.education.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Goals and Skills */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <BookOpen className="w-5 h-5 mr-2" />
            Goals and Skills
          </h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What are your main goals? *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {goalOptions.map((goal) => (
                  <label key={goal} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      value={goal}
                      {...register('goals')}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">{goal}</span>
                  </label>
                ))}
              </div>
              {errors.goals && (
                <p className="text-red-500 text-sm mt-1">{errors.goals.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skills you want to develop *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {skillOptions.map((skill) => (
                  <label key={skill} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      value={skill}
                      {...register('skills')}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">{skill}</span>
                  </label>
                ))}
              </div>
              {errors.skills && (
                <p className="text-red-500 text-sm mt-1">{errors.skills.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Mentoring Preferences */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Star className="w-5 h-5 mr-2" />
            Mentoring Preferences
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Mentoring Style *
              </label>
              <select
                {...register('preferredMentoringStyle')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="structured">Structured (Follow a curriculum)</option>
                <option value="casual">Casual (Informal discussions)</option>
                <option value="hands-on">Hands-on (Project-based learning)</option>
                <option value="theoretical">Theoretical (Concept-focused)</option>
              </select>
              {errors.preferredMentoringStyle && (
                <p className="text-red-500 text-sm mt-1">{errors.preferredMentoringStyle.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Budget Range *
              </label>
              <select
                {...register('budget')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low ($20-50/hour)</option>
                <option value="medium">Medium ($50-100/hour)</option>
                <option value="high">High ($100-200/hour)</option>
                <option value="flexible">Flexible (Any range)</option>
              </select>
              {errors.budget && (
                <p className="text-red-500 text-sm mt-1">{errors.budget.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Commitment *
              </label>
              <select
                {...register('timeCommitment')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1-2 hours/week">1-2 hours/week</option>
                <option value="3-5 hours/week">3-5 hours/week</option>
                <option value="5-10 hours/week">5-10 hours/week</option>
                <option value="10+ hours/week">10+ hours/week</option>
              </select>
              {errors.timeCommitment && (
                <p className="text-red-500 text-sm mt-1">{errors.timeCommitment.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Availability *
              </label>
              <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                {availabilityOptions.map((option) => (
                  <label key={option} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      value={option}
                      {...register('availability')}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">{option}</span>
                  </label>
                ))}
              </div>
              {errors.availability && (
                <p className="text-red-500 text-sm mt-1">{errors.availability.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Globe className="w-5 h-5 mr-2" />
            Contact Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <input
                {...register('website')}
                type="url"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://yourwebsite.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                LinkedIn
              </label>
              <input
                {...register('linkedin')}
                type="url"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GitHub
              </label>
              <input
                {...register('github')}
                type="url"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://github.com/yourusername"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isLoading}
            className="px-8 py-3"
          >
            {isLoading ? 'Creating Profile...' : 'Create Mentee Profile'}
          </Button>
        </div>
      </form>
    );
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Complete Your Profile
          </h1>
          <p className="text-lg text-gray-600">
            {userRole === 'mentor' 
              ? 'Set up your mentor profile to start helping others grow'
              : 'Set up your mentee profile to find the perfect mentor'
            }
          </p>
        </div>

        {userRole === 'mentor' ? <MentorProfileForm /> : <MenteeProfileForm />}
      </div>
    </div>
  );
}
