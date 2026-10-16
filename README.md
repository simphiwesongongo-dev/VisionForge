# VisionForge AI Video Studio — Free Studio v0.3

A responsive Next.js video-planning studio designed to be usable without a subscription, account, API key, or paid AI provider.

## Free features (work without any API credentials)
- Responsive website for phones, tablets, and computers
- Create and edit storyboards from a text prompt
- Choose from cinematic, 3D animation, advertisement, social video, education, and music-video styles
- Choose landscape, portrait, or square layouts
- Export storyboards as JSON
- Render a simple animated motion-graphics video directly in the browser and download it as WebM
- No app-side usage fees, sign-up wall, or payment integration

**Important distinction:** free motion-graphics export is a text-and-graphics video, not photorealistic AI-generated footage. Real generative video models are run by external providers and may charge for use. Those integrations are optional and should remain disabled unless the site owner configures and funds an API account.

## Run locally
1. Install Node.js 20 or newer.
2. Extract this ZIP and open a terminal in the project folder.
3. Run `npm install`.
4. Run `npm run dev`.
5. Open `http://localhost:3000`.

You do not need `.env.local` for the free tools.

## Publish as a free website with Vercel
1. Create a GitHub account if you do not already have one.
2. Create a new GitHub repository and upload the extracted project files.
3. Sign in to Vercel and choose **Add New → Project**.
4. Import the GitHub repository. Vercel should detect Next.js automatically.
5. Do not add provider API keys if you want to run only the free features.
6. Select **Deploy**. Vercel will provide a public `*.vercel.app` address.

Hosting-provider plans and limits can change. A free hosting plan does not make third-party AI generation free, and public deployment is not completed by this source package alone. You must perform the deployment in your own account.

## Optional paid AI footage integrations
The server-side routes support optional Higgsfield and Runway API requests. To enable them, configure the provider credentials in the hosting platform's server-side environment variables. Never put secrets in browser code or commit `.env.local` to Git.

- Higgsfield API documentation: https://higgsfield.ai/higgsfield-api
- Runway API documentation: https://docs.dev.runwayml.com/guides/using-the-api/

The optional integrations can incur real provider charges. Before opening them to the public, add authentication, rate limiting, spend limits, moderation, persistent jobs, and abuse protection. This project does not include a user database or commercial SaaS billing.

## Browser notes
The free video renderer uses Canvas and MediaRecorder. Use a current version of Chrome, Edge, or Safari. Keep the tab open while rendering. Browser support and available memory may affect export, especially for longer videos. Output is WebM; the renderer does not currently create an MP4 file or include an audio track.
