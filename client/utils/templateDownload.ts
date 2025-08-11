import { Project } from '../contexts/ProjectContext';
import { InvoiceTemplate, getTemplateById } from '../types/templates';
import { getCompanyLogoHTML } from '../components/ui/CompanyLogo';

export function generateTemplateHTML(project: Project, template: InvoiceTemplate): string {
  const companyInfo = {
    name: 'KIZORA SOFTWARE PRIVATE LIMITED',
    address: 'Plot No. 12 First Floor, Hill Top, Ambazari',
    city: 'Nagpur Maharashtra 440033, INDIA',
    phone: '+91 8080466754',
    email: 'info@kizora.com',
    website: 'www.kizora.com',
    gst: '27AAECK4021C1Z3',
    cin: 'U72300MH2011PTC219628'
  };

  const baseStyles = `
    body { 
      font-family: ${template.fonts.body}; 
      margin: 0; 
      padding: 20px; 
      background-color: ${template.colors.background};
      color: ${template.colors.text};
    }
    .container { max-width: 800px; margin: 0 auto; }
    .header { margin-bottom: 30px; }
    .company-name { 
      color: ${template.colors.primary}; 
      font-family: ${template.fonts.header};
      font-weight: bold; 
    }
    .company-details { font-size: 12px; color: #666; line-height: 1.4; }
    .invoice-title { 
      text-align: center; 
      font-family: ${template.fonts.header};
      font-weight: bold; 
      margin: 30px 0; 
    }
    .details-section { margin-bottom: 30px; }
    .detail-label { font-weight: bold; }
    .employee-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .employee-table th { 
      background-color: ${template.colors.primary}; 
      color: white; 
      padding: 12px; 
      text-align: left; 
    }
    .employee-table td { padding: 12px; border-bottom: 1px solid #ddd; }
    .total-row { background-color: #f5f5f5; font-weight: bold; }
    .invoice-total { text-align: right; font-weight: bold; margin: 20px 0; }
    .wire-note { color: #dc2626; font-size: 12px; text-align: right; margin-top: 10px; }
    .footer { text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 20px; margin-top: 30px; }
  `;

  switch (template.layout) {
    case 'standard':
      return generateStandardHTML(project, template, companyInfo, baseStyles);
    case 'modern':
      return generateModernHTML(project, template, companyInfo, baseStyles);
    case 'minimal':
      return generateMinimalHTML(project, template, companyInfo, baseStyles);
    case 'corporate':
      return generateCorporateHTML(project, template, companyInfo, baseStyles);
    default:
      return generateStandardHTML(project, template, companyInfo, baseStyles);
  }
}

