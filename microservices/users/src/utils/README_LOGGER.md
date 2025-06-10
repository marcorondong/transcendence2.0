# Custom Logger

This module provides a flexible, Fastify-compatible logger based on [`pino`](https://github.com/pinojs/pino), with:

- Optional `pino-pretty` formatting in development.
- Graceful fallback to `console.*()` when `pino` or `pino-pretty` aren't available.
  - Useful for easy migration from `console.*()` to `logger.*()`
- Fastify `req.log` support via `logger.from(request)`
- Structured logs designed for ELK (Elasticsearch, Logstash, Kibana) compatibility.

---

## Table of Contents

- [Custom Logger](#custom-logger)
  - [Table of Contents](#table-of-contents)
  - [✅ Features](#-features)
  - [🔧 Setup](#-setup)
  - [🔀 Migration Steps](#-migration-steps)
  - [🔌 Configuration](#-configuration)
  - [🧩 Usage Examples](#-usage-examples)
    - [Global logging](#global-logging)
    - [From request context](#from-request-context)
    - [Fallback to console when Pino is disabled or quick console logs](#fallback-to-console-when-pino-is-disabled-or-quick-console-logs)
  - [📦 ELK Compatibility](#-elk-compatibility)
    - [✅ Recommended structure for logs](#-recommended-structure-for-logs)
  - [🧪 Testing](#-testing)
  - [✅ Ready to migrate to ELK](#-ready-to-migrate-to-elk)
  - [📚 Notes](#-notes)

---

## ✅ Features

- Works with or without `pino-pretty`
- Outputs structured JSON logs (ready for ELK stack)
- Attaches contextual metadata like `reqId`, `method`, `url`, and (optionally) `call_site`
- Unified logging API across modules: `logger.info()`, `logger.error()`, etc.
- Compatible with Fastify's native logger (`req.log.*()`)
- Has `logger.console()` that behaves as a plain `console.log()` (for quick pints, emergency).

---

## 🔧 Setup

1. Install dependencies:

    ```bash
    npm install pino # Only if fastify is not used, since Fastify already includes pino
    npm install --save-dev pino-pretty # Optional, for local development only
    ```

2. import { fastifyLoggerConfig } from "./utils/logger";

    ```ts
    import { fastifyLoggerConfig } from "./utils/logger";
    const server = fastify({
    logger: fastifyLoggerConfig(),
    });
    ```

3. Ensure .env includes the desired log level, or set it in `logger.ts` constant section:

    ```env
    LOG_LEVEL=debug
    NODE_ENV=development
    ```

---

## 🔀 Migration Steps

1. Install dependencies (`npm install --save-dev pino-pretty`) (Check [Setup](#-setup))
2. Copy whole `logger.ts` file.
3. Register logger's `fastifyLoggerConfig` as Fastify's logger config. (Check [Setup](#-setup))
4. Configure it to suit your taste. (Check [Configuration](#-configuration))
5. Find all `console.` and do the following:
   1. Import custom logger (`import { logger } from "./path/to/logger";`)
   2. Replace `console.` with `logger.`
6. Follow [usage examples](#-usage-examples) and [recommended structure for logs](#-recommended-structure-for-logs) when reformatting existing logs and adding new ones.
7. Change `USE_ELK_FORMAT` to `true` to see which logs are not ELK compliant.
8. Fix them and start using ELK log format.

---

## 🔌 Configuration

Inside `logger.ts` you can configure:

| Flag                       | Type      | Description                                                            |
| -------------------------- | --------- | ---------------------------------------------------------------------- |
| `PINO_LOGGER`              | `let`     | Enable/disable Pino globally                                           |
| `FASTIFY_LOGGER`           | `const`   | Toggle Fastify’s internal logger (`req.log`)                           |
| `LOG_LEVEL`                | `string`  | Set via `process.env.LOG_LEVEL` (e.g. `info`, `debug`)                 |
| `SHOW_CALL_SITE`           | `boolean` | Adds `{ function, file, line }` to logs on debug/trace                 |
| `CALL_SITE_DEPTH_OVERRIDE` | `int`     | Overrides dynamic depth calculation to a fixed one (used in call_site) |
| `LOG_STACK_TRACE`          | `boolean` | Includes full stack traces in logs (error/fatal/debug)                 |
| `SERVICE_NAME`             | `string`  | Tag service name in logs (e.g. `"users"`)                              |
| `USE_ELK_FORMAT`           | `boolean` | Enforces ELK log formatting and warns invalid ones                     |
| `ELK_WARN_ENABLED`         | `boolean` | Enable/disable non-ELK format warnings                                 |
| `ELK_WARN_LEVEL`           | `string`  | Set log level for non-ELK format warnings (debug, warning, etc)        |

The effects are:

1. `PINO_LOGGER`:
   1. If `false`: Then the logs are juts like `console.*()` prints.
      1. E.g: `[Config] Loading config...`
   2. If `true`: Then the logs will have more metadata, useful for debugging and ELK Stack
      1. E.g: `{"level":30,"time":1749489540326,"service":"users","msg":"[Config] Loading config..."}`
2. `FASTIFY_LOGGER`:
   1. If `false`: Then Fastify built-in `request.log.*()` _**WON'T**_ be available
   2. If `true`: Then requests logs _**WILL**- be available; very useful for logging/debugging requests
      1. E.g:

        ```json
        {"level":30,"time":1749494588611,"pid":102898,"hostname":"c2r7p5.42vienna.com","reqId":"req-1","req":{"method":"PATCH","url":"/api/users/979b4b7b-d3ca-470e-a340-bd7e3011796d","host":"localhost:3000","remoteAddress":"127.0.0.1","remotePort":42442},"msg":"incoming request"}
        {"level":30,"time":1749494588614,"pid":102898,"hostname":"c2r7p5.42vienna.com","reqId":"req-1","msg":"testing logger in patchUserHandler"}
        {"level":30,"time":1749494588646,"pid":102898,"hostname":"c2r7p5.42vienna.com","reqId":"req-1","res":{"statusCode":200},"responseTime":34.92550899833441,"msg":"request completed"}
        ```

3. `LOG_LEVEL` (_only when pino-pretty is installed_):
   1. Available values: trace, debug, info, warn, error, fatal.
   2. They're in that order. So if the level is set to **info**, only log from that level and above will be printed.
   3. Comparison table

    | Level   | What it means                     | How to use it       |
    | ------- | --------------------------------- | ------------------- |
    | `trace` | Very detailed logs (lowest level) | logger.trace("msg") |
    | `debug` | Debugging info                    | logger.debug("msg") |
    | `info`  | Normal app logs (default)         | logger.info("msg")  |
    | `warn`  | Something might be wrong          | logger.warn("msg")  |
    | `error` | Something went wrong              | logger.error("msg") |
    | `fatal` | App crashed                       | logger.fatal("msg") |

4. `SHOW_CALL_SITE` (_only when pino-pretty is installed_):
   1. If `false`: Then "_function, file and line_" **won't** be available in debug logs, and **nested** in trace.
   2. If True: Then they'll be like this:

    ```json
    [2025-06-09 21:00:48.110 +0200] DEBUG: User Bob has 150 points
        service: "users"
        file: "tools.route.ts"
        line: 9
    ```

5. `CALL_SITE_DEPTH_OVERRIDE`:
   1. Overrides the dynamic depth calculation to a fixed depth. This is used by `getCallSiteDetails()` to find values for `function`, `file`, `line`.
6. `LOG_STACK_TRACE` (_only when pino-pretty is installed_):
   1. If `false`: Then **only** trace logs will have traces / stack calls.
   2. If `true`: Then debug, error, and fatal logs will have traces / stack calls.
7. `SERVICE_NAME` (_only when pino-pretty is installed_):
   1. It's for identifying which service (_e.g: users, pong, chat, ai_) is logging.
8. `USE_ELK_FORMAT`:
   1. If `false`: Then it takes usual console.log() log formatting (`console.log("message", object)`).
   2. If `true`: Then it takes ELK logs formatting (`console.log(object, "message")`) and warns when no-ELK format is found.
9. `ELK_WARN_ENABLED`:
   1. Enable/disable non-ELK format warnings.
10. `ELK_WARN_LEVEL`:
    1. Set log level for non-ELK format warnings (trace, debug, info, warning, error, fatal etc).

---

## 🧩 Usage Examples

### Global logging

```ts
import { logger } from "./utils/logger";

logger.info("Hello world!");
logger.error({ err }, "Unexpected error"); // Correct ELK style log format
logger.error("Unexpected error", { err }); // console.log style log format (NO ELK compliant)
logger.warn("Testing logging", {"message": "Login attempt" }, { action: "user_login" }); // console.log style log format (NO ELK compliant)
```

### From request context

```ts
// Controller or route handler
export async function myHandler(request: FastifyRequest, reply: FastifyReply) {
  const log = logger.from(request); // Create custom logger
  log.info("Processing request");

  // Or use it directly
  logger.from(request).error({ event: "validation_failed" }, "Bad payload");
  // MUST be ELK format compliant, if not , it's wrong. Fastify request.log behaves the same
}
```

### Fallback to console when Pino is disabled or quick console logs

If `pino-pretty` is not installed or `PINO_LOGGER = false`, logs fallback automatically to console.*():

```bash
[LOG] Hello world!
[ERROR] Unexpected failure
```

If `logger.console()` is used; it behaves as a plain `console.log()`;
It's not affected by any configuration since it's the most basic log.

---

## 📦 ELK Compatibility

This logger is ELK-ready out of the box:

- JSON logs with level, msg, time, service, and reqId
- Structured fields are encouraged:

    ```ts
    logger.info({ userId, action: "login_success" }, "User logged in"); // Correct ELK format: object first, message last.
    logger.error({ errorCode: "DB_FAIL", reason }, "Database insert failed"); // Correct ELK format: object first, message last.
    ```

### ✅ Recommended structure for logs

Use the following keys to make filtering/searching easier in Elasticsearch:

```ts
logger.info({
  "event.action": "user_patch",
  "user.id": userId,
  "http.method": request.method,
  "http.url": request.url,
  "http.status_code": 200,
}, "User updated successfully");
```

> [!IMPORTANT]
>
> Note the format is object and last is the message.
> Keys like "event.action", "user.id", "http.status_code" match Elastic Common Schema (ECS) format.

---

## 🧪 Testing

Add this route to your service (_Later please remove it_):

```ts
// TODO: Remove this route. It's only for testing
server.get("/test", async (request, reply) => {
  // 1. Testing Fastify's request logging
  if (true) {
    const log = logger.from(request); // Create custom logger
    log.info("From const log = logger.from(request): test info");
    log.warn("From const log = logger.from(request): test warn");
    log.error("From const log = logger.from(request): test error");
    // Or use it directly
    logger.from(request).info("From logger.from(req): test info");
    logger.from(request).warn("From logger.from(req): test warn");
    logger.from(request).error("From logger.from(req): test error");
    request.log.info("Hello from Fastify");
  }
  // 2. Testing logger "levels"
  if (true) {
    logger.error({ message: "Testing error" }); // ELK compliant format
    logger.debug("Testing debug"); // console and ELK compliant format
    logger.trace({ message: "Testing trace" }); // ELK compliant format
    logger.fatal("Testing fatal"); // console and ELK compliant format
    logger.log("Testing log"); // console and ELK compliant format
    logger.console("Testing console");
  }
  // 3. Testing logger custom formatting (like printf)(only for console format)
  if (true) {
    logger.info("Hello %s!", "Alice");
    logger.debug("User %s has %d points", "Bob", 150);
    logger.warn("JSON object: %j", { id: 1, name: "Test" });
    logger.error("Price: $%d, Discount: %d%%", 199, 20);
    logger.trace("Escaped percent: %% %s", "done");
    logger.fatal("Multiple types: %s %d %j", "X", 42, { a: true });
  }
  // 4. Testing logger cyclic objects handling
  if (true) {
    const a: any = {};
    a.self = a;
    logger.info("Cyclic? %j", a);
  }
  // 5. Testing logger object logging
  if (true) {
    const sampleUser = {
      id: "979b4b7b-d3ca-470e-a340-bd7e3011796d",
      username: "your_name",
      email: "yourname@example.com",
      status: "active",
      roles: ["user", "admin"],
      createdAt: new Date().toISOString(),
      profile: {
        displayName: "Some Random Name",
        country: "AT",
        timezone: "Europe/Vienna",
      },
    };
    // Notice the importance of placing "correctly" the message and specifying the fields and its order
    // Correct usage: object first, message last (ELK compliant = Fastify's request.log compliant)
    if (true) {
      logger.from(request).info({ "event.action": "test_log", "user displayName": sampleUser.profile.displayName }, "Logging test object display name");
    }
    // Correct usage
    if (true) {
      logger.log({ sampleUser }, "[Test Route] sampleUser object:");
      logger.warn({ sampleUser: sampleUser.profile.displayName }, "Testing warn");
      logger.warn({ message: "Testing warn" }, { sampleUser: sampleUser.profile.displayName });
      logger.warn({ sampleUser: sampleUser.profile.displayName }, { message: "Testing warn" });
    }
    // Incorrect usage: message first, object last
    if (true) {
      logger.info("Testing info", sampleUser.username);
      logger.warn("Testing warn", { message: "Testing warn" }, { sampleUser: sampleUser.profile.displayName });
    }
  }
  reply.send({ ok: true });
});
```

## ✅ Ready to migrate to ELK

Once a log shipper (e.g. Logstash or Fluent Bit) is added, no changes are needed. All logs are already structured and parsable.

## 📚 Notes

These are `pino` log levels (string, number and meaning)

| Level   | Numeric | What it means                     |
| ------- | ------- | --------------------------------- |
| `trace` | 10      | Very detailed logs (lowest level) |
| `debug` | 20      | Debugging info                    |
| `info`  | 30      | Normal app logs (default)         |
| `warn`  | 40      | Something might be wrong          |
| `error` | 50      | Something went wrong              |
| `fatal` | 60      | App crashed                       |
