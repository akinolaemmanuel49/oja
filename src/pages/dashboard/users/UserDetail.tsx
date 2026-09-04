import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { Button,Card,CardContent,CardDescription,CardHeader,CardTitle,Tabs,TabsContent,TabsList,TabsTrigger,Alert,AlertDescription,AlertDialog,AlertDialogAction,AlertDialogCancel,AlertDialogContent,AlertDialogDescription,AlertDialogFooter,AlertDialogHeader,AlertDialogTitle } from "@oja/ui";
import {
  ArrowLeft,
  Users,
  Shield,
  UserPlus,
  ShieldPlus,
  Trash2,
  Edit,
  UserMinus,
  Crown,
} from "lucide-react";
import { PermissionGuard } from "@/components/guards/PermissionGuard";
import { usePermissions } from "@/hooks/usePermissions";
import { AppHref } from "@/routes/constants";
import { listUserPermissions } from "@/api/users/listUserPermissions";
import { fetchUser } from "@/api/users/fetchUser";
import { revokePermissionsFromUserMutationFn } from "@/api/users/revokePermissionsFromUser";
import { listUserGroups } from "@/api/users/listUserGroups";
import { removeUserFromGroupMutationFn } from "@/api/users/removeUserFromGroup";
import { addUserToGroupMutationFn } from "@/api/users/addUserToGroup";
import { fetchGroups } from "@/api/groups/fetchGroups";
import { AppLoader } from "@/components/loaders/AppLoader";

