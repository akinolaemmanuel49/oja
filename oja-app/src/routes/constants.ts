export const PublicHref = {
  loginRoute: "/login",
  signupRoute: "/signup",
};

export const SystemHref = {
  unauthorizedRoute: "/401",
  forbiddenRoute: "/403",
  notFoundRoute: "/404",
  serverErrorRoute: "/500",
};

export const ProtectedHref = {
  dashboardHomeRoute: "/",
  usersRoute: "/users",
  createUserRoute: "/users/create",
  editUserRoute: (userId = ":id") => `/users/${userId}/edit`,
  groupsRoute: "/groups",
  groupDetailRoute: (groupId = ":id") => `/groups/${groupId}`,
  createGroupRoute: "/groups/create",
  editGroupRoute: (groupId = ":id") => `/groups/${groupId}/edit`,
  storefrontsRoute: "/storefronts",
  createStorefrontRoute: "/storefronts/create",
  editStorefrontRoute: (storeId = ":id") => `/storefronts/${storeId}/edit`,
  productsRoute: "/products",
  createProductRoute: "/products/create",
  editProductRoute: (productId = ":id") => `/products/${productId}/edit`,
  settingsRoute: "/settings",
};

export const AppHref = {
  ...PublicHref,
  ...ProtectedHref,
  ...SystemHref,
};
