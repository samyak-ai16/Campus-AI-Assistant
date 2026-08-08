# Campus Buddy AI

Build a modern, production-ready full-stack web application named **CampusAI**.

CampusAI is an AI-powered College Assistant that helps students access college information through a ChatGPT-style interface.

The application should have a beautiful UI, smooth animations, responsive design, secure authentication, and production-ready code.

The overall design should feel similar to ChatGPT, Notion, Vercel, and Linear.

--------------------------------------------------------

OBJECTIVE

Create an AI-powered college portal where students can:

• Chat with AI

• View attendance

• View timetable

• Explore syllabus

• Browse faculty details

• Read notices

• View college events

• Check exam schedules

• View results

• Access FAQs

The AI assistant should answer questions naturally using Google Gemini API.

Example Questions

• What is my attendance in Operating Systems?

• Show tomorrow's timetable.

• Who teaches DBMS?

• When are MSE exams?

• Show the syllabus for Data Structures.

• What events are happening this week?

• What are today's classes?

If information is unavailable, politely inform the student and suggest contacting the college administration.

--------------------------------------------------------

TECH STACK

Frontend

• React

• TypeScript

• Vite

• Tailwind CSS

• React Router

• React Query

• Framer Motion

• React Hook Form

• Zod

• Axios

• React Hot Toast

• Lucide Icons

Backend

• Django REST Framework

• PostgreSQL

• JWT Authentication

AI

• Google Gemini API

• OpenAI API fallback

Deployment

• Vercel

• Render

• Docker

--------------------------------------------------------

LANDING PAGE

Create a premium landing page with:

• Hero section

• Animated background

• AI chatbot preview

• Feature cards

• Statistics

• Testimonials

• FAQ

• Contact section

• Footer

Buttons

• Get Started

• Login

• Register

--------------------------------------------------------

AUTHENTICATION

Create modern authentication pages.

Registration

Fields

• Full Name

• Email

• Roll Number

• Department

• Semester

• Password

• Confirm Password

Login

• Email

• Password

• Remember Me

• Forgot Password

Use JWT Authentication.

--------------------------------------------------------

STUDENT DASHBOARD

After login create a modern dashboard.

Sidebar

• Dashboard

• AI Assistant

• Attendance

• Timetable

• Syllabus

• Faculty

• Notices

• Events

• Exams

• Chat History

• Profile

• Settings

• Logout

Dashboard Cards

• Overall Attendance

• Today's Classes

• Upcoming Exams

• Latest Notices

• Upcoming Events

Charts

• Attendance Analytics

• Weekly Activity

• Subject-wise Attendance

--------------------------------------------------------

AI CHAT PAGE

Create a ChatGPT-like experience.

Features

• Conversation history

• Markdown support

• Code blocks

• Syntax highlighting

• Typing animation

• Suggested prompts

• Voice input

• Text-to-speech

• Copy response

• Regenerate response

• Like / Dislike

• Clear chat

• Auto scroll

• Download conversation as PDF

--------------------------------------------------------

ATTENDANCE PAGE

Display

• Overall Attendance

• Subject-wise Attendance

• Progress Bars

• Pie Chart

• Monthly History

• Attendance Warnings

--------------------------------------------------------

TIMETABLE PAGE

Display

• Daily View

• Weekly View

• Current Lecture Highlight

• Search

• Print Timetable

--------------------------------------------------------

SYLLABUS PAGE

Subject Cards

Display

• Subject Name

• Faculty

• Credits

• Semester

Buttons

• View PDF

• Download PDF

Include Search.

--------------------------------------------------------

FACULTY PAGE

Faculty Cards

Display

• Photo

• Name

• Department

• Designation

• Subjects

• Email

• Office

Include Search and Filters.

--------------------------------------------------------

NOTICES PAGE

Display notice cards.

Include

• Title

• Description

• Date

• Category

• Attachments

Filters

• Academic

• Events

• Placement

• Examination

--------------------------------------------------------

EVENTS PAGE

Display modern event cards.

Include

• Banner

• Title

• Date

• Time

• Venue

• Description

• Register Button

Calendar View

--------------------------------------------------------

EXAMS PAGE

Display

• Exam Schedule

• Upcoming Exams

• Results

• Previous Results

• Admit Card Downloads

--------------------------------------------------------

PROFILE PAGE

Display

• Student Photo

• Name

• Department

• Semester

• Roll Number

• Email

• Attendance Summary

Allow editing profile.

--------------------------------------------------------

SETTINGS

Include

• Dark Mode

• Light Mode

• Language

• Notifications

• Voice Settings

• Change Password

--------------------------------------------------------

ADMIN DASHBOARD

Create a separate Admin Panel.

Features

• Manage Students

• Manage Faculty

• Manage Subjects

• Manage Attendance

• Manage Timetable

• Upload Syllabus PDFs

• Manage Notices

• Manage Events

• Manage Exams

• Chat Analytics

• User Management

Dashboard Analytics

• Total Students

• Daily Active Users

• Chat Usage

• Popular Questions

• Attendance Reports

--------------------------------------------------------

DATABASE TABLES

Students

Faculty

Departments

Subjects

Attendance

Timetable

Syllabus

Notices

Events

Exams

Results

ChatHistory

Admins

--------------------------------------------------------

DESIGN SYSTEM

Create a premium UI using:

• Glassmorphism

• Rounded corners

• Soft shadows

• Modern typography

• Smooth transitions

• Skeleton loaders

• Toast notifications

• Responsive layouts

Theme Colors

Primary

#2563EB

Secondary

#4F46E5

Accent

#06B6D4

Background

#F8FAFC

Dark

#0F172A

--------------------------------------------------------

EXTRA FEATURES

• Global Search

• Notification Center

• Voice Search

• PDF Viewer

• File Upload

• Multi-language Support

  - English

  - Hindi

  - Marathi

• PWA Support

• Offline Mode

• Infinite Scroll

• Error Boundaries

• Secure API Calls

• Loading States

• Empty States

--------------------------------------------------------

PROJECT STRUCTURE

Frontend

src/

components/

pages/

layouts/

hooks/

services/

context/

utils/

assets/

Backend

authentication/

students/

faculty/

attendance/

timetable/

syllabus/

events/

notices/

exams/

chatbot/

analytics/

uploads/

--------------------------------------------------------

DELIVERABLES

Generate

• Complete React frontend

• Django REST backend

• PostgreSQL schema

• REST API endpoints

• JWT Authentication

• Gemini API integration

• Docker configuration

• Docker Compose

• Sample database

• README

• API documentation

• Deployment guide

--------------------------------------------------------

IMPORTANT REQUIREMENTS

• Use reusable components.

• Follow modern React best practices.

• Write clean, maintainable TypeScript code.

• Follow accessibility (WCAG) guidelines.

• Optimize for performance and SEO where applicable.

• Secure API endpoints with JWT.

• Validate forms using React Hook Form + Zod.

• Use environment variables for API keys.

• Handle loading, success, and error states throughout the application.

• Ensure the application is mobile-first, fully responsive, scalable, and suitable as a professional final-year B.Tech project ready for deployment.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
