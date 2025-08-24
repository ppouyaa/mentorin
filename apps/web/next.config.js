/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'avatars.githubusercontent.com', 'lh3.googleusercontent.com'],
  },
  i18n: {
    locales: ['en', 'fa'],
    defaultLocale: 'en',
    localeDetection: false,
  },
};

module.exports = nextConfig;