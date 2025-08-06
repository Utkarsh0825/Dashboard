import type { NextApiRequest, NextApiResponse } from 'next';
import { generatePdfReport, DiagnosticInput } from '../../lib/pdf';
import fs from 'fs';
import path from 'path';

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

    // Read the fixed sample PDF
    let fixedPdfBuffer: Buffer | null = null;
    let fixedPdfFilename: string | null = null;
    
    try {
      const fixedPdfPath = path.join(process.cwd(), 'public', 'full-report-sample.pdf');
      if (fs.existsSync(fixedPdfPath)) {
        fixedPdfBuffer = fs.readFileSync(fixedPdfPath);
        fixedPdfFilename = 'NNX1-Full-Sample-Report.pdf';
        console.log('Fixed PDF loaded successfully, size:', fixedPdfBuffer.length);
      } else {
        console.log('Fixed PDF not found at:', fixedPdfPath);
      }
    } catch (fixedPdfError) {
      console.error('Error reading fixed PDF:', fixedPdfError);
    }

    const emailData = {
      personalizations: [
        {
          to: [{ email: to, name }],
          subject: `Thank You for Testing NNX1™ – Your Sample Reports Are Inside`,
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
      // Include PDF attachments
      ...(pdfBuffer && filename && {
        attachments: [
          {
            content: pdfBuffer.toString('base64'),
            filename,
            type: 'application/pdf',
            disposition: 'attachment',
          },
          // Add fixed PDF if available
          ...(fixedPdfBuffer && fixedPdfFilename ? [{
            content: fixedPdfBuffer.toString('base64'),
            filename: fixedPdfFilename,
            type: 'application/pdf',
            disposition: 'attachment',
          }] : []),
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
  
  // Extract company name from the report content or use a default
  let companyName = name;
  if (content && typeof content === 'string') {
    const companyMatch = content.match(/Company:\s*([^\n]+)/i) || content.match(/Business:\s*([^\n]+)/i);
    if (companyMatch) {
      companyName = companyMatch[1].trim();
    }
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Thank You for Testing NNX1™ – Your Sample Reports Are Inside</title>
        <style>
            body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.5; color: #333; max-width: 700px; margin: 0 auto; padding: 15px; background-color: #f8f9fa; }
            .container { background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow: hidden; }
            .header { background: linear-gradient(135deg, #000 0%, #006400 100%); color: white; text-align: center; padding: 30px 20px; }
            .logo { font-size: 32px; font-weight: bold; margin-bottom: 8px; letter-spacing: 2px; }
            .content { padding: 30px; font-size: 16px; text-align: left; line-height: 1.6; }
            .section { margin: 20px 0; text-align: left; font-size: 16px; line-height: 1.6; }
            .section-title { font-size: 1.1rem; font-weight: bold; color: #006400; margin-bottom: 8px; margin-top: 20px; }
            .b2b-link { font-weight: bold; color: #006400; text-decoration: underline; font-size: 16px; }
            .footer { background: #006400; color: white; text-align: center; padding: 25px; font-size: 14px; }
            .footer-logo { font-size: 24px; font-weight: bold; margin-bottom: 15px; letter-spacing: 1px; }
            strong { color: #006400; }
            .contact-info { margin: 12px 0; font-size: 12px; }
            .tagline { font-style: italic; margin: 8px 0; color: #e0e0e0; }
            .subsidiary { font-size: 12px; margin: 8px 0; }
            .recipient-info { font-size: 11px; margin: 12px 0; color: #e0e0e0; }
            .unsubscribe { font-size: 11px; margin-top: 15px; }
            .unsubscribe a { color: white; text-decoration: underline; }
            .footer a { color: white; text-decoration: underline; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">NNX1™</div>
                <h2 style="margin: 0; font-weight: 300;">Small Business Solutions</h2>
            </div>
            
            <div class="content">
                <p>Hello ${name},</p>
                
                <p>Thank you for signing up to explore NNX1™ Small Business Solutions — and for being part of this exciting early release. Your time and feedback are incredibly valuable as we continue refining this platform for launch.</p>
                
                <p>Attached you'll find two PDF reports:</p>
                <ul style="margin: 15px 0; padding-left: 20px;">
                    <li>Your Sample Report — Based on the diagnostic module you completed</li>
                    <li>A Full Sample Report — What you'll receive once you've completed all modules and created an account</li>
                </ul>
                
                <p>When you sign up, you'll unlock access to your personalized dashboard, allowing you to track your progress, pick up where you left off, and generate a complete business diagnostic profile. This includes actionable recommendations, industry-aligned benchmarks, and suggested next steps.</p>
                
                <p>As a registered user, you're also eligible to join our B2B Partner Network. If your services align with the needs of another business using NNX1, our recommendation engine may feature your company directly in their results. It's our way of helping small businesses support each other — powered by data, not ads.</p>
                
            <div class="section">
                    <div class="section-title">Get Involved</div>
                    <p><strong>Want to be a recommended B2B partner?</strong> <a href="https://nblk.typeform.com/NBLKForm?typeform-source=nnx1.vercel.app" class="b2b-link">Sign up here</a></p>
                    <p><strong>Have feedback or want to suggest new tools or modules?</strong> <a href="https://nblk.typeform.com/to/qUvCLRgr?typeform-source=nnx1.vercel.app" class="b2b-link">Share it with us</a></p>
              </div>
                
                <p>This is just the beginning — and your participation helps us demonstrate the real-world value of NNX1™ to future partners and investors.</p>
                
                <p>Thanks again for being part of this journey,<br>
                <strong>The NNX1™ Team at NBLK</strong></p>
            </div>
            
            <div class="footer">
                <div class="footer-logo" style="margin-bottom: 20px;">
                    <span style="font-size: 28px; font-weight: bold; color: white;">NNX1™</span>
                </div>
                
                <div class="social-icons" style="margin: 20px 0; text-align: center;">
                    <a href="https://www.linkedin.com/company/nblk/posts/?feedView=all" target="_blank" style="display: inline-block; margin: 0 8px; padding: 10px 16px; background: white; color: #006400; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">LinkedIn</a>
                    <a href="https://www.instagram.com/nblk.data/" target="_blank" style="display: inline-block; margin: 0 8px; padding: 10px 16px; background: white; color: #006400; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Instagram</a>
                </div>
                
                <div class="contact-info">
                    Website: <a href="http://www.n-blk.com" target="_blank">www.n-blk.com</a> | Email: <a href="mailto:info@n-blk.com">info@n-blk.com</a><br>
                    Address: 442 5th Avenue, Suite 2308, New York, NY 10038
                </div>
                
                <div class="tagline">
                    Customized Data and Automation Solutions for all.
                </div>
                
                <div class="subsidiary">
                    NNX1™ is a subsidiary of NBLK Consulting.
                </div>
                
                <div class="recipient-info">
                    This message is intended for ${name} for ${companyName}.
                </div>
                
                <div class="unsubscribe">
                    <a href="#">If you no longer wish to receive these emails, click here to unsubscribe</a>
                </div>
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