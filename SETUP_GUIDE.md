# Smart Food Canteen - Setup Guide

## Quick Start

Follow these steps to run the application on Replit:

### Step 1: Install Dependencies

The dependencies are automatically installed when you run the development server. However, you can manually install them:

```bash
npm install
```

### Step 2: Start Development Server

Run the development server with:

```bash
npm run dev
```

This command will:
- Start the Express backend on `http://localhost:3001`
- Start Vite development server on `http://localhost:5000`
- Both are automatically available in Replit's preview

### Step 3: Login

Use one of the test credentials to login:

**Student Account:**
- Email: `john.12345@vit.edu`
- Password: `12345`

Other student accounts:
- Email: `sarah.67890@vit.edu` / Password: `67890`
- Email: `sarthak.1251090107@vit.edu` / Password: `1251090107`

**Owner Account:**
- Email: `canteen@vit.edu` / Password: `canteen`

### Step 4: Use the Application

#### As a Student:
1. Browse the menu and add items to your cart
2. Click "Cart" to review your order
3. Click "Proceed to Checkout" to place your order
4. Select a payment method
5. View your order history in the "Orders" section

#### As an Owner:
1. Login with owner credentials
2. Navigate to the Dashboard (gear icon)
3. View all student orders in real-time
4. Update order status: pending → ACCEPTED → READY → COMPLETED

## Project Components

### Frontend Pages
- **Login Page**: Authentication with college email and PRN
- **Menu Page**: Browse 31 food items across 6 categories
- **Cart Page**: Review and modify cart items
- **Checkout Page**: Confirm and place order
- **Payment Page**: Select payment method
- **Order History**: View all past orders (Students)
- **Owner Dashboard**: Manage all orders (Owner only)

### Backend API
The backend runs on Node.js Express and handles:
- User authentication (student and owner)
- Order creation
- Order retrieval
- Order status updates (owner only)

### Database
Replit PostgreSQL database with two tables:
- `users`: Stores student and owner accounts
- `orders`: Stores order history with payment details

## Architecture

### Development Setup
- **Frontend**: Vite dev server on port 5000
- **Backend**: Express server on port 3001
- **Database**: Replit PostgreSQL
- **Vite Proxy**: Routes `/api` requests to backend

