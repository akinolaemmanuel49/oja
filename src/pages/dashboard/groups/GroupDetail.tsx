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
} from "lucide-react";
import { PermissionGuard } from "@/components/guards/PermissionGuard";
import { usePermissions } from "@/hooks/usePermissions";
import { fetchGroup } from "@/api/groups/fetchGroup";
import { listGroupMembers } from "@/api/groups/listGroupMembers";
import { listGroupPermissions } from "@/api/groups/listGroupPermissions";
import { removeUsersFromGroupMutationFn } from "@/api/groups/removeUsersFromGroup";
import { revokePermissionsFromGroupMutationFn } from "@/api/groups/revokePermissionsFromGroup";
import { AppHref } from "@/routes/constants";
import { AppLoader } from "@/components/loaders/AppLoader";

export default function GroupDetail() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const groupMembersPage = 1;
  const groupMembersPageSize = 20;
  const groupPermissionsPage = 1;
  const groupPermissionsPageSize = 20;
  const [confirmRemoveMember, setConfirmRemoveMember] = useState<string | null>(
    null,
  );
  const [confirmRevokePermission, setConfirmRevokePermission] = useState<
    string | null
  >(null);
  const { can } = usePermissions();
  const [selectedTab, setSelectedTab] = useState("members");

  // Fetch group data
  const { data: group, isLoading: isLoadingGroup } = useQuery({
    queryKey: ["groups", groupId!],
    queryFn: fetchGroup,
    enabled: !!groupId,
  });

  // Fetch group members
  const { data: membersData, isLoading: isLoadingMembers } = useQuery({
    queryKey: [
      "group-members",
      groupId!,
      groupMembersPage,
      groupMembersPageSize,
    ],
    queryFn: listGroupMembers,
    enabled: !!groupId && selectedTab === "members",
  });

  // Fetch group permissions
  const { data: permissionsData, isLoading: isLoadingPermissions } = useQuery({
    queryKey: [
      "group-permissions",
      groupId!,
      groupPermissionsPage,
      groupPermissionsPageSize,
    ],
    queryFn: listGroupPermissions,
    enabled: !!groupId,
  });

  const members = useMemo(() => membersData?.data || [], [membersData]);
  const permissions = useMemo(
    () => permissionsData?.data || [],
    [permissionsData],
  );

  // Permission checks
  const canUpdate = can("groups:update");
  const canGrantPermissions = can("permissions:grant");
  // const canRevokePermissions = can("permissions:revoke");

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: removeUsersFromGroupMutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group-members", groupId] });
      queryClient.invalidateQueries({ queryKey: ["groups", groupId] });
    },
  });

  // Revoke permission mutation
  const revokePermissionMutation = useMutation({
    mutationFn: revokePermissionsFromGroupMutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["group-permissions", groupId],
      });
      queryClient.invalidateQueries({ queryKey: ["groups", groupId] });
    },
  });

  /**
   * Handle removing a member from the group
   */
  const handleRemoveMember = (userId: string) => {
    setConfirmRemoveMember(userId);
  };
  // const handleRemoveMember = (userId: string) => {
  //   if (!groupId) return;
  //   // TODO: Add confirmation dialog
  //   removeMemberMutation.mutate({
  //     groupId,
  //     userIds: [userId],
  //   });
  // };

  /**
   * Handle revoking a permission from the group
   */
  const handleRevokePermission = (permissionCode: string) => {
    setConfirmRevokePermission(permissionCode);
  };
  // const handleRevokePermission = (permissionCode: string) => {
  //   if (!groupId) return;
  //   // TODO: Add confirmation dialog
  //   revokePermissionMutation.mutate({
  //     groupId,
  //     permissionCodes: [permissionCode],
  //   });
  // };

  /**
   * Navigate to add members page
   */
  const handleAddMembers = () => {
    navigate(`/groups/${groupId}/membership`);
  };

  /**
   * Navigate to grant permissions page
   */
  const handleGrantPermissions = () => {
    navigate(`/groups/${groupId}/permissions`);
  };

  // Loading state
  if (isLoadingGroup) {
    return (
      <div className="flex items-center justify-center h-64">
        <AppLoader text={"Loading group data"} />
      </div>
    );
  }

  // Group not found
  if (!group) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
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
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(AppHref.groupsRoute)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Groups
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{group.name}</h1>
            <p className="text-gray-600 mt-2">
              {group.description || "No description"}
            </p>
          </div>

          <PermissionGuard permission="groups:update">
            <Button
              variant="outline"
              onClick={() => navigate(`/groups/${groupId}/edit`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Group
            </Button>
          </PermissionGuard>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-gray-400" />
              <span className="text-2xl font-bold">{members.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-gray-400" />
              <span className="text-2xl font-bold">{permissions.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        {/* Members Tab */}
        <TabsContent value="members" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Group Members</CardTitle>
                  <CardDescription>
                    Users who belong to this group and inherit its permissions
                  </CardDescription>
                </div>

                <PermissionGuard permission="groups:update">
                  <Button onClick={handleAddMembers} size="sm">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Members
                  </Button>
                </PermissionGuard>
              </div>
            </CardHeader>

            <CardContent>
              {isLoadingMembers ? (
                <div className="flex items-center justify-center py-8">
                  <AppLoader text={"Loading group members"} />
                </div>
              ) : members.length > 0 ? (
                <div className="space-y-3">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div>
                        <p className="font-medium">{member.full_name}</p>
                        <p className="text-sm text-gray-600">{member.email}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Added {new Date(member.added_at).toLocaleDateString()}
                        </p>
                      </div>

                      <PermissionGuard permission="groups:update">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleRemoveMember(member.id)}
                          disabled={removeMemberMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </PermissionGuard>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No members in this group</p>

                  {canUpdate && (
                    <Button onClick={handleAddMembers} size="sm">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add First Member
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
                  <CardTitle>Group Permissions</CardTitle>
                  <CardDescription>
                    Permissions assigned to this group (inherited by all
                    members)
                  </CardDescription>
                </div>

                <PermissionGuard permission="permissions:grant">
                  <Button onClick={handleGrantPermissions} size="sm">
                    <ShieldPlus className="h-4 w-4 mr-2" />
                    Grant Permissions
                  </Button>
                </PermissionGuard>
              </div>
            </CardHeader>

            <CardContent>
              {isLoadingPermissions ? (
                <div className="flex items-center justify-center py-8">
                  <AppLoader text={"Loading group permissions"} />
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
                          disabled={revokePermissionMutation.isPending}
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
                    No permissions assigned to this group
                  </p>

                  {canGrantPermissions && (
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
        open={!!confirmRemoveMember}
        onOpenChange={() => setConfirmRemoveMember(null)}
      >
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove member?</AlertDialogTitle>
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
                if (confirmRemoveMember && groupId) {
                  removeMemberMutation.mutate({
                    groupId,
                    userIds: [confirmRemoveMember],
                  });
                }
                setConfirmRemoveMember(null);
              }}
            >
              Remove Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!confirmRevokePermission}
        onOpenChange={() => setConfirmRevokePermission(null)}
      >
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Revoke permission{" "}
              <span className="font-mono text-sm bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded">
                {confirmRevokePermission}
              </span>
              ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              All members of this group will lose this permission. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="hover:cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="text-red-500 bg-black hover:cursor-pointer"
              onClick={() => {
                if (confirmRevokePermission && groupId) {
                  revokePermissionMutation.mutate({
                    groupId,
                    permissionCodes: [confirmRevokePermission],
                  });
                }
                setConfirmRevokePermission(null);
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
