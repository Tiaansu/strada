'use server';

import getSession from '@/lib/getSession';
import prisma from '@/lib/prisma';
import { Boards, Prisma } from '@prisma/client';

export async function createBoard() {
    const session = await getSession();
    const user = session?.user;

    if (!user)
        return {
            error: 'Something went wrong. Please try again.',
        };

    const boardCount = await prisma.boards.findMany({
        where: { userId: user.id },
        select: { id: true },
    });
    const board = await prisma.boards.create({
        data: {
            userId: user.id,
            position: boardCount.length > 0 ? boardCount.length : 0,
        },
    });

    return {
        board,
    };
}

export async function getBoardData(userId: string) {
    try {
        const boards = await prisma.boards.findMany({
            where: { userId },
            include: {
                Sections: {
                    include: {
                        Tasks: true,
                    },
                },
            },
        });

        if (!boards) {
            return {
                boards: [],
                error: 'Board not found',
            };
        }

        return {
            boards,
            error: null,
        };
    } catch (error) {
        return {
            boards: [],
            error: 'Something went wrong.',
        };
    }
}

export async function getBoardById(userId: string, boardId: string) {
    try {
        const board = await prisma.boards.findFirst({
            where: {
                userId,
                id: boardId,
            },
            include: {
                Sections: {
                    include: {
                        Tasks: true,
                    },
                },
            },
        });

        if (!board)
            return {
                board: null,
                error: 'Board not found',
            };

        return {
            board,
        };
    } catch (error) {
        return {
            board: null,
            error: 'Something went wrong.',
        };
    }
}

export async function getBoard(userId: string) {
    const boards = await prisma.boards.findMany({
        where: { userId },
        orderBy: {
            position: 'asc',
        },
    });

    return boards;
}

export async function updateBoard(
    userId: string,
    boardId: string,
    data:
        | (Prisma.Without<
              Prisma.BoardsUpdateInput,
              Prisma.BoardsUncheckedUpdateInput
          > &
              Prisma.BoardsUncheckedUpdateInput)
        | (Prisma.Without<
              Prisma.BoardsUncheckedUpdateInput,
              Prisma.BoardsUpdateInput
          > &
              Prisma.BoardsUpdateInput)
) {
    await prisma.boards.update({
        where: {
            userId,
            id: boardId,
        },
        data,
    });
}

export async function updateBoardPositions(boards: Boards[]) {
    try {
        const boardsToUpdate = [];

        for (const key in boards) {
            const board = boards[key];
            boardsToUpdate.push(
                prisma.boards.update({
                    where: {
                        id: board.id,
                    },
                    data: {
                        position: parseInt(key),
                    },
                })
            );
        }

        await Promise.all(boardsToUpdate);

        return {
            message: 'Success',
        };
    } catch (error) {
        if (error instanceof Error) {
            return {
                error: error.message.split('\n').at(-1),
            };
        }

        return {
            error: 'Unknown error occurred',
        };
    }
}

export async function deleteBoard(userId: string, boardId: string) {
    try {
        await prisma.boards.delete({
            where: { userId, id: boardId },
        });

        return {
            message: 'Success',
        };
    } catch (error) {
        if (error instanceof Error) {
            return {
                error: error.message.split('\n').at(-1),
            };
        }

        return {
            error: 'Unknown error occurred',
        };
    }
}
