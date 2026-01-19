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

### Dockerization
We containerized our application using Docker to ensure consistent behavior across development and production environments. A Dockerfile was used to define the runtime environment, dependencies, and startup commands for the application.

### CI/CD Pipeline
We used GitHub Actions to automate the build and deployment process. On every push to the main branch, the pipeline builds the Docker image, runs basic checks, and prepares the application for deployment. This automation reduces manual errors and ensures faster and reliable releases.

### Cloud Deployment
The containerized application is deployed to a cloud platform such as AWS or Azure using managed services like EC2 or App Service. Environment variables are used to manage sensitive configuration such as database credentials and API keys.

### Configuration & Secrets Management
Secrets and environment variables are stored securely using GitHub Secrets and cloud environment settings. This ensures that sensitive information is not hardcoded in the codebase.

### Reflection
The most challenging part was understanding how Docker, CI/CD, and cloud services connect together. Debugging build errors in Docker helped us learn how container environments work. In future deployments, we would improve monitoring and logging for better observability.
