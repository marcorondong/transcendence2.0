## Must Work
* [] Framework module 
* [] Database module 
* [] Frontend module
* [] Single page application
* [] work on Mozilla Firefox 
* [] Must use Docker to run website
* [] Everything must be lunched with a single command line to run an autonomous container 
* [] YOUR RUNTIME NEED TO BE LOCATED IN /goinfre or /sgoinfre
* [] You are not able to use “bind-mount volumes” between the host
and the container if non-root UIDs are used in the container.
* [] Live pong game against another player directly on website
* [] Remote players
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
#### Web
* [] Framework to build the backend (1 Point)
  * [] Fastify with Node.js
* [] Use framework or toolkit to build the (0.5 Point) front-end
  * [] Tailwind CSS in addition of the Typescript, and nothing else 
* [] Database for the backend -and more (0.5)
  * [] SQL Lite - prerequisite for backend frame Work module 
* [] Store the score of a tournament in the Blockchain
  * [] Testing blockchain environment 
  * [] Blockchain implementation Avalanche 
  * [] Solidity for smart contract development
  * [] Solidity smart contract is responsible for recording, managing and retrieving tournament scores
#### User management
#### Gameplay and user experience
#### AI-Algo
#### Cybersecurity
#### Devops
#### Graphics 
#### Accessibility
#### Server-Side Pong
