# Last FM Loved Tracks to Spotify Playlist

## Run
    Install Nodejs,
    Clone the repository and install its dependencies running:

    $ npm install
    $ cd main
    $ node app.js

Then, open `http://localhost:8888` in a browser.

### Using your own credentials
This app uses a client ID and secret key. If you are planning to use this app , please register your app and get your own credentials instead of using the ones in this project.

Go to [My Applications on Spotify Developer](https://developer.spotify.com/my-applications) and create your application. For the examples, I registered these Redirect URIs:

* http://localhost:8888/callback

Once you have created your app, replace the `client_id`, `redirect_uri` and `client_secret` in the examples with the ones you get from My Applications.
