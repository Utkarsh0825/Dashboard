import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs/promises';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { pdf } = req.query;
  
  if (!pdf || typeof pdf !== 'string') {
    return res.status(400).json({ error: 'PDF parameter required' });
  }

  try {
    const publicDir = path.join(process.cwd(), 'public');
    let pdfPath = '';
    
    if (pdf === 'email-report-one-page') {
      pdfPath = path.join(publicDir, 'email-report-one-page.pdf');
    } else if (pdf === 'full-report-sample') {
      pdfPath = path.join(publicDir, 'full-report-sample.pdf');
    } else {
      return res.status(404).json({ error: 'PDF not found' });
    }

    const pdfBuffer = await fs.readFile(pdfPath);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${pdf}.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error serving PDF:', error);
    res.status(500).json({ error: 'Failed to serve PDF' });
  }
}
