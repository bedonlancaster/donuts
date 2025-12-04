# DONUTS 

**A Musical Artist and Producer's One-Stop Collaboration Platform**

A full-stack web application that revolutionizes how music producers and artists collaborate on projects. DONUTS provides an intuitive platform for sharing mixes, creating actionable tickets for note-taking, and managing project workflows - all with a streamlined aesthetic and interface that is customizable per-project.

## Problem Solved

I am a music producer/artist who, like many others, need a better way to share and listen to mixes for the albums I am working on with people. Most of all, I desperately need an application that takes the clunky nature of note-taking/ project management, and builds a boutique interface that is specifically designed for both artists and producers. Working on a record can feel incredibly overwhelming to all parties involved, and it can even feel like you are standing in a field of tall grass, randomly hacking to find your way out. DONUTS helps you undertand the task at hand, so you can focus, put your head down, and simply mow the grass, one actionable step at a time. 

I have been using it on my new album that I am tracking, producing, and mixing myself, and I have found it already to be a complete life-saver. I plan to continue working on this platform, so I can share it with other artists and producers. Hopefully, if I find this incredibly useful, others will too, and at the end of the day, more records could be created and released into the world during our lifetime. That is the dream. 

I believe this platform has an deep opportunity for continuous iteration and growth. 

## Key Features

### MVP Features
- **User Authentication** - Separate producer and artist accounts
- **Project Management** - Create and manage musical projects (donuts)
- **Track Upload & Management** - Audio file handling with version control
- **Hit List System** - Task management for each track and project
- **Customizable Themes** - Artists can personalize project colors
- **Drag & Drop Ordering** - Intuitive track arrangement
- **Audio Player** - In-browser playback that persists between navigations

### Stretch Goals
- **Real-time Notifications** - Live updates for collaborators
- **Analytics Dashboard** - Project progress tracking
- **Scheduling platform Integration**
- **Large File Sharing Integration**

## Tech Stack

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

## Database Design


Key relationships:
- **Users ↔ Projects** (Many-to-Many via ProjectCollaborators)
- **Producers ↔ Artists** (Many-to-Many via ProducerArtistCollaborations) 
- **Users ↔ Sessions** (Many-to-Many via SessionAttendees)
- **Projects → Tracks** (One-to-Many)
- **Tracks → HitListItems** (One-to-Many)



## Getting Started

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
API will be available at `https://localhost:5000`

### Frontend Setup (donutClient)  
```bash
cd donutClient
npm install
npm start
```
React app will be available at `http://localhost:3000`

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

If you happen to be interested in this platform, reach out to me via email bedonlancaster@gmail.com

---

Make Records. DONUTS. 
