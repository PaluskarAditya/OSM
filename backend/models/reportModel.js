const mongoose = require('mongoose');

const ResultSchema = new mongoose.Schema({
  examinerName: { type: String,  },
  email: { type: String, },
  course: { type: String,  },
  semester: { type: Number,  },
  subject: { type: String,  },
  date: { type: String,  },
  mobile: { type: String,  },
  examDate: { type: String,  },
  assignedDatetime: { type: String, },
  evaluationLastDate: { type: String,},
  totalCount: { type: Number,  },
  presentCount: { type: Number,  },
  absentCount: { type: Number,  },
  uploadCount: { type: Number,  },
  totalCheckCount: { type: Number },
  selectedDateCheckCount: { type: Number,},
  IID: { type: String, required: true },
  status: { type: String, required: true },
  evaluationId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Evaluation",
  unique: true, // VERY IMPORTANT
  required: true
}
})

const Result = mongoose.model('Result', ResultSchema);

module.exports = Result;