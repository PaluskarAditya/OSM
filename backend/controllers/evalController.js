const sendMail = require("../lib/mail");
const Evaluation = require("../models/evalModel");
const generate = require("../lib/generate");
const User = require("../models/userModel");

// ✅ Create Evaluation
const createEvaluation = async (req, res) => {
  try {
    // Check if evaluation with same name exists
    const evalExist = await Evaluation.findOne({ name: req.body.name });
    if (evalExist) {
      return res.status(400).json({ err: "Evaluation already exists" });
    }

    // Create new evaluation
    const evaluation = new Evaluation({
      ...req.body,
      uuid: generate(),
      iid: req.user.IID,
      createdBy: req.user?._id || null, // middleware adds user
    });

    await evaluation.save();

    // ✅ Send mail notification to assigned examiners/moderators
    const assignedIds = [
      ...(req.body.examiners || []),
      ...(req.body.moderators || []),
    ];

    if (assignedIds.length > 0) {
      const assignedUsers = await User.find({
        _id: { $in: assignedIds },
      }).lean();

      for (const user of assignedUsers) {
        const email = user.Email || user.email;
        if (!email) continue; // skip if no email found

        const role = (req.body.examiners || []).includes(String(user._id))
          ? "Examiner"
          : "Moderator";

        const mailHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background-color: #f8fafc;
            margin: 0;
            padding: 0;
        }
        
        .email-wrapper {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        
        .email-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 32px 40px;
            text-align: center;
            color: white;
        }
        
        .email-logo {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 8px;
        }
        
        .email-tagline {
            opacity: 0.9;
            font-weight: 400;
        }
        
        .email-body {
            padding: 40px;
        }
        
        .greeting {
            font-size: 18px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 24px;
        }
        
        .assignment-card {
            background: #f8fafc;
            border-left: 4px solid #3b82f6;
            padding: 20px;
            border-radius: 8px;
            margin: 24px 0;
        }
        
        .assignment-title {
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 12px;
        }
        
        .assignment-detail {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .detail-label {
            font-weight: 500;
            color: #6b7280;
        }
        
        .detail-value {
            font-weight: 600;
            color: #1f2937;
        }
        
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white;
            padding: 14px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 15px;
            text-align: center;
            margin: 24px 0;
            transition: all 0.3s ease;
            box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
        }
        
        .cta-button:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(59, 130, 246, 0.4);
        }
        
        .evaluation-id {
            background: #1f2937;
            color: white;
            padding: 12px 16px;
            border-radius: 6px;
            font-family: 'Monaco', 'Consolas', monospace;
            font-size: 14px;
            text-align: center;
            margin: 20px 0;
            letter-spacing: 0.5px;
        }
        
        .footer {
            text-align: center;
            padding: 24px 40px;
            background: #f8fafc;
            color: #6b7280;
            font-size: 14px;
            border-top: 1px solid #e5e7eb;
        }
        
        .footer-links {
            margin: 16px 0;
        }
        
        .footer-link {
            color: #3b82f6;
            text-decoration: none;
            margin: 0 12px;
            font-size: 13px;
        }
        
        .copyright {
            font-size: 12px;
            opacity: 0.8;
            margin-top: 16px;
        }
        
        @media (max-width: 600px) {
            .email-body {
                padding: 24px;
            }
            
            .email-header {
                padding: 24px;
            }
            
            .assignment-detail {
                flex-direction: column;
                gap: 4px;
            }
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="email-header">
            <div class="email-logo">NEXA</div>
            <div class="email-tagline">Academic Evaluation Platform</div>
        </div>
        
        <div class="email-body">
            <div class="greeting">Dear ${
              user.FirstName || user.name || "Evaluator"
            },</div>
            
            <p>You have been assigned a new evaluation role in the NEXA platform. Please find the assignment details below:</p>
            
            <div class="assignment-card">
                <div class="assignment-title">Evaluation Assignment Details</div>
                <div class="assignment-detail">
                    <span class="detail-label">Your Role: </span>
                    <span class="detail-value">${role}</span>
                </div>
                <div class="assignment-detail">
                    <span class="detail-label">Evaluation Name: </span>
                    <span class="detail-value">${evaluation.name}</span>
                </div>
                <div class="assignment-detail">
                    <span class="detail-label">Assigned By: </span>
                    <span class="detail-value">${
                      req.user?.name || req.user?.email || "NEXA Administrator"
                    }</span>
                </div>
                <div class="assignment-detail">
                    <span class="detail-label">Assignment Date: </span>
                    <span class="detail-value">${new Date().toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}</span>
                </div>
            </div>
            
            <div class="evaluation-id">
                Evaluation ID: ${evaluation.uuid}
            </div>
            
            <p style="text-align: center; margin-bottom: 20px;">
                Please access the evaluation dashboard to begin your assessment:
            </p>
            
            <div style="text-align: center;">
                <a href="https://nexa.intelbuzz.in/evaluate" class="cta-button">
                    Access Evaluation Dashboard
                </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
                <strong>Note:</strong> Please ensure you complete the evaluation within the specified timeframe. 
                Contact the system administrator if you encounter any issues.
            </p>
        </div>
        
        <div class="footer">
            <div class="footer-links">
                <a href="https://nexa.intelbuzz.in" class="footer-link">Platform</a>
                <a href="https://nexa.intelbuzz.in/support" class="footer-link">Support</a>
                <a href="https://nexa.intelbuzz.in/help" class="footer-link">Help Center</a>
            </div>
            <div class="copyright">
                © ${new Date().getFullYear()} NEXA Evaluation Platform. All rights reserved.<br>
                This is an automated message. Please do not reply to this email.
            </div>
        </div>
    </div>
</body>
</html>
`;

        try {
          await sendMail(email, "New Evaluation Assigned", mailHTML);
          console.log(`📩 Mail sent to ${email}`);
        } catch (err) {
          console.error(`❌ Failed to send mail to ${email}:`, err.message);
        }
      }
    }

    // Respond with success
    res.status(201).json({
      success: true,
      evaluation,
    });
  } catch (error) {
    console.error("❌ createEvaluation error:", error);
    res.status(500).json({ err: error.message });
  }
};

// ✅ Edit Evaluation
const editEvaluation = async (req, res) => {
  try {
    const { uuid } = req.params;

    const evaluation = await Evaluation.findOneAndUpdate(
      { uuid },
      { ...req.body },
      { new: true }
    );

    if (!evaluation) {
      return res.status(404).json({ err: "Evaluation not found" });
    }

    res.status(200).json({ success: true, evaluation });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

// ✅ Update Status
const statusEvaluation = async (req, res) => {
  try {
    const { uuid } = req.params;
    const { status } = req.body;

    const evaluation = await Evaluation.findOneAndUpdate(
      { uuid },
      { status },
      { new: true }
    );

    if (!evaluation) {
      return res.status(404).json({ err: "Evaluation not found" });
    }

    res.status(200).json({ success: true, evaluation });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

// ✅ Assign Examiners / Moderators
const assignUsers = async (req, res) => {
  try {
    const { uuid } = req.params;
    const { examiners = [], moderators = [] } = req.body;

    const evaluation = await Evaluation.findOneAndUpdate(
      { uuid },
      {
        $addToSet: {
          examiners: { $each: examiners },
          moderators: { $each: moderators },
        },
      },
      { new: true }
    );

    if (!evaluation) {
      return res.status(404).json({ err: "Evaluation not found" });
    }

    // Collect all unique assigned user IDs
    const assignedUserIds = [...examiners, ...moderators];
    if (assignedUserIds.length > 0) {
      // Fetch user details (emails, names)
      const assignedUsers = await User.find({ _id: { $in: assignedUserIds } });

      // Send emails to all
      for (const user of assignedUsers) {
        const mailHTML = `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h2>Hi Evaluator,</h2>
            <p>You’ve been assigned to a new evaluation task on <b>NEXA - Evaluations</b>.</p>
            <p><b>Evaluation:</b> ${evaluation.name}</p>
            <p>Please login to your dashboard to review your assigned evaluation.</p>
            <br/>
            <p>Regards,<br/>NEXA Admin</p>
          </div>
        `;

        await sendMail(user.Email, "New Evaluation Assignment", mailHTML);
      }
    }

    res.status(200).json({ success: true, evaluation });
  } catch (error) {
    console.error("❌ Mail error:", error);
    res.status(500).json({ err: error.message });
  }
};

// ✅ Get Evaluations by Examiner
const getByExaminer = async (req, res) => {
  try {
    const { examinerId } = req.params;
    const evaluations = await Evaluation.find({ examiners: examinerId })
      .populate("sheets")
      .populate("moderators");

    res.status(200).json(evaluations);
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

// Get evaluation by uuid
const getEvaluationByUuid = async (req, res) => {
  try {
    const { uuid } = req.params;

    const evaluation = await Evaluation.findById(uuid)
      .populate("examiners", "FirstName LastName Email")
      .populate("moderators", "FirstName LastName Email")
      .populate("sheets"); // if you want to expand AnswerSheet docs instead of just assignmentIds

    if (!evaluation) {
      return res.status(404).json({ error: "Evaluation not found" });
    }

    res.status(200).json(evaluation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get Evaluations by Moderator
const getByModerator = async (req, res) => {
  try {
    const { moderatorId } = req.params;
    const evaluations = await Evaluation.find({ moderators: moderatorId })
      .populate("sheets")
      .populate("examiners");

    res.status(200).json(evaluations);
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

// ✅ Get Evaluations by Creator (Admin)
const getByCreator = async (req, res) => {
  try {
    const { creatorId } = req.params;
    const evaluations = await Evaluation.find({ createdBy: creatorId })
      .populate("sheets")
      .populate("examiners")
      .populate("moderators");

    res.status(200).json(evaluations);
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

// ✅ Delete Evaluation
const deleteEvaluation = async (req, res) => {
  try {
    const { uuid } = req.params;

    const evaluation = await Evaluation.findOneAndDelete({ uuid });

    if (!evaluation) {
      return res.status(404).json({ err: "Evaluation not found" });
    }

    res.status(200).json({ success: true, msg: "Evaluation deleted" });
  } catch (error) {
    res.status(500).json({ err: error.message });
  }
};

const status = async (req, res) => {
  try {
    const { uuid } = req.params; // this is assignmentId in your sheets
    const payload = req.body || {};

    // only allow these sheet fields to be updated
    const allowedFields = ["status", "isChecked", "marks", "attendance"];

    // build $set object dynamically for positional operator
    const setObj = {};
    for (const f of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(payload, f)) {
        setObj[`sheets.$.${f}`] = payload[f];
      }
    }

    if (Object.keys(setObj).length === 0) {
      return res.status(400).json({ err: "No valid sheet fields provided" });
    }

    // 1) Update the matched sheet
    const evaluation = await Evaluation.findOneAndUpdate(
      { "sheets.assignmentId": uuid }, // find evaluation containing the sheet
      { $set: setObj },
      { new: true } // return the updated document
    );

    if (!evaluation) {
      return res.status(404).json({ err: "Sheet / Evaluation not found" });
    }

    // 2) Recompute progress fields
    const total = evaluation.sheets.length;
    const checkedCount = evaluation.sheets.filter(
      (s) => String(s.isChecked).toLowerCase() === "evaluated"
    ).length;

    evaluation.progress.uploaded = total;
    evaluation.progress.checked = checkedCount;

    // 3) Update overall evaluation status
    // If none checked => Pending, some checked => In Progress, all checked => Completed
    if (checkedCount === 0) evaluation.status = "Pending";
    else if (checkedCount < total) evaluation.status = "In Progress";
    else evaluation.status = "Completed";

    // Save the evaluation (we mutated the doc above)
    await evaluation.save();

    // Extract the updated sheet to return (safe)
    const updatedSheet = evaluation.sheets.find((s) => s.assignmentId === uuid);

    return res.status(200).json({ evaluation, updatedSheet });
  } catch (error) {
    console.error("updateSheetStatus error:", error);
    return res.status(500).json({ err: "Internal Server Error" });
  }
};

const getAll = async (req, res) => {
  try {
    const evals = await Evaluation.find({ iid: req.user.IID });

    if (!evals) return res.status(500).json({ err: "No Evaluations found" });

    res.status(200).json(evals);
  } catch (error) {
    res.status(500).json({ err: "Internal Server Error" });
  }
};

module.exports = {
  createEvaluation,
  editEvaluation,
  statusEvaluation,
  assignUsers,
  getByExaminer,
  getByModerator,
  getByCreator,
  deleteEvaluation,
  getEvaluationByUuid,
  status,
  getAll,
};
