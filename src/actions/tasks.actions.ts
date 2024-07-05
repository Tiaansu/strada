'use server';

import prisma from '@/lib/prisma';
import { Prisma, Tasks } from '@prisma/client';

export async function createTask(sectionId: string) {
    try {
        const tasks = await prisma.tasks.findMany({ where: { sectionId } });
        const task = await prisma.tasks.create({
            data: {
                sectionId,
                position: tasks.length,
            },
        });

        return {
            task,
        };
    } catch (error) {
        return {
            error: 'Something went wrong.',
        };
    }
}

export async function getTask(sectionId: string) {
    try {
        const tasks = await prisma.tasks.findMany({ where: { sectionId } });

        return {
            tasks,
        };
    } catch (error) {
        return {
            tasks: [],
            error: 'Something went wrong.',
        };
    }
}

export async function deleteTask(sectionId: string, taskId: string) {
    try {
        await prisma.tasks.delete({ where: { id: taskId, sectionId } });

        const tasks = await prisma.tasks.findMany({
            where: {
                sectionId,
            },
            orderBy: {
                position: 'asc',
            },
        });

        const tasksToUpdate = [];
        for (const key in tasks) {
            tasksToUpdate.push(
                prisma.tasks.update({
                    where: { id: tasks[key].id },
                    data: { position: parseInt(key) },
                })
            );
        }

        await Promise.all(tasksToUpdate);

        return {
            error: null,
        };
    } catch (error) {
        return {
            error: 'Something went wrong.',
        };
    }
}

export async function updateTask(
    sectionId: string,
    taskId: string,
    data: Prisma.XOR<Prisma.TasksUpdateInput, Prisma.TasksUncheckedUpdateInput>
) {
    try {
        await prisma.tasks.update({
            where: {
                id: taskId,
                sectionId,
            },
            data,
        });

        return {
            error: null,
        };
    } catch (error) {
        return {
            error: 'Something went wrong.',
        };
    }
}

interface UpdateTaskPositionBody {
    sourceList: Tasks[];
    destinationList: Tasks[];
    sourceSectionId: string;
    destinationSectionId: string;
}
export async function updateTaskPosition(
    boardId: string,
    body: UpdateTaskPositionBody
) {
    const {
        sourceList,
        destinationList,
        sourceSectionId,
        destinationSectionId,
    } = body;

    try {
        if (sourceSectionId !== destinationSectionId) {
            const sourceToUpdate = [];
            const destinationToUpdate = [];

            for (const key in sourceList) {
                const task = sourceList[key];
                sourceToUpdate.push(
                    prisma.tasks.update({
                        where: {
                            id: task.id,
                        },
                        data: {
                            sectionId: sourceSectionId,
                            position: parseInt(key),
                        },
                    })
                );
            }

            for (const key in destinationList) {
                const task = destinationList[key];
                destinationToUpdate.push(
                    prisma.tasks.update({
                        where: {
                            id: task.id,
                        },
                        data: {
                            sectionId: destinationSectionId,
                            position: parseInt(key),
                        },
                    })
                );
            }

            await Promise.all(sourceToUpdate);
            await Promise.all(destinationToUpdate);

            return {
                message: 'Success',
            };
        }

        return {
            error: null,
        };
    } catch (error) {
        return {
            error: 'Something went wrong.',
        };
    }
}
