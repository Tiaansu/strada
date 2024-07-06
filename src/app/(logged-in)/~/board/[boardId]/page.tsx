import Board from '@/components/core/boards/board';
import getSession from '@/lib/getSession';
import prisma from '@/lib/prisma';
import { Metadata } from 'next';

interface BoardPageProps {
    params: {
        boardId: string;
    };
}

export async function generateMetadata({
    params,
}: BoardPageProps): Promise<Metadata> {
    const { boardId } = params;

    const board = await prisma.boards.findFirst({ where: { id: boardId } });

    return {
        title: board?.title ?? 'Unknown',
    };
}

export default async function BoardPage({ params }: BoardPageProps) {
    const session = await getSession();

    if (!session?.user) return;

    return (
        <main className="md:ml-[240px] h-[100vh] p-4">
            <Board boardId={params.boardId} session={session} />
        </main>
    );
}
