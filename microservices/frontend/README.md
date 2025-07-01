# FRONTEND 🔖

## 💾 install

Run the main docker-compose.yml file in the root of the repo. The root yml includes the yml of the frontend, which runs two containers:

- tailwind css
- typescript

They automatically generate the /frontend/volume/css/output.css and the /frontend/volume/javascript/*.js files. These are ignored by git so they need to be generated when you first pull the repo.

## 🌎 use

By running the docker-compose file at the root of the repo the nginx container hosts the frontend which is reachable at `https://localhost:443`
Check it out in our [ft_transcendence page](https://localhost:443)

## 💻 development

running the docker-compose in the root will allow you to use new tailwind classes in the project and change the typescript files. The tailwind and typescript containers are listening to changes and compile the files automatically.
