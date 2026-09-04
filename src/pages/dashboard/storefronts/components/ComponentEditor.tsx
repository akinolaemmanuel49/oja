import { useState } from "react";
import { Button,Input,Label,Select,SelectContent,SelectItem,SelectTrigger,SelectValue,Switch,Card } from "@oja/ui";
import { X, Upload, Trash2, Plus } from "lucide-react";

import type { PageComponent } from "@/types/storefront.design";
import { uploadImageToCloudinary } from "@/lib/cloudinaryUpload";
import { RichTextEditor } from "./RichTextEditor";

// ──────────────────────────────────────────────────────
// Shell
// ──────────────────────────────────────────────────────

interface ComponentEditorProps {
  component: PageComponent;
  onUpdate: (data: PageComponent["data"]) => void;
  onClose: () => void;
}

export function ComponentEditor({
  component,
  onUpdate,
  onClose,
}: ComponentEditorProps) {
  const updateData = (updates: Partial<PageComponent["data"]>) => {
    onUpdate({ ...component.data, ...updates } as PageComponent["data"]);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b flex items-center justify-between bg-white sticky top-0 z-10">
        <div>
          <h3 className="font-bold">Edit Component</h3>
          <p className="text-xs text-gray-600 capitalize">
            {component.type.replace(/_/g, " ")}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-6">
        {component.type === "hero" && (
          <HeroEditor data={component.data} onUpdate={updateData} />
        )}
        {component.type === "banner" && (
          <BannerEditor data={component.data} onUpdate={updateData} />
        )}
        {component.type === "text" && (
          <TextEditor data={component.data} onUpdate={updateData} />
        )}
        {component.type === "product_grid" && (
          <ProductGridEditor data={component.data} onUpdate={updateData} />
        )}
        {component.type === "product_carousel" && (
          <ProductCarouselEditor data={component.data} onUpdate={updateData} />
        )}
        {component.type === "image_gallery" && (
          <ImageGalleryEditor data={component.data} onUpdate={updateData} />
        )}
        {component.type === "spacer" && (
          <SpacerEditor data={component.data} onUpdate={updateData} />
        )}
        {component.type === "products_header" && (
          <ProductsHeaderEditor data={component.data} onUpdate={updateData} />
        )}
        {component.type === "products_filter_bar" && (
          <ProductsFilterBarEditor
            data={component.data}
            onUpdate={updateData}
          />
        )}
        {component.type === "product_images" && (
          <ProductImagesEditor data={component.data} onUpdate={updateData} />
        )}
        {component.type === "product_info" && (
          <ProductInfoEditor data={component.data} onUpdate={updateData} />
        )}
        {component.type === "product_tabs" && (
          <ProductTabsEditor data={component.data} onUpdate={updateData} />
        )}
        {component.type === "related_products" && (
          <RelatedProductsEditor data={component.data} onUpdate={updateData} />
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────
// SHARED COMPONENT EDITORS (unchanged from original)
// ──────────────────────────────────────────────────────

function HeroEditor({
  data,
  onUpdate,
}: {
  data: Extract<PageComponent, { type: "hero" }>["data"];
  onUpdate: (
    u: Partial<Extract<PageComponent, { type: "hero" }>["data"]>,
  ) => void;
}) {
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      onUpdate({ backgroundImage: await uploadImageToCloudinary(file) });
    } catch {
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Title</Label>
        <Input
          value={data.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
        />
      </div>
      <div>
        <Label>Subtitle (optional)</Label>
        <Input
          value={data.subtitle ?? ""}
          onChange={(e) => onUpdate({ subtitle: e.target.value })}
        />
      </div>

      <div>
        <Label>Background Image</Label>
        {data.backgroundImage ? (
          <div className="mt-2 relative">
            <img
              src={data.backgroundImage}
              alt="Background"
              className="w-full h-32 object-cover rounded"
            />
            <Button
              size="sm"
              variant="destructive"
              className="absolute top-2 right-2"
              onClick={() => onUpdate({ backgroundImage: undefined })}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <label className="mt-2 block">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              className="hidden"
            />
            <div className="border-2 border-dashed rounded p-4 text-center cursor-pointer hover:bg-gray-50">
              <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">
                {uploading ? "Uploading..." : "Click to upload"}
              </p>
            </div>
          </label>
        )}
      </div>

      <div>
        <Label>Background Color</Label>
        <Input
          type="color"
          value={data.backgroundColor ?? "#1e293b"}
          onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
        />
      </div>
      <div>
        <Label>Text Color</Label>
        <Input
          type="color"
          value={data.textColor}
          onChange={(e) => onUpdate({ textColor: e.target.value })}
        />
      </div>

      <div>
        <Label>Height</Label>
        <Select
          value={data.height}
          onValueChange={(v) => onUpdate({ height: v as typeof data.height })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="small">Small (300px)</SelectItem>
            <SelectItem value="medium">Medium (500px)</SelectItem>
            <SelectItem value="large">Large (700px)</SelectItem>
            <SelectItem value="full">Full Screen</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Text Alignment</Label>
        <Select
          value={data.textAlign}
          onValueChange={(v) =>
            onUpdate({ textAlign: v as typeof data.textAlign })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="left">Left</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="right">Right</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-2">
          <Label>Overlay</Label>
          <Switch
            className="bg-black data-[state=checked]:bg-black [&>span]:bg-white"
            checked={data.overlay?.enabled ?? false}
            onCheckedChange={(checked) =>
              onUpdate({
                overlay: {
                  color: "#000000",
                  opacity: 40,
                  ...data.overlay,
                  enabled: checked,
                },
              })
            }
          />
        </div>
        {data.overlay?.enabled && (
          <div className="space-y-2 mt-2">
            <div>
              <Label className="text-xs">Color</Label>
              <Input
                type="color"
                value={data.overlay.color}
                onChange={(e) =>
                  onUpdate({
                    overlay: { ...data.overlay!, color: e.target.value },
                  })
                }
              />
            </div>
            <div>
              <Label className="text-xs">
                Opacity ({data.overlay.opacity}%)
              </Label>
              <Input
                type="range"
                min="0"
                max="100"
                value={data.overlay.opacity}
                onChange={(e) =>
                  onUpdate({
                    overlay: {
                      ...data.overlay!,
                      opacity: Number(e.target.value),
                    },
                  })
                }
              />
            </div>
          </div>
        )}
      </div>

      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-2">
          <Label>CTA Button</Label>
          <Switch
            className="bg-black data-[state=checked]:bg-black [&>span]:bg-white"
            checked={data.cta?.enabled ?? false}
            onCheckedChange={(checked) =>
              onUpdate({
                cta: {
                  text: "Shop Now",
                  url: "/products",
                  style: "primary",
                  ...data.cta,
                  enabled: checked,
                },
              })
            }
          />
        </div>
        {data.cta?.enabled && (
          <div className="space-y-2 mt-2">
            <div>
              <Label className="text-xs">Button Text</Label>
              <Input
                value={data.cta.text}
                onChange={(e) =>
                  onUpdate({ cta: { ...data.cta!, text: e.target.value } })
                }
              />
            </div>
            <div>
              <Label className="text-xs">Button URL</Label>
              <Input
                value={data.cta.url ?? ""}
                onChange={(e) =>
                  onUpdate({ cta: { ...data.cta!, url: e.target.value } })
                }
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BannerEditor({
  data,
  onUpdate,
}: {
  data: Extract<PageComponent, { type: "banner" }>["data"];
  onUpdate: (
    u: Partial<Extract<PageComponent, { type: "banner" }>["data"]>,
  ) => void;
}) {
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      onUpdate({
        images: [
          ...data.images,
          { url: await uploadImageToCloudinary(file), alt: file.name },
        ],
      });
    } catch {
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Images</Label>
        <div className="space-y-2 mt-2">
          {data.images.map((img, index) => (
            <Card key={index} className="p-2">
              <img
                src={img.url}
                alt={img.alt ?? ""}
                className="w-full h-20 object-cover rounded mb-2"
              />
              <Input
                placeholder="Click-through URL (optional)"
                value={img.link ?? ""}
                onChange={(e) => {
                  const updated = [...data.images];
                  updated[index] = { ...updated[index], link: e.target.value };
                  onUpdate({ images: updated });
                }}
                className="text-xs mb-2"
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  onUpdate({
                    images: data.images.filter((_, i) => i !== index),
                  })
                }
                className="w-full text-red-600"
              >
                <Trash2 className="h-3 w-3 mr-1" /> Remove
              </Button>
            </Card>
          ))}
          <label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              className="hidden"
            />
            <div className="border-2 border-dashed rounded p-4 text-center cursor-pointer hover:bg-gray-50">
              <Plus className="h-6 w-6 mx-auto mb-1 text-gray-400" />
              <p className="text-xs text-gray-600">
                {uploading ? "Uploading..." : "Add Image"}
              </p>
            </div>
          </label>
        </div>
      </div>
      <div>
        <Label>Height</Label>
        <Select
          value={data.height}
          onValueChange={(v) => onUpdate({ height: v as typeof data.height })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="small">Small (300px)</SelectItem>
            <SelectItem value="medium">Medium (500px)</SelectItem>
            <SelectItem value="large">Large (700px)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-between">
        <Label>Auto-play</Label>
        <Switch
          className="bg-black data-[state=checked]:bg-black [&>span]:bg-white"
          checked={data.autoPlay}
          onCheckedChange={(c) => onUpdate({ autoPlay: c })}
        />
      </div>
      {data.autoPlay && (
        <div>
          <Label>Interval (seconds)</Label>
          <Input
            type="number"
            value={data.interval / 1000}
            onChange={(e) =>
              onUpdate({ interval: Number(e.target.value) * 1000 })
            }
            min="1"
          />
        </div>
      )}
      <div className="flex items-center justify-between">
        <Label>Show Dots</Label>
        <Switch
          className="bg-black data-[state=checked]:bg-black [&>span]:bg-white"
          checked={data.showDots}
          onCheckedChange={(c) => onUpdate({ showDots: c })}
        />
      </div>
      <div className="flex items-center justify-between">
        <Label>Show Arrows</Label>
        <Switch
          className="bg-black data-[state=checked]:bg-black [&>span]:bg-white"
          checked={data.showArrows}
          onCheckedChange={(c) => onUpdate({ showArrows: c })}
        />
      </div>
    </div>
  );
}

function TextEditor({
  data,
  onUpdate,
}: {
  data: Extract<PageComponent, { type: "text" }>["data"];
  onUpdate: (
    u: Partial<Extract<PageComponent, { type: "text" }>["data"]>,
  ) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Content</Label>
        <RichTextEditor
          value={data.content}
          onChange={(content) => onUpdate({ content })}
        />
      </div>
      <div>
        <Label>Max Width</Label>
        <Select
          value={data.maxWidth}
          onValueChange={(v) =>
            onUpdate({ maxWidth: v as typeof data.maxWidth })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="full">Full Width</SelectItem>
            <SelectItem value="narrow">Narrow (640px)</SelectItem>
            <SelectItem value="medium">Medium (768px)</SelectItem>
            <SelectItem value="wide">Wide (1024px)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Text Alignment</Label>
        <Select
          value={data.textAlign}
          onValueChange={(v) =>
            onUpdate({ textAlign: v as typeof data.textAlign })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="left">Left</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="right">Right</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Padding</Label>
        <Select
          value={data.padding}
          onValueChange={(v) => onUpdate({ padding: v as typeof data.padding })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="small">Small</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="large">Large</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Background Color (optional)</Label>
        <div className="flex gap-2">
          <Input
            type="color"
            value={data.backgroundColor ?? "#ffffff"}
            onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
          />
          {data.backgroundColor && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUpdate({ backgroundColor: undefined })}
            >
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function ProductGridEditor({
  data,
  onUpdate,
}: {
  data: Extract<PageComponent, { type: "product_grid" }>["data"];
  onUpdate: (
    u: Partial<Extract<PageComponent, { type: "product_grid" }>["data"]>,
  ) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Title (optional)</Label>
        <Input
          value={data.title ?? ""}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Featured Products"
        />
      </div>
      <div>
        <Label>Columns</Label>
        <Select
          value={String(data.columns)}
          onValueChange={(v) =>
            onUpdate({ columns: Number(v) as 2 | 3 | 4 | 5 | 6 })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="2">2</SelectItem>
            <SelectItem value="3">3</SelectItem>
            <SelectItem value="4">4</SelectItem>
            <SelectItem value="5">5</SelectItem>
            <SelectItem value="6">6</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Max Products</Label>
        <Input
          type="number"
          value={data.limit}
          onChange={(e) => onUpdate({ limit: Number(e.target.value) })}
          min="1"
          max="100"
        />
      </div>
      <div>
        <Label>Sort Order</Label>
        <SortOrderSelect
          value={data.sortOrder}
          onValueChange={(v) => onUpdate({ sortOrder: v })}
        />
      </div>
      <div>
        <Label>Card Style</Label>
        <Select
          value={data.cardStyle}
          onValueChange={(v) =>
            onUpdate({ cardStyle: v as typeof data.cardStyle })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="minimal">Minimal</SelectItem>
            <SelectItem value="bordered">Bordered</SelectItem>
            <SelectItem value="shadow">Shadow</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Spacing</Label>
        <Select
          value={data.spacing}
          onValueChange={(v) => onUpdate({ spacing: v as typeof data.spacing })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="compact">Compact</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="relaxed">Relaxed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-between">
        <Label>Show Price</Label>
        <Switch
          className="bg-black data-[state=checked]:bg-black [&>span]:bg-white"
          checked={data.showPrice}
          onCheckedChange={(c) => onUpdate({ showPrice: c })}
        />
      </div>
      <div className="flex items-center justify-between">
        <Label>Show SKU</Label>
        <Switch
          className="bg-black data-[state=checked]:bg-black [&>span]:bg-white"
          checked={data.showSku}
          onCheckedChange={(c) => onUpdate({ showSku: c })}
        />
      </div>
    </div>
  );
}

function ProductCarouselEditor({
  data,
  onUpdate,
}: {
  data: Extract<PageComponent, { type: "product_carousel" }>["data"];
  onUpdate: (
    u: Partial<Extract<PageComponent, { type: "product_carousel" }>["data"]>,
  ) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Title (optional)</Label>
        <Input
          value={data.title ?? ""}
          onChange={(e) => onUpdate({ title: e.target.value })}
        />
      </div>
      <div>
        <Label>Max Products</Label>
        <Input
          type="number"
          value={data.limit}
          onChange={(e) => onUpdate({ limit: Number(e.target.value) })}
          min="1"
          max="50"
        />
      </div>
      <div>
        <Label>Items Per View</Label>
        <Select
          value={String(data.itemsPerView)}
          onValueChange={(v) =>
            onUpdate({ itemsPerView: Number(v) as 2 | 3 | 4 | 5 })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="2">2</SelectItem>
            <SelectItem value="3">3</SelectItem>
            <SelectItem value="4">4</SelectItem>
            <SelectItem value="5">5</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Sort Order</Label>
        <SortOrderSelect
          value={data.sortOrder}
          onValueChange={(v) => onUpdate({ sortOrder: v })}
        />
      </div>
      <div className="flex items-center justify-between">
        <Label>Auto-play</Label>
        <Switch
          className="bg-black data-[state=checked]:bg-black [&>span]:bg-white"
          checked={data.autoPlay}
          onCheckedChange={(c) => onUpdate({ autoPlay: c })}
        />
      </div>
      {data.autoPlay && (
        <div>
          <Label>Interval (seconds)</Label>
          <Input
            type="number"
            value={data.interval / 1000}
            onChange={(e) =>
              onUpdate({ interval: Number(e.target.value) * 1000 })
            }
            min="1"
          />
        </div>
      )}
      <div className="flex items-center justify-between">
        <Label>Show Price</Label>
        <Switch
          className="bg-black data-[state=checked]:bg-black [&>span]:bg-white"
          checked={data.showPrice}
          onCheckedChange={(c) => onUpdate({ showPrice: c })}
        />
      </div>
      <div className="flex items-center justify-between">
        <Label>Show SKU</Label>
        <Switch
          className="bg-black data-[state=checked]:bg-black [&>span]:bg-white"
          checked={data.showSku}
          onCheckedChange={(c) => onUpdate({ showSku: c })}
        />
      </div>
    </div>
  );
}

function ImageGalleryEditor({
  data,
  onUpdate,
}: {
  data: Extract<PageComponent, { type: "image_gallery" }>["data"];
  onUpdate: (
    u: Partial<Extract<PageComponent, { type: "image_gallery" }>["data"]>,
  ) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      onUpdate({
        images: [
          ...data.images,
          { url: await uploadImageToCloudinary(file), alt: file.name },
        ],
      });
    } catch {
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };
  return (
    <div className="space-y-4">
      <div>
        <Label>Images</Label>
        <div className="space-y-2 mt-2">
          {data.images.map((img, index) => (
            <Card key={index} className="p-2">
              <img
                src={img.url}
                alt={img.alt ?? ""}
                className="w-full h-20 object-cover rounded mb-2"
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  onUpdate({
                    images: data.images.filter((_, i) => i !== index),
                  })
                }
                className="w-full text-red-600"
              >
                <Trash2 className="h-3 w-3 mr-1" /> Remove
              </Button>
            </Card>
          ))}
          <label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              className="hidden"
            />
            <div className="border-2 border-dashed rounded p-4 text-center cursor-pointer hover:bg-gray-50">
              <Plus className="h-6 w-6 mx-auto mb-1 text-gray-400" />
              <p className="text-xs text-gray-600">
                {uploading ? "Uploading..." : "Add Image"}
              </p>
            </div>
          </label>
        </div>
      </div>
      <div>
        <Label>Layout</Label>
        <Select
          value={data.layout}
          onValueChange={(v) => onUpdate({ layout: v as typeof data.layout })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="grid">Grid</SelectItem>
            <SelectItem value="masonry">Masonry</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Columns</Label>
        <Select
          value={String(data.columns)}
          onValueChange={(v) => onUpdate({ columns: Number(v) as 2 | 3 | 4 })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="2">2</SelectItem>
            <SelectItem value="3">3</SelectItem>
            <SelectItem value="4">4</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Gap</Label>
        <Select
          value={data.gap}
          onValueChange={(v) => onUpdate({ gap: v as typeof data.gap })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="small">Small</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="large">Large</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function SpacerEditor({
  data,
  onUpdate,
}: {
  data: Extract<PageComponent, { type: "spacer" }>["data"];
  onUpdate: (
    u: Partial<Extract<PageComponent, { type: "spacer" }>["data"]>,
  ) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Height</Label>
        <Select
          value={data.height}
          onValueChange={(v) => onUpdate({ height: v as typeof data.height })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="small">Small (1rem)</SelectItem>
            <SelectItem value="medium">Medium (2rem)</SelectItem>
            <SelectItem value="large">Large (4rem)</SelectItem>
            <SelectItem value="xlarge">X-Large (6rem)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────
// PRODUCTS PAGE EDITORS
// ──────────────────────────────────────────────────────

function ProductsHeaderEditor({
  data,
  onUpdate,
}: {
  data: Extract<PageComponent, { type: "products_header" }>["data"];
  onUpdate: (
    u: Partial<Extract<PageComponent, { type: "products_header" }>["data"]>,
  ) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Page Title</Label>
        <Input
          value={data.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
        />
      </div>
      <div>
        <Label>Subtitle (optional)</Label>
        <Input
          value={data.subtitle ?? ""}
          onChange={(e) => onUpdate({ subtitle: e.target.value })}
          placeholder="Browse our catalogue"
        />
      </div>
      <div>
        <Label>Default Sort Order</Label>
        <SortOrderSelect
          value={data.defaultSortOrder}
          onValueChange={(v) => onUpdate({ defaultSortOrder: v })}
        />
      </div>
      <div className="flex items-center justify-between">
        <Label>Show Result Count</Label>
        <Switch
          className="bg-black data-[state=checked]:bg-black [&>span]:bg-white"
          checked={data.showResultCount}
          onCheckedChange={(c) => onUpdate({ showResultCount: c })}
        />
      </div>
      <div className="flex items-center justify-between">
        <Label>Show Sort Dropdown</Label>
        <Switch
          className="bg-black data-[state=checked]:bg-black [&>span]:bg-white"
          checked={data.showSortDropdown}
          onCheckedChange={(c) => onUpdate({ showSortDropdown: c })}
        />
      </div>
    </div>
  );
}

function ProductsFilterBarEditor({
  data,
  onUpdate,
}: {
  data: Extract<PageComponent, { type: "products_filter_bar" }>["data"];
  onUpdate: (
    u: Partial<Extract<PageComponent, { type: "products_filter_bar" }>["data"]>,
  ) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Price Filter</Label>
        <Switch
          className="bg-black data-[state=checked]:bg-black [&>span]:bg-white"
          checked={data.showPriceFilter}
          onCheckedChange={(c) => onUpdate({ showPriceFilter: c })}
        />
      </div>
      <div className="flex items-center justify-between">
        <Label>Type Filter (simple/variable)</Label>
        <Switch
          className="bg-black data-[state=checked]:bg-black [&>span]:bg-white"
          checked={data.showTypeFilter}
          onCheckedChange={(c) => onUpdate({ showTypeFilter: c })}
        />
      </div>
      <div>
        <Label>Filter Position</Label>
        <Select
          value={data.filterPosition}
          onValueChange={(v) =>
            onUpdate({ filterPosition: v as typeof data.filterPosition })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="top">Top (horizontal)</SelectItem>
            <SelectItem value="side">Side (vertical)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-between">
        <Label>Sticky on scroll</Label>
        <Switch
          className="bg-black data-[state=checked]:bg-black [&>span]:bg-white"
          checked={data.sticky}
          onCheckedChange={(c) => onUpdate({ sticky: c })}
        />
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────
// PRODUCT DETAIL EDITORS
// ──────────────────────────────────────────────────────

function ProductImagesEditor({
  data,
  onUpdate,
}: {
  data: Extract<PageComponent, { type: "product_images" }>["data"];
  onUpdate: (
    u: Partial<Extract<PageComponent, { type: "product_images" }>["data"]>,
  ) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Gallery Layout</Label>
        <Select
          value={data.layout}
          onValueChange={(v) => onUpdate({ layout: v as typeof data.layout })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="stack">Stack (single image)</SelectItem>
            <SelectItem value="grid">Grid</SelectItem>
            <SelectItem value="carousel">Carousel</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Image Aspect Ratio</Label>
        <Select
          value={data.mainImageAspect}
          onValueChange={(v) =>
            onUpdate({ mainImageAspect: v as typeof data.mainImageAspect })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="square">Square (1:1)</SelectItem>
            <SelectItem value="portrait">Portrait (3:4)</SelectItem>
            <SelectItem value="landscape">Landscape (16:9)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-between">
        <Label>Show Thumbnails</Label>
        <Switch
          className="bg-black data-[state=checked]:bg-black [&>span]:bg-white"
          checked={data.showThumbnails}
          onCheckedChange={(c) => onUpdate({ showThumbnails: c })}
        />
      </div>
      {data.showThumbnails && (
        <div>
          <Label>Thumbnail Position</Label>
          <Select
            value={data.thumbnailPosition}
            onValueChange={(v) =>
              onUpdate({
                thumbnailPosition: v as typeof data.thumbnailPosition,
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="bottom">Bottom</SelectItem>
              <SelectItem value="left">Left</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="flex items-center justify-between">
        <Label>Zoom on hover</Label>
        <Switch
          className="bg-black data-[state=checked]:bg-black [&>span]:bg-white"
          checked={data.zoomOnHover}
          onCheckedChange={(c) => onUpdate({ zoomOnHover: c })}
        />
      </div>
      <div className="flex items-center justify-between">
        <Label>Prev / Next arrows</Label>
        <Switch
          className="bg-black data-[state=checked]:bg-black [&>span]:bg-white"
          checked={data.showNavigation}
          onCheckedChange={(c) => onUpdate({ showNavigation: c })}
        />
      </div>
      <div className="flex items-center justify-between">
        <Label>Image counter</Label>
        <Switch
          className="bg-black data-[state=checked]:bg-black [&>span]:bg-white"
          checked={data.showCounter}
          onCheckedChange={(c) => onUpdate({ showCounter: c })}
        />
      </div>
      <div>
        <Label>Click to zoom</Label>
        <Select
          value={data.zoomOnClick}
          onValueChange={(v) =>
            onUpdate({ zoomOnClick: v as typeof data.zoomOnClick })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="click">Single click</SelectItem>
            <SelectItem value="double-click">Double click</SelectItem>
            <SelectItem value="none">Disabled</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function ProductInfoEditor({
  data,
  onUpdate,
}: {
  data: Extract<PageComponent, { type: "product_info" }>["data"];
  onUpdate: (
    u: Partial<Extract<PageComponent, { type: "product_info" }>["data"]>,
  ) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Add to Cart Button Text</Label>
        <Input
          value={data.addToCartButtonText}
          onChange={(e) => onUpdate({ addToCartButtonText: e.target.value })}
        />
      </div>
      <div>
        <Label>Price Position</Label>
        <Select
          value={data.pricePosition}
          onValueChange={(v) =>
            onUpdate({ pricePosition: v as typeof data.pricePosition })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="below_name">Below product name</SelectItem>
            <SelectItem value="above_cart">Above add-to-cart</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-between">
        <Label>Show SKU</Label>
        <Switch
          className="bg-black data-[state=checked]:bg-black [&>span]:bg-white"
          checked={data.showSku}
          onCheckedChange={(c) => onUpdate({ showSku: c })}
        />
      </div>
      <div className="flex items-center justify-between">
        <Label>Show Stock Status</Label>
        <Switch
          className="bg-black data-[state=checked]:bg-black [&>span]:bg-white"
          checked={data.showStockStatus}
          onCheckedChange={(c) => onUpdate({ showStockStatus: c })}
        />
      </div>
      <div className="flex items-center justify-between">
        <Label>Show Variant Selector</Label>
        <Switch
          className="bg-black data-[state=checked]:bg-black [&>span]:bg-white"
          checked={data.showVariantSelector}
          onCheckedChange={(c) => onUpdate({ showVariantSelector: c })}
        />
      </div>
      {data.showVariantSelector && (
        <div>
          <Label>Variant Selector Style</Label>
          <Select
            value={data.variantSelectorStyle}
            onValueChange={(v) =>
              onUpdate({
                variantSelectorStyle: v as typeof data.variantSelectorStyle,
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="buttons">Buttons</SelectItem>
              <SelectItem value="dropdown">Dropdown</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="flex items-center justify-between">
        <Label>Show Quantity Selector</Label>
        <Switch
          className="bg-black data-[state=checked]:bg-black [&>span]:bg-white"
          checked={data.showQuantitySelector}
          onCheckedChange={(c) => onUpdate({ showQuantitySelector: c })}
        />
      </div>
      <div className="flex items-center justify-between">
        <Label>Show Share Buttons</Label>
        <Switch
          className="bg-black data-[state=checked]:bg-black [&>span]:bg-white"
          checked={data.showShareButtons}
          onCheckedChange={(c) => onUpdate({ showShareButtons: c })}
        />
      </div>
    </div>
  );
}

function ProductTabsEditor({
  data,
  onUpdate,
}: {
  data: Extract<PageComponent, { type: "product_tabs" }>["data"];
  onUpdate: (
    u: Partial<Extract<PageComponent, { type: "product_tabs" }>["data"]>,
  ) => void;
}) {
  const [editingTabId, setEditingTabId] = useState<string | null>(null);

  const updateTab = (id: string, updates: Partial<(typeof data.tabs)[0]>) => {
    onUpdate({
      tabs: data.tabs.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    });
  };
  // const addTab = () => {
  //   const newId = `tab-${Date.now()}`;
  //   onUpdate({
  //     tabs: [
  //       ...data.tabs,
  //       {
  //         id: newId,
  //         label: "New Tab",
  //         content: "<p>Content here...</p>",
  //         enabled: true,
  //       },
  //     ],
  //   });
  //   setEditingTabId(newId);
  // };
  // const removeTab = (id: string) => {
  //   onUpdate({ tabs: data.tabs.filter((t) => t.id !== id) });
  //   if (editingTabId === id) setEditingTabId(null);
  // };

  return (
    <div className="space-y-4">
      <div>
        <Label>Tab Style</Label>
        <Select
          value={data.tabStyle}
          onValueChange={(v) =>
            onUpdate({ tabStyle: v as typeof data.tabStyle })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="underline">Underline</SelectItem>
            <SelectItem value="pills">Pills</SelectItem>
            <SelectItem value="boxed">Boxed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border-t pt-4">
        <Label className="mb-2 block">Tabs</Label>
        <div className="space-y-2">
          {data.tabs.map((tab) => (
            <div key={tab.id} className="border rounded overflow-hidden">
              {/* Tab header row */}
              <div className="flex items-center gap-2 p-2 bg-gray-50">
                <Switch
                  className="bg-black data-[state=checked]:bg-black [&>span]:bg-white"
                  checked={tab.enabled}
                  onCheckedChange={(c) => updateTab(tab.id, { enabled: c })}
                />
                <Input
                  value={tab.label}
                  onChange={(e) => updateTab(tab.id, { label: e.target.value })}
                  className="h-7 text-sm flex-1"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    setEditingTabId(editingTabId === tab.id ? null : tab.id)
                  }
                  className="h-7 px-2 text-xs"
                >
                  {editingTabId === tab.id ? "Done" : "Edit"}
                </Button>
                {/*<Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeTab(tab.id)}
                  className="h-7 w-7 p-0 text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>*/}
              </div>
              {/* Content editor — only shown when tab is being edited */}
              {editingTabId === tab.id && (
                <div className="p-2 border-t">
                  <RichTextEditor
                    value={tab.content}
                    onChange={(content) => updateTab(tab.id, { content })}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
        {/*<Button
          size="sm"
          variant="outline"
          onClick={addTab}
          className="mt-2 w-full"
        >
          <Plus className="h-3 w-3 mr-1" /> Add Tab
        </Button>*/}
      </div>

      {/*{data.tabs.length > 0 && (
        <div>
          <Label>Default Open Tab</Label>
          <Select
            value={data.defaultTab}
            onValueChange={(v) => onUpdate({ defaultTab: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {data.tabs
                .filter((t) => t.enabled)
                .map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.label}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      )}*/}
    </div>
  );
}

function RelatedProductsEditor({
  data,
  onUpdate,
}: {
  data: Extract<PageComponent, { type: "related_products" }>["data"];
  onUpdate: (
    u: Partial<Extract<PageComponent, { type: "related_products" }>["data"]>,
  ) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Section Title</Label>
        <Input
          value={data.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
        />
      </div>
      <div>
        <Label>Max Products</Label>
        <Input
          type="number"
          value={data.limit}
          onChange={(e) => onUpdate({ limit: Number(e.target.value) })}
          min="1"
          max="12"
        />
      </div>
      <div>
        <Label>Sort Order</Label>
        <SortOrderSelect
          value={data.sortOrder}
          onValueChange={(v) => onUpdate({ sortOrder: v })}
        />
      </div>
      <div>
        <Label>Columns</Label>
        <Select
          value={String(data.columns)}
          onValueChange={(v) => onUpdate({ columns: Number(v) as 2 | 3 | 4 })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="2">2</SelectItem>
            <SelectItem value="3">3</SelectItem>
            <SelectItem value="4">4</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Card Style</Label>
        <Select
          value={data.cardStyle}
          onValueChange={(v) =>
            onUpdate({ cardStyle: v as typeof data.cardStyle })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="minimal">Minimal</SelectItem>
            <SelectItem value="bordered">Bordered</SelectItem>
            <SelectItem value="shadow">Shadow</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────
// SHARED HELPERS
// ──────────────────────────────────────────────────────

import type { ProductSortOrder } from "@/types/storefront.design";

function SortOrderSelect({
  value,
  onValueChange,
}: {
  value: ProductSortOrder;
  onValueChange: (v: ProductSortOrder) => void;
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-white">
        <SelectItem value="newest_first">Newest First</SelectItem>
        <SelectItem value="oldest_first">Oldest First</SelectItem>
        <SelectItem value="price_low_high">Price: Low to High</SelectItem>
        <SelectItem value="price_high_low">Price: High to Low</SelectItem>
        <SelectItem value="name_a_z">Name: A → Z</SelectItem>
        <SelectItem value="name_z_a">Name: Z → A</SelectItem>
      </SelectContent>
    </Select>
  );
}
