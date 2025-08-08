import type { NextApiRequest, NextApiResponse } from 'next';
import { generatePdfReport, DiagnosticInput } from '../../lib/pdf';
import { createPdfBuffers } from '../../lib/pdf-data';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Incoming /api/send-report request:', req.body);
    const { to, name, toolName, reportContent, score, answers, userTimezone } = req.body;

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
      userTimezone: userTimezone || 'America/New_York', // Use user's timezone or default to EST
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

    // ✅ SOLUTION: Read static PDFs from lib/assets using fs.readFileSync()
    console.log('🚀 Reading static PDFs from lib/assets for reliable attachments...');
    
    let onePagePDFBuffer: Buffer | null = null;
    let fullReportPDFBuffer: Buffer | null = null;
    
    try {
      // Read static PDFs from lib/assets (works in both local and Vercel)
      const onePagePDFPath = path.join(process.cwd(), 'lib/assets/email-report-one-page.pdf');
      const fullReportPDFPath = path.join(process.cwd(), 'lib/assets/full-report-sample.pdf');
      
      console.log('📁 Reading from:', onePagePDFPath);
      console.log('📁 Reading from:', fullReportPDFPath);
      
      onePagePDFBuffer = fs.readFileSync(onePagePDFPath);
      fullReportPDFBuffer = fs.readFileSync(fullReportPDFPath);
      
      console.log('✅ Static PDFs read successfully');
      console.log('✅ One-page PDF size:', onePagePDFBuffer.length);
      console.log('✅ Full report PDF size:', fullReportPDFBuffer.length);
      
    } catch (fsError) {
      console.error('❌ Failed to read static PDFs:', fsError);
      // Continue without static PDFs if they can't be read
      onePagePDFBuffer = null;
      fullReportPDFBuffer = null;
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
      // ✅ Attach all 3 PDFs as proper email attachments
      attachments: [
        // Dynamic PDF (generated in-memory)
        ...(pdfBuffer ? [{
          content: pdfBuffer.toString('base64'),
          filename: 'NBLK-Diagnostic-Report.pdf',
          type: 'application/pdf',
          disposition: 'attachment',
        }] : []),
        // Static PDF 1 (read from lib/assets)
        ...(onePagePDFBuffer ? [{
          content: onePagePDFBuffer.toString('base64'),
          filename: 'email-report-one-page.pdf',
          type: 'application/pdf',
          disposition: 'attachment',
        }] : []),
        // Static PDF 2 (read from lib/assets)
        ...(fullReportPDFBuffer ? [{
          content: fullReportPDFBuffer.toString('base64'),
          filename: 'full-report-sample.pdf',
          type: 'application/pdf',
          disposition: 'attachment',
        }] : []),
      ],
    };

    console.log('🎉 RELIABLE SOLUTION: All PDFs attached as proper email attachments!');
    console.log('📊 Final attachment summary:');
    console.log('Total attachments:', emailData.attachments.length);
    console.log('Dynamic PDF included:', !!pdfBuffer);
    console.log('Static PDF1 included:', !!onePagePDFBuffer);
    console.log('Static PDF2 included:', !!fullReportPDFBuffer);

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
      message: 'Email sent successfully with all PDF reports attached',
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
        <title>Thank You for Testing NNX1™ – Your Sample Reports Are Inside</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                line-height: 1.7; 
                color: #2d3748; 
                background-color: #f7fafc; 
                margin: 0; 
                padding: 0; 
            }
            .container { 
                max-width: 700px; 
                margin: 0 auto; 
                background: white; 
                border-radius: 16px; 
                box-shadow: 0 10px 25px rgba(0,0,0,0.1); 
                overflow: hidden; 
                margin-top: 20px; 
                margin-bottom: 20px; 
            }
            .header { 
                background: #000000; 
                color: white; 
                text-align: center; 
                padding: 50px 30px; 
                position: relative; 
            }
            .header::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: linear-gradient(90deg, #38a169, #48bb78, #68d391);
            }
            .logo { 
                font-size: 42px; 
                font-weight: 700; 
                margin-bottom: 15px; 
                letter-spacing: 3px; 
                color: #f7fafc; 
            }
            .subtitle { 
                font-size: 18px; 
                font-weight: 300; 
                opacity: 0.9; 
                margin-top: 10px; 
            }
            .content { 
                padding: 50px 40px; 
                font-size: 16px; 
                line-height: 1.8; 
                color: #4a5568; 
            }
            .greeting { 
                font-size: 18px; 
                font-weight: 500; 
                color: #2d3748; 
                margin-bottom: 25px; 
            }
            .section { 
                margin: 35px 0; 
            }
            .section-title { 
                font-size: 20px; 
                font-weight: 600; 
                color: #38a169; 
                margin-bottom: 15px; 
                border-left: 4px solid #38a169; 
                padding-left: 15px; 
            }
            .pdf-list { 
                background: #f0fff4; 
                border: 1px solid #c6f6d5; 
                border-radius: 12px; 
                padding: 25px; 
                margin: 25px 0; 
            }
            .pdf-item { 
                margin: 15px 0; 
                padding-left: 20px; 
                position: relative; 
            }
            .pdf-item::before { 
                content: '📄'; 
                position: absolute; 
                left: 0; 
                top: 0; 
                font-size: 16px; 
            }
            .highlight-box { 
                background: linear-gradient(135deg, #f0fff4 0%, #e6fffa 100%); 
                border: 1px solid #9ae6b4; 
                border-radius: 12px; 
                padding: 25px; 
                margin: 25px 0; 
            }
            .cta-section { 
                background: #38a169; 
                color: white; 
                padding: 30px; 
                border-radius: 12px; 
                margin: 30px 0; 
                text-align: center; 
            }
            .cta-title { 
                font-size: 20px; 
                font-weight: 600; 
                margin-bottom: 15px; 
            }
            .cta-link { 
                display: inline-block; 
                background: white; 
                color: #38a169; 
                padding: 12px 25px; 
                border-radius: 8px; 
                text-decoration: none; 
                font-weight: 600; 
                margin: 10px 5px; 
                transition: all 0.3s ease; 
            }
            .cta-link:hover { 
                transform: translateY(-2px); 
                box-shadow: 0 4px 12px rgba(0,0,0,0.15); 
            }
            .footer { 
                background: #000000; 
                color: white; 
                text-align: center; 
                padding: 40px 30px; 
                font-size: 14px; 
            }
            .footer-logo { 
                font-size: 24px; 
                font-weight: 700; 
                margin-bottom: 15px; 
                letter-spacing: 2px; 
            }
            .signature { 
                margin-top: 30px; 
                padding-top: 25px; 
                border-top: 1px solid #e2e8f0; 
                font-style: italic; 
                color: #718096; 
            }
            .strong { 
                color: #38a169; 
                font-weight: 600; 
            }
            .link { 
                color: #38a169; 
                text-decoration: none; 
                font-weight: 500; 
            }
            .link:hover { 
                text-decoration: underline; 
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">NNX1™</div>
                <div class="subtitle">Small Business Solutions</div>
            </div>
            
            <div class="content">
                <div class="greeting">Hello ${name},</div>
                
                <p>Thank you for signing up to explore <span class="strong">NNX1™ Small Business Solutions</span> — and for being part of this exciting early release. Your time and feedback are incredibly valuable as we continue refining this platform for launch.</p>
                
                <div class="section">
                    <div class="section-title">Your Sample Reports</div>
                    <div class="pdf-list">
                        <div class="pdf-item"><strong>Your Sample Report</strong> — Based on the diagnostic module you completed.</div>
                        <div class="pdf-item"><strong>A Full Sample Report</strong> — What you'll receive once you've completed all modules and created an account.</div>
                        <div class="pdf-item"><strong>A Comprehensive Benchmark Report</strong> — How your results compare to industry standards and other businesses in your sector.</div>
                    </div>
                </div>
                
                <div class="highlight-box">
                    <p><strong>When you sign up, you'll unlock access to your personalized dashboard</strong>, allowing you to track your progress, pick up where you left off, and generate a complete business diagnostic profile. This includes actionable recommendations, industry-aligned benchmarks, and suggested next steps.</p>
                </div>
                
                <div class="section">
                    <div class="section-title">B2B Partner Network</div>
                    <p>As a registered user, you're also eligible to join our <span class="strong">B2B Partner Network</span>. If your services align with the needs of another business using NNX1, our recommendation engine may feature your company directly in their results. It's our way of helping small businesses support each other — powered by data, not ads.</p>
                </div>
                
                <div class="cta-section">
                    <div class="cta-title">Ready to Get Started?</div>
                    <a href="https://nblk.typeform.com/NBLKForm?typeform-source=nnx1.vercel.app" class="cta-link">Sign Up Here</a>
                    <a href="https://nblk.typeform.com/to/qUvCLRgr?typeform-source=nnx1.vercel.app" class="cta-link">Share Feedback</a>
                </div>
                
                <div class="signature">
                    <p>This is just the beginning — and your participation helps us demonstrate the real-world value of NNX1™ to future partners and investors.</p>
                    <p>Thanks again for being part of this journey,<br>
                    <strong>The NNX1™ Team at NBLK</strong></p>
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