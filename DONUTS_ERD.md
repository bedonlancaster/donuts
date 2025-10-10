# DONUTS - Entity Relationship Diagram
*Music Producer's Collaboration Platform - MVP Requirements*

## Overview
This ERD supports the DONUTS application MVP requirements with proper user authentication, producer-artist collaboration, project management, and session booking.

## Core Entities

### Users
- **UserId** (PK, Guid)
- **Email** (Unique, String, Required)
- **Username** (Unique, String, Required)
- **PasswordHash** (String, Required)
- **FirstName** (String, Required)
- **LastName** (String, Required)
- **UserType** (Enum: Producer, Artist, Required)
- **ProfileImageUrl** (String, nullable)
- **Bio** (Text, nullable)
- **CreatedAt** (DateTime, Required)
- **UpdatedAt** (DateTime, Required)
- **IsActive** (Boolean, Default: true)

### Projects (Donuts)
- **ProjectId** (PK, Guid)
- **Title** (String, Required)
- **Description** (Text, nullable)
- **ArtworkUrl** (String, nullable)
- **ColorTheme** (String, Default: "#FF6B9D") // Donut color that artists can change
- **CreatedById** (FK, Guid, References Users - Producer who created)
- **Status** (Enum: Active, Completed, Archived, Default: Active)
- **TrackOrder** (JSON Array of TrackIds for drag-and-drop ordering)
- **CreatedAt** (DateTime, Required)
- **UpdatedAt** (DateTime, Required)
- **IsActive** (Boolean, Default: true)

### Tracks
- **TrackId** (PK, Guid)
- **ProjectId** (FK, Guid, References Projects, Required)
- **Title** (String, Required)
- **FileUrl** (String, nullable) // Audio file location after upload
- **FileType** (String, nullable) // MP3, WAV, etc.
- **Duration** (TimeSpan, nullable)
- **OrderIndex** (Integer, Required) // For track ordering within project
- **UploadedById** (FK, Guid, References Users, Required)
- **Status** (Enum: Demo, InProgress, Review, Final, Default: Demo)
- **CreatedAt** (DateTime, Required)
- **UpdatedAt** (DateTime, Required)
- **IsActive** (Boolean, Default: true)

### HitListItems
- **HitListItemId** (PK, Guid)
- **TrackId** (FK, Guid, References Tracks, Required) // MVP: Per-track hit lists
- **ProjectId** (FK, Guid, References Projects, nullable) // STRETCH: Project-wide hit lists
- **CreatedById** (FK, Guid, References Users, Required)
- **Title** (String, Required)
- **Description** (Text, nullable)
- **Priority** (Enum: Low, Medium, High, Critical, Default: Medium)
- **Status** (Enum: Todo, InProgress, Complete, Default: Todo)
- **DueDate** (DateTime, nullable)
- **CreatedAt** (DateTime, Required)
- **UpdatedAt** (DateTime, Required)
- **CompletedAt** (DateTime, nullable)
- **IsActive** (Boolean, Default: true)

### Sessions
- **SessionId** (PK, Guid)
- **ProducerId** (FK, Guid, References Users, Required) // Producer for the session
- **ArtistId** (FK, Guid, References Users, Required) // Artist booking the session
- **ProjectId** (FK, Guid, References Projects, nullable) // Can be project-specific or general
- **Title** (String, Required)
- **Description** (Text, nullable)
- **ScheduledDate** (DateTime, Required)
- **Duration** (TimeSpan, Required)
- **Location** (String, nullable)
- **Status** (Enum: Scheduled, InProgress, Completed, Cancelled, Default: Scheduled)
- **BookedById** (FK, Guid, References Users, Required) // Who initiated the booking (Artist or Producer)
- **CreatedAt** (DateTime, Required)
- **UpdatedAt** (DateTime, Required)

## Relationship Tables (Many-to-Many)

### ProducerArtistCollaborations
- **CollaborationId** (PK, Guid)
- **ProducerId** (FK, Guid, References Users, Required)
- **ArtistId** (FK, Guid, References Users, Required)
- **Status** (Enum: Active, Inactive, Pending, Default: Active)
- **StartedAt** (DateTime, Required)
- **EndedAt** (DateTime, nullable)
- **CreatedAt** (DateTime, Required)

