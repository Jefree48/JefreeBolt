import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface GeneratePDFOptions {
  menuPlan?: string | null;
  shoppingList?: string | null;
  costEstimate?: string | null;
  userName: string;
  isPremium?: boolean;
}

export const generatePDF = async (userId: string, options: GeneratePDFOptions): Promise<jsPDF> => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Set fonts and colors
  const purple = '#7E22CE';
  const gray = '#374151';

  // Add header
  doc.setFillColor(purple);
  doc.rect(0, 0, 210, 20, 'F');
  doc.setTextColor('#FFFFFF');
  doc.setFontSize(16);
  doc.text('Jefree - Lista de Compra y Menú', 20, 13);

  // Add user info
  doc.setTextColor(gray);
  doc.setFontSize(10);
  doc.text(`Generado para: ${options.userName}`, 20, 30);
  doc.text(new Date().toLocaleDateString('es-ES'), 150, 30);

  let yPosition = 50;

  // Add menu plan if exists
  if (options.menuPlan) {
    doc.setTextColor(purple);
    doc.setFontSize(14);
    doc.text('Menú Semanal', 20, yPosition);
    yPosition += 10;

    doc.setTextColor(gray);
    doc.setFontSize(10);
    const menuLines = doc.splitTextToSize(options.menuPlan, 170);
    
    for (const line of menuLines) {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(line, 20, yPosition);
      yPosition += 5;
    }

    yPosition += 10;
  }

  // Add shopping list if exists
  if (options.shoppingList) {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setTextColor(purple);
    doc.setFontSize(14);
    doc.text('Lista de Compra', 20, yPosition);
    yPosition += 10;

    doc.setTextColor(gray);
    doc.setFontSize(10);
    const listLines = doc.splitTextToSize(options.shoppingList, 170);
    
    for (const line of listLines) {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(line, 20, yPosition);
      yPosition += 5;
    }

    // Add cost estimate if exists
    if (options.costEstimate) {
      yPosition += 10;
      doc.setTextColor(purple);
      doc.setFontSize(12);
      const cost = options.costEstimate.match(/\d+([.,]\d{1,2})?/);
      if (cost) {
        const value = parseFloat(cost[0].replace(',', '.'));
        doc.text(`Coste estimado: ${value.toFixed(2)}€`, 20, yPosition);
      }
    }
  }

  // Add footer to all pages
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(gray);
    doc.text(
      `Página ${i} de ${pageCount}`,
      105,
      290,
      { align: 'center' }
    );
  }

  return doc;
};

// Helper function to create PDF from HTML content
export const generatePDFFromHTML = async (element: HTMLElement): Promise<jsPDF> => {
  const canvas = await html2canvas(element, {
    scale: 2,
    logging: false,
    useCORS: true
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const imgProps = pdf.getImageProperties(imgData);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

  return pdf;
};