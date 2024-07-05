import { signOut } from '@/auth';
import { Session } from 'next-auth';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import Counter from '@/components/counter';

export default function LoggedInHome({ session }: { session: Session }) {
    return (
        <main>
            <div className="sticky top-0 right-0 left-0 py-4 px-8 bg-background bg-opacity-90 backdrop-filter backdrop-blur-md flex justify-between">
                <h1 className="text-2xl font-bold">
                    Welcome,{' '}
                    <span className="text-primary">{session.user?.name}</span>!
                </h1>
                <form
                    action={async () => {
                        'use server';

                        await signOut();
                    }}
                >
                    <Button variant="destructive" type="submit" size="sm">
                        Sign Out
                    </Button>
                </form>
            </div>

            {/* <div className="mt-4 px-8 grid grid-cols-5 max-sm:grid-cols-1 gap-5 mb-8">
                <Counter />
            </div> */}
        </main>
    );
}
