// pages/Analyze.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axiosInstance";

import AISummary from "../components/charts/AISummary";
import ChartPicker from "../components/charts/ChartPicker";

const Analyze = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [fileData, setFileData] = useState(null);
  const [columns, setColumns] = useState([]);
  const [dataRows, setDataRows] = useState([]);
  const [aiSummary, setAiSummary] = useState(""); // ✅ Summary state

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fileRes = await axios.get(`/upload/${id}`);
        const previewRes = await axios.get(`/upload/preview/${id}`);

        if (!fileRes?.data || !previewRes?.data) {
          throw new Error("Incomplete response from server");
        }

        setFileData(fileRes.data);
        setColumns(previewRes.data.columns);
        setDataRows(previewRes.data.rows);
      } catch (err) {
        console.error("Error loading file data:", err);
        alert("Failed to load file data. Redirecting...");
        user?.isAdmin ? navigate("/admin/dashboard") : navigate("/");
      }
    };

    fetchData();
  }, [id, navigate, user]);

  return (
    <div className="max-w-7xl mx-auto p-6 mt-10">
      {/* File Info */}
      <div className="mb-6 bg-gray-100 p-4 rounded shadow">
        <h1 className="text-2xl font-bold mb-2">
          Analyze: {fileData?.fileName || "Loading..."}
        </h1>
        <p className="text-sm text-gray-600">
          Uploaded on:{" "}
          {fileData?.createdAt
            ? new Date(fileData.createdAt).toLocaleString()
            : "Loading..."}
        </p>
      </div>


      {/* Chart Picker with summary passed */}
      <ChartPicker
        dataRows={dataRows}
        columns={columns}
        fileName={fileData?.fileName}
        aiSummary={aiSummary} // ✅ Pass to ChartPicker
      />
      {/* AI Summary Block */}
      <AISummary fileId={id} onSummaryGenerated={setAiSummary} />
    </div>
  );
};

export default Analyze;