export default function UserDetail() {
  const { userId } = useParams<{ userId: string }>();
  const groupsPage = 1;
  const groupsPageSize = 20;
  const userPermissionsPage = 1;
  const userPermissionsPageSize = 20;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { can } = usePermissions();
  const [selectedTab, setSelectedTab] = useState("groups");
  const [confirmRemoveFromGroup, setConfirmRemoveFromGroup] = useState<
    string | null
  >(null);
  const [confirmRevokeUserPerm, setConfirmRevokeUserPerm] = useState<
    string | null
  >(null);

  // Fetch user data
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ["users", userId!],
    queryFn: fetchUser,
    enabled: !!userId,
  });

  // Fetch all groups
  const { data: allGroupsData } = useQuery({
    queryKey: ["groups", groupsPage, groupsPageSize],
    queryFn: fetchGroups,
    enabled: !!userId,
  });

  // Fetch user groups (groups the user is a member of)
  const { data: userGroupsData, isLoading: isLoadingGroups } = useQuery({
    queryKey: ["user-groups", userId!, groupsPage, groupsPageSize],
    queryFn: listUserGroups,
    enabled: !!userId,
  });

  // Combine all groups with user membership status
  const combinedGroups = useMemo(() => {
    const allGroups = allGroupsData?.data || [];
    const userGroups = userGroupsData?.data || [];

    // Create a Set of group IDs that the user is a member of for quick lookup
    const userGroupIds = new Set(userGroups.map((group) => group.id));

    // Map all groups and add isMember property
    return allGroups.map((group) => ({
      ...group,
      isMember: userGroupIds.has(group.id),
    }));
  }, [allGroupsData, userGroupsData]);

  // Get just the groups the user is a member of for stats
  const userGroups = useMemo(
    () => combinedGroups.filter((group) => group.isMember),
    [combinedGroups],
  );

  // Fetch user permissions
  const { data: permissionsData, isLoading: isLoadingPermissions } = useQuery({
    queryKey: [
      "user-permissions",
      userId!,
      userPermissionsPage,
      userPermissionsPageSize,
    ],
    queryFn: listUserPermissions,
    enabled: !!userId,
  });

  const permissions = useMemo(
    () => permissionsData?.data || [],
    [permissionsData],
  );

  // Permission checks
  const canUpdate = can("groups:update");
  const canGrantPermissions = can("permissions:grant");

  // Check if user is root (superuser)
  const isRootUser = user?.is_root === true;

  // Remove user from group mutation
  const removeUserFromGroupMutation = useMutation({
    mutationFn: removeUserFromGroupMutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-groups", userId] });
      queryClient.invalidateQueries({ queryKey: ["users", userId] });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });

  // Add user to group mutation
  const addUserToGroupMutation = useMutation({
    mutationFn: addUserToGroupMutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-groups", userId] });
      queryClient.invalidateQueries({ queryKey: ["users", userId] });
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });

  // Revoke permission mutation
  const revokePermissionMutation = useMutation({
    mutationFn: revokePermissionsFromUserMutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["user-permissions", userId],
      });
      queryClient.invalidateQueries({ queryKey: ["groups", userId] });
    },
  });

  /**
   * Handle removing a member from the group
   */
  const handleRemoveUserFromGroup = (groupId: string) => {
    if (!userId || isRootUser) return;
    setConfirmRemoveFromGroup(groupId);
  };

  /**
   * Handle adding user to a group
   */
  const handleAddUserToGroup = (groupId: string) => {
    if (!userId || isRootUser) return;
    // TODO: Add confirmation dialog
    addUserToGroupMutation.mutate({
      userId,
      groupId,
    });
  };

  /**
   * Handle revoking a permission from the group
   */
  const handleRevokePermission = (permissionCode: string) => {
    if (!userId || isRootUser) return;
    setConfirmRevokeUserPerm(permissionCode);
  };

  /**
   * Navigate to grant permissions page
   */
  const handleGrantPermissions = () => {
    if (isRootUser) return;
    navigate(`/users/${userId}/permissions`);
  };

  // Loading state
  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <AppLoader text={"Loading user"} />
      </div>
    );
  }

  // Group not found
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertDescription>User not found</AlertDescription>
        </Alert>
        <Button
          variant="outline"
          onClick={() => navigate(AppHref.usersRoute)}
          className="mt-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Users
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(AppHref.usersRoute)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Users
        </Button>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold">{user.full_name}</h1>
                {isRootUser && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-md text-sm font-medium">
                    <Crown className="h-4 w-4" />
                    <span>Root User</span>
                  </div>
                )}
              </div>
              <p className="text-gray-600 mt-2">{user.email || "No email"}</p>
            </div>
          </div>

          <PermissionGuard permission="users:update">
            {!isRootUser && (
              <Button
                variant="outline"
                onClick={() => navigate(`/users/${userId}/edit`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit User
              </Button>
            )}
          </PermissionGuard>
        </div>
      </div>

      {/* Root User Alert */}
      {isRootUser && (
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <Crown className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-700">
            This user is a root user with full system access. Root users cannot
            be added to groups or have their permissions modified as they
            inherently have all permissions.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Groups
              </CardTitle>
              {isRootUser && (
                <span className="text-xs text-gray-500 italic">
                  Root users don't need groups
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-gray-400" />
              <span className="text-2xl font-bold">{userGroups.length}</span>
              {!isRootUser && (
                <span className="text-gray-500 text-sm">
                  / {combinedGroups.length} total
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Permissions
              </CardTitle>
              {isRootUser && (
                <span className="text-xs text-gray-500 italic">
                  Has all permissions
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-gray-400" />
              <span className="text-2xl font-bold">
                {isRootUser ? "∞" : permissions.length}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="groups">Groups</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        {/* Groups Tab */}
        <TabsContent value="groups" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Groups</CardTitle>
                  <CardDescription>
                    {isRootUser
                      ? "Root users have full system access and don't need group membership."
                      : "Groups that this user belongs to and inherits permissions from."}
                  </CardDescription>
                </div>

                {!isRootUser && (
                  <PermissionGuard
                    permissions={["users:update", "groups:update"]}
                  >
                    <Button
                      onClick={() => navigate(AppHref.groupsRoute)}
                      size="sm"
                      variant="outline"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Manage All Groups
                    </Button>
                  </PermissionGuard>
                )}
              </div>
            </CardHeader>

            <CardContent>
              {isLoadingGroups || !allGroupsData ? (
                <div className="flex items-center justify-center py-8">
                  <AppLoader text={"Loading user groups"} />
                </div>
              ) : isRootUser ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Crown className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium mb-2">
                    Root User - Full System Access
                  </p>
                  <p className="text-gray-500 text-sm max-w-md mx-auto">
                    This user is a root user and inherently has access to all
                    system functionality. Group membership is not applicable for
                    root users.
                  </p>
                </div>
              ) : combinedGroups.length > 0 ? (
                <div className="space-y-3">
                  {combinedGroups.map((group) => (
                    <div
                      key={group.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{group.name}</p>
                          {group.isMember && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded font-medium">
                              Member
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {group.description}
                        </p>
                      </div>

                      <PermissionGuard permission="groups:update">
                        {group.isMember ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleRemoveUserFromGroup(group.id)}
                            disabled={
                              removeUserFromGroupMutation.isPending ||
                              isRootUser
                            }
                          >
                            <UserMinus className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => handleAddUserToGroup(group.id)}
                            disabled={
                              addUserToGroupMutation.isPending || isRootUser
                            }
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add to Group
                          </Button>
                        )}
                      </PermissionGuard>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No groups available</p>

                  {canUpdate && !isRootUser && (
                    <Button
                      onClick={() => navigate(AppHref.groupsRoute)}
                      size="sm"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Create Group
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>User Permissions</CardTitle>
                  <CardDescription>
                    {isRootUser
                      ? "Root users have all permissions by default."
                      : "Permissions assigned to this user"}
                  </CardDescription>
                </div>

                {!isRootUser && (
                  <PermissionGuard permission="permissions:grant">
                    <Button
                      onClick={handleGrantPermissions}
                      size="sm"
                      disabled={isRootUser}
                    >
                      <ShieldPlus className="h-4 w-4 mr-2" />
                      Grant Permissions
                    </Button>
                  </PermissionGuard>
                )}
              </div>
            </CardHeader>

            <CardContent>
              {isLoadingPermissions ? (
                <div className="flex items-center justify-center py-8">
                  <AppLoader text={"Loading permissions"} />
                </div>
              ) : isRootUser ? (
                <div className="text-center py-12 bg-yellow-50 rounded-lg">
                  <Crown className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                  <div className="max-w-md mx-auto">
                    <p className="text-gray-700 font-medium mb-3">
                      Root User Permission Summary
                    </p>
                    <div className="space-y-3 text-left">
                      <div className="flex items-center gap-2 p-3 bg-white rounded border">
                        <Shield className="h-5 w-5 text-yellow-500" />
                        <div>
                          <p className="font-medium">Full System Access</p>
                          <p className="text-sm text-gray-600">
                            Has all permissions including administrative
                            functions
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-white rounded border">
                        <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                          *
                        </code>
                        <div>
                          <p className="font-medium">Wildcard Permission</p>
                          <p className="text-sm text-gray-600">
                            Superuser access to all system resources
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : permissions.length > 0 ? (
                <div className="space-y-3">
                  {permissions.map((permission) => (
                    <div
                      key={permission.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                            {permission.code}
                          </code>
                          {permission.code === "*" && (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded font-medium">
                              SUPERUSER
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {permission.name}
                        </p>
                        {permission.description && (
                          <p className="text-xs text-gray-500 mt-1">
                            {permission.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          Granted{" "}
                          {new Date(permission.granted_at).toLocaleDateString()}
                        </p>
                      </div>

                      <PermissionGuard permission="permissions:revoke">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() =>
                            handleRevokePermission(permission.code)
                          }
                          disabled={
                            revokePermissionMutation.isPending || isRootUser
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </PermissionGuard>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Shield className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">
                    No permissions assigned to this user
                  </p>

                  {canGrantPermissions && !isRootUser && (
                    <Button onClick={handleGrantPermissions} size="sm">
                      <ShieldPlus className="h-4 w-4 mr-2" />
                      Grant First Permission
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <AlertDialog
        open={!!confirmRemoveFromGroup}
        onOpenChange={() => setConfirmRemoveFromGroup(null)}
      >
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove user from group?</AlertDialogTitle>
            <AlertDialogDescription>
              This user will lose all permissions inherited from this group.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="hover:cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="text-red-500 bg-black hover:cursor-pointer"
              onClick={() => {
                if (confirmRemoveFromGroup && userId) {
                  removeUserFromGroupMutation.mutate({
                    userId,
                    groupId: confirmRemoveFromGroup,
                  });
                }
                setConfirmRemoveFromGroup(null);
              }}
            >
              Remove User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!confirmRevokeUserPerm}
        onOpenChange={() => setConfirmRevokeUserPerm(null)}
      >
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Revoke permission{" "}
              <span className="font-mono text-sm bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded">
                {confirmRevokeUserPerm}
              </span>
              ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              The user will lose this permission. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="hover:cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="text-red-500 bg-black hover:cursor-pointer"
              onClick={() => {
                if (confirmRevokeUserPerm && userId) {
                  revokePermissionMutation.mutate({
                    userId,
                    permissionCodes: [confirmRevokeUserPerm],
                  });
                }
                setConfirmRevokeUserPerm(null);
              }}
            >
              Revoke Permission
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
