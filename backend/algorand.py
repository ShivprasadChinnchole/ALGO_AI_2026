import base64
import os
from algosdk import account, mnemonic
from algosdk.v2client import algod
from algosdk.future.transaction import StateSchema, ApplicationCreateTxn, ApplicationCallTxn, OnComplete
from pyteal import compileTeal, Mode

# Import your contract logic
from dao_contracts import approval_program, clear_state_program

# ==============================================================================
# CONFIGURATION
# ==============================================================================

# 1. ALGORAND NODE (Free TestNet Node via AlgoNode)
ALGOD_ADDRESS = "https://testnet-api.algonode.cloud"
ALGOD_TOKEN = "bhbhbjbfddffgfcgfcgfgcfgcxgxcgxxxx" 

# 2. ADMIN ACCOUNT (The Creator)

CREATOR_MNEMONIC = "cfcfccvgvvvvjhjbjhbjbjbhjbjhbhjbbhbjbbhb"

# Derived Keys
try:
    CREATOR_PK = mnemonic.to_private_key(CREATOR_MNEMONIC)
    CREATOR_ADDR = account.address_from_private_key(CREATOR_PK)
except:
    print("⚠️  ERROR: Please set a valid mnemonic in the code.")
    exit()

# Initialize Client
client = algod.AlgodClient(ALGOD_TOKEN, ALGOD_ADDRESS)

# ==============================================================================
# HELPER FUNCTIONS
# ==============================================================================

def compile_program(client, source_code):
    """Compiles PyTeal -> TEAL -> Bytecode"""
    teal_code = compileTeal(source_code, mode=Mode.Application, version=6)
    response = client.compile(teal_code)
    return base64.b64decode(response['result'])

def wait_for_confirmation(client, txid):
    """Waits for the network to confirm the transaction"""
    last_round = client.status().get('last-round')
    txinfo = client.pending_transaction_info(txid)
    while not (txinfo.get('confirmed-round') and txinfo.get('confirmed-round') > 0):
        print("Waiting for confirmation...")
        last_round += 1
        client.status_after_block(last_round)
        txinfo = client.pending_transaction_info(txid)
    print(f"Transaction {txid} confirmed in round {txinfo.get('confirmed-round')}.")
    return txinfo

# ==============================================================================
# MAIN DEPLOYMENT LOGIC
# ==============================================================================

def deploy_dao():
    print(f"Deploying DAO from account: {CREATOR_ADDR}")
    
    # 1. Compile Contracts
    approval_bin = compile_program(client, approval_program())
    clear_bin = compile_program(client, clear_state_program())
    print("Contracts Compiled.")

    # 2. Define Storage Schema
    # Global: 1 Bytes (Proposal Hash), 3 Ints (Yes, No, Deadline)
    global_schema = StateSchema(num_uints=3, num_byte_slices=1)
    # Local: 1 Int (HasVoted status)
    local_schema = StateSchema(num_uints=1, num_byte_slices=0)

    # 3. Create Deployment Transaction
    params = client.suggested_params()
    
    txn = ApplicationCreateTxn(
        sender=CREATOR_ADDR,
        sp=params,
        on_complete=OnComplete.NoOpOC,
        approval_program=approval_bin,
        clear_program=clear_bin,
        global_schema=global_schema,
        local_schema=local_schema
    )

    # 4. Sign & Send
    signed_txn = txn.sign(CREATOR_PK)
    tx_id = client.send_transaction(signed_txn)
    print(f"Deployment Tx Sent: {tx_id}")

    # 5. Wait & Get App ID
    tx_response = wait_for_confirmation(client, tx_id)
    app_id = tx_response['application-index']
    print(f"✅ DAO DEPLOYED SUCCESSFULLY! App ID: {app_id}")
    return app_id

# ==============================================================================
# INTERACTION LOGIC (Testing the Contract)
# ==============================================================================

def setup_proposal(app_id):
    """Admin sets up a new proposal"""
    print(f"Setting up proposal on App ID: {app_id}...")
    
    params = client.suggested_params()
    
    # Args: [MethodName, DurationSeconds, ProposalHash]
    app_args = [
        b"setup",
        (300).to_bytes(8, 'big'), # 5 Minutes duration
        b"HashOfTheProposalTextXYZ"
    ]

    txn = ApplicationCallTxn(
        sender=CREATOR_ADDR,
        sp=params,
        index=app_id,
        on_complete=OnComplete.NoOpOC,
        app_args=app_args
    )

    signed_txn = txn.sign(CREATOR_PK)
    tx_id = client.send_transaction(signed_txn)
    wait_for_confirmation(client, tx_id)
    print("✅ Proposal Active!")

def cast_vote(app_id, choice):
    """User casts a vote (Self-voting for demo)"""
    print(f"Voting '{choice}' on App ID: {app_id}...")
    
    params = client.suggested_params()

    # 1. Opt-In (Required to use Local State)
    # Check if already opted in, if not, send OptInTxn (Skipped for brevity, assuming fresh)
    # In production, check client.account_info(CREATOR_ADDR) first.
    try:
        optin_txn = ApplicationCallTxn(
            sender=CREATOR_ADDR,
            sp=params,
            index=app_id,
            on_complete=OnComplete.OptIn
        )
        s_optin = optin_txn.sign(CREATOR_PK)
        client.send_transaction(s_optin)
        print("Opted-in to App.")
    except Exception as e:
        print("Already opted in (or error):", e)

    # 2. Vote Transaction
    app_args = [b"vote", choice.encode()]
    
    txn = ApplicationCallTxn(
        sender=CREATOR_ADDR,
        sp=params,
        index=app_id,
        on_complete=OnComplete.NoOpOC,
        app_args=app_args
    )

    signed_txn = txn.sign(CREATOR_PK)
    tx_id = client.send_transaction(signed_txn)
    wait_for_confirmation(client, tx_id)
    print(f"✅ Voted '{choice}' successfully!")

def read_results(app_id):
    """Reads the Global State of the App"""
    app_info = client.application_info(app_id)
    global_state = app_info['params']['global-state']
    
    print("\n--- 🗳️ CURRENT RESULTS ---")
    for item in global_state:
        key = base64.b64decode(item['key']).decode('utf-8')
        value = item['value']['uint'] if item['value']['type'] == 1 else item['value']['bytes']
        print(f"{key}: {value}")
    print("--------------------------\n")

# ==============================================================================
# EXECUTION
# ==============================================================================

if __name__ == "__main__":
    # 1. Deploy
    app_id = deploy_dao()
    
    # 2. Setup a Proposal (Duration: 5 mins)
    setup_proposal(app_id)
    
    # 3. Vote "yes"
    cast_vote(app_id, "yes")
    
    # 4. See Results
    read_results(app_id)
