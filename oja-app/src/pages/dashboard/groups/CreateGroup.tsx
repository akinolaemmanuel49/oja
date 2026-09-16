import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button,Input,Label,Textarea,Card,CardContent,CardDescription,CardHeader,CardTitle,Alert,AlertDescription } from "@oja/ui";
import { Loader2, ArrowLeft } from "lucide-react";
import { createGroup } from "@/api/groups/createGroup";
import type { CreateGroupRequest } from "@/requests/group";
import { AppHref } from "@/routes/constants";

export default function CreateGroup() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Form state
  const [formData, setFormData] = useState<CreateGroupRequest>({
    name: "",
    description: "",
  });

  // Validation errors
  const [errors, setErrors] = useState<
    Partial<Record<keyof CreateGroupRequest, string>>
  >({});

  // Mutation for creating group
  const createGroupMutation = useMutation({
    mutationFn: createGroup,
    onSuccess: () => {
      // Invalidate groups list
      queryClient.invalidateQueries({ queryKey: ["groups"] });

      // Navigate back to groups list
      navigate(AppHref.groupsRoute);
    },
  });

  /**
   * Handle field change
   */
  const handleFieldChange = (
    field: keyof CreateGroupRequest,
    value: string,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  /**
   * Validate form
   */
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreateGroupRequest, string>> = {};

    // Group name is required
    if (!formData.name.trim()) {
      newErrors.name = "Group name is required";
    } else if (formData.name.length > 255) {
      newErrors.name = "Group name must be less than 255 characters";
    }

    // Description is optional but has max length
    if (formData.description && formData.description.length > 1000) {
      newErrors.description = "Description must be less than 1000 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    createGroupMutation.mutate(formData);
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Header with back button */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/groups")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Groups
        </Button>
        <h1 className="text-3xl font-bold">Create New Group</h1>
        <p className="text-gray-600 mt-2">
          Create a group to organize users and assign permissions at scale
        </p>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Group Information</CardTitle>
          <CardDescription>
            Enter the details for the new group. You can add members and
            permissions after creation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Error Alert */}
              {createGroupMutation.isError && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {createGroupMutation.error instanceof Error
                      ? createGroupMutation.error.message
                      : "Failed to create group. Please try again."}
                  </AlertDescription>
                </Alert>
              )}

              {/* Group Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Group Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="e.g., Sales Team, Administrators"
                  value={formData.name}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  className={errors.name ? "border-red-500" : ""}
                  disabled={createGroupMutation.isPending}
                  maxLength={255}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
                <p className="text-sm text-gray-500">
                  Must be unique within your organization
                </p>
              </div>

              {/* Description Field */}
              <div className="space-y-2">
                <Label htmlFor="description">
                  Description <span className="text-gray-400">(optional)</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe the purpose of this group and what permissions it should have..."
                  value={formData.description}
                  onChange={(e) =>
                    handleFieldChange("description", e.target.value)
                  }
                  className={errors.description ? "border-red-500" : ""}
                  disabled={createGroupMutation.isPending}
                  maxLength={1000}
                  rows={4}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description}</p>
                )}
                <p className="text-sm text-gray-500">
                  {formData.description?.length || 0}/1000 characters
                </p>
              </div>

              {/* Info box */}
              <Alert>
                <AlertDescription className="text-sm">
                  After creating the group, you can add members and assign
                  permissions from the group details page.
                </AlertDescription>
              </Alert>

              {/* Form Actions */}
              <div className="flex items-center gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={createGroupMutation.isPending}
                  className="flex-1 hover:cursor-pointer"
                >
                  {createGroupMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Group
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/groups")}
                  disabled={createGroupMutation.isPending}
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
