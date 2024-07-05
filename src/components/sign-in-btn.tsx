import { signIn } from '@/auth';
import { Button } from './ui/button';

export function SignInButton() {
    return (
        <form
            action={async () => {
                'use server';
                signIn();
            }}
        >
            <Button type="submit">Sign In</Button>
        </form>
    );
}
