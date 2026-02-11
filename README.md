# TrustChain Campus - Algorand Governance Dashboard

A comprehensive React frontend dashboard for TrustChain Campus with Algorand blockchain integration using Pera Wallet.

## Features

### 1. **Wallet Integration**
- Pera Wallet connection functionality
- Connected wallet address display
- Wallet disconnection
- Connection status indicator

### 2. **Proposal Management**
- Create governance proposals with title and description
- Form validation
- Success/Error feedback
- Transaction hash display

### 3. **Voting System**
- Vote Yes/No on proposals
- Real-time vote count display
- Vote results visualization
- Transaction confirmation

### 4. **Attendance System**
- Mark attendance on blockchain
- Attendance history tracking
- Status display
- Transaction confirmation

### 5. **Certificate Verification**
- Verify certificates by ID
- Display certificate details
- Blockchain-verified authenticity
- Certificate information display

### 6. **AI Analytics Dashboard**
- AI-powered governance insights
- Participation metrics visualization
- Trends and predictions
- Interactive charts and graphs

## Technology Stack

- **React** 18.2.0 - UI framework
- **Tailwind CSS** 3.3.2 - Styling
- **@perawallet/connect** - Algorand wallet integration
- **Recharts** - Analytics visualization
- **React Scripts** - Build tooling

## Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

## Project Structure

```
src/
├── components/
│   ├── WalletConnect.jsx       # Pera Wallet integration
│   ├── ProposalForm.jsx        # Create proposals
│   ├── VotingPanel.jsx         # Vote on proposals
│   ├── AttendancePanel.jsx     # Mark attendance
│   ├── CertificatePanel.jsx    # Verify certificates
│   └── AnalyticsDashboard.jsx  # AI analytics
├── App.jsx                     # Main application
├── App.css                     # App-specific styles
├── index.js                    # Entry point
└── index.css                   # Global styles
```

## API Endpoints

The dashboard communicates with a Flask backend using these endpoints:

- `POST /api/wallet/connect` - Connect wallet
- `POST /api/proposals` - Create proposal
- `GET /api/proposals` - Get all proposals
- `GET /api/proposals/:id` - Get proposal details
- `POST /api/vote` - Submit vote
- `POST /api/attendance` - Mark attendance
- `GET /api/attendance` - Get attendance status
- `POST /api/certificate/verify` - Verify certificate
- `GET /api/analytics` - Get AI analytics

## Configuration

### App ID
Update the `APP_ID` in `src/App.jsx` with your Algorand smart contract App ID:

```javascript
const APP_ID = 'YOUR_APP_ID_HERE';
```

### API Base URL
By default, the app uses relative URLs for API calls. To configure a custom backend URL, create a `.env` file:

```env
REACT_APP_API_URL=http://your-backend-url.com
```

## Features in Detail

### Wallet Connection
- Auto-reconnects to existing sessions
- Displays connection status with visual indicator
- Shows formatted and full wallet addresses
- Handles connection errors gracefully

### Proposal Creation
- Minimum 5 characters for title
- Minimum 20 characters for description
- Character count display
- Real-time validation

### Voting
- Two-column layout: proposals list and voting details
- Progress bars for vote visualization
- Prevents voting without wallet connection
- Displays transaction hash after voting

### Attendance
- One-click attendance marking
- Historical attendance records
- Visual status indicators
- Blockchain transaction confirmation

### Certificate Verification
- Instant verification by certificate ID
- Detailed certificate information display
- Visual verification badge
- Blockchain transaction reference

### Analytics
- Overview metrics (proposals, votes, participants, attendance rate)
- Participation trend charts
- Vote distribution pie chart
- Top contributors bar chart
- AI-powered insights
- Future predictions

## Responsive Design

The dashboard is fully responsive with breakpoints for:
- Mobile (< 640px)
- Tablet (640px - 1024px)
- Desktop (> 1024px)

## Accessibility

- ARIA labels on interactive elements
- Keyboard navigation support
- Screen reader friendly
- High contrast colors
- Focus indicators

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development

### Available Scripts

- `npm start` - Run development server on http://localhost:3000
- `npm build` - Create production build in `build/` folder
- `npm test` - Run test suite
- `npm eject` - Eject from Create React App (one-way operation)

### Code Quality

- Follow React best practices
- Use functional components with hooks
- Implement proper error handling
- Add descriptive comments
- Use semantic HTML

## Deployment

### Build for Production

```bash
npm run build
```

The optimized build will be created in the `build/` folder.

### Deploy to Hosting

The build folder can be deployed to any static hosting service:
- Vercel
- Netlify
- GitHub Pages
- AWS S3
- Firebase Hosting

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - See LICENSE file for details

## Support

For issues and questions:
- GitHub Issues: [Repository Issues](https://github.com/ShivprasadChinnchole/ALGO_AI_2026/issues)
- Documentation: See this README

## Acknowledgments

- Built on Algorand blockchain
- Powered by Pera Wallet
- UI components styled with Tailwind CSS
- Charts powered by Recharts
