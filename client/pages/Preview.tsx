import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Save, X, Download } from 'lucide-react';
import { useProjects, type Employee } from '../contexts/ProjectContext';
import TemplateRenderer from '../components/templates/TemplateRenderer';
import { useTemplate } from '../contexts/TemplateContext';
import { downloadProjectInvoice } from '../utils/templateDownload';

export default function Preview() {
  const { id } = useParams();
  const { getProject, updateProject } = useProjects();
  const { selectedTemplate } = useTemplate();
  const [project, setProject] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState(null);

  const convertDateForInput = (dateString: string): string => {
    // If no date string provided, return current month's last date
    if (!dateString || dateString.trim() === '') {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth(); // 0-11
      const lastDay = new Date(currentYear, currentMonth + 1, 0);
      const year = lastDay.getFullYear();
      const month = String(lastDay.getMonth() + 1).padStart(2, '0');
      const day = String(lastDay.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    
    // If it's already in YYYY-MM-DD format, return as is
    if (dateString.includes('-') && dateString.length === 10) {
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
    
    // If we can't parse it, return current month's last date
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-11
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
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

  useEffect(() => {
    if (id) {
      const foundProject = getProject(id);
      setProject(foundProject);
      setEditData({
        ...foundProject,
        invoiceDate: convertDateForInput(foundProject.invoiceDate),
        paymentDueDate: convertDateForInput(foundProject.paymentDueDate)
      });
    }
    setLoading(false);
  }, [id, getProject]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <Link to="/" className="flex items-center text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Link>
          </div>
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Project Not Found</h2>
            <p className="text-gray-600 mb-4">The project with ID "{id}" could not be found.</p>
            <Link to="/">
              <Button>Back to Projects</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({ 
      ...project,
      invoiceDate: convertDateForInput(project.invoiceDate),
      paymentDueDate: convertDateForInput(project.paymentDueDate)
    });
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
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-11
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const year = lastDay.getFullYear().toString().slice(-2);
    const month = String(lastDay.getMonth() + 1).padStart(2, '0');
    const day = String(lastDay.getDate()).padStart(2, '0');
    return `${day}/${month}/${year}`;
  };

  const handleSave = () => {
    // Calculate totals for employees
    const updatedEmployees = editData.employees.map(emp => ({
      ...emp,
      total: emp.ratePerHour * emp.hours
    }));
    
    const totalAmount = updatedEmployees.reduce((sum, emp) => sum + emp.total, 0);
    
    const updatedProject = {
      ...editData,
      employees: updatedEmployees,
      totalAmount,
      invoiceDate: convertDateForStorage(editData.invoiceDate),
      paymentDueDate: convertDateForStorage(getPaymentDueDate(editData.invoiceDate))
    };

    updateProject(project.id, updatedProject);
    setProject(updatedProject);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({ 
      ...project,
      invoiceDate: convertDateForInput(project.invoiceDate),
      paymentDueDate: convertDateForInput(project.paymentDueDate)
    });
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleEmployeeChange = (employeeId, field, value) => {
    setEditData(prev => ({
      ...prev,
      employees: prev.employees.map(emp => 
        emp.id === employeeId ? { ...emp, [field]: value } : emp
      )
    }));
  };



  const removeEmployee = (employeeId) => {
    setEditData(prev => ({
      ...prev,
      employees: prev.employees.filter(emp => emp.id !== employeeId)
    }));
  };

  const handleDownload = () => {
    downloadProjectInvoice(project, selectedTemplate);
  };

  const displayData = isEditing ? editData : project;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <Link to="/" className="flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Link>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancel}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                <Button variant="outline" onClick={handleEdit}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Document
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Template Renderer */}
        <TemplateRenderer
          project={project}
          template={selectedTemplate}
          isEditing={isEditing}
          editData={editData}
          onInputChange={handleInputChange}
          onEmployeeChange={handleEmployeeChange}
          onRemoveEmployee={removeEmployee}
        />
      </div>
    </div>
  );
}
