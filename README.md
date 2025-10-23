# AI-Mentor

AI-Mentor is a production-ready learning platform powered by Gemini 2.0 Flash. Turn any video or topic into an interactive tutor, exams, and downloadable study notes.

## Features

- Clerk authentication with protected AI experiences
- AI tutorial chat with persistent history and PDF exports
- Custom AI experts with tone-specific prompts
- AI-generated exams with instant grading
- AI summarizer with quizzes and downloadable notes
- Dashboard analytics and XP progress insights
- Profile management with Cloudinary avatar uploads
- Tailwind CSS, shadcn/ui, Framer Motion animations
- MongoDB persistence via Mongoose
- Vitest unit tests and Playwright smoke tests
- Dockerfile and GitHub Actions CI pipeline

## Getting Started

1. **Install dependencies**
   ```bash
   pnpm install
   ```
2. **Configure environment** – copy `.env.example` to `.env.local` and set the required secrets (Clerk keys, MongoDB URI, Gemini API key, Cloudinary URL, and `NEXT_PUBLIC_CLOUDINARY_CLOUD`).
3. **Run the development server**
   ```bash
   pnpm dev
   ```
4. **Run unit tests**
   ```bash
   pnpm test
   ```
5. **Run Playwright tests**
   ```bash
   pnpm e2e
   ```

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui + Framer Motion
- Clerk for authentication
- MongoDB + Mongoose
- Gemini 2.0 Flash API
- Cloudinary for media
- Vitest & Playwright

## Deployment

Use the included Dockerfile for container builds and the GitHub Actions workflow for CI/CD checks.
