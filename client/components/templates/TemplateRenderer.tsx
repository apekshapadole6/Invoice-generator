import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { Project, Employee } from '../../contexts/ProjectContext';
import { InvoiceTemplate } from '../../types/templates';
import { CompanyLogo } from '../ui/CompanyLogo';

interface TemplateRendererProps {
  project: Project;
  template: InvoiceTemplate;
  isEditing?: boolean;
  editData?: Project;
  onInputChange?: (field: string, value: string) => void;
  onEmployeeChange?: (employeeId: string, field: string, value: string | number) => void;
  onRemoveEmployee?: (employeeId: string) => void;
}

export default function TemplateRenderer({
  project,
  template,
  isEditing = false,
  editData,
  onInputChange,
  onEmployeeChange,
  onRemoveEmployee
}: TemplateRendererProps) {
  const displayData = isEditing ? editData : project;
  
  if (!displayData) return null;

  const generateInvoiceNumber = (projectName: string): string => {
    const firstFourLetters = projectName.replace(/[^A-Za-z]/g, '').substring(0, 4).toUpperCase();
    const currentDate = new Date();
    const month = currentDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const year = currentDate.getFullYear().toString().slice(-2);
    return `INVOICE-${firstFourLetters}-${month}${year}`;
  };

  const getInvoiceNumber = () => {
    return displayData.invoiceNumber || generateInvoiceNumber(displayData.name);
  };

  const getInvoiceDate = () => {
    // Always return the last date of current month for new projects
    // For existing projects, use the stored date if it exists
    const storedDate = displayData.invoiceDate;
    if (!storedDate) {
      return getLastDateOfCurrentMonth();
    }
    
    // If the stored date is in DD/MM/YY format, convert it to YYYY-MM-DD
    if (storedDate.includes('/')) {
      const parts = storedDate.split('/');
      if (parts.length === 3) {
        const day = parts[0];
        const month = parts[1];
        const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
        return `${year}-${month}-${day}`;
      }
    }
    
    return storedDate;
  };

  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return '';
    
    // Handle different date formats
    let date: Date;
    
    // If it's already in YYYY-MM-DD format
    if (dateString.includes('-')) {
      date = new Date(dateString);
    } else {
      // If it's in DD/MM/YYYY format, convert it
      const parts = dateString.split('/');
      if (parts.length === 3) {
        // Convert DD/MM/YYYY to YYYY-MM-DD
        const day = parts[0];
        const month = parts[1];
        const year = parts[2];
        date = new Date(`${year}-${month}-${day}`);
      } else {
        date = new Date(dateString);
      }
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return getLastDateOfCurrentMonth(); // Fallback to current month's last date
    }
    
    // Return in yyyy-mm-dd format
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDateForInput = (dateString: string): string => {
    // If no date string provided, return current month's last date
    if (!dateString || dateString.trim() === '') {
      return getLastDateOfCurrentMonth();
    }
    
    // If it's already in YYYY-MM-DD format, return as is
    if (dateString.includes('-') && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateString;
    }
    
    // If it's in DD/MM/YY format, convert it
    if (dateString.includes('/')) {
      const parts = dateString.split('/');
      if (parts.length === 3) {
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
        return `${year}-${month}-${day}`;
      }
    }
    
    // Try to parse as a Date object and convert to YYYY-MM-DD
    try {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    } catch (error) {
      // Silently handle parsing errors
    }
    
    // If we can't parse it, return current month's last date
    return getLastDateOfCurrentMonth();
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

  const getPaymentDueDate = (invoiceDate: string): string => {
    const date = new Date(invoiceDate);
    date.setDate(date.getDate() + 15);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const renderMonthYearPicker = (value: string, onChange: (value: string) => void) => (
    <div className="grid grid-cols-2 gap-2">
      <Select 
        value={value.split(' ')[0]} 
        onValueChange={(month) => {
          const year = value.split(' ')[1] || new Date().getFullYear().toString();
          onChange(`${month} ${year}`);
        }}
      >
        <SelectTrigger className="text-sm">
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="January">January</SelectItem>
          <SelectItem value="February">February</SelectItem>
          <SelectItem value="March">March</SelectItem>
          <SelectItem value="April">April</SelectItem>
          <SelectItem value="May">May</SelectItem>
          <SelectItem value="June">June</SelectItem>
          <SelectItem value="July">July</SelectItem>
          <SelectItem value="August">August</SelectItem>
          <SelectItem value="September">September</SelectItem>
          <SelectItem value="October">October</SelectItem>
          <SelectItem value="November">November</SelectItem>
          <SelectItem value="December">December</SelectItem>
        </SelectContent>
      </Select>
      <Select 
        value={value.split(' ')[1] || new Date().getFullYear().toString()} 
        onValueChange={(year) => {
          const month = value.split(' ')[0] || new Date().toLocaleDateString('en-US', { month: 'long' });
          onChange(`${month} ${year}`);
        }}
      >
        <SelectTrigger className="text-sm">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 10 }, (_, i) => {
            const year = new Date().getFullYear() - 2 + i;
            return (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );

  const getInvoiceDateForInput = (): string => {
    const storedDate = displayData.invoiceDate;
    
    if (!storedDate || storedDate.trim() === '') {
      return getLastDateOfCurrentMonth();
    }
    
    return formatDateForInput(storedDate);
  };

  const renderStandardTemplate = () => (
    <Card className="bg-white shadow-lg">
      <CardContent className="p-8">
        {/* Company Header */}
        <div className="border-b-2 pb-6 mb-6" style={{ borderColor: template.colors.primary }}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2" style={{ color: template.colors.primary, fontFamily: template.fonts.header }}>
                KIZORA SOFTWARE PRIVATE LIMITED
              </h1>
              <div className="text-sm text-gray-600 space-y-1" style={{ fontFamily: template.fonts.body }}>
                <p>Address: Plot No. 12 First Floor, Hill Top, Ambazari,</p>
                <p>Nagpur Maharashtra 440033, INDIA</p>
                <p>Ph: +91 8080466754</p>
                <p>GST: 27AAECK4021C1Z3</p>
                <p>CIN: U72300MH2011PTC219628</p>
                <p>Website: www.kizora.com Email: info@kizora.com</p>
              </div>
            </div>
            <div className="ml-6">
              <CompanyLogo size="medium" />
            </div>
          </div>
        </div>

        {/* Invoice Title */}
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold" style={{ color: template.colors.text, fontFamily: template.fonts.header }}>
            Customer Invoice (Electronic)
          </h2>
        </div>

        {/* Customer and Invoice Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-4">
            <div>
              <Label className="font-semibold">Customer:</Label>
              {isEditing ? (
                <Input
                  value={displayData.customerName}
                  onChange={(e) => onInputChange?.('customerName', e.target.value)}
                  className="mt-1"
                />
              ) : (
                <p style={{ color: template.colors.text }}>{displayData.customerName}</p>
              )}
            </div>
            <div>
              <Label className="font-semibold">Address:</Label>
              {isEditing ? (
                <Input
                  value={displayData.customerAddress}
                  onChange={(e) => onInputChange?.('customerAddress', e.target.value)}
                  className="mt-1"
                />
              ) : (
                <p style={{ color: template.colors.text }}>{displayData.customerAddress}</p>
              )}
            </div>
            <div>
              <Label className="font-semibold">Contact Person:</Label>
              {isEditing ? (
                <Input
                  value={displayData.contactPerson}
                  onChange={(e) => onInputChange?.('contactPerson', e.target.value)}
                  className="mt-1"
                />
              ) : (
                <p style={{ color: template.colors.text }}>{displayData.contactPerson}</p>
              )}
            </div>
            <div>
              <Label className="font-semibold">Email:</Label>
              {isEditing ? (
                <Input
                  value={displayData.email}
                  onChange={(e) => onInputChange?.('email', e.target.value)}
                  className="mt-1"
                />
              ) : (
                <p style={{ color: template.colors.text }}>{displayData.email}</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="font-semibold">Invoice Number:</Label>
              {isEditing ? (
                <Input
                  value={displayData.invoiceNumber || getInvoiceNumber()}
                  onChange={(e) => onInputChange?.('invoiceNumber', e.target.value)}
                  className="mt-1"
                />
              ) : (
                <p style={{ color: template.colors.text }}>{getInvoiceNumber()}</p>
              )}
            </div>
            <div>
              <Label className="font-semibold">Invoice Date:</Label>
              {isEditing ? (
                <Input
                  type="date"
                  value={getInvoiceDateForInput()}
                  onChange={(e) => onInputChange?.('invoiceDate', e.target.value)}
                  className="mt-1"
                />
              ) : (
                <p style={{ color: template.colors.text }}>{formatDateForDisplay(getInvoiceDate())}</p>
              )}
            </div>
            <div>
              <Label className="font-semibold">Payment Due Date:</Label>
              {isEditing ? (
                <div className="mt-1 p-2 bg-gray-50 border border-gray-200 rounded text-gray-700">
                  {formatDateForDisplay(getPaymentDueDate(getInvoiceDateForInput()))} (15 days after invoice date)
                </div>
              ) : (
                <p style={{ color: template.colors.text }}>{formatDateForDisplay(displayData.paymentDueDate)}</p>
              )}
            </div>
            <div>
              <Label className="font-semibold">SOW REF:</Label>
              {isEditing ? (
                <Input
                  value={displayData.sowRef}
                  onChange={(e) => onInputChange?.('sowRef', e.target.value)}
                  className="mt-1"
                />
              ) : (
                <p style={{ color: template.colors.text }}>{displayData.sowRef}</p>
              )}
            </div>
          </div>
        </div>

        {/* Invoice Purpose */}
        <div className="mb-6">
          <Label className="font-semibold">Invoice Purpose:</Label>
          {isEditing ? (
            <Input
              value={displayData.invoicePurpose}
              onChange={(e) => onInputChange?.('invoicePurpose', e.target.value)}
              className="mt-1"
            />
          ) : (
            <p style={{ color: template.colors.text }}>{displayData.invoicePurpose}</p>
          )}
        </div>

        {/* Work Period */}
        <div className="mb-6">
          <Label className="font-semibold">Work period:</Label>
          {isEditing ? (
            <div className="mt-1 w-48">
              {renderMonthYearPicker(displayData.workPeriod, (value) => onInputChange?.('workPeriod', value))}
            </div>
          ) : (
            <p style={{ color: template.colors.text }}>{displayData.workPeriod}</p>
          )}
        </div>

        {/* Employee Table */}
        <div className="mb-8">
          
          <div className="text-white p-3 grid grid-cols-5 gap-4 font-semibold" style={{ backgroundColor: template.colors.primary }}>
            <div>S.No.</div>
            <div>Name</div>
            <div>{displayData.currency}/ph</div>
            <div>Hours</div>
            <div>Total</div>
          </div>

          {displayData.employees.map((employee, index) => (
            <div key={employee.id} className="border-b border-gray-200 p-3 grid grid-cols-5 gap-4 items-center">
              <div>{index + 1}</div>
              <div>
                {isEditing ? (
                  <Input
                    value={employee.name}
                    onChange={(e) => onEmployeeChange?.(employee.id, 'name', e.target.value)}
                    className="text-sm"
                  />
                ) : (
                  employee.name
                )}
              </div>
              <div>
                {isEditing ? (
                  <Input
                    type="number"
                    step="0.01"
                    value={employee.ratePerHour}
                    onChange={(e) => onEmployeeChange?.(employee.id, 'ratePerHour', parseFloat(e.target.value) || 0)}
                    className="text-sm"
                  />
                ) : (
                  employee.ratePerHour.toFixed(2)
                )}
              </div>
              <div>
                {isEditing ? (
                  <Input
                    type="number"
                    value={employee.hours}
                    onChange={(e) => onEmployeeChange?.(employee.id, 'hours', parseInt(e.target.value) || 0)}
                    className="text-sm"
                  />
                ) : (
                  employee.hours
                )}
              </div>
              <div className="flex justify-between items-center">
                <span>{displayData.currency} {(employee.ratePerHour * employee.hours).toFixed(2)}</span>
                {isEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveEmployee?.(employee.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}

          <div className="bg-gray-100 p-3 grid grid-cols-5 gap-4 font-semibold">
            <div></div>
            <div>Total</div>
            <div></div>
            <div></div>
            <div>{displayData.currency} {displayData.employees.reduce((sum, emp) => sum + (emp.ratePerHour * emp.hours), 0).toFixed(2)}</div>
          </div>
        </div>

        {/* Total Invoice Amount */}
        <div className="text-right mb-4">
          <div className="text-lg font-bold">
            Total Invoice Amount: {displayData.currency} {displayData.employees.reduce((sum, emp) => sum + (emp.ratePerHour * emp.hours), 0).toFixed(2)}
          </div>
          <div className="text-sm text-red-600 font-medium">
            Wire transfer charges to be borne by payer
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-600 border-t pt-4">
          Electronic wire transfer details for payment on next page
        </div>
      </CardContent>
    </Card>
  );

  const renderModernTemplate = () => (
    <Card className="bg-white shadow-xl">
      <CardContent className="p-8">
        {/* Modern Header with Gradient */}
        <div className="relative mb-8 p-6 rounded-lg" style={{
          background: `linear-gradient(135deg, ${template.colors.primary} 0%, ${template.colors.secondary} 100%)`
        }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-white items-center">
            <div className="flex justify-start">
              <div className="bg-white bg-opacity-20 p-2 rounded-lg backdrop-blur-sm">
                <CompanyLogo size="small" />
              </div>
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: template.fonts.header }}>
                KIZORA SOFTWARE
              </h1>
              <p className="text-sm opacity-90">PRIVATE LIMITED</p>
            </div>
            <div className="text-right text-sm opacity-90">
              <p>Plot No. 12 First Floor, Hill Top, Ambazari</p>
              <p>Nagpur Maharashtra 440033, INDIA</p>
              <p>Ph: +91 8080466754 | www.kizora.com</p>
            </div>
          </div>
        </div>

        {/* Invoice Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold" style={{ color: template.colors.primary, fontFamily: template.fonts.header }}>
            INVOICE
          </h2>
          <p className="text-sm text-gray-600 mt-2">Electronic Customer Invoice</p>
        </div>

        {/* Split Layout for Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-semibold mb-4" style={{ color: template.colors.primary }}>Bill To:</h3>
            <div className="space-y-2">
              <div>
                <Label className="text-xs text-gray-500 uppercase tracking-wide">Customer</Label>
                {isEditing ? (
                  <Input
                    value={displayData.customerName}
                    onChange={(e) => onInputChange?.('customerName', e.target.value)}
                    className="mt-1"
                  />
                ) : (
                  <p className="font-medium">{displayData.customerName}</p>
                )}
              </div>
              <div>
                <Label className="text-xs text-gray-500 uppercase tracking-wide">Address</Label>
                {isEditing ? (
                  <Input
                    value={displayData.customerAddress}
                    onChange={(e) => onInputChange?.('customerAddress', e.target.value)}
                    className="mt-1"
                  />
                ) : (
                  <p className="text-sm">{displayData.customerAddress}</p>
                )}
              </div>
              <div>
                <Label className="text-xs text-gray-500 uppercase tracking-wide">Contact</Label>
                {isEditing ? (
                  <Input
                    value={displayData.contactPerson}
                    onChange={(e) => onInputChange?.('contactPerson', e.target.value)}
                    className="mt-1"
                  />
                ) : (
                  <p className="text-sm">{displayData.contactPerson}</p>
                )}
              </div>
              <div>
                <Label className="text-xs text-gray-500 uppercase tracking-wide">Email</Label>
                {isEditing ? (
                  <Input
                    value={displayData.email}
                    onChange={(e) => onInputChange?.('email', e.target.value)}
                    className="mt-1"
                  />
                ) : (
                  <p className="text-sm">{displayData.email}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-gray-500 uppercase tracking-wide">Invoice #</Label>
                {isEditing ? (
                  <Input
                    value={displayData.invoiceNumber || getInvoiceNumber()}
                    onChange={(e) => onInputChange?.('invoiceNumber', e.target.value)}
                    className="mt-1"
                  />
                ) : (
                  <p className="font-semibold">{getInvoiceNumber()}</p>
                )}
              </div>
              <div>
                <Label className="text-xs text-gray-500 uppercase tracking-wide">Date</Label>
                {isEditing ? (
                  <Input
                    type="date"
                    value={getInvoiceDateForInput()}
                    onChange={(e) => onInputChange?.('invoiceDate', e.target.value)}
                    className="mt-1"
                  />
                ) : (
                  <p className="font-semibold">{formatDateForDisplay(getInvoiceDate())}</p>
                )}
              </div>
            </div>
            <div>
              <Label className="text-xs text-gray-500 uppercase tracking-wide">Due Date</Label>
              {isEditing ? (
                <div className="mt-1 p-2 bg-gray-50 border border-gray-200 rounded text-gray-700 text-sm">
                  {formatDateForDisplay(getPaymentDueDate(getInvoiceDateForInput()))} (15 days after invoice date)
                </div>
              ) : (
                <p className="font-semibold">{formatDateForDisplay(displayData.paymentDueDate)}</p>
              )}
            </div>
            <div>
              <Label className="text-xs text-gray-500 uppercase tracking-wide">Work Period</Label>
              {isEditing ? (
                <div className="mt-1">
                  {renderMonthYearPicker(displayData.workPeriod, (value) => onInputChange?.('workPeriod', value))}
                </div>
              ) : (
                <p className="font-semibold">{displayData.workPeriod}</p>
              )}
            </div>
          </div>
        </div>

        {/* Purpose */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <Label className="text-xs text-gray-500 uppercase tracking-wide">Project Description</Label>
          {isEditing ? (
            <Input
              value={displayData.invoicePurpose}
              onChange={(e) => onInputChange?.('invoicePurpose', e.target.value)}
              className="mt-1"
            />
          ) : (
            <p>{displayData.invoicePurpose}</p>
          )}
        </div>

        {/* Modern Employee Table */}
        <div className="mb-8">
          
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <div className="text-white p-4 grid grid-cols-5 gap-4 font-semibold" style={{ backgroundColor: template.colors.primary }}>
              <div>#</div>
              <div>Team Member</div>
              <div>Rate ({displayData.currency}/hr)</div>
              <div>Hours</div>
              <div>Amount</div>
            </div>

            {displayData.employees.map((employee, index) => (
              <div key={employee.id} className={`p-4 grid grid-cols-5 gap-4 items-center ${
                index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
              }`}>
                <div className="font-medium">{index + 1}</div>
                <div>
                  {isEditing ? (
                    <Input
                      value={employee.name}
                      onChange={(e) => onEmployeeChange?.(employee.id, 'name', e.target.value)}
                      className="text-sm"
                    />
                  ) : (
                    <span className="font-medium">{employee.name}</span>
                  )}
                </div>
                <div>
                  {isEditing ? (
                    <Input
                      type="number"
                      step="0.01"
                      value={employee.ratePerHour}
                      onChange={(e) => onEmployeeChange?.(employee.id, 'ratePerHour', parseFloat(e.target.value) || 0)}
                      className="text-sm"
                    />
                  ) : (
                    employee.ratePerHour.toFixed(2)
                  )}
                </div>
                <div>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={employee.hours}
                      onChange={(e) => onEmployeeChange?.(employee.id, 'hours', parseInt(e.target.value) || 0)}
                      className="text-sm"
                    />
                  ) : (
                    employee.hours
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{displayData.currency} {(employee.ratePerHour * employee.hours).toFixed(2)}</span>
                  {isEditing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveEmployee?.(employee.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}

            <div className="p-4 font-semibold" style={{ backgroundColor: template.colors.primary, color: 'white' }}>
              <div className="grid grid-cols-5 gap-4">
                <div></div>
                <div></div>
                <div></div>
                <div>TOTAL</div>
                <div>{displayData.currency} {displayData.employees.reduce((sum, emp) => sum + (emp.ratePerHour * emp.hours), 0).toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Total Amount with Modern Styling */}
        <div className="text-right">
          <div className="inline-block p-6 rounded-lg" style={{ backgroundColor: template.colors.primary }}>
            <div className="text-white">
              <p className="text-sm opacity-90">Total Amount</p>
              <p className="text-2xl font-bold">{displayData.currency} {displayData.employees.reduce((sum, emp) => sum + (emp.ratePerHour * emp.hours), 0).toFixed(2)}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Wire transfer charges to be borne by payer</p>
        </div>
      </CardContent>
    </Card>
  );

  const renderMinimalTemplate = () => (
    <Card className="bg-white shadow-sm border-0">
      <CardContent className="p-12">
        {/* Minimal Header */}
        <div className="mb-12">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-light mb-2" style={{ color: template.colors.primary, fontFamily: template.fonts.header }}>
                Kizora Software
              </h1>
              <div className="w-12 h-1 mb-6" style={{ backgroundColor: template.colors.primary }}></div>
              <div className="text-sm text-gray-600 space-y-1" style={{ fontFamily: template.fonts.body }}>
                <p>Plot No. 12 First Floor, Hill Top, Ambazari, Nagpur Maharashtra 440033</p>
                <p>info@kizora.com | +91 8080466754 | www.kizora.com</p>
              </div>
            </div>
            <div>
              <CompanyLogo size="small" />
            </div>
          </div>
        </div>

        {/* Simple Invoice Title */}
        <div className="mb-12">
          <h2 className="text-4xl font-light" style={{ color: template.colors.text, fontFamily: template.fonts.header }}>
            Invoice
          </h2>
        </div>

        {/* Clean Details Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            <h3 className="text-sm font-medium mb-4" style={{ color: template.colors.primary }}>CLIENT</h3>
            <div className="space-y-2">
              {isEditing ? (
                <Input
                  value={displayData.customerName}
                  onChange={(e) => onInputChange?.('customerName', e.target.value)}
                  className="border-0 border-b-2 rounded-none px-0"
                />
              ) : (
                <p className="font-medium">{displayData.customerName}</p>
              )}
              {isEditing ? (
                <Input
                  value={displayData.customerAddress}
                  onChange={(e) => onInputChange?.('customerAddress', e.target.value)}
                  className="border-0 border-b-2 rounded-none px-0"
                />
              ) : (
                <p className="text-sm text-gray-600">{displayData.customerAddress}</p>
              )}
              {isEditing ? (
                <Input
                  value={displayData.email}
                  onChange={(e) => onInputChange?.('email', e.target.value)}
                  className="border-0 border-b-2 rounded-none px-0"
                />
              ) : (
                <p className="text-sm text-gray-600">{displayData.email}</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-4" style={{ color: template.colors.primary }}>PROJECT</h3>
            <div className="space-y-2">
              {isEditing ? (
                <Input
                  value={displayData.invoicePurpose}
                  onChange={(e) => onInputChange?.('invoicePurpose', e.target.value)}
                  className="border-0 border-b-2 rounded-none px-0"
                />
              ) : (
                <p className="text-sm">{displayData.invoicePurpose}</p>
              )}
              {isEditing ? (
                <div className="border-b-2 border-gray-200 pb-1">
                  {renderMonthYearPicker(displayData.workPeriod, (value) => onInputChange?.('workPeriod', value))}
                </div>
              ) : (
                <p className="text-sm text-gray-600">Period: {displayData.workPeriod}</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-4" style={{ color: template.colors.primary }}>DETAILS</h3>
            <div className="space-y-2">
              {isEditing ? (
                <Input
                  value={displayData.invoiceNumber || getInvoiceNumber()}
                  onChange={(e) => onInputChange?.('invoiceNumber', e.target.value)}
                  className="border-0 border-b-2 rounded-none px-0"
                  placeholder="Invoice number"
                />
              ) : (
                <p className="text-sm">Invoice: {getInvoiceNumber()}</p>
              )}
              {isEditing ? (
                <Input
                  type="date"
                  value={getInvoiceDateForInput()}
                  onChange={(e) => onInputChange?.('invoiceDate', e.target.value)}
                  className="border-0 border-b-2 rounded-none px-0"
                />
              ) : (
                <p className="text-sm text-gray-600">Date: {formatDateForDisplay(getInvoiceDate())}</p>
              )}
              {isEditing ? (
                <div className="text-sm text-gray-600 border-b-2 border-gray-200 pb-1">
                  Due: {formatDateForDisplay(getPaymentDueDate(getInvoiceDateForInput()))} (15 days after invoice date)
                </div>
              ) : (
                <p className="text-sm text-gray-600">Due: {formatDateForDisplay(displayData.paymentDueDate)}</p>
              )}
            </div>
          </div>
        </div>

        {/* Minimal Table */}
        <div className="mb-12">
          
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-8 pb-2 border-b text-sm font-medium" style={{ color: template.colors.primary }}>
              <div>DESCRIPTION</div>
              <div>RATE</div>
              <div>HOURS</div>
              <div className="text-right">AMOUNT</div>
            </div>

            {displayData.employees.map((employee, index) => (
              <div key={employee.id} className="grid grid-cols-4 gap-8 items-center py-3">
                <div>
                  {isEditing ? (
                    <Input
                      value={employee.name}
                      onChange={(e) => onEmployeeChange?.(employee.id, 'name', e.target.value)}
                      className="border-0 border-b rounded-none px-0"
                    />
                  ) : (
                    employee.name
                  )}
                </div>
                <div>
                  {isEditing ? (
                    <Input
                      type="number"
                      step="0.01"
                      value={employee.ratePerHour}
                      onChange={(e) => onEmployeeChange?.(employee.id, 'ratePerHour', parseFloat(e.target.value) || 0)}
                      className="border-0 border-b rounded-none px-0"
                    />
                  ) : (
                    `${displayData.currency} ${employee.ratePerHour.toFixed(2)}`
                  )}
                </div>
                <div>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={employee.hours}
                      onChange={(e) => onEmployeeChange?.(employee.id, 'hours', parseInt(e.target.value) || 0)}
                      className="border-0 border-b rounded-none px-0"
                    />
                  ) : (
                    employee.hours
                  )}
                </div>
                <div className="text-right flex justify-between items-center">
                  <span>{displayData.currency} {(employee.ratePerHour * employee.hours).toFixed(2)}</span>
                  {isEditing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveEmployee?.(employee.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}

            <div className="border-t pt-4 mt-8">
              <div className="grid grid-cols-4 gap-8">
                <div></div>
                <div></div>
                <div className="font-medium">TOTAL</div>
                <div className="text-right font-bold text-lg" style={{ color: template.colors.primary }}>
                  {displayData.currency} {displayData.employees.reduce((sum, emp) => sum + (emp.ratePerHour * emp.hours), 0).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Simple Footer */}
        <div className="text-center text-sm text-gray-500 pt-8 border-t">
          <p>Thank you for your business</p>
        </div>
      </CardContent>
    </Card>
  );

  const renderCorporateTemplate = () => (
    <Card className="bg-white shadow-lg border-2" style={{ borderColor: template.colors.primary }}>
      <CardContent className="p-8">
        {/* Corporate Header with Logo Space */}
        <div className="border-b-4 pb-6 mb-8" style={{ borderColor: template.colors.primary }}>
          <div className="grid grid-cols-1 md:grid-cols-2 items-center">
            <div>
              <h1 className="text-2xl font-bold mb-2" style={{ color: template.colors.primary, fontFamily: template.fonts.header }}>
                KIZORA SOFTWARE PRIVATE LIMITED
              </h1>
              <div className="text-xs text-gray-600 space-y-1" style={{ fontFamily: template.fonts.body }}>
                <p><strong>Registered Office:</strong> Plot No. 12 First Floor, Hill Top, Ambazari</p>
                <p>Nagpur Maharashtra 440033, INDIA</p>
                <p><strong>Phone:</strong> +91 8080466754 | <strong>Email:</strong> info@kizora.com</p>
                <p><strong>GST:</strong> 27AAECK4021C1Z3 | <strong>CIN:</strong> U72300MH2011PTC219628</p>
              </div>
            </div>
            <div className="text-right">
              <CompanyLogo size="large" />
            </div>
          </div>
        </div>

        {/* Professional Invoice Title */}
        <div className="text-center mb-8 p-4" style={{ backgroundColor: `${template.colors.primary}20` }}>
          <h2 className="text-2xl font-bold" style={{ color: template.colors.primary, fontFamily: template.fonts.header }}>
            TAX INVOICE
          </h2>
          <p className="text-sm mt-1" style={{ color: template.colors.text }}>Customer Electronic Invoice</p>
        </div>

        {/* Corporate Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="border rounded-lg p-4" style={{ borderColor: template.colors.secondary }}>
            <h3 className="font-bold mb-3 text-sm uppercase tracking-wide" style={{ color: template.colors.primary }}>
              Bill To
            </h3>
            <div className="space-y-2">
              <div>
                <Label className="text-xs font-semibold text-gray-500">CUSTOMER NAME</Label>
                {isEditing ? (
                  <Input
                    value={displayData.customerName}
                    onChange={(e) => onInputChange?.('customerName', e.target.value)}
                    className="mt-1 text-sm"
                  />
                ) : (
                  <p className="font-semibold">{displayData.customerName}</p>
                )}
              </div>
              <div>
                <Label className="text-xs font-semibold text-gray-500">ADDRESS</Label>
                {isEditing ? (
                  <Input
                    value={displayData.customerAddress}
                    onChange={(e) => onInputChange?.('customerAddress', e.target.value)}
                    className="mt-1 text-sm"
                  />
                ) : (
                  <p className="text-sm">{displayData.customerAddress}</p>
                )}
              </div>
              <div>
                <Label className="text-xs font-semibold text-gray-500">CONTACT PERSON</Label>
                {isEditing ? (
                  <Input
                    value={displayData.contactPerson}
                    onChange={(e) => onInputChange?.('contactPerson', e.target.value)}
                    className="mt-1 text-sm"
                  />
                ) : (
                  <p className="text-sm">{displayData.contactPerson}</p>
                )}
              </div>
              <div>
                <Label className="text-xs font-semibold text-gray-500">EMAIL ADDRESS</Label>
                {isEditing ? (
                  <Input
                    value={displayData.email}
                    onChange={(e) => onInputChange?.('email', e.target.value)}
                    className="mt-1 text-sm"
                  />
                ) : (
                  <p className="text-sm">{displayData.email}</p>
                )}
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-4" style={{ borderColor: template.colors.secondary }}>
            <h3 className="font-bold mb-3 text-sm uppercase tracking-wide" style={{ color: template.colors.primary }}>
              Invoice Details
            </h3>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs font-semibold text-gray-500">INVOICE NO.</Label>
                  {isEditing ? (
                    <Input
                      value={displayData.invoiceNumber || getInvoiceNumber()}
                      onChange={(e) => onInputChange?.('invoiceNumber', e.target.value)}
                      className="mt-1 text-sm"
                    />
                  ) : (
                    <p className="font-semibold text-sm">{getInvoiceNumber()}</p>
                  )}
                </div>
                <div>
                  <Label className="text-xs font-semibold text-gray-500">DATE</Label>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={getInvoiceDateForInput()}
                      onChange={(e) => onInputChange?.('invoiceDate', e.target.value)}
                      className="mt-1 text-sm"
                    />
                  ) : (
                    <p className="font-semibold text-sm">{formatDateForDisplay(getInvoiceDate())}</p>
                  )}
                </div>
              </div>
              <div>
                <Label className="text-xs font-semibold text-gray-500">DUE DATE</Label>
                {isEditing ? (
                  <div className="mt-1 p-2 bg-gray-50 border border-gray-200 rounded text-gray-700 text-sm">
                    {formatDateForDisplay(getPaymentDueDate(getInvoiceDateForInput()))} (15 days after invoice date)
                  </div>
                ) : (
                  <p className="font-semibold text-sm">{formatDateForDisplay(displayData.paymentDueDate)}</p>
                )}
              </div>
              <div>
                <Label className="text-xs font-semibold text-gray-500">SOW REFERENCE</Label>
                {isEditing ? (
                  <Input
                    value={displayData.sowRef}
                    onChange={(e) => onInputChange?.('sowRef', e.target.value)}
                    className="mt-1 text-sm"
                  />
                ) : (
                  <p className="text-sm">{displayData.sowRef}</p>
                )}
              </div>
              <div>
                <Label className="text-xs font-semibold text-gray-500">WORK PERIOD</Label>
                {isEditing ? (
                  <div className="mt-1">
                    {renderMonthYearPicker(displayData.workPeriod, (value) => onInputChange?.('workPeriod', value))}
                  </div>
                ) : (
                  <p className="text-sm">{displayData.workPeriod}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Purpose Section */}
        <div className="mb-6 p-4 border rounded-lg" style={{ borderColor: template.colors.secondary, backgroundColor: `${template.colors.primary}05` }}>
          <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Invoice Purpose</Label>
          {isEditing ? (
            <Input
              value={displayData.invoicePurpose}
              onChange={(e) => onInputChange?.('invoicePurpose', e.target.value)}
              className="mt-1"
            />
          ) : (
            <p className="mt-1">{displayData.invoicePurpose}</p>
          )}
        </div>

        {/* Professional Table */}
        <div className="mb-8">
          
          <div className="border rounded-lg overflow-hidden" style={{ borderColor: template.colors.primary }}>
            <div className="text-white p-4 grid grid-cols-5 gap-4 font-bold text-sm" style={{ backgroundColor: template.colors.primary }}>
              <div>S.NO.</div>
              <div>EMPLOYEE NAME</div>
              <div>RATE ({displayData.currency}/HR)</div>
              <div>HOURS</div>
              <div>TOTAL AMOUNT</div>
            </div>

            {displayData.employees.map((employee, index) => (
              <div key={employee.id} className="p-4 grid grid-cols-5 gap-4 items-center border-b border-gray-200">
                <div className="font-medium">{index + 1}</div>
                <div>
                  {isEditing ? (
                    <Input
                      value={employee.name}
                      onChange={(e) => onEmployeeChange?.(employee.id, 'name', e.target.value)}
                      className="text-sm"
                    />
                  ) : (
                    <span className="font-medium">{employee.name}</span>
                  )}
                </div>
                <div>
                  {isEditing ? (
                    <Input
                      type="number"
                      step="0.01"
                      value={employee.ratePerHour}
                      onChange={(e) => onEmployeeChange?.(employee.id, 'ratePerHour', parseFloat(e.target.value) || 0)}
                      className="text-sm"
                    />
                  ) : (
                    employee.ratePerHour.toFixed(2)
                  )}
                </div>
                <div>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={employee.hours}
                      onChange={(e) => onEmployeeChange?.(employee.id, 'hours', parseInt(e.target.value) || 0)}
                      className="text-sm"
                    />
                  ) : (
                    employee.hours
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{displayData.currency} {(employee.ratePerHour * employee.hours).toFixed(2)}</span>
                  {isEditing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveEmployee?.(employee.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}

            <div className="p-4 font-bold text-white grid grid-cols-5 gap-4" style={{ backgroundColor: template.colors.secondary }}>
              <div></div>
              <div></div>
              <div></div>
              <div>GRAND TOTAL:</div>
              <div>{displayData.currency} {displayData.employees.reduce((sum, emp) => sum + (emp.ratePerHour * emp.hours), 0).toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* Corporate Total Box */}
        <div className="mb-6">
          <div className="border-2 rounded-lg p-6 text-right" style={{ borderColor: template.colors.primary }}>
            <div className="text-sm text-gray-600 mb-2">TOTAL INVOICE AMOUNT</div>
            <div className="text-3xl font-bold" style={{ color: template.colors.primary }}>
              {displayData.currency} {displayData.employees.reduce((sum, emp) => sum + (emp.ratePerHour * emp.hours), 0).toFixed(2)}
            </div>
            <div className="text-xs text-red-600 font-medium mt-2">
              * Wire transfer charges to be borne by payer
            </div>
          </div>
        </div>

        {/* Corporate Footer */}
        <div className="text-center text-xs text-gray-600 border-t pt-4">
          <p className="font-semibold">Electronic wire transfer details for payment on next page</p>
          <p className="mt-2">This is a computer generated invoice and does not require physical signature</p>
        </div>

        {/* Watermark */}
        {template.features.showWatermark && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
            <div className="text-6xl font-bold transform rotate-45" style={{ color: template.colors.primary }}>
              KIZORA
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Render based on template layout
  switch (template.layout) {
    case 'modern':
      return renderModernTemplate();
    case 'minimal':
      return renderMinimalTemplate();
    case 'corporate':
      return renderCorporateTemplate();
    default:
      return renderStandardTemplate();
  }
}
