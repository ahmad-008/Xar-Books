import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { api, useLogoutMutation } from "@/store/api";
import { logout } from "@/store/slice/userSlice";

export const useLogout = () => {
    const dispatch = useDispatch();
    const router = useRouter();
    const [logoutUser] = useLogoutMutation();

    return async () => {
        try {
            await logoutUser().unwrap();
            dispatch(logout());
            dispatch(api.util.resetApiState());
            toast.success("Logged out");
            router.push("/");
        } catch {
            toast.error("Could not log out, please try again");
        }
    };
}