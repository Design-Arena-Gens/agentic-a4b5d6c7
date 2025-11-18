# Google Form Filler

Web dashboard that discovers fields from a public Google Form, lets you fill them locally, and submits the response straight to Google Forms.

## Features

- Paste any public Google Form URL to inspect its fields
- Autofills form metadata and renders supported question types (short/long answer, number, email, URL, date, time)
- Submits answers directly to the original Google Form without leaving the page
- Dark, responsive UI built with Next.js 14 and Tailwind CSS

## Tech Stack

- Next.js 14 (App Router)
- React 18
- Tailwind CSS 3
- Cheerio for HTML parsing

## Running locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000` and paste a Google Form link to begin.

## Production build

```bash
npm run build
npm start
```

## Deployment

This project is ready for Vercel. Deploy with:

```bash
vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-a4b5d6c7
```
