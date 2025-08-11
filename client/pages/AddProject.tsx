import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';
import { useProjects, type Employee } from '../contexts/ProjectContext';

interface ProjectFormData {
  name: string;
  customerName: string;
  customerAddress: string;
  contactPerson: string;
  email: string;
  paymentDueDate: string;
  workPeriod: string;
  sowRef: string;
  poNumber: string;
  invoicePurpose: string;
  currency: string;
  status: 'active' | 'completed' | 'draft';
}

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

const initialFormData: ProjectFormData = {
  name: '',
  customerName: '',
  customerAddress: '',
  contactPerson: '',
  email: '',
  paymentDueDate: '',
  workPeriod: getCurrentMonthYear(),
  sowRef: '',
  poNumber: '',
  invoicePurpose: '',
  currency: 'EUR',
  status: 'draft'
};

export default function AddProject() {
  const navigate = useNavigate();
  const { addProject } = useProjects();
  const [formData, setFormData] = useState<ProjectFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof ProjectFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };



  const generateInvoiceNumber = (projectName: string): string => {
    const firstFourLetters = projectName.replace(/[^A-Za-z]/g, '').substring(0, 4).toUpperCase();
    const currentDate = new Date();
    const month = currentDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const year = currentDate.getFullYear().toString().slice(-2);
    return `INVOICE-${firstFourLetters}-${month}${year}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const invoiceNumber = generateInvoiceNumber(formData.name);
      const invoiceDate = getLastDateOfCurrentMonth();
      const paymentDueDate = getPaymentDueDate(invoiceDate);
      const projectData = {
        ...formData,
        invoiceNumber,
        invoiceDate,
        paymentDueDate,
        description: '',
        employees: [],
        totalAmount: 0
      };

      addProject(projectData);
      
      // Navigate back to home page
      navigate('/');
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <Link to="/" className="flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Link>
        </div>

        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900">Add New Project</CardTitle>
            <CardDescription>
              Create a new project with customer details and employee information for invoice generation.
            </CardDescription>
          </CardHeader>
          <CardContent>
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
              </div>



              {/* Submit Button */}
              <div className="flex justify-end pt-6 border-t">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary hover:bg-primary/90 px-8"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Create Project
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
