import { Boards } from '@prisma/client';
import { createAppSlice } from '@/lib/state/createAppSlice';
import { PayloadAction } from '@reduxjs/toolkit';

export interface BoardSliceState {
    value: Boards[];
}

const initialState: BoardSliceState = {
    value: [],
};

export const boardSlice = createAppSlice({
    name: 'board',
    initialState,
    reducers: (create) => ({
        setBoards: create.reducer((state, action: PayloadAction<Boards[]>) => {
            state.value = action.payload;
        }),
    }),
    selectors: {
        boardsList: (board) => board.value,
    },
});

export const { setBoards } = boardSlice.actions;
export const { boardsList } = boardSlice.selectors;
