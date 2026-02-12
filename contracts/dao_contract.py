from pyteal import *

def approval_program():
    """
    Returns the approval program for the TrustChain Campus DAO.
    This logic runs every time the application is called.
    """

    # --- CONSTANTS & STATE KEYS ---
    # Global State Keys (Stored on the App itself)
    CountYes = Bytes("yes_votes")
    CountNo = Bytes("no_votes")
    Deadline = Bytes("voting_deadline")
    ProposalHash = Bytes("proposal_hash")
    Admin = Bytes("admin")

    # Local State Keys (Stored in the User's account storage)
    HasVoted = Bytes("has_voted")

    # Arguments passed to the contract methods
    # Arg[0] is usually the method name (e.g., "vote", "setup")
    method_arg = Txn.application_args[0]

    # --- 1. APP CREATION (Deploy DAO) ---
    # Runs once when the contract is first deployed
    on_creation = Seq([
        App.globalPut(CountYes, Int(0)),
        App.globalPut(CountNo, Int(0)),
        App.globalPut(Deadline, Int(0)),
        App.globalPut(ProposalHash, Bytes("")),
        App.globalPut(Admin, Txn.sender()), # Set the creator as Admin
        Approve()
    ])

    # --- 2. SETUP PROPOSAL (Admin Only) ---
    # Resets the vote counts and starts a new voting session
    # Args: "setup", duration_seconds, proposal_hash_string
    setup_duration = Btoi(Txn.application_args[1])
    setup_hash = Txn.application_args[2]

    setup_proposal = Seq([
        # Security Check: Only Admin can start a proposal
        Assert(Txn.sender() == App.globalGet(Admin)),
        
        # Reset Counters
        App.globalPut(CountYes, Int(0)),
        App.globalPut(CountNo, Int(0)),
        
        # Set New Deadline (Current Global Timestamp + Duration)
        App.globalPut(Deadline, Global.latest_timestamp() + setup_duration),
        
        # Store Proposal Hash (Links on-chain data to off-chain text)
        App.globalPut(ProposalHash, setup_hash),
        
        Approve()
    ])

    # --- 3. VOTING LOGIC (Public) ---
    # Users vote "yes" or "no". Checks deadline and double-voting.
    # Args: "vote", choice_string ("yes" or "no")
    vote_choice = Txn.application_args[1]
    
    vote = Seq([
        # Check 1: Ensure Voting is still active (Now < Deadline)
        Assert(Global.latest_timestamp() <= App.globalGet(Deadline)),
        
        # Check 2: Ensure User has Opted-In (Local State exists)
        Assert(App.optedIn(Txn.sender(), Global.current_application_id())),
        
        # Check 3: Ensure User hasn't voted yet (HasVoted == 0)
        Assert(App.localGet(Txn.sender(), HasVoted) == Int(0)),

        # Logic: Increment the correct counter
        If(vote_choice == Bytes("yes"))
        .Then(App.globalPut(CountYes, App.globalGet(CountYes) + Int(1)))
        .ElseIf(vote_choice == Bytes("no"))
        .Then(App.globalPut(CountNo, App.globalGet(CountNo) + Int(1)))
        .Else(Reject()), # Fail if choice is garbage data

        # Mark User as Voted
        App.localPut(Txn.sender(), HasVoted, Int(1)),
        
        Approve()
    ])

    # --- 4. ROUTING LOGIC ---
    # Decides which logic block to run based on transaction type
    program = Cond(
        # Application Creation
        [Txn.application_id() == Int(0), on_creation],
        
        # Delete Application (Admin only)
        [Txn.on_completion() == OnComplete.DeleteApplication, 
         Return(Txn.sender() == App.globalGet(Admin))],
        
        # Update Application (Admin only)
        [Txn.on_completion() == OnComplete.UpdateApplication, 
         Return(Txn.sender() == App.globalGet(Admin))],
        
        # Close Out (User force-quits app, rarely used here)
        [Txn.on_completion() == OnComplete.CloseOut, Approve()],
        
        # Opt-In (User initializes their Local State to participate)
        [Txn.on_completion() == OnComplete.OptIn, Seq([
            App.localPut(Txn.sender(), HasVoted, Int(0)), # Initialize to 0
            Approve()
        ])],
        
        # NoOp (Normal Function Calls like "vote" or "setup")
        [Txn.on_completion() == OnComplete.NoOpOC, Cond(
            [method_arg == Bytes("setup"), setup_proposal],
            [method_arg == Bytes("vote"), vote]
        )]
    )

    return program

def clear_state_program():
    """
    Returns the clear state program.
    Runs if a user clears their local state (removes the app).
    We simply approve this action.
    """
    return Approve()

# --- COMPILER HELPER ---
# Run this file directly to generate the TEAL code
if __name__ == "__main__":
    with open("approval.teal", "w") as f:
        compiled = compileTeal(approval_program(), mode=Mode.Application, version=6)
        f.write(compiled)
        
    with open("clear.teal", "w") as f:
        compiled = compileTeal(clear_state_program(), mode=Mode.Application, version=6)
        f.write(compiled)

    print("[SUCCESS] Contracts compiled to 'approval.teal' and 'clear.teal'")
