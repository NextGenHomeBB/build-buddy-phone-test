
import { Button } from '@/components/ui/button';
import { Plus, Filter, Heart } from 'lucide-react';

interface MaterialsHeaderProps {
  totalCount: number;
  showFilters: boolean;
  onToggleFilters: () => void;
  showOnlyFavorites: boolean;
  onToggleFavorites: () => void;
  onAddMaterial: () => void;
}

export function MaterialsHeader({
  totalCount,
  showFilters,
  onToggleFilters,
  showOnlyFavorites,
  onToggleFavorites,
  onAddMaterial
}: MaterialsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
          Master Materials
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage materials database ({totalCount.toLocaleString()} items)
        </p>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={onToggleFilters}>
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>

        <Button 
          variant={showOnlyFavorites ? "default" : "outline"}
          onClick={onToggleFavorites}
        >
          <Heart className={`h-4 w-4 mr-2 ${showOnlyFavorites ? 'fill-current' : ''}`} />
          {showOnlyFavorites ? 'Show All' : 'Show Favorites'}
        </Button>
        
        <Button onClick={onAddMaterial}>
          <Plus className="h-4 w-4 mr-2" />
          Add Material
        </Button>
      </div>
    </div>
  );
}
