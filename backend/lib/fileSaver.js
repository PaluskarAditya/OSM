const axios = require("axios");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");

const forwardToUploadServer = async (files, course, subject, semester) => {
  console.log("Forward Files:", files);
  const form = new FormData();
  form.append("course", course);
  form.append("semester", semester);
  form.append("subject", subject);
  form.append("files", files);

  try {
    const response = await axios.post("http://localhost:9090/upload", form, {
      headers: {
        ...form.getHeaders(),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    return response.data;
  } catch (error) {
    throw new Error(
      `Failed to forward files to upload server: ${error.message}`
    );
  }
};

module.exports = forwardToUploadServer;
