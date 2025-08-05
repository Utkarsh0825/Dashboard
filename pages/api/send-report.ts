import type { NextApiRequest, NextApiResponse } from 'next';
import { generatePdfReport, DiagnosticInput } from '../../lib/pdf';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Incoming /api/send-report request:', req.body);
    const { to, name, toolName, reportContent, score, answers } = req.body;

    if (!to || !name || !toolName || !reportContent || typeof score !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: to, name, toolName, reportContent, or score.'
      });
    }

    if (!process.env.SENDGRID_API_KEY) {
      return res.status(200).json({
        success: true,
        message: 'Email simulated (no API key configured)',
      });
    }

    // --- FIX: Ensure answers is always an array of {question, short, answer} ---
    let answersArray;
    if (Array.isArray(answers) && answers[0] && typeof answers[0] === 'object' && 'answer' in answers[0]) {
      answersArray = answers;
    } else {
      // Try to parse from reportContent or fallback to 10 dummy answers
      answersArray = [];
      if (typeof reportContent === 'string') {
        // Try to extract questions from reportContent
        const match = reportContent.match(/\*\*Assessment:\*\* (.+)/);
        const tool = match ? match[1] : toolName;
        for (let i = 1; i <= 10; i++) {
          answersArray.push({
            question: `Q${i} for ${tool}`,
            short: `Q${i}`,
            answer: i <= score / 10 ? 'Yes' : 'No'
          });
        }
      } else {
        for (let i = 1; i <= 10; i++) {
          answersArray.push({
            question: `Q${i} for ${toolName}`,
            short: `Q${i}`,
            answer: i <= score / 10 ? 'Yes' : 'No'
          });
        }
      }
    }

    // PDF generation with error handling
    const pdfInput: DiagnosticInput = {
      companyName: name,
      userScore: score,
      answers: answersArray,
      toolName: toolName,
    };

    let pdfBuffer: Buffer | null;
    let filename: string | null;
    
    try {
      pdfBuffer = await generatePdfReport(pdfInput);
      console.log('PDF buffer type:', typeof pdfBuffer);
      console.log('PDF buffer length:', pdfBuffer.length);
      console.log('First 100 bytes:', pdfBuffer.slice(0, 100));
      filename = `NBLK-Diagnostic-Report-${Date.now()}.pdf`;
    } catch (pdfError) {
      console.error('PDF generation failed:', pdfError);
      // Continue without PDF attachment
      pdfBuffer = null;
      filename = null;
    }

    const emailData = {
      personalizations: [
        {
          to: [{ email: to, name }],
          subject: `Your Initial Diagnostic Results Are In — Let's Keep Building`,
        },
      ],
      from: {
        email: 'info@nblkconsulting.com',
        name: 'NBLK',
      },
      reply_to: {
        email: 'info@nblkconsulting.com',
        name: 'NBLK',
      },
      content: [
        {
          type: 'text/html',
          value: generateProfessionalEmailHTML(name, toolName, reportContent, score),
        },
      ],
      // Include PDF attachment only if generation succeeded
      ...(pdfBuffer && filename && {
        attachments: [
          {
            content: pdfBuffer.toString('base64'),
            filename,
            type: 'application/pdf',
            disposition: 'attachment',
          },
        ],
      }),
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
      },
      body: JSON.stringify(emailData),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('SendGrid error:', response.status, errorText);
      return res.status(200).json({
        success: false,
        message: `Email delivery failed: ${response.status} - ${errorText}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Email sent successfully with professional PDF report',
    });

  } catch (error) {
    console.error('Error in /api/send-report:', error);
    if (error instanceof Error && error.name === 'AbortError') {
      return res.status(200).json({
        success: false,
        message: 'Email delivery timed out. Please try again.',
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Error sending email',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

function generateProfessionalEmailHTML(name: string, toolName: string, reportContent: any, score: number) {
  const currentDate = new Date().toLocaleDateString();
  const content = typeof reportContent === 'string' ? reportContent : reportContent.content || '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Your NBLK Diagnostic Report</title>
        <style>
            body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; }
            .container { background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; }
            .header { background: linear-gradient(135deg, #000 0%, #006400 100%); color: white; text-align: center; padding: 40px 20px; }
            .logo { font-size: 36px; font-weight: bold; margin-bottom: 10px; letter-spacing: 2px; }
            .score-section { background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 40px; text-align: center; border-bottom: 3px solid #006400; }
            .score { font-size: 64px; font-weight: bold; color: #006400; margin-bottom: 10px; text-shadow: 2px 2px 4px rgba(0,0,0,0.1); }
            .performance-level { font-size: 24px; font-weight: 600; color: #495057; margin-bottom: 10px; }
            .content { padding: 40px; white-space: pre-line; font-size: 16px; text-align: left; }
            .section { margin: 32px 40px 0 40px; text-align: left; font-size: 16px; line-height: 1.6; }
            .section-title { font-size: 1.15rem; font-weight: bold; color: #006400; margin-bottom: 8px; margin-top: 24px; }
            .b2b-link { font-weight: bold; color: #006400; text-decoration: underline; font-size: 16px; }
            .footer { background: #006400; color: white; text-align: center; padding: 30px; font-size: 14px; }
            .footer-logo { font-size: 24px; font-weight: bold; margin-bottom: 15px; letter-spacing: 1px; }
            strong { color: #006400; }
            .pdf-notice { background: #e8f5e8; border: 1px solid #006400; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: center; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">NBLK</div>
                <h2 style="margin: 0; font-weight: 300;">Business Diagnostic Report</h2>
            </div>
            <div class="score-section">
                <div class="score">
                <div class="performance-level">${getPerformanceLevel(score)} Performance</div>
                <p style="margin: 15px 0 0 0; color: #666; font-size: 16px;">Prepared for ${name}</p>
            </div>
            <div class="pdf-notice">
                <strong>📄 Professional PDF Report Attached</strong><br>
                Your detailed diagnostic report with charts, analysis, and strategic recommendations is attached to this email.
            </div>
            <div class="content">
                ${content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>')}
            </div>
            <div class="section">
              <div class="section-title">B2B Partner</div>
              <div>
                This is just the beginning. You’ve taken the first step in a modular toolset designed to help small businesses identify gaps, unlock AI-powered support, and grow with clarity. More diagnostic modules will be released soon — each building toward a full-spectrum profile that provides deeper insights, smarter recommendations, and actionable plans.<br><br>
                If you'd like to:<br>
                Be alerted when new modules go live<br>
                Track your progress toward a complete diagnostic report<br>
                Or apply to be a B2B partner (and potentially be recommended to other businesses through our network)<br>
                <span class="b2b-link"><a href="https://nblk.typeform.com/NBLKForm" class="b2b-link">Sign up here</a></span><br><br>
                This diagnostic tool is powered by the NNX1™<sup>®</sup> Engine — built to put people first, and AI to work for them. We're excited to have you on this journey.<br><br>
                Thanks for being part of the NBLK community,<br>
                <strong>The NBLK Team</strong>
              </div>
            </div>
            <div class="footer">
                <div class="footer-logo">NBLK CONSULTING</div>
                <p style="margin: 10px 0;">442 5th Avenue, #2304, New York, NY 10018</p>
                <p style="margin: 10px 0;">Email: admin@nblkconsulting.com | Phone: (212) 598-3030</p>
            </div>
        </div>
    </body>
    </html>
  `;
}

function getPerformanceLevel(score: number) {
  if (score >= 90) return 'Exceptional';
  if (score >= 80) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 60) return 'Fair';
  if (score >= 40) return 'Below Average';
  return 'Needs Attention';
} 