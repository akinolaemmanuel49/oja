import { Card,CardContent } from "@oja/ui";
import {
  Sparkles,
  Image,
  Type,
  Grid3x3,
  Repeat,
  Images,
  Space,
  ListFilter,
  SlidersHorizontal,
  ImagePlay,
  ShoppingBag,
  BookOpen,
  LayoutGrid,
} from "lucide-react";

import { getComponentsForPage } from "@/lib/storefrontComponentsRegistry";
import type { ComponentType, PageType } from "@/types/storefront.design";
import { PAGE_TYPE_LABELS } from "@/types/storefront.design";

interface ComponentSidebarProps {
  activePage: PageType;
  onAddComponent: (type: ComponentType) => void;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Sparkles,
  Image,
  Type,
  Grid3x3,
  Repeat,
  Images,
  Space,
  ListFilter,
  SlidersHorizontal,
  ImagePlay,
  ShoppingBag,
  BookOpen,
  LayoutGrid,
};

/**
 * Sidebar — only shows components that are allowed on the active page.
 * Switching pages in the designer automatically updates this list.
 */
export function ComponentSidebar({
  activePage,
  onAddComponent,
}: ComponentSidebarProps) {
  const components = getComponentsForPage(activePage);

  return (
    <div className="w-64 bg-white border-r overflow-auto shrink-0">
      <div className="p-4">
        <div className="mb-4">
          <h2 className="text-base font-bold">Components</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            For the{" "}
            <span className="font-medium text-gray-700">
              {PAGE_TYPE_LABELS[activePage]}
            </span>{" "}
            page
          </p>
        </div>

        <div className="space-y-2">
          {components.map((component) => {
            const Icon = ICON_MAP[component.icon] ?? Sparkles;
            return (
              <Card
                key={component.type}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onAddComponent(component.type)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-blue-50 rounded shrink-0">
                      <Icon className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm leading-tight">
                        {component.label}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                        {component.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-5 p-3 bg-blue-50 rounded-lg">
          <p className="font-medium text-xs mb-1.5">💡 Tips</p>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Click to add a component</li>
            <li>• Drag to reorder</li>
            {activePage === "product_detail" && (
              <li>• Product Images &amp; Info are required</li>
            )}
            {activePage === "products" && (
              <li>• Products Header controls default sort</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
