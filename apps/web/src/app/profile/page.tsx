'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Button } from '@mentorship/ui';
import { 
  User, 
  Edit, 
  Save, 
  X, 
  MapPin, 
  Globe, 
  Briefcase,
  Star,
  Clock,
  DollarSign,
  Users,
  BookOpen,
  Award,
  Calendar
} from 'lucide-react';
import AppLayout from '@/components/layout/app-layout';

// Profile schema for editing
const profileSchema = z.object({
  displayName: z.string().min(2, 'Display name must be at least 2 characters'),
  bio: z.string().min(10, 'Bio must be at least 10 characters').max(500, 'Bio must be less than 500 characters'),
  location: z.string().min(2, 'Location is required'),
  website: z.string().url().optional().or(z.literal('')),
  linkedin: z.string().url().optional().or(z.literal('')),
  github: z.string().url().optional().or(z.literal('')),
  // Role-specific fields
  expertise: z.array(z.string()).optional(),
  experience: z.number().optional(),
  education: z.string().optional(),
  availability: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  goals: z.array(z.string()).optional(),
  currentRole: z.string().optional(),
  skills: z.array(z.string()).optional(),
  preferredMentoringStyle: z.string().optional(),
  budget: z.string().optional(),
  timeCommitment: z.string().optional(),
});

type ProfileData = z.infer<typeof profileSchema>;

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

