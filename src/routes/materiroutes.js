const express = require('express');
const router = express.Router();
const materiController = require('../controllers/matericontroller');

// Route untuk Create Materi - menggunakan form-data (tanpa file)
router.post('/create', materiController.createMateriController);

// Route untuk Get All Materi
router.get('/show', materiController.getAllMateriController);

// Route untuk Get Materi by ID
router.get('/show/:id', materiController.getMateriByIdController);

// Route untuk Update Materi
router.put('/update/:id', materiController.updateMateriController);

// Route untuk Delete Materi
router.delete('/delete/:id', materiController.deleteMateriController);

module.exports = router;
