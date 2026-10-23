# Sosha Deliveries Backend

A Node.js backend API for the Sosha Deliveries food delivery application, built with Express.js and MySQL.

## Features

- User authentication and profile management
- Restaurant and menu management
- Order placement and tracking
- Address management
- Real-time order status updates

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Installation

1. **Clone the repository and navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the backend directory with the following variables:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_NAME=sosha_deliveries
   JWT_SECRET=f2f196462f5247b49f94033b16bde25403a4d4efbcc684f65667f180d1619aae932888d4998a183e5f9d1c9c4a4203427a1cb6863f94cdb8642487ce0e02b214
   ```

4. **Set up the database:**
   - Create a MySQL database named `sosha_deliveries`
   - Run the schema file to create tables and insert sample data:
     ```bash
     mysql -u your_username -p sosha_deliveries < database/schema.sql
     ```

5. **Start the server:**
   ```bash
   npm start
   ```

   For development with auto-restart:
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/addresses` - Get user addresses
- `POST /api/users/addresses` - Add new address

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/status` - Update order status

### Restaurants
- `GET /api/restaurants` - Get all restaurants
- `GET /api/restaurants/:id` - Get restaurant details
- `GET /api/restaurants/:id/menu` - Get restaurant menu

## Database Schema

The database consists of the following main tables:
- `users` - User accounts
- `addresses` - User delivery addresses
- `restaurants` - Restaurant information
- `menu_items` - Restaurant menu items
- `orders` - Order records
- `order_items` - Individual order items
- `riders` - Delivery riders

## Testing the API

You can test the API endpoints using tools like:
- Postman
- Insomnia
- curl commands

Example curl command to test database connection:
```bash
curl http://localhost:5000/test-db
```

## Deployment

For production deployment:
1. Set `NODE_ENV=production` in environment variables
2. Use a process manager like PM2
3. Set up proper database credentials
4. Configure CORS for your frontend domain
5. Use HTTPS in production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
