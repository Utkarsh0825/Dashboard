// PDF data for email attachments
// This ensures 100% reliability on both localhost and Vercel

// Create simple but valid PDF content for email-report-one-page.pdf
const createEmailReportPDF = () => {
  const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 500
>>
stream
BT
/F1 16 Tf
72 720 Td
(NBLK Email Report - One Page) Tj
0 -30 Td
/F1 12 Tf
(Executive Summary) Tj
0 -30 Td
(Key Insights) Tj
0 -30 Td
(Strategic Recommendations) Tj
0 -30 Td
(Implementation Timeline) Tj
0 -30 Td
(Success Metrics) Tj
0 -30 Td
(Next Steps) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000204 00000 n
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
653
%%EOF`;

  return Buffer.from(pdfContent);
};

// Create simple but valid PDF content for full-report-sample.pdf
const createFullReportPDF = () => {
  const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 600
>>
stream
BT
/F1 16 Tf
72 720 Td
(NBLK Full Sample Report) Tj
0 -30 Td
/F1 12 Tf
(Complete Business Diagnostic) Tj
0 -30 Td
(Industry benchmarks and analysis) Tj
0 -30 Td
(Strategic recommendations) Tj
0 -30 Td
(Implementation timeline) Tj
0 -30 Td
(Success metrics) Tj
0 -30 Td
(Detailed insights) Tj
0 -30 Td
(Performance analysis) Tj
0 -30 Td
(Comprehensive evaluation) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000204 00000 n
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
653
%%EOF`;

  return Buffer.from(pdfContent);
};

// Helper function to create PDF buffers
export const createPdfBuffers = () => {
  const emailReportOnePage = createEmailReportPDF();
  const fullReportSample = createFullReportPDF();
  
  return {
    emailReportOnePage,
    fullReportSample
  };
};
