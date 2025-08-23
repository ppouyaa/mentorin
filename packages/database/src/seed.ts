import { prisma } from './client';
import { hash } from 'bcryptjs';

async function main() {
  console.log('🌱 Seeding database...');

  // Create skills
  const skills = [

    { name: 'JavaScript', category: 'Programming', description: 'Modern JavaScript programming' },
    { name: 'TypeScript', category: 'Programming', description: 'TypeScript development' },
    { name: 'React', category: 'Frontend', description: 'React.js framework' },
    { name: 'Node.js', category: 'Backend', description: 'Node.js runtime' },
    { name: 'Python', category: 'Programming', description: 'Python programming' },
    { name: 'Java', category: 'Programming', description: 'Java development' },
    { name: 'AWS', category: 'Cloud', description: 'Amazon Web Services' },
    { name: 'Docker', category: 'DevOps', description: 'Containerization' },
    { name: 'Kubernetes', category: 'DevOps', description: 'Container orchestration' },
    { name: 'Machine Learning', category: 'AI', description: 'Machine learning algorithms' },
    { name: 'Data Science', category: 'AI', description: 'Data analysis and science' },
    { name: 'Product Management', category: 'Business', description: 'Product strategy and management' },
    { name: 'UI/UX Design', category: 'Design', description: 'User interface and experience design' },
    { name: 'Mobile Development', category: 'Programming', description: 'Mobile app development' },
    { name: 'Cybersecurity', category: 'Security', description: 'Information security' },
  ];

  for (const skill of skills) {
    await prisma.skill.upsert({
      where: { name: skill.name },
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
  const jsSkill = await prisma.skill.findUnique({ where: { name: 'JavaScript' } });
  const reactSkill = await prisma.skill.findUnique({ where: { name: 'React' } });
  const tsSkill = await prisma.skill.findUnique({ where: { name: 'TypeScript' } });

  if (jsSkill && reactSkill && tsSkill) {
    await prisma.userSkill.createMany({
      data: [
        {
          userId: mentor.id,
          skillId: jsSkill.id,
          level: 'expert',
          verified: true,
        },
        {
          userId: mentor.id,
          skillId: reactSkill.id,
          level: 'expert',
          verified: true,
        },
        {
          userId: mentor.id,
          skillId: tsSkill.id,
          level: 'advanced',
          verified: true,
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
      tags: ['react', 'typescript', 'code-review', 'frontend'],
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