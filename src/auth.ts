import NextAuth, { NextAuthConfig } from 'next-auth';
import prisma from '@/lib/prisma';
import { PrismaAdapter } from '@auth/prisma-adapter';
import type { Adapter } from 'next-auth/adapters';
import Google from 'next-auth/providers/google';
import { type Provider } from 'next-auth/providers';

const providers: Provider[] = [Google];

export const providerMap = providers.map((provider) => {
    if (typeof provider === 'function') {
        const providerData = provider();
        return {
            id: providerData.id,
            name: providerData.name,
        };
    } else {
        return { id: provider.id, name: provider.name, icon: Google };
    }
});

export const authConfig: NextAuthConfig = {
    session: {
        strategy: 'database',
    },
    adapter: PrismaAdapter(prisma) as Adapter,
    pages: {
        signIn: '/sign-in',
    },
    providers,
};

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
});
