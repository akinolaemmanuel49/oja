import { useFieldArray } from "react-hook-form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger, // ← important
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, X } from "lucide-react";
import { ImageUploader } from "@/components/ImageUploader";

type ExistingVariantCardProps = {
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
  onRemove: () => void;
  isPending: boolean;
};

export function ExistingVariantCard({
  variantIndex,
  arrayName,
  control,
  register,
  watch,
  setValue,
  onRemove,
  isPending,
}: ExistingVariantCardProps) {
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

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-medium">Existing Variant {variantIndex + 1}</h4>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button type="button" variant="ghost" disabled={isPending}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Variant?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. The variant will be permanently
                deleted if changes are saved.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onRemove}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`${arrayName}.${variantIndex}.sku`}>SKU</Label>
            <Input
              id={`${arrayName}.${variantIndex}.sku`}
              {...register(`${arrayName}.${variantIndex}.sku`)}
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${arrayName}.${variantIndex}.price`}>
              Price (₦)
            </Label>
            <Input
              id={`${arrayName}.${variantIndex}.price`}
              type="number"
              step="0.01"
              min="0"
              {...register(`${arrayName}.${variantIndex}.price`, {
                valueAsNumber: true,
              })}
              disabled={isPending}
            />
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
                    placeholder="Key"
                    {...register(
                      `${arrayName}.${variantIndex}.attributePairs.${attrIndex}.key`,
                    )}
                    disabled={isPending}
                  />
                </div>
                <div className="flex-1">
                  <Input
                    placeholder="Value"
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
              <p className="text-sm text-gray-500">No attributes defined</p>
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
            uploaderId={`variant-update-${variantIndex}-images`}
          />
        </div>
      </div>
    </Card>
  );
}
