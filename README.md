# Swinburne Technology Application Group Project Backend

This is a simple Express application for Techaway

## Prerequisites

- Node.js: v20.11.0
- npm: v10
- MongoDB: v7.0

## Getting Started

1. Clone the repository:
```bash
git clone git+https://github.com/longphung/swinburne-tech-app-backend.git
```
3. Install the dependencies:
```bash
npm install
```
4. Copy the `.env.example` file and create a new `.env.local` file:
```bash
# Local development
cp .env.example .env.local
```
5. Update the `.env.local` file with your configurations:
   - `PORT`: The port number where the application will run. Set 8000 for default
   - `LOG_LEVEL`: The level of logs you want to see (e.g., debug, info, warn, error). Set to 'info' for default, or 'debug' for more logs
   - `DB_URI`: The URI of the MongoDB database
   - `DB_NAME`: The name of the MongoDB database
   - `DB_USER`: The username of the MongoDB database
   - `DB_PASS`: The password of the MongoDB database
   - `SMTP_HOST`: The SMTP host for sending emails
   - `SMTP_PORT`: The SMTP port for sending emails
   - `SMTP_SECURE`: The SMTP secure connection for sending emails, 1 for true, 0 for false
   - `SMTP_USER`: The SMTP username for sending emails
   - `SMTP_PASS`: The SMTP password for sending emails
   - `SECRET_KEY`: The secret key for generating JWT tokens
   - `APP_URL`: The URL of the backend application
   - `FRONTEND_URL`: The URL of the frontend application

6. Start the application:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## Project Structure

- `index.js`: The entry point of the application.
- `src/`: Contains the source code of the application.
  - `models/`: Contains the data models for the application.
  - `routes/`: Contains the routes for the application.
- `package.json`: Contains the list of project dependencies and scripts.
- `.env.example`: An example configuration file. You should create your own `.env.local` file based on this example.
- `.env.local`: The configuration file for local development. This file is not tracked by Git.
- `.gitignore`: Specifies intentionally untracked files that Git should ignore.

## FAQs

### Checking out emails in local development

The first time you start the app in local development without an SMTP server, the app will create an account for you to Ethereal Email. You can use the credentials printed in the console to access the Ethereal Email account and view the emails sent by the application. Example Logs:
```bash
{"level":"info","message":"Creating test account for development environment nodemailer","timestamp":"2024-04-15T22:30:49.731Z"}
{"level":"info","message":"Test account created user:","timestamp":"2024-04-15T22:30:51.535Z"}
{"level":"info","message":👉"<ethereal-email>@etheral.email","timestamp":"2024-04-15T22:30:51.536Z"}
{"level":"info","message":"Test account created pass:","timestamp":"2024-04-15T22:30:51.536Z"}
{"level":"info","message":👉"<The given password>","timestamp":"2024-04-15T22:30:51.536Z"}
```

