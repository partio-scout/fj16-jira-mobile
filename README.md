# JIRA mobile client

The JIRA mobile client is a tiny web app that allows viewing, commenting and tracking progress of issues. It was originally made for the 2016 Finnjamboree, Roihu.

Users log into the app using their JIRA username and password and the app displays the issues assigned to them. Issues are grouped under three tabs: To Do, In Progress or Done based on their status in JIRA.

## Configuration

The app can be configured using the environment variables. For development use you may not need to set any environment variables at all. The application supports the following configuration options (environment variables):

- HOST: The JIRA hostname and protocol. Defaults to http://jira.partio.fi.
- DATABASE_URL: If given, the app will use database sessions instead of flat file. Needed for the app to work in environments with an ephemeral file system, such as Heroku.
- SECRET: Secret used for signing the session cookie. **Must be set in production to keep your app safe.**
- NODE_ENV: When set to "production" the app will force SSL and set "trust proxy" flag so the correct client IP will be used. This is useful in production, obviously.
- PORT: Set automatically e.g. on Heroku, dictates the port the app will use. Defaults to 3000.

## Developing

In development, make sure you have a working JIRA installation set in the HOST env var or you are using the default http://jira.partio.fi as the backend. Then you can simply:

	npm install
	npm start

Navigate to http://localhost:3000 and log in using your JIRA username and password.

To have the app automatically restart when you make code changes you can install [Supervisor](https://github.com/petruisfan/node-supervisor) and run:

	supervisor index.js

There are no tests in the app because it's so simple and depends heavily on JIRA.

## Deploying to Heroku

After cloning the repository:

	# Create the app with the url https://my-jira-client.herokuapp.com
	heroku create my-jira-client
	# Set the JIRA host to be used as backend
	heroku config:set HOST=https://jira.example.org
	# Set the secret to prevent tampering with your session cookies
	heroku config:set SECRET=<keyboard cat>
	# Add a database for storing sessions - flat file sessions don't work on Heroku.
	heroku addons:create heroku-postgresql:hobby-dev
	# Wait for creation to complete
	heroku pg:wait
	# Push code to Heroku
	git push heroku master

You should now have a working installation of the app available at https://my-jira-client.herokuapp.com.

Heroku automatically sets NODE_ENV to "production" and PORT to the correct value. Adding the database automatically sets the DATABASE_URL to the correct value.
