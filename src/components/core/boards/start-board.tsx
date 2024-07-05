'use client';

import { createBoard } from '@/actions/boards.actions';
import { Button } from '@/components/ui/button';
import { DEFAULT_LOGIN_REDIRECT } from '@/lib/constants';
import { boardsList, setBoards } from '@/lib/state/features/board/boardSlice';
import { useAppDispatch, useAppSelector } from '@/lib/state/hooks';
import { ReloadIcon, StarIcon } from '@radix-ui/react-icons';
import { Session } from 'next-auth';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

export default function StartBoard() {
    const dispatch = useAppDispatch();
    const boards = useAppSelector(boardsList);
    const [loading, startTransition] = useTransition();
    const router = useRouter();

    const createStartingBoard = () => {
        startTransition(async () => {
            const res = await createBoard();

            if (res.error) {
                return alert(res.error);
            }

            const newBoards = [...boards, res.board!];
            dispatch(setBoards(newBoards));
            router.push(`${DEFAULT_LOGIN_REDIRECT}/board/${res.board?.id!}`);
        });
    };

    return (
        <Button
            className="flex gap-2"
            onClick={createStartingBoard}
            disabled={loading}
        >
            {loading ? (
                <>
                    <ReloadIcon className="w-6 h-6 animate-spin" />
                    Creating your first board. Please wait...
                </>
            ) : (
                <>
                    <StarIcon className="w-6 h-6" />
                    Click this to create your first board!
                </>
            )}
        </Button>
    );
}
