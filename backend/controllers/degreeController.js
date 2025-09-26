const Degree = require("../models/degreeModel");
const Stream = require("../models/streamModel");
const generate = require("../lib/generate");

const createDegree = async (req, res) => {
  try {
    const { name } = req.body;

    const exist = await Degree.findOne({ name });

    console.log(exist);

    if (exist) {
      res.status(500).json({ err: "Degree already exists" });
      return;
    }

    const degree = new Degree({
      ...req.body,
      iid: req.user.IID,
      uuid: generate(),
    });
    await degree.save();

    if (degree) {
      console.log("new degree created");
      res.status(200).json({ success: true, degree });
      return;
    }
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

const editDegree = async (req, res) => {
  try {
    const { uuid } = req.params;
    const { name, stream } = req.body;

    const degree = await Degree.findOneAndUpdate(
      { uuid },
      { name, stream },
      { new: true }
    );

    if (!degree) {
      return res.status(404).json({ err: "Degree not found" });
    }

    res.status(200).json({ success: true, degree });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

const statusDegree = async (req, res) => {
  try {
    const { uuid } = req.params;
    const { isActive } = req.body;

    const degree = await Degree.findOneAndUpdate(
      { uuid },
      { isActive },
      { new: true }
    );

    if (!degree) {
      return res.status(404).json({ err: "Degree not found" });
    }

    res.status(200).json({ success: true, degree });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

const getAllDegrees = async (req, res) => {
  try {
    const degrees = await Degree.find({ iid: req.user.IID });

    if (degrees.length < 1) {
      res.status(500).json({ err: "Degrees not found" });
      return;
    }

    res.status(200).json(degrees);
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

const bulkDegree = async (req, res) => {
  try {
    if (!Array.isArray(req.body) || req.body.length === 0) {
      return res
        .status(400)
        .json({ error: "Request body must be a non-empty array" });
    }

    console.log("Received Payload:", req.body);

    // Step 1: Get unique stream names
    const uniqueStreams = [
      ...new Set(req.body.map((deg) => deg.stream.trim())),
    ];

    // Step 2: Find which streams already exist
    const existingStreams = await Stream.find({ name: { $in: uniqueStreams } });

    // Create a map of streamName -> streamDoc
    const streamMap = {};
    existingStreams.forEach((s) => {
      streamMap[s.name] = s; // store the doc
    });

    // Step 3: Create streams that don’t exist
    const newStreamsToInsert = uniqueStreams
      .filter((name) => !streamMap[name]) // missing ones
      .map((name) => ({
        uuid: generate(),
        name,
      }));

    let createdStreams = [];
    if (newStreamsToInsert.length > 0) {
      createdStreams = await Stream.insertMany(newStreamsToInsert);
      createdStreams.forEach((s) => {
        streamMap[s.name] = s; // add to map
      });
    }

    // Step 4: Build degree payload with stream.uuid
    const degreePayload = req.body.map((deg) => ({
      uuid: generate(),
      name: deg.name.trim(),
      stream: streamMap[deg.stream.trim()].uuid, // reference uuid
    }));

    // Step 5: Insert degrees
    const degrees = await Degree.insertMany(degreePayload);

    return res.status(201).json({
      success: true,
      streamsCreated: createdStreams.length,
      degreesCreated: degrees.length,
      data: {
        streams: [...existingStreams, ...createdStreams],
        degrees,
      },
    });
  } catch (error) {
    console.error("Bulk import error:", error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createDegree,
  editDegree,
  statusDegree,
  getAllDegrees,
  bulkDegree,
};