### ProjectCollaborators
- **ProjectCollaboratorId** (PK, Guid)
- **ProjectId** (FK, Guid, References Projects, Required)
- **UserId** (FK, Guid, References Users, Required)
- **Role** (Enum: Owner, Collaborator, Default: Collaborator)
- **CanEditTracks** (Boolean, Default: true)
- **CanEditHitList** (Boolean, Default: true)
- **CanReorderTracks** (Boolean, Default: true)
- **CanChangeTheme** (Boolean, Default: false) // Artists can change donut colors
- **InvitedAt** (DateTime, Required)
- **AcceptedAt** (DateTime, nullable)
- **InvitedById** (FK, Guid, References Users, Required)

### SessionAttendees
- **SessionAttendeeId** (PK, Guid)
- **SessionId** (FK, Guid, References Sessions, Required)
- **UserId** (FK, Guid, References Users, Required)
- **Role** (Enum: Producer, Artist, Guest, Required)
- **Status** (Enum: Invited, Confirmed, Declined, NoShow, Default: Invited)
- **InvitedAt** (DateTime, Required)
- **ResponseAt** (DateTime, nullable)
- **InvitedById** (FK, Guid, References Users, Required)

## Key Relationships

### One-to-Many Relationships ✅
1. **Users → Projects**: One user (producer) can create many projects
2. **Projects → Tracks**: One project contains many tracks  
3. **Tracks → HitListItems**: One track can have many hit list items
4. **Users → HitListItems**: One user can create many hit list items
5. **Users → Sessions**: One user can book/attend many sessions

### Many-to-Many Relationships ✅
1. **Producers ↔ Artists** (via ProducerArtistCollaborations):
   - Producers can work with multiple artists
   - Artists can work with multiple producers
   
2. **Users ↔ Projects** (via ProjectCollaborators):
   - Users can collaborate on multiple projects  
   - Projects can have multiple collaborators (producer + artists)

3. **Users ↔ Sessions** (via SessionAttendees):
   - Users can attend multiple sessions
   - Sessions can have multiple attendees (producer + artists + guests)

## MVP User Stories Mapping

### Authentication & User Management
- **User Registration**: Creates User record with UserType (Producer/Artist)
- **Producer Landing**: Shows projects owned/collaborated on

### Project Management (Core MVP)
1. **Create New Project**: Producer creates Project → ProjectCollaborators (owner)
2. **Link Artist**: Creates ProjectCollaborators record for artist 
3. **Upload Track**: Creates Track record linked to project
4. **Manage Hit Lists**: CRUD operations on HitListItems per track
5. **Reorder Tracks**: Updates TrackOrder JSON in Projects table
6. **Change Donut Color**: Artists update ColorTheme in Projects

### Session Booking (MVP)
- **Book Session**: Artist creates Session record linking to producer
- **Calendar Integration**: Sessions tracked with ScheduledDate/Duration
- **Notifications**: Both parties notified via Status updates

## Business Rules & Constraints

### User Authentication & Authorization
- Only authenticated users can access application
- Producers can create projects and invite artists  
- Artists can be invited to collaborate on projects
- Role-based permissions via ProjectCollaborators table

### Project Collaboration
- Project creator becomes owner automatically
- Artists can change project donut colors (ColorTheme field)
- Both producers and artists can create/edit hit list items
- Track ordering maintained via drag-and-drop JSON array

### Session Management  
- Artists book sessions with producers they collaborate with
- Sessions can be project-specific or general collaboration
- Session status tracks lifecycle (Scheduled → Completed)

### Data Ownership & Security
- Users can only edit their own data and projects they collaborate on
- Project access controlled via ProjectCollaborators relationships
- Hit list items tied to specific users for accountability

## Technical Implementation Notes
- **C#/.NET Backend**: Entity Framework Core with proper foreign keys
- **React Frontend**: Component-based architecture with proper routing
- **File Upload**: Audio files stored with URLs in Tracks table
- **Real-time Updates**: Consider SignalR for session notifications
- **Authentication**: ASP.NET Identity Framework for user management