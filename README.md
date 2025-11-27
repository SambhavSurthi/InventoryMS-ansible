# Inventory Management System

A comprehensive, production-ready Inventory Management System built with React (frontend), Spring Boot (backend), and MySQL (database). The system implements role-based authentication and provides complete CRUD operations for inventory management.

## 🚀 Features

### Core Features
- **Role-Based Authentication** with JWT tokens
- **User Management** (Admin, Manager, Sales roles)
- **Product Management** with categories and stock tracking
- **Order Management** with customer details
- **Inventory Dashboard** with charts and analytics
- **Sales Dashboard** with revenue tracking
- **Real-time Stock Updates** and low stock alerts
- **Responsive UI** with shadcn/ui components

### Technical Features
- **Backend**: Spring Boot with JPA/Hibernate
- **Frontend**: React with Redux Toolkit
- **Database**: MySQL with proper indexing
- **Security**: JWT authentication with refresh tokens
- **Validation**: Comprehensive form validation
- **UI/UX**: Modern, responsive design with Tailwind CSS
- **Charts**: Interactive dashboards with Recharts

## 🏗️ Architecture

### Backend (Spring Boot)
```
inventoryms/
├── src/main/java/com/ims/inventoryms/
│   ├── config/          # Security, JWT configuration
│   ├── controllers/     # REST API endpoints
│   ├── dto/            # Data Transfer Objects
│   ├── entity/         # JPA entities
│   ├── exception/      # Global exception handling
│   ├── repository/     # JPA repositories
│   └── service/        # Business logic layer
```

### Frontend (React)
```
inventoryms-frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── contexts/       # React contexts
│   ├── hooks/          # Custom hooks
│   ├── pages/          # Page components
│   ├── services/       # API services
│   ├── store/          # Redux store and slices
│   └── utils/          # Utility functions
```

## 🛠️ Installation & Setup

### Prerequisites
- Java 17 or higher
- Node.js 16 or higher
- MySQL 8.0 or higher
- Maven 3.6 or higher

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd InventoryMS
   ```

2. **Database Setup**
   ```sql
   CREATE DATABASE inventory_ms;
   CREATE USER 'inventory_user'@'localhost' IDENTIFIED BY 'inventory_password';
   GRANT ALL PRIVILEGES ON inventory_ms.* TO 'inventory_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

3. **Configure Database**
   Update `inventoryms/src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/inventory_ms
   spring.datasource.username=inventory_user
   spring.datasource.password=inventory_password
   ```

4. **Run the Backend**
   ```bash
   cd inventoryms
   mvn clean install
   mvn spring-boot:run
   ```

### Frontend Setup

1. **Install Dependencies**
   ```bash
   cd inventoryms-frontend
   npm install
   ```

2. **Configure API Base URL**
   Update `inventoryms-frontend/src/services/api.js`:
   ```javascript
   const API_BASE_URL = 'http://localhost:8080/api';
   ```

3. **Run the Frontend**
   ```bash
   npm run dev
   ```

## 🔐 Authentication & Roles

### User Roles
- **ADMIN**: Full system access, user management, all dashboards
- **MANAGER**: Inventory management, stock updates, inventory dashboard
- **SALES**: Order processing, sales dashboard, product viewing

### Default Credentials
```
Admin: admin / admin123
Manager: manager / manager123
Sales: sales / sales123
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - User logout

### Users (Admin only)
- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

### Categories (Admin only)
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category
- `PUT /api/categories/{id}` - Update category
- `DELETE /api/categories/{id}` - Delete category

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create product
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product
- `PUT /api/products/{id}/stock` - Update stock

### Orders (Sales/Manager/Admin)
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create order
- `PUT /api/orders/{id}` - Update order
- `DELETE /api/orders/{id}` - Delete order

### Dashboards
- `GET /api/dashboard/inventory` - Inventory dashboard data
- `GET /api/dashboard/sales` - Sales dashboard data
- `GET /api/dashboard/alerts` - Low stock alerts

## 🎨 UI Components

### Core Components
- **DataTable**: Sortable, searchable data tables
- **Modal**: Reusable modal dialogs
- **Toast**: Notification system
- **FormField**: Form validation wrapper
- **LoadingSpinner**: Loading states
- **ConfirmationDialog**: Action confirmations

### Pages
- **Dashboard**: Overview and quick actions
- **Users**: User management (Admin only)
- **Categories**: Category management (Admin only)
- **Products**: Product and inventory management
- **Orders**: Order processing and management
- **Inventory Dashboard**: Stock analytics and alerts
- **Sales Dashboard**: Sales analytics and trends
- **Profile**: User profile and settings

## 🔧 Development

### Backend Development
```bash
# Run with hot reload
mvn spring-boot:run

# Run tests
mvn test

# Build JAR
mvn clean package
```

### Frontend Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## 📝 Testing

### Postman Collection
A comprehensive Postman collection is included in the `postman/` directory:
- Import `Inventory_Management_System.postman_collection.json`
- Import `Inventory_MS_Environment.postman_environment.json`
- Follow the testing guide in `postman/API_Testing_Guide.md`

### Test Data
Use the SQL script in `postman/Test_Data_Setup.sql` to populate the database with test data.

## 🚀 Deployment

### Backend Deployment
1. Build the JAR file: `mvn clean package`
2. Deploy to your application server
3. Configure production database
4. Set environment variables for JWT secrets

### Frontend Deployment
1. Build the production bundle: `npm run build`
2. Deploy the `dist/` folder to your web server
3. Configure API base URL for production

## 🔒 Security Features

- **JWT Authentication** with refresh tokens
- **Role-based Access Control** (RBAC)
- **Password Encryption** with BCrypt
- **CORS Configuration** for cross-origin requests
- **Input Validation** on both frontend and backend
- **SQL Injection Prevention** with JPA/Hibernate

## 📈 Performance Optimizations

- **Database Indexing** on frequently queried fields
- **Lazy Loading** for JPA entities
- **Pagination** for large datasets
- **Caching** for frequently accessed data
- **Optimized Queries** with proper joins

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check MySQL service is running
   - Verify database credentials
   - Ensure database exists

2. **JWT Token Issues**
   - Check JWT secret configuration
   - Verify token expiration settings
   - Clear browser storage if needed

3. **CORS Errors**
   - Verify CORS configuration in SecurityConfig
   - Check frontend API base URL

4. **Build Errors**
   - Ensure Java 17+ is installed
   - Check Node.js version (16+)
   - Clear Maven/Node cache if needed

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

- **Sambhav Surthi** 
- **Adiseshu** 
- **Sravani** 

## 📞 Support

For support and questions, please contact the development team or create an issue in the repository.

---

**Built with ❤️ using Spring Boot, React, and MySQL**
