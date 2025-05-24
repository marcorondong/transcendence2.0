
# 💾 🌱 Database seeder

This node app is for seeding databases.
It can load different models / data schemas and issue requests to the different APIs.
For seeding the databases, It can generate random data (using faker) or extract it from a file.
(_Very useful for testing databases, API invalid requests and error handling_)
It has an interactive mode, and automatic mode.
The goal of this app is to be used as a database seeder for testing purposes.

> [!IMPORTANT]
>
> Currently only **USERS service** database is included in the schemas.
> For including other services:
>
> - Create the respective schema descriptor and place it in `schemas` folder.
> - Create their respective preset in `app.ts`
> - It you want to support npm alias mode, add them to `package.json`
> - If lost, use 'users' config as a model to create your own set-up.

---

## 📦 Tech Stack

- faker: to generate mockup data.
- axios: for sending http requests.
- inquirer: for terminal prompts.
- ts-node & typescript: for coding, compiling and run it.

---

## 🚀 How to Run the app

- Interactive mode:
  - `npm run seed`
- Automated mode:
  - Generate random data: `npm run seed:users:auto`
  - Extract data from file: `npm run seed:users:file`
  - Generate previous data: `npm run seed:users:seed`

**Other examples:**
Load from file (no data generation):
`npm run seed -- --file=seed_data/users_seeded.csv --model=user`

Auto mode with summary and silence terminal output:
`pm run seed -- --auto --model=user --silent --summary=./logs/my_run.txt`

For more info, check `package.json` "scripts" part;
And `app.ts` code (_specially the args parsing and model preset_)

---

## ⚙️ Configuration

Any configuration (_defaults_) is done in "CONFIGURABLE CONSTANTS" section of the files.
When running in interactive mode (`npm run seed`), the app will prompt for everything.
When running in automated mode, these are the flags supported by the app:

| Flag             | Description                                                   |
| ---------------- | ------------------------------------------------------------- |
| `--auto`         | Auto-generate data with faker, no prompts                     |
| `--file=path`    | Load input data from a JSON or CSV file                       |
| `--model=user`   | Use a specific model (required in `auto` or `file` mode)      |
| `--seed=val`     | Provide a seed for faker (defaults to random if not provided) |
| `--count=val`    | Number of records to generate (applies to `--auto` mode only) |
| `--save=csv`     | Save both generated and failed data in CSV format             |
| `--save=json`    | Save both generated and failed data in JSON format            |
| `--summary=path` | Redirect all logs (including silent output) to a file         |
| `--silent`       | Suppress all logs except critical errors in terminal          |

For seeding other databases please follow the steps describes in the [description](#--database-seeder)

---

## 📚 Notes

In the future, Zod implementation could be made;
So we can define the schemas in Zod, or even better: import the schemas from the services we want to seed.

For checking the service, it's useful to run the "standard" mode (interactive or `--generate` flag).
For testing the API invalid requests and errors handling, it's useful to extract data from a file.
(_You can craft your own invalid data to test the API_)
For generating the same data, it's useful to use `--seed` or extracting it from a file.
