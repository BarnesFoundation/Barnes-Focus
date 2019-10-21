# Troubleshooting

> If deployment fails with reason: `your yarn packages are out of date`, solve that in below way:

## First Approach

{PATH_TO_APP}$ eb ssh

{SERVER}$ eb --version

check the version of this output with the version installed on your local machine. If versions are different, then either you can:

### open package.json file, and add/update:

"yarn": "YARN_VERSION"

commit this file and re-deploy. OR you can `ssh` into server and run:

$ npm install -g yarnpkg@1.2.1

### replace this version with the correct one

> NOTE: commit this file into the source code and re-run `eb deploy --staged` command. Once completed successfully, you'll then have to remove `05_yarn_upgrade` block from this file again and re-commit this file, otherwise every time you deploy, it will try to upgrade yarn, which will increase the deployment time
