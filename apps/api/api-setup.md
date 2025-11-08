# API setup guide:

_______

## Requirements

Before starting, make sure you have:
- Node.js version 18 or higher
- npm version 8 or higher (comes with Node)
- Mongodb atlas account and access to the cluster

___________

## 1. Install dependencies

Run these commands inside `apps/api/`:

```
cd apps/api
npm install

```

if package.json is not there:

```
npm init -y
npm i express mongoose dotenv cors jsonwebtoken bcrypt
npm i -D nodemon
npm install mongodb
```

_______________


## Environment:

create your own .env file:
cp .env.example .env

Important:
    - Replace <username>, <password>, and <cluster-host> with your MongoDB Atlas connection info.
    - In MongoDB Atlas, whitelist your IP (I have whitelisted all for now - 0.0.0.0/0 for development).
    - JWT_SECRET can be any random string.

________________

To run the server in development:

npm run dev

________________


To start in prod:

npm start

_______________

By default api will run at ```http://localhost:4000```;

_______________

Check if server is running by typing postman or chrome :

http://localhost:3000/api/health

_______________

For frontend integration, confirm that CORS_ORIGIN in .env matches your web app URL (e.g., http://localhost:4200 or wherever its served).

___________

If it is missing any steps or npm commands, pls add it to either of the setup files. 

thank you.