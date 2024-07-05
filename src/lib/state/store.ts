import {
    type Action,
    combineSlices,
    configureStore,
    type ThunkAction,
} from '@reduxjs/toolkit';
import { counterSlice } from '@/lib/state/features/counter/counterSlice';
import { boardSlice } from './features/board/boardSlice';

const rootReducer = combineSlices(counterSlice, boardSlice);
export type RootState = ReturnType<typeof rootReducer>;

export const makeStore = () => {
    return configureStore({
        reducer: rootReducer,
    });
};

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore['dispatch'];
export type AppThunk<ThunkReturnType = void> = ThunkAction<
    ThunkReturnType,
    RootState,
    unknown,
    Action
>;
