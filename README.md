# ATLauncher Meta

This is the meta repository for ATLauncher.

## Use

This repository is used for discussing ATLauncher issues that aren't directly related to a single repository as well as
housing the boilerplate used for our repositories (such as github issue templates and code of conduct).

## Scripts

This repository also contains some housekeeping scripts which can be used to keep ATLauncher repositories up to date
with things such as changes to labels, base files among other things.

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

Lastly you will need to either set an environment variable called `GITHUB_ACCESS_TOKEN` with a GitHub access token
generated from <https://github.com/settings/tokens>.

### Sync GitHub Labels

If labels are updated in the `github.json` file, then those labels can be synced to all repositories listed in
`github.json` by running:

```bash
npm run github:sync-labels
```
