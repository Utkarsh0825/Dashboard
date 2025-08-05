import ejs from 'ejs';
import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs/promises';
import OpenAI from 'openai';
import { dummyData } from './data/dummyResponses';
import { calculateYesNoPercentages } from './data/getAnswerStats';
import chromium from '@sparticuz/chromium';

export interface DiagnosticInput {
  companyName?: string;
  userScore: number;
  answers: { question: string; short: string; answer: string }[];
  toolName?: string;
}

export async function generatePdfReport(input: DiagnosticInput): Promise<Buffer> {
  try {
    const now = new Date();
    const date = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const toolName = input.toolName || 'NBLK Diagnostic';
    const userAnswers = input.answers.map(a => a.answer === 'Yes' ? 100 : 0); // Yes=100, No=0 for bar chart
    const userName = input.companyName || '';
    // Always 10 question labels
    const questionLabels = Array.from({ length: 10 }).map((_, i) => `Q${i + 1}`);
    // Type-safe access for dummyData
    const knownTools = [
      'Marketing Effectiveness Diagnostic',
      'Cash Flow & Financial Clarity Diagnostic',
      'Data Hygiene & Business Clarity Diagnostic'
    ] as const;
    type ToolName = typeof knownTools[number];
    const safeToolName: ToolName = knownTools.includes(toolName as ToolName)
      ? (toolName as ToolName)
      : 'Marketing Effectiveness Diagnostic';
    const dummyResponses = dummyData[safeToolName];
    const yesNoPercents = calculateYesNoPercentages(dummyResponses);
    const yesPercents = yesNoPercents.map(q => q.yes).concat(Array(10).fill(0)).slice(0, 10);
    const noPercents = yesNoPercents.map(q => q.no).concat(Array(10).fill(0)).slice(0, 10);
    // Summary based on tool
    const toolSummary: Record<ToolName, string> = {
      'Marketing Effectiveness Diagnostic': 'This is an early-stage assessment based on one module, Marketing Effectiveness. Completing all modules and adding business info in your profile will improve accuracy and refine recommendations.',
      'Cash Flow & Financial Clarity Diagnostic': 'This is an early-stage assessment based on one module, Cash Flow & Financial Clarity. Completing all modules and adding business info in your profile will improve accuracy and refine recommendations.',
      'Data Hygiene & Business Clarity Diagnostic': 'This is an early-stage assessment based on one module, Data Hygiene & Business Clarity. Completing all modules and adding business info in your profile will improve accuracy and refine recommendations.'
    };
    const summary = toolSummary[safeToolName];

    // Pie chart: [You, Business 1, Business 2, Business 3]
    const compScores = [
      Math.round(60 + Math.random() * 30),
      Math.round(50 + Math.random() * 40),
      Math.round(40 + Math.random() * 50)
    ];
    const pieScores = [input.userScore, ...compScores];

    // Chart insight note
    let chartInsight = '';
    const userYesPct = userAnswers.filter(v => v === 100).length / userAnswers.length * 100;
    const avgYesPct = yesPercents.reduce((a, b) => a + b, 0) / yesPercents.length;
    if (userYesPct === 100) {
      chartInsight = "You're ahead of the pack in clarity — well done!";
    } else if (userYesPct === 0) {
      chartInsight = "Great opportunity to improve — see recommendations below.";
    } else if (userYesPct > avgYesPct + 20) {
      chartInsight = "You're ahead of others in several areas.";
    } else if (userYesPct < avgYesPct - 20) {
      chartInsight = "You have more opportunities for improvement than most — see below.";
    }

    // Timeline content
    const timeline = {
      immediate: 'Review diagnostic report with leadership team. Prioritize top 3 recommendations. Assign team members as owners.',
      shortTerm: 'Create detailed implementation plans for priority areas. Begin implementing quick wins. Set up weekly progress check-ins.',
      longTerm: 'Establish quarterly business diagnostic reviews. Scale successful improvements. Consider engaging consultants for complex implementations.'
    };

    // Strategic Recommendations (OpenAI)
    let recommendations: string[] = [
      'Standardize your data entry process across all platforms.',
      'Implement regular data audits to ensure accuracy.',
      'Automate reporting to reduce manual errors.'
    ];
    if (process.env.OPENAI_API_KEY) {
      try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const prompt = `You are a business consultant. Based on the user’s answers to the diagnostic questions, write 3 direct, actionable, and context-aware business improvement recommendations. Do not reference question numbers or specific questions. Write as if you are advising a real client. Limit your total response to 600 characters (about 100 words) so it fits in a small space.`;
        const resp = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 200,
          temperature: 0.7,
        });
        const recText = resp.choices[0]?.message?.content || '';
        const aiRecs = recText.split(/\n|\d+\./).map(s => s.trim()).filter(s => s.length > 10).slice(0, 3);
        if (aiRecs.length) recommendations = aiRecs;
      } catch (e) { /* fallback to defaults */ }
    }

    // Render EJS
    const templatePath = path.join(process.cwd(), 'lib', 'pdf-template.ejs');
    const template = await fs.readFile(templatePath, 'utf8');
    const html = ejs.render(template, {
      toolName,
      date,
      time,
      userName,
      summary,
      questionLabels,
      yesPercents,
      noPercents,
      pieScores,
      timeline,
      recommendations,
      chartInsight,
    });

    // Puppeteer PDF
    const isProd = process.env.AWS_LAMBDA_FUNCTION_VERSION || process.env.VERCEL;
    const browser = await puppeteer.launch(
      isProd
        ? {
            args: chromium.args,
            executablePath: await chromium.executablePath(),
            headless: true,
          }
        : {
            headless: true,
          }
    );
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 900 });
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.waitForFunction(() => {
      const canvases = document.querySelectorAll('canvas');
      return canvases.length > 0 && Array.from(canvases).every(c => c.offsetHeight > 0);
    }, { timeout: 5000 });
    await new Promise(resolve => setTimeout(resolve, 4000));
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' },
      preferCSSPageSize: true,
    });
    await browser.close();
    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error(`PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper function to generate sync status based on user answers
function generateSyncStatus(answers: Record<string, string | boolean>) {
  const baseStatus = [
    {
      tool: 'HubSpot CRM',
      status: 'Auto',
      frequency: 'Daily',
      comments: 'Fully reliable'
    },
    {
      tool: 'Google Sheets',
      status: 'Manual',
      frequency: 'Weekly',
      comments: 'Potential lag in updates'
    },
    {
      tool: 'Notion / Airtable',
      status: 'None',
      frequency: 'N/A',
      comments: 'Disconnected data islands'
    },
    {
      tool: 'Analytics Platform',
      status: 'Delayed',
      frequency: 'Monthly',
      comments: 'Lacks real-time sync'
    }
  ];

  // Modify based on user answers if available
  // This can be expanded based on your specific diagnostic questions
  return baseStatus;
} 