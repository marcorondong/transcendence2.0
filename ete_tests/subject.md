## Must Work
* [] Framework module 
* [] Database module 
* [] Frontend module
* [] Single page application -> pw
* [] work on Mozilla Firefox  -> pw
* [] Must use Docker to run website
* [] Everything must be lunched with a single command line to run an autonomous container 
* [] YOUR RUNTIME NEED TO BE LOCATED IN /goinfre or /sgoinfre
* [] You are not able to use “bind-mount volumes” between the host
and the container if non-root UIDs are used in the container.
* [] Live pong game against another player directly on website ->pw
* [] Remote players -> pw
* [] Tournament. Who is playing against who and the order of the play 
* [] Registration system. Standard User Management.  With the module: aliases are linked to registered
accounts, allowing persistent stats and friend lists
* [] Matchmaking system.  the tournament system should organize the matchmaking of the participants, and announce the next match
* [] All players must adhere to the same rules, including having identical paddle speed.
This requirement also applies when using AI; the AI must exhibit the same speed
as a regular player
* [] The game must adhere to the default frontend constraints (as outlined above), or
you may choose to use the FrontEnd module, or override it with the Graphics
module. While the visual aesthetics can vary, the game must still capture the
essence of the original Pong (1972).
* [] Any password stored in your database, if applicable, must be hashed
* [] Your website must be protected against SQL injections/XSS attacks
* [] If you have a backend or any other features, it is mandatory to enable an HTTPS
connection for all aspects (use wss instead of ws for example).
* []  You must implement validation mechanisms for forms and any user input, either on
the base page if no backend is used, or on the server side if a backend is employed
* [] Regardless of whether you choose to implement the JWT Security module with
2FA, it’s essential to prioritize the security of your website. For instance, if you
choose to create an API, ensure your routes are protected. Even if you decide not
to use JWT tokens, securing the site remains critical.
* [] Please make sure you use a strong password hashing algorithm
* [] For obvious security reasons, any credentials, API keys, env
variables etc., must be saved locally in a .env file and ignored
by git. Publicly stored credentials will cause your project to fail.

## MODULES 
We need 7 points for 100, 9.5 for 125
### Web
#### [] Framework to build the backend (1 Point)
  * [] Fastify with Node.js
#### [] Use framework or toolkit to build the (0.5 Point) front-end
  * [] Tailwind CSS in addition of the Typescript, and nothing else 
#### [] Database for the backend -and more (0.5)
  * [] SQL Lite - prerequisite for backend frame Work module 
#### [] Store the score of a tournament in the Blockchain (1 point)
  * [] Testing blockchain environment 
  * [] Blockchain implementation Avalanche 
  * [] Solidity for smart contract development
  * [] Solidity smart contract is responsible for recording, managing and retrieving tournament scores
### User management
#### [] Standard User management, authentication and users across tournaments  (1 Point )
  * [] Users can securely subscribe to the website -> pw
  * [] Registered users can securely log in -> pw
  * [] User can select a unique display name to participate in tournaments 
  * [] User can update their information -> pw
  * [] Users can upload an avatar, with default option if none is provided 
  * [] Users can add others as friends and view their online status.
  * [] User profiles display stats such as wins and losses.
  * [] Each user has a Match History including 1v1 games, dates, and relevant details, accessible to logged-in users.
  * [] The management of duplicate usernames/emails is at your discretion;
please ensure a logical solution is provided.
### Gameplay and user experience
#### [] Remote Players (1 Point)
  * [] It should be possible for two player to play remotely. Each located on seperated computer, accessing the same website and playing the same Pong game.
#### [] Multiple players (1 point)
  * [] It should be possible to have more than two players. Each player needs live control
(so the “remote players” module is strongly recommended). It’s up to you to decide
how the game could be played with 3, 4, 5, 6 or more players. Along with the regular
2 players game, you can define a specific number of players, greater than 2, for this
multiplayer module. Ex: 4 players could play on a square board, with each player
controlling one unique side of the square.

