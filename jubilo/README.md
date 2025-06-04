# Events Feature

## Core Features

### Event Creation & Management

- [ ] Create Event
  - [ ] Title
  - [ ] Description (HTML support)
  - [ ] Date & Time picker
  - [ ] Location (Google Maps/Places integration)
  - [ ] Cover image upload
  - [ ] Privacy toggle (Public/Private)
  - [ ] Category selection (Party, Meeting, Sports, Music, Food, Festival, Wedding, Reunion, Other)
  - [ ] Max participants limit
  - [ ] Dress code
  - [ ] Allow guests to post toggle

### Privacy System

- [ ] Public Events
  - [ ] Discoverable in feed
  - [ ] Visible in search
  - [ ] Anyone can RSVP
- [ ] Private Events
  - [ ] Only visible to invited users
  - [ ] Manual invites
  - [ ] Suggested invites (from followers/following)
  - [ ] Hidden from public feeds/search

### Invitations & RSVP

- [ ] Invitation System
  - [ ] Host can invite during creation
  - [ ] Host can invite after creation
  - [ ] Invitation notifications
  - [ ] Invitation management
- [ ] RSVP System
  - [ ] Going ✅
  - [ ] Maybe 🤔
  - [ ] Not Going ❌
  - [ ] RSVP counts for host
  - [ ] Attendee list (visible to invited users)

### Event Interaction

- [ ] Questions & Answers
  - [ ] Ask questions
  - [ ] Answer questions
  - [ ] Thread-like Q&A display
  - [ ] Question notifications
- [ ] Event Posts
  - [ ] Create posts
  - [ ] View posts
  - [ ] Post permissions (host controlled)
- [ ] Event Images
  - [ ] Upload images
  - [ ] Set primary image
  - [ ] Delete images
  - [ ] Image gallery
  - [ ] Download all images

### Event Discovery

- [ ] Event Feed
  - [ ] Public events
  - [ ] Events I'm invited to
  - [ ] Events I'm attending
  - [ ] Events I'm following
- [ ] Search & Filter
  - [ ] Search by title/description
  - [ ] Filter by date
  - [ ] Filter by privacy
  - [ ] Filter by status
  - [ ] Filter by participation

### Event Details

- [ ] Event Information
  - [ ] Basic details
  - [ ] Host information
  - [ ] Participant list
  - [ ] RSVP status
  - [ ] Image gallery
- [ ] Event Actions
  - [ ] RSVP management
  - [ ] Follow/Unfollow
  - [ ] Share event
  - [ ] Report event

## Technical Implementation

### Services Layer

- [x] Event CRUD operations
- [x] RSVP management
- [x] Follow/Unfollow
- [x] Invitation system
- [x] Questions & Answers
- [x] Posts management
- [x] Image management

### UI Components

- [ ] Event Card
- [ ] Event Filters
- [ ] Event Search
- [ ] Event Status Badge
- [ ] Event Stats Display
- [ ] Event Gallery
- [ ] Event Participants List
- [ ] Event Posts Feed
- [ ] Event Q&A Section
- [ ] Event Actions

### Screens

- [ ] Events List Screen
- [ ] Event Detail Screen
- [ ] Event Creation Screen
- [ ] Event Edit Screen
- [ ] Event Invite Screen

### Hooks

- [ ] useEvents
- [ ] useEventDetails
- [ ] useEventRSVP
- [ ] useEventInvites

## Database Schema

- [x] events
- [x] event_participants
- [x] event_followers
- [x] event_invites
- [x] event_questions
- [x] event_answers
- [x] event_posts
- [x] event_images

## Security & Policies

- [x] Public event visibility
- [x] Private event access control
- [x] RSVP permissions
- [x] Post permissions
- [x] Image management permissions
- [x] Question/Answer permissions
