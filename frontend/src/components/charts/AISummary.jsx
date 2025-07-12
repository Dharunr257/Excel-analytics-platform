import React, { useState } from 'react';
import axiosInstance from '../../api/axiosInstance.js';

const AISummary = ({ fileId, onSummaryGenerated }) => {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const stripMarkdown = (text) => {
    return text.replace(/\*\*(.*?)\*\*/g, '$1'); // Removes **bold**
  };

  const generateSummary = async () => {
    setLoading(true);
    setError('');
    setSummary('');

    try {
      const res = await axiosInstance.post(`/upload/${fileId}/ai-summary`);
      if (res.data && res.data.summary) {
        const cleaned = stripMarkdown(res.data.summary);
        setSummary(cleaned);
        if (onSummaryGenerated) {
          onSummaryGenerated(cleaned); // Send to parent for PDF use
        }
      } else {
        setError('No summary returned.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'AI summary failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4">AI Summary</h2>

      <button
        onClick={generateSummary}
        disabled={loading}
        className={`px-5 py-2 rounded text-white font-medium ${
          loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
            Generating...
          </span>
        ) : (
          'Generate Summary'
        )}
      </button>

      {error && (
        <div className="mt-4 bg-red-100 text-red-800 px-4 py-2 rounded shadow-sm">
          <p>{error}</p>
          <button
            onClick={generateSummary}
            className="mt-2 underline text-sm text-blue-700 hover:text-blue-900"
          >
            Retry
          </button>
        </div>
      )}

      {summary && (
        <div className="mt-6 bg-gray-100 p-4 rounded border border-gray-300 whitespace-pre-wrap text-gray-900">
          {summary}
        </div>
      )}
    </div>
  );
};

export default AISummary;
