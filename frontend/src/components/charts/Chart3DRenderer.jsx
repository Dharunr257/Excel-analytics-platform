// components/charts/Chart3DRenderer.jsx
import Plot from "react-plotly.js";
import PropTypes from "prop-types";
import Plotly from "plotly.js-dist-min";
import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";

// Utility to convert any value into a number
const convertToNumeric = (() => {
  const cache = {};
  return (value, key) => {
    if (value === undefined || value === null || value === "") return NaN;
    const num = parseFloat(value);
    if (!isNaN(num)) return num;
    if (!cache[key]) cache[key] = {};
    if (!(value in cache[key])) {
      cache[key][value] = Object.keys(cache[key]).length;
    }
    return cache[key][value];
  };
})();

// ForwardRef to allow parent (ChartPicker) to download chart
const Chart3DRenderer = forwardRef(({
  chartType = "scatter3d",
  dataRows = [],
  selectedX = "",
  selectedY = "",
  selectedZ = "",
  color = "#3b82f6",
}, ref) => {
  const plotRef = useRef(null);

  const x = [], y = [], z = [];

  dataRows.forEach((row) => {
    const valX = convertToNumeric(row[selectedX], selectedX);
    const valY = convertToNumeric(row[selectedY], selectedY);
    const valZ = convertToNumeric(row[selectedZ], selectedZ);
    if (!isNaN(valX) && !isNaN(valY) && !isNaN(valZ)) {
      x.push(valX);
      y.push(valY);
      z.push(valZ);
    }
  });

  const data = [];

  if (chartType === "scatter3d" || chartType === "line3d") {
    data.push({
      type: "scatter3d",
      mode: chartType === "line3d" ? "lines+markers" : "markers",
      x,
      y,
      z,
      marker: { size: 5, color },
      line: chartType === "line3d" ? { color } : undefined,
    });
  } else if (chartType === "mesh3d") {
    // NOTE: Mesh3D requires triangle indices; here we simulate basic layout
    data.push({
      type: "mesh3d",
      x,
      y,
      z,
      color,
      opacity: 0.6,
      intensity: z,
    });
    // Add points for better visibility
    data.push({
      type: "scatter3d",
      mode: "markers",
      x,
      y,
      z,
      marker: { size: 3, color: "#333" },
    });
  }

  const layout = {
    title: `${chartType.toUpperCase()} - 3D`,
    autosize: true,
    height: 500,
    scene: {
      xaxis: { title: selectedX },
      yaxis: { title: selectedY },
      zaxis: { title: selectedZ },
    },
    margin: { t: 50, l: 0, r: 0, b: 0 },
  };

  // Expose download function to parent
  useImperativeHandle(ref, () => ({
    async downloadImage() {
      if (plotRef.current) {
        const gd = plotRef.current.getPlotly();
        const imageData = await Plotly.toImage(gd, { format: "png", height: 500, width: 800 });
        return imageData;
      }
      return null;
    }
  }));

  return (
    <Plot
      ref={plotRef}
      data={data}
      layout={layout}
      config={{ responsive: true }}
      style={{ width: "100%" }}
    />
  );
});

Chart3DRenderer.displayName = "Chart3DRenderer";

Chart3DRenderer.propTypes = {
  chartType: PropTypes.string,
  dataRows: PropTypes.array.isRequired,
  selectedX: PropTypes.string.isRequired,
  selectedY: PropTypes.string.isRequired,
  selectedZ: PropTypes.string.isRequired,
  color: PropTypes.string,
};

export default Chart3DRenderer;
