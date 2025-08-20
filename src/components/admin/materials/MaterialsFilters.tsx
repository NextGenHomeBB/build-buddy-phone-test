
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Search } from 'lucide-react';
import { MaterialFilters } from '@/hooks/useMaterials';

const defaultCategories = ['Concrete', 'Steel', 'Lumber', 'Electrical', 'Plumbing', 'Roofing', 'Insulation', 'Interior', 'Hardware', 'Tools', 'General'];

interface MaterialsFiltersProps {
  filters: MaterialFilters;
  showFilters: boolean;
  onUpdateSearch: (search: string) => void;
  onUpdateCategory: (category: string) => void;
  onUpdatePriceRange: (priceRange: [number, number]) => void;
  onClearFilters: () => void;
}

export function MaterialsFilters({
  filters,
  showFilters,
  onUpdateSearch,
  onUpdateCategory,
  onUpdatePriceRange,
  onClearFilters
}: MaterialsFiltersProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search materials..."
                  value={filters.search}
                  onChange={(e) => onUpdateSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            {showFilters && (
              <>
                <Select value={filters.category || 'all'} onValueChange={onUpdateCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {defaultCategories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={onClearFilters}>
                  Clear
                </Button>
              </>
            )}
          </div>

          {showFilters && (
            <div className="space-y-3">
              <div>
                <Label>Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}</Label>
                <Slider
                  value={filters.priceRange}
                  onValueChange={onUpdatePriceRange}
                  max={1000}
                  min={0}
                  step={10}
                  className="mt-2"
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
