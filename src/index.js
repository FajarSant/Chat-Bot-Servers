require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const dialogflow = require('@google-cloud/dialogflow');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const materiRoutes = require('./routes/materiroutes');

const app = express();

const port = process.env.PORT || 8000;

app.use(cors());

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

app.post("/api/webhook", async (req, res) => {
  const query = req.body.queryResult.queryText;

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: query }],
        max_tokens: 150,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const gptResponse = response.data.choices[0].message.content;

    res.json({
      fulfillmentText: gptResponse,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Something went wrong!");
  }
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
