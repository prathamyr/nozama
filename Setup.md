## Setup Instructions:

FYI, This repo contains two apps:
- **Backend API**: `apps/api`
- **Frontend Web (Angular + Tailwind)**: `apps/web`

Clone the repo, install dependencies for **both** apps, set environment variables for the API, then run API + Web in parallel.

___________

Pls install: 
- node.js
- npm
- angular cli
    - install angular: 
    ```
    npm install -g @angular/cli
    ```


---

## Frontend Setup (Angular + Tailwind)

### 1. Install Dependencies
Navigate into the frontend folder:
```
cd apps/web
npm install
```

### 2. Verify Angular
```
ng version
```

### 3. Run the Development Server
```
ng serve
```
- The app should be available at **http://localhost:4200**
- Stop the server anytime with `Ctrl + C`

---

### 4. Angular Material
Install and configure Angular Material: ``` ng add @angular/material ```

Choose:
- **Theme:** any (Azure/Blue recommended)  
- **Typography styles:** Yes  
- **Animations:** Include and enable  

---

### 5. Tailwind

If Tailwind is not already installed (it should be), run:
```
npm install tailwindcss @tailwindcss/postcss postcss
```

Ensure you have a `.postcssrc.json` in the project root (`apps/web/.postcssrc.json`):
```json
{
  "plugins": {
    "@tailwindcss/postcss": {}
  }
}
```

In `src/styles.scss`, make sure this line exists: ``` @use "tailwindcss"; ```

Then restart the Angular dev server: ``` ng serve ```

---

### To start the backend setup: 

Pls navigate to **[API Setup Guide](../nozama/apps/api/api-setup.md)**  
