import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export interface IncidentData {
  location: string;
  description: string;
  isElderlyInvolved: boolean;
  image?: File | null;
}

export async function generateIncidentPDF(data: IncidentData): Promise<Uint8Array> {
  const { location, description, isElderlyInvolved, image } = data;

  const pdfDoc = await PDFDocument.create();
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Define colors
  const primaryBlue = rgb(0.2, 0.4, 0.8);
  const darkGray = rgb(0.3, 0.3, 0.3);
  const lightGray = rgb(0.9, 0.9, 0.9);
  const black = rgb(0, 0, 0);
  const white = rgb(1, 1, 1);

  // Page 1: Main Report
  const page1 = pdfDoc.addPage([595, 842]); // A4 size
  const { width: pageWidth, height: pageHeight } = page1.getSize();
  
  let currentY = pageHeight - 40;

  // Header with blue background
  page1.drawRectangle({
    x: 0,
    y: pageHeight - 120,
    width: pageWidth,
    height: 120,
    color: primaryBlue,
  });

  // Company/Organization header (optional)
  page1.drawText('INCIDENT MANAGEMENT SYSTEM', {
    x: 40,
    y: pageHeight - 60,
    size: 14,
    font: helveticaFont,
    color: white,
  });

  // Main title
  page1.drawText('INCIDENT REPORT', {
    x: 40,
    y: pageHeight - 85,
    size: 28,
    font: helveticaBold,
    color: white,
  });

  // Report date and ID
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const reportId = `RPT-${Date.now().toString().slice(-6)}`;

  page1.drawText(`Report Date: ${currentDate}`, {
    x: 40,
    y: pageHeight - 105,
    size: 10,
    font: helveticaFont,
    color: white,
  });

  page1.drawText(`Report ID: ${reportId}`, {
    x: pageWidth - 150,
    y: pageHeight - 105,
    size: 10,
    font: helveticaFont,
    color: white,
  });

  currentY = pageHeight - 160;

  // Report Information Section
  // Section header background
  page1.drawRectangle({
    x: 40,
    y: currentY - 25,
    width: pageWidth - 80,
    height: 25,
    color: lightGray,
  });

  page1.drawText('INCIDENT DETAILS', {
    x: 50,
    y: currentY - 18,
    size: 14,
    font: helveticaBold,
    color: darkGray,
  });

  currentY -= 50;

  // Location field
  page1.drawText('Incident Location:', {
    x: 50,
    y: currentY,
    size: 12,
    font: helveticaBold,
    color: darkGray,
  });

  page1.drawRectangle({
    x: 50,
    y: currentY - 25,
    width: pageWidth - 100,
    height: 20,
    borderColor: lightGray,
    borderWidth: 1,
  });

  page1.drawText(location || 'Not specified', {
    x: 55,
    y: currentY - 18,
    size: 11,
    font: helveticaFont,
    color: black,
  });

  currentY -= 50;

  // Elderly involvement field
  page1.drawText('Elderly Person Involved:', {
    x: 50,
    y: currentY,
    size: 12,
    font: helveticaBold,
    color: darkGray,
  });

  const elderlyStatus = isElderlyInvolved ? 'YES' : 'NO';
  const elderlyColor = isElderlyInvolved ? rgb(0.8, 0.2, 0.2) : rgb(0.2, 0.6, 0.2);

  page1.drawRectangle({
    x: 50,
    y: currentY - 25,
    width: 100,
    height: 20,
    color: elderlyColor,
  });

  page1.drawText(elderlyStatus, {
    x: 75,
    y: currentY - 18,
    size: 11,
    font: helveticaBold,
    color: white,
  });

  currentY -= 70;

  // Description section
  page1.drawRectangle({
    x: 40,
    y: currentY - 5,
    width: pageWidth - 80,
    height: 25,
    color: lightGray,
  });

  page1.drawText('INCIDENT DESCRIPTION', {
    x: 50,
    y: currentY + 8,
    size: 14,
    font: helveticaBold,
    color: darkGray,
  });

  currentY -= 35;

  const descriptionText = description || 'No description provided';
  
  // Create description box
  const descriptionBoxHeight = Math.max(100, Math.min(200, Math.ceil(descriptionText.length / 80) * 20));
  
  page1.drawRectangle({
    x: 50,
    y: currentY - descriptionBoxHeight,
    width: pageWidth - 100,
    height: descriptionBoxHeight,
    borderColor: lightGray,
    borderWidth: 1,
  });

  // Word wrap for description
  const words = descriptionText.split(' ');
  let line = '';
  let lineY = currentY - 20;
  const maxLineWidth = pageWidth - 120;

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const testWidth = helveticaFont.widthOfTextAtSize(testLine, 10);
    
    if (testWidth > maxLineWidth && line !== '') {
      page1.drawText(line.trim(), {
        x: 55,
        y: lineY,
        size: 10,
        font: helveticaFont,
        color: black,
      });
      line = words[i] + ' ';
      lineY -= 15;
    } else {
      line = testLine;
    }
  }
  
  if (line.trim() !== '') {
    page1.drawText(line.trim(), {
      x: 55,
      y: lineY,
      size: 10,
      font: helveticaFont,
      color: black,
    });
  }

  currentY -= descriptionBoxHeight + 30;

  // Summary section
  page1.drawRectangle({
    x: 40,
    y: currentY - 5,
    width: pageWidth - 80,
    height: 25,
    color: lightGray,
  });

  page1.drawText('REPORT SUMMARY', {
    x: 50,
    y: currentY + 8,
    size: 14,
    font: helveticaBold,
    color: darkGray,
  });

  currentY -= 35;

  const summaryItems = [
    `• Report generated on ${currentDate}`,
    `• Location: ${location || 'Not specified'}`,
    `• Elderly involvement: ${elderlyStatus}`,
    `• Image attached: ${image ? 'Yes' : 'No'}`,
    `• Report ID: ${reportId}`,
  ];

  summaryItems.forEach((item) => {
    page1.drawText(item, {
      x: 55,
      y: currentY,
      size: 10,
      font: helveticaFont,
      color: darkGray,
    });
    currentY -= 18;
  });

  // Footer
  page1.drawRectangle({
    x: 0,
    y: 0,
    width: pageWidth,
    height: 40,
    color: primaryBlue,
  });

  page1.drawText('This report was generated automatically by the Incident Management System', {
    x: 40,
    y: 15,
    size: 9,
    font: helveticaFont,
    color: white,
  });

  page1.drawText(`Page 1 of ${image ? '2' : '1'}`, {
    x: pageWidth - 80,
    y: 15,
    size: 9,
    font: helveticaFont,
    color: white,
  });

  // Page 2: Image (if provided)
  if (image) {
    const page2 = pdfDoc.addPage([595, 842]);
    const { width: page2Width, height: page2Height } = page2.getSize();
    
    // Header for page 2
    page2.drawRectangle({
      x: 0,
      y: page2Height - 80,
      width: page2Width,
      height: 80,
      color: primaryBlue,
    });

    page2.drawText('INCIDENT REPORT - SUPPORTING EVIDENCE', {
      x: 40,
      y: page2Height - 45,
      size: 20,
      font: helveticaBold,
      color: white,
    });

    page2.drawText(`Report ID: ${reportId}`, {
      x: 40,
      y: page2Height - 65,
      size: 10,
      font: helveticaFont,
      color: white,
    });

    // Image section
    try {
      const imageBytes = await image.arrayBuffer();
      let embeddedImage;

      if (image.type === 'image/png') {
        embeddedImage = await pdfDoc.embedPng(imageBytes);
      } else {
        embeddedImage = await pdfDoc.embedJpg(imageBytes);
      }

      const imageAspectRatio = embeddedImage.width / embeddedImage.height;
      const maxImageWidth = page2Width - 100;
      const maxImageHeight = page2Height - 200;

      let imageWidth, imageHeight;

      if (imageAspectRatio > maxImageWidth / maxImageHeight) {
        imageWidth = maxImageWidth;
        imageHeight = maxImageWidth / imageAspectRatio;
      } else {
        imageHeight = maxImageHeight;
        imageWidth = maxImageHeight * imageAspectRatio;
      }

      const imageX = (page2Width - imageWidth) / 2;
      const imageY = (page2Height - 80 - imageHeight) / 2;

      // Image border
      page2.drawRectangle({
        x: imageX - 5,
        y: imageY - 5,
        width: imageWidth + 10,
        height: imageHeight + 10,
        borderColor: lightGray,
        borderWidth: 2,
      });

      page2.drawImage(embeddedImage, {
        x: imageX,
        y: imageY,
        width: imageWidth,
        height: imageHeight,
      });

      // Image caption
      page2.drawText('Incident Evidence Photo', {
        x: (page2Width - helveticaBold.widthOfTextAtSize('Incident Evidence Photo', 12)) / 2,
        y: imageY - 25,
        size: 12,
        font: helveticaBold,
        color: darkGray,
      });

      page2.drawText(`File: ${image.name}`, {
        x: (page2Width - helveticaFont.widthOfTextAtSize(`File: ${image.name}`, 10)) / 2,
        y: imageY - 40,
        size: 10,
        font: helveticaFont,
        color: darkGray,
      });

    } catch (error) {
      // If image processing fails, show error message
      page2.drawText('Error loading image', {
        x: (page2Width - helveticaBold.widthOfTextAtSize('Error loading image', 16)) / 2,
        y: page2Height / 2,
        size: 16,
        font: helveticaBold,
        color: rgb(0.8, 0.2, 0.2),
      });
    }

    // Footer for page 2
    page2.drawRectangle({
      x: 0,
      y: 0,
      width: page2Width,
      height: 40,
      color: primaryBlue,
    });

    page2.drawText('This report was generated automatically by the Incident Management System', {
      x: 40,
      y: 15,
      size: 9,
      font: helveticaFont,
      color: white,
    });

    page2.drawText('Page 2 of 2', {
      x: page2Width - 80,
      y: 15,
      size: 9,
      font: helveticaFont,
      color: white,
    });
  }

  // Set PDF metadata
  pdfDoc.setTitle('Incident Report');
  pdfDoc.setAuthor('Incident Management System');
  pdfDoc.setSubject(`Incident Report - ${reportId}`);
  pdfDoc.setCreator('Incident Management System');
  pdfDoc.setProducer('PDF Generator v1.0');
  pdfDoc.setCreationDate(new Date());
  pdfDoc.setModificationDate(new Date());

  return await pdfDoc.save();
}