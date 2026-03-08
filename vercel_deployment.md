# Bharat Seva: Vercel Deployment Guide

Follow these steps to deploy Bharat Seva to Vercel.

## 1. Prerequisites
- A GitHub repository with the latest code pushed.
- A Vercel account.
- Your MongoDB Atlas connection string.
- Your AWS Bedrock/S3 credentials.
- Your Google Gemini API key.

## 2. Deploying the Backend
Vercel will automatically detect the `vercel.json` and deploy it as a Serverless Function.

1.  **Import to Vercel**: Import the `backend/` folder (or the root and set `backend` as the root directory).
2.  **Environment Variables**: Add the following in the Vercel Dashboard for the backend project:
    - `MONGODB_URI`
    - `GEMINI_API_KEY`
    - `AWS_ACCESS_KEY_ID`
    - `AWS_SECRET_ACCESS_KEY`
    - `AWS_REGION`
    - `BEDROCK_MODEL_ID`
    - `BEDROCK_LITE_MODEL_ID`
    - `NODE_ENV` = `production`

## 3. Deploying the Frontend
Vercel will detect the Vite project and build it.

1.  **Import to Vercel**: Import the `frontend/` folder.
2.  **Environment Variables**:
    - `VITE_BACKEND_URL`: The URL of your deployed backend (e.g., `https://your-backend.vercel.app`).
3.  **Build Settings**: Ensure the framework preset is set to **Vite**.

## 4. Final Verification
- Once both are deployed, open your frontend URL.
- Try the voice query: "What is Bharat Seva?".
- Check the Janata Pulse dashboard to ensure cloud data is being fetched correctly.
