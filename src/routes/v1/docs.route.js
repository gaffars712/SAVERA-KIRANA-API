
const express = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const swaggerDefinition = require('../../docs/swaggerDef');

const router = express.Router();

// Generate Swagger documentation specifications
const specs = swaggerJsdoc({
  swaggerDefinition,
  apis: ['src/docs/*.yml', 'src/routes/v1/*.js'],
});

// Serve Swagger UI
router.use('/', swaggerUi.serve);
router.get(
  '/',
  swaggerUi.setup(specs, {
    explorer: true,
  })
);

module.exports = router;


/*
  This file sets up Swagger documentation for the Express application using the swagger-jsdoc and swagger-ui-express packages.

  - swagger-jsdoc is used to generate Swagger/OpenAPI documentation from JSDoc comments in the code and a swagger definition.
  - swagger-ui-express is used to serve and display the generated Swagger documentation in a user-friendly interface.

  The Swagger documentation is exposed at the endpoint specified by the router, typically '/api-docs'. 
  It includes an interactive Swagger UI that allows users to explore and test the API endpoints.

  Dependencies:
  - express: Web framework for Node.js
  - swagger-jsdoc: Package to generate Swagger/OpenAPI documentation from JSDoc comments
  - swagger-ui-express: Middleware to serve Swagger UI for Express applications
  - swaggerDefinition: External file containing the Swagger/OpenAPI definition for the API

  Usage:
  1. Create JSDoc comments in your code to describe the API endpoints.
  2. Define the Swagger/OpenAPI specification in the 'swaggerDef' file.
  3. Include the relevant YAML files and route files in the 'apis' array for swagger-jsdoc.
  4. Mount this router in your Express application to expose the Swagger documentation.
  5. Access the Swagger UI at the specified endpoint (e.g., '/api-docs') to explore and interact with the API documentation.

  Note: This setup assumes that the API routes are organized in a 'v1' folder under 'src/routes' and YAML files are in a 'docs' folder under 'src'.
*/
