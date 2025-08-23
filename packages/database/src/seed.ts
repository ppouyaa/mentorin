import { prisma } from './client';
import { hash } from 'bcryptjs';

async function main() {
  console.log('🌱 Seeding database...');

  // Create skills
  const skills = [
    { slug: 'javascript', nameEn: 'JavaScript', nameFa: 'جاوااسکریپت', category: 'Programming', level: 1 },
    { slug: 'typescript', nameEn: 'TypeScript', nameFa: 'تایپ‌اسکریپت', category: 'Programming', level: 1 },
    { slug: 'react', nameEn: 'React', nameFa: 'ری‌اکت', category: 'Frontend', level: 1 },
    { slug: 'nodejs', nameEn: 'Node.js', nameFa: 'نود جی‌اس', category: 'Backend', level: 1 },
    { slug: 'python', nameEn: 'Python', nameFa: 'پایتون', category: 'Programming', level: 1 },
    { slug: 'java', nameEn: 'Java', nameFa: 'جاوا', category: 'Programming', level: 1 },
    { slug: 'aws', nameEn: 'AWS', nameFa: 'ای‌دبلیو‌اس', category: 'Cloud', level: 1 },
    { slug: 'docker', nameEn: 'Docker', nameFa: 'داکر', category: 'DevOps', level: 1 },
    { slug: 'kubernetes', nameEn: 'Kubernetes', nameFa: 'کوبرنتیز', category: 'DevOps', level: 1 },
    { slug: 'machine-learning', nameEn: 'Machine Learning', nameFa: 'یادگیری ماشین', category: 'AI', level: 1 },
    { slug: 'data-science', nameEn: 'Data Science', nameFa: 'علم داده', category: 'AI', level: 1 },
    { slug: 'product-management', nameEn: 'Product Management', nameFa: 'مدیریت محصول', category: 'Business', level: 1 },
    { slug: 'ui-ux-design', nameEn: 'UI/UX Design', nameFa: 'طراحی رابط کاربری', category: 'Design', level: 1 },
    { slug: 'mobile-development', nameEn: 'Mobile Development', nameFa: 'توسعه موبایل', category: 'Programming', level: 1 },
    { slug: 'cybersecurity', nameEn: 'Cybersecurity', nameFa: 'امنیت سایبری', category: 'Security', level: 1 },
  ];

  for (const skill of skills) {
    await prisma.skill.upsert({
      where: { slug: skill.slug },
      update: {},
      create: skill,
    });
  }

  // Create admin user
  const adminPassword = await hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@mentorship.com' },
    update: {},
    create: {
      email: 'admin@mentorship.com',
      passwordHash: adminPassword,
      role: 'admin',
      status: 'active',
      emailVerified: true,
      profile: {
        create: {
          displayName: 'Admin User',
          timezone: 'UTC',
          languages: ['en'],
        },
      },
    },
  });

  // Create sample mentor
  const mentorPassword = await hash('mentor123', 12);
  const mentor = await prisma.user.upsert({
    where: { email: 'mentor@example.com' },
    update: {},
    create: {
      email: 'mentor@example.com',
      passwordHash: mentorPassword,
      role: 'mentor',
      status: 'active',
      emailVerified: true,
      profile: {
        create: {
          displayName: 'Sarah Johnson',
          bio: 'Senior Software Engineer with 8+ years of experience in full-stack development.',
          timezone: 'America/New_York',
          languages: ['en'],
          country: 'US',
          city: 'New York',
        },
      },
      mentorProfile: {
        create: {
          headline: 'Full-Stack Developer & Tech Mentor',
          hourlyRateCents: 15000, // $150/hour
          experienceYears: 8,
          isPublic: true,
          specializations: ['React', 'Node.js', 'TypeScript'],
          availability: {
            weekdays: [1, 2, 3, 4, 5], // Monday to Friday
            startTime: '09:00',
            endTime: '17:00',
            bufferMinutes: 15,
          },
          responseTimeHours: 4,
        },
      },
    },
  });

  // Create sample mentee
  const menteePassword = await hash('mentee123', 12);
  const mentee = await prisma.user.upsert({
    where: { email: 'mentee@example.com' },
    update: {},
    create: {
      email: 'mentee@example.com',
      passwordHash: menteePassword,
      role: 'mentee',
      status: 'active',
      emailVerified: true,
      profile: {
        create: {
          displayName: 'Ali Reza',
          bio: 'Junior developer looking to improve my React and TypeScript skills.',
          timezone: 'Asia/Tehran',
          languages: ['en', 'fa'],
          country: 'IR',
          city: 'Tehran',
        },
      },
      userPreferences: {
        create: {
          language: 'fa',
          timezone: 'Asia/Tehran',
          notifications: {
            email: true,
            push: true,
            sms: false,
          },
          privacy: {
            profileVisibility: 'mentors_only',
            showEmail: false,
            showPhone: false,
          },
        },
      },
    },
  });

  // Add skills to mentor
  const jsSkill = await prisma.skill.findUnique({ where: { slug: 'javascript' } });
  const reactSkill = await prisma.skill.findUnique({ where: { slug: 'react' } });
  const tsSkill = await prisma.skill.findUnique({ where: { slug: 'typescript' } });

  if (jsSkill && reactSkill && tsSkill) {
    await prisma.userSkill.createMany({
      data: [
        {
          userId: mentor.id,
          skillId: jsSkill.id,
          level: 5,
          yearsOfExperience: 8,
          isVerified: true,
        },
        {
          userId: mentor.id,
          skillId: reactSkill.id,
          level: 5,
          yearsOfExperience: 6,
          isVerified: true,
        },
        {
          userId: mentor.id,
          skillId: tsSkill.id,
          level: 4,
          yearsOfExperience: 4,
          isVerified: true,
        },
      ],
      skipDuplicates: true,
    });
  }

  // Create sample offering
  const offering = await prisma.offering.create({
    data: {
      mentorId: mentor.id,
      title: 'React & TypeScript Code Review',
      description: 'Get personalized feedback on your React and TypeScript code. I\'ll review your components, suggest improvements, and help you follow best practices.',
      type: 'one_on_one',
      durationMinutes: 60,
      priceCents: 15000, // $150
      currency: 'USD',
      isGroup: false,
      tags: ['react', 'typescript', 'code-review', 'frontend'],
      skills: [jsSkill?.id, reactSkill?.id, tsSkill?.id].filter(Boolean) as number[],
      isActive: true,
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log('📧 Admin: admin@mentorship.com / admin123');
  console.log('📧 Mentor: mentor@example.com / mentor123');
  console.log('📧 Mentee: mentee@example.com / mentee123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });