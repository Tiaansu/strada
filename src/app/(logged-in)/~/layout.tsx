import Sidebar from '@/components/sidebar';
import { DEFAULT_AUTH_REDIRECT } from '@/lib/constants';
import getSession from '@/lib/getSession';
import { redirect } from 'next/navigation';

interface LoggedInLayoutProps {
    readonly children: React.ReactNode;
}

export default async function LoggedInLayout({
    children,
}: LoggedInLayoutProps) {
    const session = await getSession();
    const user = session?.user;

    if (!user) {
        redirect(DEFAULT_AUTH_REDIRECT);
    }

    return (
        <>
            <Sidebar session={session} />
            {children}
        </>
    );
}
