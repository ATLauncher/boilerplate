const Octokit = require('@octokit/rest');

const github = require('../../github.json');

if (!process.env.ACCESS_TOKEN_GITHUB) {
    console.error('ACCESS_TOKEN_GITHUB environment variable must be provided.');
    process.exit(1);
}

const octokit = Octokit({
    requestMedia: 'application/vnd.github.v3+json',
    userAgent: 'octokit/rest.js v16.27.0',
    previews: ['symmetra-preview'],
    auth: `token ${process.env.ACCESS_TOKEN_GITHUB}`,
});

github.repositories.forEach(async ({ owner, repo }) => {
    console.log(`Updating labels for project ${owner}/${repo}`);

    try {
        const { data: remoteLabels } = await octokit.issues.listLabelsForRepo({
            owner,
            repo,
            per_page: 100,
        });

        remoteLabels.forEach(async remoteLabel => {
            const localLabel = github.labels.find(
                ({ name }) => name.toLowerCase() === remoteLabel.name.toLowerCase(),
            );

            if (!localLabel) {
                console.warn(`[${owner}/${repo}] Deleting remote label ${remoteLabel.name}`);
                await octokit.issues.deleteLabel({ owner, repo, name: remoteLabel.name });
                return;
            }

            const remoteLabelOutOfDate =
                remoteLabel.name !== localLabel.name ||
                remoteLabel.description !== localLabel.description ||
                remoteLabel.color !== localLabel.color;

            if (!remoteLabelOutOfDate) {
                console.log(
                    `[${owner}/${repo}] Remote label ${remoteLabel.name} already up to date`,
                );
                return;
            }

            console.log(`[${owner}/${repo}] Updating remote label ${localLabel.name}`);

            await octokit.issues.updateLabel({
                owner,
                repo,
                current_name: remoteLabel.name,
                name: localLabel.name,
                color: localLabel.color,
                description: localLabel.description,
            });
        });

        const missingLocalLabels = github.labels.filter(
            localLabel => !remoteLabels.find(remoteLabel => remoteLabel.name === localLabel.name),
        );

        missingLocalLabels.forEach(async localLabel => {
            console.log(`[${owner}/${repo}] Adding remote label ${localLabel.name}`);

            await octokit.issues.createLabel({
                owner,
                repo,
                name: localLabel.name,
                color: localLabel.color,
                description: localLabel.description,
            });
        });
    } catch (e) {
        console.log('-----');
        console.error(`[${owner}/${repo}] Error from GitHub:`);
        console.log();
        console.error(e);
        process.exit(1);
    }
});
