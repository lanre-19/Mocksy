"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";

export interface MoodboardImage {
    id: string;
    file?: File;
    preview: string;
    storageId?: string;
    uploaded: boolean;
    uploading: boolean;
    error?: string;
    url?: string;
    isFromServer?: boolean;
};

interface StyleFormData {
    images: MoodboardImage[];
};

export const useMoodboard = (imagesGuide: MoodboardImage[]) => {
    // State to manage moodboard images
    const [dragActive, setDragActive] = useState(false);

    const searchParams = useSearchParams();
    const projectId = searchParams.get("project");

    const form = useForm<StyleFormData>({
        defaultValues: {
            images: imagesGuide || [],
        },
    });

    const { watch, getValues, setValue } = form;

    // Watch for changes in the images array
    const images = watch("images");

    const generateUploadUrl = useMutation(api.moodboard.generateUploadUrl);
    const removeMoodboardImage = useMutation(api.moodboard.removeMoodboardImage);
    const addMoodboardImage = useMutation(api.moodboard.addMoodboardImage);

    // Function to upload an image to storage
    const uploadImage = async (file: File): Promise<{ storageId: string, url?: string }> => {
        try {
            // Generate an upload URL from the server
            const uploadUrl = await generateUploadUrl();

            // Upload the image file to the generated URL
            const result = await fetch(uploadUrl, {
                method: "POST",
                headers: { "Content-Type": file.type },
                body: file
            })

            // Handle upload errors
            if (!result.ok) {
                throw new Error(`Failed to upload image: ${result.statusText}`);
            }

            const { storageId } = await result.json();

            // Associate the uploaded image with the project on the server
            if (projectId) {
                await addMoodboardImage({
                    projectId: projectId as Id<"projects">,
                    storageId: storageId as Id<"_storage">
                });
            }

            return { storageId };
        } catch (error) {
            console.error("Error uploading image:", error);
            throw error;
        }
    };

    useEffect(() => {
        // Initialize moodboard images from the server data
        if (imagesGuide && imagesGuide.length > 0) {
            const serverImages: MoodboardImage[] = imagesGuide.map((image: any) => ({
                id: image.id,
                preview: image.url,
                storageId: image.storageId,
                uploaded: true,
                uploading: false,
                url: image.url,
                isFromServer: true,
            }));

            const currentImages = getValues("images");

            // If there are no current images, set the server images directly
            if (currentImages.length === 0) {
                setValue("images", serverImages);
            } else {
                // Merge server images with current images, avoiding duplicates
                const mergedImages = [...currentImages];

                serverImages.forEach((serverImage) => {
                    const clientIndex = mergedImages.findIndex((clientImage) => clientImage.storageId === serverImage.storageId);

                    if (clientIndex !== -1) {
                        if (mergedImages[clientIndex].preview?.startsWith("blob:")) {
                            URL.revokeObjectURL(mergedImages[clientIndex].preview);
                        }

                        // Update existing image with server data
                        mergedImages[clientIndex] = serverImage;
                    }
                });

                setValue("images", mergedImages);
            }
        }
    }, [imagesGuide, getValues, setValue]);

    // Function to add a new image to the moodboard
    const addImage = (file: File) => {
        if (images.length >= 5) {
            toast.error("You can only add up to 5 images to the moodboard.");
            return;
        }

        // Create a new MoodboardImage object
        const newImage: MoodboardImage = {
            id: `${Date.now()}-${Math.random()}`,
            file,
            preview: URL.createObjectURL(file),
            uploaded: false,
            uploading: false,
            isFromServer: false,
        };

        // Update the images array in the form state
        const updatedImages = [...images, newImage];

        setValue("images", updatedImages);

        toast.success("Image added to moodboard.");
    };

    // Function to remove an image from the moodboard
    const removeImage = async (imageId: string) => {
        const imageToRemove = images.find((img) => img.id === imageId);

        if (!imageToRemove) return;

        // Remove the moodboard image from the storage
        if (imageToRemove.isFromServer && imageToRemove.storageId && projectId) {
            try {
                await removeMoodboardImage({
                    projectId: projectId as Id<"projects">,
                    storageId: imageToRemove.storageId as Id<"_storage">
                });
            } catch (error) {
                console.error("Error removing image from server:", error);
                toast.error("Failed to remove image from server.");
                return;
            }
        }

        const updatedImages = images.filter((img) => {
            if (img.id === imageId) {
                if (!img.isFromServer && img.preview.startsWith("blob:")) {
                    URL.revokeObjectURL(img.preview);
                }

                return false;
            }

            return true;
        });

        setValue("images", updatedImages);
        toast.success("Image removed from moodboard.");
    };

    // Function to handle drag events
    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // Set drag active state based on event type
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    // Function to handle drop events
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        // Extract files from the drop event
        const files = Array.from(e.dataTransfer.files);
        // Filter image files
        const imageFiles = files.filter((file) => file.type.startsWith("image/"));

        if (imageFiles.length === 0) {
            toast.error("Please upload valid image files.");
            return;
        }

        // Add each image file to the moodboard
        imageFiles.forEach((file) => {
            if (images.length < 5) {
                addImage(file);
            }
        });
    };

    // Function to handle file input changes
    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        // Add each selected file to the moodboard
        files.forEach((file) => addImage(file));

        // Reset the file input value to allow re-uploading the same file if needed
        e.target.value = "";
    };

    useEffect(() => {
        const uploadPendingImages = async () => {
            const currentImages = getValues("images");

            // Iterate over images to find those that need uploading
            for (let i = 0; i < currentImages.length; i++) {
                const image = currentImages[i];

                // Upload only if not already uploaded, not uploading, and no error
                if (!image.uploaded && !image.uploading && !image.error) {
                    const updatedImages = [...currentImages];

                    // Mark image as uploading
                    updatedImages[i] = { ...image, uploading: true };

                    setValue("images", updatedImages);

                    try {
                        // Upload the image and get the storage ID
                        const { storageId } = await uploadImage(image.file!);

                        const finalImages = getValues("images");

                        const finalIndex = finalImages.findIndex((img) => img.id === image.id);
                        
                        // Update the image with the storage ID and mark as uploaded
                        if (finalIndex !== -1) {
                            finalImages[finalIndex] = {
                                ...finalImages[finalIndex], // Re-fetch the image data
                                storageId,
                                uploaded: true, // Mark as uploaded
                                uploading: false,
                                isFromServer: true,
                            };

                            setValue("images", [...finalImages]);
                        }
                    } catch (error) {
                        console.error("Upload failed for image:", image.id, error);
                        const errorImages = getValues("images");
                        const errorIndex = errorImages.findIndex((img) => img.id === image.id);

                        // Update the image to reflect the upload error
                        if (errorIndex !== -1) {
                            errorImages[errorIndex] = {
                                ...errorImages[errorIndex],
                                uploading: false,
                                error: "Upload failed. Please try again."
                            };

                            setValue("images", [...errorImages]);
                        }
                    }
                }
            };
        };

        // Start uploading any pending images
        if (images.length > 0) {
            uploadPendingImages();
        }
    }, [images, getValues, setValue]);

    // Cleanup object URLs on unmount
    useEffect(() => {
        return () => {
            images.forEach((image) => {
                URL.revokeObjectURL(image.preview);
            });
        }
    }, []);

    return {
        form,
        images,
        dragActive,
        addImage,
        removeImage,
        handleDrag,
        handleDrop,
        handleFileInput,
        canAddMore: images.length < 5
    }
};