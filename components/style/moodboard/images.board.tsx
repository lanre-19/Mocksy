import Image from "next/image";
import { AlertCircle, CheckCircle2, Loader2, X } from "lucide-react";
import { MoodboardImage } from "@/hooks/use-styles";

import { Button } from "@/components/ui/button";

interface ImagesBoardProps {
    image: MoodboardImage;
    removeImage: (id: string) => void;
    xOffset: number;
    yOffset: number;
    rotation: number;
    zIndex: number;
    marginLeft: string;
    marginTop: string;
}

const UploadStatus = (image: {
    uploading: boolean,
    uploaded: boolean,
    error?: string
}) => {
    // Status for uploading state
    if (image.uploading) {
        return (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-2xl">
                <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
        )
    }

    // if (image.uploaded) {
    //     return (
    //         <div className="absolute top-2 right-2">
    //             <CheckCircle2 className="w-5 h-5 text-green-400" />
    //         </div>
    //     )
    // }

    if (image.error) {
        return (
            <div className="absolute top-2 right-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
        )
    }

    return null;
};

const ImagesBoard = ({
    image,
    removeImage,
    xOffset,
    yOffset,
    rotation,
    zIndex,
    marginLeft,
    marginTop
}: ImagesBoardProps) => {
    // Do not render the moodboard image preview if it doesn't exist
    if (!image.preview) return null;

    return (
        <div
          key={`board-${image.id}`}
          className="absolute group"
          style={{
            transform: `translate(${xOffset}px, ${yOffset}px) rotate(${rotation}deg)`,
            zIndex: zIndex,
            left: "50%",
            top: "50%",
            marginLeft: marginLeft,
            marginTop: marginTop
          }}
        >
            <div className="relative w-40 h-48 rounded-2xl overflow-hidden bg-white shadow-xl border border-border/20 hover:scale-105 transition-all duration-200">
                <Image
                  src={image.preview}
                  alt="Moodboard image"
                  fill
                  className="object-cover"
                />

                <UploadStatus
                  uploading={image.uploading}
                  uploaded={image.uploaded}
                  error={image.error}
                />

                <Button
                  onClick={() => removeImage(image.id)}
                  className="absolute top-2 left-2 w-6 h-6 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <X className="w-4 h-4 text-white" />
                </Button>
            </div>
        </div>
    );
}
 
export default ImagesBoard;