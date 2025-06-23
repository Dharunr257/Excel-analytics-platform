// components/charts/AISummary.jsx
const generateSummaryText = (rows = []) => {
  if (!rows || rows.length === 0) {
    return "No data available for summary.";
  }

  const columns = Object.keys(rows[0]);
  const totalRows = rows.length;
  const numericFields = columns.filter((col) =>
    rows.every((r) => !isNaN(parseFloat(r[col])))
  );

  return `This dataset contains ${totalRows} rows and ${columns.length} columns (${columns.join(", ")}).\n` +
         `Numeric fields identified: ${numericFields.length > 0 ? numericFields.join(", ") : "None"}.\n` +
         `AI-generated insights coming soon...`;
};

const AISummary = ({ rows = [], textOnly = false }) => {
  const summaryText = generateSummaryText(rows);

  if (textOnly) return summaryText;

  return (
    <div className="bg-white p-4 mt-6 rounded shadow">
      <h2 className="text-lg font-semibold mb-2">🤖 AI Summary</h2>
      <p className="text-gray-700 whitespace-pre-wrap">{summaryText}</p>
    </div>
  );
};

export default AISummary;
