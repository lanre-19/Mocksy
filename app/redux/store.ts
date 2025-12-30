import {
    combineReducers,
    configureStore,
    Middleware,
    ReducersMapObject
} from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

import { slice } from "./slice";
import { apis } from "./api";

export type RootState = ReturnType<typeof rootReducer>;

// Combine slices and API reducers
const rootReducer = combineReducers({
    // Slice reducers
    ...slice,
    // API reducers
    ...apis.reduce((acc, api) => {
        // Add each API reducer to the accumulator
        acc[api.reducerPath] = api.reducer;
        // Return the updated accumulator
        return acc;
    }, {} as ReducersMapObject)
});

// Function to create the Redux store
export function makeStore (preloadedState?: Partial<RootState>) {
    return configureStore({
        // Root reducer
        reducer: rootReducer,
        // Middleware setup
        middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(...apis.map((api) => api.middleware as Middleware)),
        // Preloaded state
        preloadedState,
        // Enable Redux DevTools in development mode
        devTools: process.env.NODE_ENV !== "production"
    });
};

export const store = makeStore();
// Type for the Redux store
export type AppStore = ReturnType<typeof makeStore>;
// Type for dispatch function
export type AppDispatch = AppStore["dispatch"];

// Typed selector hook for use in components
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
// Typed dispatch hook for use in components
export const useAppDispatch = () => useDispatch<AppDispatch>();