# Alliance Manager

A comprehensive web application for managing Politics and War alliances. Built with Next.js, Prisma, NextAuth, and PnwKit.

## Features

- Discord OAuth authentication
- Politics and War API integration
- View and manage alliance members
- Sort members by city count, role, score, or name
- Real-time data synchronization
- Responsive design with Tailwind CSS

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Authentication:** NextAuth.js with Discord OAuth
- **Database:** Supabase PostgreSQL with Prisma ORM
- **Cache:** Upstash Redis for session storage and API caching
- **API Integration:** PnwKit for Politics and War API
- **Styling:** Tailwind CSS
- **Deployment:** Vercel

## Prerequisites

- Node.js 18+ and npm
- Supabase account (PostgreSQL database)
- Upstash account (Redis cache)
- Discord OAuth application
- Politics and War API key

## Local Development Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd alliance-manager
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Discord OAuth Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to OAuth2 settings
4. Add redirect URL: `http://localhost:3000/api/auth/callback/discord`
5. Copy your Client ID and Client Secret

### 4. Configure Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Database - Supabase PostgreSQL
DATABASE_URL="postgresql://user:password@db.xxxxx.supabase.co:5432/postgres?schema=public"

# Redis - Upstash Redis
UPSTASH_REDIS_REST_URL="https://xxxxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-upstash-token"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Discord OAuth
DISCORD_CLIENT_ID="your-discord-client-id"
DISCORD_CLIENT_SECRET="your-discord-client-secret"
```

Generate a secret for NEXTAUTH_SECRET:

```bash
openssl rand -base64 32
```

### 5. Set up the database

Start the Prisma development database (or use your own PostgreSQL instance):

```bash
npx prisma dev
```

Push the schema to the database:

```bash
npx prisma db push
```

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to Vercel

### 1. Set up Supabase (PostgreSQL)

1. Go to [Supabase](https://supabase.com/) and create a new project
2. Wait for the database to be provisioned
3. Go to **Settings** → **Database**
4. Copy the connection string (URI format)
5. Use this as your `DATABASE_URL`

### 2. Set up Upstash (Redis)

1. Go to [Upstash](https://upstash.com/) and create an account
2. Create a new Redis database
3. Select a region close to your Vercel deployment
4. Copy the `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`

### 3. Configure Discord OAuth for Production

1. Go to your Discord application in the Developer Portal
2. Add redirect URL: `https://orbistech.dev/api/auth/callback/discord`

### 4. Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Configure environment variables:
   - `DATABASE_URL`: Your Supabase PostgreSQL connection string
   - `UPSTASH_REDIS_REST_URL`: Your Upstash Redis REST URL
   - `UPSTASH_REDIS_REST_TOKEN`: Your Upstash Redis REST token
   - `NEXTAUTH_URL`: `https://orbistech.dev`
   - `NEXTAUTH_SECRET`: Generate a new secret (use `openssl rand -base64 32`)
   - `DISCORD_CLIENT_ID`: Your Discord client ID
   - `DISCORD_CLIENT_SECRET`: Your Discord client secret
6. Deploy

#### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

### 5. Set up custom domain

1. In your Vercel project settings, go to "Domains"
2. Add `orbistech.dev`
3. Follow the DNS configuration instructions
4. Update your Discord OAuth redirect URL to use the custom domain

### 6. Initialize database schema

After deployment, run the Prisma migration:

```bash
# Using Vercel CLI
vercel env pull .env.production
npx prisma db push
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Supabase PostgreSQL connection string | Yes |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL | Yes |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token | Yes |
| `NEXTAUTH_URL` | Full URL of your application | Yes |
| `NEXTAUTH_SECRET` | Random secret for session encryption | Yes |
| `DISCORD_CLIENT_ID` | Discord OAuth application client ID | Yes |
| `DISCORD_CLIENT_SECRET` | Discord OAuth application client secret | Yes |

## Usage

### For Users

1. Visit the website
2. Click "Get Started"
3. Sign in with Discord
4. Enter your Politics and War API key (get it from [politicsandwar.com/account/](https://politicsandwar.com/account/))
5. View your alliance dashboard with all members

### Sorting Members

Click on any column header to sort:

- **Nation**: Sort alphabetically by nation name
- **Role**: Sort by alliance position (Leader > Heir > Officer > Member)
- **Cities**: Sort by city count
- **Score**: Sort by nation score

Click the same header again to reverse the sort direction.

## Project Structure

```
alliance-manager/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/  # NextAuth route handler
│   │   ├── user/link-api-key/   # API key linking endpoint
│   │   └── alliance/members/    # Alliance data endpoint
│   ├── auth/
│   │   ├── signin/              # Sign-in page
│   │   └── link-account/        # API key linking page
│   ├── dashboard/               # Main dashboard
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Landing page
│   └── providers.tsx            # Session provider
├── lib/
│   ├── auth.ts                  # NextAuth configuration
│   ├── prisma.ts                # Prisma client
│   ├── redis.ts                 # Redis client and caching utilities
│   └── pnwkit.ts                # PnwKit utilities with Redis caching
├── prisma/
│   └── schema.prisma            # Database schema
├── types/
│   └── next-auth.d.ts           # TypeScript type extensions
└── vercel.json                  # Vercel configuration
```

## Database Schema

### User
Stores Discord user information and P&W API key.

### Nation
Cached nation data from Politics and War API.

### Alliance
Cached alliance data from Politics and War API.

### Account, Session, VerificationToken
NextAuth.js authentication tables.

## API Routes

### POST /api/user/link-api-key
Links a user's Politics and War API key and fetches their nation data.

**Request:**
```json
{
  "apiKey": "your-pnw-api-key"
}
```

### GET /api/alliance/members
Fetches all members of the user's alliance.

**Response:**
```json
{
  "success": true,
  "alliance": { ... },
  "members": [ ... ]
}
```

## Troubleshooting

### "Can't reach database server" error

Make sure your database is running and the `DATABASE_URL` is correct.

### Discord OAuth not working

- Verify your Discord redirect URLs match exactly
- Check that `NEXTAUTH_URL` is set correctly
- Ensure `NEXTAUTH_SECRET` is set

### API key validation fails

- Make sure the P&W API key is valid
- Check that the user's nation exists in Politics and War

## Contributing

Pull requests are welcome! Please open an issue first to discuss proposed changes.

## License

MIT License - feel free to use this project for your alliance!
