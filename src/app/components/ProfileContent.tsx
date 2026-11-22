"use client";

import LoginRequired from "./LoginRequired";
import { ChangeEvent, FormEvent, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Camera, LoaderCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { useChangePasswordMutation, useUpdateAvatarMutation, useUpdateProfileMutation } from "@/store/api";
import { RootState } from "@/store/store";
import { setUser } from "@/store/slice/userSlice";

const MAX_AVATAR_SIZE = 1024 * 1024;

export default function ProfileContent() {
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.user.user);
    const fileInput = useRef<HTMLInputElement>(null);

    const [name, setName] = useState(user?.name ?? "");
    const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber ?? "");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [updateProfile, { isLoading: isSaving }] = useUpdateProfileMutation();
    const [updateAvatar, { isLoading: isUploading }] = useUpdateAvatarMutation();
    const [changePassword, { isLoading: isChanging }] = useChangePasswordMutation();

    if (!user) {
        return (
            <LoginRequired title="My profile" message="Log in to see and edit your profile." />
        );
    }

    const handleAvatar = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;

        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
            toast.error("Only JPG, PNG or WEBP images are allowed");
            return;
        }
        if (file.size > MAX_AVATAR_SIZE) {
            toast.error("Image must be 1 MB or smaller");
            return;
        }

        const formData = new FormData();
        formData.append("images", file);
        try {
            const result = await updateAvatar(formData).unwrap();
            dispatch(setUser(result.data));
            toast.success("Profile picture updated");
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    };

    const handleProfile = async (event: FormEvent) => {
        event.preventDefault();
        try {
            const result = await updateProfile({ name, phoneNumber }).unwrap();
            dispatch(setUser(result.data));
            setName(result.data.name);
            setPhoneNumber(result.data.phoneNumber ?? "");
            toast.success("Profile updated");
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    };

    const handlePassword = async (event: FormEvent) => {
        event.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error("New passwords don't match");
            return;
        }
        try {
            await changePassword({ currentPassword, newPassword }).unwrap();
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            toast.success("Password changed");
        } catch (error) {
            toast.error(getErrorMessage(error));
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">My profile</h1>

            <section className="flex items-center gap-4 rounded-lg border bg-white p-6 shadow-sm">
                <div className="relative">
                    <Avatar className="h-20 w-20">
                        {user.profilePicture && <AvatarImage src={user.profilePicture} alt={user.name} />}
                        <AvatarFallback className="text-2xl">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <button
                        type="button"
                        onClick={() => fileInput.current?.click()}
                        disabled={isUploading}
                        aria-label="Change profile picture"
                        className="absolute -bottom-1 -right-1 rounded-full bg-orange-500 p-1.5 text-white shadow hover:bg-orange-600 disabled:opacity-60"
                    >
                        {isUploading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                    </button>
                    <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={handleAvatar} />
                </div>
                <div className="min-w-0">
                    <p className="truncate text-lg font-semibold">{user.name}</p>
                    <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                    <p className={`text-xs ${user.isEmailVerified ? "text-green-700" : "text-amber-700"}`}>
                        {user.isEmailVerified ? "Email verified" : "Email not verified"}
                    </p>
                </div>
            </section>

            <form onSubmit={handleProfile} className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold">Personal details</h2>
                <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} maxLength={50} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={user.email} disabled />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone">Phone number</Label>
                    <Input id="phone" type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="Optional" maxLength={20} />
                </div>
                <Button type="submit" disabled={isSaving} className="normal-case tracking-normal">
                    {isSaving && <LoaderCircle className="mr-1 h-4 w-4 animate-spin" />}
                    Save changes
                </Button>
            </form>

            <form onSubmit={handlePassword} className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold">Change password</h2>
                <div className="space-y-2">
                    <Label htmlFor="current-password">Current password</Label>
                    <Input id="current-password" type="password" autoComplete="current-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="new-password">New password</Label>
                    <Input id="new-password" type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} maxLength={72} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm new password</Label>
                    <Input id="confirm-password" type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                </div>
                <Button type="submit" disabled={isChanging} className="normal-case tracking-normal">
                    {isChanging && <LoaderCircle className="mr-1 h-4 w-4 animate-spin" />}
                    Change password
                </Button>
            </form>
        </div>
    );
}
