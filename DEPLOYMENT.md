# Deployment Guide for "Les Amis Français"

This application is a full-stack Node.js + Express + React 19 application. It serves the frontend bundle and handles backend AI endpoints (`/api/chat`, `/api/story`, `/api/pronunciation`) using the Google Gemini SDK.

---

## Prerequisites
1. **Gemini API Key**: Obtain a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
2. **Git Repository**: Push this project to GitHub or GitLab.

---

## Option 1: Render.com (Recommended — Quick & Free Tier)

1. Sign up or log into [Render.com](https://render.com).
2. Click **New +** > **Web Service**.
3. Connect your GitHub repository.
4. Configure the settings:
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Under **Environment Variables**, add:
   - `GEMINI_API_KEY`: `your_gemini_api_key_here`
   - `NODE_ENV`: `production`
6. Click **Create Web Service**. Render will build and deploy your app with a free HTTPS URL.

---

## Option 2: Railway.app (Automatic & Fast)

1. Log into [Railway.app](https://railway.app).
2. Click **New Project** > **Deploy from GitHub repo**.
3. Select this repository.
4. Go to **Variables** and add:
   - `GEMINI_API_KEY`: `your_gemini_api_key_here`
5. Railway automatically detects the `Dockerfile` or `package.json` scripts and builds the app.
6. Under **Settings**, click **Generate Domain** to get your public URL.

---

## Option 3: Google Cloud Run (Containerized & Scalable)

With the included `Dockerfile`, you can deploy directly to Google Cloud Run:

1. Install Google Cloud SDK (`gcloud`).
2. Authenticate:
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```
3. Deploy directly from source:
   ```bash
   gcloud run deploy les-amis-francais \
     --source . \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
   ```
4. Cloud Run will build the container and provide an HTTPS URL.

---

## Option 4: Local or VPS (Ubuntu, Debian, etc.)

1. Clone your repo onto the server.
2. Install Node.js (v20+ recommended).
3. Install dependencies and build:
   ```bash
   npm install
   npm run build
   ```
4. Set up your environment file:
   ```bash
   echo "GEMINI_API_KEY=your_key_here" > .env
   echo "NODE_ENV=production" >> .env
   echo "PORT=3000" >> .env
   ```
5. Start the server directly or via PM2:
   ```bash
   # Direct:
   npm start

   # Or using PM2 for background process management:
   npm install -g pm2
   pm2 start server.js --name "les-amis-francais"
   ```
6. (Optional) Put Nginx or Caddy in front as a reverse proxy for custom domains and automatic SSL certificates.
