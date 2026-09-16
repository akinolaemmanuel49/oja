import { useState, useMemo, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { Button,Input,Label,Textarea,Card,CardContent,CardDescription,CardHeader,CardTitle,Alert,AlertDescription } from "@oja/ui";
import { Loader2, ArrowLeft } from "lucide-react";
import { updateGroup } from "@/api/groups/updateGroup";
import { fetchGroup } from "@/api/groups/fetchGroup";
import { AppHref } from "@/routes/constants";
import type { UpdateGroupRequest } from "@/requests/group";
import { AppLoader } from "@/components/loaders/AppLoader";

export default function EditGroup() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch group data
  const { data, isPending: isLoadingGroup } = useQuery({
    queryKey: ["groups", groupId!],
    queryFn: fetchGroup,
    enabled: !!groupId,
  });

  // Derive group safely
  const group = useMemo(() => data, [data]);

  // Initialize form data directly from fetched group
  const [formData, setFormData] = useState<UpdateGroupRequest>({
    name: "",
    description: "",
  });

  useEffect(() => {
    if (!group) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData({
      name: group.name,
      description: group.description,
    });
  }, [group, isLoadingGroup]);

  // Validation errors
  const [errors, setErrors] = useState<
    Partial<Record<keyof UpdateGroupRequest, string>>
  >({});

  // Mutation for updating group
  const updateGroupMutation = useMutation({
    mutationFn: (data: UpdateGroupRequest) => updateGroup(groupId!, data),
    onSuccess: () => {
      // Invalidate groups list and individual group cache
      queryClient.invalidateQueries({ queryKey: ["groups"] });
      queryClient.invalidateQueries({ queryKey: ["groups", groupId] });

      // Navigate back to groups list
      navigate(AppHref.groupsRoute);
    },
  });

  /**
   * Handle field change
   */
  const handleFieldChange = (
    field: keyof UpdateGroupRequest,
    value: string,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  /**
   * Validate form
   */
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UpdateGroupRequest, string>> = {};

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

    updateGroupMutation.mutate(formData);
  };

  // Loading state
  if (isLoadingGroup) {
    return (
      <div className="flex items-center justify-center h-64">
        <AppLoader text={"LoadingFetching group data"} />
      </div>
    );
  }

  // Group not found
  if (!group) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertDescription>Group not found</AlertDescription>
        </Alert>
        <Button
          variant="outline"
          onClick={() => navigate("/groups")}
          className="mt-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Groups
        </Button>
      </div>
    );
  }

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
        <h1 className="text-3xl font-bold">Edit Group</h1>
        <p className="text-gray-600 mt-2">
          Update group information for {group.name}
        </p>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Group Information</CardTitle>
          <CardDescription>
            Update the group's details. Changes will take effect immediately.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Error Alert */}
              {updateGroupMutation.isError && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {updateGroupMutation.error instanceof Error
                      ? updateGroupMutation.error.message
                      : "Failed to update group. Please try again."}
                  </AlertDescription>
                </Alert>
              )}

              {/* Group ID (read-only) */}
              <div className="space-y-2">
                <Label>Group ID</Label>
                <Input value={group.id} disabled className="bg-gray-50" />
                <p className="text-sm text-gray-500">
                  Group ID cannot be changed
                </p>
              </div>

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
                  disabled={updateGroupMutation.isPending}
                  maxLength={255}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              {/* Description Field */}
              <div className="space-y-2">
                <Label htmlFor="description">
                  Description <span className="text-gray-400">(optional)</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe the purpose of this group..."
                  value={formData.description}
                  onChange={(e) =>
                    handleFieldChange("description", e.target.value)
                  }
                  className={errors.description ? "border-red-500" : ""}
                  disabled={updateGroupMutation.isPending}
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

              {/* Form Actions */}
              <div className="flex items-center gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={updateGroupMutation.isPending}
                  className="flex-1"
                >
                  {updateGroupMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/groups")}
                  disabled={updateGroupMutation.isPending}
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
