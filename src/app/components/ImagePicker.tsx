"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { ImagePlus, LoaderCircle, X } from "lucide-react";
import { compressImage } from "@/lib/compressImage";

export interface PickedImage {
    id: string;
    file: File;
    preview: string;
}

const MAX_IMAGES = 4;

const readAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });

interface ImagePickerProps {
    images: PickedImage[];
    onChange: (images: PickedImage[]) => void;
}

export default function ImagePicker({ images, onChange }: ImagePickerProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleFiles = async (fileList: FileList | null) => {
        if (!fileList || fileList.length === 0) return;

        const room = MAX_IMAGES - images.length;
        if (fileList.length > room) {
            toast.error(`You can add up to ${MAX_IMAGES} photos`);
        }

        setIsProcessing(true);
        const added: PickedImage[] = [];
        for (const original of Array.from(fileList).slice(0, room)) {
            try {
                const file = await compressImage(original);
                added.push({ id: crypto.randomUUID(), file, preview: await readAsDataUrl(file) });
            } catch {
                toast.error(`Couldn't use ${original.name}. Try a JPG or PNG photo.`);
            }
        }
        setIsProcessing(false);

        onChange([...images, ...added]);
        if (inputRef.current) inputRef.current.value = "";
    };

    const removeImage = (id: string) => onChange(images.filter((image) => image.id !== id));

    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {images.map((image, index) => (
                <div key={image.id} className="relative aspect-3/4 overflow-hidden rounded-md border bg-gray-50">
                    <Image src={image.preview} alt={`Book photo ${index + 1}`} fill unoptimized className="object-cover" />
                    {index === 0 && (
                        <span className="absolute left-1 top-1 rounded bg-black/70 px-1.5 py-0.5 text-xs text-white">Cover</span>
                    )}
                    <button
                        type="button"
                        onClick={() => removeImage(image.id)}
                        aria-label={`Remove photo ${index + 1}`}
                        className="absolute right-1 top-1 rounded-full bg-white/90 p-1 shadow hover:bg-white"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            ))}

            {images.length < MAX_IMAGES && (
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={isProcessing}
                    className="flex aspect-3/4 flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed text-sm text-gray-500 hover:bg-gray-50 disabled:opacity-60"
                >
                    {isProcessing ? <LoaderCircle className="h-6 w-6 animate-spin" /> : <ImagePlus className="h-6 w-6" />}
                    {isProcessing ? "Preparing..." : "Add photo"}
                </button>
            )}

            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                hidden
                onChange={(e) => handleFiles(e.target.files)}
            />
        </div>
    );
}
