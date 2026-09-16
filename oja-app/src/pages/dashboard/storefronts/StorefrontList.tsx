import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button,Card,CardContent,CardHeader,CardTitle } from "@oja/ui";
import { Plus, Edit, Trash2, Globe, Lock, Package, Paintbrush } from "lucide-react";
import { PermissionGuard } from "@/components/guards/PermissionGuard";
import { usePermissions } from "@/hooks/usePermissions";
import { fetchStorefronts } from "@/api/storefronts/fetchStorefronts";
import type { Storefront } from "@/types/storefront";
import { useMemo } from "react";
import { AppLoader } from "@/components/loaders/AppLoader";
import { FadeUp } from "@oja/motion-design";
import { motion } from "motion/react";

export default function StorefrontList() {
  const navigate = useNavigate();
  const page = 1;
  const pageSize = 20;
  const { can } = usePermissions();

  const {
    data: paginatedResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["storefronts", page, pageSize],
    queryFn: fetchStorefronts,
    enabled: can("storefronts:read"),
  });

  const storefronts = useMemo(() => paginatedResponse?.data ?? [], [paginatedResponse]);
  const totalStorefrontCount = useMemo(() => paginatedResponse?.total || 0, [paginatedResponse]);

  const canCreate = can("storefronts:create");
  const canUpdate = can("storefronts:update");
  const canDelete = can("storefronts:delete");

  const handleEditClick = (storefront: Storefront) => navigate(`/storefronts/${storefront.id}/edit`);
  const handleDesignerClick = (storefront: Storefront) => navigate(`/storefronts/${storefront.id}/designer`);
  const handleProductsClick = (storefront: Storefront) => navigate(`/storefronts/${storefront.id}/products`);
  const handleCreateClick = () => navigate("/storefronts/create");
  const handleDeleteClick = (storefront: Storefront) => console.log("Delete storefront:", storefront.id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <AppLoader text={"Loading storefronts"} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">Error loading storefronts: {(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FadeUp>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Storefronts</h1>
            <p className="text-gray-600 mt-1">Manage your storefronts and sales channels</p>
          </div>
          <PermissionGuard permission="storefronts:create">
            <motion.div whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.02 }}>
              <Button onClick={handleCreateClick}>
                <Plus className="h-4 w-4 mr-2" />
                Create Storefront
              </Button>
            </motion.div>
          </PermissionGuard>
        </div>
      </FadeUp>

      <FadeUp delay={0.1}>
        <Card className="ring-1 ring-black/5 shadow-sm">
          <CardHeader>
            <CardTitle>Storefronts ({totalStorefrontCount})</CardTitle>
          </CardHeader>
          <CardContent>
            {totalStorefrontCount > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Slug / URL</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Domain</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                      {(canUpdate || canDelete) && (
                        <th className="text-right py-3 px-4 font-medium text-gray-600">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {storefronts.map((store, i) => (
                      <motion.tr
                        key={store.id}
                        className="border-b hover:bg-gray-50/80"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03, type: "spring", damping: 25, stiffness: 300 }}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {store.name}
                            {store.status === "inactive" && <Lock className="h-4 w-4 text-amber-500" />}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">/{store.slug}</td>
                        <td className="py-3 px-4 text-gray-600">
                          {store.domain ? (
                            <a href={`https://${store.domain}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                              <Globe className="h-3.5 w-3.5" />
                              {store.domain}
                            </a>
                          ) : "—"}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-sm font-medium ${store.status === "active" ? "bg-green-100 text-green-700" : store.status === "inactive" ? "bg-gray-100 text-gray-700" : "bg-amber-100 text-amber-700"}`}>
                            {store.status.charAt(0).toUpperCase() + store.status.slice(1)}
                          </span>
                        </td>
                        {(canUpdate || canDelete) && (
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-end gap-2">
                              <PermissionGuard permission="storefronts:read">
                                <Button variant="ghost" size="sm" onClick={() => handleProductsClick(store)} title="Manage products" className="hover:cursor-pointer"><Package className="h-4 w-4" /></Button>
                              </PermissionGuard>
                              <PermissionGuard permission="storefronts:update">
                                <Button variant="ghost" size="sm" onClick={() => handleDesignerClick(store)} title="Design storefront" className="hover:cursor-pointer"><Paintbrush className="h-4 w-4" /></Button>
                              </PermissionGuard>
                              <PermissionGuard permission="storefronts:update">
                                <Button variant="ghost" size="sm" onClick={() => handleEditClick(store)} title="Edit storefront" className="hover:cursor-pointer"><Edit className="h-4 w-4" /></Button>
                              </PermissionGuard>
                              <PermissionGuard permission="storefronts:delete">
                                {store.status !== "active" && (
                                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDeleteClick(store)} title="Delete storefront"><Trash2 className="h-4 w-4" /></Button>
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
                <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No storefronts found</p>
                {canCreate && (
                  <PermissionGuard permission="storefronts:create">
                    <Button onClick={handleCreateClick}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Storefront
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
