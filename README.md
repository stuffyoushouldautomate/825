## 🛠️ Full Setup & Configuration Guide

This section provides a comprehensive step-by-step walkthrough for setting up **Bulldozer Search** locally or in production.

---

### ✅ Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v18+)
- [Bun](https://bun.sh/) (optional but recommended)
- [Git](https://git-scm.com/)
- [Docker](https://www.docker.com/) (for full-stack or local production)
- A code editor like [VS Code](https://code.visualstudio.com/)
- API keys for:
  - [OpenAI](https://platform.openai.com/account/api-keys)
  - [Tavily](https://app.tavily.com/)
  - (Optional) Supabase, Upstash, SearXNG, etc.

---

### 1. 🍴 Fork & Clone

```bash
git clone https://github.com/your-username/bulldozer-search.git
cd bulldozer-search
```

---

### 2. 📦 Install Dependencies

Using Bun (recommended):

```bash
bun install
```

Or using npm:

```bash
npm install
```

---

### 3. ⚙️ Configure Environment

Copy the example env file and edit:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your keys:

```env
OPENAI_API_KEY=sk-...
TAVILY_API_KEY=...
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
SUPABASE_URL=
SUPABASE_ANON_KEY=
```

---

### 4. 🚧 Start Locally

```bash
bun dev
```

Visit: [http://localhost:3000](http://localhost:3000)

---

### 5. 🐳 Docker (Optional)

```bash
./scripts/docker-manage.sh start basic       # App + Redis
./scripts/docker-manage.sh start search      # Add SearXNG
./scripts/docker-manage.sh start full        # Full stack
```

Use these to manage:

```bash
./scripts/docker-manage.sh help
./scripts/docker-manage.sh logs app
./scripts/docker-manage.sh health
```

---

### 6. 🔐 Auth (Optional)

Set up a [Supabase](https://supabase.com/) project and add:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

---

### 7. 🤖 Models & Providers

Edit `public/config/models.json` to add or customize:

- OpenAI
- Anthropic
- Ollama
- Groq
- DeepSeek
- Fireworks
- xAI
- Google AI

Each must have corresponding env key.

---

### 8. 🔎 Search Providers

**Tavily (default)**

```env
TAVILY_API_KEY=...
```

**SearXNG (optional)**

```env
SEARXNG_URL=http://localhost:8080
```

To run your own:

```bash
docker compose --profile search up -d
```

---

### 9. 🌐 Deploy Options

**Railway** (recommended)

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/new?template=https://github.com/your-username/bulldozer-search)

```bash
npm i -g @railway/cli
railway login
railway init
railway variables set OPENAI_API_KEY=...
railway up
```

**Vercel**

<<<<<<< HEAD
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/bulldozer-search)

**Docker**

```bash
docker compose up -d
```

---

### 10. 🧪 Try It Out

Visit:

```
http://localhost:3000
```

Try sample queries:
=======
The default model configuration is located at `public/config/models.json`. For Docker deployment, you can create `models.json` alongside `.env.local` to override the default configuration.
>>>>>>> 325f071 (Update README.md: Remove Vercel and Docker deployment sections for clarity and streamline documentation)

- “OSHA violations for Turner Construction”
- “Recent NLRB filings in NYC”
- “Who owns Skanska USA?”
- “Contracts awarded to D'Annunzio & Sons”

---

### ✅ You're Ready!

<<<<<<< HEAD
You now have a running version of **Bulldozer Search**.
=======
1. Open your browser settings.
2. Navigate to the search engine settings section.
3. Select "Manage search engines and site search".
4. Under "Site search", click on "Add".
5. Fill in the fields as follows:
   - **Search engine**: Morphic
   - **Shortcut**: morphic
   - **URL with %s in place of query**:
6. Click "Add" to save the new search engine.
7. Find "Morphic" in the list of site search, click on the three dots next to it, and select "Make default".

This will allow you to use Morphic as your default search engine in the browser.

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.
>>>>>>> 325f071 (Update README.md: Remove Vercel and Docker deployment sections for clarity and streamline documentation)
