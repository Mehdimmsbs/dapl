# Personal Daily Planner v1.0

DAPL is a multilingual personal daily planner for managing tasks, routines, priorities, and calendars in one simple dashboard.

## Current Project Status

The application currently runs as a frontend-only Next.js project. Tasks, routines, and user preferences are stored locally in the browser using `localStorage`.

A backend, database, authentication system, cloud synchronization, and complete PWA support are planned for later development phases.

## Features

- Daily task planning and progress tracking
- Task creation, editing, deletion, and completion
- Task priorities and prerequisite support
- Task filtering
- Reusable daily and weekly routines
- Routine activation and deactivation
- Routine descriptions and repeat-day selection
- Optional routine times or all-day scheduling
- Duplicate-task prevention when applying routines
- Gregorian, Jalali, and Hijri calendar display
- Light and dark themes
- Responsive desktop and mobile layouts
- Browser-based data persistence with `localStorage`

## Supported Languages

- English — default
- German
- Persian
- Arabic

The interface direction automatically changes between LTR and RTL based on the selected language.

Calendar presentation is also language-aware:

- English and German use the Gregorian calendar by default.
- Persian supports the Jalali calendar.
- Arabic supports the Hijri calendar.

Task dates are stored internally in ISO format. Changing the calendar only changes how dates are displayed.

## Foundation Update

The current development branch introduces the following improvements:

- Refactored the large planner page into reusable components
- Added separate dashboard, sidebar, task, form, and modal components
- Added a centralized language provider
- Added translation files for English, German, Persian, and Arabic
- Added language-aware document direction
- Moved user-facing text into translation files
- Added English as the default application language
- Improved project structure and maintainability
- Added a standard `.gitignore`
- Added `package-lock.json` for reproducible installations
- Preserved browser-based task and settings storage

## Main Project Structure

```text
app/
components/
  layout/
  planner/
  providers/
  ui/
data/
lib/
locales/
  translations/
```

## Technology Stack

- Next.js 15
- React 19
- JavaScript
- CSS
- Browser `localStorage`

## Getting Started

Install the dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the application locally:

```text
http://localhost:3000
```

Create a production build:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## Planned Improvements

- Complete PWA configuration and offline support
- Custom UI design and icon system
- Accessibility improvements
- Automated tests
- CI/CD with GitHub Actions
- Backend API
- User authentication
- MySQL database integration
- Secure data synchronization and backup
- Data export and import
- Android and iOS applications

## Data and Privacy

The current version does not send planner data to a remote server. Tasks, routines, and settings remain inside the user’s browser.

Clearing browser storage, changing devices, or uninstalling the application may remove locally stored data. Export, backup, account synchronization, and recovery features will be added in future versions.

## Development Branch

The current foundation work is developed on:

```text
feature/project-foundation
```