#### [] Live Chat (1 point)
  * [] The user should be able to send direct messages to other users.
  * [] The user should be able to block other users, preventing them from seeing any
further messages from the blocked account.
  * [] The user should be able to invite other users to play a Pong game through the
chat interface
  * [] The tournament system should be able to notify users about the next game.
  * [] The user should be able to access other players’ profiles through the chat
interface.
### AI-Algo
#### [] Introduce an AI opponent (1 Point)
  * [] In this major module, the objective is to incorporate an AI player into the game.
Notably, the use of the A* algorithm is not permitted for this task
  * [] Develop an AI opponent that provides a challenging and engaging gameplay
experience for users
  * [] The AI must replicate human behavior, which means that in your AI implementation, you must simulate keyboard input. The constraint here is that the AI can only refresh its view of the game once per second, requiring it to anticipate bounces and other actions
  * [] Implement AI logic and decision-making processes that enable the AI player
  * [] Explore alternative algorithms and techniques to create an effective AI player
without relying on A* to make intelligent and strategic moves.
  * [] Ensure that the AI adapts to different gameplay scenarios and user interactions.
  * [] You will need to explain in detail how your AI works during your
evaluation. Creating an AI that does nothing is strictly prohibited;
it must have the capability to win occasionally
### Devops
#### [] Monitoring system (0.5 point)
  * [] Comprehensive monitoring system using Prometheus and Grafana
  * [] Deploy Prometheus as the monitoring and alerting toolkit to collect metrics
and monitor the health and performance of various system components.
  * [] Configure data exporters and integrations to capture metrics from different
services, databases, and infrastructure components
  * [] Create custom dashboards and visualizations using Grafana to provide realtime insights into system metrics and performance
  * [] Set up alerting rules in Prometheus to proactively detect and respond to
critical issues and anomalies.
  * [] Ensure proper data retention and storage strategies for historical metrics data.
  * [] Implement secure authentication and access control mechanisms for Grafana
to protect sensitive monitoring data. This minor module aims to establish a robust monitoring infrastructure using
Prometheus and Grafana , enabling real-time visibility into system metrics and
proactive issue detection for improved system performance and reliability.

#### [] Designing the Backend as Microservices (1 point)
  * [] Divide the backend into smaller, loosely-coupled microservices, each responsible for specific functions or features
  * [] Define clear boundaries and interfaces between microservices to enable independent development, deployment, and scaling
  * []  Implement communication mechanisms between microservices, such as RESTful APIs or message queues, to facilitate data exchange and coordination
  * [] Ensure that each microservice is responsible for a single, well-defined task or
business capability, promoting maintainability and scalability
### Accessibility
#### [] Support on all devices (0.5 point)
  * [] Ensure the website is responsive, adapting to different screen sizes and orientations, providing a consistent user experience on desktops, laptops, tablets,
and smartphones
  * [] Ensure that users can easily navigate and interact with the website using
different input methods, such as touchscreens, keyboards, and mice, depending
on the device they are using

#### [] Expanding Browser Compatibility (0.5 point)
  * [] Extend browser support to include an additional web browser, ensuring that
users can access and use the application seamlessly.
  * [] Conduct thorough testing and optimization to ensure that the web application
functions correctly and displays correctly in the newly supported browser
  * [] Address any compatibility issues or rendering discrepancies that may arise in
the added web browser.
  * [] Ensure a consistent user experience across all supported browsers, maintaining
usability and functionality
### Server-Side Pong
#### [] Replace Basic Pong with Server-Side Pong and Implementing an API. (1 point)
  * [] Develop server-side logic for the Pong game to handle gameplay, ball movement, scoring, and player interactions
  * [] Create an API that exposes the necessary resources and endpoints to interact
with the Pong game, allowing partial usage of the game via the Command-Line
Interface (CLI) and web interface.
  * [] Design and implement the API endpoints to support game initialization, player
controls, and game state updates
  * [] Ensure that the server-side Pong game is responsive, providing an engaging
and enjoyable gaming experience
  * [] Integrate the server-side Pong game with the web application, allowing users
to play the game directly on the website
