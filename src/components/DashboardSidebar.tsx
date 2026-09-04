import { Home, Users, Package, Store, Group } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { PermissionGuard } from "@/components/guards/PermissionGuard";
import { AppHref } from "@/routes/constants";
import { motion } from "motion/react";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

type NavItem = {
  icon: typeof Home;
  label: string;
  href: string;
  ariaLabel: string;
  permission?: string;
};

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const location = useLocation();

  const navItems: NavItem[] = [
    {
      icon: Home,
      label: "Dashboard",
      href: AppHref.dashboardHomeRoute,
      ariaLabel: "Dashboard",
    },
    {
      icon: Store,
      label: "Storefronts",
      href: AppHref.storefrontsRoute,
      permission: "storefronts:read",
      ariaLabel: "Storefronts",
    },
    {
      icon: Package,
      label: "Products",
      href: AppHref.productsRoute,
      permission: "products:read",
      ariaLabel: "Products",
    },
    {
      icon: Users,
      label: "Users",
      href: AppHref.usersRoute,
      permission: "users:read",
      ariaLabel: "Users",
    },
    {
      icon: Group,
      label: "Groups",
      href: AppHref.groupsRoute,
      permission: "groups:read",
      ariaLabel: "Groups",
    },
  ];

  const isActive = (href: string) => {
    if (href === AppHref.dashboardHomeRoute) {
      return location.pathname === AppHref.dashboardHomeRoute;
    }
    return location.pathname.startsWith(href);
  };

  const renderNavItem = (item: NavItem) => {
    const Icon = item.icon;
    const active = isActive(item.href);
    const ariaLabel = item.ariaLabel;

    const navLink = (
      <Link
        aria-label={ariaLabel}
        to={item.href}
        className={`
          flex items-center gap-3 px-3 py-2 rounded-lg transition-colors relative
          ${active
            ? "bg-blue-50 text-blue-600"
            : "hover:bg-gray-100 text-gray-700"
          }
        `}
        onClick={onClose}
      >
        {active && (
          <motion.div
            layoutId="sidebar-active-pill"
            className="absolute inset-0 rounded-lg bg-blue-50"
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          />
        )}
        <Icon
          className={`h-5 w-5 shrink-0 relative z-10 transition-colors duration-200 ${active ? "text-blue-600" : "text-gray-600"}`}
        />
        <span
          className={`
            whitespace-nowrap transition-opacity duration-300 relative z-10
            ${isOpen ? "opacity-100" : "opacity-0 invisible"}
          `}
        >
          {item.label}
        </span>
      </Link>
    );

    if (item.permission) {
      return (
        <PermissionGuard key={item.href} permission={item.permission}>
          {navLink}
        </PermissionGuard>
      );
    }

    return <div key={item.href}>{navLink}</div>;
  };

  return (
    <>
      {/* Desktop sidebar - collapsible */}
      <aside
        className={`
          hidden lg:block
          fixed left-0 top-16 bottom-0
          bg-white border-r border-gray-200
          transition-all duration-300
          z-20
          ${isOpen ? "w-64" : "w-18"}
        `}
      >
        <nav className="p-4 space-y-2">{navItems.map(renderNavItem)}</nav>
      </aside>

      {/* Mobile sidebar - slides in from left */}
      <aside
        className={`
          lg:hidden
          fixed left-0 top-16 bottom-0 w-64
          bg-white border-r border-gray-200
          transition-transform duration-300
          z-30
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <nav className="p-4 space-y-2">{navItems.map(renderNavItem)}</nav>
      </aside>
    </>
  );
};
