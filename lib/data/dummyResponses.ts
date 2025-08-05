export const dummyData = {
  "Marketing Effectiveness Diagnostic": Array.from({ length: 20 }).map((_, i) => ({
    respondentId: i + 1,
    answers: Array.from({ length: 10 }).map(() => (Math.random() > 0.4 ? 'Yes' : 'No'))
  })),
  "Cash Flow & Financial Clarity Diagnostic": Array.from({ length: 20 }).map((_, i) => ({
    respondentId: i + 1,
    answers: Array.from({ length: 10 }).map(() => (Math.random() > 0.5 ? 'Yes' : 'No'))
  })),
  "Data Hygiene & Business Clarity Diagnostic": Array.from({ length: 20 }).map((_, i) => ({
    respondentId: i + 1,
    answers: Array.from({ length: 10 }).map(() => (Math.random() > 0.6 ? 'Yes' : 'No'))
  }))
}; 