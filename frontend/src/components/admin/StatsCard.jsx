// components/admin/StatsCard.jsx
const StatsCard = ({ title, value }) => (
  <div className="bg-white p-4 rounded shadow text-center">
    <h3 className="text-lg font-medium text-gray-700">{title}</h3>
    <p className="text-2xl font-bold text-blue-600">{value ?? "-"}</p>
  </div>
);

export default StatsCard;
