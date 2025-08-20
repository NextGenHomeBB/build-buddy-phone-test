
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Sparkles, Edit, Trash2 } from 'lucide-react';

interface MaterialsTableProps {
  materials: any[];
  onViewDetails: (material: any) => void;
  onToggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  onEnhance: (id: string) => void;
  onEdit: (material: any) => void;
  onDelete: (id: string) => void;
  isToggling: boolean;
  isEnhancing: boolean;
  isDeleting: boolean;
}

export function MaterialsTable({
  materials,
  onViewDetails,
  onToggleFavorite,
  isFavorite,
  onEnhance,
  onEdit,
  onDelete,
  isToggling,
  isEnhancing,
  isDeleting
}: MaterialsTableProps) {
  return (
    <div className="hidden md:block">
      <Card>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Category</th>
                  <th className="text-left p-3">Brand</th>
                  <th className="text-left p-3">Unit</th>
                  <th className="text-right p-3">Price</th>
                  <th className="text-right p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {materials.map((material) => (
                  <tr key={material.id} className="border-b hover:bg-muted/50">
                    <td className="p-3">
                      <div>
                        <div 
                          className="font-medium cursor-pointer hover:text-primary hover:underline"
                          onClick={() => onViewDetails(material)}
                        >
                          {material.name}
                        </div>
                        {material.description && (
                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                            {material.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      {material.category ? (
                        <Badge variant="outline">{material.category}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">Uncategorized</span>
                      )}
                    </td>
                    <td className="p-3">
                      {material.brand || <span className="text-muted-foreground text-sm">Unknown</span>}
                    </td>
                    <td className="p-3">{material.unit}</td>
                    <td className="p-3 text-right font-mono">
                      ${material.price_per_unit?.toFixed(2) || '0.00'}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onToggleFavorite(material.id)}
                          disabled={isToggling}
                          title={isFavorite(material.id) ? "Remove from favorites" : "Add to favorites"}
                        >
                          <Heart className={`h-4 w-4 ${isFavorite(material.id) ? 'fill-red-500 text-red-500' : ''}`} />
                        </Button>
                        {(!material.category || !material.brand) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEnhance(material.id)}
                            disabled={isEnhancing}
                            title="Auto-enhance missing data"
                          >
                            <Sparkles className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(material)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(material.id)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
