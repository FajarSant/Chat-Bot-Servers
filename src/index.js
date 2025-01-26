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
app.post('/api/message', async (req, res) => {
  const message = req.body.message;

  if (!message) {
    return res.status(400).json({ error: 'Field pesan diperlukan' });
  }

  const projectId = process.env.DIALOGFLOW_PROJECT_ID;
  const sessionClient = new dialogflow.SessionsClient({
    credentials: {
      client_email: process.env.DIALOGFLOW_CLIENT_EMAIL,
      private_key: process.env.DIALOGFLOW_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }
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
      res.status(500).json({ error: 'Respons Dialogflow kosong' });
    }
  } catch (error) {
    console.error('Error permintaan API Dialogflow:', error);
    res.status(500).json({ error: 'Kesalahan pada server' });
  }
});

app.post("/api/webhook", async (req, res) => {
  const query = req.body.queryResult.queryText;

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4",
        messages: [{ role: "user", content: query }],
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
