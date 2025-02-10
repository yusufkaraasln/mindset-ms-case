# Mindset Institute Backend Developer Case - README

## Overview
The Mindset Institute Sales Management Platform is a sophisticated microservices-based system designed to revolutionize how educational institutions manage their sales pipeline and customer relationships. Born from the need to streamline the student enrollment process and improve conversion rates, this platform enables educational consultants to efficiently track and nurture potential student relationships from initial contact to successful enrollment.

### The Story
Mindset Institute, a leading educational organization, faced challenges in managing their growing student enrollment pipeline. Their sales representatives were struggling with:
- Tracking conversations with prospective students across multiple channels
- Managing follow-ups and maintaining engagement
- Coordinating with different departments during the enrollment process
- Accessing up-to-date information about potential students
- Measuring and improving conversion rates

To address these challenges, we developed a comprehensive platform that transforms the traditional enrollment process into a streamlined, data-driven operation.

### Business Flow
1. **Lead Generation**: Sales representatives create new customer profiles for potential students
2. **Engagement Tracking**: The system tracks all interactions and maintains detailed notes
3. **Status Management**: Sales progress is tracked through various stages:
   - New (Initial Contact)
   - Contacted (Active Communication)
   - Agreement (Ready to Enroll)
   - Closed (Enrollment Complete)
4. **Access Control**: Different roles (Admin, Sales Rep, User) have appropriate access levels
5. **Performance Analytics**: Management can track conversion rates and sales performance

### Technical Architecture
The platform is built on a modern microservices architecture with five key services:

<p align="center"><img width="842"  alt="Ekran Resmi 2025-02-10 11 24 18" src="https://github.com/user-attachments/assets/ca1003c6-5acb-4c13-87e5-c22a2fb8e8a4" /></p>

#### 1. API Gateway 
- Central entry point for all client requests
- Handles authentication, rate limiting, and request routing
- Implements security measures (JWT, CORS, Helmet)
- Provides unified API documentation via Swagger

#### 2. User Service 
- Manages user authentication and authorization
- Handles user profile management
- Implements role-based access control (Admin, Sales Rep, User)
- Secure password handling with bcrypt

#### 3. Customer Service
- Manages prospective profiles
- Handles customer data CRUD operations
- Implements search and filtering capabilities
- Maintains customer interaction history

#### 4. Sales Service
- Tracks sales pipeline progression
- Manages status updates and history
- Handles notes and interaction logging
- Provides sales analytics data

#### 5. Health Check API
- Monitors system health and availability
- Provides real-time service status
- Enables proactive system maintenance
- Supports system reliability monitoring

### Technical Highlights
- **Scalability**: Each service can be independently scaled based on demand
- **Security**: Comprehensive security measures including JWT authentication, role-based access control, and request rate limiting
- **Reliability**: Health monitoring and logging across all services
- **Maintainability**: Modular design with clear separation of concerns
- **Docker Support**: Containerized deployment for consistent environments
- **MongoDB Integration**: Flexible document storage for complex data relationships
- **Testing**: Comprehensive test coverage using Mocha, Chai, and Sinon

### Development Stack
- **Backend**: Node.js with Express
- **Database**: MongoDB
- **Authentication**: JWT with bcrypt
- **Testing**: Mocha, Chai, Sinon
- **Documentation**: Swagger UI
- **Containerization**: Docker
- **Logging**: Winston
- **Security**: Helmet, CORS, Rate Limiting

The main services in this project are:
- **API Gateway**: Acts as the central entry point for the application. It handles routing, JWT authentication, rate limiting, and security enhancements using middleware. It proxies requests to the appropriate downstream microservices.
- **Health Check API**: Provides a minimal Express application to monitor the system's operational status.
- **Customer Service**: Manages all customer-related operations (CRUD actions) and integrates with a dedicated MongoDB instance.
- **Sales Service**: Handles sales data, offering full CRUD capabilities with support for data pagination and historical status tracking.
- **User Service (Authentication Service)**: Manages user authentication, authorization, and account operations using JWT-based authentication and role-based access control.

## Architecture & Design
- **Microservices Architecture**: Each service operates independently, enabling faster development, easier maintenance, and individual scalability.
- **Scalability**: The application is designed to scale horizontally, with each service able to run on multiple containers as needed.
- **Security**: Central authentication is implemented in the API Gateway, with additional security measures (Helmet, CORS, and proper logging) applied across services.
- **Maintainability**: The modular design ensures that services can be updated, tested, and deployed independently while minimizing impact on the overall system.

## Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v21)
- [MongoDB](https://www.mongodb.com/) (local or remote instance)
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)

### Setup Instructions
1. **Clone the Repository**
   ```
   git clone https://github.com/yusufkaraasln/mindset-ms-case.git
   cd mindset-ms-case
2. **Install Dependencies for Each Service**
   - **API Gateway**
     ```
     cd api-gateway
     npm install
     npm run dev
   - **Health Check API**
     ```
     cd ../health-check-api
     npm install
     npm run dev
   - **Customer Service**
     ```
     cd ../customer-service
     npm install
     npm run dev
   - **Sales Service**
     ```
     cd ../sales-service
     npm install
     npm run dev
   - **User Service**
     ```
     cd ../user-service
     npm install
     npm run dev
     
  #### Or Use Docker Compose
  
  To launch the entire system via Docker Compose, run:
  ```
  docker-compose -f docker-compose.dev.yaml up --build
  ```

     
3. **Environment Configuration**
   Each service contains a `.env.example` file. Copy each one to a new `.env` file and update the values as needed:
   `cp .env.example .env`
 
   Common environment variables include:
   - `PORT`: Service port number.
   - `MONGODB_URI`: MongoDB connection string.
   - `JWT_SECRET`: Secret key used for signing JWT tokens.
   - `LOG_LEVEL`: Logging level (e.g., `info`, `error`).

    - `ADMIN_EMAIL` and `ADMIN_PASSWORD`: Initial admin credentials that will be seeded when User Service starts. Since there is no registration endpoint in the project scope, these credentials are used to create the first admin user automatically.

 Example values:
  ```env
  ADMIN_EMAIL=admin@example.com
  ADMIN_PASSWORD=admin123
  ```

> **Note:** The admin credentials are seeded only if no admin user exists in the database when the User Service starts. This ensures there's always an admin user available for initial system access, as the registration endpoint is not included in the project scope.



## Testing
Each microservice is equipped with tests built using Mocha, Chai, and Sinon. To execute tests for a specific service, navigate to its directory and run:
```
npm test
```

## Logging & Error Handling
- **Logging**: Winston is used to capture logs both on the console and in file storage.
- **Error Handling**: Robust error handling is implemented across all services ensuring consistent responses for internal errors.
- **Security**: The application employs JWT for authentication with role-based access control, alongside additional middleware such as Helmet and CORS for enhanced security.

## API Documentation
The API Gateway includes Swagger UI integration to provide interactive, real-time API documentation. Once the API Gateway is running, access the docs at:
```
http://localhost:3000/api-docs
```

## Conclusion
This README outlines the complete technical framework, design considerations, installation steps, and deployment instructions for the Mindset Institute Backend Developer Case Project. The microservices architecture ensures that the solution is scalable, maintainable, and secure. Docker containerization simplifies local and production deployment, making the system easy to manage across different environments.

For further information, please refer to inline code comments and service-specific documentation.
 
