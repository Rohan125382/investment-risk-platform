# Aegis – Mini Investment Intelligence & Risk Management Platform

A real-time educational investment and risk management platform built for Aegis, a 4-member CSE mini-project team.

## Overview
This project is a functional full-stack web application for portfolio tracking, asset analysis, risk monitoring, investment simulation, and educational market intelligence. It is designed for academic demonstration and clearly states that it is not financial advice.

## Demo disclaimer
This application uses demo market data by default and is intended for educational use only. It does not provide real financial recommendations or broker integration.

## Features
- User registration and login with JWT authentication
- Secure password hashing using bcrypt
- Portfolio creation and management
- Asset buy/sell simulation
- Real-time market price updates via SSE demo provider
- Portfolio analytics and P/L calculations
- Risk engine with volatility, drawdown, VaR, Sharpe ratio, beta, and diversification analysis
- Alerts and watchlist
- Investment simulator
- Admin dashboard and user dashboard
- Responsive fintech UI with charts

## Tech stack
- Frontend: React, TypeScript, Tailwind CSS, Recharts
- Backend: Node.js, Express.js, TypeScript
- Database: PostgreSQL
- Auth: JWT + bcrypt
- Real-time: SSE (demo market stream)

## Project structure
- backend/ — API server and risk engine
- frontend/ — React application
- docker-compose.yml — PostgreSQL local instance
- README.md — setup instructions
- PROJECT_REPORT.md — technical report

## Quick start

### 1) Install dependencies
npm install

### 2) Start database
docker-compose up -d

### 3) Configure environment
cp .env.example .env

### 4) Install backend/frontend dependencies
npm install --workspaces

### 5) Run backend
npm run dev:backend

### 6) Run frontend
npm run dev:frontend

## Demo credentials
- Email: admin@aegis.local
- Password: Aegis@123

## Default ports
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- PostgreSQL: localhost:5432

## Notes
- The app uses a demo market provider by default.
- Replace the market data service with a real provider by updating `backend/src/services/marketDataService.ts` and the environment variables.
