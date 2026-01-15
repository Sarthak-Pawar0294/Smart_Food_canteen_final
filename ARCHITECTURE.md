# Smart Food Canteen - Architecture Documentation

## System Overview

Smart Food Canteen is a three-tier full-stack web application designed for college students to order food from campus canteens. The system includes role-based authorization with separate interfaces for students and the canteen owner.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend Layer                       │
│                    (React + TypeScript)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Login   │  │   Menu   │  │   Cart   │  │Checkout  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │        OwnerDashboard (Role-based, Protected)        │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────┐    ┌──────────────────────┐      │
│  │   AuthContext        │    │   CartContext        │      │
│  │ (State Management)   │    │ (State Management)   │      │
│  └──────────────────────┘    └──────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ REST API (HTTPS/HTTP)
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                         Backend Layer                        │
│                    (Node.js + Express)                       │
│  ┌───────────────────────────────────────────────────────┐ │
│  │           Express.js API Server (Port 3001/5000)       │ │
│  │  POST /login        GET/POST /orders                  │ │
│  │  GET /orders/all    PATCH /orders/:id  (Owner)        │ │
│  │  GET /healthz       Static file serving (Prod)        │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ SQL Queries
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                       Database Layer                         │
│                   (PostgreSQL via Replit)                    │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │   users table    │         │  orders table    │         │
│  │  - id (uuid)     │         │  - id (uuid)     │         │
│  │  - email         │─────────│  - user_id       │         │
│  │  - role          │         │  - items (JSON)  │         │
│  │  - full_name     │         │  - total         │         │
│  │  - prn_hash      │         │  - status        │         │
│  │  - created_at    │         │  - payment_*     │         │
│  └──────────────────┘         │  - created_at    │         │
│                                └──────────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

## Development vs Production

### Development Setup
```
Frontend (Vite) on :5000 ─┐
                          ├─→ Vite proxy routes /api to :3001
Backend (Express) on :3001┘
Database: PostgreSQL (shared)
```

### Production Setup
```
Single Express Server on :5000
├─ Serves compiled React app (from dist/)
├─ Handles API requests
└─ Connected to PostgreSQL
```

## Component Architecture

### Frontend Layer

#### Pages (7 Total)
1. **Login.tsx**
   - Email and password input
   - Format validation
   - Role-based navigation after login
   - Test credentials display

2. **Menu.tsx**
   - 31 food items across 6 categories
   - Category filtering
   - Add to cart functionality
   - Item images and details

3. **Cart.tsx**
   - View cart items
   - Quantity adjustment
   - Remove items
   - Price calculation with display
   - Empty cart state

4. **Checkout.tsx**
   - Order summary
   - User information
   - Item details with quantities
   - Proceed to payment button

5. **Payment.tsx**
   - Payment method selection
   - Tax and total calculation
   - Order placement
   - Success feedback

6. **OrderHistory.tsx**
   - List all student orders
   - Order details (items, total, timestamp)
   - Status display
   - Chronological ordering

7. **OwnerDashboard.tsx** (Protected - Owner only)
   - View all student orders in real-time
   - Order statistics (pending, accepted, ready, completed)
   - Update order status
   - Student information display
   - Filter by status (if implemented)

#### Context Providers (State Management)
- **AuthContext**:
  - User authentication state (email, role, id)
  - Login/logout functions
  - localStorage persistence
  - Role-based routing

- **CartContext**:
  - Shopping cart state (items array)
  - Cart operations (add, remove, update)
  - Total calculation
  - localStorage persistence
  - Clear cart after order

#### Services (API Layer)
- **api.ts**:
  - login(email, password)
  - createOrder(userId, items, total, paymentMethod)
  - getOrders(userId) - Student orders
  - getAllOrders(ownerEmail) - Owner endpoint
  - updateOrderStatus(orderId, status, ownerEmail)
  - Error handling for all requests

#### Components
- **Navigation.tsx**:
  - Logo and branding
  - Navigation links (role-based)
  - Cart item count badge
  - User information display
  - Logout button

- **Receipt.tsx**:
  - Order receipt display
  - Order details formatting
  - Print-friendly layout

