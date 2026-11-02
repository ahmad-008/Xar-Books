// we are using this like somehow if user's session is revoked and it will return the user history like their cart
import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query/react";
import createWebStorage from "redux-persist/lib/storage/createWebStorage";
import { persistReducer, persistStore, FLUSH, PURGE, REHYDRATE, PAUSE, REGISTER, PERSIST } from "redux-persist";
import userReducer from '@/store/slice/userSlice';
import { api } from "./api";



// localStorage only exists in the browser; on the server use a no-op storage
const createNoopStorage = () => ({
    getItem: (_key: string) => Promise.resolve(null),
    setItem: (_key: string, value: unknown) => Promise.resolve(value),
    removeItem: (_key: string) => Promise.resolve(),
});

const storage = typeof window !== "undefined" ? createWebStorage("local") : createNoopStorage();

//Persist Configuration for User
const userPersistantConfig = {key:'user', storage, whitelist: ['user','isEmailVerified', 'isLoggedIn']}

//wrap users with 'Persist Config'

const persistedUserReducer = persistReducer(userPersistantConfig, userReducer)

export const store = configureStore({
    reducer:{
        [api.reducerPath]: api.reducer, //rtk query
        user:persistedUserReducer
    },

    middleware:(getDefaultMiddleware)=> 
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions:[FLUSH,REHYDRATE,PAUSE,PURGE,PERSIST,REGISTER],
            }
        }).concat(api.middleware)

}); 

//Setup the listnere for the RTK query
setupListeners(store.dispatch);

export const persistor = persistStore(store);


//infer the Root State and AppDispatch types from the store itself
export type RootState= ReturnType<typeof store.getState>

//infered type: {posts: PostState,  comments: CommentState, users: UserState}
export type AppDispatch = typeof store.dispatch