### Production Setup
- **Single Server**: Express serves both static React app and API
- **Port**: 5000 (Replit's exposed port)
- **Database**: Same PostgreSQL database
- **Build**: React compiled to `dist/` folder

## Authentication Details

### Student Login
- Email format: `firstname.PRN@vit.edu`
- Password: PRN number (the numeric part)
- Example: `john.12345@vit.edu` → password is `12345`

### Owner Login
- Email: `canteen@vit.edu`
- Password: `canteen`

### Owner API Access
Owner endpoints require header: `x-owner-email: canteen@vit.edu`

## Available Scripts

### Development
```bash
npm run dev
```
Starts both backend and Vite dev server with hot reload.

### Build
```bash
npm run build
```
Compiles React app to `dist/` folder for production.

### Type Check
```bash
npm run typecheck
```
Runs TypeScript compiler to check for type errors.

### Lint
```bash
npm run lint
```
Runs ESLint to check code quality.

### Preview
```bash
npm run preview
```
Preview the production build locally.

## Menu Items (31 Total)

### Snacks (6 items)
- Tea (₹12)
- Black Tea (₹15)
- Vada Pav (₹18)
- Samosa (₹20)
- Patties (₹22)
- Misal Pav (₹60)

### Paratha (6 items)
- Aaloo Paratha (₹50)
- Palak Paratha (₹60)
- Paneer Paratha (₹75)
- Methi Paratha (₹60)
- Lachha Paratha (₹55)
- Cheese Corn Paratha (₹50)

### South Indian (6 items)
- Masala Dosa (₹60)
- Bombay Dosa (₹65)
- Plain Uttappa (₹55)
- Onion Uttappa (₹55)
- Idli Chatni Sambar (₹40)
- Bombay Uttappa (₹65)

### Chinese (5 items)
- Schezwan Rice (₹90)
- Fried Rice (₹80)
- Schezwan Noodles (₹90)
- Hakka Noodles (₹80)
- Manchurian (₹70)

### Sandwich (4 items)
- Veg Plain Sandwich (₹50)
- Chocolate Sandwich (₹55)
- Veg Cheese Grill Sandwich (₹65)
- Butter Grill Sandwich (₹35)

### Cold Drinks (6 items)
- Coca Cola (₹40)
- Pepsi (₹40)
- Sprite (₹35)
- Fanta (₹35)
- Mountain Dew (₹45)
- Cold Coffee (₹40)

## Testing the Application

### Test Scenario 1: Complete Student Order Flow
1. Login with `john.12345@vit.edu` / `12345`
2. Add "Tea" to cart
3. Add "Samosa" to cart
4. Navigate to Cart
5. Adjust quantities if needed
6. Proceed to Checkout
7. Select payment method
8. Place order
9. View order in Order History

### Test Scenario 2: Owner Order Management
1. Login with `canteen@vit.edu` / `canteen`
2. See all student orders in dashboard
3. Update order status: pending → ACCEPTED
4. Update again: ACCEPTED → READY
5. Update again: READY → COMPLETED
6. See statistics update

### Test Scenario 3: Multiple Users
1. Place order as john (john.12345@vit.edu)
2. Logout and login as sarah (sarah.67890@vit.edu)
3. Place different order
4. Login as owner, see both orders
5. Update john's order status
6. Login as john, see updated status in order history

## Troubleshooting

### Server Won't Start
- Ensure Node.js version 20+ is installed
- Delete `node_modules` and run `npm install` again
- Check if port 3001 and 5000 are available
- Check console for specific error messages

### Build Fails
- Run `npm run typecheck` to identify TypeScript errors
- Clear the `dist` folder and try again
- Check for missing imports or syntax errors

### API Connection Errors
- Verify backend server is running on port 3001
- Check network tab in browser DevTools
- Ensure DATABASE_URL environment variable is set

### Login Issues
- Ensure email follows the format: `firstname.PRN@vit.edu`
- Password must exactly match the PRN in the email
- Try with the test credentials provided
- Check browser console for error messages

### Database Issues
- Verify DATABASE_URL is set correctly
- Check that Replit PostgreSQL is initialized
- Verify tables are created (users, orders)

## Technical Details

### State Management
- **AuthContext**: Manages user authentication state and role
- **CartContext**: Manages shopping cart state
- Both use localStorage for persistence across sessions

### Styling
- Tailwind CSS utility classes
- Custom color scheme using slate palette
- Responsive design with mobile breakpoints
- Icons from Lucide React

### API Communication
- Fetch API for HTTP requests
- Vite proxy routes `/api` to backend in dev
- Single Express server in production
- CORS headers configured on backend
- Error handling with user-friendly messages

### Backend Architecture
- Express.js for HTTP routing
- PostgreSQL via node-pg library
- Pool for connection management
- JSON request/response handling
- Role-based authorization

## Production Deployment

To deploy on Replit:

1. Click **Publish** button in Replit workspace
2. Select **Autoscale** deployment type
3. System will automatically:
   - Build React app (`npm run build`)
   - Start Express server on port 5000
   - Serve static app + API endpoints
4. Get a public URL for sharing with students

## Important Notes

1. **No Signup**: Users cannot create new accounts
2. **No Password Reset**: Users are pre-seeded
3. **Static Menu**: Menu items are hardcoded
4. **Pay at Pickup**: No payment processing
5. **localStorage**: Cart and auth data persist locally
6. **Role-based Access**: Owner dashboard is protected
7. **Real-time**: Owner sees orders update as students place them

## File Structure

```
project/
├── src/
│   ├── components/          # React components
│   ├── context/             # State management contexts
│   ├── data/               # Static data (menu)
│   ├── pages/              # Page components
│   ├── services/           # API service
│   ├── types/              # TypeScript types
│   └── App.tsx            # Main app
├── server.js              # Express backend
├── vite.config.ts         # Vite configuration
├── package.json           # Dependencies
└── README.md              # Full documentation
```

## Contact & Support

For questions or issues:
1. Check SETUP_GUIDE.md (this file) for common issues
2. See README.md for overview
3. Check ARCHITECTURE.md for technical details
4. Review ROLE_BASED_AUTH.md for owner functionality
