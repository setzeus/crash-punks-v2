;; Digital Avatar NFT Contract
;; This contract represents the Digital Avatar NFT - a derivative Crash Punks Collection
;; Written by Cyb-Pato/Setzeus from StrataLabs

;; Digital Avatar NFT Unique Properties
;; 1. 1 redeemable per 1 CrashPunk owned (can only be claimed a single time)
;; 2. It's stakeable for $SNOW (at a rate per block tbd)
;; 3. The head/torso/legs will be overlaid with Clothes (another derivative NFT collection -> hardware-top-example)

;; Head/Torso/Legs are "interchangeable"/will be overlaid with clothes
;; In Clarity terms, all this means is that we need a map to associate the ID (uint) of each Digital Avatar to:
;; {head-id: uint, head-collection: principal, torso-id: uint, torso-collection: principal, legs-id: uint, legs-collection: principal}

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
(define-non-fungible-token digital-avatar uint)

;; Hypercard(s) NFT collection limit (1k)
(define-constant digital-avatar-limit u1000)
(define-constant punk-limit u2000)

;; String that represents the current ipfs-root
(define-constant ipfs-root "ipfs://ipfs/QmYcrELFT5c9pjSygFFXk8jfVMHB5cBoWJDGaTvrP/")

;; Uint that represents the current hypercard that'll be minted
(define-data-var digital-avatar-index uint u1)

;; Uint var that keeps track of all punks pseudo-minted
(define-data-var punk-index uint u1)

;; Var that tracks which collections we can use to dress digital-avatars
(define-data-var clothe-collections (list 100 principal) (list))

;; Map that tracks whether a punk has claimed a hypercard
(define-map punk-claimed uint bool)

;; Map that keeps track of listing by hypercard ID/uint
(define-map market uint
  {
    price: uint,
    commission: principal
  }
)

;; Map that keeps track of interchangeable NFTs by digital-avatar ID/uint
  (define-map clothes uint
  {
    head-id: uint,
    head-collection: principal,

    torso-id: uint,
    torso-collection: principal,

    legs-id: uint,
    legs-collection: principal,
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
(define-constant ERR-DIGITAL-AVATAR-NOT-OWNER (err u108))
(define-constant ERR-CURRENTLY-STAKED (err u109))
(define-constant ERR-UNWRAP-STAKE-STATUS (err u110))
(define-constant ERR-UNWRAP-SEND-PUNK (err u111))
(define-constant ERR-UNWRAP (err u112))
(define-constant ERR-ALREADY-DRESSING (err u113))
(define-constant ERR-NOT-DRESSING (err u114))
(define-constant ERR-NOT-HEAD-OWNER (err u115))
(define-constant ERR-UNWRAP-AVATAR (err u116))

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;;;;; SIP09 Functions ;;;;;;;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(define-read-only (is-punk-eligible (punk uint))
  (default-to true (map-get? punk-claimed punk))
)

(define-read-only (get-last-token-id)
  (ok (var-get digital-avatar-index))
)

(define-read-only (get-owner (id uint))
  (ok (nft-get-owner? digital-avatar id))
)

(define-read-only (get-token-uri (token-id uint))
  (ok
    (some
      (concat
        (concat
          ipfs-root
          (uint-to-ascii token-id)
        )
        ".json"
      )
    )
  )
)

(define-public (transfer (id uint) (sender principal) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender sender) ERR-NOT-AUTH)
    ;; asserts not actively staked
    (asserts! (not (get status (unwrap! (contract-call? .staking get-stake-details (as-contract tx-sender) id) ERR-UNWRAP-STAKE-STATUS))) ERR-CURRENTLY-STAKED)
    (nft-transfer? digital-avatar id sender recipient)
  )
)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;;;;; Non-Custodial Functions ;;;;;;;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(use-trait commission-trait .commission-trait.commission)

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
      (owner (unwrap! (nft-get-owner? digital-avatar id) false))
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
    (asserts! (not (get status (unwrap! (contract-call? .staking get-stake-details (as-contract tx-sender) id) ERR-UNWRAP-STAKE-STATUS))) ERR-CURRENTLY-STAKED)

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
      (owner (unwrap! (nft-get-owner? digital-avatar id) ERR-NOT-AUTH))
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

