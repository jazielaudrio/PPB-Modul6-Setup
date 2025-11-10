import { HumidityReadingsModel } from "../models/humidityReadingsModel.js"; // Diubah

export const HumidityReadingsController = { // Diubah
  async list(req, res) {
    try {
      const data = await HumidityReadingsModel.list(); // Diubah
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async latest(req, res) {
    try {
      const data = await HumidityReadingsModel.latest(); // Diubah
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async create(req, res) {
    try {
      const created = await HumidityReadingsModel.create(req.body); // Diubah
      res.status(201).json(created);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
};