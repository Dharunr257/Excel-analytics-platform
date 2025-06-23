// components/charts/Chart3DRenderer.jsx
import Plot from "react-plotly.js";
import PropTypes from "prop-types";
import Plotly from "plotly.js-dist-min";
import { forwardRef, useRef, useImperativeHandle } from "react";

// Convert categorical to numeric if needed
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

const Chart3DRenderer = forwardRef(
  ({ chartType = "scatter3d", dataRows = [], selectedX, selectedY, selectedZ, color = "#3b82f6" }, ref) => {
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
      data.push({
        type: "mesh3d",
        x,
        y,
        z,
        color,
        opacity: 0.6,
        intensity: z,
      });
      // Add scatter markers for visibility
      data.push({
        type: "scatter3d",
        mode: "markers",
        x,
        y,
        z,
        marker: { size: 3, color: "#444" },
      });
    }

    const layout = {
      title: `${chartType.toUpperCase()} - 3D Chart`,
      autosize: true,
      height: 500,
      margin: { t: 50, l: 0, r: 0, b: 0 },
      scene: {
        xaxis: { title: selectedX },
        yaxis: { title: selectedY },
        zaxis: { title: selectedZ },
      },
    };

    // ✅ Expose download method to parent
    useImperativeHandle(ref, () => ({
      async downloadImage() {
        try {
          const domNode = plotRef.current?.el;
          if (!domNode) return null;

          const imageData = await Plotly.toImage(domNode, {
            format: "png",
            width: 900,
            height: 600,
          });
          return imageData;
        } catch (error) {
          console.error("3D chart download failed:", error);
          return null;
        }
      },
    }));

    if (x.length === 0 || y.length === 0 || z.length === 0) {
      return (
        <p className="text-center text-red-500 py-4">
          No valid 3D data to display.
        </p>
      );
    }

    return (
      <Plot
        ref={plotRef}
        data={data}
        layout={layout}
        config={{ responsive: true, displaylogo: false }}
        style={{ width: "100%" }}
      />
    );
  }
);

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
