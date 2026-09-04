import { useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { Button,Input,Label,Textarea,Select,SelectContent,SelectItem,SelectTrigger,SelectValue,Card,CardContent,CardDescription,CardHeader,CardTitle,Alert,AlertDescription } from "@oja/ui";
import { Loader2, ArrowLeft, Plus } from "lucide-react";
import { ImageUploader } from "@/components/ImageUploader";
import type { Product, CreateProduct, ProductUpdate } from "@/types/product";
import { useNavigate } from "react-router-dom";
import { AppHref } from "@/routes/constants";
import { transformFormDataToApiPayload } from "../helpers/transformFormDataToApiPayload";
import { transformEditFormToApiPayload } from "../helpers/transformEditFormToApiPayload";
import type { FormData } from "../types";
import { transformProductToFormData } from "../helpers/transformProductToFormData";
import { ExistingVariantCard } from "./ExistingVariantCard";
import { NewVariantCard } from "./NewVariantCard";

interface ProductFormPropsCreate {
  mode: "create";
  initialData?: never;
  onSubmit: (data: CreateProduct) => Promise<Product>;
  isSubmitting: boolean;
  submitError?: Error | null;
}

interface ProductFormPropsEdit {
  mode: "edit";
  initialData: Product;
  onSubmit: (data: ProductUpdate) => Promise<Product>;
  isSubmitting: boolean;
  submitError?: Error | null;
}

type ProductFormProps = ProductFormPropsCreate | ProductFormPropsEdit;

export function ProductForm(props: ProductFormProps) {
  const { mode, onSubmit, isSubmitting, submitError, initialData } = props;
  const navigate = useNavigate();
  const isEdit = mode === "edit";

  const defaultValues: FormData =
    isEdit && initialData
      ? transformProductToFormData(initialData)
      : {
          name: "",
          description: "",
          type: "simple",
          simple: {
            base_price: 0,
            sku: "",
            stock_quantity: 0,
            re_order_level: 0,
          },
          variants: [],
          image_urls: [],
          main_image_url: undefined,
        };

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues,
  });

  // Determine the correct array name for new variants
  const newArrayName = isEdit ? "variants_to_add" : "variants";

  // Field arrays
  const {
    fields: addVariantFields,
    append: addAppend,
    remove: addRemove,
  } = useFieldArray({
    control,
    name: newArrayName, // dynamic
  });

  const { fields: updateVariantFields, remove: updateRemove } = useFieldArray({
    control,
    name: "variants_to_update",
  });

  const productType = watch("type");

  // Handle type switching
  useEffect(() => {
    if (productType === "simple") {
      if (isEdit) {
        setValue("variants_to_add", []);
        setValue("variants_to_update", []);
        setValue(
          "variants_to_remove",
          initialData?.variants?.map((v) => v.id) ?? [],
        );
      } else {
        setValue("variants", []);
      }
    } else {
      // Switching to variable - clear simple product fields and images
      if (isEdit) {
        setValue("base_price", undefined);
        setValue("sku", undefined);
        setValue("stock_quantity", undefined);
        setValue("re_order_level", undefined);
        setValue("main_image_url", undefined);
        setValue("image_urls", []);
      } else {
        setValue("simple", undefined);
        setValue("main_image_url", undefined);
        setValue("image_urls", []);
      }
    }
  }, [productType, setValue, isEdit, initialData]);

  const addNewVariant = () => {
    addAppend({
      sku: "",
      price: 0,
      stock_quantity: 0,
      re_order_level: 0,
      attributePairs: [{ key: "", value: "" }],
      main_image_url: undefined,
      image_urls: [],
    });
  };

  const markVariantForRemoval = (id: string, index: number) => {
    // eslint-disable-next-line react-hooks/incompatible-library
    const removeList = watch("variants_to_remove") ?? [];
    setValue("variants_to_remove", [...removeList, id]);
    updateRemove(index);
  };

  const handleSimpleProductImagesChange = (
    urls: string[],
    mainUrl?: string,
  ) => {
    setValue("image_urls", urls);
    setValue("main_image_url", mainUrl);
  };

  const formSubmit = (data: FormData) => {
    let payload: CreateProduct | ProductUpdate;
    if (mode === "create") {
      payload = transformFormDataToApiPayload(data);
      return onSubmit(payload as CreateProduct);
    } else {
      payload = transformEditFormToApiPayload(data);
      return onSubmit(payload as ProductUpdate);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <Button
        variant="ghost"
        onClick={() => navigate(AppHref.productsRoute)}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Products
      </Button>

      <h1 className="text-3xl font-bold mb-6">
        {isEdit ? "Edit Product" : "Create New Product"}
      </h1>

      <form onSubmit={handleSubmit(formSubmit)} className="space-y-6">
        {submitError && (
          <Alert variant="destructive">
            <AlertDescription>
              {submitError.message || "Failed to process product."}
            </AlertDescription>
          </Alert>
        )}

        {/* Two-column layout */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                {isEdit
                  ? "Update product information."
                  : "Enter the basic information for your new product."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  {...register("name", { required: "Name is required" })}
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  disabled={isSubmitting}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Product Type</Label>
                <Controller
                  control={control}
                  name="type"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(newValue) => {
                        if (newValue !== (initialData?.type ?? "simple")) {
                          field.onChange(newValue);
                        }
                      }}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="simple">Simple Product</SelectItem>
                        <SelectItem value="variable">
                          Variable Product
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {productType !== (initialData?.type ?? "simple") && (
                  <Alert>
                    <AlertDescription>
                      Switching type will migrate data. For variable to simple,
                      first variant data moves to product. For simple to
                      variable, a default variant is created.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          {productType === "simple" && (
            <ImageUploader
              existingImages={watch("image_urls") ?? []}
              mainImageUrl={watch("main_image_url")}
              onImagesChange={handleSimpleProductImagesChange}
              maxImages={8}
              uploaderId="simple-product-images"
            />
          )}

          {productType === "variable" && (
            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
                <CardDescription>
                  Images are managed per variant below
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg border-2 border-dashed">
                  <p className="text-sm text-gray-500">
                    Add images to individual variants
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Simple Product Fields */}
        {productType === "simple" && (
          <Card>
            <CardHeader>
              <CardTitle>Pricing & Inventory</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="base_price">Base Price (₦)</Label>
                <Input
                  id="base_price"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register(isEdit ? "base_price" : "simple.base_price", {
                    valueAsNumber: true,
                  })}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  {...register(isEdit ? "sku" : "simple.sku")}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock_quantity">Stock Quantity</Label>
                <Input
                  id="stock_quantity"
                  type="number"
                  min="0"
                  {...register(
                    isEdit ? "stock_quantity" : "simple.stock_quantity",
                    { valueAsNumber: true },
                  )}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="re_order_level">Re-order Level</Label>
                <Input
                  id="re_order_level"
                  type="number"
                  min="0"
                  {...register(
                    isEdit ? "re_order_level" : "simple.re_order_level",
                    { valueAsNumber: true },
                  )}
                  disabled={isSubmitting}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Variable Product - Variants Section */}
        {productType === "variable" && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Variants</CardTitle>
                  <CardDescription>
                    Each variant can have its own pricing, inventory, and images
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  onClick={addNewVariant}
                  disabled={isSubmitting}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add Variant
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Existing variants (edit only) */}
              {isEdit &&
                updateVariantFields.map((field, index) => (
                  <ExistingVariantCard
                    key={field.id}
                    variantIndex={index}
                    arrayName="variants_to_update"
                    control={control}
                    register={register}
                    watch={watch}
                    setValue={setValue}
                    onRemove={() => markVariantForRemoval(field.id, index)}
                    isPending={isSubmitting}
                  />
                ))}

              {/* New variants (create or edit) */}
              {addVariantFields.map((field, index) => (
                <NewVariantCard
                  key={field.id}
                  variantIndex={index}
                  arrayName={newArrayName}
                  control={control}
                  register={register}
                  watch={watch}
                  setValue={setValue}
                  errors={errors}
                  onRemove={() => addRemove(index)}
                  isPending={isSubmitting}
                />
              ))}

              {addVariantFields.length === 0 &&
                updateVariantFields.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>
                      No variants added yet. Click "Add Variant" to get started.
                    </p>
                  </div>
                )}
            </CardContent>
          </Card>
        )}

        <div className="flex gap-4 pt-4">
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Save Changes" : "Create Product"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(AppHref.productsRoute)}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
