// components/charts/ChartOptions.jsx
import { useState } from "react";
import { ChromePicker } from "react-color";

const CHART_CATEGORIES = {
  "2D": ["bar", "line", "pie", "doughnut", "radar", "polarArea", "scatter"],
  "3D": ["3dscatter", "3dsurface"],
  "Distribution": ["histogram"]
};

<img
  src={`/frontend/icons/${chart.icon}`}
  alt={chart.label}
  className="w-4 h-4 mr-2 inline"
/>

const CHART_LABELS = {
  bar: "Bar",
  line: "Line",
  pie: "Pie",
  doughnut: "Doughnut",
  radar: "Radar",
  polarArea: "Polar Area",
  scatter: "Scatter",
  histogram: "Histogram",
  "3dscatter": "3D Scatter",
  "3dsurface": "3D Surface"
};

const ChartOptions = ({
  selectedX,
  setSelectedX,
  selectedY,
  setSelectedY,
  selectedZ,
  setSelectedZ,
  chartType,
  setChartType,
  color,
  setColor,
  columns,
}) => {
  const [category, setCategory] = useState("");
  const [showColorPicker, setShowColorPicker] = useState(false);

  const filteredCharts = CHART_CATEGORIES[category] || [];

  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    setCategory(selectedCategory);
    setChartType(""); // Reset chart type
    setSelectedX("");
    setSelectedY("");
    setSelectedZ("");
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="text-lg font-semibold mb-4">Chart Options</h3>

      {/* Chart Category */}
      <div className="mb-4">
        <label className="block font-semibold mb-1">Chart Type Category</label>
        <select
          value={category}
          onChange={handleCategoryChange}
          className="select select-bordered w-full sm:w-64"
        >
          <option value="">Select Category</option>
          <option value="2D">2D Charts</option>
          <option value="3D">3D Charts</option>
          <option value="Distribution">Distribution Charts</option>
        </select>
      </div>

      {/* Chart Type */}
      {category && (
        <div className="mb-4">
          <label className="block font-semibold mb-1">Chart Type</label>
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            className="select select-bordered w-full sm:w-64"
          >
            <option value="">Select Chart</option>
            {filteredCharts.map((type) => (
              <option key={type} value={type}>
                {CHART_LABELS[type]}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Axis Selectors */}
      {chartType && (
        <div className="mb-4 flex flex-wrap gap-4">
          <div>
            <label className="block font-semibold mb-1">X Axis</label>
            <select
              value={selectedX}
              onChange={(e) => setSelectedX(e.target.value)}
              className="select select-bordered"
            >
              <option value="">Select X</option>
              {columns.map((col, i) => (
                <option key={i} value={col}>
                  {col}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">Y Axis</label>
            <select
              value={selectedY}
              onChange={(e) => setSelectedY(e.target.value)}
              className="select select-bordered"
            >
              <option value="">Select Y</option>
              {columns.map((col, i) => (
                <option key={i} value={col}>
                  {col}
                </option>
              ))}
            </select>
          </div>

          {/* Z Axis for 3D */}
          {category === "3D" && (
            <div>
              <label className="block font-semibold mb-1">Z Axis</label>
              <select
                value={selectedZ}
                onChange={(e) => setSelectedZ(e.target.value)}
                className="select select-bordered"
              >
                <option value="">Select Z</option>
                {columns.map((col, i) => (
                  <option key={i} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Color Picker (Collapsible) */}
      <div className="mt-4">
        <button
          onClick={() => setShowColorPicker((prev) => !prev)}
          className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
        >
          🎨 {showColorPicker ? "Hide" : "Pick Chart Color"}
        </button>

        {showColorPicker && (
          <div className="mt-4">
            <ChromePicker
              color={color}
              onChangeComplete={(c) => setColor(c.hex)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartOptions;
