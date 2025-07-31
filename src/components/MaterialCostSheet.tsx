import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Calculator, Save, X, Search, Edit3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useInsertMaterialCost, useEstimatePhaseCosts } from '@/services/phaseCosts.service';
import { materialService } from '@/services/materialService';
import { useQuery } from '@tanstack/react-query';

const materialCostSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  qty: z.number().min(0.01, 'Quantity must be greater than 0'),
  unit: z.string().min(1, 'Unit is required'),
  unit_price: z.number().min(0.01, 'Unit price must be greater than 0'),
});

type MaterialCostForm = z.infer<typeof materialCostSchema>;

interface MaterialCostSheetProps {
  phaseId: string;
  open: boolean;
  onClose: () => void;
}

const categories = [
  'Concrete & Masonry',
  'Steel & Metal',
  'Wood & Lumber',
  'Electrical',
  'Plumbing',
  'Insulation',
  'Roofing',
  'Windows & Doors',
  'Flooring',
  'Paint & Finishes',
  'Hardware',
  'Other'
];

const units = [
  'm²',
  'm³',
  'm',
  'kg',
  'ton',
  'piece',
  'box',
  'bag',
  'liter',
  'roll',
  'panel',
  'sheet'
];

export function MaterialCostSheet({ phaseId, open, onClose }: MaterialCostSheetProps) {
  const [isCalculating, setIsCalculating] = useState(false);
  const [searchMode, setSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const { toast } = useToast();
  
  const insertMaterialCostMutation = useInsertMaterialCost();
  const estimatePhaseCostsMutation = useEstimatePhaseCosts();

  // Fetch materials for search
  const { data: materials = [], isLoading: materialsLoading } = useQuery({
    queryKey: ['materials'],
    queryFn: materialService.getMaterials,
  });

  // Filter materials based on search query
  const filteredMaterials = useMemo(() => {
    if (!searchQuery) return materials.slice(0, 10); // Show first 10 when no search
    return materials.filter(material =>
      material.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.category?.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 50); // Limit to 50 results
  }, [materials, searchQuery]);

  const form = useForm<MaterialCostForm>({
    resolver: zodResolver(materialCostSchema),
    defaultValues: {
      description: '',
      category: '',
      qty: 0,
      unit: '',
      unit_price: 0,
    },
  });

  const { register, handleSubmit, formState: { errors }, setValue, watch } = form;

  // Handle material selection from search
  const handleMaterialSelect = (material: any) => {
    setSelectedMaterial(material);
    setValue('description', material.name);
    setValue('category', material.category || 'Other');
    setValue('unit', material.unit || 'piece');
    setValue('unit_price', material.price_per_unit || 0);
    setSearchMode(false);
    setSearchQuery('');
    
    toast({
      title: "Material Selected",
      description: `${material.name} - ${material.category || 'Unknown category'}`,
    });
  };

  // Toggle between search and manual entry
  const toggleSearchMode = () => {
    setSearchMode(!searchMode);
    setSearchQuery('');
    setSelectedMaterial(null);
  };

  const handleAICalculator = async () => {
    const description = watch('description');
    if (!description.trim()) {
      toast({
        title: "Description required",
        description: "Please enter a material description first",
        variant: "destructive",
      });
      return;
    }

    setIsCalculating(true);
    try {
      const estimate = await estimatePhaseCostsMutation.mutateAsync(phaseId);
      
      // Simple heuristic: divide material estimate by 10 items as starting point
      const estimatedQty = Math.max(1, Math.round(estimate.materials / 1000));
      const estimatedPrice = estimate.materials > 0 ? Math.round(estimate.materials / estimatedQty) : 100;
      
      setValue('qty', estimatedQty);
      setValue('unit_price', estimatedPrice);
      
      toast({
        title: "AI Estimation Complete",
        description: `Suggested quantity: ${estimatedQty}, price: €${estimatedPrice}`,
      });
    } catch (error) {
      toast({
        title: "AI Estimation Failed",
        description: "Could not generate cost estimate. Please enter values manually.",
        variant: "destructive",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  const onSubmit = async (data: MaterialCostForm) => {
    try {
      await insertMaterialCostMutation.mutateAsync({
        phase_id: phaseId,
        category: data.category,
        qty: data.qty,
        unit: data.unit,
        unit_price: data.unit_price,
      });

      toast({
        title: "Material Cost Added",
        description: `${data.description} - €${(data.qty * data.unit_price).toFixed(2)}`,
      });

      onClose();
    } catch (error: any) {
      toast({
        title: "Failed to Add Material Cost",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    }
  };

  const total = watch('qty') * watch('unit_price');

  return (
    <BottomSheet open={open} onOpenChange={onClose}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Add Material Cost</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="description">Material</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={toggleSearchMode}
                className="text-xs"
              >
                {searchMode ? <Edit3 className="h-3 w-3 mr-1" /> : <Search className="h-3 w-3 mr-1" />}
                {searchMode ? 'Manual Entry' : 'Search Database'}
              </Button>
            </div>
            
            {searchMode ? (
              <div className="space-y-2">
                <Command className="rounded-lg border">
                  <CommandInput
                    placeholder="Search materials..."
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                  />
                  <CommandList className="max-h-48">
                    <CommandEmpty>
                      {materialsLoading ? 'Loading materials...' : 'No materials found.'}
                    </CommandEmpty>
                    <CommandGroup>
                      {filteredMaterials.map((material) => (
                        <CommandItem
                          key={material.id}
                          onSelect={() => handleMaterialSelect(material)}
                          className="cursor-pointer"
                        >
                          <div className="flex flex-col gap-1 w-full">
                            <div className="flex justify-between items-start">
                              <span className="font-medium">{material.name}</span>
                              <span className="text-sm text-muted-foreground">
                                €{material.price_per_unit || 0}/{material.unit || 'piece'}
                              </span>
                            </div>
                            <div className="flex gap-2 text-xs text-muted-foreground">
                              <span className="bg-secondary px-2 py-0.5 rounded">
                                {material.category || 'Other'}
                              </span>
                              {material.brand && (
                                <span className="bg-accent px-2 py-0.5 rounded">
                                  {material.brand}
                                </span>
                              )}
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </div>
            ) : (
              <Input
                id="description"
                {...register('description')}
                placeholder="e.g. Premium concrete mix"
                className="w-full"
              />
            )}
            
            {selectedMaterial && !searchMode && (
              <div className="text-xs text-muted-foreground p-2 bg-accent rounded">
                Selected: {selectedMaterial.name} 
                {selectedMaterial.brand && ` (${selectedMaterial.brand})`}
              </div>
            )}
            
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select onValueChange={(value) => setValue('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-background border z-50">
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-destructive">{errors.category.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="qty">Quantity</Label>
              <Input
                id="qty"
                type="number"
                step="0.01"
                min="0.01"
                {...register('qty', { valueAsNumber: true })}
                placeholder="0"
              />
              {errors.qty && (
                <p className="text-sm text-destructive">{errors.qty.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Select onValueChange={(value) => setValue('unit', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent className="bg-background border z-50">
                  {units.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.unit && (
                <p className="text-sm text-destructive">{errors.unit.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit_price">Unit Price (€)</Label>
            <Input
              id="unit_price"
              type="number"
              step="0.01"
              min="0.01"
              {...register('unit_price', { valueAsNumber: true })}
              placeholder="0.00"
            />
            {errors.unit_price && (
              <p className="text-sm text-destructive">{errors.unit_price.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between py-3 border-t">
            <span className="text-sm text-muted-foreground">Total Cost:</span>
            <span className="text-lg font-semibold">
              €{total ? total.toFixed(2) : '0.00'}
            </span>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleAICalculator}
              disabled={isCalculating}
              className="flex-1"
            >
              <Calculator className="h-4 w-4 mr-2" />
              {isCalculating ? 'Calculating...' : 'AI Calculator'}
            </Button>

            <Button
              type="submit"
              disabled={insertMaterialCostMutation.isPending}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              {insertMaterialCostMutation.isPending ? 'Saving...' : 'Save Cost'}
            </Button>
          </div>
        </form>
      </div>
    </BottomSheet>
  );
}