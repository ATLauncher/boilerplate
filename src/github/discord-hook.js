const _ = require('lodash');
const octokitRest = require('@octokit/rest');

const github = require('../../github.json');

const octokit = octokitRest({
    requestMedia: 'application/vnd.github.v3+json',
    headers: {
        'user-agent': 'octokit/rest.js v15.2.6'
    },
});

if (!process.env.GITHUB_ACCESS_TOKEN) {
    console.error('GITHUB_ACCESS_TOKEN environment variable must be provided.');
    process.exit(1);
}

if (!process.env.DISCORD_WEBHOOK_URL) {
    console.error('DISCORD_WEBHOOK_URL environment variable must be provided.');
    process.exit(1);
}

octokit.authenticate({
    type: 'token',
    token: process.env.GITHUB_ACCESS_TOKEN
})

github.repositories.forEach(async ({ owner, repo, discordHook = true }) => {
    try {
        const { data: remoteHooks } = await octokit.repos.getHooks({
            owner,
            repo,
            per_page: 100
        });

        const discordWebHook = remoteHooks.find((remoteHook) => (
            remoteHook.config.url === process.env.DISCORD_WEBHOOK_URL
        ));

        if (!discordHook) {
            if (discordWebHook) {
                console.log(`Removing Discord hook for project ${owner}/${repo}`);

                await octokit.repos.deleteHook({ owner, repo, id: discordWebHook.id });
            }

            return;
        }

        const discordHookEvents = github.webhooks.discord.events;

        if (!discordWebHook) {
            console.log(`Adding Discord hook for project ${owner}/${repo}`);

            await octokit.repos.createHook({
                owner,
                repo,
                name: 'web',
                events: discordHookEvents,
                config: {
                    content_type: 'json',
                    insecure_ssl: 0,
                    url: process.env.DISCORD_WEBHOOK_URL,
                },
                active: true
            });

            return;
        }

        const discordHookNeedsUpdating = (
            !_.isEqual(discordWebHook.events, discordHookEvents) ||
            !discordWebHook.active
        );

        if (!discordHookNeedsUpdating) {
            console.log(`Discord hook for project ${owner}/${repo} already up to date`);
            return;
        }

        console.log(`Updating Discord hook for project ${owner}/${repo}`);

        await octokit.repos.editHook({
            owner,
            repo,
            name: discordWebHook.name,
            id: discordWebHook.id,
            events: discordHookEvents,
            config: {
                content_type: 'json',
                insecure_ssl: 0,
                url: process.env.DISCORD_WEBHOOK_URL,
            },
            active: true
        });
    } catch (e) {
        console.log('-----');
        console.error(`[${owner}/${repo}] Error from GitHub:`)
        console.log();
        console.error(e);
        process.exit(1);
    }
});
