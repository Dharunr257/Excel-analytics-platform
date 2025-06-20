import {
  Bar,
  Line,
  Pie,
  Doughnut,
  Radar,
  PolarArea,
  Scatter,
} from "react-chartjs-2";

import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  LineElement,
  RadialLinearScale,
  CategoryScale,
  LinearScale,
  PointElement,
} from "chart.js";

import PropTypes from "prop-types";
import { getDynamicColors } from "../../utils/colorUtils";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  ArcElement,
  RadialLinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const CHART_MAP = {
  bar: Bar,
  line: Line,
  pie: Pie,
  doughnut: Doughnut,
  radar: Radar,
  polarArea: PolarArea,
  scatter: Scatter,
};

const Chart2DRenderer = ({
  chartType,
  dataRows,
  selectedX,
  selectedY,
  color,
  chartRef,
}) => {
  if (!selectedX || !selectedY || dataRows.length === 0) return null;

  const ChartComponent = CHART_MAP[chartType];

  if (!ChartComponent)
    return <p className="text-red-500">Chart type not supported.</p>;

  const multiColorTypes = ["pie", "doughnut", "polarArea"];
  const isScatter = chartType === "scatter";

  const labels = dataRows.map((row) => row[selectedX]);

  const scatterDataPoints = dataRows.map((row) => ({
    x: parseFloat(row[selectedX]) || 0,
    y: parseFloat(row[selectedY]) || 0,
  }));

  const values = dataRows.map((row) => parseFloat(row[selectedY]) || 0);

  const dataset = isScatter
    ? [
        {
          label: `${selectedY} vs ${selectedX}`,
          data: scatterDataPoints,
          backgroundColor: color,
          pointRadius: 5,
        },
      ]
    : [
        {
          label: `${selectedY} vs ${selectedX}`,
          data: values,
          backgroundColor: multiColorTypes.includes(chartType)
            ? getDynamicColors(dataRows.length)
            : color,
          borderColor: color,
          borderWidth: 1,
        },
      ];

  const chartData = {
    labels: isScatter ? undefined : labels,
    datasets: dataset,
  };

  const options = {
    responsive: true,
    scales: isScatter
      ? {
          x: {
            title: {
              display: true,
              text: selectedX,
            },
          },
          y: {
            title: {
              display: true,
              text: selectedY,
            },
          },
        }
      : {},
  };

  return (
    <div className="bg-white p-4 rounded shadow w-full">
      <ChartComponent ref={chartRef} data={chartData} options={options} />
    </div>
  );
};

Chart2DRenderer.propTypes = {
  chartType: PropTypes.string.isRequired,
  dataRows: PropTypes.array.isRequired,
  selectedX: PropTypes.string.isRequired,
  selectedY: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  chartRef: PropTypes.object,
};

export default Chart2DRenderer;
