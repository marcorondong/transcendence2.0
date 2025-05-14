
---
## 👤 < microservice_name > Service

_Paste here a short description of the service's purpose_
> [!NOTE]
> E.g:
> Handles user registration, login, friendship management, and profile data.

---
### 🧠 Responsibilities

_Paste here a short list of what things the service does._
> [!NOTE]
> E.g:
> - Register / login users
> - JWT token generation/validation
> - Manage user profiles and friends
> - Expose a REST API

---
### 📦 Tech Stack

_Paste here a short list of which stack/technologies the service uses._
> [!NOTE]
> E.g:
> - Fastify
> - Prisma
> - Zod
> - SQLite

---
### 🚀 How to Run the Service

_Paste here a short list of the commands to run the service._
> [!NOTE]
> E.g:
> - To run: `docker compose up -d <service>` or `make <target>`
> - To rebuild: `docker compose build user`
>	- Note: Must be run from the root project folder.

---
### ⚙️ Configuration

_Paste here a short info/list of the variables/secrets and other configuration that the service needs._
> [!NOTE]
> E.g:
> Before running the project, make sure the following files exist:
>
> - #### ♻️ Environment variables
>	- `.env` file located in `./.env` (decrypted automatically via `ft_crypt.sh`).
>
> - #### 🔐 Secrets
>	- `slack_webhook.txt` secret file located in `./secrets/`
>
> - #### Other
>	- `hosts` file modified by adding following lines: `127.0.1.1	ft_transcendence20`

---
### 🔀 API Endpoints

_Paste here a short info/list of the available endpoints the service provides._
> [!NOTE]
> E.g:
>
> | Method | Path              | Description       |
> | ------ | ----------------- | ----------------- |
> | GET    | `/api/users`      | List all users    |
> | POST   | `/api/users`      | Create a new user |
> | POST   | `/api/auth`       | Authenticate user |
> | PATCH  | `/api/users/:id`  | Update user       |
> | POST   | `/api/game/start` | Starts a new game |

---
### 🧩 Dependencies

_Paste here a short info/list of service's dependencies._
> [!NOTE]
> E.g:
> - Requires **AUTH** service to validate tokens.
> - Talks to **PONG** service via REST or RabbitMQ

---
### 📚 Notes

_Paste here a short info/list of service's notes._
> [!NOTE]
> E.g:
> - Uses Zod for validation
> - Uses Prisma Client
> - Follows route -> controller → service → schema pattern

---
### 🧪 Testing

_Paste here a short info/list of how to run test for the service._
> [!NOTE]
> E.g:
> Tests not yet implemented.
