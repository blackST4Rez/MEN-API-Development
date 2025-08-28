# 📝 Tasks CRUD API

## 📖 Description
A simple Tasks CRUD API built with **Express**, **TypeScript**, and **MongoDB**. This API allows users to manage tasks efficiently with features like authentication and comprehensive API documentation.

## 🚀 Features
- **CRUD Operations**: Create, Read, Update, and Delete tasks.
- **Authentication**: Secure routes for user authentication.
- **API Documentation**: Interactive API documentation using Swagger.
- **Health Check**: Endpoint to check the health of the service.

## 📦 Installation
To get started with this project, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/blackST4Rez/MEN-API-Development.git
   cd tasks-crud-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add your MongoDB connection string and any other necessary configurations.

## 🛠️ Usage
To run the application, use the following command:
```bash
npm start
```
The server will start on `http://localhost:3000`.

## 📚 API Documentation
Access the API documentation at:
[http://localhost:3000/api-docs](http://localhost:3000/api-docs)

## ✅ Health Check Endpoint
You can check the health of the service by visiting:
```
GET /health
```
This will return a JSON response indicating the service status.

## 📝 License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
