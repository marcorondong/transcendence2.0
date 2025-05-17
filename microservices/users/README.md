
# 👤 USERS Service

## Description

This service (_USERS_) handles users information and "management".
It creates, update and deletes users; and also provide their information.
It's basically a **database API**.

## How to configure it

🤔💭👨‍🔧
It can be configured via docker secrets, environment variables, `package.json` and hardcoded values.
Check the file `./microservices/users/src/utils/config.ts` to check it's logic and to add values.

## Supported methods

It supports the following methods:

- GET
- POST
- PUT
- PATCH
- DELETE

## Additional functionalities

It also supports query strings:

- user fields: id, createdAt, updatedAt, email, nickname, username.
- DateFields: before | after | between.
- useOr: Change queries to use OR logical operator (this OR that OR those).
- useFuzzy: Change queries to allow partial matches (fuzzy search).
- sortBy: Order by an specific field.
- Order: Ascending or descending order.

It supports pagination (_by default_) and modifiable via query string:

- skip: To skip x amount of entries.
- take: To take x amount of entries.
- page: This is an abstraction of skip and take , but it's easier to understand and handle.
  - E.g:
    - page 1: skip = 0 && take = 10
    - page 2: skip = 10 && take = 10
    - page 3: skip = 20 && take = 10
- all: This is to override the default pagination mode.
  - Include this in the query string to retrieve ALL values at once (no pagination): `?all=true`

The `defaultPageSize = 10` but it can be configured via the query string:

1. Specify `take` as the amount of entries you want your page to contain.
2. Use the query string `?page={number}` to traverse the database.

> [!NOTE]
>
> In next version, it'll handle also:
>
> - 🖼️ Avatar (user image).
> - 👥 User friendship management (friend requests).
> - 🏃‍♂️💨 Change in how the code is "compiled" and run.
> - Makefile
> - Login to be done via email **AND** username.
> - `npm` utilities commands.
> - ♻️ Code refactoring and code clean-up

---

## 🧠 Responsibilities

- User registration and user info management.
- User's password management.
- Authentication management in combination with AUTH service:
  - _AUTH sends candidate password and USERS checks it against users database_
  - _If match: its responds with `200 OK` and sends required fields to be included in token._
  - _If not match: its responds with `401 Invalid email or password`._
- Expose a REST API.

---

## 📦 Tech Stack

- Fastify: API framework and schema validation.
- Zod: Schema declaration and validation (_validates input and output_).
- Prisma: Database management.
- SQLite: Database.
- Swagger: API documentation.
- TypeScript: Coding language.

---

## 🚀 How to Run the Service

### Running the service

1. Run it from **project's root** by running Make or docker compose commands.
2. Run it **locally** by running docker compose commands (`docker compose up -d`, `docker compose down`, etc).

### Checking or reviewing the service

1. Remember to run `npm ci` (or `npm clean-install`) to install the Node packages required by the service (_only if you don't have them_).
2. If you're **getting errors** (red squiggly underlines), then you need to **update the TypeScript definitions** made by Prisma.
   1. Run this command to update them: `npx prisma generate`
3. If you **don't have a users database** or need to update it, run these commands:
   1. Remove old database: `rm -rf prisma/database`
   2. Apply existing migrations to create dev.db: `npx prisma migrate dev`
   3. Generate Prisma client (_optional but recommended_): `npx prisma generate`
4. If you want to start fresh; run these commands (_you must be located in `./microservices/users/` folder_):
   1. Delete database: `rm -rf prisma/database`
   2. Delete migrations folder: `rm -rf prisma/migrations`
   3. Generate new migration with current model and apply schema: `npx prisma migrate dev --name init`
   4. Generate Prisma client (_optional but recommended_): `npx prisma generate`

> [!WARNING]
>
> You **SHOULD NOT** be changing `migrations/` folder unless you're **explicitly** need to.
> Note that `node_modules` and databases are ignored by git; but `migrations/` **NOT**.
> They are needed to sync and run USERS service.

🤦‍♂️

---

## ⚙️ Configuration

Currently **no configuration is needed** to run the service.

> [!NOTE]
>
> In next version, it'll have these:
>
> ### ☁️ Environment variables
>
> - `.env` file containing host and port for USERS service.
> - `.env` file containing page size for responses.
> - `.env` file containing location of database.
> - `.env` file containing location of users avatars' folder.
> - `.env` file containing `PAGINATION_ENABLED` and `DEFAULT_PAGE_SIZE`.

---

## 🔀 API Endpoints

| Method | Path                      | Description                            |
| ------ | ------------------------- | -------------------------------------- |
| GET    | `/api/health-check/`      | Health check                           |
| GET    | `/api/documentation/`     | Swagger (Good for testing all options) |
| POST   | `/api/users/`             | Create a new user                      |
| GET    | `/api/users/`             | List all users                         |
| GET    | `/api/users/?field=value` | Query string for sorting and filtering |
| POST   | `/api/users/login`        | Authenticate user                      |
| GET    | `/api/users/:id`          | Get specific user                      |
| PUT    | `/api/users/:id`          | Update user (all fields)               |
| PATCH  | `/api/users/:id`          | Update user (some fields)              |
| DELETE | `/api/users/:id`          | Delete user                            |

> [!NOTE]
>
> In next version, the routes will be `users_api` and will have:
>
> - `users`: for **users** operations (e.g: `http://host:port/users_api/users/`).
> - `friends`: for **friend request** operations (e.g: `http://host:port/users_api/friends/`).

---

## 🧩 Dependencies

None. 👍

---

## 📚 Notes

- Uses Zod and Fastify for input AND **output** validation.
- Uses Prisma for database management.
- Uses Prisma Client for generating database, apply migrations, etc.
- Follows this structure pattern: route -> controller → service → schema.
- UsesSwagger to easily show (and test) behavior.
- Accept configurations via secrets, files, env vars and hardcoded values.

---

## 🧪 Testing

1. Run the service.
2. Click [here](http://localhost:3000/api/documentation)
   1. Check that is `HTTP` and not `httpS`
3. Issue all the requests you want.

> [!IMPORTANT]
>
> - Swagger validates the input fields, so if you want to **really** test, copy the curl command and execute it.
>   - Change some values, try to send invalid data (numbers, empty strings, additional fields, missing info, etc).
> - You can also use Postman to test it.
> - Please note that automated tests aren't implemented yet.
> - In a future version, it'll include a database seeder to all the functionality can be tested.
