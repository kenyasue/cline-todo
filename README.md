# Todo App

A simple todo list application built with Next.js 14, TypeScript, Prisma, MySQL, and Tailwind CSS.

## Features

- Create, read, update, and delete todo items
- Mark todos as completed
- Add detailed descriptions to todos
- Attach and manage files (PDFs, images, etc.) to todo items
- Display file icons in the list view (thumbnails for images, generic icons for other file types)
- Download files by clicking on their icons/thumbnails
- Tag system for categorizing and filtering todos
- Detailed view for individual todos
- Responsive design with Tailwind CSS
- MySQL database with Prisma ORM
- Docker for easy database setup

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MySQL
- **ORM**: Prisma
- **Containerization**: Docker

## Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Docker and Docker Compose

## Getting Started

1. Clone the repository:

```bash
git clone <repository-url>
cd todo-app
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Start the MySQL database using Docker:

```bash
npm run docker:up
# or
yarn docker:up
```

4. Generate Prisma client and push the schema to the database:

```bash
npm run setup
# or
yarn setup
```

5. Start the development server:

```bash
npm run dev
# or
yarn dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
todo-app/
├── prisma/                # Prisma schema and migrations
├── public/                # Static assets
│   └── uploads/           # Uploaded files storage
├── src/
│   ├── app/               # Next.js App Router
│   │   ├── api/           # API routes
│   │   │   ├── todos/     # Todo API endpoints
│   │   │   └── files/     # File upload endpoints
│   │   ├── page.tsx       # Home page
│   │   └── layout.tsx     # Root layout
│   ├── components/        # React components
│   │   ├── TodoList.tsx   # Todo list component
│   │   ├── TodoItem.tsx   # Individual todo item
│   │   ├── TodoForm.tsx   # Form to add new todos
│   │   └── TodoDetails.tsx # Detailed todo view
│   ├── lib/               # Utility functions
│   │   ├── prisma.ts      # Prisma client
│   │   └── fileUpload.ts  # File upload utilities
│   └── types/             # TypeScript type definitions
└── docker-compose.yml     # Docker configuration for MySQL
```

## API Routes

### Todo Endpoints
- `GET /api/todos` - Get all todos
- `GET /api/todos?tag=tagName` - Get todos filtered by tag
- `POST /api/todos` - Create a new todo
- `GET /api/todos/[id]` - Get a specific todo
- `PUT /api/todos/[id]` - Update a todo
- `DELETE /api/todos/[id]` - Delete a todo

### File Endpoints
- `POST /api/files` - Upload a file attachment to a todo
- `DELETE /api/files/[id]` - Delete a file attachment

## Database Schema

The application uses the following database models:

- **Todo**: Main todo item with title, description, and completion status
- **TodoFile**: File attachments for todos
- **Tag**: Reusable tags for categorizing todos
- **TodoTag**: Junction table for many-to-many relationship between todos and tags

## Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run docker:up` - Start the MySQL container
- `npm run docker:down` - Stop the MySQL container
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run Prisma migrations
- `npm run db:push` - Push Prisma schema to the database
- `npm run setup` - Run docker:up, prisma:generate, and db:push

## License

MIT
