require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const dialogflow = require('@google-cloud/dialogflow');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const { OpenAI } = require("openai");

const materiRoutes = require('./routes/materiroutes');

const app = express();

const port = process.env.PORT || 8000;

app.use(cors());

const API_KEY =
  "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"; // Ganti dengan API Key Anda
const openai = new OpenAI({
  apiKey: API_KEY,
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(upload.none());
app.use('/api/materi', materiRoutes);

// Handler untuk menerima pesan dan mengirim ke Dialogflow
// Dialogflow API Route
app.post('/api/message', async (req, res) => {
  const message = req.body.message; // Pesan yang dikirim dari pengguna

  if (!message) {
    return res.status(400).json({ error: 'Message field is required' });
  }

  const projectId = 'master-plateau-435214-k5'; // ID project Dialogflow
  const sessionClient = new dialogflow.SessionsClient({
    credentials: require('./dialogflow-credentials.json'), // Kredensial dari file JSON
  });

  const sessionPath = sessionClient.projectAgentSessionPath(projectId, 'unique-session-id'); // Path sesi Dialogflow

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: message, // Pesan pengguna
        languageCode: 'en', // Kode bahasa
      },
    },
  };

  try {
    const responses = await sessionClient.detectIntent(request); // Kirim request ke Dialogflow
    const result = responses[0]?.queryResult; // Ambil hasil dari response

    if (result) {
      // Jika ada hasil dari Dialogflow, kirimkan response
      res.status(200).json({ response: result.fulfillmentText });
    } else {
      // Jika tidak ada hasil
      res.status(500).json({ error: 'Dialogflow response is empty' });
    }
  } catch (error) {
    // Tangani jika terjadi error
    console.error('Dialogflow API request error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


const systemMessage = {
  role: "system",
  content:
    "Anda adalah asisten AI untuk membantu siswa yang mengambil mata pelajaran Informatika kelas X SMK. Materi yang dibahas antara lain:1.Berpikir komputasional, 2.Teknologi Informasi dan Komunikasi, 3.Sistem Komputer, 4.Jaringan Komputer dan Internet, 5.Analisis Data, 6.Algoritma dan pemograman, 7.Dampak Sosial Informatika, 8.Praktik Lintas Bidang. Berikan jawaban detail dan jelas jika ada pertanyaan terkait itu. Jika pertanyaan di luar topik itu, beri tahu bahwa kau adalah asisten AI yang dirancang untuk membantu belajar tentang: Berpikir komputasional, Teknologi Informasi dan Komunikasi, Sistem Komputer, Jaringan Komputer dan Internet, Analisis Data, Algoritma dan pemograman, Dampak Sosial Informatika, Praktik Lintas Bidang dan arahakan agar pengguna bertanya ke topik terkait itu",
};
app.post("/api/webhook", async (req, res) => {
  const userQuestion = req.body.queryResult.queryText; // Ambil pertanyaan dari pengguna

  try {
    // Kirim pertanyaan ke OpenAI dan dapatkan responsnya
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        systemMessage, // Pesan sistem untuk konteks
        { role: "user", content: userQuestion },
      ],
    });

    const aiResponse = chatCompletion.choices[0].message.content; // Ambil jawaban dari OpenAI

    // Kembalikan hasil ke Dialogflow
    res.json({
      fulfillmentText: aiResponse,
    });
  } catch (error) {
    console.error("Error:", error);
    res.json({
      fulfillmentText: "Maaf, terjadi kesalahan dalam memproses permintaan.",
    });
  }
});
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
