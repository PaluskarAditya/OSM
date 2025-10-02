const Degree = require("../models/degreeModel");
const Stream = require("../models/streamModel");
const Year = require("../models/academicyearModel");
const Course = require("../models/courseModel");
const Combined = require("../models/combinedModel");
const generate = require("../lib/generate");

const create = async (req, res) => {
  try {
    let { name, code } = req.body;

    const exist_course = await Course.findOne({ code, name });

    console.log("Received Payload:", req.body);

    if (exist_course) {
      res.status(500).json({ err: "Course already exists" });
      return;
    }

    const course = new Course({
      ...req.body,
      uuid: generate(),
      iid: req.user.IID,
    });
    await course.save();

    const stream = await Stream.findOne({ uuid: req.body.stream }).select(
      "name"
    );

    const degree = await Degree.findOne({ uuid: req.body.degree }).select(
      "name"
    );

    const year = await Year.findOne({ uuid: req.body.year }).select("year");

    const combined = new Combined({
      uuid: generate(),
      name: `${stream.name} | ${degree.name} | ${year.year}`,
      stream: req.body.stream,
      degree: req.body.degree,
      year: req.body.year,
      course: [course.uuid],
      iid: req.user.IID,
    });

    await combined.save();

    if (course) {
      res.status(200).json({ success: true, course });
      return;
    }
  } catch (error) {
    return res.status(500).json({ err: error.message });
  }
};

const edit = async (req, res) => {
  try {
    const { uuid } = req.params;
    const { year, stream, degree, isActive, code, semCount } = req.body;

    const updateData = {};
    if (year !== undefined) updateData.year = year;
    if (stream !== undefined) updateData.stream = stream;
    if (degree !== undefined) updateData.degree = degree;
    if (code !== undefined) updateData.code = code;
    if (semCount !== undefined) updateData.semCount = semCount;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedCourse = await Course.findOneAndUpdate({ uuid }, updateData, {
      new: true,
    });

    if (!updatedCourse) {
      return res.status(404).json({ err: "Course not found" });
    }

    res.status(200).json({ success: true, updatedCourse });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

const status = async (req, res) => {
  try {
    const { uuid } = req.params;
    const { isActive } = req.body;

    const course = await Course.findOneAndUpdate(
      { uuid },
      { isActive },
      { new: true }
    );

    if (!course) {
      return res.status(404).json({ err: "Course not found" });
    }

    res.status(200).json({ success: true, course });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

const getAll = async (req, res) => {
  try {
    const courses = await Course.find({ iid: req.user.IID });

    if (courses.length < 1) {
      res.status(500).json({ err: "Courses not found" });
      return;
    }

    res.status(200).json(courses);
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

    // --- Step 1: Extract unique streams ---
    const uniqueStreams = [...new Set(req.body.map((y) => y.stream.trim()))];

    // --- Step 2: Extract unique (stream + degree) combos ---
    const uniqueDegrees = [
      ...new Map(
        req.body.map((y) => [
          `${y.stream}-${y.degree}`,
          { stream: y.stream.trim(), name: y.degree.trim() },
        ])
      ).values(),
    ];

    // --- Step 3: Find or create streams ---
    const existingStreams = await Stream.find({ name: { $in: uniqueStreams } });
    const streamMap = {};
    existingStreams.forEach((s) => (streamMap[s.name] = s));

    const newStreamsToInsert = uniqueStreams
      .filter((name) => !streamMap[name])
      .map((name) => ({ uuid: generate(), name }));

    const createdStreams = newStreamsToInsert.length
      ? await Stream.insertMany(newStreamsToInsert)
      : [];

    createdStreams.forEach((s) => (streamMap[s.name] = s));

    // --- Step 4: Find or create degrees ---
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

    const createdDegrees = newDegreesToInsert.length
      ? await Degree.insertMany(newDegreesToInsert)
      : [];

    createdDegrees.forEach((d) => (degreeMap[`${d.stream}-${d.name}`] = d));

    // --- Step 5: Find or create years ---
    const uniqueYears = [...new Set(req.body.map((y) => y.year.trim()))];
    const existingYears = await Year.find({ year: { $in: uniqueYears } });
    const yearMap = {};
    existingYears.forEach((y) => (yearMap[y.year] = y));

    const newYearsToInsert = uniqueYears
      .filter((year) => !yearMap[year])
      .map((year) => ({
        uuid: generate(),
        year,
        streams: [], // optional
        degrees: [], // optional
        isActive: true,
      }));

    const createdYears = newYearsToInsert.length
      ? await Year.insertMany(newYearsToInsert)
      : [];

    createdYears.forEach((y) => (yearMap[y.year] = y));

    // --- Step 6: Create courses ---
    const coursePayload = req.body.map((y) => {
      const streamDoc = streamMap[y.stream];
      const degreeDoc = degreeMap[`${streamDoc.uuid}-${y.degree}`];
      const yearDoc = yearMap[y.year];

      return {
        uuid: generate(),
        name: y.name || y.code,
        stream: streamDoc.uuid,
        degree: degreeDoc.uuid,
        year: yearDoc.uuid,
        code: y.code,
        semCount: y.semCount,
        isActive: true,
      };
    });

    const courses = await Course.insertMany(coursePayload);

    return res.status(201).json({
      success: true,
      streamsCreated: createdStreams.length,
      degreesCreated: createdDegrees.length,
      yearsCreated: createdYears.length,
      coursesCreated: courses.length,
      data: {
        streams: [...existingStreams, ...createdStreams],
        degrees: [...existingDegrees, ...createdDegrees],
        years: [...existingYears, ...createdYears],
        courses,
      },
    });
  } catch (error) {
    console.error("Bulk import error:", error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = bulk;

module.exports = {
  create,
  edit,
  status,
  getAll,
  bulk,
};
