# Smart Food Canteen

A full-stack web application for VIT College students to order food from the campus canteen. Built with React, TypeScript, Express backend, and PostgreSQL database.

## Features

- Student and owner role-based authentication
- Static menu with 31 food items across 6 categories
- Shopping cart management with real-time updates
- Order checkout and placement with payment methods
- Order history tracking for students
- Owner dashboard for managing all orders in real-time
- Responsive design for desktop and mobile
- Order status updates (pending → accepted → ready → completed)

## Tech Stack

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- Lucide React (icons)
- Vite (build tool)

### Backend
- Node.js with Express
- PostgreSQL (via Replit database)
- CORS enabled

### Database
- Replit PostgreSQL
- Row Level Security (RLS) ready
- Two tables: users and orders

## Project Structure

```
project/
├── src/
│   ├── components/
│   │   ├── Navigation.tsx       # Main navigation bar
│   │   └── Receipt.tsx          # Order receipt display
│   ├── context/
│   │   ├── AuthContext.tsx      # Authentication state management
│   │   └── CartContext.tsx      # Shopping cart state management
│   ├── data/
│   │   └── menuData.ts          # 31 static menu items
│   ├── pages/
│   │   ├── Login.tsx            # Login page
│   │   ├── Menu.tsx             # Menu browsing page
│   │   ├── Cart.tsx             # Shopping cart page
│   │   ├── Checkout.tsx         # Order checkout page
│   │   ├── Payment.tsx          # Payment selection page
│   │   ├── OrderHistory.tsx     # Order history page
│   │   └── OwnerDashboard.tsx   # Owner dashboard (manage orders)
│   ├── services/
│   │   └── api.ts               # API service layer
│   ├── types/
│   │   └── index.ts             # TypeScript type definitions
│   ├── App.tsx                  # Main app component
│   ├── main.tsx                 # App entry point
│   └── index.css                # Global styles
├── server.js                    # Express backend API
├── vite.config.ts              # Vite configuration
├── package.json                # Dependencies and scripts
└── README.md                   # This file
```

## Database Schema

### Users Table
- `id` (uuid, primary key)
- `email` (text, unique)
- `prn_hash` (text)
- `role` (text: 'STUDENT' or 'OWNER')
- `full_name` (text)
- `created_at` (timestamptz)

### Orders Table
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key)
- `items` (jsonb)
- `total` (decimal)
- `status` (text: 'pending', 'ACCEPTED', 'READY', 'COMPLETED')
- `payment_method` (text: 'CASH', 'GPAY', 'PHONEPE', 'UPI')
- `payment_status` (text: 'PAID', 'CASH', 'PENDING')
- `payment_data` (jsonb: {studentName, studentEmail})
- `created_at` (timestamptz)
- `payment_time` (timestamptz)
- `valid_till_time` (timestamptz)

## API Endpoints

### Base URL (Development)
`http://localhost:3001`

### Base URL (Production)
`https://your-replit-domain.replit.dev`

### Authentication
**POST /login**
- Request: `{ email, password }`
- Response: `{ success, user: {id, email, role, full_name} }`

### Orders (Student)
**GET /orders/:userId**
- Get all orders for a specific student
- Response: `{ success, orders }`

**POST /orders**
- Create a new order
- Request: `{ userId, items, total, paymentMethod, paymentStatus }`
- Response: `{ success, order, receipt }`

### Orders (Owner)
**GET /orders/all**
- Get all orders from all students
- Header: `x-owner-email: canteen@vit.edu`
- Response: `{ success, orders }`

**PATCH /orders/:orderId**
- Update order status
- Header: `x-owner-email: canteen@vit.edu`
- Request: `{ status: 'ACCEPTED' | 'READY' | 'COMPLETED' }`
- Response: `{ success, order }`

### Health Check
**GET /healthz**
- Health check endpoint
- Response: `{ status, message }`

## Setup Instructions

### Prerequisites
- Node.js 20 or higher
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Database setup is automatic via Replit PostgreSQL

3. Start development server:
```bash
npm run dev
```
The frontend will run on `http://localhost:5000` and the backend on `http://localhost:3001`

4. For production build:
```bash
npm run build
```

## Test Credentials

### Student Accounts
- Email: `john.12345@vit.edu` / Password: `12345`
- Email: `sarah.67890@vit.edu` / Password: `67890`
- Email: `sarthak.1251090107@vit.edu` / Password: `1251090107`

### Owner Account
- Email: `canteen@vit.edu` / Password: `canteen`

## Usage Flow

### For Students
1. **Login**: Enter college email and PRN number
2. **Browse Menu**: View 31 food items across 6 categories
3. **Add to Cart**: Select items and quantities
4. **Review Cart**: Adjust quantities or remove items
5. **Checkout**: Review order summary
6. **Payment**: Select payment method (Cash/UPI/GPay/PhonePe)
7. **Order History**: Track all past orders

### For Owner
1. **Login**: Use owner credentials
2. **View Dashboard**: See all student orders in real-time
3. **Manage Orders**: Update status from pending → accepted → ready → completed
4. **Track Orders**: Monitor order statistics and details

## Menu Categories

The application includes a comprehensive menu:
- **Snacks** (Tea, Black Tea, Vada Pav, Samosa, Patties, Misal Pav)
- **Paratha** (Aaloo, Palak, Paneer, Methi, Lachha, Cheese Corn)
- **South Indian** (Masala Dosa, Bombay Dosa, Plain Uttappa, Onion Uttappa, Idli, Bombay Uttappa)
- **Chinese** (Schezwan Rice, Fried Rice, Schezwan Noodles, Hakka Noodles, Manchurian)
- **Sandwich** (Veg Plain, Chocolate, Veg Cheese Grill, Butter Grill)
- **Cold Drinks** (Coca Cola, Pepsi, Sprite, Fanta, Mountain Dew, Cold Coffee)

## Authentication Rules

- Email format: `firstname.PRN@vit.edu`
- Password: PRN number extracted from email
- Owner email: `canteen@vit.edu` with password: `canteen`
- No signup or password reset functionality
- Session persists in browser localStorage

## Deployment

The application is configured for Replit's Autoscale deployment:

1. Click the **Publish** button in Replit
2. The system will:
   - Run `npm run build` to create production build
   - Start the Express server on port 5000
   - Serve the React app alongside API endpoints

You'll receive a public URL to share with VIT students!

## Development Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Type checking
npm run typecheck

# Preview production build
npm run preview
```

## Security Features

- Email format validation
- PRN matching validation
- Role-based access control
- Owner endpoint authorization via custom header
- CORS configuration
- Error message sanitization

## Notes

- Payment integration: Currently uses "pay at pickup" model
- Menu is static (no admin panel to modify)
- Cart data persists in browser localStorage
- Authentication data persists in localStorage
- Real-time order status updates available
- Owner dashboard shows all orders automatically

## Architecture Highlights

- **Clean three-tier architecture**: Frontend → Backend → Database
- **Context API** for state management
- **Service layer** for API calls
- **TypeScript** for type safety
- **Tailwind CSS** for responsive design
- **Express** for lightweight backend
- **PostgreSQL** for data persistence

## License

This project is for educational purposes.
