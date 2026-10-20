# Required repository settings

Protect `main` with these GitHub rules:

- Require pull requests and at least one approving review.
- Dismiss stale approvals after new commits.
- Require Code Owner review.
- Require `Plugin pull request / validate`, `Check PR title / title`, and `Contributor License Agreement / cla`.
- Require branches to be up to date before merge.
- Block force pushes, deletions, and bypasses except emergency repository administrators.
- Restrict direct pushes to platform maintainers.
- Create the protected `plugin-production` Environment with required maintainer approval and no unprotected branches.

Configure the Environment and repository values listed in `.env.example`. R2 credentials must be limited to object access in the production plugin bucket.
