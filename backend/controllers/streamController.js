const Stream = require("../models/streamModel");
const generate = require("../lib/generate");

const createStream = async (req, res) => {
  try {
    const { name } = req.body;

    const exist = await Stream.findOne({ name });

    console.log(exist);

    if (exist) {
      res.status(500).json({ err: "Stream already exists" });
      return;
    }

    const stream = new Stream({ ...req.body, uuid: generate() });
    await stream.save();

    if (stream) {
      console.log("new stream created");
      res.status(200).json({ success: true, stream });
      return;
    }
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

const editStream = async (req, res) => {
  try {
    const { uuid } = req.params;
    const { name } = req.body;

    const stream = await Stream.findOneAndUpdate(
      { uuid },
      { name },
      { new: true }
    );

    if (!stream) {
      return res.status(404).json({ err: "Stream not found" });
    }

    res.status(200).json({ success: true, stream });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

const statusStream = async (req, res) => {
  try {
    const { uuid } = req.params;
    const { isActive } = req.body;

    const stream = await Stream.findOneAndUpdate(
      { uuid },
      { isActive },
      { new: true }
    );

    if (!stream) {
      return res.status(404).json({ err: "Stream not found" });
    }

    res.status(200).json({ success: true, stream });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

const getAllStreams = async (req, res) => {
  try {
    const streams = await Stream.find();

    if (streams.length < 1) {
      res.status(500).json({ err: "Streams not found" });
      return;
    }

    res.status(200).json(streams);
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

module.exports = {
  createStream,
  editStream,
  statusStream,
  getAllStreams,
};
