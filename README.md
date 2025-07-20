# OSM (Online Subject Management) 🎓

A full-stack web application for comprehensive academic management in educational institutions, featuring subject organization, course tracking, and question paper management.

![Project Banner](https://placehold.co/1200x400/4f46e5/white?text=Online+Subject+Management) 
*(Consider adding actual screenshots or demo GIF here)*

## ✨ Key Features

### 📚 Academic Management
| Feature                | Description                                                                 |
|------------------------|-----------------------------------------------------------------------------|
| **Subject Management** | Create, edit, and organize subjects with codes, credits, and exam schedules|
| **Course Hierarchy**   | Manage courses with streams, specializations, and semester-wise organization|
| **Question Papers**    | Associate question papers with subjects, filter by year and exam type      |
| **Academic Calendar**  | Track academic years, semesters, and important examination dates           |

### 🚀 Advanced Functionality
- **Bulk Operations**: Import/export data via Excel for quick updates
- **Status Tracking**: Toggle active/inactive status for all academic entities
- **Smart Search**: Find subjects/courses with filters, keywords, and facets
- **Data Relationships**: Visualize connections between courses, subjects, and papers

### 🎨 User Experience
- Modern responsive interface with dark/light mode
- Interactive data tables with sorting and pagination
- Real-time updates and intuitive form validation
- Role-based access control (Admin/Faculty/Student views)

## 🛠 Tech Stack

### Frontend
| Technology       | Purpose                                |
|------------------|----------------------------------------|
| Next.js 14+      | React framework with App Router        |
| TypeScript       | Type-safe development                  |
| Shadcn/ui        | Beautiful, accessible UI components    |
| Tailwind CSS     | Utility-first styling                  |
| TanStack Table   | Powerful data tables                   |
| Zod              | Form validation                        |

### Backend
| Technology       | Purpose                                |
|------------------|----------------------------------------|
| Node.js          | JavaScript runtime                    |
| Express.js       | Web application framework             |
| MongoDB          | NoSQL database                        |
| Mongoose         | ODM for MongoDB                       |
| JWT              | Authentication                        |
| ExcelJS          | Excel import/export functionality     |

## 📂 Project Structure

```bash
OSM/
├── backend/                # Backend services
│   ├── config/            # Configuration files
│   ├── controllers/       # Route controllers
│   ├── middlewares/       # Express middlewares
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API endpoints
│   ├── services/          # Business logic
│   ├── utils/             # Helper functions
│   └── server.js          # Server entry point
│
└── frontend/              # Next.js application
    ├── app/               # App router
    │   ├── (admin)/       # Admin dashboard
    │   ├── (auth)/        # Authentication
    │   └── api/           # API routes
    ├── components/        # Reusable components
    ├── lib/               # Utilities/config
    ├── styles/            # Global styles
    └── types/             # TypeScript types
```

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account or local instance
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/PaluskarAditya/OSM.git
   cd OSM
   ```

2. **Set up backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Update .env with your MongoDB URI and other settings
   ```

3. **Set up frontend**
   ```bash
   cd ../frontend
   npm install
   cp .env.example .env.local
   # Configure environment variables
   ```

4. **Run the application**
   ```bash
   # In backend directory:
   npm run dev
   
   # In frontend directory:
   npm run dev
   ```

5. **Access the app**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

For major changes, please open an issue first to discuss what you'd like to change.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📧 Contact

Aditya Paluskar - [@yourTwitter](https://twitter.com/yourTwitter) - your-email@example.com

Project Link: [https://github.com/PaluskarAditya/OSM](https://github.com/PaluskarAditya/OSM)

---

Made with ❤️ by [Aditya Paluskar](https://github.com/PaluskarAditya) and contributors!
```