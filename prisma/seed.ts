import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Helper functions for dynamic data
const getLastDateOfCurrentMonth = (): string => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-11
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  // Format as YYYY-MM-DD
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

const getCurrentMonthYear = (): string => {
  const now = new Date();
  const month = now.toLocaleDateString('en-US', { month: 'long' });
  const year = now.getFullYear();
  return `${month} ${year}`;
};

const generateInvoiceNumber = (projectName: string): string => {
  const firstFourLetters = projectName.replace(/[^A-Za-z]/g, '').substring(0, 4).toUpperCase();
  const currentDate = new Date();
  const month = currentDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const year = currentDate.getFullYear().toString().slice(-2);
  return `INVOICE-${firstFourLetters}-${month}${year}`;
};

async function main() {
  console.log('🌱 Starting seed...')

  // Clear existing data
  await prisma.employee.deleteMany()
  await prisma.project.deleteMany()

  const invoiceDate = getLastDateOfCurrentMonth();

  // Create sample projects
  const project1 = await prisma.project.create({
    data: {
      name: 'West Horminics',
      customerName: 'ABC Corp',
      customerAddress: '221 Baker Street London 12345',
      contactPerson: 'Andy Sorowsky',
      email: 'Andys@abccorp.sd',
      invoiceNumber: generateInvoiceNumber('West Horminics'),
      invoiceDate: invoiceDate,
      paymentDueDate: getPaymentDueDate(invoiceDate),
      workPeriod: getCurrentMonthYear(),
      sowRef: 'Professional Services Agreement',
      poNumber: '',
      invoicePurpose: 'Software service provided to ABC Corp',
      currency: 'EUR',
      totalAmount: 5160.00,
      status: 'active',
      employees: {
        create: [
          {
            name: 'John Doe',
            ratePerHour: 15.25,
            hours: 160,
            total: 2440.00
          },
          {
            name: 'Jane Smith',
            ratePerHour: 17.00,
            hours: 160,
            total: 2720.00
          }
        ]
      }
    }
  })

  const project2 = await prisma.project.create({
    data: {
      name: 'East Analytics',
      customerName: 'XYZ Ltd',
      customerAddress: '456 Analytics Avenue, Tech City 67890',
      contactPerson: 'Sarah Johnson',
      email: 'sarah@xyzltd.com',
      invoiceNumber: generateInvoiceNumber('East Analytics'),
      invoiceDate: invoiceDate,
      paymentDueDate: getPaymentDueDate(invoiceDate),
      workPeriod: getCurrentMonthYear(),
      sowRef: 'Analytics Services Agreement',
      poNumber: 'PO-2024-001',
      invoicePurpose: 'Analytics and reporting services provided to XYZ Ltd',
      currency: 'EUR',
      totalAmount: 2590.00,
      status: 'completed',
      employees: {
        create: [
          {
            name: 'Bob Johnson',
            ratePerHour: 18.50,
            hours: 140,
            total: 2590.00
          }
        ]
      }
    }
  })

  const project3 = await prisma.project.create({
    data: {
      name: 'North Platform',
      customerName: 'TechCorp',
      customerAddress: '789 Platform Street, Cloud City 11223',
      contactPerson: 'Mike Wilson',
      email: 'mike@techcorp.io',
      invoiceNumber: generateInvoiceNumber('North Platform'),
      invoiceDate: invoiceDate,
      paymentDueDate: getPaymentDueDate(invoiceDate),
      workPeriod: getCurrentMonthYear(),
      sowRef: 'Platform Development Agreement',
      poNumber: '',
      invoicePurpose: 'Cloud platform development services provided to TechCorp',
      currency: 'USD',
      totalAmount: 0,
      status: 'draft',
      employees: {
        create: []
      }
    }
  })

  console.log('✅ Seeded projects:', { project1, project2, project3 })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
