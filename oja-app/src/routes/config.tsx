import { lazy } from "react";

import { AppHref } from "./constants";

const Login = lazy(() => import("@/pages/auth/Login"));
const Signup = lazy(() => import("@/pages/auth/Signup"));

const DashboardHome = lazy(() => import("@/pages/dashboard/Home"));

const UserList = lazy(() => import("@/pages/dashboard/users/UserList"));
const CreateUser = lazy(() => import("@/pages/dashboard/users/CreateUser"));
const EditUser = lazy(() => import("@/pages/dashboard/users/EditUser"));
const UserDetail = lazy(() => import("@/pages/dashboard/users/UserDetail"));
const ManageUserPermissions = lazy(
  () => import("@/pages/dashboard/users/ManageUserPermissions"),
);

const GroupList = lazy(() => import("@/pages/dashboard/groups/GroupList"));
const GroupDetail = lazy(() => import("@/pages/dashboard/groups/GroupDetail"));
const CreateGroup = lazy(() => import("@/pages/dashboard/groups/CreateGroup"));
const EditGroup = lazy(() => import("@/pages/dashboard/groups/EditGroup"));
const ManageGroupMembership = lazy(
  () => import("@/pages/dashboard/groups/ManageGroupMembership"),
);
const ManageGroupPermissions = lazy(
  () => import("@/pages/dashboard/groups/ManageGroupPermissions"),
);

const StorefrontList = lazy(
  () => import("@/pages/dashboard/storefronts/StorefrontList"),
);
const CreateStorefront = lazy(
  () => import("@/pages/dashboard/storefronts/CreateStorefront"),
);
const EditStorefront = lazy(
  () => import("@/pages/dashboard/storefronts/EditStorefront"),
);
const StorefrontProducts = lazy(
  () => import("@/pages/dashboard/storefronts/StorefrontProducts"),
);
const StorefrontDesigner = lazy(
  () => import("@/pages/dashboard/storefronts/StorefrontDesigner"),
);

const ProductList = lazy(
  () => import("@/pages/dashboard/products/ProductList"),
);
const CreateProduct = lazy(
  () => import("@/pages/dashboard/products/CreateProduct"),
);
const EditProduct = lazy(
  () => import("@/pages/dashboard/products/EditProduct"),
);
const ProductDetail = lazy(
  () => import("@/pages/dashboard/products/ProductDetail"),
);

const ErrorPage = lazy(() => import("@/components/ErrorPage"));

type RouteMeta = {
  title: string;
  description?: string;
  noIndex?: boolean; // optional
  canonical?: string;
};

type RouteConfig = {
  path: string;
  element: React.ReactNode;
  permissions?: string[]; // Optional: Only for protected routes
  meta?: RouteMeta;
};

export const publicRoutes: RouteConfig[] = [
  { path: AppHref.loginRoute, element: <Login /> },
  { path: AppHref.signupRoute, element: <Signup /> },
];

