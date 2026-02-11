# Quick Start Guide - TrustChain Campus Dashboard

## Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager
- Pera Wallet mobile app or browser extension (for testing)

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/ShivprasadChinnchole/ALGO_AI_2026.git
cd ALGO_AI_2026
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- React 18.2.0
- Tailwind CSS 3.3.2
- @perawallet/connect
- Recharts
- And other dependencies

### 3. Configure Environment (Optional)

Create a `.env` file in the root directory:

```env
# Algorand Application ID
REACT_APP_ALGORAND_APP_ID=your_actual_app_id

# Backend API URL (if different from default)
REACT_APP_API_URL=http://localhost:5000
```

### 4. Start Development Server

```bash
npm start
```

The app will open in your browser at `http://localhost:3000`

## First-Time Usage

### Step 1: Connect Wallet

1. Click the "Connect Wallet" button in the top right
2. Pera Wallet will open (mobile app or browser extension)
3. Approve the connection request
4. Your wallet address will be displayed

### Step 2: Explore Features

Navigate through the tabs:

1. **Overview** - Dashboard with analytics
2. **Proposals** - Create new governance proposals
3. **Voting** - Vote on active proposals
4. **Attendance** - Mark your attendance
5. **Certificates** - Verify certificates
6. **Analytics** - View detailed AI analytics

## Testing the Dashboard

### Test Proposal Creation

1. Go to the "Proposals" tab
2. Enter a title (min 5 characters)
3. Enter a description (min 20 characters)
4. Click "Submit Proposal"
5. Check for success message and transaction hash

### Test Voting

1. Go to the "Voting" tab
2. Select a proposal from the list
3. Click "Vote Yes" or "Vote No"
4. Check for confirmation and transaction hash

### Test Attendance

1. Go to the "Attendance" tab
2. Click "Mark Attendance Now"
3. Check for success message and transaction hash
4. View your attendance history

### Test Certificate Verification

1. Go to the "Certificates" tab
2. Enter a certificate ID (e.g., "CERT-2024-001")
3. Click "Verify Certificate"
4. View certificate details if valid

## Backend Integration

The frontend expects these backend endpoints:

```
POST   /api/wallet/connect        - Notify wallet connection
POST   /api/proposals              - Create new proposal
GET    /api/proposals              - Get all proposals
GET    /api/proposals/:id          - Get specific proposal
POST   /api/vote                   - Submit vote
POST   /api/attendance             - Mark attendance
GET    /api/attendance             - Get attendance status
POST   /api/certificate/verify     - Verify certificate
GET    /api/analytics              - Get analytics data
```

### Without Backend

The dashboard will still work with mock data:
- Analytics will show demo data
- Some features will show error messages (expected)
- Wallet connection will still work

## Production Build

### Create Production Build

```bash
npm run build
```

This creates an optimized build in the `build/` folder.

### Deploy to Hosting

#### Vercel (Recommended)

```bash
npm install -g vercel
vercel --prod
```

#### Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod --dir=build
```

#### GitHub Pages

1. Update `package.json`:
   ```json
   "homepage": "https://yourusername.github.io/ALGO_AI_2026"
   ```
2. Install gh-pages:
   ```bash
   npm install --save-dev gh-pages
   ```
3. Add scripts:
   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -d build"
   ```
4. Deploy:
   ```bash
   npm run deploy
   ```

## Troubleshooting

### Issue: Build Fails

**Solution**: Clear cache and reinstall
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Issue: Wallet Won't Connect

**Solutions**:
1. Install Pera Wallet app/extension
2. Ensure you're on Algorand TestNet
3. Check browser console for errors
4. Try disconnecting and reconnecting

### Issue: API Errors

**Solutions**:
1. Check backend is running
2. Verify CORS is configured
3. Check API endpoint URLs
4. Review network tab in browser DevTools

### Issue: Styles Not Loading

**Solutions**:
1. Clear browser cache
2. Check Tailwind CSS is configured
3. Verify postcss.config.js exists
4. Restart development server

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Create production build
- `npm test` - Run tests (when implemented)
- `npm run eject` - Eject from Create React App (⚠️ irreversible)

## Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

## Mobile Testing

The dashboard is fully responsive. Test on:
- Mobile phones (< 640px)
- Tablets (640px - 1024px)
- Desktops (> 1024px)

## Tips for Development

1. **Hot Reload**: The dev server auto-reloads on file changes
2. **React DevTools**: Install React DevTools browser extension
3. **Console**: Check browser console for errors/warnings
4. **Network Tab**: Monitor API calls in browser DevTools

## Getting Help

- 📖 Read `README.md` for detailed documentation
- 📖 Read `IMPLEMENTATION.md` for architecture details
- 🐛 Check GitHub Issues
- 💬 Create new issue for support

## What's Next?

1. **Connect Backend**: Set up Flask backend with endpoints
2. **Deploy to TestNet**: Deploy Algorand smart contracts
3. **Configure App ID**: Update with your deployed app ID
4. **Test End-to-End**: Test full workflow with real blockchain
5. **Deploy to Production**: Deploy frontend to hosting

## Success Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] Dev server running (`npm start`)
- [ ] Wallet connected successfully
- [ ] All tabs accessible
- [ ] No console errors
- [ ] Production build works (`npm run build`)
- [ ] Backend configured (or using mock data)
- [ ] Ready to deploy

## Quick Reference

| Action | Command |
|--------|---------|
| Install | `npm install` |
| Start Dev | `npm start` |
| Build | `npm run build` |
| Open Browser | `http://localhost:3000` |

Happy coding! 🚀
