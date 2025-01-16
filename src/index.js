const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const dialogflow = require('@google-cloud/dialogflow');
const cors = require('cors');
const path = require('path');

// Import routes
const materiRoutes = require('./routes/materiroutes');

// Inisialisasi express
const app = express();
const port = 8000;

// CORS Middleware
app.use(cors());

// Middleware untuk parsing body JSON dan URL encoded
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Middleware untuk menangani file upload (jika ada file upload)
const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage });

// Middleware untuk menangani form-data tanpa file (bisa menggunakan upload.none())
app.use(upload.none()); // .none() untuk menangani form-data tanpa file

// Routes untuk materi
app.use('/api/materi', materiRoutes);

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

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
