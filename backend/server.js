const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// Load models
const Stream = require("./models/streamModel");
const Degree = require("./models/degreeModel");
const AcademicYear = require("./models/academicyearModel");
const Course = require("./models/courseModel");
const Specialization = require("./models/specializationModel");
const Subject = require("./models/subjectModel");

// @GET - Custom Route to get degrees by stream
app.get("/api/v1/streams/:uuid/degrees", async (req, res) => {
  try {
    const stream = await Stream.findOne({ uuid: req.params.uuid });
    console.log(req.params.uuid, stream);
    if (!stream) return res.status(404).json({ message: "Stream not found" });

    const degrees = await Degree.find({ stream: stream.uuid });
    res.status(200).json(degrees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----- Generic CRUD Factory -----
function crudRoutes(app, path, Model) {
  app.post(`/api/v1/${path}`, async (req, res) => {
    try {
      const doc = new Model(req.body);
      await doc.save();
      res.status(201).json(doc);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get(`/api/v1/${path}`, async (req, res) => {
    try {
      const docs = await Model.find();
      res.status(200).json(docs);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get(`/api/v1/${path}/:id`, async (req, res) => {
    try {
      console.log(req.params.id);
      const doc = await Model.findOne({ uuid: req.params.id });
      if (!doc) return res.status(404).json({ message: "Not found" });
      res.status(200).json(doc);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put(`/api/v1/${path}/:id`, async (req, res) => {
    try {
      const updated = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      if (!updated) return res.status(404).json({ message: "Not found" });
      res.status(200).json(updated);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete(`/api/v1/${path}/:id`, async (req, res) => {
    try {
      const deleted = await Model.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ message: "Not found" });
      res.status(200).json({ message: "Deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
}

// ----- Register Routes -----
crudRoutes(app, "streams", Stream);
crudRoutes(app, "degrees", Degree);
crudRoutes(app, "academic-years", AcademicYear);
crudRoutes(app, "courses", Course);
crudRoutes(app, "specializations", Specialization);
crudRoutes(app, "subjects", Subject);

// Server start
const PORT = process.env.NODE_PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
