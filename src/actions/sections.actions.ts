'use server';

import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function createSection(boardId: string) {
    try {
        const section = await prisma.sections.create({
            data: { boardId },
            include: { Tasks: true },
        });

        return {
            section,
        };
    } catch (error) {
        return {
            error: 'Something went wrong.',
        };
    }
}

export async function deleteSection(boardId: string, sectionId: string) {
    try {
        await Promise.all([
            prisma.tasks.deleteMany({ where: { sectionId } }),
            prisma.sections.delete({ where: { id: sectionId, boardId } }),
        ]);

        return {
            message: 'success',
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

export async function getSection(boardId: string) {
    try {
        const sections = await prisma.sections.findMany({
            where: { boardId },
        });

        return {
            sections,
        };
    } catch (error) {
        return {
            sections: [],
            error: 'Something went wrong.',
        };
    }
}

export async function updateSection(
    boardId: string,
    sectionId: string,
    data:
        | (Prisma.Without<
              Prisma.SectionsUpdateInput,
              Prisma.SectionsUncheckedUpdateInput
          > &
              Prisma.SectionsUncheckedUpdateInput)
        | (Prisma.Without<
              Prisma.SectionsUncheckedUpdateInput,
              Prisma.SectionsUpdateInput
          > &
              Prisma.SectionsUpdateInput)
) {
    await prisma.sections.update({
        where: {
            boardId,
            id: sectionId,
        },
        data,
    });
}
