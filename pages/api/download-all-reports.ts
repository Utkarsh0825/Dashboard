import type { NextApiRequest, NextApiResponse } from 'next';
import { generatePdfReport } from '@/lib/pdf';
import JSZip from 'jszip';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { reports, name } = req.body;

    if (!reports || !Array.isArray(reports) || reports.length === 0 || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const zip = new JSZip();

    // Generate PDF for each report
    for (const report of reports) {
      const { toolName, score, answers } = report;

      // Validate that answers exist
      if (!answers || !Array.isArray(answers) || answers.length === 0) {
        console.error(`Missing or invalid answers for ${toolName}:`, answers);
        throw new Error(`Missing answers for ${toolName}`);
      }

      // Format answers for PDF generation
      const formattedAnswers = answers.map((answer: any, index: number) => ({
        question: answer.question,
        short: `Q${index + 1}`,
        answer: answer.answer
      }));

      // Generate PDF
      const pdfBuffer = await generatePdfReport({
        companyName: name,
        userScore: score,
        answers: formattedAnswers,
        toolName: toolName,
        userTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });

      // Add to ZIP
      const fileName = `${toolName.replace(/\s+/g, '-').toLowerCase()}-report.pdf`;
      zip.file(fileName, pdfBuffer);
    }

    // Generate ZIP file
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    // Set headers for ZIP download
    const fileName = `${name.replace(/\s+/g, '-').toLowerCase()}-diagnostic-reports-${Date.now()}.zip`;
    
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', zipBuffer.length);
    
    res.send(zipBuffer);
  } catch (error) {
    console.error('Error generating ZIP:', error);
    res.status(500).json({ error: 'Failed to generate ZIP' });
  }
}
