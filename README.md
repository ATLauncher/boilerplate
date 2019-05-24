# ATLauncher Meta

This is the meta repository for ATLauncher.

## Use

This repository is used for discussing ATLauncher issues that aren't directly related to a single repository as well as
housing the boilerplate used for our repositories (such as github issue templates and code of conduct).

## Scripts

This repository also contains some housekeeping scripts which can be used to keep ATLauncher repositories up to date
with things such as changes to labels, base files among other things.

When there are changes to this repository, the `all` script will be run from `package.json` and will automatically
distribute any changes needed, so no manual intervention is needed.

### Setup

Before you begin you need to make sure you have the NodeJS 8 or newer installed on your computer.

We use and recommend `nvm` for ease of use when working in this (and other) repositories. `nvm` will allow you to run
`nvm use` in a projects directory to automatically use the version of NodeJS they recommend for their project.

You can download `nvm` from the below repositories:

* Windows: <https://github.com/coreybutler/nvm-windows>
* OSX/\*nix: <https://github.com/creationix/nvm>

Next install the project dependencies:

```bash
npm install
```

Lastly you will need to either set an environment variable called `ACCESS_TOKEN_GITHUB` with a GitHub access token
generated from <https://github.com/settings/tokens>.

### Add Discord Hook

This will ensure that all repositories have the correct webhook setup for Discord notifications.

This requires the `DISCORD_WEBHOOK_URL` environment variable is set with the url provided by Discord
(with /github added to the end).

```bash
npm run github:discord-hook
```

### Sync GitHub Labels

If labels are updated in the `github.json` file, then those labels can be synced to all repositories listed in
`github.json` by running:

```bash
npm run github:sync-labels
```

### Update Template Files

In the `github.json` file there is a list of template files. If a repository has `updateTemplateFiles` set to true, when
the below command is run, it will update/add each of the template files if it's out of date or missing.

```bash
npm run github:update-template-files
```
