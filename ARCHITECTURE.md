# Frontend Architecture

This document explains how the frontend demo connects to the backend Recommendation Engine API.

---

## Overview

The frontend is a React/Vite demo application built to visually test the recommendation engine.

It allows a user to:

- Select a demo user
- View available items
- Create interactions such as view, like, comment, and share
- Receive live recommendation updates through WebSocket
- View analytics and debug information

---

## Architecture Diagram

```mermaid
flowchart TD
    A[User] --> B[React Frontend]

    B -->|HTTP Requests| C[Backend API]

    C --> D[Recommendation Engine]

    D --> E[(MongoDB Database)]

    C --> F[Socket IO Server]

    F -->|Real Time Updates| B
```

---

## Data Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend as React Frontend
    participant API as Backend API
    participant Engine as Recommendation Engine
    participant DB as MongoDB
    participant Socket as Socket IO

    User->>Frontend: Clicks view like comment or share
    Frontend->>API: POST interaction
    API->>DB: Save interaction
    API->>Engine: Recalculate recommendations
    Engine->>API: Return updated recommendations
    API->>Socket: Emit recommendations updated
    Socket->>Frontend: Push live recommendations
    Frontend->>User: Display updated results
```

---

## Frontend Responsibilities

The frontend handles:

- User selection
- Displaying available items
- Sending interaction events to the backend
- Listening for real-time recommendation updates
- Displaying recommendation scores
- Showing analytics and debug data

---

## Backend Responsibilities

The backend handles:

- Storing users, items, and interactions
- Running the recommendation engine
- Calculating analytics
- Sending real-time updates through Socket.io

---

## Real-Time Update Flow

When a user interacts with an item:

```text
User → Frontend → Backend API → Recommendation Engine → Database
                         ↓
                    WebSocket → Frontend
```

---

## Summary

The frontend is intentionally lightweight. Its main purpose is to demonstrate the backend recommendation engine in a visual, interactive way.