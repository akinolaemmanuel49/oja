import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button,Input,Label,Card,CardContent,CardDescription,CardHeader,CardTitle,Alert,AlertDescription } from "@oja/ui";
import { Loader2, ArrowLeft } from "lucide-react";
import { createStorefront } from "@/api/storefronts/createStorefront";
import { AppHref } from "@/routes/constants";

export default function CreateStorefront() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    slug: "",
    name: "",
    domain: "",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof typeof formData, string>>
  >({});

  const createMutation = useMutation({
    mutationFn: createStorefront,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["storefronts"] });
      navigate(AppHref.storefrontsRoute);
    },
  });

  const generateSlug = (name: string) =>
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const handleFieldChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      // If the user is typing the name, automatically sync the slug
      if (field === "name") {
        newData.slug = generateSlug(value);
      }

      return newData;
    });

    // Clear errors for the field being edited
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof typeof formData, string>> = {};

    if (!formData.slug.trim()) {
      newErrors.slug = "Slug is required";
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug =
        "Slug can only contain lowercase letters, numbers, and hyphens";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Storefront name is required";
    }

    if (formData.domain?.trim()) {
      if (
        !/^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/.test(
          formData.domain,
        )
      ) {
        newErrors.domain = "Invalid domain format (e.g., example.com)";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const dataToSend = {
      slug: formData.slug,
      name: formData.name,
      ...(formData.domain?.trim() && { domain: formData.domain }),
    };

    createMutation.mutate(dataToSend);
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/storefronts")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Storefronts
        </Button>
        <h1 className="text-3xl font-bold">Create New Storefront</h1>
        <p className="text-gray-600 mt-2">
          Create a new storefront to showcase and sell your products
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Storefront Details</CardTitle>
          <CardDescription>
            Enter the basic information for your new storefront.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {createMutation.isError && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {createMutation.error instanceof Error
                      ? createMutation.error.message
                      : "Failed to create storefront. Please try again."}
                  </AlertDescription>
                </Alert>
              )}

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Storefront Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., Main Store, Wholesale Portal"
                  value={formData.name}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  className={errors.name ? "border-red-500" : ""}
                  disabled={createMutation.isPending}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <Label htmlFor="slug">
                  Slug <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="slug"
                  placeholder="main-store"
                  value={formData.slug}
                  onChange={(e) =>
                    handleFieldChange("slug", e.target.value.toLowerCase())
                  }
                  className={errors.slug ? "border-red-500" : ""}
                  disabled={createMutation.isPending}
                />
                {errors.slug && (
                  <p className="text-sm text-red-500">{errors.slug}</p>
                )}
                <p className="text-sm text-gray-500">
                  URL-friendly identifier (auto-generated from name)
                </p>
              </div>

              {/* Domain */}
              <div className="space-y-2">
                <Label htmlFor="domain">Custom Domain (optional)</Label>
                <Input
                  id="domain"
                  placeholder="shop.example.com"
                  value={formData.domain}
                  onChange={(e) => handleFieldChange("domain", e.target.value)}
                  className={errors.domain ? "border-red-500" : ""}
                  disabled={createMutation.isPending}
                />
                {errors.domain && (
                  <p className="text-sm text-red-500">{errors.domain}</p>
                )}
              </div>

              <div className="flex items-center gap-4 pt-6">
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 hover:cursor-pointer"
                >
                  {createMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Storefront
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/storefronts")}
                  disabled={createMutation.isPending}
                  className="hover:cursor-pointer"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
