'use client';

import { EmojiClickData, EmojiStyle, Theme } from 'emoji-picker-react';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Cross1Icon } from '@radix-ui/react-icons';

const Picker = dynamic(
    () => {
        return import('emoji-picker-react');
    },
    {
        ssr: false,
    }
);

interface EmojiPickerProps {
    selectedIcon: string;
    onIconChange: (icon: string) => void;
}

export default function EmojiPicker(props: EmojiPickerProps) {
    const [isShowPicker, setIsShowPicker] = useState<boolean>(false);

    const onEmojiClick = (emoji: EmojiClickData) => {
        setIsShowPicker(false);
        props.onIconChange(emoji.emoji);
    };

    return (
        <div className="relative w-full">
            <div className="flex items-center gap-4">
                <Input
                    value={props.selectedIcon}
                    className="cursor-pointer border-none text-5xl w-24 h-16 focus-visible:ring-0"
                    onClick={() => setIsShowPicker(true)}
                    onChange={() => {}}
                    placeholder="🔥"
                />
                {isShowPicker && (
                    <Button
                        size="icon"
                        variant="secondary"
                        className="w-9 h-9 rounded-full"
                        onClick={() => setIsShowPicker(false)}
                    >
                        <Cross1Icon className="w-4 h-4" />
                    </Button>
                )}
            </div>
            <Picker
                lazyLoadEmojis
                emojiStyle={EmojiStyle.FACEBOOK}
                theme={Theme.DARK}
                searchDisabled
                open={isShowPicker}
                onEmojiClick={onEmojiClick}
            />
        </div>
    );
}
