# Last FM Loved Tracks to Spotify Playlist   [![Build Status](https://travis-ci.org/cah-keyanhardman/lastfmtospotify.svg?branch=master)](https://travis-ci.org/cah-keyanhardman/lastfmtospotify)

This small javascript app will create spotify playlist from your last.fm loved tracks.

## Setup

### Get Spotify credentials
This app uses a spotify client ID and secret key for spotify api access. For development you will need to register your own:

1. Go to [My Applications on Spotify Developer](https://developer.spotify.com/my-applications) and create your application.
1. For the redirect uri, we need to to use the /callback path. So for local development, it would be: ```http://localhost:8888/callback```

### Dependencies

1. First, install [nodejs](https://nodejs.org/en/)
1. Clone the repository with git and cd into it:

    ```
    git clone git@github.com:cah-keyanhardman/lastfmtospotify.git
    cd lastfmtospotify
    ```

1. Install npm dependencies:

    ```
    npm install
    ```

## Running the app

The app is configured with the following environment variables:

* CLIENT_ID (required): Your spotify client id.
* CLIENT_SECRET (required): Your spotify client secret.
* PORT (optional): Defaults to 8888.

To run in development on the default port:

```
CLIENT_ID={your spotify client id} CLIENT_SECRET={your spotify client secret} node main/app.js
```

Then, open `http://localhost:8888` in a browser.
