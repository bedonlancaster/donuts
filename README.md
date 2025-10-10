# DONUTS 🍩

**Music Producer's One-Stop Collaboration Platform**

A full-stack web application that revolutionizes how music producers and artists collaborate on projects. DONUTS provides an intuitive platform for sharing mixes, scheduling sessions, and managing project workflows - all with a delightful donut-themed interface.

## 🎯 Problem Solved

Music producers and artists need a streamlined way to:
- Share and collaborate on musical projects ("donuts" 🎵)
- Upload and manage track versions with client feedback
- Schedule recording sessions efficiently
- Track project progress with organized hit lists
- Visualize album artwork and track ordering

## 🎵 Key Features

### MVP Features
- **🔐 User Authentication** - Separate producer and artist accounts
- **🍩 Project Management** - Create and manage musical projects (donuts)
- **🎧 Track Upload & Management** - Audio file handling with version control
- **📝 Hit List System** - Task management for each track and project
- **📅 Session Booking** - Artists can schedule sessions with producers
- **🎨 Customizable Themes** - Artists can personalize project colors
- **↕️ Drag & Drop Ordering** - Intuitive track arrangement

### Stretch Goals
- **📊 Project-Wide Hit Lists** - Global task management across tracks
- **🔔 Real-time Notifications** - Live updates for collaborators
- **📈 Analytics Dashboard** - Project progress tracking
- **🎤 Audio Preview** - In-browser track playback

## 🛠️ Tech Stack

### Backend
- **C#/.NET 8** - Robust API development
- **Entity Framework Core** - Database ORM
- **ASP.NET Identity** - User authentication & authorization
- **SQL Server** - Relational database
- **SignalR** *(future)* - Real-time communication

### Frontend
- **React 18** - Component-based UI
- **JavaScript/TypeScript** - Modern development
- **CSS3/Flexbox** - Responsive design
- **Bootstrap** *(optional)* - UI framework

### Development
- **Visual Studio Code** - Primary IDE
- **Git/GitHub** - Version control
- **Localhost Development** - Initial deployment target

## 📊 Database Design

### Entity Relationship Diagram
**[View Interactive ERD →](https://dbdiagram.io/d/68e9308dd2b621e4224757d1)**

Key relationships:
- **Users ↔ Projects** (Many-to-Many via ProjectCollaborators)
- **Producers ↔ Artists** (Many-to-Many via ProducerArtistCollaborations) 
- **Users ↔ Sessions** (Many-to-Many via SessionAttendees)
- **Projects → Tracks** (One-to-Many)
- **Tracks → HitListItems** (One-to-Many)

## 🎨 User Experience

### Interactive Wireframes
**[View Live Demo →](./DONUTS_wireframes.html)**

The wireframe demo showcases:
- Complete user authentication flow
- Producer and artist dashboard experiences
- Project creation and collaboration workflows
- Track management and hit list functionality
- Session booking interface
- Mobile-responsive design patterns

## 👥 User Stories

### Core MVP Stories

**As a Producer:**
- I can register and create a producer account
- I can create new projects and invite artists to collaborate
- I can upload tracks to projects and organize them
- I can manage hit lists for tracks and overall projects
- I can accept session bookings from artists

**As an Artist:**
- I can register and create an artist account  
- I can collaborate on projects I'm invited to
- I can customize project themes and colors (donut aesthetics)
- I can reorder tracks within projects
- I can add/edit/delete hit list items for tracks
- I can book recording sessions with producers

### Authentication & Authorization
- Only authenticated users can access the application
- Users can only edit their own data and shared projects
- Role-based permissions via collaboration relationships

## 🏗️ Project Structure

```
donuts/
├── donutAPI/              # C#/.NET Backend API
│   ├── Controllers/       # API endpoints
│   ├── Models/           # Entity Framework models
│   ├── Data/             # Database context & migrations
│   ├── Services/         # Business logic
│   └── Program.cs        # Application entry point
├── donutClient/          # React Frontend
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Route-based page components
│   │   ├── services/     # API integration
│   │   └── App.js        # Main application component
│   └── public/           # Static assets
├── docs/                 # Documentation & design files
│   ├── DONUTS_ERD.md    # Database design documentation
│   ├── DONUTS_Wireframes.md # UI/UX design specifications
│   ├── DONUTS_DataModels.md # C# model implementations
│   └── DONUTS_dbdiagram.dbml # Database diagram source
└── README.md            # This file
```

## 🚀 Getting Started

### Prerequisites
- **.NET 8 SDK** - [Download here](https://dotnet.microsoft.com/download)
- **Node.js 18+** - [Download here](https://nodejs.org/)
- **SQL Server** or **SQL Server Express** - [Download here](https://www.microsoft.com/en-us/sql-server/sql-server-downloads)
- **Visual Studio Code** - [Download here](https://code.visualstudio.com/)

### Backend Setup (donutAPI)
```bash
cd donutAPI
dotnet restore
dotnet ef database update
dotnet run
```
API will be available at `https://localhost:7001`

### Frontend Setup (donutClient)  
```bash
cd donutClient
npm install
npm start
```
React app will be available at `http://localhost:3000`

## 📋 Development Roadmap

### Phase 1: Core MVP ✅
- [x] Database design & ERD
- [x] Wireframes & user experience design
- [x] Project documentation & repository setup
- [ ] Backend API development
- [ ] Frontend React application
- [ ] User authentication system
- [ ] Basic CRUD operations

### Phase 2: Enhanced Features
- [ ] File upload functionality
- [ ] Real-time collaboration
- [ ] Session scheduling system
- [ ] Advanced UI/UX polish

### Phase 3: Production Ready
- [ ] Deployment pipeline
- [ ] Performance optimization
- [ ] Security hardening
- [ ] User testing & feedback

## 🎨 Design Philosophy

**DONUTS** embraces a playful yet professional approach to music collaboration:

- **🍩 Donut Metaphor** - Projects are "donuts" (like vinyl records), creating an engaging visual identity
- **🎨 Artist Empowerment** - Artists can customize project aesthetics and contribute creatively
- **📱 Mobile-First** - Responsive design ensures accessibility across all devices
- **⚡ Intuitive Workflow** - Streamlined processes that don't interrupt creative flow

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

This is a capstone project, but feedback and suggestions are welcome! Please open an issue to discuss any changes.

---

**Built with ❤️ for the music community**  
*Making collaboration as sweet as donuts* 🍩🎵