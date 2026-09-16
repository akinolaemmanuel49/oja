import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { Button,Input,Label,Card,CardContent,CardDescription,CardHeader,CardTitle,Alert,AlertDescription } from "@oja/ui";
import { Loader2, ArrowLeft } from "lucide-react";
import { updateUserMutationFn } from "@/api/users/updateUser";
import { fetchUser } from "@/api/users/fetchUser";
import type { UpdateUserRequest } from "@/requests/user";
import { AppHref } from "@/routes/constants";
import { AppLoader } from "@/components/loaders/AppLoader";

export default function EditUser() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch user data
  const { data, isLoading: isLoadingUser } = useQuery({
    queryKey: ["users", userId!],
    queryFn: fetchUser,
    enabled: !!userId,
  });

  // Derive user safely
  const user = useMemo(() => data, [data]);

  // Initialize form data directly from fetched user
  const [formData, setFormData] = useState<UpdateUserRequest>(() => ({
    email: "",
    first_name: "",
    last_name: "",
  }));

  useEffect(() => {
    if (!user) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData({
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
    });
  }, [user]);

  // Validation errors
  const [errors, setErrors] = useState<
    Partial<Record<keyof UpdateUserRequest, string>>
  >({});

  // Mutation for updating user
  const updateUserMutation = useMutation({
    mutationFn: updateUserMutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["users", userId] });
      navigate(AppHref.usersRoute);
    },
  });

  const handleFieldChange = (field: keyof UpdateUserRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UpdateUserRequest, string>> = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.first_name.trim()) {
      newErrors.first_name = "First name is required";
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = "Last name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    updateUserMutation.mutate({ userId: userId!, userUpdate: formData });
  };

  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <AppLoader text={"Loading user"} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertDescription>User not found</AlertDescription>
        </Alert>
        <Button
          variant="outline"
          onClick={() => navigate("/users")}
          className="mt-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Users
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/users")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Users
        </Button>
        <h1 className="text-3xl font-bold">Edit User</h1>
        <p className="text-gray-600 mt-2">
          Update user information for {user.full_name}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>
            Update the user's details. Changes will take effect immediately.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {updateUserMutation.isError && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {updateUserMutation.error instanceof Error
                      ? updateUserMutation.error.message
                      : "Failed to update user. Please try again."}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label>User ID</Label>
                <Input value={user.id} disabled className="bg-gray-50" />
                <p className="text-sm text-gray-500">
                  User ID cannot be changed
                </p>
              </div>

              {user.is_root && (
                <Alert>
                  <AlertDescription>
                    This is a root user with full system access.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={formData.email}
                  onChange={(e) => handleFieldChange("email", e.target.value)}
                  className={errors.email ? "border-red-500" : ""}
                  disabled={updateUserMutation.isPending}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="first_name">
                  First Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="first_name"
                  type="text"
                  placeholder="John"
                  value={formData.first_name}
                  onChange={(e) =>
                    handleFieldChange("first_name", e.target.value)
                  }
                  className={errors.first_name ? "border-red-500" : ""}
                  disabled={updateUserMutation.isPending}
                />
                {errors.first_name && (
                  <p className="text-sm text-red-500">{errors.first_name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">
                  Last Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="last_name"
                  type="text"
                  placeholder="Doe"
                  value={formData.last_name}
                  onChange={(e) =>
                    handleFieldChange("last_name", e.target.value)
                  }
                  className={errors.last_name ? "border-red-500" : ""}
                  disabled={updateUserMutation.isPending}
                />
                {errors.last_name && (
                  <p className="text-sm text-red-500">{errors.last_name}</p>
                )}
              </div>

              <div className="flex items-center gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={updateUserMutation.isPending}
                  className="flex-1 hover:cursor-pointer"
                >
                  {updateUserMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/users")}
                  disabled={updateUserMutation.isPending}
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
