import { useState, useMemo } from 'react';
import { Service } from '../types/announcement';
import { AppSelect } from './ui/app-select';
import { Search, Filter, Stethoscope, Clock, Phone, ChevronDown } from 'lucide-react';

interface ServiceFinderProps {
  services: Service[];
}

const categories = [
  'All',
  'Primary Care',
  'Emergency',
  'Maternal Health',
  'Pediatrics',
  'Dental',
  'Mental Health',
  'Laboratory',
  'Pharmacy',
];

const operatingHours = [
  'All Hours',
  '24/7',
  'Business Hours',
  'Evenings',
  'Weekends',
];

export function ServiceFinder({ services }: ServiceFinderProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedHours, setSelectedHours] = useState('All Hours');
  const [showFilters, setShowFilters] = useState(false);

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           service.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || service.category === selectedCategory;
      
      // Simple operating hours filter (you may need to adjust based on your data structure)
      const matchesHours = selectedHours === 'All Hours' || 
                          (selectedHours === '24/7' && service.operating_hours?.includes('24/7')) ||
                          (selectedHours === 'Business Hours' && service.operating_hours?.includes('Mon-Fri'));

      return matchesSearch && matchesCategory && matchesHours;
    });
  }, [services, searchTerm, selectedCategory, selectedHours]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedHours('All Hours');
  };

  return (
    <div className="bg-card border rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Stethoscope className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Service Finder</h3>
            <p className="text-sm text-muted-foreground">
              {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 px-3 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
        >
          <Filter className="h-4 w-4" />
          <span className="text-sm">Filters</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search services..."
          className="w-full pl-10 pr-4 py-3 bg-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
        />
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mb-6 p-4 bg-muted/50 rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Category
              </label>
              <AppSelect
                value={selectedCategory}
                onValueChange={setSelectedCategory}
                options={categories}
                className="w-full rounded-lg border bg-background px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Operating Hours Filter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Operating Hours
              </label>
              <AppSelect
                value={selectedHours}
                onValueChange={setSelectedHours}
                options={operatingHours}
                className="w-full rounded-lg border bg-background px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Clear Filters */}
          <div className="flex justify-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear all filters
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="space-y-4">
        {filteredServices.length === 0 ? (
          <div className="text-center py-12">
            <div className="p-4 bg-muted rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <h4 className="text-lg font-medium text-foreground mb-2">No services found</h4>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or filters to find what you're looking for.
            </p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          filteredServices.map((service) => (
            <div
              key={service.id}
              className="p-4 border rounded-lg hover:border-primary/50 transition-colors cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <Stethoscope className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {service.name}
                      </h4>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-health-accent/10 text-health-accent">
                        {service.category}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                    {service.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    {service.contact_info && (
                      <div className="flex items-center space-x-1">
                        <Phone className="h-3 w-3" />
                        <span>{service.contact_info}</span>
                      </div>
                    )}
                    {service.operating_hours && (
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{service.operating_hours}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <button className="ml-4 p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                  <ChevronDown className="h-4 w-4 rotate-270" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
