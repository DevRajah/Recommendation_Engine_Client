# Recommendation Engine Demo Frontend

A React/Vite frontend built to demonstrate the Real-Time Recommendation Engine API.

This demo allows users to interact with items and see recommendation updates in real time.

---

## What This Demo Does

The frontend connects to the backend recommendation engine and allows users to:

- Select a demo user
- View available items
- Create interactions such as view, like, comment, and share
- Receive live recommendation updates through Socket.io
- View recommendation scores and ranking signals
- Inspect user analytics
- View debug information such as category scores, similar users, and matrix factorization data

---

## Live Demo

```bash
https://recommendation-engine-client.vercel.app

Backend API

The frontend is powered by the backend API:

https://recommendation-engine-jfdd.onrender.com

Swagger API documentation:

https://recommendation-engine-jfdd.onrender.com/api-docs
```

## Tech Stack
React
Vite
Tailwind CSS
Axios
Socket.io Client


## How To Run Locally
1. Clone the repo
git clone <https://github.com/DevRajah/Recommendation_Engine_Client.git>
cd recommendation-engine-client
2. Install dependencies
npm install
3. Create environment file

 Create a .env file in the project root:

VITE_API_URL=https://recommendation-engine-jfdd.onrender.com

For local backend testing:

VITE_API_URL=http://localhost:5800
4. Start development server
npm run dev

The app should run on:

http://localhost:5173


## Main Features
Real-Time Recommendations

When a user interacts with an item, the backend recalculates recommendations and pushes updates instantly through Socket.io.

Recommendation Explainability

The demo shows signals used in ranking, including:

-Category affinity
-Popularity score
-Freshness bonus
-Collaborative filtering score
-Matrix factorization score

## Analytics Panel

The frontend displays:

-Total user interactions
-Action breakdown
-Category engagement breakdown


## Related Links
Backend API: https://your-render-backend-url.onrender.com
Swagger Docs: https://your-render-backend-url.onrender.com/api-docs
Architecture Docs: https://github.com/your-username/your-backend-repo/blob/main/ARCHITECTURE.md