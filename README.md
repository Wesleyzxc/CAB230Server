## Project Info
This project was written with https://github.com/Wesleyzxc/Crime-Search-React-app as the front end.

# Back end served on ExpressJS with SwaggerUI on /docs

## Installation

Required. Before running the server, install all the necessary packages by running the command:

```sh
$ npm install
```

## Start up

To start up the server, simply run the command

```sh
$ npm start
```

## Logging 
The app uses `morgan` to log any requests to the server and can be found under `/logs/access.log` 

## Authentication & Security
For basic encryption, `bcrypt` is used to encrypt data using the `hashSync(plainText, saltRounds)` function before storing into the database.

For authentication, `jsonwebtoken` is used to provide a token upon logging in. Then, further API requests will compare authorisation header with token before permission is granted.

Other security features such as keys stored on /process.env has been uploaded for ease of use upon clone. The key is used to verify the token.

## Additional Information
This server is hosted on localhost port 3000 without the use of certificate. The settings can be modified on `/bin/www` to include a certificate and/or through HTTPS.

## License
[MIT](https://choosealicense.com/licenses/mit/)