(define-read-only (get-clothes (digital-avatar-id uint))
  (map-get? clothes digital-avatar-id)
)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;;;;; Mint Functions ;;;;;;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;

;; @desc hypercard mint function
;; @param none
(define-public (redeem-digital-avatar (punk-id uint))
  (let
    (
      (current-id (var-get digital-avatar-index))
      (next-id (+ current-id u1))
      (is-punk-eligible-now (is-punk-eligible punk-id))
      (punk-owner (unwrap-panic (contract-call? .punks get-owner punk-id)))
    )

    ;; assert that stacculent is eligible
    (asserts! is-punk-eligible-now ERR-PUNK-ALREADY-CLAIMED)

    ;; assert that tx-sender is current owner of stacculent
    (asserts! (is-eq (some tx-sender) punk-owner) ERR-PUNK-NOT-OWNER)

    ;; assert that bud-index < bud-collection limit
    (asserts! (< current-id digital-avatar-limit) ERR-ALL-MINTED)

    ;; mint bud to tx-sender
    (try! (nft-mint? digital-avatar current-id tx-sender))

    ;; updated index
    (var-set digital-avatar-index next-id)

    ;; map-set punk-claimed to false
    (ok 
      (map-set punk-claimed punk-id false)
    )
  )
)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;;;;; Clothes Functions ;;;;;;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
(define-public (change-avatar-head (avatar uint) (new-head-collection principal) (new-head uint))
    (let
     
     (
      (current-avatar-clothes (unwrap! (map-get? clothes avatar) ERR-UNWRAP))
     )
     ;; asserts the owner of the avatar
     (asserts! (is-eq (some tx-sender) (unwrap! (get-owner avatar) ERR-UNWRAP-AVATAR)) ERR-NOT-AUTH)

     ;; asserts the owner of the Head
     (asserts! (is-eq (some tx-sender) (unwrap-panic (contract-call? .hardware-top-example get-owner new-head))) ERR-NOT-HEAD-OWNER)
     
     ;; asserts that the collection can be used to dress
     (asserts! (is-some (index-of (var-get clothe-collections) new-head-collection)) ERR-NOT-DRESSING)
      
      ;;sets the map for the avatar
    (ok (map-set clothes avatar 
          (merge 
            current-avatar-clothes
            {
                head-id: new-head,
                head-collection: new-head-collection,
            }
          )
    ))
    )
)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;;;;; Clothes Admin Functions ;;;;;;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(define-public (set-clothes-collection (clothes-collection principal))
    (let
        (
            (active-collections (var-get clothe-collections))
        )

        ;;asserts sender is admin
        (asserts! (is-eq tx-sender admin-one) ERR-NOT-AUTH)

        ;; assert collection not already added
        (asserts! (is-none (index-of active-collections clothes-collection)) ERR-ALREADY-DRESSING)

        (ok (var-set clothe-collections (unwrap! (as-max-len? (append active-collections clothes-collection) u100) ERR-UNWRAP) ))
    )
)

;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;;;;; Help Functions ;;;;;;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;

;; @desc utility function that takes in a unit & returns a string
;; @param value; the unit we're casting into a string to concatenate
;; thanks to Lnow for the guidance
(define-read-only (uint-to-ascii (value uint))
  (if (<= value u9)
    (unwrap-panic (element-at "0123456789" value))
    (get r (fold uint-to-ascii-inner
      0x000000000000000000000000000000000000000000000000000000000000000000000000000000
      {v: value, r: ""}
    ))
  )
)

(define-read-only (uint-to-ascii-inner (i (buff 1)) (d {v: uint, r: (string-ascii 39)}))
  (if (> (get v d) u0)
    {
      v: (/ (get v d) u10),
      r: (unwrap-panic (as-max-len? (concat (unwrap-panic (element-at "0123456789" (mod (get v d) u10))) (get r d)) u39))
    }
    d
  )
)