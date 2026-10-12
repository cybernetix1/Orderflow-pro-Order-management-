# Security Specification - OrderFlow Pro

## Data Invariants
1. An Order must always be associated with a valid Rep ID.
2. Only Admins can create or modify Rep profiles (including commission rates).
3. Reps can view all orders for the dashboard, but maybe only modify their own? 
   - Actually, the prompt implies a central management system ("Order management software"). 
   - Let's assume an Admin (the user) manages everything, or Reps can submit orders.
   - For simplicity and standard management flow: Admins manage all, Reps (if they log in) see their own.
   - Requirement: "Dashboard of how many orders each reps has brought". This sounds like a manager/admin view.
4. `createdAt` and `repId` are immutable once an order is created.
5. Status transitions must be valid.

## The "Dirty Dozen" Payloads (Red Team Test Cases)
1. **Identity Spoofing**: A rep trying to create an order with another rep's `repId`.
2. **Privilege Escalation**: A non-admin user trying to update their own `commissionPerOrder`.
3. **Ghost Field Injection**: Adding `isBonusEligible: true` to an order document.
4. **Invalid Type**: Sending `amount: "one hundred"` (string instead of number).
5. **ID Poisoning**: Using a 2KB string as a document ID.
6. **Immutable Breach**: Attempting to change the `repId` of an existing order.
7. **Orphaned Order**: Creating an order for a `repId` that doesn't exist in the `reps` collection.
8. **PII Leak**: A non-authenticated user trying to list all orders.
9. **Temporal Fraud**: Setting `createdAt` to a future date instead of `request.time`.
10. **Role Hijacking**: A new user setting their own role to `admin` during creation.
11. **Update Gap**: Updating an order status without providing the required `updatedAt` server timestamp.
12. **Massive Payload**: Sending a customer name string that is 1MB in size.

## Test Runner Plan
A `firestore.rules.test.ts` will be created to verify these constraints.
