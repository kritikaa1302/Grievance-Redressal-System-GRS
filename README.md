# Grievance Redressal System (GRS)

A full-stack web application developed during my summer internship at **Softpro India Computer Technologies Pvt. Ltd.** The project was assigned to digitize the grievance-handling process for **Lalit Narayan Mithila University (L.N.M.U.), Darbhanga, Bihar**.

The application provides a centralized platform for submitting grievances, tracking their status, and managing complaint records.

## Features

### Student
- Register and log in to the portal.
- Submit grievances through an online form.
- View complaint history and complaint details.
- Track the status of submitted grievances.
- Manage profile information.

### Administrator
- Log in to the administrative dashboard.
- View and manage submitted grievances.
- Update complaint status.
- Manage user records.
- Manage colleges, complaint types, and academic sessions.

The project also contains a staff dashboard and related backend routes.

## Technology Stack

| Area | Technologies |
|---|---|
| Frontend | React.js, JavaScript, HTML5, CSS3, Bootstrap |
| API communication | Axios, REST APIs |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication and security | JWT, bcrypt, Helmet, CORS, Express Rate Limit, dotenv |
| Development and testing | VS Code, npm, Nodemon, MongoDB Compass, Postman |
| Version control | Git, GitHub |

## Application Architecture

The application follows a client-server architecture based on the MERN stack.

1. The React frontend provides the user interface for students and administrators.
2. Axios sends HTTP requests from the frontend to the Express REST API.
3. The Node.js and Express backend handles routes, authentication, and application logic.
4. Mongoose is used to interact with MongoDB, where application records are stored.

JWT is used for authentication, and bcrypt is used to hash passwords. Helmet, CORS, and Express Rate Limit are included as additional security measures.

## Project Structure

```text
grs-mern-main/
├── client/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       │   ├── admin/
│       │   ├── staff/
│       │   └── student/
│       ├── services/
│       └── utils/
├── server/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── public/
│   │   └── uploads/
│   ├── routes/
│   ├── utils/
│   └── index.js
└── .gitignore
```

## Getting Started

### Prerequisites

- Node.js and npm
- MongoDB running locally, or a MongoDB Atlas connection
- Git

### 1. Clone the repository

```bash
git clone https://github.com/kritikaa1302/Grievance-Redresal-System-GRS.git
cd Grievance-Redresal-System-GRS
```

### 2. Install dependencies

Install the frontend dependencies:

```bash
cd client
npm install
```

Install the backend dependencies:

```bash
cd ../server
npm install
```

### 3. Configure environment variables

Create a `.env` file inside the `server` directory. Add the required values:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/grs
JWT_SECRET=replace_with_a_long_random_secret
```

Use your own database connection string and a strong, randomly generated JWT secret. The exact database name can be changed as needed.

Do not commit `.env` files or real credentials to GitHub. The repository's `.gitignore` is configured to exclude environment files.

### 4. Run the backend

From the `server` directory, run:

```bash
npm run dev
```

The backend is configured to run on port `5000` by default, unless changed in the environment configuration.

### 5. Run the frontend

Open another terminal:

```bash
cd client
npm run dev
```

Open the local URL shown by Vite in the terminal. Keep both the frontend and backend running while using the application.

## API Testing

Backend endpoints can be tested using Postman. GET, POST, PUT, and DELETE requests were used during API testing.

## Deployment

GitHub Pages can host static frontend files, but it does not run the Node.js/Express backend or host the MongoDB database. Since this application depends on backend APIs and a database, GitHub Pages alone is not sufficient for a complete deployment.

For a live version, the frontend can be hosted on a static hosting service and the backend on a Node.js-compatible hosting service. The database must be hosted separately, and the frontend API URL and backend CORS configuration must be updated for the deployed environments.

No live deployment link is provided here.

## Internship

**Organization:** Softpro India Computer Technologies Pvt. Ltd.  
**Internship:** Summer Internship – MERN Stack Development  
**Project:** Grievance Redressal System (GRS)  
**Institution for which the system was developed:** Lalit Narayan Mithila University (L.N.M.U.), Darbhanga, Bihar

The project provided practical experience in full-stack development, REST API integration, database management, authentication, debugging, and API testing.

## Future Enhancements

Possible future improvements include:
- Email and SMS notifications.
- Mobile application support.
- Multilingual interface.
- AI-assisted complaint categorization.
- Advanced analytical dashboards.
- Cloud deployment and integration with university systems.

These are potential enhancements and are not presented as currently implemented features.

## Author

**Priyanshi Ag**  
B.Tech, Computer Science and Engineering  
SRMS College of Engineering and Technology  
GitHub: [kritikaa1302](https://github.com/kritikaa1302)
