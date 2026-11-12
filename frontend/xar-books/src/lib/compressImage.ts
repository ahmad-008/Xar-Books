


const MAX_BYTES = 1024 * 1024;
const MAX_SIZE = 1600;

export const compressImage = async (file: File): Promise<File> => {
    if (file.size <= MAX_BYTES) return file;

    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIZE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    for (const quality of [0.85, 0.7, 0.55, 0.4]) {
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
        if ( blob && blob.size <= MAX_BYTES){
            const name = file.name.replace(/\.[^.]+$/,"") + ".jpg";
            return new File([blob], name, {type: "image/jpeg"});
        }
    }

    throw new Error("Image is too large");

};