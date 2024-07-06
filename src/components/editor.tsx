'use client';

import Highlight from '@tiptap/extension-highlight';
import Underline from '@tiptap/extension-underline';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import { EditorProvider, useCurrentEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
    IconAlignCenter,
    IconAlignJustified,
    IconAlignLeft,
    IconAlignRight,
    IconBlockquote,
    IconBold,
    IconClearFormatting,
    IconCode,
    IconDots,
    IconH1,
    IconH2,
    IconH3,
    IconH4,
    IconHighlight,
    IconItalic,
    IconLink,
    IconList,
    IconListNumbers,
    IconStrikethrough,
    IconSubscript,
    IconSuperscript,
    IconUnderline,
    IconUnlink,
} from '@tabler/icons-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useCallback } from 'react';

interface TextEditorProps {
    content: string;
    loading: boolean;
    setContent: (text: string) => void;
}

export default function TextEditor({
    content,
    loading,
    setContent,
}: TextEditorProps) {
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
        code: {
            HTMLAttributes: {
                class: 'inline-code-highlight',
            },
        },
        codeBlock: {
            HTMLAttributes: {
                class: 'code-block-highlight',
            },
        },
        heading: {
            levels: [1, 2, 3, 4],
        },
    }),
    Underline,
    Highlight,
    Subscript,
    Superscript,
    Link.configure({
        autolink: true,
        linkOnPaste: true,
        openOnClick: true,
    }),
    TextAlign.configure({
        types: ['heading', 'paragraph'],
    }),
];

