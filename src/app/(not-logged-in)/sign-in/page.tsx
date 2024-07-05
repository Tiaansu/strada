import { providerMap, signIn } from '@/auth';
import LoggedInHome from '@/components/home/logged-in-home';
import { Button } from '@/components/ui/button';
import getSession from '@/lib/getSession';
import { ReloadIcon } from '@radix-ui/react-icons';
import { redirect } from 'next/navigation';

interface HomePageProps {
    searchParams: {
        callbackUrl: string | undefined;
    };
}

export default async function Home({ searchParams }: HomePageProps) {
    const session = await getSession();

    if (session && session.user) {
        redirect(searchParams.callbackUrl ?? '/~');
    }

    return (
        <>
            <main className="flex justify-center items-center h-[100vh]">
                {Object.values(providerMap).map((provider) => (
                    <form
                        key={provider.id}
                        action={async () => {
                            'use server';

                            await signIn(provider.id, {
                                redirect: true,
                                redirectTo: '/~',
                            });
                        }}
                    >
                        <Button type="submit">
                            Sign In with {provider.name}
                        </Button>
                    </form>
                ))}
            </main>
        </>
    );
}
