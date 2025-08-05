export function calculateYesNoPercentages(toolResponses: { answers: string[] }[]): { yes: number, no: number }[] {
  if (!toolResponses.length) return Array(10).fill({ yes: 0, no: 0 });
  const total = toolResponses.length;
  const questionCount = toolResponses[0].answers.length;
  const arr = Array.from({ length: questionCount }).map((_, i) => {
    const yesCount = toolResponses.filter(r => r.answers[i] === 'Yes').length;
    const yesPct = Math.round((yesCount / total) * 10000) / 100;
    const noPct = Math.round(((total - yesCount) / total) * 10000) / 100;
    return { yes: yesPct, no: noPct };
  });
  return arr.concat(Array(10).fill({ yes: 0, no: 0 })).slice(0, 10);
} 