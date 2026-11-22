import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type {User} from "@/store/api";

interface UserState {
    user: User | null;
    isLoginDialogOpen: boolean;
    isLoggedIn: boolean;
}

const initialState : UserState={
    user:null,
    isLoginDialogOpen:false,
    isLoggedIn:false,
}

const userSlice = createSlice ({
    name: 'user',
    initialState,
    reducers:{
        setUser:(state, action:PayloadAction<User>) => {
            state.user = action.payload;
        },
        logout:(state)=>{
            state.user = null;
            state.isLoggedIn = false;
        },
        setLoginDialogOpen: (state, action:PayloadAction<boolean>)=>{
            state.isLoginDialogOpen = action.payload;
        },
        authStatus : (state)=>{
            state.isLoggedIn = true;
        }
    }
});

export const {setUser, logout, setLoginDialogOpen, authStatus} = userSlice.actions;
export default userSlice.reducer;
