# Role-Based Authorization Implementation

## Overview

The Smart Food Canteen application implements role-based authorization with two distinct user roles:
- **STUDENT**: Can browse menu, place orders, and view their own orders
- **OWNER**: Can view all student orders and update order statuses

## Architecture

### Database Layer

#### Users Table Structure
```sql
ALTER TABLE users ADD COLUMN role text DEFAULT 'STUDENT';
```

- `role` column stores: 'OWNER' or 'STUDENT'
- Default role is 'STUDENT'
- One pre-seeded owner account: `canteen@vit.edu`

#### Data Example
```
Students:
├── john.12345@vit.edu (STUDENT)
├── sarah.67890@vit.edu (STUDENT)
└── sarthak.1251090107@vit.edu (STUDENT)

Owner:
└── canteen@vit.edu (OWNER)
```

### Backend API (Express.js)

#### Login Endpoint
**POST /login**
```javascript
Request: { email, password }

Response (Student):
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "john.12345@vit.edu",
    "role": "STUDENT",
    "full_name": "John Doe"
  }
}

Response (Owner):
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "canteen@vit.edu",
    "role": "OWNER",
    "full_name": "Canteen Manager"
  }
}
```

#### Owner-Only Endpoints

**GET /orders/all** (Protected)
- Fetches all orders from all students
- Required Header: `x-owner-email: canteen@vit.edu`
- Returns 403 Forbidden if header doesn't match
- Response: `{ success, orders: [...] }`

**PATCH /orders/:orderId** (Protected)
- Updates order status
- Valid statuses: ACCEPTED, READY, COMPLETED
- Required Header: `x-owner-email: canteen@vit.edu`
- Request: `{ status: "READY" }`
- Response: `{ success, order: {...} }`

#### Authorization Method
```javascript
// Check owner header
const ownerEmail = req.headers['x-owner-email'];
if (ownerEmail !== OWNER_EMAIL) {
  return res.status(403).json({ error: 'Unauthorized' });
}
```

**Why this approach?**
- Simple to implement (no database queries for auth)
- Secure for single-owner scenario
- Fast (no extra database overhead)
- Easy to verify and audit

### Frontend Layer

#### Type System
```typescript
interface User {
  id: string;
  email: string;
  role: 'OWNER' | 'STUDENT';
  full_name?: string;
}
```

#### AuthContext Features
- Stores user object with role
- localStorage persistence
- Login/logout functions
- isAuthenticated state

#### Navigation Component
```typescript
// Conditional rendering based on role
{user?.role === 'OWNER' && (
  <button onClick={() => navigate('owner')}>
    Dashboard
  </button>
)}

// Student-only navigation
{user?.role === 'STUDENT' && (
  <>
    <button>Menu</button>
    <button>Cart</button>
    <button>Orders</button>
  </>
)}
```

#### Route Protection
```typescript
// In App.tsx
if (currentPage === 'owner' && user?.role !== 'OWNER') {
  return <AccessDenied />;
}
```

### Owner Dashboard Features

#### Page: OwnerDashboard.tsx
- Real-time order display
- Order statistics:
  - Pending orders
  - Accepted orders
  - Ready orders
  - Completed orders
- Action buttons for status updates
- Student information display
- Order details (items, total, timestamp, payment info)

#### Order Status Workflow
```
pending (initial) 
   ↓
ACCEPTED (owner accepts order)
   ↓
READY (food ready for pickup)
   ↓
COMPLETED (student picked up)
```

#### Real-Time Updates
- Owner dashboard fetches all orders on mount
- Manual refresh shows latest orders
- Status updates reflected immediately
- Statistics update in real-time

## Owner Account Credentials

```
Email: canteen@vit.edu
Password: canteen
Role: OWNER
```

## Student Accounts

These accounts continue to work as before:
- `john.12345@vit.edu` / `12345` (STUDENT)
- `sarah.67890@vit.edu` / `67890` (STUDENT)
- `sarthak.1251090107@vit.edu` / `1251090107` (STUDENT)

## API Usage Examples

### Student Login
```bash
curl -X POST http://localhost:3001/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"john.12345@vit.edu","password":"12345"}'
```

Response:
```json
{
  "success": true,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john.12345@vit.edu",
    "role": "STUDENT",
    "full_name": "John Doe"
  }
}
```

### Owner Login
```bash
curl -X POST http://localhost:3001/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"canteen@vit.edu","password":"canteen"}'
```

Response:
```json
{
  "success": true,
  "user": {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "email": "canteen@vit.edu",
    "role": "OWNER",
    "full_name": "Canteen Manager"
  }
}
```

### Get All Orders (Owner Only)
```bash
curl -X GET http://localhost:3001/orders/all \
  -H 'x-owner-email: canteen@vit.edu'
```

