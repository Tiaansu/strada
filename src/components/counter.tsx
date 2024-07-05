'use client';

import {
    decrement,
    increment,
    selectCount,
} from '@/lib/state/features/counter/counterSlice';
import { useAppDispatch, useAppSelector } from '@/lib/state/hooks';
import { Button } from '@/components/ui/button';

export default function Counter() {
    const dispatch = useAppDispatch();
    const count = useAppSelector(selectCount);

    return (
        <div>
            <span>{count}</span>

            <Button onClick={() => dispatch(increment())}>+</Button>
            <Button onClick={() => dispatch(decrement())}>-</Button>
        </div>
    );
}
