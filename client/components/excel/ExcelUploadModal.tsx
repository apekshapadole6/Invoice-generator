import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  X,
  Download,
  Users,
  Building,
  Plus
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useProjects } from '../../contexts/ProjectContext';

interface ExcelUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ParsedEmployeeData {
  projectName: string;
  employeeName: string;
  rate: number;
  hours: number;
  amount: number;
}

interface ProjectMatch {
  projectName: string;
  employees: ParsedEmployeeData[];
  matchedProjectId?: string;
  matchedProjectName?: string;
}

export default function ExcelUploadModal({ open, onOpenChange }: ExcelUploadModalProps) {
  const { projects, updateProject } = useProjects();
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [parsedData, setParsedData] = useState<ProjectMatch[]>([]);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [excelTabs, setExcelTabs] = useState<string[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>('');
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>('');  // Tracks selected Excel tab for UI consistency

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const parseExcelData = (data: any[]): ParsedEmployeeData[] => {
    const employeeData: ParsedEmployeeData[] = [];

    console.log('📊 Raw Excel Data:', data);
    console.log('📋 Header Row:', data[0]);

    // Skip header row and process data
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      console.log(`📝 Row ${i}:`, row);

      // Expected columns: Employee Name, Project Name, Rate, Hours, Amount (based on user's Excel format)
      const employeeName = row[0]?.toString().trim();
      const projectName = row[1]?.toString().trim();
      const rate = parseFloat(row[2]) || 0;
      const hours = parseFloat(row[3]) || 0;
      const amount = parseFloat(row[4]) || (rate * hours);

      console.log(`🔍 Parsed Row ${i}:`, {
        projectName,
        employeeName,
        rate,
        hours,
        amount
      });

      if (projectName && employeeName && (rate > 0 || hours > 0)) {
        employeeData.push({
          projectName,
          employeeName,
          rate,
          hours,
          amount
        });
      } else {
        console.log(`⚠️ Row ${i} skipped - missing required data`);
      }
    }

    console.log('✅ Final parsed employee data:', employeeData);
    return employeeData;
  };

  const groupByProject = (employees: ParsedEmployeeData[]): ProjectMatch[] => {
    const grouped = employees.reduce((acc, employee) => {
      const projectName = employee.projectName;
      if (!acc[projectName]) {
        acc[projectName] = [];
      }
      acc[projectName].push(employee);
      return acc;
    }, {} as Record<string, ParsedEmployeeData[]>);

    return Object.entries(grouped).map(([projectName, employees]) => {
      // Try to find matching project (case-insensitive)
      const excelProjectLower = projectName.toLowerCase().trim();

      console.log('🔍 Trying to match Excel project:', `"${projectName}" (normalized: "${excelProjectLower}")`);
      console.log('📋 Available projects:', projects.map(p => `"${p.name}" (normalized: "${p.name.toLowerCase().trim()}")`));

      const matchedProject = projects.find(p => {
        const existingProjectLower = p.name.toLowerCase().trim();

        // Try exact match first
        if (existingProjectLower === excelProjectLower) {
          console.log('✅ Exact match found:', p.name);
          return true;
        }

        // Try partial matches (either direction)
        const isPartialMatch = existingProjectLower.includes(excelProjectLower) ||
                              excelProjectLower.includes(existingProjectLower);

        if (isPartialMatch) {
          console.log('✅ Partial match found:', p.name);
          return true;
        }

        return false;
      });

      if (!matchedProject) {
        console.log('��� No match found for:', projectName);
      }

      return {
        projectName,
        employees,
        matchedProjectId: matchedProject?.id,
        matchedProjectName: matchedProject?.name
      };
    });
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadStatus('idle');
    setErrorMessage('');

    try {
      // Validate file type
      if (!file.name.match(/\.(xlsx|xls)$/i)) {
        throw new Error('Please upload a valid Excel file (.xlsx or .xls)');
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Store workbook and available tabs
          setWorkbook(workbook);
          setExcelTabs(workbook.SheetNames);
          
          // Set the first tab as selected by default
          const firstTab = workbook.SheetNames[0];
          setSelectedTab(firstTab);

          // Set first tab as the selected month for UI tracking
          setSelectedMonth(firstTab);

          // Process the first tab
          processSelectedTab(workbook, firstTab);
          
        } catch (error) {
          console.error('Error parsing Excel file:', error);
          setErrorMessage(error instanceof Error ? error.message : 'Failed to parse Excel file');
          setUploadStatus('error');
        } finally {
          setIsUploading(false);
        }
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to upload file');
      setUploadStatus('error');
      setIsUploading(false);
    }
  };

  const processSelectedTab = (workbook: XLSX.WorkBook, sheetName: string) => {
    try {
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      console.log('📊 Excel Sheet Name:', sheetName);
      console.log('📊 Raw JSON Data:', jsonData);

      if (jsonData.length < 2) {
        throw new Error('Excel file must contain at least a header row and one data row');
      }

      // Validate header format
      const headers = jsonData[0] as any[];
      console.log('📋 Excel Headers:', headers);

      if (!headers || headers.length < 4) {
        throw new Error('Excel file must have at least 4 columns: Project Name, Employee Name, Rate, Hours');
      }

      // Parse employee data
      const parsedEmployees = parseExcelData(jsonData);

      if (parsedEmployees.length === 0) {
        throw new Error(`No valid employee data found in Excel file.

Expected format:
Column A: Project Name (e.g., "West Horminics")
Column B: Employee Name (e.g., "John Doe")
Column C: Rate Per Hour (e.g., 15.25)
Column D: Hours (e.g., 160)
Column E: Total Amount (optional)`);
      }

      // Group by project
      const projectMatches = groupByProject(parsedEmployees);
      setParsedData(projectMatches);
      setUploadStatus('success');
    } catch (error) {
      console.error('Error processing tab:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to process selected tab');
      setUploadStatus('error');
    }
  };

  const handleTabChange = (tabName: string) => {
    setSelectedTab(tabName);
    setSelectedMonth(tabName);  // Update UI state to match the selected tab
    if (workbook) {
      processSelectedTab(workbook, tabName);
    }
  };

  const handleImportData = () => {
    // Only process projects that have matches (ignore unmatched projects)
    parsedData.forEach(projectMatch => {
      if (projectMatch.matchedProjectId) {
        // Convert to Employee format
        const newEmployees = projectMatch.employees.map(emp => ({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: emp.employeeName,
          ratePerHour: emp.rate,
          hours: emp.hours,
          total: emp.amount
        }));

        // Update existing project
        const currentProject = projects.find(p => p.id === projectMatch.matchedProjectId);
        if (currentProject) {
          // Append new employees to existing ones
          const updatedEmployees = [...currentProject.employees, ...newEmployees];
          const updatedTotalAmount = updatedEmployees.reduce((sum, emp) => sum + emp.total, 0);

          updateProject(projectMatch.matchedProjectId!, {
            employees: updatedEmployees,
            totalAmount: updatedTotalAmount,
            workPeriod: getCurrentMonth()  // Always use current month, not Excel tab name
          });
        }
      }
      // Ignore projects without matches - they won't be imported
    });

    // Close modal and reset state
    resetUpload();
    onOpenChange(false);
  };

  const downloadSampleTemplate = () => {
    // Use actual project names from the current projects for the sample
    const existingProjectNames = projects.map(p => p.name);
    const projectsToUse = existingProjectNames.length > 0 ? existingProjectNames : ['West Horminics', 'East Analytics', 'North Platform'];

    const sampleData = [
      ['Employee Name', 'Project Name', 'Rate Per Hour', 'Hours', 'Total Amount'],
      ['John Doe', projectsToUse[0] || 'West Horminics', 15.25, 160, 2440],
      ['Jane Smith', projectsToUse[0] || 'West Horminics', 17.00, 160, 2720],
      ['Bob Johnson', projectsToUse[1] || 'East Analytics', 18.50, 140, 2590],
      ['Alice Brown', projectsToUse[2] || 'North Platform', 16.75, 120, 2010]
    ];

    const ws = XLSX.utils.aoa_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Employee Data');
    XLSX.writeFile(wb, 'employee_data_template.xlsx');

    console.log('📥 Sample template downloaded with project names:', projectsToUse);
  };

  const getCurrentMonth = (): string => {
    const now = new Date();
    return now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const resetUpload = () => {
    setParsedData([]);
    setUploadStatus('idle');
    setErrorMessage('');
    setExcelTabs([]);
    setSelectedTab('');
    setWorkbook(null);
    setSelectedMonth('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-green-600" />
            Upload Excel Sheet
          </DialogTitle>
          <DialogDescription>
            Upload an Excel file containing employee data with project assignments. The system will automatically match employees to existing projects.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Sample Template Download */}
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">Need a template?</p>
                <p className="text-sm text-blue-700">Download our sample Excel template to see the expected format</p>
              </div>
            </div>
            <Button variant="outline" onClick={downloadSampleTemplate} className="text-blue-700 border-blue-300">
              <Download className="w-4 h-4 mr-2" />
              Download Template
            </Button>
          </div>

          {/* Upload Area */}
          {uploadStatus === 'idle' && (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragOver ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                {isDragOver ? 'Drop Excel file here' : 'Upload Excel File'}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Drag and drop your Excel file here, or click to browse
              </p>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
                id="excel-upload"
              />
              <label htmlFor="excel-upload">
                <Button className="bg-green-600 hover:bg-green-700" asChild>
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    Browse Files
                  </span>
                </Button>
              </label>
              <p className="text-xs text-gray-500 mt-2">Supports .xlsx and .xls files</p>
            </div>
          )}

          {/* Loading State */}
          {isUploading && (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Processing Excel file...</p>
            </div>
          )}

          {/* Error State */}
          {uploadStatus === 'error' && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {errorMessage}
              </AlertDescription>
            </Alert>
          )}

          {/* Success State with Data Preview */}
          {uploadStatus === 'success' && parsedData.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <h3 className="text-lg font-semibold">Excel Data Parsed Successfully</h3>
                    <p className="text-sm text-gray-600">
                      {parsedData.filter(p => p.matchedProjectId).length} existing projects will be updated
                      {parsedData.filter(p => !p.matchedProjectId).length > 0 && (
                        <span className="text-red-600">
                          , {parsedData.filter(p => !p.matchedProjectId).length} projects will be ignored
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <Button variant="outline" onClick={resetUpload} size="sm">
                  <X className="w-4 h-4 mr-2" />
                  Upload Different File
                </Button>
              </div>

              {/* Excel Tab/Month Selection */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Select Month</p>
                    <p className="text-xs text-blue-700">Choose which Excel tab to import data from</p>
                  </div>
                </div>
                <div className="mt-3">
                  <Select value={selectedTab} onValueChange={handleTabChange}>
                    <SelectTrigger className="w-full max-w-xs">
                      <SelectValue placeholder="Select a tab" />
                    </SelectTrigger>
                    <SelectContent>
                      {excelTabs.map((tabName) => (
                        <SelectItem key={tabName} value={tabName}>
                          {tabName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {excelTabs.length > 0 && (
                  <div className="mt-2 text-xs text-blue-600">
                    Available tabs: {excelTabs.join(', ')}
                  </div>
                )}
              </div>

              <div className="grid gap-4">
                {parsedData.map((projectMatch, index) => (
                  <Card key={index} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Building className="w-5 h-5 text-orange-600" />
                          <h4 className="font-semibold text-gray-900">
                            Excel Project: "{projectMatch.projectName}"
                          </h4>
                          <Badge variant="secondary">
                            <Users className="w-3 h-3 mr-1" />
                            {projectMatch.employees.length} employees
                          </Badge>
                        </div>
                        {projectMatch.matchedProjectId ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Matched: {projectMatch.matchedProjectName}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-red-700 border-red-400">
                            <X className="w-3 h-3 mr-1" />
                            Will be ignored (no customer data)
                          </Badge>
                        )}
                      </div>

                      {projectMatch.matchedProjectId ? (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <h5 className="font-medium text-gray-700 mb-2">Employees to be added to existing project:</h5>
                          <div className="space-y-1">
                            {projectMatch.employees.map((emp, empIndex) => (
                              <div key={empIndex} className="flex items-center justify-between text-sm">
                                <span className="font-medium">{emp.employeeName}</span>
                                <span className="text-gray-600">
                                  ${emp.rate}/hr × {emp.hours}h = ${emp.amount.toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                          <h5 className="font-medium text-red-700 mb-2">Employees will NOT be imported:</h5>
                          <div className="space-y-1">
                            {projectMatch.employees.map((emp, empIndex) => (
                              <div key={empIndex} className="flex items-center justify-between text-sm text-red-600">
                                <span className="font-medium line-through">{emp.employeeName}</span>
                                <span className="line-through">
                                  ${emp.rate}/hr × {emp.hours}h = ${emp.amount.toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                          <div className="mt-2 pt-2 border-t border-red-200">
                            <p className="text-xs text-red-600">
                              ⚠️ No matching project found - these employees will be skipped
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {parsedData.some(p => p.matchedProjectId) && (
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleImportData}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Import Employee Data
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Expected Format Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Expected Excel Format:</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Column A:</strong> Project Name (must match existing project names)</p>
              <p><strong>Column B:</strong> Employee Name</p>
              <p><strong>Column C:</strong> Rate Per Hour</p>
              <p><strong>Column D:</strong> Hours Worked</p>
              <p><strong>Column E:</strong> Total Amount (optional, will be calculated if not provided)</p>
            </div>

            {projects.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <h5 className="font-medium text-gray-700 mb-2">Available Project Names:</h5>
                <div className="flex flex-wrap gap-1">
                  {projects.map(project => (
                    <span key={project.id} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      "{project.name}"
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  💡 Copy these exact names to your Excel file's Project Name column
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