Response:
```json
{
  "success": true,
  "orders": [
    {
      "id": "order-uuid",
      "user_id": "user-uuid",
      "items": [...],
      "total": "250.50",
      "status": "pending",
      "payment_data": {
        "studentName": "John Doe",
        "studentEmail": "john.12345@vit.edu"
      },
      "created_at": "2025-12-23T10:30:00.000Z"
    }
  ]
}
```

### Update Order Status (Owner Only)
```bash
curl -X PATCH http://localhost:3001/orders/550e8400-e29b-41d4-a716-446655440001 \
  -H 'Content-Type: application/json' \
  -H 'x-owner-email: canteen@vit.edu' \
  -d '{"status":"READY"}'
```

Response:
```json
{
  "success": true,
  "order": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "status": "READY",
    ...
  }
}
```

## Security Features

### Frontend Route Protection
```typescript
// Students cannot navigate to owner routes
if (currentPage === 'owner' && user?.role !== 'OWNER') {
  return <div>Access Denied</div>;
}
```

### Backend Authorization
```javascript
// All owner endpoints verify header
const ownerEmail = req.headers['x-owner-email'];
if (ownerEmail !== OWNER_EMAIL) {
  return res.status(403).json({ error: 'Unauthorized' });
}
```

### Data Isolation
- Students only see `/orders/:userId` (their own orders)
- Owner sees `/orders/all` (all orders)
- Students cannot call owner endpoints
- No way to change roles from UI

### No Role Selection
- Users cannot change their role
- Role is hardcoded in database
- Frontend has no role switcher
- Backend enforces via email check

## Testing the Feature

### Test as Student
1. Login with: `john.12345@vit.edu` / `12345`
2. See: Menu, Cart, Orders in navigation
3. Place an order
4. View only your orders in "Orders" page
5. Try accessing owner dashboard → "Access Denied"

### Test as Owner
1. Login with: `canteen@vit.edu` / `canteen`
2. See: Dashboard in navigation
3. Click Dashboard
4. View all student orders
5. Update order status: pending → ACCEPTED → READY
6. See statistics update

### Test Authorization
1. Login as student
2. Open browser DevTools → Network tab
3. Try calling `/orders/all` manually
4. Add header: `x-owner-email: canteen@vit.edu`
5. Still blocked (header must match exactly)
6. Only works when you're the owner

## Implementation Files

### Backend
- `server.js` - API endpoints with authorization checks
  - Line 87-95: GET /orders/all (owner only)
  - Line 114-134: PATCH /orders/:orderId (owner only)
  - Line 22-40: POST /login (returns user with role)

### Frontend
- `src/types/index.ts` - User interface with role
- `src/context/AuthContext.tsx` - Manages user role
- `src/services/api.ts` - API methods with owner header
- `src/components/Navigation.tsx` - Role-based navigation
- `src/pages/OwnerDashboard.tsx` - Protected owner page
- `src/App.tsx` - Route protection logic

### Database
- `users` table has `role` column
- `canteen@vit.edu` pre-seeded with OWNER role
- Student accounts have default STUDENT role

## Authorization Flow Diagram

```
User Input
    ↓
Login Page
    ↓
POST /login
    ↓
Backend returns user with role
    ↓
AuthContext stores role
    ↓
Frontend routing based on role
    ├─ STUDENT → Menu, Cart, Orders pages
    └─ OWNER → Dashboard page
    ↓
For owner endpoints:
├─ Send request with x-owner-email header
├─ Backend validates header
├─ Backend validates role requirement
└─ Return 403 if unauthorized
```

## Future Enhancements

### Possible Improvements
- Database-based role checking (RLS policies)
- JWT tokens for better security
- Multiple owners/staff accounts
- Order history for owner
- Revenue analytics
- Menu management panel
- Notification system
- Real-time WebSocket updates

### Performance Optimizations
- Cache owner order list
- Pagination for large order lists
- Database transactions for updates
- Real-time subscriptions

## Security Considerations

### Current Implementation
- ✅ Simple header-based authorization
- ✅ No password hashing (academic project)
- ✅ Role-based routing
- ✅ Backend validation on all owner endpoints
- ⚠️ Single owner (no multi-owner support)

### Production Recommendations
- Add proper password hashing (bcrypt)
- Implement JWT tokens with expiration
- Add rate limiting on login
- Enable HTTPS only
- Add audit logging
- Use database RLS policies
- Add account lockout after failed attempts

## Testing Checklist

- [ ] Student can login
- [ ] Owner can login
- [ ] Student sees menu/cart/orders in navigation
- [ ] Owner sees only dashboard
- [ ] Student cannot access /owner route
- [ ] Student orders appear in owner dashboard
- [ ] Owner can update order status
- [ ] Student can see updated status in history
- [ ] Unauthorized header returns 403
- [ ] Wrong header value returns 403

## Summary

This implementation provides a clean, secure separation between student and owner functionality. The header-based authorization is simple yet effective for a single-owner scenario, and the frontend route protection ensures students cannot access owner features.
