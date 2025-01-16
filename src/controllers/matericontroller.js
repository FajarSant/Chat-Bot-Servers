const { createMateri, getAllMateri, getMateriById, updateMateri, deleteMateri } = require('../models/materimodal');

// Membuat Materi
const createMateriController = async (req, res) => {
  const { judul, deskripsi, link } = req.body;  

  if (!judul) {
    return res.status(400).json({ error: 'Judul harus diisi' });
  }
  if (!deskripsi) {
    return res.status(400).json({ error: 'Deskripsi harus diisi' });
  }
  if (!link) {
    return res.status(400).json({ error: 'Link harus diisi' });
  }

  try {
    const materi = await createMateri(req.body);
    res.status(201).json({ message: 'Materi berhasil ditambahkan', materi });
  } catch (error) {
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
};

// Menampilkan Semua Materi
const getAllMateriController = async (req, res) => {
  try {
    const materiList = await getAllMateri();
    res.status(200).json(materiList);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getMateriByIdController = async (req, res) => {
  const { id } = req.params;
  try {
    const materi = await getMateriById(parseInt(id));  
    res.status(200).json(materi);
  } catch (error) {
    res.status(404).json({ error: 'Materi tidak ditemukan' });
  }
};

// Update Materi
const updateMateriController = async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  try {
    const updatedMateri = await updateMateri(parseInt(id), data);
    res.status(200).json({ message: 'Materi berhasil diperbarui', updatedMateri });
  } catch (error) {
    res.status(400).json({ error: 'Terjadi kesalahan saat memperbarui materi' });
  }
};

// Delete Materi
const deleteMateriController = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedMateri = await deleteMateri(parseInt(id));
    res.status(200).json({ message: 'Materi berhasil dihapus', deletedMateri });
  } catch (error) {
    res.status(400).json({ error: 'Terjadi kesalahan saat menghapus materi' });
  }
};

module.exports = {
  createMateriController,
  getAllMateriController,
  getMateriByIdController,
  updateMateriController,
  deleteMateriController,
};
