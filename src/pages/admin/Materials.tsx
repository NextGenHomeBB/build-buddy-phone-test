
import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Package, 
  Loader2,
  ArrowRight
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useMaterials } from '@/hooks/useMaterials';
import { useFavorites } from '@/hooks/useFavorites';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

// Import the refactored components
import { MaterialsHeader } from '@/components/admin/materials/MaterialsHeader';
import { MaterialsFilters } from '@/components/admin/materials/MaterialsFilters';
import { MaterialDialog } from '@/components/admin/materials/MaterialDialog';
import { MaterialsTable } from '@/components/admin/materials/MaterialsTable';

export default function AdminMaterials() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [editingMaterial, setEditingMaterial] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    unit: '',
    price_per_unit: '',
    brand: '',
    ean: '',
    article_nr: '',
    specs: '',
    url: ''
  });

  const {
    materials,
    totalCount,
    totalPages,
    currentPage,
    isLoading,
    filters,
    setFilters,
    setPage,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    enhanceMaterial,
    isCreating,
    isUpdating,
    isDeleting,
    isEnhancing
  } = useMaterials();

  const { toggleFavorite, isFavorite, isToggling, favoriteIds } = useFavorites();

  // Filter materials based on favorites toggle
  const displayedMaterials = showOnlyFavorites 
    ? materials.filter(material => favoriteIds.includes(material.id))
    : materials;

  const handleSubmit = () => {
    const materialData = {
      ...formData,
      price_per_unit: parseFloat(formData.price_per_unit) || 0
    };

    if (editingMaterial) {
      updateMaterial({ id: editingMaterial.id, updates: materialData });
    } else {
      createMaterial(materialData);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      unit: '',
      price_per_unit: '',
      brand: '',
      ean: '',
      article_nr: '',
      specs: '',
      url: ''
    });
    setEditingMaterial(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (material: any) => {
    setEditingMaterial(material);
    setFormData({
      name: material.name || '',
      description: material.description || '',
      category: material.category || '',
      unit: material.unit || '',
      price_per_unit: material.price_per_unit?.toString() || '',
      brand: material.brand || '',
      ean: material.ean || '',
      article_nr: material.article_nr || '',
      specs: material.specs || '',
      url: material.url || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this material?')) {
      deleteMaterial(id);
    }
  };

  const handleEnhance = (id: string) => {
    enhanceMaterial(id);
  };

  const updateSearchFilter = (search: string) => {
    setFilters({ ...filters, search });
    setPage(1);
  };

  const updateCategoryFilter = (category: string) => {
    setFilters({ ...filters, category: category === 'all' ? '' : category });
    setPage(1);
  };

  const updatePriceRangeFilter = (priceRange: [number, number]) => {
    setFilters({ ...filters, priceRange });
    setPage(1);
  };

  const handleViewDetails = (material: any) => {
    setSelectedMaterial(material);
    setIsDetailDialogOpen(true);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      priceRange: [0, 1000],
      brand: ''
    });
    setPage(1);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <MaterialsHeader
          totalCount={totalCount}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
          showOnlyFavorites={showOnlyFavorites}
          onToggleFavorites={() => setShowOnlyFavorites(!showOnlyFavorites)}
          onAddMaterial={() => {
            resetForm();
            setIsDialogOpen(true);
          }}
        />

        <MaterialsFilters
          filters={filters}
          showFilters={showFilters}
          onUpdateSearch={updateSearchFilter}
          onUpdateCategory={updateCategoryFilter}
          onUpdatePriceRange={updatePriceRangeFilter}
          onClearFilters={clearFilters}
        />

        {/* Materials Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : displayedMaterials.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No materials found</p>
              {filters.search || filters.category ? (
                <Button variant="outline" onClick={clearFilters} className="mt-2">
                  Clear filters
                </Button>
              ) : null}
            </CardContent>
          </Card>
        ) : (
          <>
            <MaterialsTable
              materials={displayedMaterials}
              onViewDetails={handleViewDetails}
              onToggleFavorite={toggleFavorite}
              isFavorite={isFavorite}
              onEnhance={handleEnhance}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isToggling={isToggling}
              isEnhancing={isEnhancing}
              isDeleting={isDeleting}
            />

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {displayedMaterials.map((material) => (
                <Card key={material.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle 
                          className="text-base cursor-pointer hover:text-primary hover:underline"
                          onClick={() => handleViewDetails(material)}
                        >
                          {material.name}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {material.category ? (
                            <Badge variant="outline" className="text-xs">{material.category}</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">Uncategorized</Badge>
                          )}
                          <span className="text-sm text-muted-foreground">
                            ${material.price_per_unit?.toFixed(2) || '0.00'} / {material.unit}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    {material.description && (
                      <p className="text-sm text-muted-foreground">{material.description}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => currentPage > 1 && setPage(currentPage - 1)}
                        className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = currentPage <= 3 ? i + 1 : 
                                     currentPage >= totalPages - 2 ? totalPages - 4 + i :
                                     currentPage - 2 + i;
                      
                      if (pageNum > 0 && pageNum <= totalPages) {
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              onClick={() => setPage(pageNum)}
                              isActive={pageNum === currentPage}
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      }
                      return null;
                    })}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => currentPage < totalPages && setPage(currentPage + 1)}
                        className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}

        {/* Material Dialog */}
        <MaterialDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          editingMaterial={editingMaterial}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          onCancel={resetForm}
          isCreating={isCreating}
          isUpdating={isUpdating}
        />

        {/* Material Detail Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                {selectedMaterial?.name}
              </DialogTitle>
              <DialogDescription>
                Material details and specifications
              </DialogDescription>
            </DialogHeader>
            
            {selectedMaterial && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Category</Label>
                    <p className="text-sm">{selectedMaterial.category || 'Uncategorized'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Brand</Label>
                    <p className="text-sm">{selectedMaterial.brand || 'Unknown'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Unit</Label>
                    <p className="text-sm">{selectedMaterial.unit}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Price per Unit</Label>
                    <p className="text-sm font-mono">${selectedMaterial.price_per_unit?.toFixed(2) || '0.00'}</p>
                  </div>
                  {selectedMaterial.ean && (
                    <div>
                      <Label className="text-sm font-medium">EAN/Barcode</Label>
                      <p className="text-sm font-mono">{selectedMaterial.ean}</p>
                    </div>
                  )}
                  {selectedMaterial.article_nr && (
                    <div>
                      <Label className="text-sm font-medium">Article Number</Label>
                      <p className="text-sm font-mono">{selectedMaterial.article_nr}</p>
                    </div>
                  )}
                </div>
                
                {selectedMaterial.description && (
                  <div>
                    <Label className="text-sm font-medium">Description</Label>
                    <p className="text-sm">{selectedMaterial.description}</p>
                  </div>
                )}
                
                {selectedMaterial.specs && (
                  <div>
                    <Label className="text-sm font-medium">Specifications</Label>
                    <p className="text-sm">{selectedMaterial.specs}</p>
                  </div>
                )}
                
                {selectedMaterial.url && (
                  <div className="pt-4 border-t">
                    <Button 
                      onClick={() => window.open(selectedMaterial.url, '_blank')}
                      className="w-full"
                    >
                      View Product Page
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
