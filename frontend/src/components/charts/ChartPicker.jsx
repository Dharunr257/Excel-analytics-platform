import { useState, useRef } from "react";
import Select from "react-select";
import { ChromePicker } from "react-color";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { saveAs } from "file-saver";

import Chart2DRenderer from "./Chart2DRenderer";
import Chart3DRenderer from "./Chart3DRenderer";
import ChartHistogram from "./ChartHistogram";
import ChartMetadata from "./ChartMetadata";
import AISummary from "./AISummary";
import { CHART_TYPES } from "../../constants/chartOptions";

const ChartPicker = ({ dataRows = [], columns = [] }) => {
  const [mode, setMode] = useState("2d");
  const [chartOption, setChartOption] = useState(CHART_TYPES["2d"][0]);
  const [selectedX, setSelectedX] = useState("");
  const [selectedY, setSelectedY] = useState("");
  const [selectedZ, setSelectedZ] = useState("");
  const [color, setColor] = useState("#3b82f6");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const chartRef = useRef(null);

  const chartType = chartOption.value;

  // 🔽 DOWNLOAD PNG
  const handleDownload = async () => {
    try {
      if (
        (mode === "3d" || mode === "distribution") &&
        chartRef.current?.downloadImage
      ) {
        const imageData = await chartRef.current.downloadImage();
        if (imageData) {
          saveAs(imageData, `${chartOption.label}.png`);
        } else {
          alert("Download failed: Could not generate chart image.");
        }
      } else {
        const canvas = chartRef.current?.canvas;
        if (!canvas) {
          alert("No chart available to download.");
          return;
        }
        const blob = await new Promise((res) => canvas.toBlob(res));
        saveAs(blob, `${chartType}.png`);
      }
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  // 📄 EXPORT PDF
  const handlePDF = async () => {
    try {
      let imgData = null;

      if (
        (mode === "3d" || mode === "distribution") &&
        chartRef.current?.downloadImage
      ) {
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

      const pdf = new jsPDF();
      if (imgData) {
        pdf.text(`${chartType.toUpperCase()} Chart Report`, 10, 10);
        pdf.addImage(imgData, "PNG", 10, 20, 180, 100);
      }

      // Metadata
      pdf.setFontSize(11);
      pdf.text(`X Axis: ${selectedX || "N/A"}`, 10, 130);
      pdf.text(`Y Axis: ${selectedY || "N/A"}`, 10, 140);
      if (mode === "3d") pdf.text(`Z Axis: ${selectedZ || "N/A"}`, 10, 150);
      pdf.text(`Total Rows: ${dataRows.length}`, 10, 160);
      pdf.text(`Chart Mode: ${mode.toUpperCase()}`, 10, 170);

      // AI Summary
      pdf.text("AI Summary:", 10, 185);
      pdf.setFontSize(10);
      const aiSummary = AISummary({ rows: dataRows, textOnly: true });
      const lines = pdf.splitTextToSize(aiSummary, 180);
      pdf.text(lines, 10, 193);

      pdf.save(`${chartType}-chart-report.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    }
  };

  const renderChart = () => {
    if (
      !selectedX ||
      (mode !== "distribution" && !selectedY && mode !== "3d")
    ) {
      return (
        <p className="text-center text-gray-400">
          Please select required fields
        </p>
      );
    }

    if (mode === "2d") {
      return (
        <Chart2DRenderer
          chartType={chartType}
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
          ref={chartRef}
          chartType={chartType}
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
          ref={chartRef}
          chartType={chartOption.value}
          dataRows={dataRows}
          selectedX={selectedX}
          selectedY={selectedY}
          color={color}
        />
      );
    }

    return <p>Unsupported mode</p>;
  };

  const renderDropdown = (category) => (
    <Select
      options={CHART_TYPES[category]}
      value={chartOption}
      onChange={(val) => setChartOption(val)}
      getOptionLabel={(e) => (
        <div className="flex items-center gap-2">
          <img src={e.icon} alt={e.label} className="w-5 h-5" />
          <span>{e.label}</span>
        </div>
      )}
      className="w-52"
    />
  );

  return (
    <div className="p-6 space-y-6">
      {/* Chart Controls */}
      <div className="flex flex-wrap justify-center items-center gap-6">
        {/* Mode Selection */}
        <div>
          <label className="block mb-1 text-sm font-medium">
            Chart Category
          </label>
          <select
            className="select select-bordered"
            value={mode}
            onChange={(e) => {
              const newMode = e.target.value;
              setMode(newMode);
              setChartOption(CHART_TYPES[newMode][0]);
              setSelectedX("");
              setSelectedY("");
              setSelectedZ("");
            }}
          >
            <option value="2d">2D</option>
            <option value="3d">3D</option>
            <option value="distribution">Distribution</option>
          </select>
        </div>

        {/* Chart Type */}
        <div>
          <label className="block mb-1 text-sm font-medium">Chart Type</label>
          {renderDropdown(mode)}
        </div>

        {/* Color Picker */}
        <div>
          <label className="block mb-1 text-sm font-medium">Color</label>
          <div className="relative">
            <div
              className="w-10 h-10 rounded-full border cursor-pointer"
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
      <div className="flex justify-center gap-6">
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

        {(mode !== "distribution" ||
          chartType === "box" ||
          chartType === "violin") && (
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

      {/* Chart Display */}
      <div id="chart-container" className="p-4 bg-white rounded shadow">
        {renderChart()}
      </div>

      {/* Metadata + Actions */}
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

      {/* AI Summary */}
      <div className="mt-6 p-4 border rounded bg-gray-50">
        <h2 className="text-lg font-semibold mb-2">🤖 AI Summary</h2>
        <AISummary rows={dataRows} />
      </div>
    </div>
  );
};

export default ChartPicker;
