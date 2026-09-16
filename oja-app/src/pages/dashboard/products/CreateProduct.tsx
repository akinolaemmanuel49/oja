import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProduct } from "@/api/products/createProduct";
import { ProductForm } from "./components/ProductForm";
import { useNavigate } from "react-router-dom";
import { AppHref } from "@/routes/constants";
import type { CreateProduct } from "@/types/product";

export default function CreateProduct() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createProductMutation = useMutation({
    mutationFn: (data: CreateProduct) => createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      navigate(AppHref.productsRoute);
    },
  });

  return (
    <ProductForm
      mode="create"
      onSubmit={createProductMutation.mutateAsync}
      isSubmitting={createProductMutation.isPending}
      submitError={createProductMutation.error as Error | null}
    />
  );
}
