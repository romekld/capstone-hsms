import { Service } from '../types/announcement';
import { Phone, Clock, Stethoscope, ArrowRight } from 'lucide-react';

interface ServiceCardProps {
  service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <article className="group relative bg-card border rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-primary/50">
      {/* Header */}
      <div className="flex items-start space-x-4 mb-4">
        <div className="flex-shrink-0 p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
          <Stethoscope className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-card-foreground mb-2 group-hover:text-primary transition-colors">
            {service.name}
          </h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-health-accent/10 text-health-accent border border-health-accent/20">
            {service.category}
          </span>
        </div>
      </div>
      
      {/* Description */}
      <p className="text-muted-foreground mb-6 leading-relaxed line-clamp-3">
        {service.description}
      </p>
      
      {/* Service details */}
      <div className="space-y-3 mb-6">
        {service.contact_info && (
          <div className="flex items-center space-x-3 text-sm">
            <div className="p-2 bg-muted rounded-md">
              <Phone className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-muted-foreground">{service.contact_info}</span>
          </div>
        )}
        
        {service.operating_hours && (
          <div className="flex items-center space-x-3 text-sm">
            <div className="p-2 bg-muted rounded-md">
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-muted-foreground">{service.operating_hours}</span>
          </div>
        )}
      </div>

      {/* Action button */}
      <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors group-hover:shadow-md">
        <span className="font-medium">Learn More</span>
        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
      </button>

      {/* Hover gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </article>
  );
}
