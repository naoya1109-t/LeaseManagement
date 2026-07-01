import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Password",
      credentials: {
        password: { label: "パスワード", type: "password" },
      },
      async authorize(credentials) {
        const password = credentials?.password as string;
        if (password === process.env.AUTH_PASSWORD) {
          return { id: "1", name: "管理者", email: "admin@example.com" };
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
});
