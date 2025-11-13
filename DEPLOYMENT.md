# Deployment Guide - Vercel

This guide will help you deploy the NDC Packaging & Quantity Calculator to Vercel.

## Prerequisites

- ✅ Vercel adapter installed (`@sveltejs/adapter-vercel`)
- ✅ Configuration updated (`svelte.config.js`)
- ✅ `vercel.json` created
- ✅ Git repository (GitHub, GitLab, or Bitbucket)

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Sign up/Login to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up or login with your GitHub/GitLab/Bitbucket account

2. **Import Project**
   - Click "Add New Project" or "Import Project"
   - Select your Git repository
   - Vercel will auto-detect SvelteKit

3. **Configure Project Settings**
   - **Framework Preset:** SvelteKit (auto-detected)
   - **Root Directory:** `./` (default)
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `.svelte-kit` (auto-detected)
   - **Install Command:** `npm install` (auto-detected)

4. **Environment Variables**
   - Go to Settings → Environment Variables
   - Add the following (if needed):
     - `OPENAI_API_KEY` - For AI-assisted SIG parsing (optional)

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `https://your-project-name.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   # First deployment (preview)
   vercel

   # Production deployment
   vercel --prod
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add OPENAI_API_KEY
   ```

5. **Useful Vercel CLI Commands**
   ```bash
   # Inspect deployment logs
   vercel inspect <deployment-url> --logs
   
   # Redeploy a specific deployment
   vercel redeploy <deployment-url>
   
   # Example (replace with your actual deployment URL):
   vercel inspect ndc-packaging-quantity-calculator-jzev6f36f.vercel.app --logs
   vercel redeploy ndc-packaging-quantity-calculator-jzev6f36f.vercel.app
   ```

6. **After Deployment**
   - You'll receive deployment URLs:
     - **Inspect URL:** `https://vercel.com/your-username/projects/ndc-packaging-quantity-calculator/<deployment-id>`
     - **Production URL:** `https://ndc-packaging-quantity-calculator-<hash>.vercel.app`
   - Use the inspect URL to view deployment details, logs, and analytics
   - The production URL is your live application

## Configuration Files

### `svelte.config.js`
Already configured with:
- Vercel adapter
- Node.js 20.x runtime

### `vercel.json`
Created with SvelteKit-specific settings:
```json
{
	"buildCommand": "npm run build",
	"outputDirectory": ".svelte-kit",
	"devCommand": "npm run dev",
	"installCommand": "npm install",
	"framework": "sveltekit"
}
```

## Environment Variables

### Required
None (all APIs are public)

### Optional
- `OPENAI_API_KEY` - For AI-assisted SIG parsing (if using this feature)

## Build Notes

- **Node.js Version:** 20.x (configured in `svelte.config.js`)
- **Build Output:** `.svelte-kit` directory
- **API Routes:** Automatically deployed as serverless functions
- **Static Assets:** Automatically optimized and served via CDN

## Post-Deployment Checklist

- [ ] Test the deployed application
- [ ] Verify API endpoints work (`/api/calculate`, `/api/drug-search`, etc.)
- [ ] Test drug name autocomplete
- [ ] Test calculation functionality
- [ ] Verify external API calls (RxNorm, FDA) work
- [ ] Check environment variables are set (if needed)
- [ ] Test on mobile devices
- [ ] Verify HTTPS is enabled (automatic on Vercel)

## Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Vercel will automatically provision SSL certificate

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Verify Node.js version is 20.x
- Ensure all dependencies are in `package.json`
- Check for TypeScript errors: `npm run check`

### API Routes Not Working
- Verify API routes are in `src/routes/api/` directory
- Check serverless function logs in Vercel dashboard
- Ensure external API calls are allowed (CORS)

### Environment Variables Not Working
- Verify variables are set in Vercel dashboard
- Check variable names match exactly (case-sensitive)
- Redeploy after adding new variables

### Windows Symlink Error (Local Build)
- This is a known Windows limitation
- The build will work fine on Vercel's Linux servers
- You can ignore this error for local builds

## Vercel Features

### Automatic Deployments
- Every push to main branch = production deployment
- Pull requests = preview deployments
- Automatic HTTPS
- Global CDN

### Performance
- Edge functions for API routes
- Automatic code splitting
- Image optimization
- Automatic compression

### Monitoring
- Real-time logs
- Function analytics
- Performance metrics
- Error tracking

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [SvelteKit Adapter Docs](https://kit.svelte.dev/docs/adapter-vercel)
- [Vercel Community](https://github.com/vercel/vercel/discussions)

