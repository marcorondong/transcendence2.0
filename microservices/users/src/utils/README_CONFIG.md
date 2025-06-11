# Configuration Loader

This module provides a custom config loader `getConfig` for loading multiple configurations from multiple sources.

---

## Table of Contents

- [Configuration Loader](#configuration-loader)
  - [Table of Contents](#table-of-contents)
  - [✅ Features](#-features)
  - [🧩 Dependencies](#-dependencies)
  - [🔧 Setup](#-setup)
  - [🔀 Migration Steps](#-migration-steps)
  - [🔌 Configuration](#-configuration)
  - [🧩 Usage Examples](#-usage-examples)
  - [✅ Recommended usage of AppError](#-recommended-usage-of-apperror)
  - [🧪 Testing](#-testing)

---

## ✅ Features

- It loads configurations from multiple sources (_in this order by default_):
  - docker secrets.
  - environment.
  - `.env` files.
  - `package.json` files.
  - hardcoded values.
- The loading order can be easily changed.
- The configurations values are are typed. This is good because:
  - Enforces type safety via AppConfig
  - Prevents typos or missing required config values.
  - Makes config dependencies explicit, which helps all team members understand what’s required.
- It allows to catch invalid vars errors early, and provide custom error messages for all or specific values.
- It has a _**cache**_ logic to avoid reading the files multiple times on each call and each run.

---

## 🧩 Dependencies

- Production / Development:
  - `dotenv` but it can be easily removed and rely on the other 4 methods.
  - `logger` but it can be easily changed to plain ol' `console.log()`

---

## 🔧 Setup

1. Install dependencies: `npm install dotenv`
2. Import `getConfig` function:
  `import getConfig from "../path/to/utils/config";`
3. Add the correct variables:
   1. Their name and types inside `type AppConfig = { // [...] }`
   2. Their sources and order inside `const config: AppConfig = { // [...] }`
4. Add the correct paths according to the service,
   1. Path to "docker secrets", usually in `run/secrets` (_inside the container_).
   2. Paths to `.env` file that will be loaded with `dotenv`
   3. Path to `package.json` file.
5. Add the correct hardcoded values (_if any_).
6. Add/Modify any logger statement for indicating values' source or if missing.

---

## 🔀 Migration Steps

1. Copy whole `config.ts` file.
2. Configure it to suit your taste. (Check [Configuration](#-configuration) and ([Setup](#-setup)))
3. Find all places where you need to load configurations and do the following:
   1. Import `getConfig()` function (`import getConfig from "../path/to/utils/config;`)
   2. Replace hardcoded values if the respective call to `getConfig()`. (E.g `const config = getConfig();` or `let var1 = getConfig().var1`)
4. Add logger prints to track your imports and check their values.
   1. By default, `getConfig()` logs loaded `config` object in debug level (`logger.debug()`)

> [!IMPORTANT]
>
> For some of its features, dotenv must be installed.
> If you want to use it without dotenv, you can;
> but you'll have to read the values form the other sources
> (_docker secrets, environment, `package.json` or hardcoded values_).

---

## 🔌 Configuration

Inside `config.ts` you can configure:

- `type AppConfig`: To add all the variables you need.
- All the paths for your docker secrets, `.env` files and `package.json` file.
- `hardcodedDefaults` to hold your hardcoded values.
- `config: AppConfig` to add the sources and precedence of the variables values (_and add custom logger prints too_).

> [!NOTE]
>
> The logic of loading `package.json` files and docker secrets could be adapted
> to load any json file or single value key=value `.txt` file.

A fully loaded `config: AppConfig` object will look like this (_printed with logger.debug() so adjust the logs level to see it_)

```bash
[Config] Final config object: {
  PAGINATION_ENABLED: 'true',
  DEFAULT_PAGE_SIZE: '10',
  APP_VERSION: '1.1.0',
  APP_NAME: 'users',
  APP_DESCRIPTION: 'USERS service API',
  NODE_ENV: 'development'
}
```

> [!NOTE]
>
> You can add/remove logger prints;

---

## 🧩 Usage Examples

`const config = getConfig();` or `let var1 = getConfig().var1`

---

## ✅ Recommended usage of AppError

Check USERS service code.

---

## 🧪 Testing

Try to load from different places (_or even invalid_) and see what;s your final `config` object.
Adjust the logs level, or change `logger.debug()` to `logger.info()` or something that matches your current logs level.
