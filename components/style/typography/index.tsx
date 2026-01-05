import { Type } from "lucide-react";

interface StyleGuideTypographyProps {
    typographyGuide: any[];
}

const StyleGuideTypography = ({ typographyGuide }: StyleGuideTypographyProps) => {
    return (
        <>
            {typographyGuide.length === 0 ? (
                <div className="text-center py-20">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-lg bg-muted flex items-center justify-center">
                        <Type className="w-7 h-7 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">
                        Your typography will appear here
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                        Upload images to your moodboard to generate an AI-powered style guide with colors and typography.
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-10">
                    {typographyGuide.map((section: any, i: number) => (
                        <div
                            key={i}
                            className="flex flex-col gap-5"
                        >
                            <div>
                                <h3 className="text-lg font-medium text-foreground/50">
                                    {section.title}
                                </h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {section.styles?.map((style: any, styleIndex: number) => (
                                    <div
                                        key={styleIndex}
                                        className="p-6 rounded-2xl backdrop-blur-xl bg-white/[0.02] border border-white/[0.08] saturate-150"
                                    >
                                        <div className="space-y-4">
                                            <h4 className="text-lg font-medium text-foreground mb-1">
                                                {style.name}
                                            </h4>
                                            {style.description && (
                                                <p className="text-sm text-muted-foreground">
                                                    {style.description}
                                                </p>
                                            )}
                                        </div>

                                        <div
                                          className="text-foreground"
                                          style={{
                                            fontFamily: style.fontFamily,
                                            fontSize: style.fontSize,
                                            fontWeight: style.fontWeight,
                                            lineHeight: style.lineHeight,
                                            letterSpacing: style.letterSpacing || "normal"
                                          }}
                                        >
                                            The quick brown fox jumps over the lazy dog.
                                        </div>

                                        <div className="text-xs text-muted-foreground space-y-1">
                                            <div>
                                                Font: {style.fontFamily}
                                            </div>
                                            <div>
                                                Size: {style.fontSize}px
                                            </div>
                                            <div>
                                                Weight: {style.fontWeight}
                                            </div>
                                            <div>
                                                Line Height: {style.lineHeight}
                                            </div>
                                            {style.letterSpacing && (
                                                <div>
                                                    Letter Spacing: {style.letterSpacing}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}

export default StyleGuideTypography;