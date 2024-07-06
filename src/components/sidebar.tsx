import { Session } from 'next-auth';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ExitIcon } from '@radix-ui/react-icons';
import { signOut } from '@/auth';
import { DEFAULT_AUTH_REDIRECT, DEFAULT_LOGIN_REDIRECT } from '@/lib/constants';
import BoardsList from '@/components/core/boards/boards-list';
import Link from 'next/link';

interface SidebarProps {
    session: Session;
}

export default function Sidebar({ session }: SidebarProps) {
    return (
        <aside className="fixed left-0 h-[100vh] w-[240px] px-5 py-6 border-r border-2 max-md:hidden">
            <div className="flex justify-between gap-3 mb-9">
                <Link href={DEFAULT_LOGIN_REDIRECT}>
                    <div className="flex justify-center items-center gap-2 truncate">
                        <Image
                            src={session.user?.image!}
                            alt={`${session.user?.name}'s profile`}
                            width={35}
                            height={35}
                            className="rounded-full"
                        />
                        <p className="truncate">{session.user?.name}</p>
                    </div>
                </Link>
                <form
                    action={async () => {
                        'use server';

                        await signOut({
                            redirect: true,
                            redirectTo: DEFAULT_AUTH_REDIRECT,
                        });
                    }}
                >
                    <Button
                        size="icon"
                        variant="destructive"
                        type="submit"
                        className="rounded-full"
                        title="Sign out"
                    >
                        <ExitIcon className="w-4 h-4" />
                    </Button>
                </form>
            </div>

            <BoardsList session={session} />
        </aside>
    );
}
