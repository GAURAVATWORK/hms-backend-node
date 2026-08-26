# HMS Backend Node

A Hospital Management System (HMS) backend being built from scratch
using **Node.js** and **PostgreSQL**, with a focus on
production-oriented architecture, clean separation of responsibilities,
security, testing, and scalable backend development practices.

------------------------------------------------------------------------

## About This Project

Hi, I'm **Gaurav Singh**, a **Flutter Developer** with experience in
building production mobile applications for healthcare and telemedicine
platforms.

To strengthen my full-stack development skills, I started learning
backend development by building backend systems from scratch using
**Node.js** and **PostgreSQL**.

This repository is part of my backend engineering journey, where I am
learning how real-world backend systems are designed, structured,
secured, tested, and deployed.

The goal is not just to learn Node.js syntax, but to understand the
complete backend development process and the reasoning behind
production-level architectural decisions.

------------------------------------------------------------------------

## What I Am Building

This project will gradually evolve into a complete Hospital Management
System backend with:

-   Modular project architecture
-   PostgreSQL integration
-   Automatic database initialization
-   RESTful API design
-   Authentication using JWT and Refresh Tokens
-   Authorization and Role-Based Access Control (RBAC)
-   Pagination and Search
-   Input validation
-   Centralized error handling
-   Logging
-   Unit and integration testing
-   Docker support
-   CI/CD pipeline
-   Production deployment

------------------------------------------------------------------------

## Architecture

The backend will follow a layered architecture where each layer has a
clear responsibility.

``` text
Client
   |
   v
HTTP Request
   |
   v
Route
   |
   v
Controller
   |
   v
Service
   |
   v
Repository
   |
   v
PostgreSQL
```

### Responsibility of Each Layer

  Layer        Responsibility
  ------------ ------------------------------------------------------------
  Route        Defines API endpoints and connects requests to controllers
  Controller   Handles HTTP requests and HTTP responses
  Service      Contains application and business logic
  Repository   Handles database operations
  PostgreSQL   Stores and manages application data

This separation helps keep the backend maintainable, testable, and
scalable.

------------------------------------------------------------------------

## Project Structure

``` text
hms-backend-node/
│
├── src/
│   │
│   ├── config/
│   │   ├── database.js
│   │   ├── env.js
│   │   └── server.js
│   │
│   ├── database/
│   │   └── init.js
│   │
│   ├── middleware/
│   │
│   ├── modules/
│   │   └── patients/
│   │       ├── patient.controller.js
│   │       ├── patient.routes.js
│   │       ├── patient.service.js
│   │       └── patient.validation.js
│   │
│   ├── utils/
│   │
│   ├── app.js
│   └── index.js
│
├── tests/
│
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

------------------------------------------------------------------------

## Technology Stack

### Backend

-   Node.js
-   JavaScript
-   ES Modules

### Database

-   PostgreSQL
-   PostgreSQL Node.js driver (`pg`)

### Configuration

-   dotenv

### Development Tools

-   Nodemon
-   Git
-   GitHub

### Planned Technologies

-   Express.js
-   JWT
-   bcrypt
-   Jest
-   Supertest
-   Docker
-   Docker Compose
-   GitHub Actions

> Express.js will be explored separately in the future. The current
> project focuses on understanding backend development with Node.js
> fundamentals first.

------------------------------------------------------------------------

## Current Progress

### Project Setup

-   [x] Node.js project initialized
-   [x] ES Modules configured
-   [x] `package.json` configured
-   [x] Development script configured
-   [x] Nodemon configured
-   [x] Basic project structure created
-   [x] Environment configuration created
-   [x] Basic HTTP server created
-   [x] Git repository configured
-   [x] GitHub repository created
-   [x] `.gitignore` configured
-   [x] `.env` excluded from Git

### Environment Configuration

-   [x] dotenv configured
-   [x] Required environment variables defined
-   [x] Environment variable validation implemented
-   [x] Server configuration separated into `server.js`
-   [ ] Production environment configuration

### PostgreSQL

-   [ ] PostgreSQL connection pool
-   [ ] Database connection verification
-   [ ] Database initialization
-   [ ] Database schema
-   [ ] Database tables
-   [ ] Database migrations

### Patient Module

-   [ ] Patient database table
-   [ ] Create patient API
-   [ ] Get all patients API
-   [ ] Get patient by ID API
-   [ ] Update patient API
-   [ ] Delete patient API
-   [ ] Input validation
-   [ ] Patient repository

### Authentication & Authorization

-   [ ] User registration
-   [ ] Login
-   [ ] Password hashing
-   [ ] JWT authentication
-   [ ] Refresh tokens
-   [ ] Role-Based Access Control
-   [ ] Permission management

### API Features

-   [ ] RESTful API structure
-   [ ] Pagination
-   [ ] Search
-   [ ] Filtering
-   [ ] Sorting
-   [ ] Standard API responses
-   [ ] Centralized error handling
-   [ ] Logging

### Testing

-   [ ] Unit tests
-   [ ] Integration tests
-   [ ] API tests
-   [ ] Database tests
-   [ ] Test coverage

### DevOps

-   [ ] Docker
-   [ ] Docker Compose
-   [ ] CI/CD
-   [ ] Production configuration
-   [ ] Deployment

------------------------------------------------------------------------

## Getting Started

### Prerequisites

Make sure the following are installed on your system:

-   Node.js
-   npm
-   PostgreSQL
-   Git

### Clone the Repository

``` bash
git clone https://github.com/GAURAVATWORK/hms-backend-node.git
```

### Navigate to the Project

``` bash
cd hms-backend-node
```

### Install Dependencies

``` bash
npm install
```

### Configure Environment Variables

Create a `.env` file in the project root.

Example:

``` env
NODE_ENV=development

PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=hms
```

> Never commit the `.env` file to GitHub because it may contain
> sensitive configuration such as database credentials.

### Start Development Server

``` bash
npm run dev
```

The development server will run on:

``` text
http://localhost:3000
```

------------------------------------------------------------------------

## Environment Configuration

Environment variables are loaded using `dotenv`.

The application validates required environment variables before
starting.

Required variables include:

``` text
PORT
DB_HOST
DB_PORT
DB_USER
DB_PASSWORD
DB_NAME
```

This prevents the application from starting when required configuration
is missing.

------------------------------------------------------------------------

## Development Approach

This project is being developed incrementally.

The focus is not only on making the application work, but also on
understanding **why each architectural and technical decision is made**.

The development process focuses on:

-   Clean separation of responsibilities
-   Maintainable code
-   Secure configuration
-   Database best practices
-   Input validation
-   Error handling
-   Testing
-   Scalability
-   Production-oriented development practices

For each implementation, the goal is to understand the code well enough
to explain the architectural and technical decisions in a backend
interview.

------------------------------------------------------------------------

## Roadmap

The project will be developed in multiple stages.

``` text
Project Setup
      |
      v
Environment Configuration
      |
      v
Node.js HTTP Server
      |
      v
PostgreSQL Connection
      |
      v
Database Initialization
      |
      v
Patient CRUD
      |
      v
Validation & Error Handling
      |
      v
Repository Layer
      |
      v
Authentication
      |
      v
Authorization / RBAC
      |
      v
Additional HMS Modules
      |
      v
Testing
      |
      v
Docker
      |
      v
CI/CD
      |
      v
Production Deployment
```

Future HMS modules may include:

-   Patients
-   Doctors
-   Appointments
-   Departments
-   Medical Records
-   Prescriptions
-   Billing
-   Staff
-   Users
-   Roles and Permissions

------------------------------------------------------------------------

## Why This Repository?

I believe the best way to learn backend engineering is by building a
real-world application instead of only following tutorials.

As a Flutter Developer, I already have experience building client-side
applications.

Through this project, I am expanding my skills into backend engineering
and learning how a complete system works from:

``` text
Mobile / Web Client
        |
        v
REST API
        |
        v
Business Logic
        |
        v
Database
        |
        v
Production Infrastructure
```

This repository documents my transition from **Flutter development to
backend engineering** and my practical learning journey with Node.js and
PostgreSQL.

------------------------------------------------------------------------

## Developer

**Gaurav Singh**

Flutter Developer \| Learning Backend Engineering with Node.js

### Skills

-   Flutter
-   Dart
-   Node.js
-   JavaScript
-   PostgreSQL
-   REST API Development
-   Clean Architecture
-   Git & GitHub

### Connect With Me

**GitHub:**\
https://github.com/GAURAVATWORK

**LinkedIn:**\
https://www.linkedin.com/in/gaurav-singh-391033275

**Email:**\
gauravatwork23@gmail.com

------------------------------------------------------------------------

## License

This project is currently intended for learning and portfolio purposes.
