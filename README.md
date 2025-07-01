# 🏓 ft_transcendence

A full-stack SPA project that replicates the classic Pong game using a microservice architecture.

---

## 📦 Tech Stack

- **Frontend**: TypeScript + Tailwind CSS
- **Backend**: Node.js + Fastify + TypeScript + Prisma + Zod
- **Blockchain**: Avalanche + Solidity
- **Monitoring**: Prometheus + Grafana
- **Security**: JWT
- **Database**: SQLite
- **Infra**: Docker + Docker Compose + Nginx
- **Others**: Makefile, Shell scripts

---

## 🚀 How to Run

```bash
make           # build & start all services
make re        # clean and restart everything
make clean     # stop containers
make remove    # full cleanup (images, cache, volumes)
make dev       # dev mode (no cache)
make nuke      # cleanup (images, volumes, but keeps cache)
make cli       # build & start all services AND use cli makefile to run it
```

---

## ⚙️ Configuration

> [!IMPORTANT]
>
> Before running the project, make sure the following files exist:
>
> - ### ☁️ Environment variables
>
>   - `.env` file located in `./.env` (decrypted automatically via `ft_crypt.sh`).
>
> - ### 🔐 Secrets
>
>   - `monitoring/secrets/grafana_admin_password.txt`
>   - `monitoring/secrets/slack_webhook.txt`
>   - `ssg/pong-api/.env` (can be decrypted via `ft_crypt.sh`)
>
> - ### Other
>
>   - `hosts` file modified by adding following lines: `127.0.1.1    ft_transcendence20`

---

## 🌐 URLs

| Service             | URL                                                                                        |
| ------------------- | ------------------------------------------------------------------------------------------ |
| Frontend SPA        | [https://localhost:443](http://localhost:443/)                                           |
| User API            | [http://localhost:3000/api](http://localhost:3000/api/users/)                              |
| Game Service        | ws://localhost:5000/ws                                                                     |
| Swagger USERS (dev) | [http://localhost:3000/api/documentation](http://localhost:3000/api/tools/swagger)         |
| Health-check USERS   | [http://localhost:3000/api/health-check](http://localhost:3000/api/health-check) |

---

## 🧩 Dependencies

- ~~Node version xxx~~
- Docker compose version xxx
- Docker version xxx
- Make version xxx
- ~~Packages located in root and in microservices's `package.json` file.~~
- `ft_crypt.sh` script to decrypt the sensitive files.

---

## 📚 Notes

Paste here a short info/list of service's notes.
E.g:

- Uses Zod for validation.
- Uses Prisma Client for database management.
- Follows route -> controller → service → schema pattern.

---

## 🔗 Links to services' readme files

- [AI](/microservices/ssg/ai/README.md)
- [Auth](/microservices/auth_api/README.md)
- [Blockchain-broken](/microservices/blockchain/README.md)
- [Chat](/microservices/chat_api/README.md)
- [Chat DB](/microservices/chat_db/README.md)
- [CLI Client](/cli-client/README.md)
- [Front-end-broken](/microservices/frontend/README.md)
- [Monitoring](/monitoring/README.md)
- [Pong-api](./microservices/ssg/pong-api/README.md)
- [Pong DB](/microservices/pong_db/README.md)
- [TicTacToe-broken](/microservices/tictactoe_api/README.md)
- [TicTacToe DB](/microservices/tictactoe_db/README.md)
- [Users](/microservices/users/README.md)

## 🔗 Links to other README files

- [Database Seeder](/tools/db_seeder/README.md)
