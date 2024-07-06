'use client';

import {
    deleteBoard,
    getBoardById,
    updateBoard,
} from '@/actions/boards.actions';
import EmojiPicker from '@/components/emoji-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { DEFAULT_LOGIN_REDIRECT } from '@/lib/constants';
import { boardsList, setBoards } from '@/lib/state/features/board/boardSlice';
import { useAppDispatch, useAppSelector } from '@/lib/state/hooks';
import { Sections, Tasks } from '@prisma/client';
import { ReloadIcon } from '@radix-ui/react-icons';
import { Session } from 'next-auth';
import { redirect, useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import KanbanBoard from './kanban';
import { ExtendedSection } from '@/types';
import TextareaAutoSize from 'react-textarea-autosize';
import MobileBoardsList from './mobile-boards-list';

interface BoardProps {
    boardId: string;
    session: Session;
}

let globalTimer: NodeJS.Timeout | string | number | undefined = undefined;
const TIMEOUT = 500;

export default function Board({ session, boardId }: BoardProps) {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const dispatch = useAppDispatch();
    const boards = useAppSelector(boardsList);
    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [sections, setSections] = useState<ExtendedSection[]>([]);
    const [icon, setIcon] = useState<string>('');
    const [loading, startTransition] = useTransition();
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        const getBoard = async () => {
            const res = await getBoardById(session.user?.id!, boardId);

            if (res.error) {
                toast({
                    variant: 'destructive',
                    title: 'Uh-oh! Something went wrong.',
                    description: res.error,
                });
                router.replace(DEFAULT_LOGIN_REDIRECT);
            }

            const { board } = res;

            setTitle(board?.title ?? '');
            setDescription(board?.description ?? '');
            setSections(board?.Sections ?? []);
            setIcon(board?.icon ?? '');
            setIsLoading(false);
        };

        getBoard();
    }, [session.user?.id!, boardId]);

    useEffect(() => {
        document.title = !!title.length ? title : 'Untitled';
    }, [title]);

    const deleteBoardId = () => {
        startTransition(async () => {
            const res = await deleteBoard(session.user?.id!, boardId);

            if (res.error) {
                toast({
                    variant: 'destructive',
                    title: 'Uh-oh! Something went wrong.',
                    description: res.error,
                });
                return;
            }

            const newList = boards.filter((board) => board.id !== boardId);
            if (!newList.length) {
                router.replace(DEFAULT_LOGIN_REDIRECT);
            } else {
                router.replace(
                    `${DEFAULT_LOGIN_REDIRECT}/board/${newList[0].id}`
                );
            }
            dispatch(setBoards(newList));
        });
    };

    const onIconChange = async (icon: string) => {
        let temp = [...boards];
        const index = temp.findIndex((e) => e.id === boardId);
        temp[index] = { ...temp[index], icon };

        setIcon(icon);
        dispatch(setBoards(temp));

        try {
            await updateBoard(session.user?.id!, boardId, {
                icon,
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Uh-oh! Something went wrong.',
                description: `Something went wrong while trying to update board ${boardId}`,
            });
        }
    };

    const updateTitle = async (e: React.ChangeEvent<HTMLInputElement>) => {
        clearTimeout(globalTimer);
        const newTitle = e.target.value;
        setTitle(newTitle);

        let temp = [...boards];
        const index = temp.findIndex((board) => board.id === boardId);
        temp[index] = { ...temp[index], title: newTitle };

        dispatch(setBoards(temp));

        globalTimer = setTimeout(async () => {
            try {
                await updateBoard(session.user?.id!, boardId, {
                    title: newTitle,
                });
            } catch (error) {
                toast({
                    variant: 'destructive',
                    title: 'Uh-oh! Something went wrong.',
                    description: `Something went wrong while trying to update board ${boardId}`,
                });
            }
        }, TIMEOUT);
    };

    const updateDescription = async (
        e: React.ChangeEvent<HTMLTextAreaElement>
    ) => {
        clearTimeout(globalTimer);
        const newDescription = e.target.value;
        setDescription(newDescription);

        let temp = [...boards];
        const index = temp.findIndex((board) => board.id === boardId);
        temp[index] = { ...temp[index], description: newDescription };

        dispatch(setBoards(temp));

        globalTimer = setTimeout(async () => {
            try {
                await updateBoard(session.user?.id!, boardId, {
                    description: newDescription,
                });
            } catch (error) {
                toast({
                    variant: 'destructive',
                    title: 'Uh-oh! Something went wrong.',
                    description: `Something went wrong while trying to update board ${boardId}.`,
                });
            }
        }, TIMEOUT);
    };

    return isLoading ? (
        <>
            <Skeleton className="w-28 h-10 bg-zinc-600" />

            <div className="p-10 h-[93vh]">
                <Skeleton className="w-14 h-14 rounded-md bg-zinc-600" />
                <Skeleton className="md:w-[calc(100vh_-_240px)] h-12 bg-zinc-600" />
                <Skeleton className="md:w-[calc(100vh_-_240px)] h-60 bg-zinc-600" />
            </div>
        </>
    ) : (
        <>
            <div className="flex justify-between items-center">
                <MobileBoardsList session={session} />
                <Button
                    variant="destructive"
                    onClick={deleteBoardId}
                    disabled={loading}
                    type="button"
                    title="Delete board"
                >
                    {loading ? (
                        <div className="flex gap-2 items-center">
                            <ReloadIcon className="w-4 h-4 animate-spin" />
                            Deleting...
                        </div>
                    ) : (
                        <>Delete Board</>
                    )}
                </Button>
            </div>

            <div className="p-10 h-[93vh]">
                {loading ? (
                    <Input
                        disabled
                        value={icon}
                        className="cursor-pointer border-none text-5xl w-24 h-16 focus-visible:ring-0"
                    />
                ) : (
                    <EmojiPicker
                        selectedIcon={icon}
                        onIconChange={onIconChange}
                    />
                )}
                <Input
                    value={title}
                    onChange={updateTitle}
                    placeholder="Untitled"
                    className="md:w-[calc(100vh_-_240px)] text-4xl h-12 cursor-pointer border-none focus-visible:ring-0 truncate"
                    disabled={loading}
                />
                <TextareaAutoSize
                    rows={2}
                    maxRows={10}
                    value={description}
                    onChange={updateDescription}
                    placeholder="Add a description"
                    className="p-4 md:w-full resize-none text-sm cursor-pointer border-0 bg-transparent focus:outline-0"
                    readOnly={loading}
                />

                {!loading && <KanbanBoard data={sections} boardId={boardId} />}
            </div>
        </>
    );
}
