# End-to-End DevSecOps CI/CD Pipeline

A starter project demonstrating GitHub Actions CI/CD with Node.js, tests, Gitleaks, npm audit, Docker, Trivy, Docker Hub, optional AWS EC2 deployment, and Slack notifications.

## Workflow

1. Pull request or push to `main` starts GitHub Actions.
2. Run Node.js tests.
3. Run `npm audit` for dependency vulnerabilities.
4. Scan for accidentally committed secrets with Gitleaks.
5. Build a Docker image and scan it with Trivy for HIGH/CRITICAL vulnerabilities.
6. On a successful push to `main`, publish the image to Docker Hub.
7. If EC2 secrets are configured, deploy to EC2 and run `/health`.
8. If a Slack webhook is configured, send a workflow status notification.

## Run locally

Requirements: Node.js 20+ and Docker.

```bash
npm test
npm start
```

Open `http://localhost:3000` and `http://localhost:3000/health`.

Build and run the container:

```bash
docker build -t venkat-devsecops-demo:local .
docker run --rm -p 3000:3000 venkat-devsecops-demo:local
```

## Create the GitHub repository

Create an empty repository named `end-to-end-devsecops-pipeline` on GitHub. Do not add a README or license there if you are pushing this folder as-is.

```bash
git init
git add .
git commit -m "Initial DevSecOps CI/CD pipeline"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/end-to-end-devsecops-pipeline.git
git push -u origin main
```

## GitHub repository secrets

Add secrets under **Settings → Secrets and variables → Actions → New repository secret**.

Required to publish images:
- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN` — create a Docker Hub access token; do not use your account password.

Optional for EC2 deployment:
- `EC2_HOST` — EC2 public IP or DNS name
- `EC2_USER` — commonly `ubuntu` for Ubuntu images
- `EC2_SSH_KEY` — private key content for the deployment user

Optional for Slack:
- `SLACK_WEBHOOK_URL` — incoming webhook URL for the intended Slack channel

## AWS deployment notes

The EC2 instance needs Docker installed and permission for the deployment user to run Docker. Configure network access carefully. Do not expose SSH to the whole internet if you can avoid it. GitHub-hosted runner IPs can change; consider a self-hosted runner or another controlled deployment method. The example publishes the app on port 80 and expects `/health` to return HTTP 200.

## SonarQube / SonarCloud

`sonar-project.properties` is included as a starting point, but analysis is not enabled in the workflow yet. Create a project in SonarQube or SonarCloud, configure its token and host/project settings, then add the appropriate scanner action and Quality Gate check. Do not claim SAST is active until this is configured and a run succeeds.

## Important security notes

- Never commit real credentials, `.env` files, private keys, or Slack webhook URLs.
- The workflow intentionally blocks on HIGH/CRITICAL Trivy findings. A base image or dependency update may be needed before it passes.
- Use protected branches and required checks before using this for production.
- Pin third-party GitHub Actions to verified full commit SHAs for production use.
- This is a learning starter, not a production-hardened deployment design.
