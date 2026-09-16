import { Button,Input,Label,Select,SelectContent,SelectItem,SelectTrigger,SelectValue } from "@oja/ui";
import { X } from "lucide-react";

import type { ThemeConfig } from "@/types/storefront.design";

interface ThemeEditorProps {
  theme: ThemeConfig;
  onUpdate: (theme: ThemeConfig) => void;
  onClose: () => void;
}

/**
 * Theme customization panel
 * Edit colors, fonts, and border radius
 */
export function ThemeEditor({ theme, onUpdate, onClose }: ThemeEditorProps) {
  const updateColor = (key: keyof ThemeConfig["colors"], value: string) => {
    onUpdate({
      ...theme,
      colors: { ...theme.colors, [key]: value },
    });
  };

  const updateFont = (key: keyof ThemeConfig["fonts"], value: string) => {
    onUpdate({
      ...theme,
      fonts: { ...theme.fonts, [key]: value },
    });
  };

  const updateBorderRadius = (value: ThemeConfig["borderRadius"]) => {
    onUpdate({
      ...theme,
      borderRadius: value,
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between bg-white sticky top-0 z-10">
        <div>
          <h3 className="font-bold">Theme Settings</h3>
          <p className="text-xs text-gray-600">
            Customize your storefront design
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* Colors */}
        <div>
          <h4 className="font-medium mb-4">Colors</h4>
          <div className="space-y-3">
            <ColorInput
              label="Primary"
              value={theme.colors.primary}
              onChange={(value) => updateColor("primary", value)}
            />
            <ColorInput
              label="Secondary"
              value={theme.colors.secondary}
              onChange={(value) => updateColor("secondary", value)}
            />
            <ColorInput
              label="Accent"
              value={theme.colors.accent}
              onChange={(value) => updateColor("accent", value)}
            />
            <ColorInput
              label="Background"
              value={theme.colors.background}
              onChange={(value) => updateColor("background", value)}
            />
            <ColorInput
              label="Text"
              value={theme.colors.text}
              onChange={(value) => updateColor("text", value)}
            />
            <ColorInput
              label="Text Secondary"
              value={theme.colors.textSecondary}
              onChange={(value) => updateColor("textSecondary", value)}
            />
          </div>
        </div>

        {/* Fonts */}
        <div className="border-t pt-6">
          <h4 className="font-medium mb-4">Typography</h4>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Heading Font</Label>
              <Select
                value={theme.fonts.heading}
                onValueChange={(value) => updateFont("heading", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="system-ui, -apple-system, sans-serif">
                    System UI
                  </SelectItem>
                  <SelectItem value="'Inter', sans-serif">Inter</SelectItem>
                  <SelectItem value="'Playfair Display', serif">
                    Playfair Display
                  </SelectItem>
                  <SelectItem value="'Montserrat', sans-serif">
                    Montserrat
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Body Font</Label>
              <Select
                value={theme.fonts.body}
                onValueChange={(value) => updateFont("body", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="system-ui, -apple-system, sans-serif">
                    System UI
                  </SelectItem>
                  <SelectItem value="'Inter', sans-serif">Inter</SelectItem>
                  <SelectItem value="'Open Sans', sans-serif">
                    Open Sans
                  </SelectItem>
                  <SelectItem value="'Lato', sans-serif">Lato</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Border Radius */}
        <div className="border-t pt-6">
          <h4 className="font-medium mb-4">Border Radius</h4>
          <Select value={theme.borderRadius} onValueChange={updateBorderRadius}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="none">None (Sharp corners)</SelectItem>
              <SelectItem value="small">Small (0.25rem)</SelectItem>
              <SelectItem value="medium">Medium (0.5rem)</SelectItem>
              <SelectItem value="large">Large (1rem)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Preview */}
        <div className="border-t pt-6">
          <h4 className="font-medium mb-4">Preview</h4>
          <div
            className="p-4 rounded border"
            style={{ backgroundColor: theme.colors.background }}
          >
            <h3
              className="text-xl font-bold mb-2"
              style={{
                color: theme.colors.primary,
                fontFamily: theme.fonts.heading,
              }}
            >
              Heading Example
            </h3>
            <p
              className="mb-3"
              style={{
                color: theme.colors.text,
                fontFamily: theme.fonts.body,
              }}
            >
              This is body text showing how your theme looks.
            </p>
            <button
              className="px-4 py-2 font-medium"
              style={{
                backgroundColor: theme.colors.primary,
                color: "#ffffff",
                borderRadius:
                  theme.borderRadius === "none"
                    ? "0"
                    : theme.borderRadius === "small"
                      ? "0.25rem"
                      : theme.borderRadius === "medium"
                        ? "0.5rem"
                        : "1rem",
              }}
            >
              Button
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <Label className="text-xs">{label}</Label>
        <div className="flex gap-2 mt-1">
          <Input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-16 h-10 p-1 cursor-pointer"
          />
          <Input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 font-mono text-sm"
            placeholder="#000000"
          />
        </div>
      </div>
    </div>
  );
}
