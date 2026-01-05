"use client";

import { Sparkles, Upload } from "lucide-react";
import { MoodboardImage, useMoodboard } from "@/hooks/use-styles";

import ImagesBoard from "./images.board";
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";
import { useRef } from "react";

interface MoodboardProps {
    imagesGuide: MoodboardImage[];
}

const Moodboard = ({ imagesGuide }: MoodboardProps) => {
    const {
        images, // Current moodboard images
        dragActive, // Drag state
        removeImage, // Function to remove an image
        handleDrag, // Drag event handlers
        handleDrop, // Drop event handler
        handleFileInput, // File input change handler
        canAddMore // Boolean indicating if more images can be added
    } = useMoodboard(imagesGuide);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Handle the file upload logic for the click event
    const handleUploadClick = () => {
        fileInputRef.current?.click()
    };

    return (
        <div className="flex flex-col gap-10">
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileInput}
            />
            <div
                className={cn(
                    "relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-200 min-h-[500px] flex items-center justify-center",
                    dragActive ? "border-primary bg-primary/5 scale-[1.02]" : "border-border/50 hover:border-border"
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <div className="absolute inset-0 opacity-5">
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-transparent rounded-3xl" />
                </div>

                {images.length > 0 && (
                    <>
                        {/* Mobile view */}
                        <div className="lg:hidden absolute inset-0 flex items-center justify-center">
                            <div className="relative">
                                {images.map((img, i) => {
                                    const seed = img.id.split("").reduce((a, b) => a + b.charCodeAt(0), 0);

                                    const random1 = ((seed * 9301 + 49297) % 233280) / 233280;
                                    const random2 = (((seed + 1) * 9301 + 49297) % 233280) / 233280;
                                    const random3 = (((seed + 2) * 9301 + 49297) % 233280) / 233280;

                                    const rotation = (random1 - 0.5) * 20;
                                    const xOffset = (random2 - 0.5) * 40;
                                    const yOffset = (random3 - 0.5) * 30;

                                    return (
                                        <ImagesBoard
                                            key={`mobile-${img.id}`}
                                            image={img}
                                            removeImage={removeImage}
                                            xOffset={xOffset}
                                            yOffset={yOffset}
                                            rotation={rotation}
                                            zIndex={i + 1}
                                            marginLeft="-80px"
                                            marginTop="-96px"
                                        />
                                    )
                                })}
                            </div>
                        </div>

                        {/* Desktop view */}
                        <div className="hidden lg:flex absolute inset-0 items-center justify-center">
                            <div className="relative w-full max-w-[700px] h-[300px] mx-auto">
                                {images.map((img, i) => {
                                    const seed = img.id.split("").reduce((a, b) => a + b.charCodeAt(0), 0);

                                    const random1 = ((seed * 9301 + 49297) % 233280) / 233280;
                                    const random3 = (((seed + 2) * 9301 + 49297) % 233280) / 233280;

                                    const imageWidth = 192;
                                    const overlapAmount = 30;
                                    const spacing = imageWidth - overlapAmount;

                                    const rotation = (random1 - 0.5) * 50;
                                    const xOffset = i * spacing - ((images.length - 1) * spacing) / 2;
                                    const yOffset = (random3 - 0.5) * 30;
                                    const zIndex = i + 1;

                                    return (
                                        <ImagesBoard
                                            key={`desktop-${img.id}`}
                                            image={img}
                                            removeImage={removeImage}
                                            xOffset={xOffset}
                                            yOffset={yOffset}
                                            rotation={rotation}
                                            zIndex={zIndex}
                                            marginLeft="-96px"
                                            marginTop="-112px"
                                        />
                                    )
                                })}
                            </div>
                        </div>
                    </>
                )}

                {images.length === 0 && (
                    <div className="relative z-10 flex flex-col items-center justify-center gap-6">
                        {/* Floating frame */}
                        <div className="relative flex items-center justify-center size-20 rounded-3xl bg-white/[0.06] border border-white/[0.12] backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_20px_40px_-20px_rgba(0,0,0,0.6)]">
                            {/* Inner soft glow */}
                            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-60" />

                            <div className="relative flex">
                                <div className="size-7 rounded-md bg-white/40 rotate-[-8deg] translate-x-1 shadow-sm" />
                                <div className="size-7 rounded-md bg-white/70 -translate-y-1 z-10 shadow-md" />
                                <div className="size-7 rounded-md bg-white/30 rotate-[8deg] -translate-x-1 shadow-sm" />
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-1">
                            <p className="text-sm font-medium tracking-tight text-foreground">
                                Drop images to add to moodboard
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Images become part of the visual language
                            </p>
                        </div>

                        <Button
                            onClick={handleUploadClick}
                            variant="outline"
                        >
                            <Upload className="w-4 h-4 mr-1" />
                            Choose Files
                        </Button>
                    </div>
                )}

                {images.length > 0 && canAddMore && (
                    <div className="absolute bottom-6 right-6 z-20">
                        <Button
                            onClick={handleUploadClick}
                            size="sm"
                            variant="outline"
                        >
                            <Upload className="w-4 h-4 mr-1" />
                            Add More
                        </Button>
                    </div>
                )}
            </div>

            {/* TODO: Implement AI generation */}
            <Button
              className="w-fit justify-end"
              size="sm"
            >
                <Sparkles />
                Generate with AI
            </Button>

            {images.length >= 5 && (
                <div className="text-center p-4 bg-muted/50 rounded-2xl">
                    <p className="text-sm text-muted-foreground">
                        Maximum of 5 images reached. Remove an image to add more.
                    </p>
                </div>
            )}
        </div>
    );
}

export default Moodboard;