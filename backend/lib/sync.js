const Candidate = require("../models/candidateModel");
const AnswerSheet = require("../models/answerSheetModel");
const Inward = require("../models/inwardModel");
const Subject = require("../models/subjectModel");
const Evaluation = require("../models/evalModel");
const generate = require("./generate");

async function syncEvaluation(course, subject, createdBy) {
  const inward = await Inward.findOne({ course, subject });
  if (!inward) return null; // no inward yet

  // 1. Auto-map AnswerSheets ↔ Candidates
  const sheets = await AnswerSheet.find({ course, subject });
  for (const sheet of sheets) {
    if (!sheet.rollPRN) continue;

    const match = sheet.rollPRN.match(/^(\w+)\s*\[([^\]]+)\]$/);
    if (!match) continue;

    const roll = match[1];
    const prn = match[2];

    const candidate = await Candidate.findOne({ RollNo: roll, PRNNumber: prn });
    if (candidate && !candidate.bookletNames.get(subject)) {
      await Candidate.findOneAndUpdate(
        { _id: candidate._id },
        {
          $set: {
            sheetUploaded: true,
            [`bookletNames.${subject}`]: sheet.assignmentId,
            assignmentId: sheet.assignmentId,
          },
          $addToSet: { subjects: subject },
        }
      );
    }
  }

  // 2. Count check
  const candidateCount = await Candidate.countDocuments({
    course,
    subjects: subject,
  });
  const answerSheetCount = await AnswerSheet.countDocuments({
    course,
    subject,
  });
  const inwardCount = inward.mainCount;

  if (candidateCount === answerSheetCount && answerSheetCount === inwardCount) {
    // 3. Prevent duplicate evals
    const existEval = await Evaluation.findOne({
      course,
      semester: inward.semester,
      name: `${subject} Evaluation`,
    });
    if (existEval) return existEval;

    const sheetIds = sheets.map((s) => s.assignmentId);

    const sub = await Subject.findOne({ uuid: subject });

    // 4. Create evaluation
    const evaluation = new Evaluation({
      uuid: generate(),
      name: `${sub.name} Evaluation`,
      course,
      semester: sub.semester,
      subject,
      endDate: new Date(),
      examiners: [inward.examiner],
      sheets: sheetIds,
      progress: { uploaded: sheetIds.length, checked: 0 },
      createdBy,
    });

    await evaluation.save();
    return evaluation;
  }

  return null;
}

module.exports = syncEvaluation;
