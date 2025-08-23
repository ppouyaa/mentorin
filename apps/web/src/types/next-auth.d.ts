import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    role: string;
    accessToken: string;
  }

  interface Session {
    user: {
      id: string;
      name?: string;
      email?: string;
      image?: string;
      role: string;
    };
    accessToken: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string;
    accessToken: string;
  }
}
