;; Crash Punk NFT(s) -> $SNOW Staking Contract
;; This contract is in charge of handling all staking within the Crash Punks ecosystem.
;; Written by Cyb-Pato/Setzeus from StrataLabs

;; $SNOW FT Unique Properties
;; 1. Minting should only be allowed by the staking.clar contract=

(use-trait nft-trait .nft-trait.nft-trait)

;; UPDATE BEFORE PRODUCTION - replace with mainnet crash-punks principal
(define-constant punk-principal .punks)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;;; Cons, Vars, & Maps ;;;;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;

;;;;;;;;;;;;;;;
;; Vars/Cons ;;
;;;;;;;;;;;;;;;

(define-constant admin-one tx-sender)

;; @desc - List of principals that represents all whitelisted, actively-staking collections
(define-data-var whitelist-collections (list 100 principal) (list))

;; @desc - Uint that represents that *max* possible stake reward per block (a multiplier of u100)
(define-data-var max-payout-per-block uint u1000000)

;; @desc - (temporary) Uint that's used to aggregate when calling "get-unclaimed-balance"
(define-data-var helper-total-unclaimed-balance uint u0)

;; @desc - (temporary) Principal that's used to temporarily hold a collection principal
(define-data-var helper-collection-principal principal tx-sender)

;; @desc - (temporary) List of uints that's used to temporarily hold the output of a map resulting in a list of height differences (aka blocks staked)
(define-data-var helper-height-difference-list (list 10000 uint) (list))

;; @desc - (temporary) Uint that needs to be removed when unstaking
(define-data-var id-being-removed uint u0)

;; @desc - Var (uint) that keeps track of the *current* (aka maybe people burned) max token supply
(define-data-var token-max-supply (optional uint) none)

;; @desc - Map that keeps track of whitelisted principal (key) & corresponding multiplier (value)
(define-map collection-multiplier principal uint)

;; @desc - List of principals that are whitelisted/have admin privileges
(define-data-var whitelist-admins (list 100 principal) (list))
(append (var-get whitelist-admins) tx-sender)

;; @desc - Map that tracks of a staked item details (value) by collection & ID (key)
(define-map staked-item {collection: principal, id: uint}
  {
    staker: principal,
    status: bool,
    last-staked-or-claimed: uint
  }
)

;; @desc - Map that tracks all staked IDs (value) by collection principal (key)
(define-map all-stakes-in-collection principal (list 10000 uint))

;; @desc - Map that tracks all staked IDs in a collection (value) by user & collection & ID (key)
(define-map user-stakes-by-collection {user: principal, collection: principal}
  (list 10000 uint)
)

;;;;;;;;;;;;;;;;
;; Error Cons ;;
;;;;;;;;;;;;;;;;

(define-constant ERR-ALL-MINTED (err u101))
(define-constant ERR-NOT-AUTH (err u102))
(define-constant ERR-NOT-LISTED (err u103))
(define-constant ERR-WRONG-COMMISSION (err u104))
(define-constant ERR-NO-MINTS-LEFT (err u105))
(define-constant ERR-PARAM-TYPE (err u106))
(define-constant ERR-NOT-ACTIVE (err u107))
(define-constant ERR-NOT-STAKED (err u108))
(define-constant ERR-STAKED-OR-NONE (err u109))
(define-constant ERR-NOT-WHITELISTED (err u110))
(define-constant ERR-UNWRAP (err u111))
(define-constant ERR-NOT-OWNER (err u112))
(define-constant ERR-MIN-STAKE-HEIGHT (err u113))
(define-constant ERR-ALREADY-WHITELISTED (err u114))
(define-constant ERR-MULTIPLIER (err u115))
(define-constant ERR-UNWRAP-GET-UNCLAIMED-BALANCE-BY-COLLECTION (err u116))


;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;;;;; Read Functions ;;;;;;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(define-read-only (active-collections)
  (var-get whitelist-collections)
)

;; @desc - Read function that returns the current generation rate for tx-sender across all actively staked collective assets
(define-read-only (get-total-generation)
  (let
    (
      (list-of-collections-with-active-user-stakes (filter filter-out-collections-with-no-stakes (var-get whitelist-collections)))
      (list-of-generation-per-collection (map map-from-list-staked-to-generation-per-collection list-of-collections-with-active-user-stakes))
    )
    (print list-of-collections-with-active-user-stakes)
    (ok (fold + list-of-generation-per-collection u0))
  )
)

;; @desc - Filter function used which takes in all (list principal) stakeable/whitelist principals & outputs a (list principal) of actively-staked (by tx-sender) principals
(define-private (filter-out-collections-with-no-stakes (collection principal))
  (let
    (
      (collection-staked-by-user-list (default-to (list) (map-get? user-stakes-by-collection {user: tx-sender, collection: collection})))
      (collection-staked-by-user-count (len collection-staked-by-user-list))
    )
    (if (>= collection-staked-by-user-count u0)
      true
      false
    )
  )
)

;; @desc - Map function which takes in a list of actively-staked principals & returns a list of current generation rate per collection
(define-private (map-from-list-staked-to-generation-per-collection (collection principal))
  (let
    (
      (this-collection-multiplier (default-to u0 (map-get? collection-multiplier collection)))
      (collection-staked-by-user-list (default-to (list) (map-get? user-stakes-by-collection {user: tx-sender, collection: collection})))
      (collection-staked-by-user-count (len collection-staked-by-user-list))
      (this-collection-multiplier-normalized (/ (* this-collection-multiplier (var-get max-payout-per-block)) u100))
    )
    (* this-collection-multiplier-normalized collection-staked-by-user-count)
  )
)

;; @desc - Read function that returns the current generation rate for tx-sender across one specific collection
(define-read-only (get-generation-by-collection (collection <nft-trait>))
  (let
    (
      (this-collection-multiplier (default-to u0 (map-get? collection-multiplier (contract-of collection))))
      (collection-staked-by-user-list (get-staked-by-collection-and-user collection))
      (collection-staked-by-user-count (len (unwrap! collection-staked-by-user-list ERR-UNWRAP)))
      (this-collection-multiplier-normalized (/ (* this-collection-multiplier (var-get max-payout-per-block)) u100))
    )

    ;; check collection is existing whitelist collection
    (asserts! (> this-collection-multiplier u0) ERR-NOT-WHITELISTED)
    (ok (* this-collection-multiplier-normalized collection-staked-by-user-count))
  )
)

;; @desc - Read function that returns a (list uint) of all actively-staked IDs in a collection by tx-sender
(define-read-only (get-staked-by-collection-and-user (collection <nft-trait>))
  (ok (default-to (list) (map-get? user-stakes-by-collection {user: tx-sender, collection: (contract-of collection)})))
)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; Staked Details By Collection & ID ;;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;; @desc - Read function that returns stake details (staker, status, last-staked-or-claimed) in a specific collection & id
(define-read-only (get-stake-details (collection principal) (item-id uint))
  (ok
    (default-to
      {staker: admin-one,status: false,last-staked-or-claimed: block-height}
      (map-get? staked-item {collection: collection, id: item-id}))
    )
)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;;;;; Stake Functions ;;;;;;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;



;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;;;;; Claim Functions ;;;;;;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;



;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;;;;; Unstake Functions ;;;;;;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;



;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;;;;; Admin Functions ;;;;;;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;