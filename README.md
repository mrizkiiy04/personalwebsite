# AI Chaos Logbook

## Project Overview

A personal portfolio website and blog built with modern web technologies.

## Setting Up the Todo List Feature

The dashboard includes a simple to-do list that integrates with Supabase. To set up this feature, run the following SQL script in your Supabase SQL Editor:

1. Log in to your Supabase dashboard
2. Go to the SQL Editor
3. Run the `supabase-todos-table.sql` script

This will:
- Create the todos table with proper columns
- Set up Row Level Security (RLS) policies for data protection
- Create necessary functions for client-side table creation

#### Troubleshooting

If you encounter an error like `relation "public.todos_id_seq" does not exist`, it's because the SQL script was trying to grant permissions on a sequence that doesn't exist (since we're using UUIDs instead of serial IDs). This has been fixed in the latest version of the script.

Once the table is set up, you can:
- Add new tasks from the admin dashboard
- Mark tasks as complete/incomplete
- Delete tasks you no longer need

## Setting Up Gemini AI Integration

The blog editor includes an AI-powered content generation feature using Google's Gemini AI. To use this feature, you'll need to:

1. Sign up for Google AI Studio at https://ai.google.dev/
2. Create a new API key with access to Gemini models
3. Create an `.env` file in the project root with your API key:

```
VITE_GEMINI_API_KEY=your_api_key_here
```

Note: The Gemini AI integration requires access to one of the following models:
- gemini-1.5-pro
- gemini-2.0-flash
- gemini-pro
- gemini-1.0-pro

If you encounter a "model not found" error, make sure your API key has access to one of these models in your region.

## How can I edit this code?

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase
- Google Gemini AI
