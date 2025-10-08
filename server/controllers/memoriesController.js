const { uploadMemory, getMemories, getApprovedMemories } = require('../services/supabaseStorage');

const uploadMemoryController = async (req, res) => {
  try {
    const { name, dedication } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileName = `${Date.now()}-${file.originalname}`;
    const fileType = file.mimetype;

    const { data, memoryData } = await uploadMemory(file.buffer, fileName, fileType, name, dedication);

    // Send update to all connected SSE clients
    if (req.sendEventsToAll) {
      req.sendEventsToAll(memoryData);
    }

    res.status(200).json({ message: 'Memory uploaded successfully', data, memoryData });
  } catch (error) {
    console.error('Error in uploadMemoryController:', error);
    res.status(500).json({ message: 'Error uploading memory', error: error.message });
  }
};

const getMemoriesController = async (req, res) => {
  try {
    const memories = await getMemories();
    res.status(200).json(memories);
  } catch (error) {
    console.error('Error in getMemoriesController:', error);
    res.status(500).json({ message: 'Error fetching memories', error: error.message });
  }
};

const getLiveMemoriesController = async (req, res) => {
  try {
    const memories = await getApprovedMemories();
    res.status(200).json(memories);
  } catch (error) {
    console.error('Error in getLiveMemoriesController:', error);
    res.status(500).json({ message: 'Error fetching live memories', error: error.message });
  }
};

module.exports = { uploadMemoryController, getMemoriesController, getLiveMemoriesController };