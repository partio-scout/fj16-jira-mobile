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
