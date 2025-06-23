// components/charts/ChartHistogram.jsx
import PropTypes from "prop-types";
import { Bar } from "react-chartjs-2";
import Plot from "react-plotly.js";

const ChartHistogram = ({ chartType, dataRows, selectedX, selectedY, color }) => {
  const isBox = chartType === "box";
  const isViolin = chartType === "violin";
  const isHistogram = chartType === "histogram";

  // Validate selection
  if (dataRows.length === 0 || !selectedX || (isBox || isViolin) && !selectedY) {
    return (
      <p className="text-gray-500 text-center">
        Please select required fields for the selected chart type.
      </p>
    );
  }

  // Histogram using Chart.js
  if (isHistogram) {
    const labels = dataRows.map((row) => row[selectedX]);
    const dataset = dataRows.map((row) => Number(row[selectedX]) || 0);

    const chartData = {
      labels,
      datasets: [
        {
          label: `Histogram of ${selectedX}`,
          data: dataset,
          backgroundColor: color || "#3b82f6",
        },
      ],
    };

    const options = {
      responsive: true,
      plugins: {
        legend: { display: true },
      },
      scales: {
        x: { title: { display: true, text: selectedX } },
        y: { title: { display: true, text: "Frequency" } },
      },
    };

    return (
      <div className="bg-white p-4 rounded shadow w-full">
        <Bar data={chartData} options={options} />
      </div>
    );
  }

  // Box/Violin using Plotly
  const xData = selectedX ? dataRows.map((row) => row[selectedX]) : [];
  const yData = selectedY ? dataRows.map((row) => Number(row[selectedY]) || 0) : [];

  const plotData = [
    {
      type: chartType,
      x: xData,
      y: yData,
      name: `${selectedY} vs ${selectedX}`,
      boxpoints: "all",
      jitter: 0.5,
      pointpos: 0,
      marker: { color: color || "#3b82f6" },
    },
  ];

  const layout = {
    title: `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Plot`,
    margin: { t: 40 },
    xaxis: { title: { text: selectedX || "X" } },
    yaxis: { title: { text: selectedY || "Y" } },
    height: 400,
    responsive: true,
  };

  return (
    <div className="bg-white p-4 rounded shadow w-full">
      <Plot data={plotData} layout={layout} useResizeHandler className="w-full h-full" />
    </div>
  );
};

ChartHistogram.propTypes = {
  chartType: PropTypes.string.isRequired,
  dataRows: PropTypes.array.isRequired,
  selectedX: PropTypes.string,
  selectedY: PropTypes.string,
  color: PropTypes.string,
};

export default ChartHistogram;
