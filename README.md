# DONUTS

**A Musical Artist and Producer's One-Stop Collaboration Platform**

A full-stack web application that revolutionizes how music producers and artists collaborate on projects. DONUTS provides an intuitive platform for sharing mixes, creating actionable tickets for note-taking, and managing project workflows - all with a streamlined aesthetic and interface that is customizable per-project.

---

## Problem Solved
I am a music producer/artist who, like many others, need a better way to share and listen to mixes for the albums I am working on with people. Most of all, I desperately need an application that takes the clunky nature of note-taking/ project management, and builds a boutique interface that is specifically designed for both artists and producers. Working on a record can feel incredibly overwhelming to all parties involved, and it can even feel like you are standing in a field of tall grass, randomly hacking to find your way out. DONUTS helps you undertand the task at hand, so you can focus, put your head down, and simply mow the grass, one actionable step at a time.

I have been using it on my new album that I am tracking, producing, and mixing myself, and I have found it already to be a complete life-saver. I plan to continue working on this platform, so I can share it with other artists and producers. Hopefully, if I find this incredibly useful, others will too, and at the end of the day, more records could be created and released into the world during our lifetime. That is the dream.

I believe this platform has an deep opportunity for continuous iteration and growth.

---

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
- Real-time Notifications - Live updates for collaborators
- Analytics Dashboard - Project progress tracking
- Scheduling platform Integration
- Large File Sharing Integration

---

## Tech Stack

### Backend
- **C#/.NET 8** - Robust API development
- **Entity Framework Core** - Database ORM
- **ASP.NET Identity** - User authentication & authorization
- **PostgreSQL** - Relational database
- **SignalR** (future) - Real-time communication

### Frontend
- **React 18** - Component-based UI
- **Vite** - Next generation frontend tooling
- **React Router** - Client-side routing
- **CSS3/Flexbox** - Responsive design
- **dnd-kit** - Drag and drop functionality

### Development
- **Visual Studio Code** - Primary IDE
- **Git/GitHub** - Version control
- **Localhost Development** - Initial deployment target

---
## Database Design
Key relationships:

- Users ↔ Projects (Many-to-Many via ProjectCollaborators)
- Producers ↔ Artists (Many-to-Many via ProducerArtistCollaborations)
- Users ↔ Sessions (Many-to-Many via SessionAttendees)
- Projects → Tracks (One-to-Many)
- Tracks → HitListItems (One-to-Many)

---

## Getting Started

Follow these steps to run DONUTS locally on your machine.

### Prerequisites

Before you begin, ensure you have the following installed:

1. **[.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)** (Required for backend)
   - Verify installation: `dotnet --version` (should show 8.x.x)

2. **[Node.js 18+](https://nodejs.org/)** (Required for frontend)
   - Verify installation: `node --version` (should show 18.x.x or higher)
   - npm comes bundled with Node.js

3. **[PostgreSQL](https://www.postgresql.org/download/)** (Database)
   - Download PostgreSQL 14+ for your operating system
   - During installation, remember your superuser password
   - Default port is 5432

4. **[Visual Studio Code](https://code.visualstudio.com/)** (Recommended IDE)
   - Optional but highly recommended

### Step 1: Clone the Repository

```bash
git clone https://github.com/bedonlancaster/donuts.git
cd donuts
```

### Step 2: Database Setup

#### A. Install and Start PostgreSQL

**macOS (using Homebrew):**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Windows:**
- Use the PostgreSQL installer from [postgresql.org](https://www.postgresql.org/download/windows/)
- Start PostgreSQL service from Services app

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### B. Create the Database

```bash
# Connect to PostgreSQL (default user is 'postgres')
psql -U postgres

# In the PostgreSQL prompt, create the database:
CREATE DATABASE donuts_db;

# Exit PostgreSQL prompt
\q
```

#### C. Configure Database Connection

Edit `donutAPI/appsettings.json` and update the connection string with your PostgreSQL credentials:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=donuts_db;Username=postgres;Password=YOUR_PASSWORD_HERE"
  }
}
```

Replace `YOUR_PASSWORD_HERE` with your PostgreSQL password.

### Step 3: Backend Setup (C#/.NET API)

```bash
# Navigate to the API directory
cd donutAPI

# Restore NuGet packages
dotnet restore

# Apply database migrations (creates tables)
dotnet ef database update

# Run the API
dotnet run
```

The API should now be running at `http://localhost:5000`

You should see output similar to:
```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5000
```

**Troubleshooting Backend:**
- If `dotnet ef` command not found, install it globally:
  ```bash
  dotnet tool install --global dotnet-ef
  ```
- If database connection fails, verify PostgreSQL is running and credentials are correct
- Check that port 5000 is not already in use

### Step 4: Frontend Setup (React)

Open a **new terminal window** (keep the backend running), then:

```bash
# Navigate to the client directory
cd donutClient

# Install npm dependencies
npm install

# Start the development server
npm run dev
```

The React app should automatically open in your browser at `http://localhost:3000`

**Troubleshooting Frontend:**
- If port 3000 is in use, Vite will prompt you to use an alternative port
- Clear npm cache if installation fails: `npm cache clean --force`
- Node version issues? Use [nvm](https://github.com/nvm-sh/nvm) to manage Node versions

### Step 5: Create Your First Account

1. Open your browser to `http://localhost:3000`
2. Click "Sign Up" to create a new account
3. Choose either **Producer** or **Artist** role
4. Fill in your details and create an account
5. You'll be automatically logged in and redirected to your dashboard

### Step 6: Start Creating!

**As a Producer:**
- Click "Create New DONUT" to start a project
- Customize the theme and add collaborators
- Upload tracks and manage your projects

**As an Artist:**
- View projects you've been invited to
- Upload your own tracks
- Create hit list items for feedback and tasks

---

## Configuration & Tips

### Default Ports

| Service | Port | URL |
|---------|------|-----|
| Backend API | 5000 | http://localhost:5000 |
| Frontend React | 3000 | http://localhost:3000 |
| PostgreSQL | 5432 | localhost:5432 |

### Running Both Servers

You need **two terminal windows** running simultaneously:

**Terminal 1 (Backend):**
```bash
cd donutAPI
dotnet run
```

**Terminal 2 (Frontend):**
```bash
cd donutClient
npm run dev
```

### Stopping the Application

- Press `Ctrl + C` in each terminal window to stop the servers
- PostgreSQL will continue running in the background (which is fine)

### Quick Start Script (Optional)

Create a script to start both servers at once:

**macOS/Linux** (`start.sh`):
```bash
#!/bin/bash
cd donutAPI && dotnet run &
cd donutClient && npm run dev
```

**Windows** (`start.bat`):
```batch
start cmd /k "cd donutAPI && dotnet run"
start cmd /k "cd donutClient && npm run dev"
```

### Database Management

**View database structure:**
```bash
psql -U postgres -d donuts_db
\dt  # List all tables
\d+ Users  # Describe Users table
```

**Reset database (if needed):**
```bash
cd donutAPI
dotnet ef database drop
dotnet ef database update
```

**Warning:** This will delete all data!

---

## License
This project is licensed under the MIT License - see the LICENSE file for details.

Contributing
If you happen to be interested in this platform, reach out to me via email bedonlancaster@gmail.com

Make Records. DONUTS.