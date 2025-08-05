import { ChartJSNodeCanvas } from 'chartjs-node-canvas';

export type ChartImageOptions = {
  width?: number;
  height?: number;
  type?: 'bar' | 'line' | 'pie';
  data: any;
  options?: any;
};

const DEFAULT_WIDTH = 600;
const DEFAULT_HEIGHT = 300;

export async function generateChartImage({
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  type = 'bar',
  data,
  options = {},
}: ChartImageOptions): Promise<string> {
  const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });
  const configuration = {
    type,
    data,
    options,
  };
  const buffer = await chartJSNodeCanvas.renderToBuffer(configuration);
  return `data:image/png;base64,${buffer.toString('base64')}`;
} 