export const protectedRoutes: RouteConfig[] = [
  {
    path: AppHref.dashboardHomeRoute,
    element: <DashboardHome />,
    meta: {
      title: "ọjà - Dashboard",
      description: "Overview of the ọjà marketplace",
      // canonical: `${window.location.origin}${AppHref.dashboardHomeRoute}`,
    },
  },
  // User Management
  {
    path: AppHref.usersRoute,
    element: <UserList />,
    permissions: ["users:read"],
    meta: {
      title: "ọjà - Users",
      description: "Manage user accounts",
      canonical: `${window.location.origin}${AppHref.usersRoute}`,
    },
  },
  {
    path: AppHref.createUserRoute,
    element: <CreateUser />,
    permissions: ["users:create"],
    meta: {
      title: "ọjà - Create User",
      description: "Create a user account",
      canonical: `${window.location.origin}${AppHref.createUserRoute}`,
    },
  },
  {
    path: "/users/:userId/edit",
    element: <EditUser />,
    permissions: ["users:update"],
    meta: {
      title: "ọjà - Update User",
      noIndex: true,
    },
  },
  {
    path: "/users/:userId",
    element: <UserDetail />,
    permissions: ["users:read"],
    meta: {
      title: "ọjà - User Detail",
      noIndex: true,
    },
  },
  {
    path: "/users/:userId/permissions",
    element: <ManageUserPermissions />,
    permissions: ["permissions:grant", "permissions:revoke"],
    meta: {
      title: "ọjà - Manage User Permissions",
      noIndex: true,
    },
  },
  // Group Management
  {
    path: AppHref.groupsRoute,
    element: <GroupList />,
    permissions: ["groups:read"],
    meta: {
      title: "ọjà - Groups",
      description: "Manage groups",
      canonical: `${window.location.origin}${AppHref.groupsRoute}`,
    },
  },
  {
    path: "/groups/:groupId",
    element: <GroupDetail />,
    permissions: ["groups:read"],
    meta: {
      title: "ọjà - Group Detail",
      noIndex: true,
    },
  },
  {
    path: "/groups/:groupId/membership",
    element: <ManageGroupMembership />,
    permissions: ["groups:update"],
    meta: {
      title: "ọjà - Manage Group Membership",
      noIndex: true,
    },
  },
  {
    path: "/groups/:groupId/permissions",
    element: <ManageGroupPermissions />,
    permissions: ["permissions:grant", "permissions:revoke"],
    meta: {
      title: "ọjà - Manage Group Permissions",
      noIndex: true,
    },
  },
  {
    path: AppHref.createGroupRoute,
    element: <CreateGroup />,
    permissions: ["groups:create"],
    meta: {
      title: "ọjà - Create Group",
      description: "Create a new group",
      canonical: `${window.location.origin}${AppHref.createGroupRoute}`,
    },
  },
  {
    path: "/groups/:groupId/edit",
    element: <EditGroup />,
    permissions: ["groups:update"],
    meta: {
      title: "ọjà - Edit Group",
      noIndex: true,
    },
  },
  // Storefronts
  {
    path: AppHref.storefrontsRoute,
    element: <StorefrontList />,
    permissions: ["storefronts:read"],
    meta: {
      title: "ọjà - Storefronts",
      description: "Manage storefronts",
      canonical: `${window.location.origin}${AppHref.storefrontsRoute}`,
    },
  },
  {
    path: AppHref.createStorefrontRoute,
    element: <CreateStorefront />,
    permissions: ["storefronts:create"],
    meta: {
      title: "ọjà - Create Storefront",
      description: "Create a new storefront",
      canonical: `${window.location.origin}${AppHref.createStorefrontRoute}`,
    },
  },
  {
    path: "/storefronts/:storeId/edit",
    element: <EditStorefront />,
    permissions: ["storefronts:update"],
    meta: {
      title: "ọjà - Edit Storefront",
      noIndex: true,
    },
  },
  {
    path: "/storefronts/:storeId/products",
    element: <StorefrontProducts />,
    permissions: ["storefronts:update"],
    meta: {
      title: "ọjà - Storefront Products",
      noIndex: true,
    },
  },
  {
    path: "/storefronts/:storeId/designer",
    element: <StorefrontDesigner />,
    permissions: ["storefronts:update"],
    meta: {
      title: "ọjà - Storefront Designer",
      noIndex: true,
    },
  },
  // Products
  {
    path: AppHref.productsRoute,
    element: <ProductList />,
    permissions: ["products:read"],
    meta: {
      title: "ọjà - Products",
      description: "Manage products",
      canonical: `${window.location.origin}${AppHref.productsRoute}`,
    },
  },
  {
    path: AppHref.createProductRoute,
    element: <CreateProduct />,
    permissions: ["products:create"],
    meta: {
      title: "ọjà - Create Product",
      description: "Create a new product",
      canonical: `${window.location.origin}${AppHref.createProductRoute}`,
    },
  },
  {
    path: "/products/:productId/edit",
    element: <EditProduct />,
    permissions: ["products:update"],
    meta: {
      title: "ọjà - Edit Product",
      noIndex: true,
    },
  },
  {
    path: "/products/:productId",
    element: <ProductDetail />,
    permissions: ["products:read"],
    meta: {
      title: "ọjà - Product Detail",
      description: "View product details",
    },
  },
];

export const errorRoutes: RouteConfig[] = [
  {
    path: AppHref.unauthorizedRoute,
    element: <ErrorPage />,
    meta: { title: "ọjà - Unauthorized", description: "Unauthorized access" },
  },
  {
    path: AppHref.forbiddenRoute,
    element: <ErrorPage />,
    meta: { title: "ọjà - Forbidden", description: "Forbidden access" },
  },
  {
    path: AppHref.notFoundRoute,
    element: <ErrorPage />,
    meta: { title: "ọjà - Not Found", description: "Page not found" },
  },
  {
    path: AppHref.serverErrorRoute,
    element: <ErrorPage />,
    meta: { title: "ọjà - Server Error", description: "Server error" },
  },
];
