import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Eye, Download, Palette, Upload, Edit, Pen } from 'lucide-react';
import { useProjects } from '../contexts/ProjectContext';
import { downloadProjectInvoice } from '../utils/templateDownload';
import { useTemplate } from '../contexts/TemplateContext';
import { useState } from 'react';
import TemplateSelectorModal from '../components/templates/TemplateSelectorModal';
import ExcelUploadModal from '../components/excel/ExcelUploadModal';
import EditProjectModal from '../components/projects/EditProjectModal';

export default function Index() {
  const { projects } = useProjects();
  const { selectedTemplate } = useTemplate();
  const navigate = useNavigate();
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showExcelUpload, setShowExcelUpload] = useState(false);
  const [showEditProject, setShowEditProject] = useState(false);
  const [editingProject, setEditingProject] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePreview = (projectId: string) => {
    console.log('Preview clicked for project:', projectId);
    navigate(`/preview/${projectId}`);
  };

  const handleDownload = (projectId: string) => {
    console.log('Download clicked for project:', projectId);
    const project = projects.find(p => p.id === projectId);
    if (!project) {
      alert('Project not found');
      return;
    }

    downloadProjectInvoice(project, selectedTemplate);
  };

  const handleEdit = (projectId: string) => {
    console.log('Edit clicked for project:', projectId);
    setEditingProject(projectId);
    setShowEditProject(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Project Management</h1>
              <p className="text-gray-600 mt-1">Manage working hours and payments for your projects</p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowExcelUpload(true)}
                className="border-green-500 text-green-700 hover:bg-green-500 hover:text-white"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Excel Sheet
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowTemplateSelector(true)}
                className="border-primary text-primary hover:bg-primary hover:text-white"
              >
                <Palette className="w-4 h-4 mr-2" />
                Select Templates
              </Button>
              <Link to="/add-project">
                <Button className="bg-primary hover:bg-primary/90 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Project
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    {project.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        project.status
                      )}`}
                    >
                      {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleEdit(project.id)}
                      className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                      title="Edit project"
                    >
                      <Pen className="w-4 h-4 text-gray-500 hover:text-blue-600" />
                    </button>
                  </div>
                </div>

              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Customer:</span> {project.customerName}
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Work Period:</span> {project.workPeriod}
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Total Amount:</span> {project.currency} {project.totalAmount.toFixed(2)}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handlePreview(project.id)}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary cursor-pointer"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownload(project.id)}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary cursor-pointer"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {projects.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-sm p-8 max-w-md mx-auto">
              <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
              <p className="text-gray-600 mb-4">
                Get started by creating your first project to track working hours and payments.
              </p>
              <Link to="/add-project">
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Project
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Template Selector Modal */}
      <TemplateSelectorModal
        open={showTemplateSelector}
        onOpenChange={setShowTemplateSelector}
      />

      {/* Excel Upload Modal */}
      <ExcelUploadModal
        open={showExcelUpload}
        onOpenChange={setShowExcelUpload}
      />

      {/* Edit Project Modal */}
      <EditProjectModal
        open={showEditProject}
        onOpenChange={setShowEditProject}
        projectId={editingProject}
      />
    </div>
  );
}
