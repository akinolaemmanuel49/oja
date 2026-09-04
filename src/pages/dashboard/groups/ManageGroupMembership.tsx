import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { Button,Input,Card,CardContent,CardDescription,CardHeader,CardTitle,Checkbox,Alert,AlertDescription } from "@oja/ui";
import { ArrowLeft, Loader2, Search, UserPlus } from "lucide-react";
import { fetchGroup } from "@/api/groups/fetchGroup";
import { fetchUsers } from "@/api/users/fetchUsers";
import { listGroupMembers } from "@/api/groups/listGroupMembers";
import { addUsersToGroupMutationFn } from "@/api/groups/addUsersToGroup";
import { AppHref } from "@/routes/constants";
import { AppLoader } from "@/components/loaders/AppLoader";

export default function ManageGroupMembership() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const usersPage = 1;
  const usersPageSize = 20;
  const groupMembersPage = 1;
  const groupMembersPageSize = 20;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(
    new Set(),
  );

  // Fetch group data
  const { data: group, isLoading: isLoadingGroup } = useQuery({
    queryKey: ["groups", groupId!],
    queryFn: fetchGroup,
    enabled: !!groupId,
  });

  // Fetch all users in tenant
  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users", usersPage, usersPageSize],
    queryFn: fetchUsers,
  });

  // Fetch current group members
  const { data: membersData } = useQuery({
    queryKey: [
      "group-members",
      groupId!,
      groupMembersPage,
      groupMembersPageSize,
    ],
    queryFn: listGroupMembers,
    enabled: !!groupId,
  });

  const users = useMemo(() => {
    const users = usersData?.data || [];
    return users.filter((user) => user.is_root === false);
  }, [usersData]);

  const currentMemberIds = useMemo(
    () => new Set(membersData?.data?.map((m) => m.id) || []),
    [membersData],
  );

  // Filter users: exclude current members and apply search
  const availableUsers = useMemo(() => {
    return users
      .filter((user) => !currentMemberIds.has(user.id))
      .filter((user) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
          user.full_name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
        );
      });
  }, [users, currentMemberIds, searchQuery]);

  // Add members mutation
  const addMembersMutation = useMutation({
    mutationFn: addUsersToGroupMutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group-members", groupId] });
      queryClient.invalidateQueries({ queryKey: ["groups", groupId] });
      navigate(`/groups/${groupId}`);
    },
  });

  /**
   * Toggle user selection
   */
  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  /**
   * Handle form submission
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedUserIds.size === 0) {
      return;
    }

    addMembersMutation.mutate({
      groupId: groupId!,
      userIds: Array.from(selectedUserIds),
    });
  };

  // Loading state
  if (isLoadingGroup || isLoadingUsers) {
    return (
      <div className="flex items-center justify-center h-64">
        <AppLoader text={`Loading ${isLoadingGroup ? "group" : "users"}`} />
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
    <div className="max-w-2xl mx-auto py-8 px-4">
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
        <h1 className="text-3xl font-bold">Add Members to {group.name}</h1>
        <p className="text-gray-600 mt-2">
          Select users to add to this group. They will inherit all group
          permissions.
        </p>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Select Members</CardTitle>
          <CardDescription>
            {selectedUserIds.size} user{selectedUserIds.size !== 1 ? "s" : ""}{" "}
            selected
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Error Alert */}
              {addMembersMutation.isError && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {addMembersMutation.error instanceof Error
                      ? addMembersMutation.error.message
                      : "Failed to add members. Please try again."}
                  </AlertDescription>
                </Alert>
              )}

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* User List */}
              <div className="border rounded-lg divide-y max-h-96 overflow-y-auto">
                {availableUsers.length > 0 ? (
                  availableUsers.map((user) => (
                    <label
                      key={user.id}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                    >
                      <Checkbox
                        checked={selectedUserIds.has(user.id)}
                        onCheckedChange={() => toggleUserSelection(user.id)}
                      />
                      <div className="flex-1">
                        <p className="font-medium">{user.full_name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </label>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    {searchQuery ? (
                      <p>
                        No users found matching "{searchQuery}" (Root user is
                        excluded)
                      </p>
                    ) : (
                      <p>
                        All valid users are already members of this group (Root
                        user is excluded)
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={
                    selectedUserIds.size === 0 || addMembersMutation.isPending
                  }
                  className="flex-1 hover:cursor-pointer"
                >
                  {addMembersMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add {selectedUserIds.size} Member
                  {selectedUserIds.size !== 1 ? "s" : ""}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/groups/${groupId}`)}
                  disabled={addMembersMutation.isPending}
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
