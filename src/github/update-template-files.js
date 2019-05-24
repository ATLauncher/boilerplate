const fs = require('fs');
const _ = require('lodash');
const path = require('path');
const sha1 = require('sha1');
const base64 = require('base-64');
const { DateTime } = require('luxon');
const { createHash } = require('crypto');
const Octokit = require('@octokit/rest');

const github = require('../../github.json');

if (!process.env.ACCESS_TOKEN_GITHUB) {
    console.error('ACCESS_TOKEN_GITHUB environment variable must be provided.');
    process.exit(1);
}

const octokit = Octokit({
    requestMedia: 'application/vnd.github.v3+json',
    userAgent: 'octokit/rest.js v16.27.0',
    auth: `token ${process.env.ACCESS_TOKEN_GITHUB}`,
});

github.repositories
    .filter(({ updateTemplateFiles }) => updateTemplateFiles)
    .forEach(async ({ owner, repo, excludedTemplateFiles = [] }) => {
        console.log(`Updating template files for project ${owner}/${repo}`);

        try {
            const { data: repoData } = await octokit.repos.get({ owner, repo });

            // get the year the repository was created
            const { year: yearCreated } = DateTime.fromISO(repoData.created_at);

            const templateMetaData = {
                year: yearCreated,
            };

            github.templateFiles
                .filter(file => !excludedTemplateFiles.includes(file))
                .forEach(async templateFile => {
                    const template = _.template(
                        fs.readFileSync(path.resolve(__dirname, '../../template', templateFile)),
                    );

                    const updatedFileData = template(templateMetaData);
                    const updatedBase64data = base64.encode(updatedFileData);
                    const updatedFileSha = sha1(updatedFileData);

                    try {
                        const { data: existingFile } = await octokit.repos.getContents({
                            owner,
                            repo,
                            path: templateFile,
                            ref: 'master',
                        });

                        const oldFileData = base64.decode(existingFile.content);
                        const oldBase64data = base64.encode(oldFileData);
                        const oldFileSha = sha1(oldFileData);

                        const fileUpToDate = _.isEqual(oldFileData, updatedFileData);

                        if (fileUpToDate) {
                            console.log(
                                `File '${templateFile}' already up to date for project ${owner}/${repo}`,
                            );
                            return;
                        }

                        console.log(`Updating '${templateFile}' for project ${owner}/${repo}`);

                        await octokit.repos.updateFile({
                            owner,
                            repo,
                            path: templateFile,
                            message: `chore: update ${templateFile}`,
                            content: updatedBase64data,
                            sha: existingFile.sha,
                            committer: {
                                name: 'ATLauncher Bot',
                                email: '38805255+atlauncher-bot@users.noreply.github.com',
                            },
                            branch: 'master',
                        });
                    } catch (e) {
                        if (e.status !== 404) {
                            throw e;
                            return;
                        }

                        console.log(`Creating file '${templateFile}' for project ${owner}/${repo}`);

                        await octokit.repos.createFile({
                            owner,
                            repo,
                            path: templateFile,
                            message: `chore: add ${templateFile}`,
                            content: updatedBase64data,
                            committer: {
                                name: 'ATLauncher Bot',
                                email: '+atlauncher-bot@users.noreply.github.com',
                            },
                            branch: 'master',
                        });

                        return;
                    }
                });

            github.oldTemplateFiles.forEach(async templateFile => {
                try {
                    const { data: existingFile } = await octokit.repos.getContents({
                        owner,
                        repo,
                        path: templateFile,
                        ref: 'master',
                    });

                    console.log(`Deleting file '${templateFile}' for project ${owner}/${repo}`);

                    await octokit.repos.deleteFile({
                        owner,
                        repo,
                        path: templateFile,
                        message: `chore: delete ${templateFile}`,
                        sha: existingFile.sha,
                        committer: {
                            name: 'ATLauncher Bot',
                            email: '+atlauncher-bot@users.noreply.github.com',
                        },
                        branch: 'master',
                    });
                } catch (e) {
                    if (e.status === 404) {
                        console.log(
                            `File '${templateFile}' already deleted for project ${owner}/${repo}`,
                        );
                        return;
                    }

                    throw e;
                }
            });
        } catch (e) {
            console.log('-----');
            console.error(`[${owner}/${repo}] Error from GitHub:`);
            console.log();
            console.error(e);
            process.exit(1);
        }
    });
