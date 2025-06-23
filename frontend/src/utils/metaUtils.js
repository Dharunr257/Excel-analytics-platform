export const generateChartMeta = (rows) => {
  if (!rows.length) return <p>No data available.</p>;
  const sample = rows[0];
  const cols = Object.keys(sample).length;
  return (
    <ul className="list-disc pl-6 text-gray-700">
      <li>Total Rows: {rows.length}</li>
      <li>Columns: {cols}</li>
      <li>Sample Column Names: {Object.keys(sample).join(', ')}</li>
    </ul>
  );
};
