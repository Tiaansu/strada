import { createAppSlice } from '@/lib/state/createAppSlice';

export interface CounterSliceState {
    value: number;
}

const initialState: CounterSliceState = {
    value: 0,
};

export const counterSlice = createAppSlice({
    name: 'counter',
    initialState,
    reducers: (create) => ({
        increment: create.reducer((state) => {
            state.value += 1;
        }),
        decrement: create.reducer((state) => {
            state.value -= 1;
        }),
    }),
    selectors: {
        selectCount: (counter) => counter.value,
    },
});

export const { increment, decrement } = counterSlice.actions;

export const { selectCount } = counterSlice.selectors;
