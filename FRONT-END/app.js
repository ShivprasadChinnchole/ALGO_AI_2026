/**
 * ======================================================================================
 * TRUSTCHAIN CAMPUS - MAIN APPLICATION LOGIC
 * ======================================================================================
 * * Architecture:
 * 1. Global State Management (Store)
 * 2. Service Layer (Blockchain, API, AI, Auth)
 * 3. Router & Navigation
 * 4. UI Component Renderers
 * 5. Event Listeners & Utilities
// ======================================================================================
// 1. CONFIGURATION & CONSTANTS
// ======================================================================================

const CONFIG = {
    APP_NAME: "TrustChain Campus",
    VERSION: "2.4.0",
    NETWORK: "TestNet",
    API_URL: "http://localhost:5000", // Python Backend
    ALGOD_SERVER: "https://testnet-api.algonode.cloud",
    INDEXER_SERVER: "https://testnet-idx.algonode.cloud",
    TOKEN_ID: 100234, // Mock Governance Token ID
    REFRESH_RATE: 5000, // ms
    TOAST_DURATION: 3000,
};

const ROUTES = {
    DASHBOARD: 'dashboard',
    GOVERNANCE: 'governance',
    PROPOSAL: 'proposal',
    WALLET: 'wallet',
    ANALYTICS: 'analytics',
    ADMIN: 'admin'
};

// ======================================================================================
// 2. GLOBAL STATE MANAGEMENT (The "Store")
// ======================================================================================

const Store = {
    state: {
        currentPage: ROUTES.DASHBOARD,
        user: {
            address: null,
            isConnected: false,
            balance: 0,
            tokenBalance: 0,
            delegatedPower: 0,
            transactions: []
        },
        proposals: [], // Fetched from "Blockchain"
        activeProposalId: null,
        network: {
            blockHeight: 29482100,
            tps: 4200,
            status: "Online"
        },
        notifications: [],
        isLoading: false
    },

    // --- Actions ---
    
    setUser(address) {
        this.state.user.address = address;
        this.state.user.isConnected = !!address;
        this.notifySubscribers();
    },

    setPage(page, params = {}) {
        this.state.currentPage = page;
        if (params.id) this.state.activeProposalId = params.id;
        
        // Update URL without reload
        const url = new URL(window.location);
        url.searchParams.set('page', page);
        if (params.id) url.searchParams.set('id', params.id);
        else url.searchParams.delete('id');
        window.history.pushState({}, '', url);

        this.notifySubscribers();
    },

    setProposals(data) {
        this.state.proposals = data;
        this.notifySubscribers();
    },

    addTransaction(tx) {
        this.state.user.transactions.unshift(tx);
        this.notifySubscribers();
    },

    setLoading(bool) {
        this.state.isLoading = bool;
        // Toggle global spinner if it exists
        const loader = document.getElementById('global-loader');
        if(loader) loader.style.display = bool ? 'flex' : 'none';
    },

    // --- Observer Pattern ---
    subscribers: [],
    subscribe(fn) {
        this.subscribers.push(fn);
    },
    notifySubscribers() {
        this.subscribers.forEach(fn => fn(this.state));
        renderApp(); // Trigger Re-render
    }
};

// ======================================================================================
// 3. UTILITIES
// ======================================================================================

const Utils = {
    shortenAddress: (addr) => addr ? `${addr.slice(0, 4)}...${addr.slice(-4)}` : '',
    
    formatNumber: (num) => new Intl.NumberFormat('en-US').format(num),
    
    formatCurrency: (num) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num),

    sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

    generateId: () => Math.random().toString(36).substr(2, 9),

    randomInt: (min, max) => Math.floor(Math.random() * (max - min + 1) + min),

    timeAgo: (date) => {
        const seconds = Math.floor((new Date() - date) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    },

    // Generates deterministic colors from strings (for user avatars)
    stringToColor: (str) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
        return '#' + '00000'.substring(0, 6 - c.length) + c;
    }
};

// ======================================================================================
// 4. SERVICES (API & LOGIC LAYER)
// ======================================================================================

const BlockchainService = {
    // Simulates fetching data from Algorand Indexer
    async fetchProposals() {
        Store.setLoading(true);
        await Utils.sleep(800); // Simulate network latency

        // Mock Data Generation
        const mockProposals = [
            {
                id: 1042,
                title: "Upgrade Campus Wi-Fi to WiFi 6E",
                description: "Allocate 5,000 ALGO from the treasury to upgrade the networking infrastructure in the main library and student dorms A, B, and C.",
                creator: "ALGO...WIFI",
                status: "Active",
                deadline: new Date(Date.now() + 86400000 * 2), // 2 days left
                votesYes: 840,
                votesNo: 120,
                quorum: 2000,
                category: "Infrastructure",
                comments: 45
            },
            {
                id: 1041,
                title: "New Cafeteria Vendor: 'Green Eatz'",
                description: "Proposal to replace the current vendor in Block D with 'Green Eatz', focusing on sustainable and vegan options.",
                creator: "VEG...EATZ",
                status: "Active",
                deadline: new Date(Date.now() + 86400000 * 5),
                votesYes: 300,
                votesNo: 450,
                quorum: 2000,
                category: "Services",
                comments: 122
            },
            {
                id: 1040,
                title: "Hackathon Q1 Budget Approval",
                description: "Requesting 10,000 ALGO for prizes and logistics for the upcoming Spring Blockchain Hackathon.",
                creator: "HACK...TEAM",
                status: "Passed",
                deadline: new Date(Date.now() - 86400000 * 10),
                votesYes: 1800,
                votesNo: 20,
                quorum: 1500,
                category: "Events",
                comments: 12
            },
            {
                id: 1039,
                title: "Extend Library Hours to 24/7",
                description: "Proposal to hire additional security staff to allow the library to remain open 24 hours during exam weeks.",
                creator: "STU...DENT",
                status: "Rejected",
                deadline: new Date(Date.now() - 86400000 * 20),
                votesYes: 400,
                votesNo: 1600,
                quorum: 2000,
                category: "Policy",
                comments: 89
            }
        ];
        
        Store.setProposals(mockProposals);
        Store.setLoading(false);
        return mockProposals;
    },

    // Simulates a wallet connection
    async connectWallet() {
        Store.setLoading(true);
        await Utils.sleep(1500);
        
        // Mock successful connection
        const mockAddress = "W23T...X7Z9";
        Store.setUser(mockAddress);
        
        // Mock fetching assets
        Store.state.user.balance = 125.40;
        Store.state.user.tokenBalance = 5000;
        
        Toaster.show("Wallet Connected Successfully", "success");
        Store.setLoading(false);
    },

    // Simulates a transaction signing and submission
    async submitVote(proposalId, vote) {
        if (!Store.state.user.isConnected) {
            Toaster.show("Please connect wallet first", "error");
            return;
        }

        Store.setLoading(true);
        
        // 1. Fetch Params (Simulated)
        console.log("Fetching params...");
        await Utils.sleep(500);

        // 2. Sign Transaction (Simulated Pera Popup)
        console.log("Requesting signature...");
        await Utils.sleep(1500);

        // 3. Broadcast (Simulated)
        console.log("Broadcasting to network...");
        await Utils.sleep(1000);

        // 4. Update Local State (Optimistic UI Update)
        const proposal = Store.state.proposals.find(p => p.id == proposalId);
        if (proposal) {
            if(vote === 'yes') proposal.votesYes++;
            else proposal.votesNo++;
        }

        Store.addTransaction({
            type: "Vote",
            target: `Proposal #${proposalId}`,
            hash: "TX" + Utils.generateId().toUpperCase(),
            timestamp: new Date()
        });

        Toaster.show("Vote Confirmed On-Chain!", "success");
        
        // 5. Trigger Analytics (Fire and forget)
        AIService.analyzeTraffic();

        Store.setLoading(false);
        return true;
    }
};

const AIService = {
    // Simulates the Python Backend call
    analyzeTraffic: async () => {
        // Mock API Call
        console.log("[AI] Analyzing network traffic for burst voting...");
        // In real app: fetch(`${CONFIG.API_URL}/analytics`)
    },
    
    getSentiment: (proposalText) => {
        // Simple mock sentiment analysis based on keywords
        const positiveWords = ['upgrade', 'improve', 'budget', 'good', 'benefit'];
        const negativeWords = ['cut', 'remove', 'restrict', 'bad', 'cost'];
        
        let score = 0;
        positiveWords.forEach(w => { if(proposalText.toLowerCase().includes(w)) score += 0.2; });
        negativeWords.forEach(w => { if(proposalText.toLowerCase().includes(w)) score -= 0.2; });
        
        return Math.min(Math.max(score, -1), 1); // Clamp between -1 and 1
    }
};

// ======================================================================================
// 5. UI COMPONENTS (RENDERERS)
// ======================================================================================

const Components = {
    
    // --- Dashboard View ---
    Dashboard: () => {
        const { proposals, user } = Store.state;
        const activeProposals = proposals.filter(p => p.status === 'Active');
        
        return `
            <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    ${Components.StatCard("Active Proposals", activeProposals.length, "fa-file-contract", "text-blue-400")}
                    ${Components.StatCard("Your Voting Power", user.tokenBalance, "fa-bolt", "text-yellow-400")}
                    ${Components.StatCard("Network Status", "Optimal", "fa-network-wired", "text-green-400")}
                </div>

                ${activeProposals.length > 0 ? `
                <div class="relative rounded-3xl overflow-hidden p-8 border border-slate-700/50 group bg-slate-900/50">
                    <div class="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 z-0"></div>
                    <div class="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                        <div>
                            <span class="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold border border-blue-500/30 mb-4 inline-block">
                                <i class="fa-solid fa-fire mr-1"></i> TRENDING
                            </span>
                            <h2 class="text-3xl font-bold text-white mb-2">${activeProposals[0].title}</h2>
                            <p class="text-slate-300 max-w-xl line-clamp-2">${activeProposals[0].description}</p>
                        </div>
                        <button onclick="Router.navigate('${ROUTES.PROPOSAL}', {id: ${activeProposals[0].id}})" 
                            class="px-6 py-3 bg-white text-slate-900 rounded-xl font-bold hover:scale-105 transition-transform">
                            View & Vote
                        </button>
                    </div>
                </div>` : ''}

                <div>
                    <h3 class="text-xl font-bold text-white mb-4">Recent Network Activity</h3>
                    <div class="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-3">
                        ${[1,2,3].map(() => `
                        <div class="flex items-center gap-4 p-3 hover:bg-slate-800/50 rounded-lg transition">
                            <div class="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                                <i class="fa-solid fa-cube"></i>
                            </div>
                            <div class="flex-1">
                                <p class="text-sm text-white">Block #${Store.state.network.blockHeight + Utils.randomInt(1, 100)} Minted</p>
                                <p class="text-xs text-slate-500">${Utils.randomInt(1, 10)} seconds ago</p>
                            </div>
                            <span class="text-xs font-mono text-green-400">Success</span>
                        </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    // --- Governance List View ---
    Governance: () => {
        const { proposals } = Store.state;
        
        return `
            <div class="space-y-6 animate-in fade-in">
                <div class="flex justify-between items-center">
                    <h2 class="text-2xl font-bold text-white">All Proposals</h2>
                    <div class="flex gap-2">
                        <select class="bg-slate-800 text-white text-sm rounded-lg px-3 py-2 border border-slate-700">
                            <option>All Categories</option>
                            <option>Infrastructure</option>
                            <option>Budget</option>
                        </select>
                        <button class="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm transition">
                            Create Proposal
                        </button>
                    </div>
                </div>

                <div class="grid gap-4">
                    ${proposals.map(p => Components.ProposalCard(p)).join('')}
                </div>
            </div>
        `;
    },

    // --- Single Proposal Detail View ---
    ProposalDetail: () => {
        const id = Store.state.activeProposalId;
        const proposal = Store.state.proposals.find(p => p.id == id);
        
        if (!proposal) return `<div class="text-center text-slate-400 mt-20">Proposal Not Found</div>`;

        const totalVotes = proposal.votesYes + proposal.votesNo;
        const yesPercent = totalVotes === 0 ? 0 : Math.round((proposal.votesYes / totalVotes) * 100);
        const noPercent = totalVotes === 0 ? 0 : Math.round((proposal.votesNo / totalVotes) * 100);

        return `
            <div class="space-y-6 animate-in slide-in-from-right-8">
                <button onclick="Router.navigate('${ROUTES.GOVERNANCE}')" class="text-sm text-slate-400 hover:text-white flex items-center gap-2">
                    <i class="fa-solid fa-arrow-left"></i> Back to List
                </button>

                <div class="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl">
                    <div class="flex justify-between items-start mb-6">
                        <div>
                            <div class="flex gap-2 mb-3">
                                <span class="bg-slate-800 text-xs px-2 py-1 rounded text-slate-300 border border-slate-700">#${proposal.id}</span>
                                <span class="bg-${proposal.status === 'Active' ? 'green' : 'gray'}-500/10 text-${proposal.status === 'Active' ? 'green' : 'gray'}-400 text-xs px-2 py-1 rounded border border-${proposal.status === 'Active' ? 'green' : 'gray'}-500/20">${proposal.status}</span>
                            </div>
                            <h1 class="text-3xl font-bold text-white mb-2">${proposal.title}</h1>
                            <div class="flex items-center gap-2 text-sm text-slate-400">
                                <span>Created by <span class="font-mono text-blue-400">${proposal.creator}</span></span>
                                <span>•</span>
                                <span>${Utils.timeAgo(new Date(proposal.deadline - 86400000))}</span>
                            </div>
                        </div>
                        <div class="text-right hidden md:block">
                            <div class="text-xs text-slate-500">Deadline</div>
                            <div class="text-xl font-mono text-white">${new Date(proposal.deadline).toLocaleDateString()}</div>
                        </div>
                    </div>

                    <p class="text-slate-300 leading-relaxed text-lg border-t border-slate-800 pt-6 mb-8">
                        ${proposal.description}
                    </p>

                    <div class="bg-slate-950 rounded-xl p-6 border border-slate-800 mb-8">
                        <div class="flex justify-between mb-2">
                            <span class="text-green-400 font-bold"><i class="fa-solid fa-check"></i> YES (${yesPercent}%)</span>
                            <span class="text-red-400 font-bold">NO (${noPercent}%) <i class="fa-solid fa-xmark"></i></span>
                        </div>
                        <div class="h-4 bg-slate-800 rounded-full overflow-hidden flex">
                            <div class="h-full bg-green-500 transition-all duration-1000" style="width: ${yesPercent}%"></div>
                            <div class="h-full bg-red-500 transition-all duration-1000" style="width: ${noPercent}%"></div>
                        </div>
                        <div class="mt-2 text-center text-xs text-slate-500">
                            ${totalVotes} Votes Cast (Quorum: ${proposal.quorum})
                        </div>
                    </div>

                    ${proposal.status === 'Active' ? `
                    <div class="grid grid-cols-2 gap-4">
                        <button onclick="BlockchainService.submitVote(${proposal.id}, 'yes')" class="p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl hover:bg-green-500 hover:text-white transition font-bold text-center">
                            Vote YES
                        </button>
                        <button onclick="BlockchainService.submitVote(${proposal.id}, 'no')" class="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition font-bold text-center">
                            Vote NO
                        </button>
                    </div>
                    ` : `
                    <div class="p-4 bg-slate-800 text-center rounded-xl text-slate-400">
                        Voting Closed
                    </div>
                    `}
                </div>
            </div>
        `;
    },

    // --- Wallet View ---
    Wallet: () => {
        const { user } = Store.state;
        if (!user.isConnected) return Components.ConnectWalletPrompt();

        return `
            <div class="space-y-6 animate-in fade-in">
                <h2 class="text-2xl font-bold text-white">My Assets</h2>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-2xl border border-slate-700">
                        <div class="text-slate-400 text-sm mb-1">Native Token</div>
                        <div class="text-3xl font-bold text-white mb-2">${user.balance} ALGO</div>
                        <div class="text-xs text-green-400">≈ $${(user.balance * 0.18).toFixed(2)} USD</div>
                    </div>
                    <div class="bg-gradient-to-br from-blue-900/50 to-purple-900/50 p-6 rounded-2xl border border-blue-500/30">
                        <div class="text-blue-300 text-sm mb-1">Governance Token</div>
                        <div class="text-3xl font-bold text-white mb-2">${Utils.formatNumber(user.tokenBalance)} GOV</div>
                        <div class="text-xs text-blue-300">Voting Power: High</div>
                    </div>
                </div>

                <div class="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                    <h3 class="text-lg font-bold text-white mb-4">Transaction History</h3>
                    <div class="space-y-0 divide-y divide-slate-800">
                        ${user.transactions.length > 0 ? user.transactions.map(tx => `
                            <div class="py-4 flex items-center justify-between">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                                        <i class="fa-solid fa-arrow-right-arrow-left"></i>
                                    </div>
                                    <div>
                                        <div class="text-white font-medium">${tx.type}</div>
                                        <div class="text-xs text-slate-500 font-mono">${tx.target}</div>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <div class="text-xs text-green-400">Confirmed</div>
                                    <a href="#" class="text-xs text-slate-500 hover:text-blue-400 font-mono">${tx.hash}</a>
                                </div>
                            </div>
                        `).join('') : '<div class="text-center text-slate-500 py-4">No recent transactions</div>'}
                    </div>
                </div>
            </div>
        `;
    },

    // --- Helper: Stat Card ---
    StatCard: (title, value, icon, colorClass) => `
        <div class="glass p-6 rounded-2xl border border-slate-700/50 hover:border-slate-600 transition group">
            <div class="flex justify-between items-start">
                <div>
                    <p class="text-slate-400 text-sm font-medium">${title}</p>
                    <h3 class="text-3xl font-bold text-white mt-2">${value}</h3>
                </div>
                <div class="p-3 rounded-lg bg-slate-800 ${colorClass}">
                    <i class="fa-solid ${icon} text-xl"></i>
                </div>
            </div>
        </div>
    `,

    // --- Helper: Proposal Card ---
    ProposalCard: (p) => `
        <div onclick="Router.navigate('${ROUTES.PROPOSAL}', {id: ${p.id}})" 
             class="glass p-6 rounded-xl border border-slate-700/50 hover:border-blue-500/30 transition-all cursor-pointer group">
            <div class="flex items-center gap-4">
                <div class="p-4 bg-slate-800 rounded-lg text-center min-w-[80px]">
                    <span class="block text-2xl font-bold text-white">${new Date(p.deadline).getDate()}</span>
                    <span class="text-xs text-slate-500 uppercase">${new Date(p.deadline).toLocaleString('default', { month: 'short' })}</span>
                </div>
                <div class="flex-1">
                    <div class="flex justify-between mb-1">
                        <span class="text-xs font-mono text-slate-500">ID: #${p.id}</span>
                        <span class="text-xs ${p.status === 'Active' ? 'text-green-400' : 'text-slate-500'}">${p.status}</span>
                    </div>
                    <h4 class="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">${p.title}</h4>
                    <p class="text-sm text-slate-400 line-clamp-1">${p.description}</p>
                </div>
                <div class="hidden md:block text-right min-w-[100px]">
                    <div class="text-sm font-bold text-white">${p.votesYes + p.votesNo} Votes</div>
                    <div class="text-xs text-slate-500">Quorum: ${(p.quorum / 1000).toFixed(1)}k</div>
                </div>
            </div>
        </div>
    `,

    // --- Helper: Connect Wallet Prompt ---
    ConnectWalletPrompt: () => `
        <div class="flex flex-col items-center justify-center h-[50vh] text-center">
            <div class="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <i class="fa-solid fa-wallet text-3xl text-slate-500"></i>
            </div>
            <h3 class="text-2xl font-bold text-white mb-2">Wallet Not Connected</h3>
            <p class="text-slate-400 max-w-md mb-8">Connect your Pera Wallet to access your dashboard.</p>
            <button onclick="BlockchainService.connectWallet()" class="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold transition shadow-lg shadow-blue-500/20">
                Connect Wallet
            </button>
        </div>
    `
};

// ======================================================================================
// 6. TOAST NOTIFICATION SYSTEM
// ======================================================================================

const Toaster = {
    init() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'fixed bottom-4 right-4 z-50 flex flex-col gap-2';
        document.body.appendChild(container);
    },
    
    show(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        
        // Tailwind classes based on type
        const colors = {
            success: 'bg-green-600 text-white',
            error: 'bg-red-600 text-white',
            info: 'bg-blue-600 text-white'
        };
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            info: 'fa-info-circle'
        };

        toast.className = `${colors[type]} px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 transform translate-y-10 opacity-0 transition-all duration-300 min-w-[300px]`;
        toast.innerHTML = `
            <i class="fa-solid ${icons[type]}"></i>
            <span class="font-medium">${message}</span>
        `;
        
        container.appendChild(toast);
        
        // Animate In
        requestAnimationFrame(() => {
            toast.classList.remove('translate-y-10', 'opacity-0');
        });
        
        // Remove after delay
        setTimeout(() => {
            toast.classList.add('translate-y-10', 'opacity-0');
            setTimeout(() => toast.remove(), 300);
        }, CONFIG.TOAST_DURATION);
    }
};

// ======================================================================================
// 7. ROUTER & NAVIGATION CONTROLLER
// ======================================================================================

const Router = {
    init() {
        // Handle Back/Forward browser buttons
        window.addEventListener('popstate', () => {
            const params = new URLSearchParams(window.location.search);
            const page = params.get('page') || ROUTES.DASHBOARD;
            const id = params.get('id');
            Store.setPage(page, { id });
        });

        // Initial Load
        const params = new URLSearchParams(window.location.search);
        const page = params.get('page') || ROUTES.DASHBOARD;
        const id = params.get('id');
        Store.setPage(page, { id });
    },

    navigate(page, params = {}) {
        Store.setPage(page, params);
    }
};

// ======================================================================================
// 8. MAIN RENDER LOOP
// ======================================================================================

function renderApp() {
    const { currentPage, user } = Store.state;
    const contentContainer = document.querySelector('main > div.flex-1'); // The scrollable area
    
    if(!contentContainer) return; // Guard clause

    // 1. Update Navigation State (Sidebar Active Classes)
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.remove('active', 'bg-blue-500/10', 'text-blue-400', 'border', 'border-blue-500/20');
        el.classList.add('text-slate-400');
        
        // Simple matching logic
        if (el.getAttribute('onclick')?.includes(currentPage)) {
            el.classList.add('active', 'bg-blue-500/10', 'text-blue-400', 'border', 'border-blue-500/20');
            el.classList.remove('text-slate-400');
        }
    });

    // 2. Render View Content
    // We clear current content and inject new HTML string
    // In React this is VirtualDOM, here it's direct DOM manipulation
    let html = '';
    
    switch(currentPage) {
        case ROUTES.DASHBOARD:
            html = Components.Dashboard();
            break;
        case ROUTES.GOVERNANCE: // Voting List
        case 'voting': // Alias
            html = Components.Governance();
            break;
        case ROUTES.PROPOSAL:
            html = Components.ProposalDetail();
            break;
        case ROUTES.WALLET:
            html = Components.Wallet();
            break;
        case ROUTES.ANALYTICS:
            html = `<div class="p-10 text-center"><h2 class="text-2xl text-white">AI Analytics Module Loading...</h2></div>`;
            // Trigger async load for analytics charts if we were using Chart.js
            break;
        default:
            html = Components.Dashboard();
    }

    // Safely update DOM
    const viewContainer = document.getElementById('view-container') || createViewContainer(contentContainer);
    viewContainer.innerHTML = html;

    // 3. Update Header Info
    const pageTitle = document.querySelector('header h2');
    if(pageTitle) pageTitle.innerText = currentPage.charAt(0).toUpperCase() + currentPage.slice(1);
}

// Helper to ensure container exists inside main
function createViewContainer(parent) {
    // Clear existing static HTML from index.html first time
    parent.innerHTML = ''; 
    const div = document.createElement('div');
    div.id = 'view-container';
    parent.appendChild(div);
    return div;
}

// ======================================================================================
// 9. APP INITIALIZATION
// ======================================================================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log(`%c ${CONFIG.APP_NAME} v${CONFIG.VERSION} `, 'background: #222; color: #bada55; font-size: 20px');

    // 1. Initialize System Components
    Toaster.init();
    
    // 2. Subscribe Render Loop to Store
    Store.subscribe(state => {
        // Optional: Log state changes for debugging
        // console.log('State Updated:', state);
    });

    // 3. Initial Data Fetch
    await BlockchainService.fetchProposals();

    // 4. Start Router (Will trigger first render)
    Router.init();

    // 5. Global Event Delegation (Optional optimizations)
    document.body.addEventListener('click', e => {
        // Handle generic modal closing, etc.
    });
});

// Expose services to window for HTML onclick handlers
window.Store = Store;
window.Router = Router;
window.BlockchainService = BlockchainService;
window.Utils = Utils;

// ======================================================================================
// END OF FILE
// ======================================================================================
