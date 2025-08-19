import type { NextApiRequest, NextApiResponse } from 'next';
import { generatePdfReport } from '@/lib/pdf';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { toolName, score, answers, name, email } = req.body;

    if (!toolName || score === undefined || !answers || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate answers
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: 'Invalid or missing answers' });
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

    // Set headers for PDF download
    const fileName = `${toolName.replace(/\s+/g, '-').toLowerCase()}-report-${Date.now()}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
}
