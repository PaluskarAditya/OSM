const ROUTES = [
    // ===== EXAMS → SUBJECTS =====
    {
      key: "admin.streams",
      route: "/admin/exams/subjects/streams",
      title: "Streams",
      category: "Exams / Subjects",
      description: "Manage academic streams",
    },
    {
      key: "admin.degrees",
      route: "/admin/exams/subjects/degrees",
      title: "Degrees",
      category: "Exams / Subjects",
      description: "Manage degrees",
    },
    {
      key: "admin.academic-years",
      route: "/admin/exams/subjects/academic-years",
      title: "Academic Years",
      category: "Exams / Subjects",
      description: "Manage academic years",
    },
    {
      key: "admin.courses",
      route: "/admin/exams/subjects/courses",
      title: "Courses",
      category: "Exams / Subjects",
      description: "Manage courses",
    },
    {
      key: "admin.specializations",
      route: "/admin/exams/subjects/specializations",
      title: "Specializations",
      category: "Exams / Subjects",
      description: "Manage course specializations",
    },
    {
      key: "admin.subjects",
      route: "/admin/exams/subjects",
      title: "Subjects",
      category: "Exams / Subjects",
      description: "Manage subjects",
    },

    // ===== EXAMS → QUESTION PAPER =====
    {
      key: "admin.qp.create",
      route: "/admin/exams/question-paper/create",
      title: "Create Question Paper",
      category: "Exams / Question Paper",
      description: "Create new question papers",
    },
    {
      key: "admin.qp.pdf",
      route: "/admin/exams/question-paper/pdf-key",
      title: "PDF / Key",
      category: "Exams / Question Paper",
      description: "Upload or view PDF and answer keys",
    },
    {
      key: "admin.qp.manage",
      route: "/admin/exams/question-paper/manage",
      title: "Manage Question Papers",
      category: "Exams / Question Paper",
      description: "Manage existing question papers",
    },

    // ===== INWARDS / OUTWARDS =====
    {
      key: "admin.inward.configure",
      route: "/admin/inward/configure",
      title: "Inward Configurations",
      category: "Inwards / Outwards",
      description: "Configure inward and outward flows",
    },

    // ===== CANDIDATES =====
    {
      key: "admin.candidates.data",
      route: "/admin/candidates/data",
      title: "Candidates Data",
      category: "Candidates",
      description: "View and manage candidate records",
    },
    {
      key: "admin.candidates.attendance",
      route: "/admin/candidates/attendance",
      title: "Candidates Attendance",
      category: "Candidates",
      description: "Track candidate attendance",
    },
    {
      key: "admin.candidates.assign-subject",
      route: "/admin/candidates/assign-subject",
      title: "Assign Subject",
      category: "Candidates",
      description: "Assign subjects to candidates",
    },
    {
      key: "admin.candidates.assign-exam",
      route: "/admin/candidates/assign-exam",
      title: "Assign Exam",
      category: "Candidates",
      description: "Assign exams to candidates",
    },

    // ===== ANSWER SHEETS =====
    {
      key: "admin.answers.upload",
      route: "/admin/answer-sheets/upload",
      title: "Upload Answer Sheets",
      category: "Answer Sheets",
      description: "Upload candidate answer sheets",
    },
    {
      key: "admin.answers.view",
      route: "/admin/answer-sheets/view",
      title: "View Answer Sheets",
      category: "Answer Sheets",
      description: "View uploaded answer sheets",
    },

    // ===== EVALUATION =====
    {
      key: "admin.evaluation.assign",
      route: "/admin/evaluation/assign-examiners",
      title: "Assign Examiners",
      category: "Evaluation",
      description: "Assign examiners for evaluation",
    },

    // ===== RESULTS =====
    {
      key: "admin.results.view",
      route: "/admin/results",
      title: "View Evaluation Results",
      category: "Results",
      description: "View final evaluation results",
    },

    // ===== REPORTS =====
    {
      key: "admin.reports.view",
      route: "/admin/reports",
      title: "View Reports",
      category: "Reports",
      description: "View and generate reports",
    },
  ];

  module.exports = ROUTES;