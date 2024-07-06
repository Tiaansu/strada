import { getBoard } from '@/actions/boards.actions';
import StartBoard from '@/components/core/boards/start-board';
import { DEFAULT_AUTH_REDIRECT, DEFAULT_LOGIN_REDIRECT } from '@/lib/constants';
import getSession from '@/lib/getSession';
import { cn } from '@/lib/utils';
import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export async function generateMetadata(): Promise<Metadata> {
    const session = await getSession();
    const user = session?.user;

    if (!user) {
        redirect(DEFAULT_AUTH_REDIRECT);
    }

    return {
        title: user.name,
    };
}

export default async function LoggedInPage() {
    const session = await getSession();
    const user = session?.user;

    if (!user) return;

    const boards = await getBoard(user.id!);

    if (boards.length) {
        redirect(`${DEFAULT_LOGIN_REDIRECT}/board/${boards[0].id}`);
    }

    return (
        <main className="h-screen md:ml-[240px] p-4 flex items-center justify-center">
            <StartBoard />
        </main>
    );
}