#### Data Layer
- **menuData.ts**:
  - 31 static menu items
  - 6 categories
  - Detailed item information (name, price, image, description)
  - Stock images from Pexels/CDN

#### Types
```typescript
interface User {
  id: string;
  email: string;
  role: 'OWNER' | 'STUDENT';
  full_name?: string;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
}

interface CartItem extends MenuItem {
  quantity: number;
}

interface Order {
  id: string;
  user_id: string;
  items: CartItem[];
  total: number;
  status: string;
  payment_method?: PaymentMethod;
  payment_status?: PaymentStatus;
  payment_data?: any;
  created_at: string;
}
```

### Backend Layer

#### Express.js Server
- Runs on port 3001 (development) or 5000 (production)
- Connects to PostgreSQL via pg library
- Uses connection pooling
- CORS enabled for cross-origin requests

#### API Endpoints

**Authentication**
```
POST /login
- Email validation (student or owner)
- PRN matching
- Returns user object with role
- 401 Unauthorized on failure
```

**Student Orders**
```
GET /orders/:userId
- Fetch user's orders
- Ordered by created_at DESC
- Returns orders array

POST /orders
- Create new order
- Extracts student name/email
- Generates payment data
- Returns order and receipt
```

**Owner Orders** (Protected via header)
```
GET /orders/all
- Header: x-owner-email: canteen@vit.edu
- Returns all orders
- 403 Forbidden if not authorized

PATCH /orders/:orderId
- Header: x-owner-email: canteen@vit.edu
- Body: { status: 'ACCEPTED' | 'READY' | 'COMPLETED' }
- Updates order status
- Returns updated order
```

**Health Check**
```
GET /healthz
- Returns { status: 'ok', message: 'API running' }
```

#### Authorization Strategy
- **Frontend**: Role-based route protection (useState + conditional rendering)
- **Backend**: Custom header validation for owner endpoints
- **Database**: Foreign key constraints and data isolation
- No token-based auth (simplified for academic project)

### Database Layer

#### Users Table
```sql
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  prn_hash text NOT NULL,
  role text DEFAULT 'STUDENT' NOT NULL,
  full_name text,
  created_at timestamptz DEFAULT now()
);
```

#### Orders Table
```sql
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  items jsonb NOT NULL,
  total decimal(10,2) NOT NULL,
  status text DEFAULT 'pending' NOT NULL,
  payment_method text,
  payment_status text,
  payment_data jsonb,
  payment_time timestamptz,
  valid_till_time timestamptz,
  created_at timestamptz DEFAULT now()
);
```

#### Indexes
- `users(email)` - For login queries
- `orders(user_id)` - For student order queries
- `orders(created_at)` - For chronological ordering

#### Test Data
- 1 owner account: canteen@vit.edu
- 3+ student accounts with various PRNs
- Sample orders for demonstration

## Data Flow

### Login Flow
```
User Input (email, password)
         ↓
Login.tsx validation
         ↓
api.login() → POST /login
         ↓
Backend validates email format & PRN
         ↓
Database query users table
         ↓
Return user object with role
         ↓
AuthContext stores user + role
         ↓
localStorage saves session
         ↓
Navigate based on role (student menu / owner dashboard)
```

### Order Creation Flow
```
Add item to cart
         ↓
CartContext: addItem(item)
         ↓
Item added to cart array
         ↓
localStorage saves cart
         ↓
UI updates (badge count, cart display)
         ↓
[Student adjusts quantities and proceeds to checkout]
         ↓
api.createOrder(userId, items, total)
         ↓
Backend extracts student data from database
         ↓
Inserts into orders table
         ↓
CartContext: clearCart()
         ↓
Navigate to order history
```

### Owner Order Management Flow
```
Owner logs in with canteen@vit.edu
         ↓
AuthContext recognizes role: 'OWNER'
         ↓
Navigation shows Dashboard link
         ↓
OwnerDashboard mounts
         ↓
api.getAllOrders(ownerEmail)
         ↓
Backend validates x-owner-email header
         ↓
Returns all orders from database
         ↓
Display orders with status buttons
         ↓
Owner clicks "Mark as Accepted"
         ↓
api.updateOrderStatus(orderId, 'ACCEPTED')
         ↓
Backend validates header + status
         ↓
Database updates order status
         ↓
UI reflects new status
```

