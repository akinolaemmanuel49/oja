import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { Button,Input,Label,Card,CardContent,CardDescription,CardHeader,CardTitle,Select,SelectContent,SelectItem,SelectTrigger,SelectValue,Alert,AlertDescription,Textarea } from "@oja/ui";
import { Loader2, ArrowLeft, Info } from "lucide-react";
import { UpdateStorefrontMutationFn } from "@/api/storefronts/updateStorefront";
import { fetchStorefront } from "@/api/storefronts/fetchStorefront";
import type { UpdateStorefrontRequest } from "@/requests/storefront";
import type { Storefront, StorefrontStatus } from "@/types/storefront";
import { AppHref } from "@/routes/constants";
import { AppLoader } from "@/components/loaders/AppLoader";

export default function EditStorefront() {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();

  const { data: storefront, isLoading: isLoadingStorefront } = useQuery({
    queryKey: ["storefronts", storeId!],
    queryFn: fetchStorefront,
    enabled: !!storeId,
  });

  if (isLoadingStorefront) {
    return (
      <div className="flex items-center justify-center h-64">
        <AppLoader text={"Loading storefronts"} />
      </div>
    );
  }

  if (!storefront) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 text-center">
        <Alert variant="destructive">
          <AlertDescription>Storefront not found</AlertDescription>
        </Alert>
        <Button
          variant="outline"
          onClick={() => navigate(AppHref.storefrontsRoute)}
          className="mt-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Storefronts
        </Button>
      </div>
    );
  }

  // Use the storefront ID + slug_updated_at as a key to reset internal state
  // automatically when the data is fetched or updated.
  return (
    <EditStorefrontForm
      key={`${storefront.id}-${storefront.slug_updated_at}`}
      storefront={storefront}
    />
  );
}

function EditStorefrontForm({ storefront }: { storefront: Storefront }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<UpdateStorefrontRequest>({
    name: storefront.name,
    slug: storefront.slug,
    domain: storefront.domain || "",
    status: (storefront.status === "active"
      ? "active"
      : "inactive") as StorefrontStatus,
    meta_title: storefront.meta_title || "",
    meta_description: storefront.meta_description || "",
    og_image: storefront.og_image || "",
    favicon: storefront.favicon || "",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof typeof formData, string>>
  >({});

  // Logic: Can change slug if slug_updated_at is null OR 30 days have passed
  const cooldownDays = 30;
  const lastUpdated = useMemo(() => {
    if (!storefront.slug_updated_at) return null;
    return new Date(storefront.slug_updated_at);
  }, [storefront.slug_updated_at]);
  const canChangeSlug = useMemo(() => {
    if (!lastUpdated) return true;
    const diffTime = Math.abs(new Date().getTime() - lastUpdated.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= cooldownDays;
  }, [lastUpdated]);

  const daysRemaining = lastUpdated
    ? Math.max(
        0,
        cooldownDays -
          Math.ceil(
            (new Date().getTime() - lastUpdated.getTime()) /
              (1000 * 60 * 60 * 24),
          ),
      )
    : 0;

  const updateStorefrontMutation = useMutation({
    mutationFn: UpdateStorefrontMutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["storefronts"] });
      navigate(AppHref.storefrontsRoute);
    },
  });

  const handleFieldChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof typeof formData, string>> = {};
    if (!formData.name.trim()) newErrors.name = "Storefront name is required";
    if (!formData.slug?.trim()) newErrors.slug = "Slug is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    updateStorefrontMutation.mutate({
      storefrontId: storefront.id,
      storefrontUpdate: formData,
    });
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Button
        variant="ghost"
        onClick={() => navigate(AppHref.storefrontsRoute)}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" /> Back
      </Button>
      <h1 className="text-3xl font-bold mb-6">Edit Storefront</h1>

      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>
            Update your storefront configuration.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Slug Field with Cooldown Logic */}
            <div className="space-y-2">
              <Label htmlFor="slug">Storefront Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                disabled={!canChangeSlug || updateStorefrontMutation.isPending}
                onChange={(e) =>
                  handleFieldChange(
                    "slug",
                    e.target.value.toLowerCase().replace(/\s+/g, "-"),
                  )
                }
                className={!canChangeSlug ? "bg-gray-50 opacity-70" : ""}
              />
              {!canChangeSlug ? (
                <div className="flex items-center gap-2 mt-2 text-amber-600 bg-amber-50 p-2 rounded text-xs">
                  <Info className="h-3 w-3" />
                  <span>
                    The slug was recently changed. You can change it again in{" "}
                    <b>{daysRemaining} days</b>.
                  </span>
                </div>
              ) : (
                <p className="text-xs text-gray-500">
                  Slugs can be changed once every 30 days.
                </p>
              )}
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                disabled={updateStorefrontMutation.isPending}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Domain */}
            <div className="space-y-2">
              <Label htmlFor="domain">Custom Domain (optional)</Label>
              <Input
                id="domain"
                value={formData.domain}
                onChange={(e) => handleFieldChange("domain", e.target.value)}
                className={errors.domain ? "border-red-500" : ""}
                disabled={updateStorefrontMutation.isPending}
              />
              {errors.domain && (
                <p className="text-sm text-red-500">{errors.domain}</p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => handleFieldChange("status", v)}
                disabled={updateStorefrontMutation.isPending}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={updateStorefrontMutation.isPending}
                className="flex-1 hover:cursor-pointer"
              >
                {updateStorefrontMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(AppHref.storefrontsRoute)}
                className="hover:cursor-pointer"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>SEO</CardTitle>
          <CardDescription>
            Meta tags for search engines and social sharing. These power the
            storefront's title, description, preview image and favicon.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="meta_title">Meta Title</Label>
              <Input
                id="meta_title"
                value={formData.meta_title}
                maxLength={60}
                onChange={(e) =>
                  handleFieldChange("meta_title", e.target.value)
                }
                disabled={updateStorefrontMutation.isPending}
              />
              <p className="text-xs text-gray-500">
                {formData.meta_title?.length ?? 0}/60 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="meta_description">Meta Description</Label>
              <Textarea
                id="meta_description"
                value={formData.meta_description}
                rows={3}
                maxLength={160}
                onChange={(e) =>
                  handleFieldChange("meta_description", e.target.value)
                }
                disabled={updateStorefrontMutation.isPending}
              />
              <p className="text-xs text-gray-500">
                {formData.meta_description?.length ?? 0}/160 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="og_image">Social Preview Image URL</Label>
              <Input
                id="og_image"
                value={formData.og_image}
                placeholder="https://… (used for OG and Twitter cards)"
                onChange={(e) => handleFieldChange("og_image", e.target.value)}
                disabled={updateStorefrontMutation.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="favicon">Favicon URL</Label>
              <Input
                id="favicon"
                value={formData.favicon}
                placeholder="https://… (browser tab icon)"
                onChange={(e) => handleFieldChange("favicon", e.target.value)}
                disabled={updateStorefrontMutation.isPending}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={updateStorefrontMutation.isPending}
                className="flex-1 hover:cursor-pointer"
              >
                {updateStorefrontMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save SEO
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(AppHref.storefrontsRoute)}
                className="hover:cursor-pointer"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
