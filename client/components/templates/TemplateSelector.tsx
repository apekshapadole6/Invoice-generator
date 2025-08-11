import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { AVAILABLE_TEMPLATES, InvoiceTemplate } from '../../types/templates';

interface TemplateSelectorProps {
  selectedTemplate: string;
  onTemplateSelect: (templateId: string) => void;
}

export default function TemplateSelector({ selectedTemplate, onTemplateSelect }: TemplateSelectorProps) {
  return (
    <div className="space-y-6">
      <div>
        <Label className="text-lg font-semibold text-gray-900">Select Document Template</Label>
        <p className="text-sm text-gray-600 mt-1">
          Choose a template that best fits your business style and branding preferences.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {AVAILABLE_TEMPLATES.map((template) => (
          <Card
            key={template.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedTemplate === template.id
                ? 'ring-2 ring-primary border-primary shadow-md'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onTemplateSelect(template.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                  <p className="text-sm text-gray-600">{template.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  {selectedTemplate === template.id && (
                    <div className="flex items-center justify-center w-6 h-6 bg-primary rounded-full">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Template Preview */}
              <div className="mb-3">
                <div 
                  className="h-24 rounded border-2 border-dashed flex items-center justify-center text-xs font-medium relative overflow-hidden"
                  style={{ 
                    borderColor: template.colors.primary,
                    backgroundColor: `${template.colors.primary}08`
                  }}
                >
                  {/* Mini preview based on template layout */}
                  {template.layout === 'standard' && (
                    <div className="w-full h-full p-2">
                      <div className="h-2 rounded mb-1" style={{ backgroundColor: template.colors.primary }}></div>
                      <div className="grid grid-cols-2 gap-1 mb-1">
                        <div className="h-1 bg-gray-300 rounded"></div>
                        <div className="h-1 bg-gray-300 rounded"></div>
                      </div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                    </div>
                  )}
                  
                  {template.layout === 'modern' && (
                    <div className="w-full h-full p-2">
                      <div 
                        className="h-3 rounded mb-1"
                        style={{ 
                          background: `linear-gradient(135deg, ${template.colors.primary} 0%, ${template.colors.secondary} 100%)`
                        }}
                      ></div>
                      <div className="grid grid-cols-2 gap-1 mb-1">
                        <div className="h-2 bg-gray-100 rounded"></div>
                        <div className="h-2 bg-gray-100 rounded"></div>
                      </div>
                      <div className="h-2 bg-gray-200 rounded"></div>
                    </div>
                  )}
                  
                  {template.layout === 'minimal' && (
                    <div className="w-full h-full p-2">
                      <div className="flex items-center mb-1">
                        <div 
                          className="h-1 w-6 rounded mr-2"
                          style={{ backgroundColor: template.colors.primary }}
                        ></div>
                        <div className="h-1 bg-gray-300 rounded flex-1"></div>
                      </div>
                      <div className="space-y-1">
                        <div className="h-1 bg-gray-200 rounded"></div>
                        <div className="h-1 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-1 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  )}
                  
                  {template.layout === 'corporate' && (
                    <div className="w-full h-full p-2">
                      <div 
                        className="h-2 rounded mb-1 border"
                        style={{ 
                          backgroundColor: template.colors.primary,
                          borderColor: template.colors.primary
                        }}
                      ></div>
                      <div className="grid grid-cols-2 gap-1 mb-1">
                        <div className="h-3 bg-gray-100 rounded border"></div>
                        <div className="h-3 bg-gray-100 rounded border"></div>
                      </div>
                      <div className="h-2 rounded border" style={{ borderColor: template.colors.primary }}></div>
                    </div>
                  )}
                  
                  <span className="absolute bottom-1 right-1 text-xs text-gray-500 capitalize">
                    {template.layout}
                  </span>
                </div>
              </div>
              
              {/* Template Features */}
              <div className="flex flex-wrap gap-1">
                <Badge variant="secondary" className="text-xs">
                  {template.layout}
                </Badge>
                {template.features.showLogo && (
                  <Badge variant="outline" className="text-xs">Logo</Badge>
                )}
                {template.features.showBorder && (
                  <Badge variant="outline" className="text-xs">Border</Badge>
                )}
                {template.features.showWatermark && (
                  <Badge variant="outline" className="text-xs">Watermark</Badge>
                )}
              </div>
              
              {/* Color scheme indicator */}
              <div className="flex items-center gap-1 mt-2">
                <span className="text-xs text-gray-500">Colors:</span>
                <div 
                  className="w-3 h-3 rounded-full border"
                  style={{ backgroundColor: template.colors.primary }}
                ></div>
                <div 
                  className="w-3 h-3 rounded-full border"
                  style={{ backgroundColor: template.colors.secondary }}
                ></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
