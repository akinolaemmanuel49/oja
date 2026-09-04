import { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button } from "@oja/ui";
import {
  ArrowLeft,
  Download,
  Eye,
  Settings,
  Smartphone,
  Monitor,
  Home,
  ShoppingBag,
  Package,
  Upload,
  Save,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";

import type {
  PageComponent,
  ComponentType,
  ThemeConfig,
  PageType,
  StorefrontDesign,
} from "@/types/storefront.design";
import { PAGE_TYPE_LABELS } from "@/types/storefront.design";
import { ComponentSidebar } from "./components/ComponentSidebar";
import { CanvasArea } from "./components/CanvasArea";
import { ComponentEditor } from "./components/ComponentEditor";
import { ComponentPreview } from "./components/ComponentPreview";
import { ThemeEditor } from "./components/ThemeEditor";
import { PreviewDialog } from "./components/PreviewDialog";
import {
  DEFAULT_THEME,
  DEFAULT_PAGE_COMPONENTS,
  createComponent,
} from "@/lib/storefrontComponentsRegistry";
import type { ErrorResponse } from "@/responses/error";
import { toast } from "@oja/ui";
import { saveStorefrontDesign } from "@/api/storefronts/saveStorefrontDesign";
import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchStorefrontDesign } from "@/api/storefronts/fetchStorefrontDesign";

// ============================================================================
// PAGE TAB CONFIG
// ============================================================================

const PAGE_TABS: Array<{
  type: PageType;
  icon: React.ReactNode;
  label: string;
}> = [
  { type: "home", icon: <Home className="h-4 w-4" />, label: "Home" },
  {
    type: "products",
    icon: <ShoppingBag className="h-4 w-4" />,
    label: "Products",
  },
  {
    type: "product_detail",
    icon: <Package className="h-4 w-4" />,
    label: "Product Detail",
  },
];

// ============================================================================
// STATE SHAPE
// ============================================================================

type PagesState = Record<PageType, PageComponent[]>;

/**
 * Main Storefront Designer Page
 *
 * State is now per-page: switching tabs swaps the active component list.
 * Theme is shared across all pages (one source of truth).
 * Download bundles everything into a single StorefrontDesign JSON.
 */
