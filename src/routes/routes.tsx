import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AppHref } from "./constants";
import { errorRoutes, protectedRoutes, publicRoutes } from "./config";
import { lazy } from "react";

const StorefrontPreviewPage = lazy(
  () => import("@/pages/dashboard/storefronts/StorefrontPreviewPage"),
);
import { PermissionRoute } from "@/components/guards/PermissionRoute";
import { ProtectedRoute } from "@/components/guards/ProtectedRoute";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { PublicRoute } from "@/components/guards/PublicRoute";
import { getRouteLabel } from "@/lib/getRouteLabel";
import { Suspense } from "react";
import { AppLoader } from "@/components/loaders/AppLoader";
import { AppMeta } from "@/components/meta/AppMeta";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function AppRoutes() {
  const meta = usePageMeta();
  const location = useLocation();

  const label = getRouteLabel(location.pathname);

  return (
    <>
      {meta && <AppMeta {...meta} />}

      <Suspense fallback={<AppLoader path={label} />}>
        <Routes>
          {/* Public routes */}
          <Route element={<PublicRoute />}>
            {publicRoutes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={route.element}
              />
            ))}
          </Route>

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              {protectedRoutes.map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={
                    route.permissions ? (
                      <PermissionRoute permissions={route.permissions}>
                        {route.element}
                      </PermissionRoute>
                    ) : (
                      route.element
                    )
                  }
                />
              ))}
            </Route>

            {/* Standalone full-screen storefront preview — renders OUTSIDE the
                dashboard layout so it is never clipped by the main nav */}
            <Route
              path="/storefronts/:storeId/preview"
              element={
                <PermissionRoute permissions={["storefronts:update"]}>
                  <StorefrontPreviewPage />
                </PermissionRoute>
              }
            />
          </Route>

          {/* Error routes */}
          {errorRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}

          {/* Catch all */}
          <Route
            path="*"
            element={
              <Navigate
                to={AppHref.notFoundRoute}
                replace
                state={{ from: location.pathname }}
              />
            }
          />
        </Routes>
      </Suspense>
    </>
  );
}
