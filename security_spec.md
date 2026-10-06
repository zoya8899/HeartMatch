# HeartMatch Security Specification (ABAC & Invariant Security)

## 1. Data Invariants
1. **18+ Age Constraint**: Profile age must always be >= 18. Underage profiles are rejected.
2. **Identity Integrity**: A user can only write to their own user profile, preferences, likes, blocks, and reports.
3. **Immutability of Key Fields**: `createdAt`, `userId`, `reporterId`, `senderId` cannot be mutated after creation.
4. **Chat Privacy**: Messages in `/matches/{matchId}/messages/{messageId}` can only be read and written by actual participants of that match (`user1Id` or `user2Id`).
5. **Admin Access Privilege**: Sensitive operations (e.g. reviewing reports, approving 18+ verifications, modifying product pricing, suspending accounts) require an authenticated admin user matching whitelist in `/adminUsers/{uid}` or the bootstrap admin `zoyakhokhar001@gmail.com`.
6. **No Self-Assigned Roles**: Normal users cannot grant themselves `role: "admin"` or `verified: true` directly.
7. **No Negative or Arbitrary Pricing**: Product prices cannot be set below 0 and only admins can mutate the product catalogue.
8. **Private Notifications**: A user can only list and read notifications intended for their own `userId`.

## 2. The "Dirty Dozen" Payloads
1. **Underage Profile Exploit**: `{ "userId": "user123", "age": 16, "name": "Underage", ... }` -> Rejected by age >= 18 validator.
2. **Identity Impersonation Exploit**: User "attacker456" sends `{ "userId": "victim123", "name": "Impersonated" }` -> Rejected because `incoming().userId != request.auth.uid`.
3. **Self-Promotion to Admin**: User updates their User document with `{ "role": "admin" }` -> Rejected by RBAC field protection.
4. **Forged Verification Badge**: Normal user updates profile with `{ "verified": true }` without admin authorization -> Rejected.
5. **Unauthorized Message Snooping**: User "snooper" queries `/matches/matchA_B/messages` where they are neither userA nor userB -> Rejected with PERMISSION_DENIED.
6. **Message Sender Spoofing**: User A sends message inside match with `{ "senderId": "userB", "text": "Spoofed text" }` -> Rejected because `incoming().senderId != request.auth.uid`.
7. **Junk ID Poisoning**: Document write to `/profiles/` with 2000 character junk ID -> Rejected by `isValidId()` boundary check.
8. **Malicious Negative Price Injection**: Non-admin attempts to set `{ "productId": "vip", "price": -50.00 }` -> Rejected because non-admin cannot write products and price >= 0.
9. **Notification Harvesting**: Attacker attempts to list all notifications for all users -> Rejected by secure list query requiring `resource.data.userId == request.auth.uid`.
10. **Report Tampering**: Reported user attempts to delete or mark their own report as "dismissed" -> Rejected.
11. **Subscription Status Self-Activation**: Non-admin user sets `{ "userId": "myId", "status": "active", "planId": "vip" }` without verified server transaction -> Handled by server or admin verification.
12. **Ghost Field / Shadow Field Pollution**: Profile write containing `{ "hackerPayload": "execute_code", ... }` -> Blocked by strict allowed schema keys.
