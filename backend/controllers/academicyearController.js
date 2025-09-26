const Degree = require("../models/degreeModel");
const Stream = require("../models/streamModel");
const Year = require("../models/academicyearModel");
const generate = require("../lib/generate");

const create = async (req, res) => {
  try {
    let { year, streams, degrees } = req.body;

    // Ensure they are arrays
    if (!Array.isArray(streams)) streams = [streams];
    if (!Array.isArray(degrees)) degrees = [degrees];

    let exist_year = await Year.findOne({ year });

    if (exist_year) {
      exist_year.streams = [...new Set([...exist_year.streams, ...streams])];
      exist_year.degrees = [...new Set([...exist_year.degrees, ...degrees])];
    } else {
      exist_year = new Year({
        year,
        streams,
        degrees,
        iid: req.user.IID,
        uuid: generate(),
      });
    }

    await exist_year.save();

    return res.status(200).json({ success: true, new_year: exist_year });
  } catch (error) {
    return res.status(500).json({ err: error.message });
  }
};

const edit = async (req, res) => {
  try {
    const { uuid } = req.params;
    const { year, streams, degrees, isActive } = req.body;

    const updateData = {};
    if (year !== undefined) updateData.year = year;
    if (streams !== undefined) updateData.streams = streams;
    if (degrees !== undefined) updateData.degrees = degrees;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedYear = await Year.findOneAndUpdate({ uuid }, updateData, {
      new: true,
    });

    if (!updatedYear) {
      return res.status(404).json({ err: "Academic Year not found" });
    }

    res.status(200).json({ success: true, updatedYear });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

const status = async (req, res) => {
  try {
    const { uuid } = req.params;
    const { isActive } = req.body;

    const year = await Year.findOneAndUpdate(
      { uuid },
      { isActive },
      { new: true }
    );

    if (!year) {
      return res.status(404).json({ err: "Academic Year not found" });
    }

    res.status(200).json({ success: true, year });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

const getAll = async (req, res) => {
  try {
    const years = await Year.find({ iid: req.user.IID });

    if (years.length < 1) {
      res.status(204).json({ err: "Academic Years not found" });
      return;
    }

    res.status(200).json(years);
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

const bulk = async (req, res) => {
  try {
    if (!Array.isArray(req.body) || req.body.length === 0) {
      return res
        .status(400)
        .json({ error: "Request body must be a non-empty array" });
    }

    console.log("Received Payload:", req.body);

    // Step 1: Extract unique streams
    const uniqueStreams = [...new Set(req.body.map((y) => y.stream.trim()))];

    // Step 2: Extract unique (stream + degree) combos
    const uniqueDegrees = [
      ...new Map(
        req.body.map((y) => [
          `${y.stream}-${y.degree}`,
          { stream: y.stream.trim(), name: y.degree.trim() },
        ])
      ).values(),
    ];

    // Step 3: Find existing streams
    const existingStreams = await Stream.find({ name: { $in: uniqueStreams } });

    const streamMap = {};
    existingStreams.forEach((s) => (streamMap[s.name] = s));

    // Step 4: Create missing streams
    const newStreamsToInsert = uniqueStreams
      .filter((name) => !streamMap[name])
      .map((name) => ({ uuid: generate(), name }));

    let createdStreams = [];
    if (newStreamsToInsert.length > 0) {
      createdStreams = await Stream.insertMany(newStreamsToInsert);
      createdStreams.forEach((s) => (streamMap[s.name] = s));
    }

    // Step 5: Handle degrees scoped to streams
    const degreeConditions = uniqueDegrees.map((d) => ({
      name: d.name,
      stream: streamMap[d.stream].uuid,
    }));

    const existingDegrees = await Degree.find({ $or: degreeConditions });

    const degreeMap = {};
    existingDegrees.forEach((d) => (degreeMap[`${d.stream}-${d.name}`] = d));

    const newDegreesToInsert = uniqueDegrees
      .filter((d) => !degreeMap[`${streamMap[d.stream].uuid}-${d.name}`])
      .map((d) => ({
        uuid: generate(),
        name: d.name,
        stream: streamMap[d.stream].uuid,
      }));

    let createdDegrees = [];
    if (newDegreesToInsert.length > 0) {
      createdDegrees = await Degree.insertMany(newDegreesToInsert);
      createdDegrees.forEach((d) => {
        degreeMap[`${d.stream}-${d.name}`] = d;
      });
    }

    // Step 6: Group rows by year
    const yearGroups = {};
    req.body.forEach((y) => {
      if (!yearGroups[y.year]) {
        yearGroups[y.year] = { streams: new Set(), degrees: new Set() };
      }

      const streamDoc = streamMap[y.stream];
      const degreeDoc = degreeMap[`${streamDoc.uuid}-${y.degree}`];

      if (streamDoc) yearGroups[y.year].streams.add(streamDoc.uuid);
      if (degreeDoc) yearGroups[y.year].degrees.add(degreeDoc.uuid);
    });

    // Step 7: Build Year documents
    const yearPayload = Object.entries(yearGroups).map(([year, data]) => ({
      uuid: generate(),
      year,
      streams: [...data.streams],
      degrees: [...data.degrees],
      isActive: true,
    }));

    const years = await Year.insertMany(yearPayload);

    return res.status(201).json({
      success: true,
      streamsCreated: createdStreams.length,
      degreesCreated: createdDegrees.length,
      yearsCreated: years.length,
      data: {
        streams: [...existingStreams, ...createdStreams],
        degrees: [...existingDegrees, ...createdDegrees],
        years,
      },
    });
  } catch (error) {
    console.error("Bulk import error:", error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  create,
  edit,
  status,
  getAll,
  bulk,
};
