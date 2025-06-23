import PropTypes from "prop-types";
import { Bar } from "react-chartjs-2";
import Plot from "react-plotly.js";
import { forwardRef, useImperativeHandle, useRef } from "react";
import Plotly from "plotly.js-dist-min";

const ChartHistogram = forwardRef(
  ({ chartType, dataRows, selectedX, selectedY, color }, ref) => {
    const isBox = chartType === "box";
    const isViolin = chartType === "violin";
    const isHistogram = chartType === "histogram";

    const chartContainerRef = useRef(null);

    // Handle PNG download for plotly
    useImperativeHandle(ref, () => ({
      async downloadImage() {
        if (isBox || isViolin) {
          const gd = chartContainerRef.current?.el;
          if (!gd) return null;
          const img = await Plotly.toImage(gd, {
            format: "png",
            height: 500,
            width: 800,
          });
          return img;
        }

        return null; // Chart.js handled in ChartPicker
      },
    }));

    if (
      dataRows.length === 0 ||
      !selectedX ||
      ((isBox || isViolin) && !selectedY)
    ) {
      return (
        <p className="text-red-500 text-center py-4">
          Please select required fields for {chartType}.
        </p>
      );
    }

    if (isHistogram) {
      const values = dataRows
        .map((row) => Number(row[selectedX]))
        .filter((v) => !isNaN(v));

      const chartData = {
        labels: values.map((_, idx) => `#${idx + 1}`),
        datasets: [
          {
            label: `Histogram of ${selectedX}`,
            data: values,
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
          x: { title: { display: true, text: "Entries" } },
          y: { title: { display: true, text: selectedX } },
        },
      };

      return (
        <div className="bg-white p-4 rounded shadow w-full">
          <Bar data={chartData} options={options} />
        </div>
      );
    }

    // Plotly: Box & Violin
    const xValues = dataRows.map((row) => row[selectedX]);
    const yValues = dataRows
      .map((row) => Number(row[selectedY]))
      .filter((v) => !isNaN(v));

    const plotData = [
      {
        type: chartType,
        x: xValues,
        y: yValues,
        boxpoints: "all",
        jitter: 0.5,
        pointpos: 0,
        marker: { color: color || "#3b82f6" },
        name: `${selectedY} by ${selectedX}`,
      },
    ];

    const layout = {
      title: `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Plot`,
      margin: { t: 40 },
      xaxis: { title: { text: selectedX || "X" } },
      yaxis: { title: { text: selectedY || "Y" } },
      height: 400,
    };

    return (
      <div className="bg-white p-4 rounded shadow w-full">
        <Plot
          ref={chartContainerRef}
          data={plotData}
          layout={layout}
          config={{ responsive: true }}
          className="w-full h-full"
          useResizeHandler
        />
      </div>
    );
  }
);

ChartHistogram.displayName = "ChartHistogram";

ChartHistogram.propTypes = {
  chartType: PropTypes.oneOf(["histogram", "box", "violin"]).isRequired,
  dataRows: PropTypes.array.isRequired,
  selectedX: PropTypes.string,
  selectedY: PropTypes.string,
  color: PropTypes.string,
};

export default ChartHistogram;