function EditorToolBar() {
    const { editor } = useCurrentEditor();

    if (!editor) {
        return null;
    }

    const setLink = () => {
        const previousUrl = editor?.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);

        if (url === null) {
            return;
        }

        if (url === '') {
            editor?.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        editor
            ?.chain()
            .focus()
            .extendMarkRange('link')
            .setLink({ href: url, target: '_blank' })
            .run();
    };

    interface Tools {
        [key: string]: {
            name: string;
            children: React.ReactNode;
        }[];
    }
    const tools: {
        multiple: Tools;
        single: Tools;
    } = {
        multiple: {
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
                            data-state={
                                editor.isActive('italic') ? 'on' : 'off'
                            }
                            disabled={
                                !editor
                                    .can()
                                    .chain()
                                    .focus()
                                    .toggleItalic()
                                    .run()
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
                            data-state={
                                editor.isActive('underline') ? 'on' : 'off'
                            }
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
                            data-state={
                                editor.isActive('strike') ? 'on' : 'off'
                            }
                            disabled={
                                !editor
                                    .can()
                                    .chain()
                                    .focus()
                                    .toggleStrike()
                                    .run()
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
                            data-state={
                                editor.isActive('highlight') ? 'on' : 'off'
                            }
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
                    name: 'Code Block',
                    children: (
                        <ToggleGroupItem
                            value="code-block"
                            aria-label="Toggle Code Block"
                            aria-pressed={
                                editor.isActive('codeBlock') ? 'true' : 'false'
                            }
                            data-state={
                                editor.isActive('codeBlock') ? 'on' : 'off'
                            }
                            disabled={
                                !editor
                                    .can()
                                    .chain()
                                    .focus()
                                    .toggleCodeBlock()
                                    .run()
                            }
                            onClick={() =>
                                editor.chain().focus().toggleCodeBlock().run()
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
            secondary: [
                {
                    name: 'Block Quote',
                    children: (
                        <ToggleGroupItem
                            value="block-quote"
                            aria-label="Toggle BlockQuote"
                            aria-pressed={
                                editor.isActive('blockquote') ? 'true' : 'false'
                            }
                            data-state={
                                editor.isActive('blockquote') ? 'on' : 'off'
                            }
                            disabled={
                                !editor
                                    .can()
                                    .chain()
                                    .focus()
                                    .toggleBlockquote()
                                    .run()
                            }
                            onClick={() =>
                                editor.chain().focus().toggleBlockquote().run()
                            }
                        >
                            <IconBlockquote className="w-4 h-4" />
                        </ToggleGroupItem>
                    ),
                },
                {
                    name: 'Horizontal Line',
                    children: (
                        <ToggleGroupItem
                            value="horizontal-line"
                            aria-label="Toggle Horizontal Line"
                            aria-pressed="false"
                            data-state="off"
                            onClick={() =>
                                editor.chain().focus().setHorizontalRule().run()
                            }
                            disabled={
                                !editor
                                    .can()
                                    .chain()
                                    .focus()
                                    .setHorizontalRule()
                                    .run()
                            }
                        >
                            <IconDots className="w-4 h-4" />
                        </ToggleGroupItem>
                    ),
                },
                {
                    name: 'Bullet List',
                    children: (
                        <ToggleGroupItem
                            value="bullet-list"
                            aria-label="Toggle Bullet List"
                            aria-pressed={
                                editor.isActive('bulletList') ? 'true' : 'false'
                            }
                            data-state={
                                editor.isActive('bulletList') ? 'on' : 'off'
                            }
                            onClick={() =>
                                editor.chain().focus().toggleBulletList().run()
                            }
                            disabled={
                                !editor
                                    .can()
                                    .chain()
                                    .focus()
                                    .toggleBulletList()
                                    .run()
                            }
                        >
                            <IconList className="w-4 h-4" />
                        </ToggleGroupItem>
                    ),
                },
                {
                    name: 'Ordered List',
                    children: (
                        <ToggleGroupItem
                            value="ordered-list"
                            aria-label="Toggle Ordered List"
                            aria-pressed={
                                editor.isActive('orderedList')
                                    ? 'true'
                                    : 'false'
                            }
                            data-state={
                                editor.isActive('orderedList') ? 'on' : 'off'
                            }
                            onClick={() =>
                                editor.chain().focus().toggleOrderedList().run()
                            }
                            disabled={
                                !editor
                                    .can()
                                    .chain()
                                    .focus()
                                    .toggleOrderedList()
                                    .run()
                            }
                        >
                            <IconListNumbers className="w-4 h-4" />
                        </ToggleGroupItem>
                    ),
                },
                {
                    name: 'Subscript',
                    children: (
                        <ToggleGroupItem
                            value="subscript"
                            aria-label="Toggle Subscript"
                            aria-pressed={
                                editor.isActive('subscript') ? 'true' : 'false'
                            }
                            data-state={
                                editor.isActive('subscript') ? 'on' : 'off'
                            }
                            onClick={() =>
                                editor.chain().focus().toggleSubscript().run()
                            }
                            disabled={
                                !editor
                                    .can()
                                    .chain()
                                    .focus()
                                    .toggleSubscript()
                                    .run()
                            }
                        >
                            <IconSubscript className="w-4 h-4" />
                        </ToggleGroupItem>
                    ),
                },
                {
                    name: 'Superscript',
                    children: (
                        <ToggleGroupItem
                            value="superscript"
                            aria-label="Toggle Superscript"
                            aria-pressed={
                                editor.isActive('superscript')
                                    ? 'true'
                                    : 'false'
                            }
                            data-state={
                                editor.isActive('superscript') ? 'on' : 'off'
                            }
                            onClick={() =>
                                editor.chain().focus().toggleSuperscript().run()
                            }
                            disabled={
                                !editor
                                    .can()
                                    .chain()
                                    .focus()
                                    .toggleSuperscript()
                                    .run()
                            }
                        >
                            <IconSuperscript className="w-4 h-4" />
                        </ToggleGroupItem>
                    ),
                },
                {
                    name: 'Link',
                    children: (
                        <ToggleGroupItem
                            value="link"
                            aria-label="Toggle Link"
                            aria-pressed={
                                editor.isActive('link') ? 'true' : 'false'
                            }
                            data-state={editor.isActive('link') ? 'on' : 'off'}
                            onClick={setLink}
                        >
                            <IconLink className="w-4 h-4" />
                        </ToggleGroupItem>
                    ),
                },
                {
                    name: 'Remove Link',
                    children: (
                        <ToggleGroupItem
                            value="remove-link"
                            aria-label="Remove Link"
                            onClick={setLink}
                            disabled={!editor.isActive('link')}
                        >
                            <IconUnlink className="w-4 h-4" />
                        </ToggleGroupItem>
                    ),
                },
            ],
        },
        single: {
            'text-align': [
                {
                    name: 'Align text: Left',
                    children: (
                        <ToggleGroupItem
                            value="align-text-left"
                            onClick={() =>
                                editor
                                    .chain()
                                    .focus()
                                    .setTextAlign('left')
                                    .run()
                            }
                        >
                            <IconAlignLeft className="w-4 h-4" />
                        </ToggleGroupItem>
                    ),
                },
                {
                    name: 'Align text: Center',
                    children: (
                        <ToggleGroupItem
                            value="align-text-center"
                            onClick={() =>
                                editor
                                    .chain()
                                    .focus()
                                    .setTextAlign('center')
                                    .run()
                            }
                        >
                            <IconAlignCenter className="w-4 h-4" />
                        </ToggleGroupItem>
                    ),
                },
                {
                    name: 'Align text: Right',
                    children: (
                        <ToggleGroupItem
                            value="align-text-right"
                            onClick={() =>
                                editor
                                    .chain()
                                    .focus()
                                    .setTextAlign('right')
                                    .run()
                            }
                        >
                            <IconAlignRight className="w-4 h-4" />
                        </ToggleGroupItem>
                    ),
                },
                {
                    name: 'Align text: Justify',
                    children: (
                        <ToggleGroupItem
                            value="align-text-justify"
                            onClick={() =>
                                editor
                                    .chain()
                                    .focus()
                                    .setTextAlign('justify')
                                    .run()
                            }
                        >
                            <IconAlignJustified className="w-4 h-4" />
                        </ToggleGroupItem>
                    ),
                },
            ],
        },
    };

    return (
        <div className="flex gap-4 flex-wrap mb-4 border rounded-md p-2">
            <TooltipProvider delayDuration={1}>
                {Object.entries(tools).map(([type, toolsValue]) => (
                    <>
                        {Object.entries(toolsValue).map(([key, value]) => (
                            <ToggleGroup
                                type={type as 'single' | 'multiple'}
                                key={key}
                                variant="outline"
                                size="sm"
                                className="bg-slate-800/30 p-2 rounded-sm"
                            >
                                {value.map((tool) => (
                                    <Tooltip key={tool.name}>
                                        <TooltipTrigger>
                                            {tool.children}
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-primary/30">
                                            {tool.name}
                                        </TooltipContent>
                                    </Tooltip>
                                ))}
                            </ToggleGroup>
                        ))}
                    </>
                ))}
            </TooltipProvider>
        </div>
    );
}
