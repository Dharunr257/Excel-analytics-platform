import { useState, useRef } from "react";
import Select from "react-select";
import { ChromePicker } from "react-color";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { saveAs } from "file-saver";

import Chart2DRenderer from "./Chart2DRenderer.jsx";
import Chart3DRenderer from "./Chart3DRenderer.jsx";
import ChartHistogram from "./ChartHistogram.jsx";
import ChartMetadata from "./ChartMetadata.jsx";
import AISummary from "./AISummary.jsx";
import { CHART_TYPES } from "../../constants/chartOptions.js";

const ChartPicker = ({ dataRows = [], columns = [] }) => {
  const [mode, setMode] = useState("2d");
  const [chartOption, setChartOption] = useState(CHART_TYPES["2d"][0]);
  const [selectedX, setSelectedX] = useState("");
  const [selectedY, setSelectedY] = useState("");
  const [selectedZ, setSelectedZ] = useState("");
  const [color, setColor] = useState("#3b82f6");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const chartRef = useRef(null);

  const handleDownload = async () => {
    try {
      if (mode === "3d" && chartRef.current?.downloadImage) {
        const img = await chartRef.current.downloadImage();
        if (img) {
          saveAs(img, `${chartOption.value}-chart.png`);
        } else {
          alert("Failed to capture 3D chart.");
        }
      } else {
        const canvas = chartRef.current?.canvas;
        if (!canvas) {
          alert("No chart available to download.");
          return;
        }

        const blob = await new Promise((res) => canvas.toBlob(res));
        saveAs(blob, `${chartOption.value}-chart.png`);
      }
    } catch (err) {
      console.error("Download failed:", err);
      alert("Error downloading chart. Check console for details.");
    }
  };

  const handlePDF = async () => {
    try {
      let imgData = null;

      if (mode === "3d" && chartRef.current?.downloadImage) {
        imgData = await chartRef.current.downloadImage();
      } else {
        const container = document.getElementById("chart-container");
        const canvas = await html2canvas(container, {
          useCORS: true,
          backgroundColor: "#fff",
          scale: 2,
          willReadFrequently: true,
        });
        imgData = canvas.toDataURL("image/png");
      }

      if (imgData) {
        const pdf = new jsPDF();
        pdf.addImage(imgData, "PNG", 10, 10, 180, 100);
        pdf.save(`${chartOption.value}-chart.pdf`);
      } else {
        alert("Could not generate PDF.");
      }
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Error exporting PDF.");
    }
  };

  const renderChart = () => {
    if (
      !selectedX ||
      (mode === "2d" && !selectedY) ||
      (mode === "3d" && (!selectedY || !selectedZ))
    ) {
      return (
        <p className="text-gray-400 text-center mt-10">
          Please select required axis fields.
        </p>
      );
    }

    if (mode === "2d") {
      return (
        <Chart2DRenderer
          chartType={chartOption.value}
          dataRows={dataRows}
          selectedX={selectedX}
          selectedY={selectedY}
          color={color}
          chartRef={chartRef}
        />
      );
    }

    if (mode === "3d") {
      return (
        <Chart3DRenderer
          chartType={chartOption.value}
          dataRows={dataRows}
          selectedX={selectedX}
          selectedY={selectedY}
          selectedZ={selectedZ}
          color={color}
        />
      );
    }

    if (mode === "distribution") {
      return (
        <ChartHistogram
          chartType={chartOption.value}
          dataRows={dataRows}
          selectedX={selectedX}
          selectedY={selectedY}
          color={color}
        />
      );
    }

    return (
      <p className="text-gray-400 text-center">
        Unsupported chart type selected.
      </p>
    );
  };

  const renderDropdown = (category) => (
    <Select
      options={CHART_TYPES[category]}
      value={chartOption}
      onChange={(val) => setChartOption(val)}
      getOptionLabel={(e) => (
        <div className="flex items-center gap-2">
          <img src={e.icon} alt={e.label} className="h-5 w-5" />
          <span>{e.label}</span>
        </div>
      )}
      getOptionValue={(e) => e.value}
      className="w-52"
    />
  );

  return (
    <div className="p-6 space-y-6">
      {/* Top Controls */}
      <div className="flex flex-wrap justify-center gap-6">
        {/* Chart Group */}
        <div>
          <label className="block mb-1 font-semibold text-sm">
            Chart Group
          </label>
          <select
            value={mode}
            onChange={(e) => {
              setMode(e.target.value);
              setChartOption(CHART_TYPES[e.target.value][0]);
              setSelectedX("");
              setSelectedY("");
              setSelectedZ("");
            }}
            className="select select-bordered"
          >
            <option value="2d">2D</option>
            <option value="3d">3D</option>
            <option value="distribution">Distribution</option>
          </select>
        </div>

        {/* Chart Type Dropdown */}
        <div>
          <label className="block mb-1 font-semibold text-sm">Chart Type</label>
          {renderDropdown(mode)}
        </div>

        {/* Color Picker */}
        <div>
          <label className="block mb-1 font-semibold text-sm">Color</label>
          <div className="relative">
            <div
              className="h-10 w-10 rounded-full border cursor-pointer"
              style={{ backgroundColor: color }}
              onClick={() => setShowColorPicker(!showColorPicker)}
            />
            {showColorPicker && (
              <div className="absolute z-10">
                <ChromePicker
                  color={color}
                  onChangeComplete={(c) => setColor(c.hex)}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Axis Selectors */}
      <div className="flex flex-wrap justify-center gap-6">
        <div>
          <label className="block mb-1 text-sm">X Axis</label>
          <select
            value={selectedX}
            onChange={(e) => setSelectedX(e.target.value)}
            className="select select-bordered"
          >
            <option value="">Select X</option>
            {columns.map((col) => (
              <option key={col}>{col}</option>
            ))}
          </select>
        </div>

        {(mode === "2d" ||
          mode === "3d" ||
          chartOption.value === "box" ||
          chartOption.value === "violin") && (
          <div>
            <label className="block mb-1 text-sm">Y Axis</label>
            <select
              value={selectedY}
              onChange={(e) => setSelectedY(e.target.value)}
              className="select select-bordered"
            >
              <option value="">Select Y</option>
              {columns.map((col) => (
                <option key={col}>{col}</option>
              ))}
            </select>
          </div>
        )}

        {mode === "3d" && (
          <div>
            <label className="block mb-1 text-sm">Z Axis</label>
            <select
              value={selectedZ}
              onChange={(e) => setSelectedZ(e.target.value)}
              className="select select-bordered"
            >
              <option value="">Select Z</option>
              {columns.map((col) => (
                <option key={col}>{col}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Chart Output */}
      <div id="chart-container" className="p-6 rounded bg-white shadow">
        {renderChart()}
      </div>

      {/* Metadata & Actions */}
      <div className="flex flex-wrap justify-evenly items-center gap-6 mt-4">
        <ChartMetadata dataRows={dataRows} />
        <div className="flex gap-4">
          <button
            onClick={handleDownload}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded shadow"
          >
            📥 Download PNG
          </button>
          <button
            onClick={handlePDF}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded shadow"
          >
            🧾 Export PDF
          </button>
        </div>
      </div>

      {/* AI Summary Section */}
      <div className="mt-6 p-4 border rounded bg-gray-50">
        <h2 className="text-lg font-semibold mb-2">🤖 AI Summary</h2>
        <AISummary rows={dataRows} />
      </div>
    </div>
  );
};

export default ChartPicker;
