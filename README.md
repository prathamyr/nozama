# Nozama – Project README

This provides instructions for accessing, running, and testing the **EECS 4413** project.


## Source Code & Repository Access

**GitHub Repository (Public):**
[https://github.com/prathamyr/nozama](https://github.com/prathamyr/nozama)

### How to download the source code

Clone using Git:

```bash
git clone https://github.com/prathamyr/nozama.git
cd nozama
```


## Project Overview

This repository contains **two applications**:

* **Backend API**: `apps/api`

  * Node.js + Express
  * MongoDB (Atlas)

* **Frontend Web App**: `apps/web`

  * Angular
  * Tailwind CSS


## Running the Project (Cloud Deployment)

### URLs

* **Backend API (Render Web Service):**
  [https://nozama.onrender.com/api](https://nozama.onrender.com/api)

* **Health Check:**
  [https://nozama.onrender.com/api/health](https://nozama.onrender.com/api/health)

* **Frontend Web App (Render Static Site):**
  [https://nozama-web.onrender.com/home](https://nozama-web.onrender.com/home)


The backend and frontend are deployed on Render (Free Tier). 

Note: Free-tier services may sleep after inactivity and take a few seconds to wake up.

---

## Running the Project Locally (Development Setup)

### Required Software

Install the following:

* **Node.js** (v18 or higher)
* **npm** (comes with Node.js)
* **Angular CLI**
* **MongoDB Atlas account** (free tier)

---

### Backend (API) – Local Setup

#### Navigate to backend

```bash
cd apps/api
```

#### Install dependencies

```bash
npm install
```

#### Environment variables

Create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env` and set:

* `MONGO_URI` – MongoDB Atlas connection string
* `JWT_SECRET` – any random string
* `CORS_ORIGIN` – e.g. `http://localhost:4200`

#### Run backend

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

Backend runs at: http://localhost:4000/api

Health check: http://localhost:4000/api/health

---

### Frontend (Angular) – Local Setup

#### Navigate to frontend

```bash
cd apps/web
```

#### Install dependencies

```bash
npm install
```

#### Run development server

```bash
ng serve
```

Frontend runs at: http://localhost:4200

The frontend is preconfigured to call:

* **Local API:** `http://localhost:4000/api`
* **Production API:** `https://nozama.onrender.com/api`

---


**End of README**
