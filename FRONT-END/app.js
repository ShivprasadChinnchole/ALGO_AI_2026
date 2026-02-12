// --- CONFIGURATION ---
const ALGOD_TOKEN = "vhvhvjkbknlkmjlxdxfcghvghcvhgcghcvhjvhjv"; // Free tier usually requires no token or a specific header
const ALGOD_SERVER = "https://testnet-api.algonode.cloud";
const ALGOD_PORT = "";
const INDEXER_SERVER = "https://testnet-idx.algonode.cloud";

const algodClient = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT);
const indexerClient = new algosdk.Indexer(ALGOD_TOKEN, INDEXER_SERVER, ALGOD_PORT);

// App ID of your deployed DAO Contract (Replace after deployment)
const APP_ID = 12345678; 

// State Variables
let userAccount = null;

// --- 1. WALLET CONNECTION (Simulated Pera Connect) ---
async function connectWallet() {
    const btn = document.getElementById('wallet-btn');
    btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Connecting...`;

    try {
        // In a real app, you would use PeraWalletConnect here.
        // For this demo, we simulate a successful connection.
        setTimeout(() => {
            userAccount = "HEE3...7Z"; // Mock Address
            
            // Update UI
            btn.innerHTML = `
                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <i class="fa-solid fa-user text-xs text-white"></i>
                </div>
                <div class="flex flex-col items-start leading-none">
                    <span class="text-sm font-medium">0x12...8F</span>
                    <span class="text-xs text-green-400">Connected</span>
                </div>
            `;
            btn.classList.add('bg-slate-800');
            
            console.log("Wallet Connected:", userAccount);
            fetchGovernanceData(); // Load data once connected
        }, 1500);
    } catch (err) {
        console.error("Connection Failed:", err);
        btn.innerText = "Connection Failed";
    }
}

// --- 2. VOTING TRANSACTION ---
async function confirmVote(voteType) {
    if (!userAccount) return alert("Please connect your wallet first!");

    const btn = document.getElementById('submit-vote');
    const originalText = btn.innerText;
    btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin mr-2"></i> Signing...`;

    try {
        // A. Get Transaction Params
        const params = await algodClient.getTransactionParams().do();

        // B. Create Application Call Transaction
        // 'vote' is the method name in your Smart Contract
        // voteType (yes/no) is passed as an argument
        const appArgs = [
            new Uint8Array(Buffer.from("vote")),
            new Uint8Array(Buffer.from(voteType))
        ];

        const txn = algosdk.makeApplicationNoOpTxn(
            userAccount, 
            params, 
            APP_ID, 
            appArgs
        );

        // C. Sign & Send (Mocking the Pera Wallet signature step)
        console.log("Requesting signature for txn:", txn);
        
        // --- SIMULATION DELAY ---
        await new Promise(r => setTimeout(r, 2000)); 

        // D. Send to Backend for AI Analytics (Optional but recommended)
        await logVoteToAnalytics(voteType);

        // E. Success UI
        btn.innerHTML = `<i class="fa-solid fa-check mr-2"></i> Vote Confirmed!`;
        btn.classList.replace('bg-blue-600', 'bg-green-600');
        
        // Refresh Data
        fetchGovernanceData();

    } catch (err) {
        console.error("Voting Error:", err);
        btn.innerText = "Vote Failed";
        alert("Transaction failed. Check console for details.");
    }
}

// --- 3. FETCH GLOBAL STATE (REAL-TIME RESULTS) ---
async function fetchGovernanceData() {
    try {
        const appInfo = await algodClient.getApplicationByID(APP_ID).do();
        const globalState = appInfo.params['global-state'];

        let yesVotes = 0;
        let noVotes = 0;

        // Parse State (Algorand stores keys in Base64)
        globalState.forEach(item => {
            const key = window.atob(item.key); // Decode Key
            const value = item.value.uint;     // Get Int Value

            if (key === "yes_votes") yesVotes = value;
            if (key === "no_votes") noVotes = value;
        });

        // Update UI Bars
        const total = yesVotes + noVotes;
        if (total > 0) {
            const yesPercent = Math.round((yesVotes / total) * 100);
            
            // Assuming you have elements with these IDs in your HTML
            document.getElementById('yes-bar').style.width = `${yesPercent}%`;
            document.getElementById('yes-text').innerText = `Yes (${yesPercent}%)`;
        }

    } catch (err) {
        console.log("Could not fetch app state (App might not be deployed yet)");
    }
}

// --- 4. BACKEND INTEGRATION ---
async function logVoteToAnalytics(voteChoice) {
    try {
        await fetch('http://localhost:5000/track-vote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user: userAccount,
                vote: voteChoice,
                timestamp: Date.now()
            })
        });
    } catch (e) {
        console.warn("Analytics backend offline");
    }
}
