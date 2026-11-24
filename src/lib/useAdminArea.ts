import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

export const useAdminArea = () => {
    const pathname = usePathname();
    const role = useSelector((state: RootState) => state.user.user?.role);
    return role === "admin" && (pathname === "/admin" || pathname.startsWith("/admin/"));
};