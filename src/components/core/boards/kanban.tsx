'use client';

import {
    createSection,
    deleteSection,
    updateSection,
} from '@/actions/sections.actions';
import {
    createTask,
    deleteTask,
    updateTaskPosition,
} from '@/actions/tasks.actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { ExtendedSection } from '@/types';
import {
    DragDropContext,
    Draggable,
    Droppable,
    DropResult,
} from '@hello-pangea/dnd';
import { Tasks } from '@prisma/client';
import { PlusIcon, ReloadIcon, TrashIcon } from '@radix-ui/react-icons';
import { useEffect, useState, useTransition } from 'react';
import { Separator } from '@/components/ui/separator';
import TaskModal from './task-modal';
import { ScrollArea } from '@/components/ui/scroll-area';

interface KanbanBoardProps {
    data: ExtendedSection[];
    boardId: string;
}

let globalTimer: NodeJS.Timeout | string | number | undefined = undefined;
const TIMEOUT = 500;

export default function KanbanBoard(props: KanbanBoardProps) {
    const { boardId } = props;
    const [data, setData] = useState<ExtendedSection[]>([]);
    const [selectedTask, setSelectedTask] = useState<Tasks | undefined>(
        undefined
    );
    const [isLoading, startTransition] = useTransition();
    const { toast } = useToast();

    useEffect(() => {
        setData(props.data);
    }, [props.data]);

    const createSectionHandler = () => {
        startTransition(async () => {
            const res = await createSection(boardId);

            if (res.error) {
                toast({
                    variant: 'destructive',
                    title: 'Uh-oh! Something went wrong.',
                    description: res.error,
                });
                return;
            }

            setData([...data, res.section!]);
        });
    };

    const deleteSectionHandler = (sectionId: string) => {
        startTransition(async () => {
            const res = await deleteSection(boardId, sectionId);

            if (res.error) {
                toast({
                    variant: 'destructive',
                    title: 'Uh-oh! Something went wrong.',
                    description: `Something went wrong while trying to delete section ${sectionId}.`,
                });
                return;
            }

            setData([...data].filter((section) => section.id !== sectionId));
        });
    };

    const updateSectionTitle = async (
        e: React.ChangeEvent<HTMLInputElement>,
        sectionId: string
    ) => {
        clearTimeout(globalTimer);
        const newTitle = e.target.value;
        const newData = [...data];
        const index = newData.findIndex((section) => section.id === sectionId);
        newData[index].title = newTitle;
        setData(newData);

        globalTimer = setTimeout(async () => {
            try {
                await updateSection(boardId, sectionId, {
                    title: newTitle,
                });
            } catch (error) {
                toast({
                    variant: 'destructive',
                    title: 'Uh-oh! Something went wrong.',
                    description: `Something went wrong while trying to update section ${sectionId}.`,
                });
            }
        }, TIMEOUT);
    };

    const createTaskHandler = (sectionId: string) => {
        startTransition(async () => {
            const res = await createTask(sectionId);

            if (res.error) {
                toast({
                    variant: 'destructive',
                    title: 'Uh-oh! Something went wrong.',
                    description: res.error,
                });
                return;
            }

            const newData = [...data];
            const index = newData.findIndex(
                (section) => section.id === sectionId
            );
            newData[index].Tasks.unshift(res.task!);
            setData(newData);
        });
    };

    const onDragEnd = async ({ source, destination }: DropResult) => {
        if (!destination) return;
        const sourceColIndex = data.findIndex(
            (section) => section.id === source.droppableId
        );
        const destinationColIndex = data.findIndex(
            (section) => section.id === destination.droppableId
        );
        const sourceCol = data[sourceColIndex];
        const destinationCol = data[destinationColIndex];

        const sourceSectionId = sourceCol.id;
        const destinationSectionId = destinationCol.id;

        const sourceTasks = [...sourceCol.Tasks];
        const destinationTasks = [...destinationCol.Tasks];

        if (source.droppableId !== destination.droppableId) {
            const [removed] = sourceTasks.splice(source.index, 1);
            destinationTasks.splice(destination.index, 0, removed);
            data[sourceColIndex].Tasks = sourceTasks;
            data[destinationColIndex].Tasks = destinationTasks;
        } else {
            const [removed] = destinationTasks.splice(source.index, 1);
            destinationTasks.splice(destination.index, 0, removed);
            data[destinationColIndex].Tasks = destinationTasks;
        }

        const res = await updateTaskPosition(boardId, {
            sourceList: sourceTasks,
            destinationList: destinationTasks,
            sourceSectionId,
            destinationSectionId,
        });

        if (res.error) {
            toast({
                variant: 'destructive',
                title: 'Uh-oh! Something went wrong.',
                description: res.error,
            });
            return;
        }

        setData(data);
    };

    const onUpdate = (task: Tasks) => {
        const newData = [...data];
        const sectionIndex = newData.findIndex(
            (section) => section.id === task.sectionId
        );
        const taskIndex = newData[sectionIndex].Tasks.findIndex(
            (e) => e.id === task.id
        );
        newData[sectionIndex].Tasks[taskIndex] = task;
        setData(newData);
    };

    const onDeleteTask = (task: Tasks) => {
        startTransition(async () => {
            const res = await deleteTask(task.sectionId, task.id);

            if (res.error) {
                toast({
                    variant: 'destructive',
                    title: 'Uh-oh! Something went wrong.',
                    description: res.error,
                });
                return;
            }

            const newData = [...data];
            const sectionIndex = newData.findIndex(
                (section) => section.id === task.sectionId
            );
            const taskIndex = newData[sectionIndex].Tasks.findIndex(
                (t) => t.id === task.id
            );
            newData[sectionIndex].Tasks.splice(taskIndex, 1);
            setData(newData);
            setSelectedTask(undefined);
        });
    };

    return (
        <>
            <div className="flex items-center justify-between mt-8">
                <Button onClick={createSectionHandler} disabled={isLoading}>
                    {isLoading && (
                        <ReloadIcon className="w-4 h-4 animate-spin" />
                    )}
                    Add Section
                </Button>
                <p className="font-[700]">
                    {isLoading ? '--' : data.length} Sections
                </p>
            </div>
            <Separator className="my-2.5" />
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex items-start sm:w-[calc(100vw_-_400px)] overflow-x-auto">
                    {data.map((section) => (
                        <div key={section.id} className="w-[300px]">
                            <Droppable
                                key={section.id}
                                droppableId={section.id}
                            >
                                {(provided) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className="w-[290px] p-2.5 mr-2.5"
                                    >
                                        <div className="flex items-center justify-between mb-2.5">
                                            <Input
                                                value={section.title}
                                                onChange={(e) =>
                                                    updateSectionTitle(
                                                        e,
                                                        section.id
                                                    )
                                                }
                                                placeholder="Untitled"
                                                className="cursor-pointer border-none focus-visible:ring-0 truncate"
                                                disabled={isLoading}
                                            />
                                            <Button
                                                size="icon"
                                                className="mx-1 w-11 h-8 bg-transparent hover:bg-primary"
                                                disabled={isLoading}
                                                onClick={() =>
                                                    createTaskHandler(
                                                        section.id
                                                    )
                                                }
                                            >
                                                {isLoading ? (
                                                    <ReloadIcon className="w-6 h-4 animate-spin" />
                                                ) : (
                                                    <PlusIcon className="w-6 h-4" />
                                                )}
                                            </Button>
                                            <Button
                                                size="icon"
                                                className="mx-1 w-11 h-8 bg-transparent hover:bg-destructive"
                                                onClick={() =>
                                                    deleteSectionHandler(
                                                        section.id
                                                    )
                                                }
                                                disabled={isLoading}
                                            >
                                                {isLoading ? (
                                                    <ReloadIcon className="w-6 h-4 animate-spin" />
                                                ) : (
                                                    <TrashIcon className="w-6 h-4" />
                                                )}
                                            </Button>
                                        </div>
                                        <ScrollArea className="h-[35vh]">
                                            {section.Tasks.map(
                                                (task, index) => (
                                                    <Draggable
                                                        key={task.id}
                                                        draggableId={task.id}
                                                        index={index}
                                                    >
                                                        {(
                                                            provided,
                                                            snapshot
                                                        ) => (
                                                            <div
                                                                ref={
                                                                    provided.innerRef
                                                                }
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className={cn(
                                                                    'p-2.5 mb-2.5 block w-full bg-primary/20 rounded-sm border-2 border-dashed border-primary/50',
                                                                    snapshot.isDragging
                                                                        ? 'cursor-grab'
                                                                        : '!cursor-pointer'
                                                                )}
                                                                onClick={() =>
                                                                    setSelectedTask(
                                                                        task
                                                                    )
                                                                }
                                                            >
                                                                {task.title ===
                                                                ''
                                                                    ? 'Untitled'
                                                                    : task.title}
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                )
                                            )}
                                            {provided.placeholder}
                                        </ScrollArea>
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    ))}
                </div>
            </DragDropContext>
            <TaskModal
                task={selectedTask}
                boardId={boardId}
                isLoading={isLoading}
                onClose={() => setSelectedTask(undefined)}
                onUpdate={onUpdate}
                onDelete={onDeleteTask}
            />
        </>
    );
}
