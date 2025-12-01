const Setting = require('../models/Setting');

exports.getAllSettings = async (req, res) => {
  try {
    const settings = await Setting.find().sort({ key: 1 });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSettingByKey = async (req, res) => {
  try {
    const setting = await Setting.findOne({ key: req.params.key });
    if (!setting) return res.status(404).json({ message: 'Setting not found' });
    res.json(setting);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createSetting = async (req, res) => {
  try {
    const { key, value, description } = req.body;
    const exists = await Setting.findOne({ key });
    if (exists) return res.status(400).json({ message: 'Setting key already exists' });
    const s = await Setting.create({ key, value, description });
    res.status(201).json(s);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateSetting = async (req, res) => {
  try {
    const { value, description } = req.body;
    const s = await Setting.findOneAndUpdate(
      { key: req.params.key },
      { value, description },
      { new: true, upsert: false }
    );
    if (!s) return res.status(404).json({ message: 'Setting not found' });
    res.json(s);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteSetting = async (req, res) => {
  try {
    const s = await Setting.findOneAndDelete({ key: req.params.key });
    if (!s) return res.status(404).json({ message: 'Setting not found' });
    res.json({ message: 'Setting deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