interface UserProfile {
  id: string;
  displayName: string;
  bio: string;
  location: string;
  timezone: string;
  avatarUrl?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  role: 'mentor' | 'mentee';
  isPublic?: boolean;
  // Mentor-specific fields
  expertise?: string[];
  experience?: number;
  education?: string;
  availability?: string[];
  languages?: string[];
  mentoringStyle?: string;
  maxMentees?: number;
  // Mentee-specific fields
  goals?: string[];
  currentRole?: string;
  skills?: string[];
  preferredMentoringStyle?: string;
  budget?: string;
  timeCommitment?: string;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    if (session) {
      fetchProfile();
    }
  }, [session]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/users/profile`, {
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        reset({
          displayName: data.displayName,
          bio: data.bio,
          location: data.location,
          website: data.website || '',
          linkedin: data.linkedin || '',
          github: data.github || '',
                     // Role-specific fields
           expertise: data.expertise || [],
           experience: data.experience,
           education: data.education || '',
           availability: data.availability || [],
          languages: data.languages || [],
          goals: data.goals || [],
          currentRole: data.currentRole || '',
          skills: data.skills || [],
          preferredMentoringStyle: data.preferredMentoringStyle || '',
          budget: data.budget || '',
          timeCommitment: data.timeCommitment || '',
        });
      } else if (response.status === 404) {
        // Profile doesn't exist, redirect to setup
        window.location.href = '/profile/setup';
        return;
      } else {
        toast.error('Failed to load profile');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const onSubmit = async (data: ProfileData) => {
    setIsLoading(true);
    try {
      // Debug: Log the data being sent
      console.log('Submitting profile data:', data);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile(updatedProfile);
        setIsEditing(false);
        toast.success('Profile updated successfully!');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    reset({
      displayName: profile?.displayName || '',
      bio: profile?.bio || '',
      location: profile?.location || '',
      website: profile?.website || '',
      linkedin: profile?.linkedin || '',
      github: profile?.github || '',
      // Role-specific fields
      expertise: profile?.expertise || [],
      experience: profile?.experience,
      education: profile?.education || '',
      availability: profile?.availability || [],
      languages: profile?.languages || [],
      goals: profile?.goals || [],
      currentRole: profile?.currentRole || '',
      skills: profile?.skills || [],
      preferredMentoringStyle: profile?.preferredMentoringStyle || '',
      budget: profile?.budget || '',
      timeCommitment: profile?.timeCommitment || '',
    });
  };

  const handleMakePublic = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/users/profile/make-public`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
        },
      });

      if (response.ok) {
        toast.success('Profile made public successfully!');
        // Update the profile status to show as public
        setProfile(prev => prev ? { ...prev, isPublic: true } : null);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to make profile public');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    }
  };

  // Custom checkbox handlers for arrays
  const handleCheckboxChange = (field: keyof ProfileData, value: string, checked: boolean) => {
    const currentValues = watch(field) as string[] || [];
    let newValues: string[];
    
    if (checked) {
      newValues = [...currentValues, value];
    } else {
      newValues = currentValues.filter(v => v !== value);
    }
    
    setValue(field, newValues);
  };

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {!isEditing && (
              <div className="flex space-x-3">
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  className="flex items-center"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
                {profile.role === 'mentor' && (
                  <Button
                    onClick={handleMakePublic}
                    variant="outline"
                    className="flex items-center"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Make Public
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">
                    {profile.displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {profile.displayName}
                </h2>
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mb-4">
                  {profile.role === 'mentor' ? 'Mentor' : 'Mentee'}
                </div>
                <div className="flex items-center justify-center text-gray-600 mb-4">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="text-sm">{profile.location}</span>
                </div>
              </div>

                             {/* Quick Stats */}
               {profile.role === 'mentor' && (
                 <div className="space-y-3 mt-6">

                   <div className="flex justify-between items-center">
                     <span className="text-sm text-gray-600">Experience</span>
                     <span className="font-semibold">{profile.experience} years</span>
                   </div>
                   <div className="flex justify-between items-center">
                     <span className="text-sm text-gray-600">Max Mentees</span>
                     <span className="font-semibold">{profile.maxMentees}</span>
                   </div>
                   <div className="flex justify-between items-center">
                     <span className="text-sm text-gray-600">Profile Status</span>
                     <span className={`text-sm px-2 py-1 rounded-full ${
                       profile.isPublic 
                         ? 'bg-green-100 text-green-800' 
                         : 'bg-gray-100 text-gray-800'
                     }`}>
                       {profile.isPublic ? 'Public' : 'Private'}
                     </span>
                   </div>
                 </div>
               )}

              {profile.role === 'mentee' && (
                <div className="space-y-3 mt-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Current Role</span>
                    <span className="font-semibold">{profile.currentRole}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Experience</span>
                    <span className="font-semibold">{profile.experience} years</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Budget</span>
                    <span className="font-semibold capitalize">{profile.budget}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Basic Information
              </h3>
              
                             {isEditing ? (
                 <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                   {/* Basic Information */}
                   <div className="space-y-4">
                     <h4 className="text-sm font-medium text-gray-700">Basic Information</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">
                           Display Name *
                         </label>
                         <input
                           {...register('displayName')}
                           type="text"
                           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                         />
                         {errors.location && (
                           <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
                         )}
                       </div>
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">
                         Bio *
                       </label>
                       <textarea
                         {...register('bio')}
                         rows={4}
                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                       />
                       {errors.bio && (
                         <p className="text-red-500 text-sm mt-1">{errors.bio.message}</p>
                       )}
                     </div>
                   </div>

                   {/* Role-specific Information */}
                   {profile.role === 'mentor' && (
                     <div className="space-y-4">
                       <h4 className="text-sm font-medium text-gray-700">Professional Information</h4>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">
                             Years of Experience
                           </label>
                           <input
                             {...register('experience', { valueAsNumber: true })}
                             type="number"
                             min="1"
                             max="50"
                             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                           />
                         </div>
                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">
                             Education Background
                           </label>
                           <input
                             {...register('education')}
                             type="text"
                             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                           />
                         </div>

                       </div>
                                               <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Areas of Expertise
                          </label>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                         {expertiseOptions.map((expertise) => (
                               <label key={expertise} className="flex items-center space-x-2">
                                 <input
                                   type="checkbox"
                                   value={expertise}
                                   checked={watch('expertise')?.includes(expertise) || false}
                                   onChange={(e) => handleCheckboxChange('expertise', expertise, e.target.checked)}
                                   className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                 />
                                 <span className="text-sm">{expertise}</span>
                               </label>
                             ))}
                          </div>
                        </div>
                                               <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Languages
                          </label>
                          <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                                                         {languageOptions.map((language) => (
                               <label key={language} className="flex items-center space-x-2">
                                 <input
                                   type="checkbox"
                                   value={language}
                                   checked={watch('languages')?.includes(language) || false}
                                   onChange={(e) => handleCheckboxChange('languages', language, e.target.checked)}
                                   className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                 />
                                 <span className="text-sm">{language}</span>
                               </label>
                             ))}
                          </div>
                        </div>
                                               <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Availability
                          </label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {availabilityOptions.map((option) => (
                              <label key={option} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  value={option}
                                  checked={watch('availability')?.includes(option) || false}
                                  onChange={(e) => handleCheckboxChange('availability', option, e.target.checked)}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm">{option}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                     </div>
                   )}

                   {profile.role === 'mentee' && (
                     <div className="space-y-4">
                       <h4 className="text-sm font-medium text-gray-700">Professional Information</h4>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">
                             Current Role
                           </label>
                           <input
                             {...register('currentRole')}
                             type="text"
                             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                           />
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
                           />
                         </div>
                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">
                             Education Background
                           </label>
                           <input
                             {...register('education')}
                             type="text"
                             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                           />
                         </div>
                       </div>
                                               <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Goals
                          </label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {goalOptions.map((goal) => (
                              <label key={goal} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  value={goal}
                                  checked={watch('goals')?.includes(goal) || false}
                                  onChange={(e) => handleCheckboxChange('goals', goal, e.target.checked)}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm">{goal}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                                               <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Skills to Develop
                          </label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {skillOptions.map((skill) => (
                              <label key={skill} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  value={skill}
                                  checked={watch('skills')?.includes(skill) || false}
                                  onChange={(e) => handleCheckboxChange('skills', skill, e.target.checked)}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm">{skill}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">
                             Preferred Mentoring Style
                           </label>
                           <select
                             {...register('preferredMentoringStyle')}
                             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                           >
                             <option value="structured">Structured</option>
                             <option value="casual">Casual</option>
                             <option value="hands-on">Hands-on</option>
                             <option value="theoretical">Theoretical</option>
                           </select>
                         </div>
                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">
                             Budget Range
                           </label>
                           <select
                             {...register('budget')}
                             className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                           >
                             <option value="low">Low ($20-50/hour)</option>
                             <option value="medium">Medium ($50-100/hour)</option>
                             <option value="high">High ($100-200/hour)</option>
                             <option value="flexible">Flexible</option>
                           </select>
                         </div>
                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">
                             Time Commitment
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
                         </div>
                       </div>
                                               <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Availability
                          </label>
                          <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                            {availabilityOptions.map((option) => (
                              <label key={option} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  value={option}
                                  checked={watch('availability')?.includes(option) || false}
                                  onChange={(e) => handleCheckboxChange('availability', option, e.target.checked)}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm">{option}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                     </div>
                   )}

                   <div className="flex justify-end space-x-3">
                     <Button
                       type="button"
                       variant="outline"
                       onClick={handleCancelEdit}
                       disabled={isLoading}
                     >
                       <X className="w-4 h-4 mr-2" />
                       Cancel
                     </Button>
                     <Button
                       type="submit"
                       disabled={isLoading}
                     >
                       <Save className="w-4 h-4 mr-2" />
                       {isLoading ? 'Saving...' : 'Save Changes'}
                     </Button>
                   </div>
                 </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Display Name</h4>
                    <p className="text-gray-900">{profile.displayName}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Location</h4>
                    <p className="text-gray-900">{profile.location}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Bio</h4>
                    <p className="text-gray-900">{profile.bio}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Professional Information */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Briefcase className="w-5 h-5 mr-2" />
                Professional Information
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Education</h4>
                  <p className="text-gray-900">{profile.education}</p>
                </div>
                
                {profile.role === 'mentor' && (
                  <>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Areas of Expertise</h4>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {profile.expertise?.map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Mentoring Style</h4>
                      <p className="text-gray-900 capitalize">{profile.mentoringStyle}</p>
                    </div>
                  </>
                )}

                {profile.role === 'mentee' && (
                  <>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Goals</h4>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {profile.goals?.map((goal) => (
                          <span
                            key={goal}
                            className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                          >
                            {goal}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Skills to Develop</h4>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {profile.skills?.map((skill) => (
                          <span
                            key={skill}
                            className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Availability & Preferences */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Availability & Preferences
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Availability</h4>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {profile.availability?.map((time) => (
                      <span
                        key={time}
                        className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full"
                      >
                        {time}
                      </span>
                    ))}
                  </div>
                </div>

                {profile.role === 'mentor' && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Languages</h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {profile.languages?.map((language) => (
                        <span
                          key={language}
                          className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full"
                        >
                          {language}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {profile.role === 'mentee' && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Time Commitment</h4>
                    <p className="text-gray-900">{profile.timeCommitment}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                Contact Information
              </h3>
              
              {isEditing ? (
                <div className="space-y-4">
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
              ) : (
                <div className="space-y-3">
                  {profile.website && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Website</h4>
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {profile.website}
                      </a>
                    </div>
                  )}
                  {profile.linkedin && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">LinkedIn</h4>
                      <a
                        href={profile.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {profile.linkedin}
                      </a>
                    </div>
                  )}
                  {profile.github && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">GitHub</h4>
                      <a
                        href={profile.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {profile.github}
                      </a>
                    </div>
                  )}
                  {!profile.website && !profile.linkedin && !profile.github && (
                    <p className="text-gray-500 text-sm">No contact information added yet.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
