import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Save, Plus, X, Edit } from 'lucide-react';
import { useProjects, type Employee, type Project } from '../../contexts/ProjectContext';

interface EditProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string | null;
}

interface ProjectFormData {
  name: string;
  customerName: string;
  customerAddress: string;
  contactPerson: string;
  email: string;
  invoiceDate: string;
  paymentDueDate: string;
  workPeriod: string;
  sowRef: string;
  poNumber: string;
  invoicePurpose: string;
  currency: string;
  status: 'active' | 'completed' | 'draft';
}

export default function EditProjectModal({ open, onOpenChange, projectId }: EditProjectModalProps) {
  const { getProject, updateProject } = useProjects();
  const [formData, setFormData] = useState<ProjectFormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load project data when projectId changes
  useEffect(() => {
    if (projectId && open) {
      const project = getProject(projectId);
      if (project) {
        setFormData({
          name: project.name,
          customerName: project.customerName,
          customerAddress: project.customerAddress,
          contactPerson: project.contactPerson,
          email: project.email,
          invoiceDate: convertDateForInput(project.invoiceDate || getLastDateOfCurrentMonth()),
          paymentDueDate: convertDateForInput(project.paymentDueDate),
          workPeriod: project.workPeriod,
          sowRef: project.sowRef,
          poNumber: project.poNumber,
          invoicePurpose: project.invoicePurpose,
          currency: project.currency,
          status: project.status
        });
      }
    } else {
      setFormData(null);
    }
  }, [projectId, open, getProject]);

  const handleInputChange = (field: keyof ProjectFormData, value: string) => {
    if (!formData) return;
    setFormData(prev => prev ? ({
      ...prev,
      [field]: value
    }) : null);
  };



  const generateInvoiceNumber = (projectName: string): string => {
    const firstFourLetters = projectName.replace(/[^A-Za-z]/g, '').substring(0, 4).toUpperCase();
    const currentDate = new Date();
    const month = currentDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const year = currentDate.getFullYear().toString().slice(-2);
    return `INVOICE-${firstFourLetters}-${month}${year}`;
  };

  const getLastDateOfCurrentMonth = (): string => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-11
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    // Format as YYYY-MM-DD for date input fields
    const year = lastDay.getFullYear();
    const month = String(lastDay.getMonth() + 1).padStart(2, '0');
    const day = String(lastDay.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getCurrentMonthYear = (): string => {
    const now = new Date();
    const month = now.toLocaleDateString('en-US', { month: 'long' });
    const year = now.getFullYear();
    return `${month} ${year}`;
  };

  const getPaymentDueDate = (invoiceDate: string): string => {
    const date = new Date(invoiceDate);
    date.setDate(date.getDate() + 15);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const convertDateForInput = (dateString: string): string => {
    // If the date is already in YYYY-MM-DD format, return as is
    if (dateString.includes('-') && dateString.length === 10) {
      return dateString;
    }
    
    // If the date is in DD/MM/YY format, convert to YYYY-MM-DD
    if (dateString.includes('/')) {
      const parts = dateString.split('/');
      if (parts.length === 3) {
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
        return `${year}-${month}-${day}`;
      }
    }
    
    // If no valid format found, return current month's last date
    return getLastDateOfCurrentMonth();
  };

  const convertDateForStorage = (dateString: string): string => {
    // Keep YYYY-MM-DD format for storage
    if (dateString.includes('-') && dateString.length === 10) {
      return dateString; // Already in correct format
    }

    // Convert DD/MM/YY format to YYYY-MM-DD
    if (dateString.includes('/')) {
      const parts = dateString.split('/');
      if (parts.length === 3) {
        let [day, month, year] = parts;
        // Handle 2-digit year by adding 20 prefix
        if (year.length === 2) {
          year = '20' + year;
        }
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      return dateString;
    }
    
    // If no valid format found, return current month's last date in DD/MM/YY format
    const lastDate = getLastDateOfCurrentMonth();
    const parts = lastDate.split('-');
    const year = parts[0];
    const month = parts[1];
    const day = parts[2];
    const shortYear = year.slice(-2);
    return `${day}/${month}/${shortYear}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData || !projectId) return;
    
    setIsSubmitting(true);
    
    try {
      const invoiceNumber = generateInvoiceNumber(formData.name);
      const invoiceDate = convertDateForStorage(formData.invoiceDate);
      const paymentDueDate = convertDateForStorage(getPaymentDueDate(formData.invoiceDate));
      const projectUpdates = {
        ...formData,
        invoiceNumber,
        invoiceDate,
        paymentDueDate,
        description: '',
        totalAmount: 0
      };

      updateProject(projectId, projectUpdates);
      
      // Close modal
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!formData) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5 text-blue-600" />
            Edit Project Details
          </DialogTitle>
          <DialogDescription>
            Update project information, customer details, and employee data.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Project Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Project Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="projectName" className="font-medium">Project Name *</Label>
                <Input
                  id="projectName"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., West Horminics"
                  required
                  className="mt-1"
                />
              </div>
            </div>

          </div>

          {/* Customer Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="customerName" className="font-medium">Customer Name *</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                  placeholder="e.g., ABC Corp"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="contactPerson" className="font-medium">Contact Person *</Label>
                <Input
                  id="contactPerson"
                  value={formData.contactPerson}
                  onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                  placeholder="e.g., Andy Sorowsky"
                  required
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="customerAddress" className="font-medium">Customer Address *</Label>
              <Input
                id="customerAddress"
                value={formData.customerAddress}
                onChange={(e) => handleInputChange('customerAddress', e.target.value)}
                placeholder="e.g., 221 Baker Street London 12345"
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email" className="font-medium">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="e.g., contact@abccorp.com"
                required
                className="mt-1"
              />
            </div>
          </div>

          {/* Invoice Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Invoice Information</h3>
            <div>
              <Label htmlFor="sowRef" className="font-medium">SOW Reference</Label>
              <Input
                id="sowRef"
                value={formData.sowRef}
                onChange={(e) => handleInputChange('sowRef', e.target.value)}
                placeholder="e.g., Professional Services Agreement"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="poNumber" className="font-medium">PO Number</Label>
              <Input
                id="poNumber"
                value={formData.poNumber}
                onChange={(e) => handleInputChange('poNumber', e.target.value)}
                placeholder="Purchase Order Number"
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="invoicePurpose" className="font-medium">Invoice Purpose *</Label>
                <Input
                  id="invoicePurpose"
                  value={formData.invoicePurpose}
                  onChange={(e) => handleInputChange('invoicePurpose', e.target.value)}
                  placeholder="e.g., Software service provided to ABC Corp"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="currency" className="font-medium">Currency *</Label>
                <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">EUR (Euro)</SelectItem>
                    <SelectItem value="USD">USD (US Dollar)</SelectItem>
                    <SelectItem value="GBP">GBP (British Pound)</SelectItem>
                    <SelectItem value="CAD">CAD (Canadian Dollar)</SelectItem>
                    <SelectItem value="AUD">AUD (Australian Dollar)</SelectItem>
                    <SelectItem value="JPY">JPY (Japanese Yen)</SelectItem>
                    <SelectItem value="CHF">CHF (Swiss Franc)</SelectItem>
                    <SelectItem value="INR">INR (Indian Rupee)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="status" className="font-medium">Project Status *</Label>
              <Select value={formData.status} onValueChange={(value: 'active' | 'completed' | 'draft') => handleInputChange('status', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>



          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Update Project
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
