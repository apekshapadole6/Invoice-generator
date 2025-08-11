import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Palette } from 'lucide-react';
import { AVAILABLE_TEMPLATES, InvoiceTemplate } from '../../types/templates';
import { useTemplate } from '../../contexts/TemplateContext';

interface TemplateSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TemplateSelectorModal({ open, onOpenChange }: TemplateSelectorModalProps) {
  const { selectedTemplate, setSelectedTemplate } = useTemplate();

  const handleTemplateSelect = (template: InvoiceTemplate) => {
    setSelectedTemplate(template);
    onOpenChange(false);
  };

  const renderSamplePreview = (template: InvoiceTemplate) => {
    return (
      <div 
        className="h-48 rounded border-2 border-dashed p-4 relative overflow-hidden transition-all duration-200"
        style={{ 
          borderColor: template.colors.primary,
          backgroundColor: `${template.colors.primary}05`
        }}
      >
        {/* Sample invoice layout based on template */}
        {template.layout === 'standard' && (
          <div className="w-full h-full">
            {/* Header with Logo */}
            <div className="flex justify-between items-start mb-2">
              <div className="h-6 rounded flex-1" style={{ backgroundColor: template.colors.primary }}></div>
              <div className="w-4 h-4 bg-orange-500 rounded ml-1 flex items-center justify-center text-white text-xs font-bold">K</div>
            </div>
            <div className="space-y-1 mb-3">
              <div className="h-1 bg-gray-300 rounded w-3/4"></div>
              <div className="h-1 bg-gray-300 rounded w-1/2"></div>
            </div>
            
            {/* Title */}
            <div className="text-center mb-3">
              <div className="h-2 bg-gray-400 rounded w-1/3 mx-auto"></div>
            </div>
            
            {/* Content Grid */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="space-y-1">
                <div className="h-1 bg-gray-300 rounded"></div>
                <div className="h-1 bg-gray-300 rounded w-3/4"></div>
              </div>
              <div className="space-y-1">
                <div className="h-1 bg-gray-300 rounded"></div>
                <div className="h-1 bg-gray-300 rounded w-3/4"></div>
              </div>
            </div>
            
            {/* Table */}
            <div className="h-4 rounded" style={{ backgroundColor: template.colors.primary }}></div>
            <div className="space-y-1 mt-1">
              <div className="h-1 bg-gray-200 rounded"></div>
              <div className="h-1 bg-gray-200 rounded"></div>
            </div>
          </div>
        )}
        
        {template.layout === 'modern' && (
          <div className="w-full h-full">
            {/* Gradient Header with Logo */}
            <div
              className="h-8 rounded mb-2 flex items-center justify-between px-2"
              style={{
                background: `linear-gradient(135deg, ${template.colors.primary} 0%, ${template.colors.secondary} 100%)`
              }}
            >
              <div className="w-3 h-3 bg-white bg-opacity-30 rounded flex items-center justify-center text-white text-xs font-bold">K</div>
              <div className="flex-1"></div>
            </div>
            
            {/* Title */}
            <div className="text-center mb-3">
              <div className="h-3 rounded w-1/4 mx-auto" style={{ backgroundColor: template.colors.primary }}></div>
            </div>
            
            {/* Split Layout */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="h-8 bg-gray-100 rounded"></div>
              <div className="space-y-1">
                <div className="h-1 bg-gray-300 rounded"></div>
                <div className="h-1 bg-gray-300 rounded w-2/3"></div>
              </div>
            </div>
            
            {/* Striped Table */}
            <div className="space-y-1">
              <div className="h-2 rounded" style={{ backgroundColor: template.colors.primary }}></div>
              <div className="h-1 bg-gray-100 rounded"></div>
              <div className="h-1 bg-gray-200 rounded"></div>
              <div className="h-1 bg-gray-100 rounded"></div>
            </div>
          </div>
        )}
        
        {template.layout === 'minimal' && (
          <div className="w-full h-full">
            {/* Minimal Header with Logo */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center flex-1">
                <div
                  className="h-1 w-8 rounded mr-2"
                  style={{ backgroundColor: template.colors.primary }}
                ></div>
                <div className="h-2 bg-gray-300 rounded flex-1"></div>
              </div>
              <div className="w-3 h-3 bg-orange-500 rounded flex items-center justify-center text-white text-xs font-bold ml-1">K</div>
            </div>
            
            {/* Simple Title */}
            <div className="mb-4">
              <div className="h-4 bg-gray-400 rounded w-1/4"></div>
            </div>
            
            {/* Three Column Layout */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="space-y-1">
                <div className="h-1 rounded" style={{ backgroundColor: template.colors.primary }}></div>
                <div className="h-1 bg-gray-300 rounded w-3/4"></div>
              </div>
              <div className="space-y-1">
                <div className="h-1 rounded" style={{ backgroundColor: template.colors.primary }}></div>
                <div className="h-1 bg-gray-300 rounded w-2/3"></div>
              </div>
              <div className="space-y-1">
                <div className="h-1 rounded" style={{ backgroundColor: template.colors.primary }}></div>
                <div className="h-1 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
            
            {/* Simple Lines */}
            <div className="space-y-1">
              <div className="h-1 bg-gray-200 rounded"></div>
              <div className="h-1 bg-gray-200 rounded w-3/4"></div>
              <div className="h-1 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        )}
        
        {template.layout === 'corporate' && (
          <div className="w-full h-full border-2 rounded" style={{ borderColor: template.colors.primary }}>
            <div className="p-2">
              {/* Corporate Header */}
              <div className="flex justify-between items-center mb-2">
                <div className="h-2 bg-gray-400 rounded w-1/2"></div>
                <div className="w-4 h-4 bg-orange-500 rounded flex items-center justify-center text-white text-xs font-bold">K</div>
              </div>
              
              {/* Title Box */}
              <div className="h-3 rounded mb-2" style={{ backgroundColor: `${template.colors.primary}20` }}></div>
              
              {/* Two Column Boxes */}
              <div className="grid grid-cols-2 gap-1 mb-2">
                <div className="h-6 border rounded" style={{ borderColor: template.colors.secondary }}></div>
                <div className="h-6 border rounded" style={{ borderColor: template.colors.secondary }}></div>
              </div>
              
              {/* Table */}
              <div className="border rounded" style={{ borderColor: template.colors.primary }}>
                <div className="h-2 rounded-t" style={{ backgroundColor: template.colors.primary }}></div>
                <div className="space-y-1 p-1">
                  <div className="h-1 bg-gray-200 rounded"></div>
                  <div className="h-1 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Template Name Overlay */}
        <div className="absolute bottom-2 right-2 text-xs font-medium px-2 py-1 rounded" style={{ 
          backgroundColor: template.colors.primary, 
          color: 'white' 
        }}>
          {template.layout}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            Select Document Template
          </DialogTitle>
          <DialogDescription>
            Choose a template that will be applied to all your project documents. This setting will be saved and used for all future previews and downloads.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {AVAILABLE_TEMPLATES.map((template) => (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedTemplate.id === template.id
                  ? 'ring-2 ring-primary border-primary shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleTemplateSelect(template)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
                      {template.name}
                      {selectedTemplate.id === template.id && (
                        <div className="flex items-center justify-center w-5 h-5 bg-primary rounded-full">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </h3>
                    <p className="text-sm text-gray-600">{template.description}</p>
                  </div>
                </div>
                
                {/* Sample Preview */}
                <div className="mb-3">
                  {renderSamplePreview(template)}
                </div>
                
                {/* Template Features */}
                <div className="flex flex-wrap gap-1 mb-3">
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
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Colors:</span>
                  <div 
                    className="w-4 h-4 rounded-full border"
                    style={{ backgroundColor: template.colors.primary }}
                  ></div>
                  <div 
                    className="w-4 h-4 rounded-full border"
                    style={{ backgroundColor: template.colors.secondary }}
                  ></div>
                  <span className="text-xs text-gray-500 ml-auto">
                    {template.fonts.header.split(',')[0]}
                  </span>
                </div>
                
                {/* Select Button */}
                <Button 
                  className={`w-full mt-3 ${
                    selectedTemplate.id === template.id 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTemplateSelect(template);
                  }}
                >
                  {selectedTemplate.id === template.id ? 'Selected' : 'Select Template'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="flex justify-between items-center mt-6 pt-4 border-t">
          <div className="text-sm text-gray-600">
            Currently selected: <span className="font-medium text-gray-900">{selectedTemplate.name}</span>
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
