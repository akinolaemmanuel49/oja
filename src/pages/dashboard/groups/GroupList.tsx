import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button,Card,CardContent,CardHeader,CardTitle,AlertDialog,AlertDialogAction,AlertDialogCancel,AlertDialogContent,AlertDialogDescription,AlertDialogFooter,AlertDialogHeader,AlertDialogTitle } from "@oja/ui";
import { Plus, Edit, Trash2, Users, Shield } from "lucide-react";
import { PermissionGuard } from "@/components/guards/PermissionGuard";
import { usePermissions } from "@/hooks/usePermissions";
import { fetchGroups } from "@/api/groups/fetchGroups";
import type { Group } from "@/types/group";
import { AppHref } from "@/routes/constants";
import { DeleteGroupMutationFn } from "@/api/groups/deleteGroup";
import { AppLoader } from "@/components/loaders/AppLoader";
import { FadeUp, Stagger, StaggerItem } from "@oja/motion-design";
import { motion } from "motion/react";

export default function GroupList() {
  const navigate = useNavigate();
  const page = 1;
  const pageSize = 20;
  const queryClient = useQueryClient();
  const { can } = usePermissions();

  const [confirmDeleteGroup, setConfirmDeleteGroup] = useState<string | null>(null);

  const {
    data: paginatedResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["groups", page, pageSize],
    queryFn: fetchGroups,
    enabled: can("groups:read"),
  });

  const deleteGroupMutation = useMutation({
    mutationFn: DeleteGroupMutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    },
  });

  const groups = useMemo(() => paginatedResponse?.data ?? [], [paginatedResponse]);
  const totalGroupCount = useMemo(() => paginatedResponse?.total ?? 0, [paginatedResponse]);

  const canCreate = can("groups:create");
  const canUpdate = can("groups:update");
  const canDelete = can("groups:delete");

  const handleEditClick = (group: Group) => navigate(`/groups/${group.id}/edit`);
  const handleCreateClick = () => navigate(AppHref.createGroupRoute);
  const handleDeleteClick = (group: Group) => setConfirmDeleteGroup(group.id);
  const handleViewDetails = (group: Group) => navigate(`/groups/${group.id}`);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <AppLoader text={"Loading groups"} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">Error loading groups: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FadeUp>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Groups</h1>
            <p className="text-gray-600 mt-1">Organize users and manage permissions at scale</p>
          </div>
          {canCreate && (
            <PermissionGuard permission="groups:create">
              <motion.div whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.02 }}>
                <Button onClick={handleCreateClick}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Group
                </Button>
              </motion.div>
            </PermissionGuard>
          )}
        </div>
      </FadeUp>

      {totalGroupCount > 0 ? (
        <Stagger className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <StaggerItem key={group.id}>
              <motion.div
                whileHover={{ y: -4, transition: { type: "spring", damping: 20, stiffness: 300 } }}
                className="ring-1 ring-black/5 shadow-sm rounded-xl"
              >
                <Card>
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <div className="space-y-1">
                      <CardTitle className="text-lg font-semibold">{group.name}</CardTitle>
                      <p className="text-sm text-gray-500 line-clamp-2">{group.description || "No description"}</p>
                    </div>
                    <Shield className="h-5 w-5 text-gray-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{group.member_count} members</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Shield className="h-4 w-4" />
                          <span>{group.permission_count} permissions</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => handleViewDetails(group)}>View Details</Button>
                        {(canUpdate || canDelete) && (
                          <div className="flex gap-1">
                            <PermissionGuard permission="groups:update">
                              <Button variant="ghost" size="sm" onClick={() => handleEditClick(group)} title="Edit group" className="hover:cursor-pointer"><Edit className="h-4 w-4" /></Button>
                            </PermissionGuard>
                            <PermissionGuard permission="groups:delete">
                              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDeleteClick(group)} title="Delete group"><Trash2 className="h-4 w-4" /></Button>
                            </PermissionGuard>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </StaggerItem>
          ))}
        </Stagger>
      ) : (
        <FadeUp>
          <Card className="ring-1 ring-black/5 shadow-sm">
            <CardContent className="text-center py-12">
              <Shield className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No groups found</p>
              <p className="text-sm text-gray-400 mb-4">Create groups to organize users and assign permissions at scale</p>
              <PermissionGuard permission="groups:create">
                <Button onClick={handleCreateClick}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Group
                </Button>
              </PermissionGuard>
            </CardContent>
          </Card>
        </FadeUp>
      )}
      <AlertDialog open={!!confirmDeleteGroup} onOpenChange={() => setConfirmDeleteGroup(null)}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete group?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the group and remove all member associations.
              <strong className="text-destructive"> This action cannot be undone.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="hover:cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="text-red-500 bg-black hover:cursor-pointer"
              onClick={() => {
                if (confirmDeleteGroup) {
                  deleteGroupMutation.mutate({ groupId: confirmDeleteGroup });
                }
                setConfirmDeleteGroup(null);
              }}
            >
              Delete Group
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
