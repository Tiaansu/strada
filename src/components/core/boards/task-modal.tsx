'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { DraggableProvided, DraggableStateSnapshot } from '@hello-pangea/dnd';
import { Tasks } from '@prisma/client';
import {
    IconTrash,
    IconReload,
    IconBold,
    IconItalic,
    IconStrikethrough,
    IconUnderline,
    IconHighlight,
    IconClearFormatting,
    IconCode,
    IconH1,
    IconH2,
    IconH3,
    IconH4,
} from '@tabler/icons-react';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { EditorProvider, useCurrentEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import HighlightText from '@tiptap/extension-highlight';
import CodeText from '@tiptap/extension-code';
import HeadingText from '@tiptap/extension-heading';
import { updateTask } from '@/actions/tasks.actions';
import { useToast } from '@/components/ui/use-toast';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';

interface TaskModalProps {
    boardId: string;
    sectionId: string;
    provided: DraggableProvided;
    snapshot: DraggableStateSnapshot;
    setSelectedTask: (task: Tasks | undefined) => void;
    selectedTask: Tasks | undefined;
    task: Tasks;
    loading: boolean;
    onUpdate: (task: Tasks) => void;
    onDeleteTask: (sectionId: string, tasks: Tasks) => void;
}

let globalTimer: NodeJS.Timeout | string | number | undefined = undefined;
const TIMEOUT = 500;

export default function TaskModal(props: TaskModalProps) {
    const {
        provided,
        snapshot,
        setSelectedTask,
        selectedTask,
        loading,
        sectionId,
    } = props;

    const [task, setTask] = useState(props.task);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const { toast } = useToast();

    useEffect(() => {
        setTask(props.task);
        setTitle(props.task.title ?? '');
        setContent(props.task.content ?? '');
    }, [props.task]);

    const updateTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
        clearTimeout(globalTimer);

        if (loading) return;

        const newTitle = e.target.value;

        task.title = newTitle;
        setTitle(newTitle);
        props.onUpdate(task);

        globalTimer = setTimeout(async () => {
            const res = await updateTask(sectionId, task.id, {
                title: newTitle,
            });

            if (res.error) {
                toast({
                    variant: 'destructive',
                    title: 'Uh-oh! Something went wrong.',
                    description: `Something went wrong while trying to update task ${task.id}.`,
                });
                return;
            }
        }, TIMEOUT);
    };

    const updateContent = (text: string) => {
        clearTimeout(globalTimer);

        if (loading) return;

        const newContent = text;

        task.content = newContent;
        setContent(content);

        globalTimer = setTimeout(async () => {
            const res = await updateTask(sectionId, task.id, {
                content: newContent,
            });

            if (res.error) {
                toast({
                    variant: 'destructive',
                    title: 'Uh-oh! Something went wrong.',
                    description: `Something went wrong while trying to update task ${task.id}.`,
                });
                return;
            }
        }, TIMEOUT);
    };

    return (
        <Dialog
            open={selectedTask !== undefined}
            onOpenChange={(open) => {
                if (loading) return;

                if (!open) {
                    setSelectedTask(undefined);
                }
            }}
        >
            <DialogTrigger asChild>
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    onClick={() => setSelectedTask(task)}
                    className={cn(
                        'p-2.5 mb-2.5 block w-full bg-primary/20 rounded-lg border-2 border-dashed border-primary',
                        snapshot.isDragging ? 'cursor-grab' : '!cursor-pointer'
                    )}
                >
                    {task.title === '' ? 'Untitled' : task.title}
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        <Input
                            value={task.title ?? ''}
                            onChange={updateTitle}
                            placeholder="Add a title"
                            className="mt-4 text-xl h-14 cursor-pointer border-none focus-visible:ring-0 truncate"
                            disabled={loading}
                        />
                        <p className="text-zinc-400 font-semibold text-sm mt-2 ml-2.5">
                            {task && moment(task.createdAt).format('LLLL')}
                        </p>
                    </DialogTitle>
                </DialogHeader>

                {/* Divider */}
                <Separator className="my-2.5" />

                <TextEditor
                    content={task.content ?? 'Hello!'}
                    loading={loading}
                    setContent={(text) => {
                        if (loading) return;

                        updateContent(text);
                    }}
                />

                <DialogFooter>
                    <DialogClose asChild disabled={loading}>
                        <Button type="button" variant="secondary">
                            Close
                        </Button>
                    </DialogClose>
                    <Button
                        variant={loading ? 'secondary' : 'destructive'}
                        className="max-sm:mb-2 flex gap-2"
                        disabled={loading}
                        onClick={() =>
                            props.onDeleteTask(props.sectionId, task)
                        }
                    >
                        {loading ? (
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

const extensions = [
    StarterKit.configure({
        bulletList: {
            keepMarks: true,
            keepAttributes: false,
        },
        orderedList: {
            keepMarks: true,
            keepAttributes: false,
        },
    }),
    Underline,
    HighlightText,
    CodeText.configure({
        HTMLAttributes: {
            class: 'code-highlight',
        },
    }),
    HeadingText.configure({
        levels: [1, 2, 3, 4],
    }),
];

function EditorToolBar() {
    const { editor } = useCurrentEditor();

    if (!editor) {
        return null;
    }

    interface Tools {
        [key: string]: {
            name: string;
            children: React.ReactNode;
        }[];
    }
    const tools: Tools = {
        main: [
            {
                name: 'Bold',
                children: (
                    <ToggleGroupItem
                        value="bold"
                        aria-label="Toggle Bold"
                        aria-pressed={
                            editor.isActive('bold') ? 'true' : 'false'
                        }
                        data-state={editor.isActive('bold') ? 'on' : 'off'}
                        disabled={
                            !editor.can().chain().focus().toggleBold().run()
                        }
                        onClick={() =>
                            editor.chain().focus().toggleBold().run()
                        }
                    >
                        <IconBold className="w-4 h-4" />
                    </ToggleGroupItem>
                ),
            },
            {
                name: 'Italic',
                children: (
                    <ToggleGroupItem
                        value="italic"
                        aria-label="Toggle Italic"
                        aria-pressed={
                            editor.isActive('italic') ? 'true' : 'false'
                        }
                        data-state={editor.isActive('italic') ? 'on' : 'off'}
                        disabled={
                            !editor.can().chain().focus().toggleItalic().run()
                        }
                        onClick={() =>
                            editor.chain().focus().toggleItalic().run()
                        }
                    >
                        <IconItalic className="w-4 h-4" />
                    </ToggleGroupItem>
                ),
            },
            {
                name: 'Underline',
                children: (
                    <ToggleGroupItem
                        value="underline"
                        aria-label="Toggle Underline"
                        ria-pressed={
                            editor.isActive('underline') ? 'true' : 'false'
                        }
                        data-state={editor.isActive('underline') ? 'on' : 'off'}
                        disabled={
                            !editor
                                .can()
                                .chain()
                                .focus()
                                .toggleUnderline()
                                .run()
                        }
                        onClick={() =>
                            editor.chain().focus().toggleUnderline().run()
                        }
                    >
                        <IconUnderline className="w-4 h-4" />
                    </ToggleGroupItem>
                ),
            },
            {
                name: 'Strikethrough',
                children: (
                    <ToggleGroupItem
                        value="strikethrough"
                        aria-label="Toggle Strikethrough"
                        ria-pressed={
                            editor.isActive('strike') ? 'true' : 'false'
                        }
                        data-state={editor.isActive('strike') ? 'on' : 'off'}
                        disabled={
                            !editor.can().chain().focus().toggleStrike().run()
                        }
                        onClick={() =>
                            editor.chain().focus().toggleStrike().run()
                        }
                    >
                        <IconStrikethrough className="w-4 h-4" />
                    </ToggleGroupItem>
                ),
            },
            {
                name: 'Highlight',
                children: (
                    <ToggleGroupItem
                        value="highlight"
                        aria-label="Toggle Highlight"
                        ria-pressed={
                            editor.isActive('highlight') ? 'true' : 'false'
                        }
                        data-state={editor.isActive('highlight') ? 'on' : 'off'}
                        disabled={
                            !editor
                                .can()
                                .chain()
                                .focus()
                                .toggleHighlight()
                                .run()
                        }
                        onClick={() =>
                            editor.chain().focus().toggleHighlight().run()
                        }
                    >
                        <IconHighlight className="w-4 h-4" />
                    </ToggleGroupItem>
                ),
            },
            {
                name: 'Code',
                children: (
                    <ToggleGroupItem
                        value="code"
                        aria-label="Toggle Code"
                        aria-pressed={
                            editor.isActive('code') ? 'true' : 'false'
                        }
                        data-state={editor.isActive('code') ? 'on' : 'off'}
                        disabled={
                            !editor.can().chain().focus().toggleCode().run()
                        }
                        onClick={() =>
                            editor.chain().focus().toggleCode().run()
                        }
                    >
                        <IconCode className="w-4 h-4" />
                    </ToggleGroupItem>
                ),
            },
            {
                name: 'Clear formatting',
                children: (
                    <ToggleGroupItem
                        value="clear-formatting"
                        aria-pressed="false"
                        data-state="off"
                        onClick={() =>
                            editor.chain().focus().unsetAllMarks().run()
                        }
                    >
                        <IconClearFormatting className="w-4 h-4" />
                    </ToggleGroupItem>
                ),
            },
        ],
        headings: [
            {
                name: 'Heading 1',
                children: (
                    <ToggleGroupItem
                        value="heading-1"
                        aria-label="Toggle Heading 1"
                        aria-pressed={
                            editor.isActive('heading', { level: 1 })
                                ? 'true'
                                : 'false'
                        }
                        data-state={
                            editor.isActive('heading', { level: 1 })
                                ? 'on'
                                : 'false'
                        }
                        onClick={() =>
                            editor
                                .chain()
                                .focus()
                                .toggleHeading({ level: 1 })
                                .run()
                        }
                    >
                        <IconH1 className="w-4 h-4" />
                    </ToggleGroupItem>
                ),
            },
            {
                name: 'Heading 2',
                children: (
                    <ToggleGroupItem
                        value="heading-2"
                        aria-label="Toggle Heading 2"
                        aria-pressed={
                            editor.isActive('heading', { level: 2 })
                                ? 'true'
                                : 'false'
                        }
                        data-state={
                            editor.isActive('heading', { level: 2 })
                                ? 'on'
                                : 'false'
                        }
                        onClick={() =>
                            editor
                                .chain()
                                .focus()
                                .toggleHeading({ level: 2 })
                                .run()
                        }
                    >
                        <IconH2 className="w-4 h-4" />
                    </ToggleGroupItem>
                ),
            },
            {
                name: 'Heading 3',
                children: (
                    <ToggleGroupItem
                        value="heading-3"
                        aria-label="Toggle Heading 3"
                        aria-pressed={
                            editor.isActive('heading', { level: 3 })
                                ? 'true'
                                : 'false'
                        }
                        data-state={
                            editor.isActive('heading', { level: 3 })
                                ? 'on'
                                : 'false'
                        }
                        onClick={() =>
                            editor
                                .chain()
                                .focus()
                                .toggleHeading({ level: 3 })
                                .run()
                        }
                    >
                        <IconH3 className="w-4 h-4" />
                    </ToggleGroupItem>
                ),
            },
            {
                name: 'Heading 4',
                children: (
                    <ToggleGroupItem
                        value="heading-4"
                        aria-label="Toggle Heading 4"
                        aria-pressed={
                            editor.isActive('heading', { level: 4 })
                                ? 'true'
                                : 'false'
                        }
                        data-state={
                            editor.isActive('heading', { level: 4 })
                                ? 'on'
                                : 'false'
                        }
                        onClick={() =>
                            editor
                                .chain()
                                .focus()
                                .toggleHeading({ level: 4 })
                                .run()
                        }
                    >
                        <IconH4 className="w-4 h-4" />
                    </ToggleGroupItem>
                ),
            },
        ],
    };

    return (
        <div className="flex gap-4 flex-wrap">
            <TooltipProvider delayDuration={1}>
                {Object.entries(tools).map(([key, value]) => (
                    <ToggleGroup
                        type="multiple"
                        variant="outline"
                        size="sm"
                        className="bg-slate-800/30 p-2 rounded-md"
                        key={key}
                    >
                        {value.map((tool) => (
                            <Tooltip key={tool.name}>
                                <TooltipTrigger>{tool.children}</TooltipTrigger>
                                <TooltipContent className="bg-primary/30">
                                    {tool.name}
                                </TooltipContent>
                            </Tooltip>
                        ))}
                    </ToggleGroup>
                ))}
            </TooltipProvider>
        </div>
    );
}

interface TextEditorProps {
    content: string;
    loading: boolean;
    setContent: (text: string) => void;
}
function TextEditor({ content, loading, setContent }: TextEditorProps) {
    return (
        <EditorProvider
            slotBefore={<EditorToolBar />}
            extensions={extensions}
            content={content}
            onUpdate={(props) => {
                if (loading && props.editor.isEditable) {
                    props.editor.setEditable(!loading);
                    return;
                }

                setContent(props.editor.getHTML());
            }}
        ></EditorProvider>
    );
}