export default function StorefrontDesigner() {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();

  // ──────────────────────────────
  // STATE
  // ──────────────────────────────

  const [activePage, setActivePage] = useState<PageType>("home");
  const [theme, setTheme] = useState<ThemeConfig>(DEFAULT_THEME);

  // Each page starts with sensible defaults so the canvas is never blank
  const [pages, setPages] = useState<PagesState>({
    home: DEFAULT_PAGE_COMPONENTS.home,
    products: DEFAULT_PAGE_COMPONENTS.products,
    product_detail: DEFAULT_PAGE_COMPONENTS.product_detail,
  });

  // Selected component ID tracked per-page so switching doesn't bleed over
  const [selectedIds, setSelectedIds] = useState<
    Record<PageType, string | null>
  >({
    home: null,
    products: null,
    product_detail: null,
  });

  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [showPreview, setShowPreview] = useState(false);
  const [showThemeEditor, setShowThemeEditor] = useState(false);

  // Component currently being dragged (for the drag overlay)
  const [dragOverComponent, setDragOverComponent] =
    useState<PageComponent | null>(null);

  // Fetch existing design on mount
  const { data: existingDesign } = useQuery({
    queryKey: ["storefront-design", storeId!],
    queryFn: fetchStorefrontDesign,
    enabled: !!storeId,
  });

  // Load existing design into state when it arrives
  useEffect(() => {
    if (existingDesign) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTheme(existingDesign.theme);
      setPages({
        home: existingDesign.pages.home.components,
        products: existingDesign.pages.products.components,
        product_detail: existingDesign.pages.product_detail.components,
      });
    }
  }, [existingDesign]);

  // Save design mutation
  const saveMutation = useMutation({
    mutationFn: (design: StorefrontDesign) =>
      saveStorefrontDesign(storeId!, design),
    onSuccess: () => {
      toast.success("Design saved successfully!");
    },
    onError: (err: unknown) => {
      let message = "Invalid credentials";

      if (err && typeof err === "object" && "response" in err) {
        const response = (err as { response?: { data?: ErrorResponse } })
          .response;
        message = response?.data?.detail ?? message;
      }

      toast.error(message || "Failed to save design");
    },
  });

  // ──────────────────────────────
  // DERIVED
  // ──────────────────────────────

  const activeComponents = pages[activePage];
  const selectedComponentId = selectedIds[activePage];
  const selectedComponent = activeComponents.find(
    (c) => c.id === selectedComponentId,
  );

  // ──────────────────────────────
  // PAGE SWITCHING
  // ──────────────────────────────

  const handlePageSwitch = (page: PageType) => {
    setActivePage(page);
    setShowThemeEditor(false);
  };

  // ──────────────────────────────
  // COMPONENT MUTATION HELPERS
  // ──────────────────────────────

  const setActiveComponents = useCallback(
    (updater: (prev: PageComponent[]) => PageComponent[]) => {
      setPages((prev) => ({
        ...prev,
        [activePage]: updater(prev[activePage]),
      }));
    },
    [activePage],
  );

  const setSelectedId = useCallback(
    (id: string | null) => {
      setSelectedIds((prev) => ({ ...prev, [activePage]: id }));
    },
    [activePage],
  );

  // ──────────────────────────────
  // DND SETUP
  // ──────────────────────────────

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setDragOverComponent(null);
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      setActiveComponents((items) => {
        const oldIndex = items.findIndex((c) => c.id === active.id);
        const newIndex = items.findIndex((c) => c.id === over.id);
        return arrayMove(items, oldIndex, newIndex).map((c, i) => ({
          ...c,
          order: i,
        }));
      });
    },
    [setActiveComponents],
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const dragged = activeComponents.find((c) => c.id === event.active.id);
    setDragOverComponent(dragged ?? null);
  }, [activeComponents]);

  const handleDragCancel = useCallback(() => {
    setDragOverComponent(null);
  }, []);

  // ──────────────────────────────
  // COMPONENT CRUD
  // ──────────────────────────────

  const handleAddComponent = useCallback(
    (type: ComponentType) => {
      const newComponent = createComponent(type, activeComponents.length);
      setActiveComponents((prev) => [...prev, newComponent]);
      setSelectedId(newComponent.id);
    },
    [activeComponents.length, setActiveComponents, setSelectedId],
  );

  function updateComponentData<C extends PageComponent>(
    component: C,
    newData: C["data"],
  ): C {
    return { ...component, data: newData };
  }

  const handleUpdateComponent = useCallback(
    (id: string, data: PageComponent["data"]) => {
      setActiveComponents((prev) =>
        prev.map((comp) => {
          if (comp.id !== id) return comp;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return updateComponentData(comp, data as any);
        }),
      );
    },
    [setActiveComponents],
  );

  const handleDeleteComponent = useCallback(
    (id: string) => {
      setActiveComponents((prev) =>
        prev.filter((c) => c.id !== id).map((c, i) => ({ ...c, order: i })),
      );
      if (selectedComponentId === id) setSelectedId(null);
    },
    [selectedComponentId, setActiveComponents, setSelectedId],
  );

  const handleDuplicateComponent = useCallback(
    (id: string) => {
      const src = activeComponents.find((c) => c.id === id);
      if (!src) return;
      const duplicated: PageComponent = {
        ...src,
        id: uuidv4(),
        order: activeComponents.length,
      };
      setActiveComponents((prev) => [...prev, duplicated]);
      setSelectedId(duplicated.id);
    },
    [activeComponents, setActiveComponents, setSelectedId],
  );

  // ──────────────────────────────
  // SPEC GENERATION
  // ──────────────────────────────

  const generateDesign = useCallback((): StorefrontDesign => {
    const now = new Date().toISOString();
    const makePageSpec = (pageType: PageType) => ({
      version: "1.0.0",
      createdAt: now,
      updatedAt: now,
      meta: { title: PAGE_TYPE_LABELS[pageType] },
      components: pages[pageType],
    });

    return {
      version: "1.0.0",
      storefrontId: storeId ?? "unknown",
      storefrontName: "Storefront",
      theme,
      pages: {
        home: makePageSpec("home"),
        products: makePageSpec("products"),
        product_detail: makePageSpec("product_detail"),
      },
    };
  }, [pages, theme, storeId]);

  const handleDownloadSpec = useCallback(() => {
    const design = generateDesign();
    const blob = new Blob([JSON.stringify(design, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `storefront-${storeId ?? "design"}-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [generateDesign, storeId]);

  const handleSave = useCallback(() => {
    if (!storeId) return;

    const design: StorefrontDesign = {
      version: "1.0",
      storefrontId: storeId,
      storefrontName: "Storefront", // You can get this from the storefront query
      theme,
      pages: {
        home: {
          meta: {
            title: "Home",
            description: "Welcome to our store",
          },
          components: pages.home,
          version: "",
          createdAt: "",
          updatedAt: "",
        },
        products: {
          meta: {
            title: "Products",
            description: "Browse our products",
          },
          components: pages.products,
          version: "",
          createdAt: "",
          updatedAt: "",
        },
        product_detail: {
          meta: {
            title: "Product Details",
            description: "View product information",
          },
          components: pages.product_detail,
          version: "",
          createdAt: "",
          updatedAt: "",
        },
      },
    };

    // Save to backend
    saveMutation.mutate(design);
  }, [storeId, theme, pages, saveMutation]);

  const handleLoadSpec = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const design: StorefrontDesign = JSON.parse(
            e.target?.result as string,
          );
          if (!design.version || !design.pages || !design.theme) {
            throw new Error("Invalid spec format");
          }
          setTheme(design.theme);
          setPages({
            home: design.pages.home.components,
            products: design.pages.products.components,
            product_detail: design.pages.product_detail.components,
          });
          setSelectedIds({ home: null, products: null, product_detail: null });
        } catch (err) {
          alert("Failed to load spec: " + (err as Error).message);
        }
      };
      reader.readAsText(file);
      event.target.value = "";
    },
    [],
  );

  // ──────────────────────────────
  // RENDER
  // ──────────────────────────────

  return (
    <div
      className="h-screen flex flex-col bg-gray-50"
      inert={showPreview ? true : undefined}
    >
      {/* ── Top Header ── */}
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div className="h-5 w-px bg-gray-200" />
          <div>
            <h1 className="text-lg font-bold leading-tight">
              Storefront Designer
            </h1>
            <p className="text-xs text-gray-500">
              Theme is shared across all pages
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Desktop / Mobile toggle */}
          <div className="flex items-center gap-0.5 bg-gray-100 rounded-md p-0.5">
            <Button
              variant={viewMode === "desktop" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("desktop")}
              className="h-7 w-7 p-0"
            >
              <Monitor className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={viewMode === "mobile" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("mobile")}
              className="h-7 w-7 p-0"
            >
              <Smartphone className="h-3.5 w-3.5" />
            </Button>
          </div>

          <Button
            variant={showThemeEditor ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setShowThemeEditor((v) => !v);
              setSelectedId(null);
            }}
          >
            <Settings className="h-4 w-4 mr-1.5" />
            Theme
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(true)}
          >
            <Eye className="h-4 w-4 mr-1.5" />
            Preview
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={saveMutation.isPending}
          >
            <Save className="h-4 w-4 mr-1.5" />
            {saveMutation.isPending ? "Saving..." : "Save"}
          </Button>

          <label className="cursor-pointer">
            <input
              type="file"
              accept=".json"
              onChange={handleLoadSpec}
              className="hidden"
            />
            <Button variant="outline" size="sm" asChild>
              <span>
                <Upload className="h-4 w-4 mr-1.5" />
                Load
              </span>
            </Button>
          </label>

          <Button variant="outline" size="sm" onClick={handleDownloadSpec}>
            <Download className="h-4 w-4 mr-1.5" />
            Download
          </Button>
        </div>
      </header>

      {/* ── Page Switcher Tabs ── */}
      <div className="bg-white border-b px-4 shrink-0">
        <nav className="flex gap-1" aria-label="Page tabs">
          {PAGE_TABS.map((tab) => {
            const isActive = activePage === tab.type;
            const count = pages[tab.type].length;
            return (
              <button
                key={tab.type}
                onClick={() => handlePageSwitch(tab.type)}
                className={[
                  "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
                  isActive
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
                ].join(" ")}
              >
                {tab.icon}
                {tab.label}
                <span
                  className={[
                    "inline-flex items-center justify-center min-w-4.5 h-4.5 px-1 rounded-full text-xs font-semibold",
                    isActive
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-500",
                  ].join(" ")}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* ── Main Area ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar — only shows components allowed for the active page */}
        <ComponentSidebar
          activePage={activePage}
          onAddComponent={handleAddComponent}
        />

        {/* Canvas */}
        <div className="flex-1 overflow-auto p-6">
          <DndContext
            sensors={showPreview ? [] : sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
          >
            <SortableContext
              items={activeComponents.map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              <CanvasArea
                components={activeComponents}
                selectedComponentId={selectedComponentId}
                onSelectComponent={setSelectedId}
                onDeleteComponent={handleDeleteComponent}
                onDuplicateComponent={handleDuplicateComponent}
                viewMode={viewMode}
                theme={theme}
                activePage={activePage}
              />
            </SortableContext>
            <DragOverlay dropAnimation={null}>
              {dragOverComponent ? (
                <div className="w-[min(100vw-3rem,calc(100%-16rem))]">
                  <div className="rounded-xl border border-blue-400 shadow-2xl bg-white overflow-hidden cursor-grabbing">
                    <div className="p-4 bg-gray-50">
                      <ComponentPreview
                        component={dragOverComponent}
                        theme={theme}
                      />
                    </div>
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>

        {/* Right panel */}
        <div className="w-80 bg-white border-l overflow-auto shrink-0">
          {selectedComponent ? (
            <ComponentEditor
              component={selectedComponent}
              onUpdate={(data) =>
                handleUpdateComponent(selectedComponent.id, data)
              }
              onClose={() => setSelectedId(null)}
            />
          ) : showThemeEditor ? (
            <ThemeEditor
              theme={theme}
              onUpdate={setTheme}
              onClose={() => setShowThemeEditor(false)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-gray-400">
              <Settings className="h-10 w-10 mb-3 text-gray-200" />
              <p className="text-sm font-medium text-gray-500">
                Select a component to edit
              </p>
              <p className="text-xs mt-1">
                or click Theme to customise colours &amp; fonts
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Preview Dialog */}
      <PreviewDialog
        open={showPreview}
        onClose={() => setShowPreview(false)}
        design={generateDesign()}
        activePage={activePage}
        onPageChange={setActivePage}
      />
    </div>
  );
}
