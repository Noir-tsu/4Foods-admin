const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

exports.getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find().populate('participants', 'name email').sort({ updatedAt: -1 });
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getConversationById = async (req, res) => {
  try {
    const conv = await Conversation.findById(req.params.id).populate('participants', 'name email');
    if (!conv) return res.status(404).json({ message: 'Conversation not found' });
    const messages = await Message.find({ conversationId: conv._id }).sort({ createdAt: 1 });
    res.json({ conversation: conv, messages });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createConversation = async (req, res) => {
  try {
    const conv = await Conversation.create(req.body);
    res.status(201).json(conv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteConversation = async (req, res) => {
  try {
    const conv = await Conversation.findByIdAndDelete(req.params.id);
    if (!conv) return res.status(404).json({ message: 'Conversation not found' });
    res.json({ message: 'Conversation deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
