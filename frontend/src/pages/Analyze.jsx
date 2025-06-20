// pages/Analyze.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axiosInstance";

import ChartPicker from "../components/charts/ChartPicker";
import ChartMetadata from "../components/charts/ChartMetadata";

const Analyze = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [fileData, setFileData] = useState(null);
  const [columns, setColumns] = useState([]);
  const [dataRows, setDataRows] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fileRes, previewRes] = await Promise.all([
          axios.get(`/upload/${id}`),
          axios.get(`/upload/preview/${id}`)
        ]);

        setFileData(fileRes.data);
        setColumns(previewRes.data.columns);
        setDataRows(previewRes.data.rows);
      } catch (err) {
        console.error("Error loading file data:", err);
        alert("Failed to load file data. Redirecting...");
        navigate("/dashboard");
      }
    };

    fetchData();
  }, [id, navigate]);

  return (
    <div className="max-w-7xl mx-auto p-6 mt-10">
      {/* File Info */}
      <div className="mb-6 bg-gray-100 p-4 rounded shadow">
        <h1 className="text-2xl font-bold mb-2">Analyze: {fileData?.fileName || "Loading..."}</h1>
        <p className="text-sm text-gray-600">
          Uploaded on:{" "}
          {fileData?.createdAt
            ? new Date(fileData.createdAt).toLocaleString()
            : "Loading..."}
        </p>
      </div>

      {/* Metadata */}
      <ChartMetadata dataRows={dataRows} columns={columns} />

      {/* Chart Picker */}
      <ChartPicker dataRows={dataRows} columns={columns} fileName={fileData?.fileName} />

    </div>
  );
};

export default Analyze;
