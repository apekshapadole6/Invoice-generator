import { RequestHandler } from "express";
import { prisma } from "../db";
import { z } from "zod";

// Validation schemas
const EmployeeSchema = z.object({
  name: z.string().min(1),
  ratePerHour: z.number().min(0),
  hours: z.number().min(0),
  total: z.number().min(0),
});

const CreateProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  customerName: z.string().min(1),
  customerAddress: z.string().min(1),
  contactPerson: z.string().min(1),
  email: z.string().email(),
  invoiceNumber: z.string().min(1),
  invoiceDate: z.string(),
  paymentDueDate: z.string(),
  workPeriod: z.string(),
  sowRef: z.string(),
  poNumber: z.string().optional(),
  invoicePurpose: z.string(),
  currency: z.string().default("EUR"),
  totalAmount: z.number().default(0),
  status: z.string().default("active"),
  employees: z.array(EmployeeSchema).default([])
});

const UpdateProjectSchema = CreateProjectSchema.partial();

const CreateEmployeeSchema = EmployeeSchema;

// Get all projects
export const getProjects: RequestHandler = async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        employees: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
};

// Get project by ID
export const getProjectById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        employees: true,
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
};

// Create new project
export const createProject: RequestHandler = async (req, res) => {
  try {
    const validatedData = CreateProjectSchema.parse(req.body);
    const { employees, ...projectData } = validatedData;

    const project = await prisma.project.create({
      data: {
        name: projectData.name,
        description: projectData.description,
        customerName: projectData.customerName,
        customerAddress: projectData.customerAddress,
        contactPerson: projectData.contactPerson,
        email: projectData.email,
        invoiceNumber: projectData.invoiceNumber,
        invoiceDate: projectData.invoiceDate,
        paymentDueDate: projectData.paymentDueDate,
        workPeriod: projectData.workPeriod,
        sowRef: projectData.sowRef,
        poNumber: projectData.poNumber,
        invoicePurpose: projectData.invoicePurpose,
        currency: projectData.currency,
        totalAmount: projectData.totalAmount,
        status: projectData.status,
        employees: {
          create: employees.map(emp => ({
            name: emp.name,
            ratePerHour: emp.ratePerHour,
            hours: emp.hours,
            total: emp.total,
          })),
        },
      },
      include: {
        employees: true,
      },
    });

    res.status(201).json(project);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
};

// Update project
export const updateProject: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = UpdateProjectSchema.parse(req.body);
    const { employees, ...projectData } = validatedData;

    // Start a transaction
    const project = await prisma.$transaction(async (tx) => {
      // Update project data
      const updatedProject = await tx.project.update({
        where: { id },
        data: projectData,
      });

      // If employees are provided, replace them
      if (employees) {
        // Delete existing employees
        await tx.employee.deleteMany({
          where: { projectId: id },
        });

        // Create new employees
        if (employees.length > 0) {
          for (const emp of employees) {
            await tx.employee.create({
              data: {
                name: emp.name,
                ratePerHour: emp.ratePerHour,
                hours: emp.hours,
                total: emp.total,
                projectId: id,
              },
            });
          }
        }
      }

      // Return updated project with employees
      return await tx.project.findUnique({
        where: { id },
        include: { employees: true },
      });
    });

    res.json(project);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
};

// Delete project
export const deleteProject: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.project.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
};

// Add employee to project
export const addEmployee: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params; // project id
    const validatedData = CreateEmployeeSchema.parse(req.body);

    const employee = await prisma.employee.create({
      data: {
        name: validatedData.name,
        ratePerHour: validatedData.ratePerHour,
        hours: validatedData.hours,
        total: validatedData.total,
        projectId: id,
      },
    });

    // Update project total amount
    const employees = await prisma.employee.findMany({
      where: { projectId: id },
    });
    
    const totalAmount = employees.reduce((sum, emp) => sum + emp.total, 0);
    
    await prisma.project.update({
      where: { id },
      data: { totalAmount },
    });

    res.status(201).json(employee);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: error.errors });
    }
    console.error('Error adding employee:', error);
    res.status(500).json({ error: 'Failed to add employee' });
  }
};

// Remove employee from project
export const removeEmployee: RequestHandler = async (req, res) => {
  try {
    const { id, employeeId } = req.params;

    await prisma.employee.delete({
      where: { id: employeeId },
    });

    // Update project total amount
    const employees = await prisma.employee.findMany({
      where: { projectId: id },
    });
    
    const totalAmount = employees.reduce((sum, emp) => sum + emp.total, 0);
    
    await prisma.project.update({
      where: { id },
      data: { totalAmount },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error removing employee:', error);
    res.status(500).json({ error: 'Failed to remove employee' });
  }
};
