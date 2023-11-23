# bingo-game
Run a multiplayer bingo live game

## Run
### Dev (intended to be accessed only by your machine)
Server: `yarn run dev`

Client: `yarn run start`

NOTE: make sure to enter the server URL to REACT_APP_SERVER_HOST in .env.development in /client

NOTE: You can also access the production client build and not run a development server for React, just be sure to build it first

### Local (hosted on your machine's local ipv4 address)
Server: `yarn run local`

Client: `yarn run start`

NOTE: make sure to enter the server URL to REACT_APP_SERVER_HOST in .env.development in /client

NOTE: You can also access the production client build and not run a development server for React, just be sure to build it first

### Prod (hosted on the HOST and PORT as specified in .env of /server)
Client: `yarn run build`
Server: `yarn run prod`
