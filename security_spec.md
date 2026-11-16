# Pulzitive Agency Firestore Security Specification

## 1. Data Invariants
1. **Identity & Role Integrity**: No user may self-assign `'admin'` in `/users/{userId}` or `/admins/{adminId}` unless verified as the bootstrapped Admin email (`salamabiodun01@gmail.com` with `email_verified == true`) or already registered in `/admins/{uid}`. Users cannot escalate `role`, `ownerUid`, `email`, or `createdAt` during updates.
2. **Student Enrollment & Certificate Integrity**: A `StudentEnrollment` document cannot exist without a corresponding `/users/{studentUid}` profile. On creation, `status` MUST be `'active'`, `certificateIssued` MUST be `false`, `certificateId` MUST be `''`, and `mentorNotes` MUST be `''`. Only Admins can issue certificates (`certificateIssued`, `certificateId`), promote `status` to `'graduated'`, or write `mentorNotes`. Students cannot modify an enrollment once `status == 'graduated'`.
3. **Client Service Booking Integrity**: A `ServiceBooking` document requires an existing `/users/{clientUid}` profile, starts with `status == 'submitted'`, and restricts client edits to brief/timeline/budget/reference fields only while `status != 'delivered'`. Only Admins can transition production status or write `agencyMilestone`/`agencyNotes`.
4. **Free Audit Integrity**: A `FreeAuditRequest` requires an existing `/users/{clientUid}` profile and starts with `status == 'pending'`. Clients cannot mark an audit `'delivered'` or overwrite Admin diagnostic reviews after submission.
5. **Immutable Activity Trail**: `/activityLogs/{logId}` documents are append-only (`update: false`, `delete: false`), must match `actorUid == request.auth.uid`, and cannot spoof `'admin'` role unless `isAdmin()`.
6. **PII & List Isolation**: No collection permits blanket `isSignedIn()` reads or client-trusted list queries. Every `allow list` validates `isBootstrappedAdmin()` (verified token email check with zero DB lookups) or `resource.data.<ownerUidField> == request.auth.uid`.

## 2. The "Dirty Dozen" Attack Payloads (Expected: `PERMISSION_DENIED`)
1. **Self-Admin Escalation on `/users/{uid}`**: `{ "ownerUid": "<uid>", "role": "admin", ... }` -> Denied by `data.role in ['student', 'client']`.
2. **Ghost Field Shadow Write on `/serviceBookings/{id}`**: Creating a booking with an extra `"discountApproved": true` key -> Denied by `data.keys().hasOnly(...)`.
3. **Unverified Email Spoofing**: Request with `email: "salamabiodun01@gmail.com"` and `email_verified: false` -> Denied by `request.auth.token.email_verified == true`.
4. **Self-Issued Certificate on Create**: Student creating `/studentEnrollments/{id}` with `"certificateIssued": true, "status": "graduated"` -> Denied by create invariants.
5. **Student Certificate Fraud on Update**: Student updating `certificateIssued` or `status: "graduated"` -> Denied by `affectedKeys().hasOnly(['completedModules', 'capstoneUrl', 'capstoneNotes', 'status', 'updatedAt'])` and `incoming().status in ['active', 'submitted_capstone']`.
6. **Terminal State Tampering**: Student updating `capstoneUrl` after `status == 'graduated'` -> Denied by terminal lock `existing().status != 'graduated'`.
7. **Orphaned Booking Injection**: Creating `/serviceBookings/{id}` without creating `/users/{uid}` first -> Denied by `exists(/databases/$(database)/documents/users/$(request.auth.uid))`.
8. **Cross-Tenant PII Read**: Authenticated Student A reading Client B's `/users/{clientB}` or `/freeAudits/{auditB}` -> Denied by ownership check.
9. **Blanket List Query Scraping**: Client executing `getDocs(collection(db, 'serviceBookings'))` without `.where('clientUid', '==', uid)` -> Denied by `resource.data.clientUid == request.auth.uid` on `allow list`.
10. **ID Poisoning Attack**: Writing document ID exceeding 128 chars or containing invalid symbols (`../admin`) -> Denied by `isValidId(id)`.
11. **Timestamp Forgery**: Submitting `createdAt: "2020-01-01T00:00:00Z"` instead of `request.time` -> Denied by `incoming().createdAt == request.time`.
12. **Audit Trail Tampering**: Authenticated user attempting to `update` or `delete` an `/activityLogs/{logId}` entry -> Denied by `allow update, delete: if false;`.
