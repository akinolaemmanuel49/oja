import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button,Card,CardContent,CardHeader,CardTitle } from "@oja/ui";
import { Plus, Edit, Trash2, Shield, Users, View } from "lucide-react";
import { PermissionGuard } from "@/components/guards/PermissionGuard";
import { usePermissions } from "@/hooks/usePermissions";
import { fetchUsers } from "@/api/users/fetchUsers";
import type { User } from "@/types/user";
import { AppHref } from "@/routes/constants";
import { useMemo } from "react";
import { AppLoader } from "@/components/loaders/AppLoader";
import { FadeUp } from "@oja/motion-design";
import { motion } from "motion/react";

export default function UserList() {
  const navigate = useNavigate();
  const { can } = usePermissions();
  const page = 1;
  const pageSize = 20;

  const {
    data: paginatedResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["users", page, pageSize],
    queryFn: fetchUsers,
    enabled: can("users:read"),
  });

  const users = useMemo(() => paginatedResponse?.data ?? [], [paginatedResponse]);
  const totalUserCount = useMemo(() => paginatedResponse?.total || 0, [paginatedResponse]);

  const canCreate = can("users:create");
  const canUpdate = can("users:update");
  const canDelete = can("users:delete");

  const handleViewClick = (user: User) => navigate(`/users/${user.id}`);
  const handleEditClick = (user: User) => navigate(`/users/${user.id}/edit`);
  const handleCreateClick = () => navigate(AppHref.createUserRoute);
  const handleDeleteClick = (user: User) => console.log("Delete user:", user.id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <AppLoader text={"Loading users"} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">Error loading users: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FadeUp>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Users</h1>
            <p className="text-gray-600 mt-1">Manage your team members and their access</p>
          </div>
          <PermissionGuard permission="users:create">
            <motion.div whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.02 }}>
              <Button onClick={handleCreateClick}>
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </motion.div>
          </PermissionGuard>
        </div>
      </FadeUp>

      <FadeUp delay={0.1}>
        <Card className="ring-1 ring-black/5 shadow-sm">
          <CardHeader>
            <CardTitle>Team Members ({users?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {users && totalUserCount > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Role</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                      {(canUpdate || canDelete) && (
                        <th className="text-right py-3 px-4 font-medium text-gray-600">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, i) => (
                      <motion.tr
                        key={user.id}
                        className="border-b hover:bg-gray-50/80"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03, type: "spring", damping: 25, stiffness: 300 }}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {user.full_name}
                            {user.is_root && <Shield className="h-4 w-4 text-yellow-500" />}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{user.email}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">{user.is_root ? "Root" : "Member"}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-sm ${user.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                            {user.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        {(canUpdate || canDelete) && (
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-end gap-2">
                              <PermissionGuard permission="users:read">
                                <Button variant="ghost" size="sm" onClick={() => handleViewClick(user)} title="View user"><View className="h-4 w-4" /></Button>
                              </PermissionGuard>
                              <PermissionGuard permission="users:update">
                                <Button variant="ghost" size="sm" onClick={() => handleEditClick(user)} title="Edit user" className="hover:cursor-pointer"><Edit className="h-4 w-4" /></Button>
                              </PermissionGuard>
                              <PermissionGuard permission="users:delete">
                                {!user.is_root && (
                                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDeleteClick(user)} title="Delete user"><Trash2 className="h-4 w-4" /></Button>
                                )}
                              </PermissionGuard>
                            </div>
                          </td>
                        )}
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No users found</p>
                {canCreate && (
                  <PermissionGuard permission="users:create">
                    <Button onClick={handleCreateClick}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First User
                    </Button>
                  </PermissionGuard>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </FadeUp>
    </div>
  );
}
