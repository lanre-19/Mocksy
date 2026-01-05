import ColorSwatch from "../swatch";

import { cn } from "@/lib/utils";

interface ColorThemeProps {
    title: string;
    swatches: Array<{
        name: string;
        hexColor: string;
        description?: string;
    }>;
    className?: string;
}

export const ColorTheme = ({ title, swatches, className }: ColorThemeProps) => {
    return (
        <div className={cn(
            "flex flex-col gap-5",
            className
        )}>
            <div>
                <h3 className="text-lg font-medium text-foreground/50">
                    {title}
                </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {swatches.map((swatch) => (
                    <div key={swatch.name}>
                        <ColorSwatch
                          name={swatch.name}
                          value={swatch.hexColor}
                        />
                        {swatch.description && (
                            <p className="text-xs text-muted-foreground mt-2">
                                {swatch.description}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export const ThemeContent = ({ colorGuide }: { colorGuide: any[] }) => {
    return (
        <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-10">
                {colorGuide.map ((section: any, i: number) => {
                    return (
                        <ColorTheme
                          key={i}
                          title={section.title}
                          swatches={section.swatches}
                        />
                    )
                })}
            </div>
        </div>
    );
};