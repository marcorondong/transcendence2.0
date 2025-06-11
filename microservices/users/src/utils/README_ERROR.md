# Custom Error Class

This module provides a custom error class `AppError` to provide more info when an "error" is generated.

---

## Table of Contents

- [Custom Error Class](#custom-error-class)
  - [Table of Contents](#table-of-contents)
  - [✅ Features](#-features)
  - [🧩 Dependencies](#-dependencies)
  - [🔧 Setup](#-setup)
  - [🔀 Migration Steps](#-migration-steps)
  - [🔌 Configuration](#-configuration)
  - [🧩 Usage Examples](#-usage-examples)
    - [Throwing an AppError instance](#throwing-an-apperror-instance)
    - [Catching an AppError instance](#catching-an-apperror-instance)
    - [Using errorHandler wrapper](#using-errorhandler-wrapper)
    - [Registering ft\_fastifyErrorHandler](#registering-ft_fastifyerrorhandler)
  - [📦 ELK Compatibility](#-elk-compatibility)
  - [✅ Recommended usage of AppError](#-recommended-usage-of-apperror)
  - [🧪 Testing](#-testing)

---

## ✅ Features

- Structured errors to get more info when one is generated.
- Designed for ELK (Elasticsearch, Logstash, Kibana) compatibility.
- Fields:
  - `statusCode`: http status code
  - `code`: Custom string for indicating error (like 400 BadRequest)
  - `message`: Custom error message
  - `service`: Service that threw the error (_e.g: users, pong, chat, ai_)
  - `errorType`: error class name. Useful for sorting/analyzing/debugging errors.
  - `handlerName`: function within which the error was generated
  - `stack`: trace of which functions were called, in what order, from which line and file, and with what arguments.
- All fields can be overridden to change their values.

---

## 🧩 Dependencies

- Production / Development:
  - `AppError` class: None 👍
  - `errorHandler` function: `fastify`, but it can be refactored to **NOT** use it.
  - `ft_fastifyErrorHandler` function: `fastify` and custom `logger` but easily changeable (_intended to be fastify's custom error handler_)

---

## 🔧 Setup

1. Import `AppError` class where you need it:
  `import { AppError } from "../path/to/errors";`
  Include custom error codes (`error.code`) like `USER_ERRORS` (_needed to be defined inside `error.ts`_)
2. Import error handler (`errorHandler`)
  `import { errorHandler } from "../path/to/errors";`
  Wrap the functions (_Fastify request/reply functions_) with it.
  E.g: in `.microservices/users/src/modules/user/user.route.ts`: `errorHandler(getUserHandler),`
3. Import custom Fastify's error handler (`ft_fastifyErrorHandler`)
  `import { fastifyLoggerConfig } from "../path/to/logger";`
  Register the error handler.
  E.g: in `./microservices/users/src/app.ts`: `export const server = Fastify({logger: fastifyLoggerConfig(),});`
4. Ensure .env includes the desired SERVICE_NAME and SERVICE_ERROR_TYPE, or set it in `error.ts` constant section:

    ```env
    SERVICE_NAME=users # Change it to your service name
    SERVICE_ERROR_TYPE=UsersError # Change it to your service name
    ```

---

## 🔀 Migration Steps

1. Copy whole `error.ts` file.
2. Register AppError's `ft_fastifyErrorHandler` as Fastify's error handler. (Check [Setup](#-setup))
3. Configure it to suit your taste. (Check [Configuration](#-configuration))
4. Find all `error` and do the following:
   1. Import custom AppError class (`import { AppError } from "./path/to/error";`)
   2. Replace `error` generating/throw/catch logic with `AppError` logic. (E.g `./microservices/users/src/modules/user/user.service.ts`)
5. Follow [usage examples](#-usage-examples) and [recommended logic](#-recommended-usage-of-apperror) when generating/throwing/catching errors.

> [!IMPORTANT]
>
> For some of its features, fastify must be installed.
> If you want to use it without fastify, you can;
> but you'll have to ditch/modify `errorHandler` and `ft_fastifyErrorHandler`

---

## 🔌 Configuration

Inside `error.ts` you can configure:

| Flag / Constant      | Type     | Description                                           |
| -------------------- | -------- | ----------------------------------------------------- |
| `USER_ERRORS`        | `string` | Predefined errors `code` strings                      |
| `PRODUCT_ERRORS`     | `string` | Same as `USER_ERRORS` change/add as many you need     |
| `SERVICE_NAME`       | `string` | Adds service's name to service error field            |
| `SERVICE_ERROR_TYPE` | `string` | Adds errorType to error fields (defaults to AppError) |

A fully formed AppError will look like this:

- In requests (curl, Postman, Swagger):

    ```json
    {
      "statusCode": 409,
      "code": "USER_CREATE_ERROR",
      "message": "Nickname already exists"
    }
    ```

> [!NOTE]
>
> Depending on your code (_if you use response schemas, etc_);
> you have to add/remove AppError fields (check `errorResponseSchema`).

- In logs (terminal):

    ```bash
    statusCode: 409
    code: "USER_CREATE_ERROR"
    message: "Nickname already exists"
    service: "users"
    type: "UsersError"
    handler: "registerUserHandler"
    stack: "Error: Nickname already exists\n    at /home/<user>/Documents/Github/transcendence2.0/microservices/users/src/modules/user/user.service.ts:71:12\n    at Generator.throw (<anonymous>)\n    at rejected (/home/<user>/Documents/Github/transcendence2.0/microservices/users/src/modules/user/user.service.ts:6:65)"
    ```

> [!NOTE]
>
> If you want to add/remove AppError fields;
> you have to adjust `ft_fastifyErrorHandler` logging part.

---

## 🧩 Usage Examples

### Throwing an AppError instance

- Common case:

    ```ts
    try {
      // [...]
    } catch (err) {
      throw new AppError({
        statusCode: 400, // http status code
        code: USER_ERRORS.USER_CREATE, // error code string
        message: (err as Error).message,
      });
    }
    ```

- Custom (overriding) case:

    ```ts
    try {
      // [...]
    } catch (err) {
      throw new AppError({
        statusCode: 400, // http status code.
        code: USER_ERRORS.USER_CREATE, // error code string.
        message: (err as Error).message, // Or override it with a custom message.
        type: "my overridden errorType", // if you want to override error type (e.g: createUserError type)
        handler: "my overridden handler function", // if you want to specify the function that created the error.
        stack: error.stack, // if you want to override the stack.
      });
    }
    ```

### Catching an AppError instance

```ts
try {
  // [...]
} catch (err) {
  if (err instanceof AppError) {
    // Known/Expected errors bubble up to controller as AppError (custom error)
    throw err;
  }
  // Unknown errors bubble up to global error handler.
  throw err;
}
```

### Using errorHandler wrapper

In Fastify request/reply functions (_usually in routes_), wrap them like this:

```ts
errorHandler(registerUserHandler),
```

### Registering ft_fastifyErrorHandler

_usually in `app.ts`, `server.ts`, `index.ts` or `main.ts` (inside main function)_, register it like this:

```ts
server.setErrorHandler(ft_fastifyErrorHandler);
```

---

## 📦 ELK Compatibility

This custom error class (`AppError`) is ELK-ready out of the box:

- Custom error class to differentiate unknown errors from errors we expect (_e.g: invalid credentials, duplicated fields, etc_).
- Structured fields for easier searching and debugging.

---

## ✅ Recommended usage of AppError

Check USERS service code.

---

## 🧪 Testing

Use USERS Service as example:

1. Run USERS Service
2. Make some invalid requests
3. Check the terminal logs and replies in curl/PostMan/Swagger for AppError messages.

Later, adapt its logic to your service for the use of AppError.
