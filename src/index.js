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
  ""; 
const openai = new OpenAI({
  apiKey: API_KEY,
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(upload.none());
app.use('/api/materi', materiRoutes);


app.post('/api/message', async (req, res) => {
  const message = req.body.message; 

  if (!message) {
    return res.status(400).json({ error: 'Message field is required' });
  }

  const projectId = 'master-plateau-435214-k5'; 
  const sessionClient = new dialogflow.SessionsClient({
    credentials: require('./dialogflow-credentials.json'), 
  });

  const sessionPath = sessionClient.projectAgentSessionPath(projectId, 'unique-session-id'); 

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: message, 
        languageCode: 'en',
      },
    },
  };

  try {
    const responses = await sessionClient.detectIntent(request); 
    const result = responses[0]?.queryResult; 

    if (result) {
      res.status(200).json({ response: result.fulfillmentText });
    } else {
      res.status(500).json({ error: 'Dialogflow response is empty' });
    }
  } catch (error) {
    console.error('Dialogflow API request error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


const systemMessage = {
  role: "system",
  content:
    "Anda adalah asisten AI untuk membantu siswa yang mengambil mata pelajaran Informatika kelas X SMK. Materi yang dibahas antara lain:1.Perangkat Keras Komputer, 2.Perangkat Lunak Komputer, 3.Pengguna, 4.Mekanisme Kerja Internal pada Komputer, 5.Interaksi antara Komputer dan Pengguna, 6.Instalasi Sistem Operasi, 7.Sejarah perkembangan sistem komputer, 8.Pengertian sistem memori. Berikan jawaban detail dan jelas jika ada pertanyaan terkait itu. Jika pertanyaan di luar topik itu, beri tahu bahwa kau adalah asisten AI yang dirancang untuk membantu belajar tentang: Berpikir komputasional, Teknologi Informasi dan Komunikasi, Sistem Komputer, Jaringan Komputer dan Internet, Analisis Data, Algoritma dan pemograman, Dampak Sosial Informatika, Praktik Lintas Bidang dan arahakan agar pengguna bertanya ke topik terkait itu",
};
app.post("/api/webhook", async (req, res) => {
  const userQuestion = req.body.queryResult.queryText;

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        systemMessage,
        { role: "user", content: userQuestion },
      ],
      stream: true, 
    });

    let aiResponse = '';
    for await (const chunk of chatCompletion) {
      if (chunk.choices && chunk.choices[0] && chunk.choices[0].delta) {
        aiResponse += chunk.choices[0].delta.content || '';
      }
    }

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
