
import { Clarinet, Tx, Chain, Account, types, EmptyBlock } from 'https://deno.land/x/clarinet@v0.31.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

// Test active collections
Clarinet.test({
    name: "active-collections",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!;
        const call = chain.callReadOnlyFn("staking", "active-collections", [], deployer.address)

        call.result.expectList()
        console.log(JSON.stringify(call.result));
    },
});

// Test active collections punks custodial
Clarinet.test({
    name: "active-collections custodial",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!;

        chain.mineBlock([
            Tx.contractCall("staking", "admin-add-new-custodial-collection", [types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.punks"),types.uint(10)], deployer.address)
        ]);

        const call = chain.callReadOnlyFn("staking", "active-collections", [], deployer.address)

        call.result.expectList();
        console.log(JSON.stringify(call.result));
    },
});

// Test active collections hardware non custodial
Clarinet.test({
    name: "active-collections non-custodial",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!;

        chain.mineBlock([
            Tx.contractCall("staking", "admin-add-new-non-custodial-collection", [types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.hardware-top-example"),types.uint(10)], deployer.address)
        ]);

        const call = chain.callReadOnlyFn("staking", "active-collections", [], deployer.address)

        call.result.expectList();
        console.log(JSON.stringify(call.result));
    },
});

// Test active collections hardware non custodial punks custodial
Clarinet.test({
    name: "active-collections both",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!;

        chain.mineBlock([
            Tx.contractCall("staking", "admin-add-new-non-custodial-collection", [types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.hardware-top-example"),types.uint(10)], deployer.address)
        ]);

        chain.mineBlock([
            Tx.contractCall("staking", "admin-add-new-custodial-collection", [types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.punks"),types.uint(10)], deployer.address)
        ]);

        const call = chain.callReadOnlyFn("staking", "active-collections", [], deployer.address)

        call.result.expectList();
        console.log(JSON.stringify(call.result));
    },
});

// Test get total generation
Clarinet.test({
    name: "get-total-generation",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!;

        const call = chain.callReadOnlyFn("staking", "get-total-generation", [], deployer.address)

        call.result.expectOk().expectUint(0)
        console.log(JSON.stringify(call.result));
    },
});

//get-generation-by-collection-custodial
Clarinet.test({
    name: "get-generation-by-collection-custodial",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!;

        chain.mineBlock([
            Tx.contractCall("staking", "admin-add-new-custodial-collection", [types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.punks"),types.uint(10)], deployer.address)
        ]);

        const call = chain.callReadOnlyFn("staking", "get-generation-by-collection", [types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.punks")], deployer.address)

        call.result.expectOk().expectUint(0)
        console.log(JSON.stringify(call.result));
    },
});

//get-generation-by-collection-non-custodial
Clarinet.test({
    name: "get-generation-by-collection-non-custodial",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!;

        chain.mineBlock([
            Tx.contractCall("staking", "admin-add-new-non-custodial-collection", [types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.hardware-top-example"),types.uint(10)], deployer.address)
        ]);

        const call = chain.callReadOnlyFn("staking", "get-generation-by-collection", [types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.hardware-top-example")], deployer.address)

        call.result.expectOk().expectUint(0)
        console.log(JSON.stringify(call.result));
    },
});

//can't get-generation-by-collection if not whitelisted
Clarinet.test({
    name: "can't get-generation-by-collection if not whitelisted",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!;

        const call = chain.callReadOnlyFn("staking", "get-generation-by-collection", [types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.punks")], deployer.address)

        call.result.expectErr();
        console.log(JSON.stringify(call.result));
    },
});

//get-staked-by-collection-and-user
Clarinet.test({
    name: "get-staked-by-collection-and-user",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!;

        const call = chain.callReadOnlyFn("staking", "get-staked-by-collection-and-user", [types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.punks")], deployer.address)

        call.result.expectOk().expectList();
        console.log(JSON.stringify(call.result));
    },
});

//get-stake-details
Clarinet.test({
    name: "get-stake-details",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!;

        const call = chain.callReadOnlyFn("staking", "get-stake-details", [types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.punks"),types.uint(1)], deployer.address)

        call.result.expectOk().expectTuple();
        console.log(JSON.stringify(call.result));
    },
});

// Test to get unclaimed balance
Clarinet.test({
    name: "get-unclaimed-balance",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!;

        const call = chain.callReadOnlyFn("staking", "get-unclaimed-balance", [], deployer.address)
    
        call.result.expectOk().expectUint(0)
        console.log(JSON.stringify(call.result));
    }
});

//get-unclaimed-balance-by-collection-non-custodial
Clarinet.test({
    name: "get-unclaimed-balance-by-collection-non-custodial",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!;

        chain.mineBlock([
            Tx.contractCall("staking", "admin-add-new-non-custodial-collection", [types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.hardware-top-example"),types.uint(10)], deployer.address)
        ]);

        chain.mineBlock([
            Tx.contractCall("hardware-top-example", "mint-top-hw", [], deployer.address)
        ]);

        chain.mineBlock([
            Tx.contractCall("staking", "stake", [types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.hardware-top-example"),types.uint(1)], deployer.address)
        ]);
       
        const call = chain.callReadOnlyFn("staking", "get-unclaimed-balance-by-collection", [types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.hardware-top-example")], deployer.address)
    
        call.result.expectOk().expectUint(0)
        console.log(JSON.stringify(call.result));
    },
});

//get-unclaimed-balance-by-collection-custodial
Clarinet.test({
    name: "get-unclaimed-balance-by-collection-custodial",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!;

        chain.mineBlock([
            Tx.contractCall("punks", "set-approved-all", [types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.staking"),types.bool(true)], deployer.address)
        ]);

        chain.mineBlock([
            Tx.contractCall("staking", "admin-add-new-custodial-collection", [types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.punks"),types.uint(10)], deployer.address)
        ]);

        chain.mineBlock([
            Tx.contractCall("punks", "set-mint-pass", [types.principal(deployer.address),types.uint(1)], deployer.address)
        ]);

        chain.mineBlock([
            Tx.contractCall("punks", "mint-token", [], deployer.address)
        ]);

        chain.mineBlock([
            Tx.contractCall("staking", "stake", [types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.punks"),types.uint(1)], deployer.address)
        ]);
       
        const call = chain.callReadOnlyFn("staking", "get-unclaimed-balance-by-collection", [types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.punks")], deployer.address)
    
        call.result.expectOk().expectUint(0)
        console.log(JSON.stringify(call.result));
    },
});

//can't-get-unclaimed-balance-by-collection-if-nothing-staked
Clarinet.test({
    name: "can`t-get-unclaimed-balance-by-collection-if-nothing-staked",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!;
       
        const call = chain.callReadOnlyFn("staking", "get-unclaimed-balance-by-collection", [types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.hardware-top-example")], deployer.address)
    
        call.result.expectErr()
        console.log(JSON.stringify(call.result));
    },
});

//stake-non-custodial
Clarinet.test({
    name: "stake-non-custodial",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!;
        const wallet_4 = accounts.get("wallet_4")!;

        chain.mineBlock([
            Tx.contractCall("staking", "admin-add-new-non-custodial-collection", [types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.hardware-top-example"),types.uint(10)], deployer.address)
        ]);

        chain.mineBlock([
            Tx.contractCall("hardware-top-example", "mint-top-hw", [], deployer.address)
        ]);
        
        const block = chain.mineBlock([
            Tx.contractCall("staking", "stake", [types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.hardware-top-example"),types.uint(1)], deployer.address)
        ]);
    
        block.receipts[0].result.expectOk().expectBool(true)
        console.log(JSON.stringify(block.receipts));
    },
});

//stake-custodial
Clarinet.test({
    name: "stake-custodial",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!;
        const wallet_4 = accounts.get("wallet_4")!;

        chain.mineBlock([
            Tx.contractCall("punks", "set-approved-all", [types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.staking"),types.bool(true)], deployer.address)
        ]);
        
        chain.mineBlock([
            Tx.contractCall("staking", "admin-add-new-custodial-collection", [types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.punks"),types.uint(10)], deployer.address)
        ]);

        chain.mineBlock([
            Tx.contractCall("punks", "set-mint-pass", [types.principal(wallet_4.address),types.uint(1)], deployer.address)
        ]);
        
        chain.mineBlock([
            Tx.contractCall("punks", "mint-token", [], wallet_4.address)
        ]);

        const block = chain.mineBlock([
            Tx.contractCall("staking", "stake", [types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.punks"),types.uint(1)], wallet_4.address)
        ]);
    
        block.receipts[0].result.expectOk().expectBool(true)
        console.log(JSON.stringify(block.receipts));
    },
});

//stake a not whitelisted collection
Clarinet.test({
    name: "stake not whitelisted collection",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!;

        chain.mineBlock([
            Tx.contractCall("hardware-top-example", "mint-top-hw", [], deployer.address)
        ]);
        
        const block = chain.mineBlock([
            Tx.contractCall("staking", "stake", [types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.hardware-top-example"),types.uint(1)], deployer.address)
        ]);
    
        block.receipts[0].result.expectErr();
        console.log(JSON.stringify(block.receipts));
    },
});

//stake not owner
Clarinet.test({
    name: "stake not owner",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!;
        const wallet_4 = accounts.get("wallet_4")!;

        chain.mineBlock([
            Tx.contractCall("hardware-top-example", "mint-top-hw", [], deployer.address)
        ]);

        chain.mineBlock([
            Tx.contractCall("staking", "admin-add-new-non-custodial-collection", [types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.hardware-top-example"),types.uint(1)], deployer.address)
        ]); 

        const block = chain.mineBlock([
            Tx.contractCall("staking", "stake", [types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.hardware-top-example"),types.uint(1)], wallet_4.address)
        ]);
    
        block.receipts[0].result.expectErr();
        console.log(JSON.stringify(block.receipts));
    },
});

//cant-stake-already-staked
Clarinet.test({
    name: "cant-stake-already-staked",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!;
        const wallet_4 = accounts.get("wallet_4")!;

        chain.mineBlock([
            Tx.contractCall("hardware-top-example", "mint-top-hw", [], deployer.address)
        ]);

        chain.mineBlock([
            Tx.contractCall("staking", "admin-add-new-non-custodial-collection", [types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.hardware-top-example"),types.uint(1)], deployer.address)
        ]); 
        
        chain.mineBlock([
            Tx.contractCall("staking", "stake", [types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.hardware-top-example"),types.uint(1)], deployer.address)
        ])

        const block = chain.mineBlock([
            Tx.contractCall("staking", "stake", [types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.hardware-top-example"),types.uint(1)], deployer.address)
        ]);
    
        block.receipts[0].result.expectErr();
        console.log(JSON.stringify(block.receipts));
    },
});

//claim-item-stake-non-custodial
Clarinet.test({
    name: "claim-item-stake-non-custodial",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!;
        const wallet_4 = accounts.get("wallet_4")!;

        chain.mineBlock([
            Tx.contractCall("hardware-top-example", "mint-top-hw", [], deployer.address)
        ]);

        chain.mineBlock([
            Tx.contractCall("staking", "admin-add-new-non-custodial-collection", [types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.hardware-top-example"),types.uint(1)], deployer.address)
        ]);  
        
        chain.mineBlock([
            Tx.contractCall("staking", "stake", [types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.hardware-top-example"),types.uint(1)], deployer.address)
        ])

        chain.mineEmptyBlockUntil(1000);

        const block = chain.mineBlock([
            Tx.contractCall("staking", "claim-item-stake", [types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.hardware-top-example"),types.uint(1)], deployer.address)
        ]);
    
        block.receipts[0].result.expectOk().expectBool(true);
        console.log(JSON.stringify(block.receipts));
    },
});

//claim-item-stake-custodial
Clarinet.test({
    name: "claim-item-stake-custodial",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!;
        const wallet_4 = accounts.get("wallet_4")!;

        chain.mineBlock([
            Tx.contractCall("punks", "set-approved-all", [types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.staking"),types.bool(true)], deployer.address)
        ]);
        
        chain.mineBlock([
            Tx.contractCall("punks", "set-mint-pass", [types.principal(deployer.address),types.uint(1)], deployer.address)
        ]);
        
        chain.mineBlock([
            Tx.contractCall("punks", "mint-token", [], deployer.address)
        ]);

        chain.mineBlock([
            Tx.contractCall("staking", "admin-add-new-custodial-collection", [types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.punks"),types.uint(1)], deployer.address)
        ]);  
        
        chain.mineBlock([
            Tx.contractCall("staking", "stake", [types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.punks"),types.uint(1)], deployer.address)
        ])

        chain.mineEmptyBlockUntil(1000);

        const block = chain.mineBlock([
            Tx.contractCall("staking", "claim-item-stake", [types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.punks"),types.uint(1)], deployer.address)
        ]);
    
        block.receipts[0].result.expectOk().expectBool(true);
        console.log(JSON.stringify(block.receipts));
    },
});

//claim-item-stake-from-not-whitelisted-collection
Clarinet.test({
    name: "claim-item-stake-from-not-whitelisted-collection",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!;
        const wallet_4 = accounts.get("wallet_4")!;

        const block = chain.mineBlock([
            Tx.contractCall("staking", "claim-item-stake", [types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.hypercard"),types.uint(1)], deployer.address)
        ]);
    
        block.receipts[0].result.expectErr();
        console.log(JSON.stringify(block.receipts));
    },
});

//claim-item-stake-not-staked
Clarinet.test({
    name: "claim-item-stake-not-staked",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!;
        const wallet_4 = accounts.get("wallet_4")!;

        chain.mineBlock([
            Tx.contractCall("hardware-top-example", "mint-top-hw", [], deployer.address)
        ]);

        chain.mineBlock([
            Tx.contractCall("staking", "admin-add-new-non-custodial-collection", [types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.hardware-top-example"),types.uint(1)], deployer.address)
        ]); 

        chain.mineEmptyBlockUntil(1000);

        const block = chain.mineBlock([
            Tx.contractCall("staking", "claim-item-stake", [types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.hardware-top-example"),types.uint(1)], deployer.address)
        ]);
    
        block.receipts[0].result.expectErr();
        console.log(JSON.stringify(block.receipts));
    },
});

//claim-item-stake-not-owner
Clarinet.test({
    name: "claim-item-stake-not-owner",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!;
        const wallet_4 = accounts.get("wallet_4")!;

        chain.mineBlock([
            Tx.contractCall("hardware-top-example", "mint-top-hw", [], deployer.address)
        ]);

        chain.mineBlock([
            Tx.contractCall("staking", "admin-add-new-non-custodial-collection", [types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.hardware-top-example"),types.uint(1)], deployer.address)
        ]); 

        chain.mineBlock([
            Tx.contractCall("staking", "stake", [types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.hardware-top-example"),types.uint(1)], deployer.address)
        ])

        chain.mineEmptyBlockUntil(1000);

        const block = chain.mineBlock([
            Tx.contractCall("staking", "claim-item-stake", [types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.hardware-top-example"),types.uint(1)], wallet_4.address)
        ]);
    
        block.receipts[0].result.expectErr();
        console.log(JSON.stringify(block.receipts));
    },
});

//claim-item-stake-without-blockheight

//claim-collection-stake NEEDS WORK
Clarinet.test({
    name: "claim-collection-stake",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!;
        const wallet_4 = accounts.get("wallet_4")!;

        chain.mineBlock([
            Tx.contractCall("hardware-top-example", "mint-top-hw", [], deployer.address)
        ]);

        chain.mineBlock([
            Tx.contractCall("hardware-top-example", "mint-top-hw", [], deployer.address)
        ]);

        chain.mineBlock([
            Tx.contractCall("staking", "admin-add-new-non-custodial-collection", [types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.hardware-top-example"),types.uint(1)], deployer.address)
        ]); 
        
        chain.mineBlock([
            Tx.contractCall("staking", "stake", [types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.hardware-top-example"),types.uint(1)], deployer.address)
        ])

        chain.mineBlock([
            Tx.contractCall("staking", "stake", [types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.hardware-top-example"),types.uint(2)], deployer.address)
        ])

        chain.mineEmptyBlockUntil(10);

        const block = chain.mineBlock([
            Tx.contractCall("staking", "claim-collection-stake", [types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.hardware-top-example")], deployer.address)
        ]);
    
        block.receipts[0].result.expectErr();
        console.log(JSON.stringify(block.receipts));
    },
});

//can't claim-collection-stake-not-owner
Clarinet.test({
    name: "can't-claim-collection-stake-not-owner",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!;
        const wallet_4 = accounts.get("wallet_4")!;

        chain.mineBlock([
            Tx.contractCall("hardware-top-example", "mint-top-hw", [], deployer.address)
        ]);

        chain.mineBlock([
            Tx.contractCall("staking", "admin-add-new-non-custodial-collection", [types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.hardware-top-example"),types.uint(1)], deployer.address)
        ]); 
        
        chain.mineBlock([
            Tx.contractCall("staking", "stake", [types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.hardware-top-example"),types.uint(1)], deployer.address)
        ])

        chain.mineEmptyBlockUntil(10000);

        const block = chain.mineBlock([
            Tx.contractCall("staking", "claim-collection-stake", [types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.hardware-top-example")], wallet_4.address)
        ]);
    
        block.receipts[0].result.expectErr();
        console.log(JSON.stringify(block.receipts));
    },
});

//claim-all-stake
Clarinet.test({
    name: "claim-all-stake",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!;
        const wallet_4 = accounts.get("wallet_4")!;

        chain.mineBlock([
            Tx.contractCall("hardware-top-example", "mint-top-hw", [], wallet_4.address)
        ]);

        chain.mineBlock([
            Tx.contractCall("hardware-top-example", "mint-top-hw", [], wallet_4.address)
        ]);

        chain.mineBlock([
            Tx.contractCall("staking", "admin-add-new-non-custodial-collection", [types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.hardware-top-example"),types.uint(1)], deployer.address)
        ]);  

        chain.mineBlock([
            Tx.contractCall("staking", "stake", [types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.hardware-top-example"),types.uint(1)], wallet_4.address)
        ])

        chain.mineBlock([
            Tx.contractCall("staking", "stake", [types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.hardware-top-example"),types.uint(2)], wallet_4.address)
        ])

        chain.mineEmptyBlockUntil(1000);

        const block = chain.mineBlock([
            Tx.contractCall("staking", "claim-all-stake", [], wallet_4.address)
        ]);
    
        block.receipts[0].result.expectOk();
        console.log(JSON.stringify(block.receipts));
    },
});

//can't-claim-all-stake-if-not-owner
Clarinet.test({
    name: "can't-claim-all-stake-if-not-owner",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!;
        const wallet_4 = accounts.get("wallet_4")!;

        chain.mineBlock([
            Tx.contractCall("hardware-top-example", "mint-top-hw", [], deployer.address)
        ]);

        chain.mineBlock([
            Tx.contractCall("hardware-top-example", "mint-top-hw", [], deployer.address)
        ]);

        chain.mineBlock([
            Tx.contractCall("staking", "admin-add-new-non-custodial-collection", [types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.hardware-top-example"),types.uint(1)], deployer.address)
        ]);  

        chain.mineBlock([
            Tx.contractCall("staking", "stake", [types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.hardware-top-example"),types.uint(1)], deployer.address)
        ])

        chain.mineBlock([
            Tx.contractCall("staking", "stake", [types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.hardware-top-example"),types.uint(2)], deployer.address)
        ])

        chain.mineEmptyBlockUntil(1000);

        const block = chain.mineBlock([
            Tx.contractCall("staking", "claim-all-stake", [], wallet_4.address)
        ]);
    
        block.receipts[0].result.expectErr();
        console.log(JSON.stringify(block.receipts));
    }, 
});

//unstake-item-non-custodial
Clarinet.test({
    name: "unstake-item-non-custodial",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!;

        chain.mineBlock([
            Tx.contractCall("hardware-top-example", "mint-top-hw", [], deployer.address)
        ]);

        chain.mineBlock([
            Tx.contractCall("staking", "admin-add-new-non-custodial-collection", [types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.hardware-top-example"),types.uint(1)], deployer.address)
        ]); 
        
        chain.mineBlock([
            Tx.contractCall("staking", "stake", [types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.hardware-top-example"),types.uint(1)], deployer.address)
        ])

        const block = chain.mineBlock([
            Tx.contractCall("staking", "unstake-item", [types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.hardware-top-example"),types.uint(1)], deployer.address)
        ]);
    
        block.receipts[0].result.expectOk().expectBool(true)
        console.log(JSON.stringify(block.receipts));
    },
});

//unstake-custodial
Clarinet.test({
    name: "unstake-custodial",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!;
        const wallet_4 = accounts.get("wallet_4")!;

        chain.mineBlock([
            Tx.contractCall("punks", "set-approved-all", [types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.staking"),types.bool(true)], deployer.address)
        ]);

        chain.mineBlock([
            Tx.contractCall("staking", "admin-add-new-custodial-collection", [types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.punks"),types.uint(10)], deployer.address)
        ]);

        chain.mineBlock([
            Tx.contractCall("punks", "set-mint-pass", [types.principal(wallet_4.address),types.uint(1)], deployer.address)
        ]);
        
        chain.mineBlock([
            Tx.contractCall("punks", "mint-token", [], wallet_4.address)
        ]);

        chain.mineBlock([
            Tx.contractCall("staking", "stake", [types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.punks"),types.uint(1)], wallet_4.address)
        ]);

        const block = chain.mineBlock([
            Tx.contractCall("staking", "unstake-item", [types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.punks"),types.uint(1)], wallet_4.address)
        ]);
    
        block.receipts[0].result.expectOk().expectBool(true)
        console.log(JSON.stringify(block.receipts));
    },
});

//can't-unstake-item-if-not-owner
Clarinet.test({
    name: "can't-unstake-item-if-not-owner",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!;
        const wallet_4 = accounts.get("wallet_4")!;

        chain.mineBlock([
            Tx.contractCall("hardware-top-example", "mint-top-hw", [], deployer.address)
        ]);

        chain.mineBlock([
            Tx.contractCall("staking", "admin-add-new-non-custodial-collection", [types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.hardware-top-example"),types.uint(1)], deployer.address)
        ]); 
        
        chain.mineBlock([
            Tx.contractCall("staking", "stake", [types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.hardware-top-example"),types.uint(1)], deployer.address)
        ])

        const block = chain.mineBlock([
            Tx.contractCall("staking", "unstake-item", [types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.hardware-top-example"),types.uint(1)], wallet_4.address)
        ]);
    
        block.receipts[0].result.expectErr()
        console.log(JSON.stringify(block.receipts));
    },
});

//can't-unstake-item-if-not-staked
Clarinet.test({
    name: "can't-unstake-item-if-not-staked",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!;
        const wallet_4 = accounts.get("wallet_4")!;

        chain.mineBlock([
            Tx.contractCall("staking", "admin-add-new-non-custodial-collection", [types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.hardware-top-example"),types.uint(1)], deployer.address)
        ]); 

        const block = chain.mineBlock([
            Tx.contractCall("staking", "unstake-item", [types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.hardware-top-example"),types.uint(1)], wallet_4.address)
        ]);
    
        block.receipts[0].result.expectErr()
        console.log(JSON.stringify(block.receipts));
    },
});

//admin-add-new-custodial-collection
Clarinet.test({
    name: "admin-add-new-custodial-collection",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!;
        const wallet_4 = accounts.get("wallet_4")!;

        let block = chain.mineBlock([
            Tx.contractCall("staking", "admin-add-new-custodial-collection", [types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.hardware-top-example"),types.uint(1)], deployer.address)
        ]);

        block.receipts[0].result.expectOk().expectBool(true)
        console.log(JSON.stringify(block.receipts));
    },
});

//admin-add-new-non-custodial-collection
Clarinet.test({
    name: "admin-add-new-non-custodial-collection",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!;
        const wallet_4 = accounts.get("wallet_4")!;

        let block = chain.mineBlock([
            Tx.contractCall("staking", "admin-add-new-non-custodial-collection", [types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.punks"),types.uint(1)], deployer.address)
        ]);

        block.receipts[0].result.expectOk().expectBool(true)
        console.log(JSON.stringify(block.receipts));
    },
});

//can't-admin-add-new-custodial-collection-not-admin
Clarinet.test({
    name: "can't-admin-add-new-custodial-collection-not-admin",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!;
        const wallet_4 = accounts.get("wallet_4")!;

        let block = chain.mineBlock([
            Tx.contractCall("staking", "admin-add-new-custodial-collection", [types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.hardware-top-example"),types.uint(1)], wallet_4.address)
        ]);

        block.receipts[0].result.expectErr()
        console.log(JSON.stringify(block.receipts));
    },
});

//admin-add-new-non-custodial-collection
Clarinet.test({
    name: "can't-admin-add-new-none-custodial-collection-not-admin",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get("deployer")!;
        const wallet_4 = accounts.get("wallet_4")!;

        let block = chain.mineBlock([
            Tx.contractCall("staking", "admin-add-new-non-custodial-collection", [types.principal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.punks"),types.uint(1)], wallet_4.address)
        ]);

        block.receipts[0].result.expectErr()
        console.log(JSON.stringify(block.receipts));
    },
});