function generateStandardHTML(project: Project, template: InvoiceTemplate, companyInfo: any, baseStyles: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Invoice-${project.invoiceNumber}</title>
    <style>
        ${baseStyles}
        .standard-header { border-bottom: 3px solid ${template.colors.primary}; padding-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-start; }
        .company-name { font-size: 24px; margin-bottom: 10px; }
        .invoice-title { font-size: 20px; }
        .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
        .logo-container { margin-left: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header standard-header">
            <div>
                <div class="company-name">${companyInfo.name}</div>
                <div class="company-details">
                    Address: ${companyInfo.address}<br>
                    ${companyInfo.city}<br>
                    Ph: ${companyInfo.phone}<br>
                    GST: ${companyInfo.gst}<br>
                    CIN: ${companyInfo.cin}<br>
                    Website: ${companyInfo.website} Email: ${companyInfo.email}
                </div>
            </div>
            <div class="logo-container">
                ${getCompanyLogoHTML(80, 80)}
            </div>
        </div>

        <div class="invoice-title">Customer Invoice (Electronic)</div>

        <div class="details-grid details-section">
            <div>
                <div class="detail-item"><span class="detail-label">Customer:</span> ${project.customerName}</div><br>
                <div class="detail-item"><span class="detail-label">Address:</span> ${project.customerAddress}</div><br>
                <div class="detail-item"><span class="detail-label">Contact Person:</span> ${project.contactPerson}</div><br>
                <div class="detail-item"><span class="detail-label">Email:</span> ${project.email}</div>
            </div>
            <div>
                <div class="detail-item"><span class="detail-label">Invoice Number:</span> ${project.invoiceNumber}</div><br>
                <div class="detail-item"><span class="detail-label">Invoice Date:</span> ${project.invoiceDate}</div><br>
                <div class="detail-item"><span class="detail-label">Payment Due Date:</span> ${project.paymentDueDate}</div><br>
                <div class="detail-item"><span class="detail-label">SOW REF:</span> ${project.sowRef}</div>
            </div>
        </div>

        <div class="details-section">
            <div class="detail-item"><span class="detail-label">Invoice Purpose:</span> ${project.invoicePurpose}</div><br>
            <div class="detail-item"><span class="detail-label">Work period:</span> ${project.workPeriod}</div>
        </div>

        <table class="employee-table">
            <thead>
                <tr>
                    <th>S.No.</th>
                    <th>Name</th>
                    <th>${project.currency}/ph</th>
                    <th>Hours</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${project.employees.map((employee, index) => `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${employee.name}</td>
                        <td>${employee.ratePerHour.toFixed(2)}</td>
                        <td>${employee.hours}</td>
                        <td>${project.currency} ${employee.total.toFixed(2)}</td>
                    </tr>
                `).join('')}
                <tr class="total-row">
                    <td></td>
                    <td>Total</td>
                    <td></td>
                    <td></td>
                    <td>${project.currency} ${project.totalAmount.toFixed(2)}</td>
                </tr>
            </tbody>
        </table>

        <div class="invoice-total">
            Total Invoice Amount: ${project.currency} ${project.totalAmount.toFixed(2)}
        </div>
        <div class="wire-note">Wire transfer charges to be borne by payer</div>

        <div class="footer">
            Electronic wire transfer details for payment on next page
        </div>
    </div>
</body>
</html>`;
}

function generateModernHTML(project: Project, template: InvoiceTemplate, companyInfo: any, baseStyles: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Invoice-${project.invoiceNumber}</title>
    <style>
        ${baseStyles}
        .modern-header {
            background: linear-gradient(135deg, ${template.colors.primary} 0%, ${template.colors.secondary} 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            display: grid;
            grid-template-columns: auto 1fr auto;
            gap: 30px;
            align-items: center;
            margin-bottom: 30px;
        }
        .logo-backdrop { background: rgba(255,255,255,0.2); padding: 8px; border-radius: 8px; }
        .company-name { font-size: 28px; margin-bottom: 5px; }
        .company-subtitle { font-size: 14px; opacity: 0.9; }
        .company-details { font-size: 12px; opacity: 0.9; text-align: right; }
        .invoice-title { font-size: 32px; color: ${template.colors.primary}; }
        .invoice-subtitle { font-size: 14px; color: #666; margin-top: 5px; }
        .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
        .detail-box { background: #f9fafb; padding: 20px; border-radius: 8px; }
        .detail-box h3 { color: ${template.colors.primary}; margin-bottom: 15px; font-size: 14px; font-weight: bold; }
        .employee-table tr:nth-child(even) { background-color: #f9fafb; }
        .total-section { 
            text-align: right; 
            background: ${template.colors.primary}; 
            color: white; 
            padding: 20px; 
            border-radius: 8px; 
            display: inline-block; 
            margin-left: auto; 
        }
        .total-section .amount { font-size: 24px; font-weight: bold; }
        .total-section .label { font-size: 12px; opacity: 0.9; }
    </style>
</head>
<body>
    <div class="container">
        <div class="modern-header">
            <div class="logo-backdrop">
                ${getCompanyLogoHTML(64, 64)}
            </div>
            <div style="text-align: center;">
                <div class="company-name">${companyInfo.name.split(' ').slice(0, 2).join(' ')}</div>
                <div class="company-subtitle">${companyInfo.name.split(' ').slice(2).join(' ')}</div>
            </div>
            <div class="company-details">
                ${companyInfo.address}<br>
                ${companyInfo.city}<br>
                Ph: ${companyInfo.phone} | ${companyInfo.website}
            </div>
        </div>

        <div class="invoice-title">INVOICE</div>
        <div class="invoice-subtitle">Electronic Customer Invoice</div>

        <div class="details-grid details-section">
            <div class="detail-box">
                <h3>Bill To:</h3>
                <div><strong>Customer:</strong> ${project.customerName}</div><br>
                <div><strong>Address:</strong> ${project.customerAddress}</div><br>
                <div><strong>Contact:</strong> ${project.contactPerson}</div><br>
                <div><strong>Email:</strong> ${project.email}</div>
            </div>
            <div>
                <div class="detail-item"><strong>Invoice #:</strong> ${project.invoiceNumber}</div><br>
                <div class="detail-item"><strong>Date:</strong> ${project.invoiceDate}</div><br>
                <div class="detail-item"><strong>Due Date:</strong> ${project.paymentDueDate}</div><br>
                <div class="detail-item"><strong>Work Period:</strong> ${project.workPeriod}</div><br>
                <div class="detail-item"><strong>Project:</strong> ${project.invoicePurpose}</div>
            </div>
        </div>

        <table class="employee-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Team Member</th>
                    <th>Rate (${project.currency}/hr)</th>
                    <th>Hours</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
                ${project.employees.map((employee, index) => `
                    <tr>
                        <td>${index + 1}</td>
                        <td><strong>${employee.name}</strong></td>
                        <td>${employee.ratePerHour.toFixed(2)}</td>
                        <td>${employee.hours}</td>
                        <td><strong>${project.currency} ${employee.total.toFixed(2)}</strong></td>
                    </tr>
                `).join('')}
                <tr style="background-color: ${template.colors.primary}; color: white; font-weight: bold;">
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>TOTAL</td>
                    <td>${project.currency} ${project.totalAmount.toFixed(2)}</td>
                </tr>
            </tbody>
        </table>

        <div style="text-align: right;">
            <div class="total-section">
                <div class="label">Total Amount</div>
                <div class="amount">${project.currency} ${project.totalAmount.toFixed(2)}</div>
            </div>
            <div class="wire-note">Wire transfer charges to be borne by payer</div>
        </div>
    </div>
</body>
</html>`;
}

function generateMinimalHTML(project: Project, template: InvoiceTemplate, companyInfo: any, baseStyles: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Invoice-${project.invoiceNumber}</title>
    <style>
        ${baseStyles}
        .minimal-header { margin-bottom: 40px; display: flex; justify-content: space-between; align-items: flex-start; }
        .company-name { font-size: 36px; font-weight: 300; margin-bottom: 10px; }
        .accent-line { width: 50px; height: 3px; background-color: ${template.colors.primary}; margin-bottom: 20px; }
        .company-details { font-size: 12px; color: #666; }
        .minimal-logo { margin-left: 20px; }
        .invoice-title { font-size: 48px; font-weight: 300; margin: 40px 0; }
        .details-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 40px; }
        .section-title { color: ${template.colors.primary}; font-size: 12px; font-weight: 600; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px; }
        .minimal-table { border: none; }
        .minimal-table th { 
            background: none; 
            color: ${template.colors.primary}; 
            border-bottom: 1px solid ${template.colors.primary}; 
            font-size: 12px; 
            text-transform: uppercase; 
            letter-spacing: 1px;
            padding: 10px 0;
        }
        .minimal-table td { border: none; padding: 15px 0; border-bottom: 1px solid #eee; }
        .total-row { border-top: 2px solid ${template.colors.primary}; }
        .total-amount { color: ${template.colors.primary}; font-size: 18px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <div class="minimal-header">
            <div>
                <div class="company-name">${companyInfo.name.split(' ').slice(0, 2).join(' ')}</div>
                <div class="accent-line"></div>
                <div class="company-details">
                    ${companyInfo.address}, ${companyInfo.city}<br>
                    ${companyInfo.email} | ${companyInfo.phone} | ${companyInfo.website}
                </div>
            </div>
            <div class="minimal-logo">
                ${getCompanyLogoHTML(64, 64)}
            </div>
        </div>

        <div class="invoice-title">Invoice</div>

        <div class="details-grid details-section">
            <div>
                <div class="section-title">Client</div>
                <div><strong>${project.customerName}</strong></div><br>
                <div>${project.customerAddress}</div><br>
                <div>${project.email}</div>
            </div>
            <div>
                <div class="section-title">Project</div>
                <div>${project.invoicePurpose}</div><br>
                <div>Period: ${project.workPeriod}</div>
            </div>
            <div>
                <div class="section-title">Details</div>
                <div>Invoice: ${project.invoiceNumber}</div><br>
                <div>Date: ${project.invoiceDate}</div><br>
                <div>Due: ${project.paymentDueDate}</div>
            </div>
        </div>

        <table class="employee-table minimal-table">
            <thead>
                <tr>
                    <th>Description</th>
                    <th>Rate</th>
                    <th>Hours</th>
                    <th style="text-align: right;">Amount</th>
                </tr>
            </thead>
            <tbody>
                ${project.employees.map((employee, index) => `
                    <tr>
                        <td>${employee.name}</td>
                        <td>${project.currency} ${employee.ratePerHour.toFixed(2)}</td>
                        <td>${employee.hours}</td>
                        <td style="text-align: right;">${project.currency} ${employee.total.toFixed(2)}</td>
                    </tr>
                `).join('')}
                <tr class="total-row">
                    <td></td>
                    <td></td>
                    <td><strong>TOTAL</strong></td>
                    <td style="text-align: right;" class="total-amount">${project.currency} ${project.totalAmount.toFixed(2)}</td>
                </tr>
            </tbody>
        </table>

        <div class="footer" style="border: none; margin-top: 60px;">
            <p>Thank you for your business</p>
        </div>
    </div>
</body>
</html>`;
}

function generateCorporateHTML(project: Project, template: InvoiceTemplate, companyInfo: any, baseStyles: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Invoice-${project.invoiceNumber}</title>
    <style>
        ${baseStyles}
        .corporate-header { 
            border-bottom: 4px solid ${template.colors.primary}; 
            padding-bottom: 20px; 
            display: grid; 
            grid-template-columns: 1fr auto; 
            align-items: center; 
        }
        .company-name { font-size: 24px; margin-bottom: 10px; }
        .company-details { font-size: 10px; line-height: 1.5; }
        .corporate-logo {
            width: 96px;
            height: 96px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .invoice-title { 
            background: ${template.colors.primary}20; 
            padding: 15px; 
            text-align: center; 
            font-size: 24px; 
            margin: 30px 0; 
        }
        .invoice-subtitle { font-size: 12px; margin-top: 5px; }
        .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
        .detail-box { border: 1px solid ${template.colors.secondary}; padding: 15px; border-radius: 5px; }
        .box-title { 
            color: ${template.colors.primary}; 
            font-size: 12px; 
            font-weight: bold; 
            text-transform: uppercase; 
            letter-spacing: 1px; 
            margin-bottom: 15px; 
        }
        .label { font-size: 10px; color: #666; font-weight: bold; text-transform: uppercase; }
        .value { font-weight: bold; margin-bottom: 8px; }
        .purpose-box { 
            border: 1px solid ${template.colors.secondary}; 
            background: ${template.colors.primary}05; 
            padding: 15px; 
            border-radius: 5px; 
            margin-bottom: 20px; 
        }
        .corporate-table { border: 2px solid ${template.colors.primary}; }
        .corporate-table th { 
            font-size: 12px; 
            font-weight: bold; 
            text-transform: uppercase; 
        }
        .total-box { 
            border: 2px solid ${template.colors.primary}; 
            padding: 20px; 
            text-align: right; 
            margin: 20px 0; 
            display: inline-block; 
            margin-left: auto; 
        }
        .total-box .label { color: #666; margin-bottom: 5px; }
        .total-box .amount { color: ${template.colors.primary}; font-size: 28px; font-weight: bold; }
        .watermark { 
            position: fixed; 
            top: 50%; 
            left: 50%; 
            transform: translate(-50%, -50%) rotate(45deg); 
            font-size: 80px; 
            color: ${template.colors.primary}10; 
            font-weight: bold; 
            z-index: -1; 
        }
    </style>
</head>
<body>
    <div class="container">
        ${template.features.showWatermark ? `<div class="watermark">KIZORA</div>` : ''}
        
        <div class="corporate-header">
            <div>
                <div class="company-name">${companyInfo.name}</div>
                <div class="company-details">
                    <strong>Registered Office:</strong> ${companyInfo.address}<br>
                    ${companyInfo.city}<br>
                    <strong>Phone:</strong> ${companyInfo.phone} | <strong>Email:</strong> ${companyInfo.email}<br>
                    <strong>GST:</strong> ${companyInfo.gst} | <strong>CIN:</strong> ${companyInfo.cin}
                </div>
            </div>
            <div class="corporate-logo">
                ${getCompanyLogoHTML(96, 96)}
            </div>
        </div>

        <div class="invoice-title">
            TAX INVOICE
            <div class="invoice-subtitle">Customer Electronic Invoice</div>
        </div>

        <div class="details-grid details-section">
            <div class="detail-box">
                <div class="box-title">Bill To</div>
                <div class="label">Customer Name</div>
                <div class="value">${project.customerName}</div>
                <div class="label">Address</div>
                <div class="value">${project.customerAddress}</div>
                <div class="label">Contact Person</div>
                <div class="value">${project.contactPerson}</div>
                <div class="label">Email Address</div>
                <div class="value">${project.email}</div>
            </div>
            <div class="detail-box">
                <div class="box-title">Invoice Details</div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    <div>
                        <div class="label">Invoice No.</div>
                        <div class="value">${project.invoiceNumber}</div>
                    </div>
                    <div>
                        <div class="label">Date</div>
                        <div class="value">${project.invoiceDate}</div>
                    </div>
                </div>
                <div class="label">Due Date</div>
                <div class="value">${project.paymentDueDate}</div>
                <div class="label">SOW Reference</div>
                <div class="value">${project.sowRef}</div>
                <div class="label">Work Period</div>
                <div class="value">${project.workPeriod}</div>
            </div>
        </div>

        <div class="purpose-box">
            <div class="label">Invoice Purpose</div>
            <div style="margin-top: 5px;">${project.invoicePurpose}</div>
        </div>

        <table class="employee-table corporate-table">
            <thead>
                <tr>
                    <th>S.No.</th>
                    <th>Employee Name</th>
                    <th>Rate (${project.currency}/Hr)</th>
                    <th>Hours</th>
                    <th>Total Amount</th>
                </tr>
            </thead>
            <tbody>
                ${project.employees.map((employee, index) => `
                    <tr>
                        <td><strong>${index + 1}</strong></td>
                        <td><strong>${employee.name}</strong></td>
                        <td>${employee.ratePerHour.toFixed(2)}</td>
                        <td>${employee.hours}</td>
                        <td><strong>${project.currency} ${employee.total.toFixed(2)}</strong></td>
                    </tr>
                `).join('')}
                <tr style="background-color: ${template.colors.secondary}; color: white; font-weight: bold;">
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>GRAND TOTAL:</td>
                    <td>${project.currency} ${project.totalAmount.toFixed(2)}</td>
                </tr>
            </tbody>
        </table>

        <div style="text-align: right;">
            <div class="total-box">
                <div class="label">TOTAL INVOICE AMOUNT</div>
                <div class="amount">${project.currency} ${project.totalAmount.toFixed(2)}</div>
                <div style="font-size: 10px; color: #dc2626; margin-top: 10px;">
                    * Wire transfer charges to be borne by payer
                </div>
            </div>
        </div>

        <div class="footer">
            <p><strong>Electronic wire transfer details for payment on next page</strong></p>
            <p style="margin-top: 10px;">This is a computer generated invoice and does not require physical signature</p>
        </div>
    </div>
</body>
</html>`;
}

export function downloadProjectInvoice(project: Project, template: InvoiceTemplate): void {
  const htmlContent = generateTemplateHTML(project, template);
  
  // Create and download the file
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Invoice-${project.invoiceNumber}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
