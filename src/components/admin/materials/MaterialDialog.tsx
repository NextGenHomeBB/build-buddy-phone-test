
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

const defaultCategories = ['Concrete', 'Steel', 'Lumber', 'Electrical', 'Plumbing', 'Roofing', 'Insulation', 'Interior', 'Hardware', 'Tools', 'General'];
const defaultUnits = ['pieces', 'linear feet', 'square feet', 'cubic yards', 'bags', 'sheets', 'rolls', 'board feet', 'kg', 'm', 'litres'];

interface MaterialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingMaterial: any;
  formData: any;
  setFormData: (data: any) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isCreating: boolean;
  isUpdating: boolean;
}

export function MaterialDialog({
  open,
  onOpenChange,
  editingMaterial,
  formData,
  setFormData,
  onSubmit,
  onCancel,
  isCreating,
  isUpdating
}: MaterialDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingMaterial ? 'Edit Material' : 'Add Material'}
          </DialogTitle>
          <DialogDescription>
            {editingMaterial ? 'Update the material information' : 'Add a new material to the master database'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">Material Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter material name"
                required
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter material description"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Auto-categorized" />
                </SelectTrigger>
                <SelectContent>
                  {defaultCategories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="unit">Unit</Label>
              <Select value={formData.unit} onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Auto-detected" />
                </SelectTrigger>
                <SelectContent>
                  {defaultUnits.map(unit => (
                    <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="price_per_unit">Price per Unit ($)</Label>
              <Input
                id="price_per_unit"
                type="number"
                step="0.01"
                value={formData.price_per_unit}
                onChange={(e) => setFormData(prev => ({ ...prev, price_per_unit: e.target.value }))}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                placeholder="Auto-detected"
              />
            </div>

            <div>
              <Label htmlFor="ean">EAN/Barcode</Label>
              <Input
                id="ean"
                value={formData.ean}
                onChange={(e) => setFormData(prev => ({ ...prev, ean: e.target.value }))}
                placeholder="Enter EAN/barcode"
              />
            </div>

            <div>
              <Label htmlFor="article_nr">Article Number</Label>
              <Input
                id="article_nr"
                value={formData.article_nr}
                onChange={(e) => setFormData(prev => ({ ...prev, article_nr: e.target.value }))}
                placeholder="Enter article number"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="specs">Specifications</Label>
              <Textarea
                id="specs"
                value={formData.specs}
                onChange={(e) => setFormData(prev => ({ ...prev, specs: e.target.value }))}
                placeholder="Enter technical specifications"
                rows={2}
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="url">Product URL</Label>
              <Input
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              onClick={onSubmit} 
              className="flex-1"
              disabled={isCreating || isUpdating || !formData.name}
            >
              {(isCreating || isUpdating) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingMaterial ? 'Update' : 'Add'} Material
            </Button>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
