import { Palette } from "lucide-react";
import { MoodboardImagesQuery, StyleGuideQuery } from "@/app/convex/query.config";
import { StyleGuide } from "@/app/redux/api/style-guide";

import { TabsContent } from "@/components/ui/tabs";
import { ThemeContent } from "@/components/style/theme";
import StyleGuideTypography from "@/components/style/typography";
import Moodboard from "@/components/style/moodboard";

import { MoodboardImage } from "@/hooks/use-styles";

interface StyleGuidePageProps {
    searchParams: Promise<{
        project: string;
    }>
};

const StyleGuidePage = async ({ searchParams }: StyleGuidePageProps) => {
    const projectId = (await searchParams).project;

    // Fetch existing style guide data for the project
    const existingStyleGuide = await StyleGuideQuery(projectId);

    // Extract style guide data
    const guide = existingStyleGuide.styleGuide?._valueJSON as unknown as StyleGuide;

    // Color sections from the style guide
    const colorGuide = guide?.colorSections || [];

    // Typography sections from the style guide
    const typographyGuide = guide?.typographySections || [];

    // Fetch existing moodboard images for the project
    const existingMoodboardImages = await MoodboardImagesQuery(projectId);

    // Extract moodboard images
    const imagesGuide = existingMoodboardImages.images._valueJSON as unknown as MoodboardImage[];

    return (
        <div>
            {/* Moodboard Tab */}
            <TabsContent value="moodboard">
                <Moodboard imagesGuide={imagesGuide} />
            </TabsContent>
            {/* Colors Tab */}
            <TabsContent
                value="colors"
                className="space-y-8"
            >
                {!imagesGuide.length ? (
                    <div className="space-y-8">
                        <div className="text-center py-20">
                            <div className="w-14 h-14 mx-auto mb-4 rounded-lg bg-muted flex items-center justify-center">
                                <Palette className="w-7 h-7 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-medium text-foreground mb-2">
                                Your colors will appear here
                            </h3>
                            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                                Upload images to your moodboard to generate an AI-powered style guide with colors and typography.
                            </p>
                        </div>
                    </div>
                ) : (
                    <ThemeContent colorGuide={colorGuide} />
                )}
            </TabsContent>

            {/* Typography Tab */}
            <TabsContent value="typography">
                <StyleGuideTypography typographyGuide={typographyGuide} />
            </TabsContent>
        </div>
    );
}

export default StyleGuidePage;