"use client";

import { Share2 } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";



interface ShareButtonProps {
    title: string;
}

const ShareButton = ({title}: ShareButtonProps)=>{
    const handleShare = async () => {
        const url = window.location.href;

        if (typeof navigator.share === "function") {
            try{
                await navigator.share({title, url});
            } catch {
                // user closed the share sheet nothing to do
            }
        } else {
            await navigator.clipboard.writeText(url);
            toast.success("Link copied to clipboard");
        }
    };

    return (
        <Button
            variant="outline" size="icon"
            onClick={handleShare}
            aria-label="Share"
        >
            <Share2 className="h-5 w-5"/>
        </Button>
    );




};

export default ShareButton;
