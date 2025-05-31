# Smart Space Study (SMRS)

A Smart Self-Study Space Management & Reservation System for Bach Khoa Library (HCMUT)

## Project Overview
Smart Space Study (SMRS) is a comprehensive web-based platform that enables students to search, reserve, and manage study spaces at the university library. The system also provides administrators with powerful tools to monitor, control, and optimize space usage, ensuring efficient resource allocation and a modern study environment.

## Features
### For Students
- User registration, login, and password recovery
- Search for available study rooms by campus, building, date, and time slot
- Real-time room availability and status updates
- Book, view, and manage reservations
- Check-in and check-out for room usage (with time tracking)
- View reservation history and booking details
- Submit feedback and rate study spaces
- Receive notifications and email confirmations for bookings, cancellations, and reminders

### For Administrators
- Manage rooms, time slots, and room statuses (Available, Maintenance, Booked)
- Add, edit, or remove rooms and time slots
- Approve, cancel, or transfer student reservations
- View and filter all reservations and booking history
- Generate statistics and usage reports (daily, weekly, monthly)
- Manage and respond to student feedback
- Receive system notifications for important events

## System Architecture
- **Frontend:** React, Vite, TailwindCSS (located in `Frontend/`)
- **Backend:** Node.js, Express, MongoDB (located in `Backend/`)

## Demo
### Student Experience
- Reserve a study room in seconds with a modern, responsive UI
- Instantly see available spaces and time slots
- Receive real-time notifications and email reminders
- Check-in/check-out with a single click

### Admin Experience
- View all reservations and room statuses in a dashboard
- Change room status (e.g., set to Maintenance)
- Approve or cancel bookings and respond to feedback

[![Watch Demo on YouTube](https://img.youtube.com/vi/wFhUVO4VUOA/0.jpg)](https://www.youtube.com/watch?v=wFhUVO4VUOA)

## Getting Started
### 1. Backend
```bash
cd "Smart Space Study/Backend"
npm install
npm start
```
- Default server: `http://localhost:5001`
- Configure MongoDB in `.env` if needed

### 2. Frontend
```bash
cd "Smart Space Study/Frontend"
npm install
npm run dev
```
- App runs at `http://localhost:5173`

## Folder Structure
- `Backend/`: API, models, routes, business logic
- `Frontend/`: User interface, reservation pages, admin dashboard

## Required Libraries
See [`requirements.md`](requirements.md) for a full list of required libraries and dependencies for both backend and frontend.

## Contributing
- Fork, create a new branch, and submit a pull request for new features or bug fixes
- Contact: [lib.hcmut.edu.vn](https://lib.hcmut.edu.vn)

---
**SMRS - Smart Space Management for HCMUT Library**