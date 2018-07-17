# omnibar-moderation
Moderation tool for items to be shown on the omnibar

## Installation
Requirements:
 - Node >= 8.x
 - yarn

 1. Clone the app into a folder.
 2. run `yarn install`
 3. Create a file called `settings.json`
 It _has_ to define at least the following:

```
{
  "twitch": {
    "clientID": "<your client ID>",
    "channels": [
      {
        "id": "54739364",
        "name": "esamarathon"
      }
    ]
  }
}
 ```

But can overwrite any properties from `./shared/src/settings.default.json` (such as `admins`, `channels` etc.)

**DO NOT SET SECRETS IN settings.json!** (see step 4)

 4. Create a file caled `setings.backend.json`
 Here you set your secrets and other things only relevant to the backend, at least defining the following:

```
{
  "auth": {
    "secret": "<your encryption secret>"
  },
  "twitch": {
    "clientSecret": "<your client secret>"
  },
  "repeater": {
    "endpoint": "https://127.0.0.1:1234/omnibar_mod?key=<your omnibar secret>"
  }
}
```
Where the repeater endpoint points to where the [socket repeater](https://github.com/esamarathon/donation-socket-repeater) is serving the omnibar moderation POST endpoint from (usually `/omnibar_mod?key=some_secret_key`).

  This can also be used to define differing ports for the backend and frontend, depending on your setup.

 5. run `yarn build`
 6. serve static files from `./dist/frontend`
 7. add a systemd service that runs `yarn start`
