import { useAuth } from "@/hooks/useAuth";
import { Card } from "@oja/ui";
import { Store, Package, Users, GroupIcon, ArrowUpRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getDashboardData } from "@/api/analytics/getDashboardData";
import { useMemo } from "react";
import { AppLoader } from "@/components/loaders/AppLoader";
import { MotionCard, AnimatedNumber, Stagger, StaggerItem, FadeUp } from "@oja/motion-design";
import { motion } from "motion/react";

export default function DashboardHome() {
  const { userWithPermissions, isLoading: isLoadingAuth } = useAuth();

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
      icon: <Store className="h-5 w-5 text-blue-500" />,
      count: dashboardData?.TotalActiveStorefrontsCount,
      subtitle: "Active storefronts",
      href: "/storefronts",
    },
    {
      title: "Products",
      permission: "products:read",
      icon: <Package className="h-5 w-5 text-emerald-500" />,
      count: dashboardData?.TotalVisibleProductsCount,
      subtitle: "Products in catalog",
      href: "/products",
    },
    {
      title: "Users",
      permission: "users:read",
      icon: <Users className="h-5 w-5 text-violet-500" />,
      count: dashboardData?.TotalUsersCount,
      subtitle: "Members of your organization",
      href: "/users",
    },
    {
      title: "Groups",
      permission: "groups:read",
      icon: <GroupIcon className="h-5 w-5 text-amber-500" />,
      count: dashboardData?.TotalGroupsCount,
      subtitle: "Groups in your organization",
      href: "/groups",
    },
  ];

  const visibleCards = cards.filter((c) =>
    userWithPermissions?.permissions.includes(c.permission),
  );

  const actionItems = [
    {
      permission: "storefronts:create",
      label: "Add storefronts to sell your products",
    },
    {
      permission: "products:create",
      label: "Add products to your catalog",
    },
    {
      permission: "users:create",
      label: "Add team members to collaborate",
    },
    {
      permission: "groups:create",
      label: "Add groups to organize your team",
    },
  ];

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
    <div className="p-6 lg:p-8">
      {/* Welcome hero */}
      <FadeUp>
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Welcome back, {userWithPermissions?.user?.first_name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here's an overview of your organization.
          </p>
        </div>
      </FadeUp>

      {/* Stats Grid */}
      <Stagger className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {visibleCards.map((c) => (
          <StaggerItem key={c.title}>
            <MotionCard className="border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                  {c.icon}
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground/50" />
              </div>
              <div className="mt-4 text-2xl font-semibold tracking-tight">
                <AnimatedNumber value={c.count ?? 0} />
              </div>
              <p className="text-sm font-medium text-foreground">{c.title}</p>
              <p className="text-xs text-muted-foreground">{c.subtitle}</p>
              <motion.a
                href={c.href}
                className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary"
                whileHover={{ x: 3 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                Manage <span aria-hidden>→</span>
              </motion.a>
            </MotionCard>
          </StaggerItem>
        ))}
      </Stagger>

      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, type: "spring", damping: 25, stiffness: 300 }}
        className="mt-10"
      >
        <Card className="bg-card p-6">
          {userWithPermissions?.permissions &&
          userWithPermissions.permissions.length > 0 ? (
            <>
              <h2 className="text-base font-semibold">Quick start</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Here's what you can do with your current permissions:
              </p>
              <div className="mt-4 space-y-2">
                {visibleActions.length > 0 ? (
                  visibleActions.map((item, i) => (
                    <motion.p
                      key={item.permission}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: 0.5 + i * 0.08,
                        type: "spring",
                        damping: 25,
                        stiffness: 300,
                      }}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {item.label}
                    </motion.p>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    You have no actions available.
                  </p>
                )}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Welcome! You have no permissions assigned yet.
            </p>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
