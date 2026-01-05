// Interface for a single color swatch with name, hex code, and optional description
export interface ColorSwatch {
    name: string;
    hexCode: string;
    description?: string;
}

// Interface for a section of colors with a predefined title and array of swatches
export interface ColorSection {
    title: "Primary Colors" | "Secondary & Accent Colors" | "UI Component Colors" | "Utility & Form Colors" | "Status & Feedback Colors";
    swatches: ColorSwatch[];
}

// Interface for a typography style defining font properties and optional description
export interface TypographyStyle {
    name: string;
    fontFamily: string;
    fontSize: string;
    fontWeight: string;
    lineHeight: string;
    letterSpacing?: string;
    description?: string;
};

// Interface for a section of typography styles with a title and array of styles
export interface TypographySection {
    title: string;
    styles: TypographyStyle[];
};

// Interface for the overall style guide structure including theme, description, and sections
export interface StyleGuide {
    theme: string;
    description: string;
    colorSections: [
        ColorSection,
        ColorSection,
        ColorSection,
        ColorSection,
        ColorSection,
    ];
    typographySections: [TypographySection, TypographySection, TypographySection];
};