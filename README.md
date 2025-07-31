# Sustainability Interview App

An AI-powered web application that conducts personalized sustainability interviews using dynamic question generation and provides comprehensive sustainability profiles.

## Features

- **Dynamic AI-Powered Questions**: Questions adapt based on previous answers using Azure OpenAI
- **Mixed Question Types**: Both multiple choice and open-ended questions
- **Minimalist UI**: Clean, distraction-free interface with Typeform-like flow
- **Inspirational Quotes**: Motivational sustainability quotes displayed during the interview
- **Comprehensive Report Card**: Detailed sustainability profile with scores, insights, and recommendations
- **Ryan Deiss-style Communication**: Engaging, insightful, and persuasive interview style

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Framer Motion
- **AI/LLM**: Azure OpenAI (GPT-4)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS with custom design system

## Setup Instructions

1. **Clone the repository**
   ```bash
   cd sustainability-interview
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env.local`
   - Fill in your Azure OpenAI and Supabase credentials

4. **Set up Supabase database**
   - Create a new Supabase project
   - Run the SQL schema from `supabase-schema.sql` in the Supabase SQL editor

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open the app**
   Navigate to `http://localhost:3000`

## Project Structure

```
sustainability-interview/
├── app/                    # Next.js app directory
│   ├── api/               # API routes for AI operations
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page component
├── components/            # React components
│   ├── InterviewModal.tsx # Main interview interface
│   ├── QuestionCard.tsx   # Question display component
│   ├── QuotePanel.tsx     # Inspirational quotes panel
│   ├── ProgressBar.tsx    # Progress indicator
│   ├── LandingPage.tsx    # Welcome page
│   └── ReportCard.tsx     # Final report display
├── lib/                   # Utility libraries
│   └── agents/           # AI agent implementations
├── types/                # TypeScript type definitions
└── supabase-schema.sql   # Database schema
```

## Usage

1. Users start on the landing page with an overview of the interview process
2. Click "Begin Your Journey" to start the 10-question interview
3. Answer questions (multiple choice or text) that dynamically adapt to responses
4. View inspirational quotes while answering
5. Receive a comprehensive sustainability report card with:
   - Overall sustainability score
   - Category breakdowns
   - Personality profile
   - Key insights
   - Actionable recommendations

## Development

- Run `npm run dev` for development mode with hot reload
- Run `npm run build` to create production build
- Run `npm run lint` to check code quality

## Environment Variables

Required environment variables:

- `AZURE_OPENAI_API_KEY`: Your Azure OpenAI API key
- `AZURE_OPENAI_ENDPOINT`: Your Azure OpenAI endpoint URL
- `AZURE_DEPLOYMENT_NAME`: Your GPT-4 deployment name
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

## License

MIT