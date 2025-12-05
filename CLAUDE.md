# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Vue 3 education admin system (`roncoo-education-admin`) built with:
- Vue 3 + Vite
- Element Plus UI framework
- SCSS for styling
- Vue Router for routing
- Pinia for state management
- WangEditor for rich text editing

## Development Commands

```bash
# Start development server (runs on port 3002)
npm run dev

# Build for production
npm run build

# Preview production build
npm run serve

# Lint and fix code
npm run lint

# Format code with Prettier
npm run prettier

# Create zip package
npm run zip
```

## Project Architecture

### Directory Structure
- `src/views/` - Main application pages, organized by feature:
  - `ai/assistant/` - AI teaching assistant features
  - `assignments/` - Assignment and question bank management
  - `course/` - Course management
  - `class/` - Class management and authorization
  - `homework/` - Homework creation and management
  - `exam/` - Exam management and grading
  - `users/` - User management (students, lecturers, employees)
  - `material/` - Material management
  - `learning/` - Learning reports and analytics

- `src/components/` - Reusable components:
  - `Cascader/` - Category and course selection
  - `Editor/` - Rich text editor components
  - `Upload/` - File upload components
  - `QuestionBankManager/` - Question editing components
  - `Renderer/` - Question rendering components

- `src/api/` - API modules organized by domain (ai, class, exam, homework, etc.)

- `src/store/` - Pinia stores for state management

- `src/utils/` - Utility functions and constants

### Key Features
1. **Question Management**: Supports multiple question types (single/multiple choice, fill-in-blank, essay, programming OJ, Scratch)
2. **AI Integration**: AI-powered question generation and assistance
3. **Multi-format Support**: Rich text editing, file uploads, JSON import/export
4. **Comprehensive Education System**: Course management, assignments, exams, grading, user management

### State Management
Uses Pinia with modules for:
- User authentication and permissions
- Upload management
- Website configuration
- Mock data storage (for development)

### Routing
Dynamic routing system with:
- Static routes for core functionality
- Dynamic routes based on user permissions
- Route guards for authentication
- Layout-based routing with shared navigation

### Mock Data System
Includes a comprehensive mock data system for development, avoiding real API calls that might cause 500 errors. The system uses:
- `src/plugins/mockData.js` for mock data generation
- `src/utils/mockStorage.js` for persistent mock storage
- User store with mock login functionality

## Development Notes

### Question Management Drawer Component
The `QuestionManagementDrawer.vue` component is a comprehensive question creation interface that supports:
- 7 question types: single choice, multiple choice, fill-in-blank, true/false, programming (OJ), Scratch, essay
- Rich text editing for question content
- Tag-based categorization with auto-color assignment
- JSON import/export for question data
- File upload support for programming and Scratch questions

### API Integration
All API calls go through proxy configuration in `vite.config.js`:
- Development proxy: `/gateway` → `http://localhost:7700`
- Uses axios for HTTP requests

### Styling
- SCSS with variables and themes in `src/assets/styles/`
- Element Plus theming
- Custom SVG icon system
- Responsive design patterns