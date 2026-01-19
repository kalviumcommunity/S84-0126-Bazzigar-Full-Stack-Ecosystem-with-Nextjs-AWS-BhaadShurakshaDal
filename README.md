# 🌊 BhaadShurakshaDal  
### 🚨 AI-Powered Flood Early Warning & Community Alert System  
**By Team Baazigaar**

BhaadShurakshaDal is a full-stack web platform that provides real-time flood risk monitoring and early alerts to help communities prepare before disasters strike.  
It uses free weather APIs, intelligent risk logic, and cloud notifications.

---

## 🎯 Problem Statement

Floods cause massive damage every year due to:
- Late warnings  
- Poor local awareness  
- Lack of real-time accessible data  

Most people don’t receive early alerts or understand risk levels clearly.

---

## 💡 Solution

The platform provides:

✅ Live weather monitoring  
✅ Flood risk prediction  
✅ Location-based alerts  
✅ Map visualization  
✅ Emergency safety guidance  
✅ Admin alert broadcasting  

---

## 🚀 Features

### 👤 User Features
- 📍 Select district / pincode
- 🌧️ View real-time rainfall & forecast
- 🚦 Risk level indicator
- 🗺️ Map visualization
- 📢 Alerts via SMS / Email / In-app
- 🧭 Safety tips and emergency contacts

### 🛠️ Admin Features
- Add flood-prone zones
- Broadcast alerts
- View registered users
- Monitor alerts

## Understanding Cloud Deployments: Docker → CI/CD → AWS/Azure

### Overview
This assignment explores how we deployed **BhaadShurakshaDal** from local development to the cloud using **Docker**, **CI/CD**, and **AWS/Azure**. The goal was to ensure consistent environments, automate deployment, and handle secrets securely.


### Dockerization
We containerized the app for reliable environments.

**Dockerfile** highlights:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
````

**Docker Compose** for local dev (Next.js + Postgres + Redis):

```yaml
version: '3.8'
services:
  app:
    build: .
    ports: ["3000:3000"]
    depends_on: [db, redis]
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: bhaad
  redis:
    image: redis:7
```

---

### CI/CD Pipeline

Automated with **GitHub Actions**:

* Build Docker image
* Run unit tests & linting
* Push image to cloud registry
* Deploy to AWS ECS / Azure App Service

Snippet:

```yaml
name: CI/CD Pipeline
on: [push]
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with: node-version: '18'
      - run: npm install
      - run: npm test
      - run: docker build -t bhaadshurakshadal .
      - run: ./deploy.sh
```

---

### Cloud Deployment

**AWS:** ECS + RDS + SNS
**Azure:** App Service + PostgreSQL + Communication Services

Secrets and environment variables were securely managed via GitHub Secrets and environment configs.

---

### Reflection

**Challenges:** Docker networking, CI/CD build errors, secure secrets handling
**Successes:** Consistent environments, automated deployments, simplified infrastructure
**Future:** Add monitoring/logging and rollback strategies, explore IaC (Terraform/Bicep)


