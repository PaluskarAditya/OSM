const Stream = require("../models/streamModel");
const Degree = require("../models/degreeModel");
const Year = require("../models/academicyearModel");
const Combined = require("../models/combinedModel");
const Course = require("../models/courseModel");
const Subject = require("../models/subjectModel");
const generate = require("../lib/generate");

const create = async (req, res) => {
  try {
    let { code } = req.body;

    const exist_subject = await Subject.findOne({ code });

    console.log("Received Payload:", req.body);

    if (exist_subject) {
      res.status(500).json({ err: "Subject already exists" });
      return;
    }

    const subject = new Subject({ ...req.body, uuid: generate() });
    await subject.save();

    if (subject) {
      res.status(200).json({ success: true, subject });
      return;
    }
  } catch (error) {
    return res.status(500).json({ err: error.message });
  }
};

const edit = async (req, res) => {
  try {
    const { uuid } = req.params;
    const { isActive, code, semester, name, combined, exam, type } = req.body;

    const updateData = {};
    if (code !== undefined) updateData.code = code;
    if (semester !== undefined) updateData.semester = semester;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (name !== undefined) updateData.name = name;
    if (combined !== undefined) updateData.combined = combined;
    if (exam !== undefined) updateData.exam = exam;
    if (type !== undefined) updateData.type = type;

    console.log("Received Payload:", req.body);

    const updatedSubject = await Subject.findOneAndUpdate(
      { uuid },
      updateData,
      {
        new: true,
      }
    );

    if (!updatedSubject) {
      return res.status(404).json({ err: "Subject not found" });
    }

    res.status(200).json({ success: true, updatedSubject });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

const status = async (req, res) => {
  try {
    const { uuid } = req.params;
    const { isActive } = req.body;

    const subject = await Subject.findOneAndUpdate(
      { uuid },
      { isActive },
      { new: true }
    );

    if (!subject) {
      return res.status(404).json({ err: "Subject not found" });
    }

    res.status(200).json({ success: true, subject });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

const getAll = async (req, res) => {
  try {
    const subjects = await Subject.find();

    if (subjects.length < 1) {
      res.status(500).json({ err: "Subjects not found" });
      return;
    }

    res.status(200).json(subjects);
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
        streams: [], // will update after courses are created
        degrees: [], // will update after courses are created
        isActive: true,
      }));

    const createdYears = newYearsToInsert.length
      ? await Year.insertMany(newYearsToInsert)
      : [];

    createdYears.forEach((y) => (yearMap[y.year] = y));

    // --- Step 6: Find or create courses ---
    const uniqueCourses = [
      ...new Map(
        req.body.map((y) => [
          `${y.course}-${y.course_code}`,
          {
            name: y.course.trim(),
            code: y.course_code.trim(),
            stream: y.stream.trim(),
            degree: y.degree.trim(),
            year: y.year.trim(),
            semCount: y.semester.trim(),
          },
        ])
      ).values(),
    ];

    const coursePayload = uniqueCourses.map((c) => {
      const streamDoc = streamMap[c.stream];
      const degreeDoc = degreeMap[`${streamDoc.uuid}-${c.degree}`];
      const yearDoc = yearMap[c.year];

      return {
        uuid: generate(),
        name: c.name,
        code: c.code,
        stream: streamDoc.uuid,
        degree: degreeDoc.uuid,
        year: yearDoc.uuid,
        semCount: c.semCount,
        isActive: true,
      };
    });

    const courses = await Course.insertMany(coursePayload);
    const courseMap = {};
    courses.forEach((c) => (courseMap[`${c.name}-${c.code}`] = c));

    // --- Step 7: Find or create combineds ---
    const uniqueCombinedKeys = [
      ...new Set(
        req.body.map(
          (y) => `${y.stream.trim()} | ${y.degree.trim()} | ${y.year.trim()}`
        )
      ),
    ];

    const existingCombineds = await Combined.find({
      name: { $in: uniqueCombinedKeys },
    });

    const combinedMap = {};
    existingCombineds.forEach((c) => (combinedMap[c.name] = c));

    for (const course of courses) {
      const streamDoc = Object.values(streamMap).find(
        (s) => s.uuid === course.stream
      );
      const degreeDoc = Object.values(degreeMap).find(
        (d) => d.uuid === course.degree
      );
      const yearDoc = Object.values(yearMap).find(
        (y) => y.uuid === course.year
      );

      const combinedKey = `${streamDoc.name} | ${degreeDoc.name} | ${yearDoc.year}`;

      let combinedDoc = combinedMap[combinedKey];
      if (!combinedDoc) {
        combinedDoc = await Combined.create({
          uuid: generate(),
          name: combinedKey,
          stream: streamDoc.uuid,
          degree: degreeDoc.uuid,
          year: yearDoc.uuid,
          course: [course.uuid],
        });
        combinedMap[combinedKey] = combinedDoc;
      } else {
        if (!combinedDoc.course.includes(course.uuid)) {
          combinedDoc.course.push(course.uuid);
          await combinedDoc.save();
        }
      }
    }

    for (const course of courses) {
      const yearDoc =
        yearMap[
          Object.values(yearMap).find((y) => y.uuid === course.year).year
        ];
      if (yearDoc) {
        const streamId = course.stream;
        const degreeId = course.degree;

        // Only push if not already included
        await Year.updateOne(
          { uuid: yearDoc.uuid },
          {
            $addToSet: {
              streams: streamId,
              degrees: degreeId,
            },
          }
        );
      }
    }

    // --- Step 8: Create subjects ---
    const subjectPayload = req.body.map((y) => {
      const courseDoc = courseMap[`${y.course}-${y.course_code}`];

      const combinedKey = `${y.stream} | ${y.degree} | ${y.year}`;
      const combinedDoc = combinedMap[combinedKey];

      return {
        uuid: generate(),
        name: y.name,
        code: y.code,
        course: courseDoc.uuid,
        combined: combinedDoc.uuid,
        exam: y.exam,
        semester: y.semester,
        type: y.type,
        isActive: true,
      };
    });

    const subjects = await Subject.insertMany(subjectPayload);

    return res.status(201).json({
      success: true,
      streamsCreated: createdStreams.length,
      degreesCreated: createdDegrees.length,
      yearsCreated: createdYears.length,
      coursesCreated: courses.length,
      subjectsCreated: subjects.length,
      data: {
        streams: [...existingStreams, ...createdStreams],
        degrees: [...existingDegrees, ...createdDegrees],
        years: [...existingYears, ...createdYears],
        courses,
        combineds: Object.values(combinedMap),
        subjects,
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
