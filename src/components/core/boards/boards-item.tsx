import { DEFAULT_LOGIN_REDIRECT } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';
import { Boards } from '@prisma/client';
import { Session } from 'next-auth';
import Link from 'next/link';

interface BoardsItemProps {
    provided: DraggableProvided;
    snapshot: DraggableStateSnapshot;
    board: Boards;
    selected: boolean;
    session: Session;
}

export default function BoardsItem({
    provided,
    snapshot,
    board,
    selected,
}: BoardsItemProps) {
    return (
        <Link
            href={`${DEFAULT_LOGIN_REDIRECT}/board/${board.id}`}
            ref={provided.innerRef}
            {...provided.dragHandleProps}
            {...provided.draggableProps}
            className={'p-1'}
        >
            <div
                className={cn(
                    'p-2 border rounded-md border-primary backdrop-blur-md truncate max-w-[11.5rem]',
                    snapshot.isDragging ? 'cursor-grab' : '!cursor-pointer',
                    selected ? 'bg-primary/55' : 'bg-background/55'
                )}
            >
                {board.icon} {board.title}
            </div>
        </Link>
    );
}
