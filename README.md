# OSM

![GitHub stars](https://img.shields.io/github/stars/PaluskarAditya/OSM?style=for-the-badge&logo=github) ![GitHub forks](https://img.shields.io/github/forks/PaluskarAditya/OSM?style=for-the-badge&logo=github) ![GitHub issues](https://img.shields.io/github/issues/PaluskarAditya/OSM?style=for-the-badge&logo=github) ![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white) ![License](https://img.shields.io/badge/license-ISC-green?style=for-the-badge)

## 📑 Table of Contents

- [Description](#description)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Key Dependencies](#key-dependencies)
- [Run Commands](#run-commands)
- [Screenshots](#screenshots)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## 📝 Description

OSM is a sophisticated Online Screening and Evaluation platform engineered to streamline assessment workflows through a high-performance web interface. Built using the modern Next.js framework for a seamless frontend experience and powered by a robust Express.js backend, OSM provides a scalable solution for organizations to conduct evaluations efficiently. With its integrated API and responsive web capabilities, the platform offers a flexible environment for managing complex screening tasks with speed and reliability.

## ✨ Features

- 🌐 Api
- 🕸️ Web

## 🛠️ Tech Stack

- 🚀 Express.js

## ⚡ Quick Start

```bash

# Clone the repository
git clone https://github.com/PaluskarAditya/OSM.git

# Install dependencies
npm install

# Start development server
npm run start
```

## 📦 Key Dependencies

```
axios: ^1.12.2
bcryptjs: ^3.0.2
concurrently: ^9.2.1
cors: ^2.8.5
dotenv: ^17.2.2
esbuild: ^0.25.10
express: ^5.1.0
form-data: ^4.0.4
fs: ^0.0.1-security
jsonwebtoken: ^9.0.2
mongoose: ^8.18.1
mongoose-sequence: ^6.0.1
multer: ^1.4.4
multer-gridfs-storage: ^5.0.2
nodemailer: ^7.0.6
```

## 🚀 Run Commands

- **build**: `npm run build`
- **start**: `npm run start`
- **start:backend**: `npm run start:backend`
- **start:frontend**: `npm run start:frontend`
- **start:all**: `npm run start:all`

## 📸 Screenshots

> **Tip:** You can auto-generate a beautiful project mockup image using the **Screenshot** button above!

<p align="center">
  <img src="https://via.placeholder.com/800x400?text=Main+Application+View" alt="Main Application View" width="80%"/>
</p>

<p align="center">
  <img src="https://via.placeholder.com/800x400?text=Feature+Showcase" alt="Feature Showcase" width="80%"/>
</p>

## 📁 Project Structure

```
.
├── Dockerfile
├── backend
│   ├── Dockerfile
│   ├── api
│   │   ├── auth.rest
│   │   ├── course.rest
│   │   ├── degree.rest
│   │   ├── institute.rest
│   │   ├── qpKey.rest
│   │   ├── stream.rest
│   │   ├── subject.rest
│   │   ├── user.rest
│   │   └── year.rest
│   ├── backend
│   │   ├── blobs
│   │   │   └── sha256
│   │   │       ├── 0de821d16564893ff12fae9499550711d92157ed1e6705a8c7f7e63eac0a2bb9
│   │   │       ├── 290324672ee98715f89d4c8930d3e5f32a00d576b5f62717f7b8dcae866cf373
│   │   │       ├── 3b079de9b63ef4abc1dfb64263a71cd086178a63921abe11476c328fce1d7e50
│   │   │       ├── 4bbe60be55adbff2e4746728813f96e0d957915a1c29245b9471c657c1e7c448
│   │   │       ├── 6f18be994da8fa4e80a83605ce8836bbd6c8c2289db6ce9a9bc3a8dd53891240
│   │   │       ├── 8bf53e8a5ee5f91fc534eb80abef04d899acc3dc3e3865831063f98a65fa9549
│   │   │       ├── 9824c27679d3b27c5e1cb00a73adb6f4f8d556994111c12db3c5d61a0c843df8
│   │   │       ├── b33fb8a1c1c71341141a1a0c5fb315e666d7142a4cbcb5ca619c66cb03f1df51
│   │   │       ├── c2d0408d5405c4f1e88ad380b609d06781a3e7c5bb60d6bca85125d226b6e4ae
│   │   │       ├── c88300f8759af46375ccc157a0a0dbf7cdaeded52394b5ce2ce074e3b773fe82
│   │   │       ├── e46ed236d97dea550b613556f42da60e64e9d2e12325e395ebf0ab10f4872e5e
│   │   │       └── fd345d7e43c58474c833bee593321ab1097dd720bebd8032e75fbf5b81b1e554
│   │   ├── index.json
│   │   ├── manifest.json
│   │   └── oci-layout
│   ├── backend.tar
│   ├── certs
│   │   ├── ca_bundle.crt
│   │   ├── certificate.crt
│   │   └── private.key
│   ├── controllers
│   │   ├── academicyearController.js
│   │   ├── answerSheetController.js
│   │   ├── authController.js
│   │   ├── candidateController.js
│   │   ├── courseController.js
│   │   ├── degreeController.js
│   │   ├── evalController.js
│   │   ├── instituteController.js
│   │   ├── inwardController.js
│   │   ├── qpController.js
│   │   ├── qpKeyController.js
│   │   ├── reportController.js
│   │   ├── requestsController.js
│   │   ├── streamController.js
│   │   ├── subjectController.js
│   │   └── userController.js
│   ├── lib
│   │   ├── db.js
│   │   ├── fileSaver.js
│   │   ├── generate.js
│   │   ├── mail.js
│   │   ├── pageAppend.js
│   │   └── sync.js
│   ├── middlewares
│   │   └── authMiddleware.js
│   ├── models
│   │   ├── academicyearModel.js
│   │   ├── answerSheetModel.js
│   │   ├── candidateModel.js
│   │   ├── combinedModel.js
│   │   ├── courseModel.js
│   │   ├── degreeModel.js
│   │   ├── evalModel.js
│   │   ├── instituteModel.js
│   │   ├── inwardModel.js
│   │   ├── qpKeyModel.js
│   │   ├── qpModel.js
│   │   ├── reportModel.js
│   │   ├── requestModel.js
│   │   ├── streamModel.js
│   │   ├── subjectModel.js
│   │   └── userModel.js
│   ├── package.json
│   ├── public
│   │   └── .well-known
│   │       └── pki-validation
│   │           └── BB051497851EDFF7ED312F103C51DA97.txt
│   ├── routes
│   │   ├── academicyearRoutes.js
│   │   ├── answerSheetRoutes.js
│   │   ├── authRoutes.js
│   │   ├── candidateRoutes.js
│   │   ├── courseRoutes.js
│   │   ├── degreeRoutes.js
│   │   ├── evalRoutes.js
│   │   ├── instituteRoutes.js
│   │   ├── inwardRoutes.js
│   │   ├── qpKeyRoutes.js
│   │   ├── qpRoutes.js
│   │   ├── reportRoutes.js
│   │   ├── requestRoutes.js
│   │   ├── streamRoutes.js
│   │   ├── subjectRoutes.js
│   │   └── userRoutes.js
│   └── server.js
└── frontend
    ├── app
    │   ├── admin
    │   │   ├── academic-years
    │   │   │   └── page.jsx
    │   │   ├── answer-sheets
    │   │   │   ├── components
    │   │   │   │   └── EvaluatedsheetViewer.jsx
    │   │   │   ├── upload
    │   │   │   │   └── page.jsx
    │   │   │   └── view
    │   │   │       └── page.jsx
    │   │   ├── candidates
    │   │   │   ├── attendance
    │   │   │   │   └── page.jsx
    │   │   │   ├── data
    │   │   │   │   └── page.jsx
    │   │   │   └── subject
    │   │   │       └── page.jsx
    │   │   ├── components
    │   │   │   ├── AcademicCalendar.jsx
    │   │   │   ├── DashboardHeader.jsx
    │   │   │   ├── DashboardSkeleton.jsx
    │   │   │   ├── EvaluationDistributionChart.jsx
    │   │   │   ├── EvaluationProgress.jsx
    │   │   │   ├── PendingEvaluationsList.jsx
    │   │   │   └── StatsCards.jsx
    │   │   ├── courses
    │   │   │   └── page.jsx
    │   │   ├── degrees
    │   │   │   └── page.jsx
    │   │   ├── evaluation
    │   │   │   └── assign
    │   │   │       └── page.jsx
    │   │   ├── institute
    │   │   │   ├── observer-perms
    │   │   │   │   └── page.jsx
    │   │   │   ├── page.jsx
    │   │   │   └── requests
    │   │   │       └── page.jsx
    │   │   ├── inward
    │   │   │   └── configure
    │   │   │       └── page.jsx
    │   │   ├── layout.jsx
    │   │   ├── middleware.js
    │   │   ├── page.jsx
    │   │   ├── qp
    │   │   │   ├── create
    │   │   │   │   └── page.jsx
    │   │   │   ├── key
    │   │   │   │   └── page.jsx
    │   │   │   └── master
    │   │   │       └── page.jsx
    │   │   ├── reports
    │   │   │   └── view
    │   │   │       └── page.jsx
    │   │   ├── results
    │   │   │   └── view
    │   │   │       └── page.jsx
    │   │   ├── streams
    │   │   │   └── page.jsx
    │   │   └── subjects
    │   │       └── page.jsx
    │   ├── evaluate
    │   │   ├── home
    │   │   │   ├── check
    │   │   │   │   ├── [id]
    │   │   │   │   │   ├── [uuid]
    │   │   │   │   │   │   └── page.jsx
    │   │   │   │   │   └── page.jsx
    │   │   │   │   └── page.jsx
    │   │   │   ├── layouts.jsx
    │   │   │   └── page.jsx
    │   │   └── page.jsx
    │   ├── favicon.ico
    │   ├── globals.css
    │   ├── hooks
    │   │   └── dashboard
    │   │       ├── useDashboardData.js
    │   │       └── useDashboardStats.js
    │   ├── layout.tsx
    │   └── page.jsx
    ├── components
    │   └── ui
    │       ├── avatar.tsx
    │       ├── badge.tsx
    │       ├── button.tsx
    │       ├── calendar.tsx
    │       ├── card.tsx
    │       ├── chart.tsx
    │       ├── collapsible.tsx
    │       ├── dialog.tsx
    │       ├── dropdown-menu.tsx
    │       ├── input.tsx
    │       ├── label.tsx
    │       ├── popover.tsx
    │       ├── progress.tsx
    │       ├── resizable.tsx
    │       ├── scroll-area.tsx
    │       ├── select.tsx
    │       ├── separator.tsx
    │       ├── sheet.tsx
    │       ├── sidebar.tsx
    │       ├── skeleton.tsx
    │       ├── switch.tsx
    │       ├── table.tsx
    │       ├── tabs.tsx
    │       └── tooltip.tsx
    ├── components.json
    ├── eslint.config.mjs
    ├── hooks
    │   └── use-mobile.ts
    ├── lib
    │   ├── ROUTES.js
    │   ├── routeMap.js
    │   └── utils.ts
    ├── middleware.js
    ├── next.config.ts
    ├── package.json
    ├── postcss.config.mjs
    ├── public
    │   ├── bg.jpg
    │   ├── eval-bg.jpg
    │   ├── file.svg
    │   ├── globe.svg
    │   ├── next.svg
    │   ├── vercel.svg
    │   └── window.svg
    └── tsconfig.json
```

## 👥 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/PaluskarAditya/OSM.git`
3. **Create** a new branch: `git checkout -b feature/your-feature`
4. **Commit** your changes: `git commit -am 'Add some feature'`
5. **Push** to your branch: `git push origin feature/your-feature`
6. **Open** a pull request

Please ensure your code follows the project's style guidelines and includes tests where applicable.

## 📜 License

This project is licensed under the ISC License.

---
*This README was generated with ❤️ by [ReadmeBuddy](https://readmebuddy.com)*
