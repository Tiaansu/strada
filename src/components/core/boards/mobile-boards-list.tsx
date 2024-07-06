'use client';

import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTrigger,
} from '@/components/ui/sheet';
import { DEFAULT_LOGIN_REDIRECT } from '@/lib/constants';
import { ExitIcon } from '@radix-ui/react-icons';
import { Session } from 'next-auth';
import Image from 'next/image';
import Link from 'next/link';
import BoardsList from './boards-list';
import { signOut } from 'next-auth/react';

interface MobileBoardsListProps {
    session: Session;
}

export default function MobileBoardsList({ session }: MobileBoardsListProps) {
    return (
        <div className="md:hidden">
            <Sheet>
                <SheetTrigger>
                    <Image
                        src={session.user?.image!}
                        alt={`${session.user?.name}'s profile`}
                        width={35}
                        height={35}
                        className="rounded-full"
                    />
                </SheetTrigger>
                <SheetContent side="left" className="h-[100vh]">
                    <SheetHeader>
                        <div className="flex justify-around gap-3">
                            <Link href={DEFAULT_LOGIN_REDIRECT}>
                                <div className="flex justify-center items-center gap-2 truncate">
                                    <Image
                                        src={session.user?.image!}
                                        alt={`${session.user?.name}'s profile`}
                                        width={35}
                                        height={35}
                                        className="rounded-full"
                                    />
                                    <p className="truncate">
                                        {session.user?.name}
                                    </p>
                                </div>
                            </Link>
                            <Button
                                size="sm"
                                variant="destructive"
                                className="rounded-full flex justify-center gap-3"
                                type="button"
                                title="Sign out"
                                onClick={() => signOut()}
                            >
                                <ExitIcon className="w-4 h-4" />
                                Sign out
                            </Button>
                        </div>
                    </SheetHeader>

                    <SheetDescription className="my-12">
                        <BoardsList session={session} />
                    </SheetDescription>
                </SheetContent>
            </Sheet>
        </div>
    );
}
