'use client';

import {
    createBoard,
    getBoard,
    updateBoardPositions,
} from '@/actions/boards.actions';
import { boardsList, setBoards } from '@/lib/state/features/board/boardSlice';
import { useAppDispatch, useAppSelector } from '@/lib/state/hooks';
import { Session } from 'next-auth';
import { useEffect, useState, useTransition } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlusIcon } from '@radix-ui/react-icons';
import { usePathname, useRouter } from 'next/navigation';
import { DEFAULT_LOGIN_REDIRECT } from '@/lib/constants';
import { cn } from '@/lib/utils';
import {
    DragDropContext,
    Draggable,
    Droppable,
    DropResult,
} from '@hello-pangea/dnd';
import BoardsItem from '@/components/core/boards/boards-item';
import { ScrollArea } from '@/components/ui/scroll-area';

interface BoardsListProps {
    session: Session;
}

export default function BoardsList({ session }: BoardsListProps) {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [creating, startCreatingTransition] = useTransition();
    const [activeIndex, setActiveIndex] = useState<number>(0);
    const pathname = usePathname();
    const boardId = pathname.split('/').at(-1);

    const dispatch = useAppDispatch();
    const boards = useAppSelector(boardsList);
    const router = useRouter();

    useEffect(() => {
        const getBoards = async () => {
            const boardsData = await getBoard(session.user?.id!);
            dispatch(setBoards(boardsData));
            setIsLoading(false);
        };

        getBoards();
    }, [session.user?.id, dispatch]);

    useEffect(() => {
        const activeItem = boards.findIndex((e) => e.id === boardId);
        setActiveIndex(activeItem);
    }, [pathname, boardId, boards]);

    const addBoard = () => {
        startCreatingTransition(async () => {
            const res = await createBoard();

            if (res.error) {
                return alert(res.error);
            }

            const newBoards = [...boards, res.board!];
            dispatch(setBoards(newBoards));
            router.push(`${DEFAULT_LOGIN_REDIRECT}/board/${res.board?.id!}`);
        });
    };

    const onDragEnd = async ({ source, destination }: DropResult) => {
        const newList = [...boards];
        const [removed] = newList.splice(source.index, 1);
        newList.splice(destination?.index!, 0, removed);

        const activeItem = newList.findIndex((e) => e.id === boardId);
        setActiveIndex(activeItem);
        dispatch(setBoards(newList));

        const res = await updateBoardPositions(newList);

        if (res.error) {
            return alert(res.error);
        }
    };

    return (
        <div className="h-[100vh]">
            {!isLoading && (
                <div>
                    <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                            <h4 className="scroll-m-20 text-lg font-semibold tracking-tight">
                                Boards
                            </h4>
                            <Badge variant="secondary">{boards.length}</Badge>
                        </div>

                        <Button
                            size={creating ? 'sm' : 'icon'}
                            variant="secondary"
                            className={cn(!creating ? 'w-7 h-7' : 'h-7')}
                            onClick={addBoard}
                            disabled={creating}
                            title="Add board"
                        >
                            {creating ? (
                                'Creating...'
                            ) : (
                                <PlusIcon className="w-4 h-4" />
                            )}
                        </Button>
                    </div>

                    <ScrollArea className="h-[75vh] w-48 mt-4">
                        <DragDropContext onDragEnd={onDragEnd}>
                            <Droppable
                                key="list-board-droppable-key"
                                droppableId="list-board-droppable"
                            >
                                {(provided) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className="flex flex-col"
                                    >
                                        {boards.map((board, index) => (
                                            <Draggable
                                                key={board.id}
                                                draggableId={board.id}
                                                index={index}
                                            >
                                                {(provided, snapshot) => (
                                                    <BoardsItem
                                                        provided={provided}
                                                        snapshot={snapshot}
                                                        board={board}
                                                        session={session}
                                                        selected={
                                                            index ===
                                                            activeIndex
                                                        }
                                                    />
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                    </ScrollArea>
                </div>
            )}
        </div>
    );
}
