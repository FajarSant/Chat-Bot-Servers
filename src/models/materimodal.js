const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createMateri = async (data) => {
  return await prisma.materi.create({
    data,
  });
};

const getAllMateri = async () => {
  return await prisma.materi.findMany();
};

const getMateriById = async (id) => {
  return await prisma.materi.findUnique({
    where: { id: id },
  });
};

const updateMateri = async (id, data) => {
  return await prisma.materi.update({
    where: { id: id },
    data,
  });
};

const deleteMateri = async (id) => {
  return await prisma.materi.delete({
    where: { id: id },
  });
};

module.exports = {
  createMateri,
  getAllMateri,
  getMateriById,
  updateMateri,
  deleteMateri,
};
