import { createSlice, PayloadAction } from "@reduxjs/toolkit";





export interface AuthUser {
    id: string;
    name: string;
    email: string;
    role: "user" | "admin";
    isEmailVerified: boolean;
    profilePicture?: string;
}

interface UserState {
    user: AuthUser | null;
    isEmailVerified : boolean;
    isLoginDialogOpen: boolean;
    isLoggedIn: boolean;

}

const initialState : UserState={
    user:null,
    isEmailVerified:false,
    isLoginDialogOpen:false,
    isLoggedIn:false,
}


//Use for persist the data in the redux and this will create a wishlist for a user name

const userSlice = createSlice ({
    name: 'user',
    initialState,

    //it will use when user do any action on that state , the user value will be update on that state
    reducers:{
        setUser:(state, action:PayloadAction<AuthUser>) => {
            state.user = action.payload;    
        },
        setEmailVerified:(state, action:PayloadAction<boolean>)=> {
            state.isEmailVerified = action.payload;
        },
        logout:(state)=>{
            state.user = null;
            state.isLoggedIn = false;
            state.isEmailVerified=false;
        },
        toggleLoginDialog:(state)=>{
            state.isLoginDialogOpen = !state.isLoginDialogOpen;
        },
        authStatus : (state)=>{
            state.isLoggedIn = true;
        }
    }



});

export const {setUser, setEmailVerified,logout, toggleLoginDialog, authStatus} = userSlice.actions;
export default userSlice.reducer;