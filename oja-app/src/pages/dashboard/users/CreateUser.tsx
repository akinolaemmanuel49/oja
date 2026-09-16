import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button,Input,Label,Card,CardContent,CardDescription,CardHeader,CardTitle,Alert,AlertDescription } from "@oja/ui";
import { Loader2, ArrowLeft } from "lucide-react";
import { createUser } from "@/api/users/createUser";
import type { CreateUserRequest } from "@/requests/user";
import { AppHref } from "@/routes/constants";

export default function CreateUser() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Form state
  const [formData, setFormData] = useState<CreateUserRequest>({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
  });

  // Validation errors
  const [errors, setErrors] = useState<
    Partial<Record<keyof CreateUserRequest, string>>
  >({});

  // Mutation for creating user
  const createUserMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: ["users"] });

      // Navigate back to users list
      navigate("/users");
    },
  });

  /**
   * Handle field change with validation
   */
  const handleFieldChange = (field: keyof CreateUserRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  /**
   * Validate form before submission
   */
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreateUserRequest, string>> = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // First name validation
    if (!formData.first_name.trim()) {
      newErrors.first_name = "First name is required";
    }

    // Last name validation
    if (!formData.last_name.trim()) {
      newErrors.last_name = "Last name is required";
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

    createUserMutation.mutate(formData);
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Header with back button */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/users")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Users
        </Button>
        <h1 className="text-3xl font-bold">Create New User</h1>
        <p className="text-gray-600 mt-2">
          Add a new team member to your organization
        </p>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>
            Enter the details for the new user. They will receive their login
            credentials.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Error Alert */}
              {createUserMutation.isError && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {createUserMutation.error instanceof Error
                      ? createUserMutation.error.message
                      : "Failed to create user. Please try again."}
                  </AlertDescription>
                </Alert>
              )}

              {/* Email Field */}
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
                  disabled={createUserMutation.isPending}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">
                  Password <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={(e) =>
                    handleFieldChange("password", e.target.value)
                  }
                  className={errors.password ? "border-red-500" : ""}
                  disabled={createUserMutation.isPending}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}
                <p className="text-sm text-gray-500">User cannot change this</p>
              </div>

              {/* First Name Field */}
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
                  disabled={createUserMutation.isPending}
                />
                {errors.first_name && (
                  <p className="text-sm text-red-500">{errors.first_name}</p>
                )}
              </div>

              {/* Last Name Field */}
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
                  disabled={createUserMutation.isPending}
                />
                {errors.last_name && (
                  <p className="text-sm text-red-500">{errors.last_name}</p>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex items-center gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={createUserMutation.isPending}
                  className="flex-1 hover:cursor-pointer"
                >
                  {createUserMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create User
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(AppHref.usersRoute)}
                  disabled={createUserMutation.isPending}
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
