# 📸 Social Media Microservices Architecture

This project is a microservices-based architecture for a **Social Media Application** that allows users to create posts, upload media, and search posts. It uses **RabbitMQ** for event-driven communication between services to ensure scalability and decoupling.

---

## 🧱 Microservices

### 🛡 API Gateway
- Serves as a unified entry point for client requests.
- Forwards requests to internal services.
- Handles routing and basic validation.

### 📝 Post Service
- Handles creation and update of posts.
- Publishes `post.created` events to RabbitMQ.
- Listens for `media.uploaded` events to update posts with media metadata.

### 🔎 Search Service
- Consumes `post.created` events to index new posts.
- Handles client search queries.

### 🎞 Media Service
- Handles media uploads.
- Subscribes to `post.created` events to prepare processing.
- Publishes `media.uploaded` events after processing is complete.

### 🐇 RabbitMQ
- Manages asynchronous communication between services using events.
- Ensures services remain decoupled and resilient.

---

## 🔄 Event Flow

| Event             | Published By    | Consumed By                  |
|------------------|-----------------|------------------------------|
| `post.created`    | Post Service     | Search Service, Media Service |
| `media.uploaded`  | Media Service    | Post Service                  |

---
## 📊 Sequence Diagram
<img width="926" height="904" alt="image" src="https://github.com/user-attachments/assets/522c71d3-5611-41c4-921a-081fa992649b" />


## ⚙️ Tech Stack

- **Node.js / Express.js** – Application logic and APIs
- **RabbitMQ** – Message broker for asynchronous communication
- **MongoDB / Elasticsearch** – Data storage and indexing
- **Docker / Docker Compose** – Container orchestration
- **REST API** – Communication between client and services

---

## 🚀 Getting Started

### 📦 Prerequisites

- Docker & Docker Compose
- Node.js
- RabbitMQ instance
- MongoDB 

### 🛠 Run with Docker Compose

```bash
docker-compose up --build
```
### 🗂 Project Structure
```bash
root/
├── api-gateway/
├── post-service/
├── search-service/
├── media-service/
├── rabbitmq/
├── docker-compose.yml
└── README.md
```

