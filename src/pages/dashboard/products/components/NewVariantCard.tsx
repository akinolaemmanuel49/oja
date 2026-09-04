import { useFieldArray } from "react-hook-form";
import { Button,Input,Label,Card } from "@oja/ui";
import { Plus, Trash2, X } from "lucide-react";
import { ImageUploader } from "@/components/ImageUploader";

type NewVariantCardProps = {
  variantIndex: number;
  arrayName: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  watch: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setValue: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: any;
  onRemove: () => void;
  isPending: boolean;
};

export function NewVariantCard({
  variantIndex,
  arrayName,
  control,
  register,
  watch,
  setValue,
  errors,
  onRemove,
  isPending,
}: NewVariantCardProps) {
  const {
    fields: attributeFields,
    append: appendAttribute,
    remove: removeAttribute,
  } = useFieldArray({
    control,
    name: `${arrayName}.${variantIndex}.attributePairs`,
  });

  const handleVariantImagesChange = (urls: string[], mainUrl?: string) => {
    setValue(`${arrayName}.${variantIndex}.image_urls`, urls);
    setValue(`${arrayName}.${variantIndex}.main_image_url`, mainUrl);
  };

  // Helper to get error path for this variant
  const getError = (field: string) => {
    // errors.variants_to_add or errors.variants - but we can use arrayName
    // Use the field name from the register path
    return errors[arrayName]?.[variantIndex]?.[field];
  };

  return (
    <Card className="p-4 border-dashed">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-medium">New Variant {variantIndex + 1}</h4>
        <Button
          type="button"
          variant="ghost"
          onClick={onRemove}
          disabled={isPending}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`${arrayName}.${variantIndex}.sku`}>
              SKU <span className="text-red-500">*</span>
            </Label>
            <Input
              id={`${arrayName}.${variantIndex}.sku`}
              {...register(`${arrayName}.${variantIndex}.sku`, {
                required: "SKU is required",
              })}
              disabled={isPending}
            />
            {getError("sku") && (
              <p className="text-sm text-red-500">{getError("sku").message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${arrayName}.${variantIndex}.price`}>
              Price (₦) <span className="text-red-500">*</span>
            </Label>
            <Input
              id={`${arrayName}.${variantIndex}.price`}
              type="number"
              step="0.01"
              min="0"
              {...register(`${arrayName}.${variantIndex}.price`, {
                required: "Price is required",
                valueAsNumber: true,
              })}
              disabled={isPending}
            />
            {getError("price") && (
              <p className="text-sm text-red-500">
                {getError("price").message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${arrayName}.${variantIndex}.stock_quantity`}>
              Stock Quantity
            </Label>
            <Input
              id={`${arrayName}.${variantIndex}.stock_quantity`}
              type="number"
              min="0"
              {...register(`${arrayName}.${variantIndex}.stock_quantity`, {
                valueAsNumber: true,
              })}
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${arrayName}.${variantIndex}.re_order_level`}>
              Re-order Level
            </Label>
            <Input
              id={`${arrayName}.${variantIndex}.re_order_level`}
              type="number"
              min="0"
              {...register(`${arrayName}.${variantIndex}.re_order_level`, {
                valueAsNumber: true,
              })}
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Attributes</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendAttribute({ key: "", value: "" })}
                disabled={isPending}
              >
                <Plus className="h-3 w-3 mr-1" /> Add
              </Button>
            </div>
            {attributeFields.map((attrField, attrIndex) => (
              <div key={attrField.id} className="flex gap-2 items-start">
                <div className="flex-1">
                  <Input
                    placeholder="Key (e.g., color)"
                    {...register(
                      `${arrayName}.${variantIndex}.attributePairs.${attrIndex}.key`,
                    )}
                    disabled={isPending}
                  />
                </div>
                <div className="flex-1">
                  <Input
                    placeholder="Value (e.g., red)"
                    {...register(
                      `${arrayName}.${variantIndex}.attributePairs.${attrIndex}.value`,
                    )}
                    disabled={isPending}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAttribute(attrIndex)}
                  disabled={isPending}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {attributeFields.length === 0 && (
              <p className="text-sm text-gray-500">
                No attributes added. Click "Add" to define variant properties.
              </p>
            )}
          </div>
        </div>

        <div>
          <ImageUploader
            existingImages={
              watch(`${arrayName}.${variantIndex}.image_urls`) ?? []
            }
            mainImageUrl={watch(`${arrayName}.${variantIndex}.main_image_url`)}
            onImagesChange={handleVariantImagesChange}
            maxImages={8}
            uploaderId={`variant-add-${variantIndex}-images`}
          />
        </div>
      </div>
    </Card>
  );
}
