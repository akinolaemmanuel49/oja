import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Store, Package, Users, GroupIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getDashboardData } from "@/api/analytics/getDashboardData";
import { useMemo } from "react";
import { AppLoader } from "@/components/loaders/AppLoader";

export default function DashboardHome() {
  const { userWithPermissions, isLoading: isLoadingAuth } = useAuth();

  // Fetch user data
  const { data, isLoading: isLoadingDashboard } = useQuery({
    queryKey: ["analytics-dashboard"],
    queryFn: getDashboardData,
    enabled: !!userWithPermissions?.user,
  });

  const dashboardData = useMemo(() => {
    if (!data) return null;
    return data;
  }, [data]);

  const cards = [
    {
      title: "Storefronts",
      permission: "storefronts:read",
      icon: <Store className="h-5 w-5 text-muted-foreground" />,
      count: dashboardData?.TotalActiveStorefrontsCount,
      subtitle: "Active storefronts",
      href: "/storefronts",
    },
    {
      title: "Products",
      permission: "products:read",
      icon: <Package className="h-5 w-5 text-muted-foreground" />,
      count: dashboardData?.TotalVisibleProductsCount,
      subtitle: "Products in catalog",
      href: "/products",
    },
    {
      title: "Users",
      permission: "users:read",
      icon: <Users className="h-5 w-5 text-muted-foreground" />,
      count: dashboardData?.TotalUsersCount,
      subtitle: "Members of your organization",
      href: "/users",
    },
    {
      title: "Groups",
      permission: "groups:read",
      icon: <GroupIcon className="h-5 w-5 text-muted-foreground" />,
      count: dashboardData?.TotalGroupsCount,
      subtitle: "Groups in your organization",
      href: "/groups",
    },
  ];

  // Only render cards the user has permission for
  const visibleCards = cards.filter((c) =>
    userWithPermissions?.permissions.includes(c.permission),
  );

  // Action items configuration
  const actionItems = [
    {
      permission: "storefronts:create",
      label: "• Add storefronts to sell your products",
    },
    {
      permission: "products:create",
      label: "• Add products to your catalog",
    },
    {
      permission: "users:create",
      label: "• Add team members to collaborate",
    },
    {
      permission: "groups:create",
      label: "• Add groups to organize your team",
    },
  ];

  // Filter items based on user permissions
  const visibleActions = actionItems.filter((item) =>
    userWithPermissions?.permissions.includes(item.permission),
  );

  if (isLoadingAuth || isLoadingDashboard) {
    return (
      <div className="flex h-screen items-center justify-center">
        <AppLoader />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Stats Grid - Only show cards user has permission to access */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visibleCards.map((c) => (
          <Card key={c.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{c.title}</CardTitle>
              {c.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{c.count}</div>
              <p className="text-xs text-muted-foreground">{c.subtitle}</p>
              <Button variant="link" className="mt-4 px-0" asChild>
                <a href={c.href}>Manage {c.title.toLowerCase()} →</a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Welcome Section */}
      <div className="mt-10">
        <h2 className="mb-4 text-xl font-semibold">
          Welcome, {userWithPermissions?.user?.first_name}!
        </h2>

        {userWithPermissions?.permissions &&
        userWithPermissions.permissions.length > 0 ? (
          <p className="text-muted-foreground mb-4">Here's what you can do:</p>
        ) : null}

        <div className="space-y-2">
          {visibleActions.length > 0 ? (
            visibleActions.map((item) => (
              <p key={item.permission} className="text-sm text-gray-600">
                {item.label}
              </p>
            ))
          ) : (
            <p className="text-sm text-gray-500">
              You have no actions available.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
