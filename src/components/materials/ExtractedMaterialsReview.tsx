import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Check, Edit2, X, Plus, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface ExtractedMaterial {
  name: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  category: string;
  confidence: number;
}

interface ExtractedMaterialsReviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  extractedData: {
    supplier: string;
    invoiceDate: string | null;
    materials: ExtractedMaterial[];
    totalMaterials: number;
    totalValue: number;
  } | null;
  invoiceUrl: string;
  projectId: string;
}

export function ExtractedMaterialsReview({
  open,
  onOpenChange,
  extractedData,
  invoiceUrl,
  projectId
}: ExtractedMaterialsReviewProps) {
  const [selectedMaterials, setSelectedMaterials] = useState<Set<number>>(new Set());
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedMaterials, setEditedMaterials] = useState<ExtractedMaterial[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Initialize edited materials when data changes
  useState(() => {
    if (extractedData) {
      setEditedMaterials(extractedData.materials);
      setSelectedMaterials(new Set(extractedData.materials.map((_, i) => i)));
    }
  });

  const addMaterialsMutation = useMutation({
    mutationFn: async (materials: ExtractedMaterial[]) => {
      const results = [];

      for (const material of materials) {
        // First, check if material exists in materials table
        const { data: existingMaterial } = await supabase
          .from('materials')
          .select('id, price_per_unit')
          .eq('name', material.name)
          .single();

        let materialId: string;

        if (existingMaterial) {
          // Update price if different
          if (existingMaterial.price_per_unit !== material.unitPrice) {
            await supabase
              .from('materials')
              .update({ price_per_unit: material.unitPrice })
              .eq('id', existingMaterial.id);
          }
          materialId = existingMaterial.id;
        } else {
          // Create new material
          const { data: newMaterial, error: createError } = await supabase
            .from('materials')
            .insert({
              name: material.name,
              description: material.description,
              unit: material.unit,
              price_per_unit: material.unitPrice,
              category: material.category,
            })
            .select()
            .single();

          if (createError) throw createError;
          materialId = newMaterial.id;
        }

        // Add to project_materials
        const { data, error } = await supabase
          .from('project_materials')
          .insert({
            project_id: projectId,
            material_id: materialId,
            quantity_needed: material.quantity,
            quantity_used: 0,
            cost_per_unit: material.unitPrice,
            total_cost: material.totalPrice,
            supplier_name: extractedData?.supplier,
            invoice_date: extractedData?.invoiceDate,
            invoice_document_url: invoiceUrl,
          })
          .select();

        if (error) throw error;
        results.push(data);
      }

      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-materials', projectId] });
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      toast({
        title: "Materials added",
        description: `Successfully added ${selectedMaterials.size} materials to project`,
      });
      onOpenChange(false);
      setSelectedMaterials(new Set());
      setEditingIndex(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error adding materials",
        description: error.message || "Failed to add materials to project",
        variant: "destructive",
      });
    },
  });

  const handleToggleMaterial = (index: number) => {
    const newSelected = new Set(selectedMaterials);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedMaterials(newSelected);
  };

  const handleToggleAll = () => {
    if (selectedMaterials.size === editedMaterials.length) {
      setSelectedMaterials(new Set());
    } else {
      setSelectedMaterials(new Set(editedMaterials.map((_, i) => i)));
    }
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
  };

  const handleSaveEdit = (index: number, field: keyof ExtractedMaterial, value: any) => {
    const newMaterials = [...editedMaterials];
    newMaterials[index] = { ...newMaterials[index], [field]: value };
    
    // Recalculate total price if quantity or unit price changed
    if (field === 'quantity' || field === 'unitPrice') {
      newMaterials[index].totalPrice = newMaterials[index].quantity * newMaterials[index].unitPrice;
    }
    
    setEditedMaterials(newMaterials);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
  };

  const handleAddSelected = () => {
    const materialsToAdd = editedMaterials.filter((_, i) => selectedMaterials.has(i));
    addMaterialsMutation.mutate(materialsToAdd);
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.9) return <Badge variant="default">High</Badge>;
    if (confidence >= 0.7) return <Badge variant="secondary">Medium</Badge>;
    return <Badge variant="outline">Low</Badge>;
  };

  if (!extractedData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Review Extracted Materials</DialogTitle>
          <DialogDescription>
            Review and edit the materials extracted from the invoice before adding them to your project.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
          <div>
            <div className="text-sm text-muted-foreground">Supplier</div>
            <div className="font-medium">{extractedData.supplier}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Invoice Date</div>
            <div className="font-medium">{extractedData.invoiceDate || 'Not specified'}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Total Value</div>
            <div className="font-medium">€{extractedData.totalValue.toLocaleString()}</div>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedMaterials.size === editedMaterials.length}
                    onCheckedChange={handleToggleAll}
                  />
                </TableHead>
                <TableHead>Material</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {editedMaterials.map((material, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Checkbox
                      checked={selectedMaterials.has(index)}
                      onCheckedChange={() => handleToggleMaterial(index)}
                    />
                  </TableCell>
                  <TableCell>
                    {editingIndex === index ? (
                      <div className="space-y-1">
                        <Input
                          value={material.name}
                          onChange={(e) => handleSaveEdit(index, 'name', e.target.value)}
                          className="h-8"
                        />
                        <Input
                          value={material.description}
                          onChange={(e) => handleSaveEdit(index, 'description', e.target.value)}
                          placeholder="Description"
                          className="h-8 text-xs"
                        />
                      </div>
                    ) : (
                      <div>
                        <div className="font-medium">{material.name}</div>
                        {material.description && (
                          <div className="text-xs text-muted-foreground">{material.description}</div>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{material.category}</Badge>
                  </TableCell>
                  <TableCell>
                    {editingIndex === index ? (
                      <Input
                        type="number"
                        value={material.quantity}
                        onChange={(e) => handleSaveEdit(index, 'quantity', parseFloat(e.target.value))}
                        className="h-8 w-20"
                      />
                    ) : (
                      material.quantity
                    )}
                  </TableCell>
                  <TableCell>{material.unit}</TableCell>
                  <TableCell>
                    {editingIndex === index ? (
                      <Input
                        type="number"
                        value={material.unitPrice}
                        onChange={(e) => handleSaveEdit(index, 'unitPrice', parseFloat(e.target.value))}
                        className="h-8 w-24"
                      />
                    ) : (
                      `€${material.unitPrice.toFixed(2)}`
                    )}
                  </TableCell>
                  <TableCell className="font-medium">€{material.totalPrice.toFixed(2)}</TableCell>
                  <TableCell>{getConfidenceBadge(material.confidence)}</TableCell>
                  <TableCell>
                    {editingIndex === index ? (
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => setEditingIndex(null)}>
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={handleCancelEdit}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(index)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {selectedMaterials.size === 0 && (
          <div className="flex items-center gap-2 p-3 bg-warning/10 rounded-lg text-warning">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Select at least one material to add to the project</span>
          </div>
        )}

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {selectedMaterials.size} of {editedMaterials.length} materials selected
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddSelected}
              disabled={selectedMaterials.size === 0 || addMaterialsMutation.isPending}
            >
              <Plus className="h-4 w-4 mr-2" />
              {addMaterialsMutation.isPending 
                ? 'Adding...' 
                : `Add ${selectedMaterials.size} Materials`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}