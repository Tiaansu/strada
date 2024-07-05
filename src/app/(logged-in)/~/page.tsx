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

    return (
        <main
            className={cn(
                'h-screen sm:ml-[240px] p-4',
                !!!boards.length ? 'flex items-center justify-center' : null
            )}
        >
            {!!!boards.length ? (
                <StartBoard />
            ) : (
                <ul>
                    {boards.map((board) => (
                        <li key={board.id}>
                            <Link
                                href={`${DEFAULT_LOGIN_REDIRECT}/board/${board.id}`}
                            >
                                {board.icon} {board.title}
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </main>
    );
}
