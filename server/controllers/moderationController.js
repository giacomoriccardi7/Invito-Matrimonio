const { updateMemoryApprovalStatus, logModerationAction, getModerationHistory, getModerationStats, getPendingMemories } = require('../services/supabaseStorage');

const approveMemoryController = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await updateMemoryApprovalStatus(id, true);

    // Broadcast to SSE clients the approved memory
  if (req.sendEventsToAll && updated) {
    req.sendEventsToAll(updated);
  }

  // Log moderation action
  try { await logModerationAction(id, 'approved', 'admin'); } catch {}

    res.status(200).json({ message: 'Memory approved successfully', memory: updated });
  } catch (error) {
    console.error('Error in approveMemoryController:', error);
    res.status(500).json({ message: 'Error approving memory', error: error.message });
  }
};

const rejectMemoryController = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await updateMemoryApprovalStatus(id, false);

    // Optionally broadcast rejections (frontends may ignore unapproved)
  if (req.sendEventsToAll && updated) {
    req.sendEventsToAll(updated);
  }

  // Log moderation action
  try { await logModerationAction(id, 'rejected', 'admin'); } catch {}

    res.status(200).json({ message: 'Memory rejected successfully', memory: updated });
  } catch (error) {
    console.error('Error in rejectMemoryController:', error);
    res.status(500).json({ message: 'Error rejecting memory', error: error.message });
  }
};

const getPendingController = async (req, res) => {
  try {
    const pendings = await getPendingMemories();
    res.status(200).json(pendings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pending memories', error: error.message });
  }
};

const getHistoryController = async (req, res) => {
  try {
    const history = await getModerationHistory();
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching moderation history', error: error.message });
  }
};

const getStatsController = async (req, res) => {
  try {
    const stats = await getModerationStats();
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
};

module.exports = { approveMemoryController, rejectMemoryController, getPendingController, getHistoryController, getStatsController };