'use client';

import { updateTask } from '@/actions/tasks.actions';
import TextEditor from '@/components/editor';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { Tasks } from '@prisma/client';
import { IconReload, IconTrash } from '@tabler/icons-react';
import moment from 'moment';
import { useEffect, useState } from 'react';

interface TaskModalProps {
    task: Tasks | undefined;
    boardId: string;
    isLoading: boolean;
    onClose: () => void;
    onUpdate: (task: Tasks) => void;
    onDelete: (task: Tasks) => void;
}

let globalTimer: NodeJS.Timeout | string | number | undefined = undefined;
const TIMEOUT = 500;

export default function TaskModal(props: TaskModalProps) {
    const [task, setTask] = useState<Tasks | undefined>(props.task);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        setTask(props.task);
        setTitle(props.task?.title ?? '');
        setContent(props.task?.content ?? '');
    }, [props.task]);

    const onClose = () => {
        if (task) {
            props.onUpdate(task);
        }
        props.onClose();
    };

    const updateTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
        clearTimeout(globalTimer);

        if (props.isLoading) return;

        const newTitle = e.target.value;
        task!.title = newTitle;
        setTitle(newTitle);
        props.onUpdate(task!);

        globalTimer = setTimeout(async () => {
            const res = await updateTask(task?.sectionId!, task?.id!, {
                title: newTitle,
            });

            if (res.error) {
                toast({
                    variant: 'destructive',
                    title: 'Uh-oh! Something went wrong.',
                    description: `Something went wrong while trying to update task ${
                        task!.id
                    }.`,
                });
                return;
            }
        }, TIMEOUT);
    };

    const updateContent = (text: string) => {
        clearTimeout(globalTimer);

        if (props.isLoading) return;

        task!.content = text;
        setContent(text);
        props.onUpdate(task!);

        globalTimer = setTimeout(async () => {
            const res = await updateTask(task?.sectionId!, task?.id!, {
                content: text,
            });

            if (res.error) {
                toast({
                    variant: 'destructive',
                    title: 'Uh-oh! Something went wrong.',
                    description: `Something went wrong while trying to update task ${
                        task!.id
                    }.`,
                });
                return;
            }
        }, TIMEOUT);
    };

    return (
        <Dialog
            open={task !== undefined}
            onOpenChange={(open) => {
                if (props.isLoading) return;

                if (!open) {
                    onClose();
                }
            }}
        >
            <DialogContent
                className="sm:max-w-[700px] max-h-[90vh]"
                onOpenAutoFocus={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>
                        <Input
                            value={title ?? ''}
                            autoFocus={false}
                            onChange={updateTitle}
                            placeholder="Add a title"
                            className="mt-4 text-xl h-14 cursor-pointer border-none focus-visible:ring-0 truncate"
                            disabled={props.isLoading}
                        />
                        <p className="text-zinc-400 font-semibold text-sm mt-2 ml-2.5">
                            {task && moment(task.createdAt).format('LLLL')}
                        </p>
                    </DialogTitle>
                </DialogHeader>

                <Separator className="my-2.5" />

                <DialogDescription className="max-h-[45vh] overflow-y-auto">
                    <TextEditor
                        content={task?.content ?? ''}
                        loading={props.isLoading}
                        setContent={(text) => {
                            if (props.isLoading) return;

                            updateContent(text);
                        }}
                    />
                </DialogDescription>

                <Separator className="my-2.5" />

                <DialogFooter>
                    <DialogClose asChild disabled={props.isLoading}>
                        <Button variant="secondary">Close</Button>
                    </DialogClose>
                    <Button
                        variant={props.isLoading ? 'secondary' : 'destructive'}
                        className="max-sm:mb-2 flex gap-2"
                        disabled={props.isLoading}
                        onClick={() => props.onDelete(task!)}
                    >
                        {props.isLoading ? (
                            <IconReload className="w-4 h-4 animate-spin" />
                        ) : (
                            <IconTrash className="w-4 h-4" />
                        )}
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
