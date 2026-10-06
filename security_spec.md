# ESI Lost & Found — Security Specification

## 1. Data Invariants
1. **User Profile PII Isolation**: A user profile (`/users/{userId}`) can only be read or updated by the owning student (`request.auth.uid == userId`) or an authorized Lost & Found Office administrator (`isAdmin()`). Students cannot elevate their `role` to `'admin'`.
2. **Confidential Found Item Split-Collection**: Found items are split between `/found_items/{itemId}` (sanitized summary without secret details) and `/found_items_private/{itemId}` (storage bin, admin notes, and secret verification features). Only `isAdmin()` can read `/found_items_private/{itemId}`, while authenticated verified users can create a found item report with initial secret details.
3. **Private Lost Reports**: A student's lost report (`/lost_reports/{reportId}`) is strictly private to `resource.data.userId == request.auth.uid` or `isAdmin()`. No student can list or inspect another student's lost reports.
4. **Match & Claim Ownership**: Matches (`/matches/{matchId}`) and Claims (`/claims/{claimId}`) can only be read or listed by the student who owns the lost report (`resource.data.studentId == request.auth.uid`) or `isAdmin()`. Only `isAdmin()` can transition a Claim to `APPROVED`, `REJECTED`, or `RETURNED`.
5. **Terminal State Locking**: Once a `FoundItem` or `LostReport` or `ClaimRecord` reaches `RETURNED` or `CLOSED`, non-admin users cannot mutate it.

## 2. The "Dirty Dozen" Payloads
1. **Shadow Field Injection on UserProfile**: `{ uid: "user_1", name: "Ali", email: "ali@esi.dz", role: "student", isSuperAdmin: true }` -> Rejected by `hasOnly()`.
2. **Privilege Escalation on UserProfile**: Student sets `role: "admin"` without being the bootstrapped admin or in `/admins/{uid}` -> Rejected by `isValidUserProfile` role check.
3. **Unverified Email Write**: Authenticated user with `email_verified: false` attempts to create a `lost_reports` document -> Rejected by `isVerifiedUser()`.
4. **Cross-Student Lost Report Read**: Student `user_2` attempts `get` or `list` on `/lost_reports/report_1` owned by `user_1` -> Rejected by `resource.data.userId == request.auth.uid`.
5. **Confidential Storage / Secret Leak**: Student `user_1` attempts `get` on `/found_items_private/item_1` to see the secret engraving or storage shelf -> Rejected by `allow read: if isAdmin()`.
6. **Student Approving Own Claim**: Student `user_1` attempts `update` on `/claims/claim_1` with `{ status: "APPROVED" }` -> Rejected because only `isAdmin()` can update claims.
7. **ID Poisoning Attack**: Attacker attempts to create `/lost_reports/invalid$id!with*spaces` -> Rejected by `isValidId(reportId)`.
8. **Denial of Wallet Oversized Payload**: Attacker sends a 50,000-character string in `description` -> Rejected by `.size() <= 1200`.
9. **Spoofed Reporter ID**: Student `user_1` creates a `LostReport` with `userId: "user_2"` -> Rejected by `incoming().userId == request.auth.uid`.
10. **Timestamp Manipulation**: Client passes forged `createdAt` timestamp not equal to `request.time` -> Rejected by `incoming().createdAt == request.time`.
11. **Terminal State Mutation**: Student attempts to update a `LostReport` whose `existing().status == "RETURNED"` -> Rejected by terminal state lock.
12. **Array Overflow on Match Reasons**: Client sends 50 elements in `reasons` array on `/matches/{matchId}` -> Rejected by `data.reasons.size() <= 10`.
