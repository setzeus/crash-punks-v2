;; Hypercard NFT Contract
;; This contract represents the Hypercard NFT - a derivative Crash Punks Collection
;; Written by Cyb-Pato/Setzeus from StrataLabs

;; Hypercard NFT Unique Properties
;; 1. 1 redeemable per 1 CrashPunk owned (can only be claimed a single time)
;; 2. It's stakeable for $SNOW (at a rate per block tbd)

(impl-trait .nft-trait.nft-trait)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;;; Cons, Vars, & Maps ;;;;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(define-constant admin-one tx-sender)

;;;;;;;;;;;;;;;;;;;
;; NFT Vars/Cons ;;
;;;;;;;;;;;;;;;;;;;

;;define hypercard nft
(define-non-fungible-token hypercard uint)

;; Hypercard(s) NFT collection limit (1k)
(define-constant hypercard-limit u1000)
(define-constant punk-limit u2000)

;; String that represents the current ipfs-root
(define-constant ipfs-root "ipfs://ipfs/QmYcrELFT5c9pjSygFFXk8jfVMHB5cBoWJDGaTvrP/")

;; Uint that represents the current hypercard that'll be minted
(define-data-var hypercard-index uint u1)

;; Uint var that keeps track of all punks pseudo-minted
(define-data-var punk-index uint u1)

;; Map that tracks whether a punk has claimed a hypercard
(define-map punk-claimed uint bool)

;; Map that keeps track of listing by hypercard ID/uint
(define-map market uint
  {
    price: uint,
    commission: principal
  }
)

;;;;;;;;;;;;;;;;
;; Error Cons ;;
;;;;;;;;;;;;;;;;

(define-constant ERR-ALL-MINTED (err u101))
(define-constant ERR-NOT-AUTH (err u102))
(define-constant ERR-NOT-LISTED (err u103))
(define-constant ERR-WRONG-COMMISSION (err u104))
(define-constant ERR-PUNK-ALREADY-CLAIMED (err u105))
(define-constant ERR-PUNK-NOT-OWNER (err u106))
(define-constant ERR-INCORRECT-SUBTYPES (err u107))
(define-constant ERR-HYPERCARD-NOT-OWNER (err u108))
(define-constant ERR-CURRENTLY-STAKED (err u109))
(define-constant ERR-UNWRAP-STAKE-STATUS (err u110))
(define-constant ERR-UNWRAP-SEND-PUNK (err u111))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;;;;; SIP09 Functions ;;;;;;;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(define-read-only (get-last-token-id)
  (ok (var-get hypercard-index))
)

(define-read-only (get-owner (id uint))
  (ok (nft-get-owner? hypercard id))
)

;;(define-read-only (get-token-uri (token-id uint))
  ;;(ok
    ;;(some
      ;;(concat
        ;;(concat
          ;;ipfs-root
          ;;(uint-to-ascii token-id)
        ;;)
        ;;".json"
      ;;)
    ;;)
  ;;)
;;)

(define-public (transfer (id uint) (sender principal) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender sender) ERR-NOT-AUTH)
    ;; asserts not actively staked
    (asserts! (not (get status (unwrap! (contract-call? .staking get-stake-details (as-contract tx-sender) id) ERR-UNWRAP))) ERR-STAKED)
    (nft-transfer? hypercard id sender recipient)
  )
)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;;;;; Non-Custodial Functions ;;;;;;;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(use-trait commission-trait .commision-trait.commision)

;; @desc gets market listing by market list ID
;; @param id; the ID of the market listing
(define-read-only (get-listing-in-ustx (id uint))
  (map-get? market id)
)

;; @desc checks NFT owner is either tx-sender or contract caller,
;; @param id; the ID of the NFT in question
(define-private (is-sender-owner (id uint))
  (let
    (
      (owner (unwrap! (nft-get-owner? hypercard id) false))
    )
      (or (is-eq tx-sender owner) (is-eq contract-caller owner))
  )
)

;; @desc listing function
;; @param id: the ID of the NFT in question, price: the price being listed, comm-trait: a principal that conforms to the commission-trait
(define-public (list-in-ustx (id uint) (price uint) (comm-trait <commission-trait>))
  (let
    (
      (listing {price: price, commission: (contract-of comm-trait)})
    )

    ;; asserts not actively staked
    (asserts! (not (get status (unwrap! (contract-call? .staking get-stake-details (as-contract tx-sender) id) ERR-UNWRAP))) ERR-STAKED)

    (asserts! (is-sender-owner id) ERR-NOT-AUTH)
    (map-set market id listing)
    (ok (print (merge listing {a: "list-in-ustx", id: id})))
  )
)

;; @desc un-listing function
;; @param id: the ID of the NFT in question, price: the price being listed, comm-trait: a principal that conforms to the commission-trait
(define-public (unlist-in-ustx (id uint))
  (begin
    (asserts! (is-sender-owner id) ERR-NOT-AUTH)
    (map-delete market id)
    (ok (print {a: "unlist-in-stx", id: id}))
  )
)

;; @desc function to buy from a current listing
;; @param buy: the ID of the NFT in question, comm-trait: a principal that conforms to the commission-trait for royalty split
(define-public (buy-in-ustx (id uint) (comm-trait <commission-trait>))
  (let
    (
      (owner (unwrap! (nft-get-owner? hypercard id) ERR-NOT-AUTH))
      (listing (unwrap! (map-get? market id) ERR-NOT-LISTED))
      (price (get price listing))
    )
    (asserts! (is-eq (contract-of comm-trait) (get commission listing)) ERR-WRONG-COMMISSION)
    (try! (stx-transfer? price tx-sender owner))
    (try! (contract-call? comm-trait pay id price))
    (try! (transfer id owner tx-sender))
    (map-delete market id)
    (ok (print {a: "buy-in-ustx", id: id}))
  )
)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;;;;; Read Functions ;;;;;;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;



;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;;;;; Mint Functions ;;;;;;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;

;; @desc hypercard mint function
;; @param none
(define-public (redeem-hypercard (punk-id uint))
  (let
    (
      (current-id (var-get hypercard-index))
      (next-id (+ current-id u1))
      (is-punk-eligible-now (is-punk-eligible punk-id))
      (punk-owner (unwrap-panic (contract-call? .crash-punks get-owner punk-id)))
    )

    ;; assert that stacculent is eligible
    (asserts! is-punk-eligible-now ERR-PUNK-ALREADY-CLAIMED)

    ;; assert that tx-sender is current owner of stacculent
    (asserts! (is-eq (some tx-sender) punk-owner) ERR-PUNK-NOT-OWNER)

    ;; assert that bud-index < bud-collection limit
    (asserts! (< current-id hypercard-limit) ERR-ALL-MINTED)

    ;; mint bud to tx-sender
    (try! (nft-mint? hypercard current-id tx-sender))

    ;; updated index
    (var-set hypercard-index next-id)

    ;; map-set punk-claimed to false
    (ok (map-set punk-claimed punk-id false))
  )
)