import { useState, useMemo } from "react";

import { useNavigate, useParams } from "react-router-dom";
import { Button,Input,Card,CardContent,CardDescription,CardHeader,CardTitle,Checkbox,Alert,AlertDescription,Badge } from "@oja/ui";
import { ArrowLeft, Loader2, Search, ShieldPlus } from "lucide-react";
import { fetchGroup } from "@/api/groups/fetchGroup";
import { listAllPermissions } from "@/api/permissions/listAllPermissions";
import { listGroupPermissions } from "@/api/groups/listGroupPermissions";
import { grantPermissionsToGroupMutationFn } from "@/api/groups/grantPermissionsToGroup";
import { AppHref } from "@/routes/constants";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppLoader } from "@/components/loaders/AppLoader";

export default function ManageGroupPermissions() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const groupPermissionsPage = 1;
  const groupPermissionsPageSize = 20;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPermissionCodes, setSelectedPermissionCodes] = useState<
    Set<string>
  >(new Set());

  // Fetch group data
  const { data: group, isLoading: isLoadingGroup } = useQuery({
    queryKey: ["groups", groupId!],
    queryFn: fetchGroup,
    enabled: !!groupId,
  });

  // Fetch all available permissions
  const { data: allPermissionsData, isLoading: isLoadingPermissions } =
    useQuery({
      queryKey: ["permissions"],
      queryFn: listAllPermissions,
    });

  // Fetch current group permissions
  const { data: groupPermissionsData } = useQuery({
    queryKey: [
      "group-permissions",
      groupId!,
      groupPermissionsPage,
      groupPermissionsPageSize,
    ],
    queryFn: listGroupPermissions,
    enabled: !!groupId,
  });

  const allPermissions = useMemo(
    () => allPermissionsData || [],
    [allPermissionsData],
  );
  const currentPermissionCodes = useMemo(
    () => new Set(groupPermissionsData?.data?.map((p) => p.code) || []),
    [groupPermissionsData],
  );

  // Filter permissions: exclude current ones and apply search
  const availablePermissions = useMemo(() => {
    return allPermissions
      .filter((permission) => !currentPermissionCodes.has(permission.code))
      .filter((permission) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
          permission.code.toLowerCase().includes(query) ||
          permission.name.toLowerCase().includes(query) ||
          permission.resource.toLowerCase().includes(query) ||
          (permission.description &&
            permission.description.toLowerCase().includes(query))
        );
      });
  }, [allPermissions, currentPermissionCodes, searchQuery]);

  // Group permissions by resource for better organization
  const groupedPermissions = useMemo(() => {
    const grouped: Record<string, typeof availablePermissions> = {};
    availablePermissions.forEach((permission) => {
      if (!grouped[permission.resource]) {
        grouped[permission.resource] = [];
      }
      grouped[permission.resource].push(permission);
    });
    return grouped;
  }, [availablePermissions]);

  // Grant permissions mutation
  const grantPermissionsMutation = useMutation({
    mutationFn: grantPermissionsToGroupMutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["group-permissions", groupId],
      });
      queryClient.invalidateQueries({ queryKey: ["groups", groupId] });
      navigate(`/groups/${groupId}`);
    },
  });

  /**
   * Toggle permission selection
   */
  const togglePermissionSelection = (code: string) => {
    setSelectedPermissionCodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(code)) {
        newSet.delete(code);
      } else {
        newSet.add(code);
      }
      return newSet;
    });
  };

  /**
   * Handle form submission
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedPermissionCodes.size === 0) {
      return;
    }

    grantPermissionsMutation.mutate({
      groupId: groupId!,
      permissionCodes: Array.from(selectedPermissionCodes),
    });
  };

  // Loading state
  if (isLoadingGroup || isLoadingPermissions) {
    return (
      <div className="flex items-center justify-center h-64">
        <AppLoader
          text={`Loading ${isLoadingGroup ? "group" : "permissions"}`}
        />
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
          onClick={() => navigate(AppHref.groupsRoute)}
          className="mt-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Groups
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(`/groups/${groupId}`)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Group
        </Button>
        <h1 className="text-3xl font-bold">
          Grant Permissions to {group.name}
        </h1>
        <p className="text-gray-600 mt-2">
          Select permissions to grant to this group. All members will inherit
          these permissions.
        </p>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Select Permissions</CardTitle>
          <CardDescription>
            {selectedPermissionCodes.size} permission
            {selectedPermissionCodes.size !== 1 ? "s" : ""} selected
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Error Alert */}
              {grantPermissionsMutation.isError && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {grantPermissionsMutation.error instanceof Error
                      ? grantPermissionsMutation.error.message
                      : "Failed to grant permissions. Please try again."}
                  </AlertDescription>
                </Alert>
              )}

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search permissions by code, name, or resource..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Permissions List - Grouped by Resource */}
              <div className="border rounded-lg max-h-96 overflow-y-auto">
                {Object.keys(groupedPermissions).length > 0 ? (
                  Object.entries(groupedPermissions).map(
                    ([resource, permissions]) => (
                      <div key={resource} className="border-b last:border-b-0">
                        {/* Resource Header */}
                        <div className="bg-gray-50 px-4 py-2 font-medium text-sm text-gray-700 sticky top-0">
                          {resource}
                        </div>

                        {/* Permissions in this resource */}
                        <div className="divide-y">
                          {permissions.map((permission) => (
                            <label
                              key={permission.code}
                              className="flex items-start gap-3 p-4 hover:bg-gray-50 cursor-pointer"
                            >
                              <Checkbox
                                checked={selectedPermissionCodes.has(
                                  permission.code,
                                )}
                                onCheckedChange={() =>
                                  togglePermissionSelection(permission.code)
                                }
                                className="mt-1"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <code className="px-2 py-0.5 bg-gray-100 rounded text-sm font-mono">
                                    {permission.code}
                                  </code>
                                  {permission.code === "*" && (
                                    <Badge
                                      variant="destructive"
                                      className="text-xs"
                                    >
                                      SUPERUSER
                                    </Badge>
                                  )}
                                  {permission.action === "*" &&
                                    permission.code !== "*" && (
                                      <Badge
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        ALL ACTIONS
                                      </Badge>
                                    )}
                                </div>
                                <p className="font-medium mt-1">
                                  {permission.name}
                                </p>
                                {permission.description && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    {permission.description}
                                  </p>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    ),
                  )
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    {searchQuery ? (
                      <p>No permissions found matching "{searchQuery}"</p>
                    ) : (
                      <p>All permissions are already granted to this group</p>
                    )}
                  </div>
                )}
              </div>

              {/* Warning for superuser permission */}
              {selectedPermissionCodes.has("*") && (
                <Alert>
                  <AlertDescription>
                    <strong>Warning:</strong> The superuser permission (*)
                    grants unrestricted access to all system resources. Only
                    grant this to administrators.
                  </AlertDescription>
                </Alert>
              )}

              {/* Actions */}
              <div className="flex items-center gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={
                    selectedPermissionCodes.size === 0 ||
                    grantPermissionsMutation.isPending
                  }
                  className="flex-1 hover:cursor-pointer"
                >
                  {grantPermissionsMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  <ShieldPlus className="mr-2 h-4 w-4" />
                  Grant {selectedPermissionCodes.size} Permission
                  {selectedPermissionCodes.size !== 1 ? "s" : ""}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/groups/${groupId}`)}
                  disabled={grantPermissionsMutation.isPending}
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