## Design Patterns

### 1. Context Pattern (State Management)
- AuthContext for auth state
- CartContext for cart state
- Avoids prop drilling
- Provides hooks for component usage

### 2. Service Layer Pattern
- Centralizes API calls (api.ts)
- Clean separation from components
- Single source of truth for endpoints
- Easy error handling

### 3. Component Composition
- Small, focused components
- Clear component hierarchy
- Reusable UI elements
- Props-based configuration

### 4. Role-Based Access Control
- Frontend: Route protection via role check
- Backend: Header-based authorization
- No database role queries (simplified)
- Secure for single-owner scenario

## Security Features

### Frontend Security
- Email format validation (`firstname.PRN@vit.edu`)
- PRN extraction and matching
- Protected routes (owner dashboard)
- localStorage for session persistence
- No sensitive data in localStorage

### Backend Security
- Email format validation with regex
- PRN matching validation
- Authorization header checks
- CORS configuration
- Error message sanitization
- SQL parameterized queries

### Database Security
- Foreign key constraints
- Data validation
- Indexed queries for performance
- No SQL injection (parameterized queries)

## Performance Optimizations

### Frontend
- Static menu data (no API calls)
- localStorage for cart persistence
- Lazy state updates
- Optimistic UI updates
- Efficient re-renders with Context

### Backend
- Single entry point (server.js)
- Connection pooling
- Parameterized SQL queries
- Minimal data transfer
- Proper status codes

### Database
- Indexes on frequently queried columns
- JSONB for flexible order items
- Efficient foreign key relationships
- Proper data types

## Scalability Considerations

### Current Scale
- Single college campus
- Hundreds of concurrent users
- Thousands of orders

### Future Enhancements
- Real-time updates (WebSockets)
- Push notifications
- Multiple canteens
- Payment gateway
- Menu management system
- Order customization
- Rating and reviews
- Analytics dashboard

## Deployment Architecture

### Development
```bash
npm run dev
# Starts both:
# - Vite dev server (:5000)
# - Express backend (:3001)
# - PostgreSQL database
```

### Production (Replit Autoscale)
```bash
npm run build
# Creates dist/ folder with compiled React

# Then deployed with:
PORT=5000 node server.js
# - Serves static React from dist/
# - Handles all API routes
# - Uses same PostgreSQL database
```

## Error Handling

### Frontend
- Try-catch blocks for all API calls
- User-friendly error messages
- Loading states during operations
- Fallback UI for empty states

### Backend
- Comprehensive error catching
- Descriptive HTTP status codes
- JSON error responses
- Error logging in console

### Database
- Connection error handling
- Query timeout handling
- Transaction rollback on failure

## Technology Choices

### React + TypeScript
- Component-based UI
- Type safety
- Large ecosystem
- Easy state management

### Express.js
- Lightweight backend
- Simple routing
- Middleware support
- Fast startup

### PostgreSQL
- Reliable data persistence
- ACID compliance
- Complex queries
- Scalable

### Tailwind CSS
- Rapid UI development
- Responsive design
- No CSS conflicts
- Utility-first approach

### Vite
- Fast development server
- Instant HMR
- Optimized builds
- Modern tooling

## Testing Strategy

### Manual Testing Scenarios
1. **User Authentication**
   - Login with student credentials
   - Login with owner credentials
   - Invalid email format
   - Wrong password

2. **Student Features**
   - Browse menu
   - Filter by category
   - Add items to cart
   - Manage cart quantities
   - Place order
   - View order history

3. **Owner Features**
   - View all orders
   - Update order status
   - See real-time updates
   - Filter orders (if implemented)

4. **Edge Cases**
   - Empty cart
   - Network errors
   - Duplicate logins
   - Order with single item

## Conclusion

This architecture provides a balanced solution between simplicity and functionality. The three-tier design allows for independent scaling of frontend, backend, and database. Role-based access control is cleanly separated, and the codebase is maintainable and extensible.
