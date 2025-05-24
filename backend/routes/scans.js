const express = require('express');
const router = express.Router();
const Scan = require('../models/Scan');
const Device = require('../models/Device');
const { getPublicUrl } = require('../config/database');

// GET /api/scans/history
router.get('/history', async (req, res) => {
  try {
    const { device_id } = req.query;
    
    if (!device_id) {
      return res.status(400).json({ error: 'Device ID is required' });
    }

    // Check if device exists
    const device = await Device.findByDeviceUniqueId(device_id);
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    // Get scans with OpenAI responses
    const scans = await Scan.findByDeviceId(device.id);
    
    // Format the response
    const history = scans.map(scan => {
      // Get the first OpenAI response for this scan (there should only be one)
      const openaiResponse = scan.openai_responses[0];
      
      if (!openaiResponse || !openaiResponse.response_json) {
        return null;
      }
      
      // Process the image URL to ensure it's properly formatted
      const imageUrl = getPublicUrl(scan.image_url);
      
      return {
        id: scan.id,
        image_url: imageUrl,
        timestamp: new Date(scan.created_at).getTime(),
        learningData: openaiResponse.response_json
      };
    }).filter(Boolean); // Remove null entries
    
    res.json(history);
  } catch (error) {
    console.error('[Scans History] Error:', error);
    res.status(500).json({ error: 'Failed to fetch scan history', details: error.message });
  }
});

// DELETE /api/scans/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { device_id } = req.query;
    
    if (!device_id) {
      return res.status(400).json({ error: 'Device ID is required' });
    }

    // Check if device exists
    const device = await Device.findByDeviceUniqueId(device_id);
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    // Delete the scan
    await Scan.deleteById(id, device.id);
    
    res.json({ success: true, message: 'Scan deleted successfully' });
  } catch (error) {
    console.error('[Scan Delete] Error:', error);
    res.status(500).json({ error: 'Failed to delete scan', details: error.message });
  }
});

// GET /api/scans/community - Get recent scans from all users for Learn tab
router.get('/community', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    
    // Get recent scans from all users with their learning data (no age filtering)
    const scans = await Scan.findRecentWithLearningData(limit);
    
    // Format the response
    const communityScans = scans.map(scan => {
      // Get the first OpenAI response for this scan
      const openaiResponse = scan.openai_responses[0];
      
      if (!openaiResponse || !openaiResponse.response_json) {
        return null;
      }
      
      // Process the image URL to ensure it's properly formatted
      const imageUrl = getPublicUrl(scan.image_url);
      
      return {
        id: scan.id,
        image_url: imageUrl,
        timestamp: new Date(scan.created_at).getTime(),
        learningData: openaiResponse.response_json
      };
    }).filter(Boolean); // Remove null entries
    
    res.json(communityScans);
  } catch (error) {
    console.error('[Community Scans] Error:', error);
    res.status(500).json({ error: 'Failed to fetch community scans', details: error.message });
  }
});

module.exports = router; 