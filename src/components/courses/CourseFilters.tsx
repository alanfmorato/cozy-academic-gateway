
import React, { useState } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { CourseCategory } from '@/types/course';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
  SheetFooter,
} from "@/components/ui/sheet";

interface CourseFiltersProps {
  categories: CourseCategory[];
  onFilterChange: (filters: {
    search: string;
    categoryId?: string;
    difficulty?: string;
    priceRange: [number, number];
  }) => void;
}

const CourseFilters: React.FC<CourseFiltersProps> = ({ 
  categories, 
  onFilterChange 
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | undefined>();
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [activeFilters, setActiveFilters] = useState(0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const applyFilters = () => {
    onFilterChange({
      search,
      categoryId: selectedCategory,
      difficulty: selectedDifficulty,
      priceRange,
    });

    let count = 0;
    if (selectedCategory) count++;
    if (selectedDifficulty) count++;
    if (priceRange[1] < 1000 || priceRange[0] > 0) count++;
    
    setActiveFilters(count);
  };

  const clearFilters = () => {
    setSelectedCategory(undefined);
    setSelectedDifficulty(undefined);
    setPriceRange([0, 1000]);
    setActiveFilters(0);
    
    onFilterChange({
      search,
      priceRange: [0, 1000],
    });
  };

  const removeFilter = (filter: 'category' | 'difficulty' | 'price') => {
    if (filter === 'category') {
      setSelectedCategory(undefined);
    } else if (filter === 'difficulty') {
      setSelectedDifficulty(undefined);
    } else if (filter === 'price') {
      setPriceRange([0, 1000]);
    }

    onFilterChange({
      search,
      categoryId: filter === 'category' ? undefined : selectedCategory,
      difficulty: filter === 'difficulty' ? undefined : selectedDifficulty,
      priceRange: filter === 'price' ? [0, 1000] : priceRange,
    });

    setActiveFilters(prevFilters => prevFilters - 1);
  };

  return (
    <div className="mb-8 space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Pesquisar cursos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit">Buscar</Button>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button 
              variant="outline" 
              className="gap-2"
            >
              <SlidersHorizontal size={16} />
              Filtros
              {activeFilters > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full">
                  {activeFilters}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Filtros</SheetTitle>
            </SheetHeader>
            <div className="py-6 space-y-6">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Categoria</h3>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Nível de dificuldade</h3>
                <Select
                  value={selectedDifficulty}
                  onValueChange={setSelectedDifficulty}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os níveis" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="iniciante">Iniciante</SelectItem>
                    <SelectItem value="intermediário">Intermediário</SelectItem>
                    <SelectItem value="avançado">Avançado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <h3 className="text-sm font-medium">Preço</h3>
                  <span className="text-sm text-muted-foreground">
                    R$ {priceRange[0].toFixed(2)} - R$ {priceRange[1].toFixed(2)}
                  </span>
                </div>
                <Slider
                  value={priceRange}
                  min={0}
                  max={1000}
                  step={10}
                  onValueChange={(value) => setPriceRange(value as [number, number])}
                  className="py-4"
                />
              </div>
            </div>
            <SheetFooter className="flex flex-row gap-3 sm:space-x-0">
              <Button variant="outline" onClick={clearFilters} className="flex-1">
                Limpar filtros
              </Button>
              <SheetClose asChild>
                <Button onClick={applyFilters} className="flex-1">
                  Aplicar filtros
                </Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </form>
      
      {activeFilters > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {selectedCategory && (
            <Badge variant="secondary" className="gap-1 px-3 py-1">
              {categories.find(c => c.id === selectedCategory)?.name}
              <button onClick={() => removeFilter('category')}>
                <X size={14} />
              </button>
            </Badge>
          )}
          
          {selectedDifficulty && (
            <Badge variant="secondary" className="gap-1 px-3 py-1">
              {selectedDifficulty}
              <button onClick={() => removeFilter('difficulty')}>
                <X size={14} />
              </button>
            </Badge>
          )}
          
          {(priceRange[0] > 0 || priceRange[1] < 1000) && (
            <Badge variant="secondary" className="gap-1 px-3 py-1">
              R$ {priceRange[0]} - R$ {priceRange[1]}
              <button onClick={() => removeFilter('price')}>
                <X size={14} />
              </button>
            </Badge>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs h-7" 
            onClick={clearFilters}
          >
            Limpar todos
          </Button>
        </div>
      )}
    </div>
  );
};

export default CourseFilters;
