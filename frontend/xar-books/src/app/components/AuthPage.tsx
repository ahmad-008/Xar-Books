"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AuthPageProps {
  isLoginOpen: boolean;
  setIsLoginOpen: (open: boolean) => void;
}

type AuthTab = "login" | "signup" | "forgot";

const AuthPage = ({ isLoginOpen, setIsLoginOpen }: AuthPageProps) => {
  const [currentTab, setCurrentTab] = useState<AuthTab>("login");

  return (
    <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
      <DialogContent className="p-6 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Welcome to Xar Books
          </DialogTitle>
          <DialogDescription className="text-center">
            Login or create an account to buy and sell books
          </DialogDescription>
        </DialogHeader>

        <Tabs value={currentTab} onValueChange={(value) => setCurrentTab(value as AuthTab)}>
          {/* hide the tab buttons on the forgot password screen */}
          {currentTab !== "forgot" && (
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
          )}

          <TabsContent value="login">Login form goes here</TabsContent>
          <TabsContent value="signup">Sign up form goes here</TabsContent>
          <TabsContent value="forgot">Forgot password form goes here</TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthPage;
