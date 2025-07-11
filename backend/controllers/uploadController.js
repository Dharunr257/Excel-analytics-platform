import axios from 'axios';
import Upload from '../models/Upload.js'; // ✅ Ensure this is included
import dotenv from 'dotenv';
import * as xlsx from 'xlsx'; // ✅ for ES Modules (Node.js)

dotenv.config();

export const generateAISummary = async (req, res) => {
  try {
    console.log('Starting AI summary...');

    const upload = await Upload.findById(req.params.id);
    if (!upload) {
      return res.status(404).json({ message: 'Upload not found' });
    }

    const response = await axios.get(upload.filePath, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data, 'binary');
    const xlsx = await import('xlsx');
    const os = await import('os');
    const fs = await import('fs');
    const path = await import('path');
    const { v4: uuidv4 } = await import('uuid');

    const tempPath = path.join(os.tmpdir(), `${uuidv4()}.xlsx`);
    fs.writeFileSync(tempPath, buffer);

    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet);

    fs.unlinkSync(tempPath);

    if (!jsonData.length) {
      return res.status(400).json({ message: 'Excel file is empty' });
    }

    const payload = {
      model: 'openrouter/auto',
      messages: [
        {
          role: 'user',
          content: `You are an AI data analyst. Summarize this Excel data:\n${JSON.stringify(jsonData)}\n\nReturn:\n1. Natural language summary.\n2. Alerts or unusual patterns.\n3. Key statistics and recommendations.`,
        },
      ],
    };

    const aiResponse = await axios.post('https://openrouter.ai/api/v1/chat/completions', payload, {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const summary = aiResponse.data.choices?.[0]?.message?.content;

    if (!summary) {
      return res.status(500).json({ message: 'AI response missing content.' });
    }

    res.json({ summary });
  } catch (error) {
    console.error('❌ AI Summary failed:', error.message);
    res.status(500).json({ message: 'AI summary generation failed.', error: error.message });
  }
};
