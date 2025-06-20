const ChartMetadata = ({ dataRows }) => {
  if (!Array.isArray(dataRows) || dataRows.length === 0) {
    return (
      <div className="p-4 border rounded bg-yellow-50 text-yellow-800 text-sm">
        No data loaded to display chart metadata.
      </div>
    );
  }

  const rowCount = dataRows.length;
  const columnCount = Object.keys(dataRows[0] || {}).length;
  const columnNames = Object.keys(dataRows[0] || {});

  return (
    <div className="mt-4 p-4 border rounded bg-gray-50">
      <h2 className="text-lg font-semibold mb-2">📊 Chart Metadata</h2>
      <p><strong>Rows:</strong> {rowCount}</p>
      <p><strong>Columns:</strong> {columnCount}</p>
      <p><strong>Column Names:</strong> {columnNames.join(", ")}</p>
    </div>
  );
};

export default ChartMetadata;
