# APAC Time Zone Converter — Docker-Based CI/CD Project

A hands-on DevOps portfolio project demonstrating how to test, containerize, publish, and deploy a static web application using GitHub Actions, Docker, Docker Hub, and Render.

**Live Demo:** https://apac-timezone-converter.onrender.com  
**GitHub Repository:** https://github.com/ssquadri/APAC-Time-Zone-Converter-Tool  
**Docker Hub Image:** https://hub.docker.com/r/ssquadri/apac-timezone-converter

---

## 1. Project Overview

The APAC Time Zone Converter is a web application that helps users compare times across different time zones. This project uses the application to demonstrate a practical DevOps workflow, from local development to cloud deployment.

The main objective was to build an automated CI/CD pipeline that validates the application, packages it into a Docker image, publishes the image to Docker Hub, and triggers deployment on Render.

The project was implemented step by step using Windows, PowerShell, VS Code, Git, and GitHub Actions.

## 2. Project Objectives

- Understand Docker images and containers through hands-on practice.
- Write a Dockerfile to containerize a static web application.
- Run and troubleshoot Docker containers locally.
- Publish a Docker image to Docker Hub.
- Create automated quality checks using GitHub Actions.
- Build and publish Docker images through a CI/CD workflow.
- Deploy a prebuilt Docker image to Render.
- Secure deployment credentials using GitHub Actions repository secrets.
- Trigger cloud deployments automatically after successful pipeline execution.
- Document the implementation with chronological screenshots.

## 3. Technology Stack

| Technology | Purpose |
|---|---|
| HTML, CSS and JavaScript | Frontend application |
| Node.js and npm | Dependency installation, testing and linting |
| Git and GitHub | Source control and code hosting |
| GitHub Actions | Automated CI and CD workflows |
| Docker | Application containerization |
| Nginx Alpine | Web server inside the Docker container |
| Docker Hub | Public Docker image registry |
| Render | Cloud hosting for the Dockerized application |
| PowerShell and VS Code | Local development environment |

## 4. Architecture

The deployment workflow connects the source repository, automated quality checks, the container registry, and the cloud hosting platform.

```text
Developer
   |
   | Git commit and push to main
   v
GitHub Repository
   |
   +------------------------------+
   |                              |
   v                              v
CI Workflow                  CD Workflow
ci.yml                       cd.yml
   |                              |
   |                              v
   |                       Checkout source
   |                              |
   |                       Set up Node.js
   |                              |
   |                       npm ci
   |                              |
   +----------------------> Unit tests
                                  |
                                  v
                             ESLint
                                  |
                                  v
                          HTML validation
                                  |
                                  v
                         Build Docker image
                                  |
                                  v
                           Docker Hub
                                  |
                                  v
                         Render Deploy Hook
                                  |
                                  v
                        Render Web Service
                                  |
                                  v
                         Live Web Application
```

Both workflows independently execute quality checks on pushes to `main`. The CD workflow proceeds to Docker publishing and deployment only when its own checks succeed.

## 5. Application Containerization

### Dockerfile

The application is served by Nginx using a lightweight Alpine-based image.

```dockerfile
FROM nginx:alpine

COPY index.html /usr/share/nginx/html/index.html
COPY timezone.js /usr/share/nginx/html/timezone.js

EXPOSE 80
```

### Explanation

- `FROM nginx:alpine` uses a lightweight Nginx image as the base.
- `COPY index.html ...` places the application HTML file in Nginx's web root.
- `COPY timezone.js ...` copies the JavaScript file used by the application.
- `EXPOSE 80` documents the container's HTTP listening port.

### Build the Docker image

Run the command from the project root, where the Dockerfile is located.

```powershell
docker build -t apac-timezone-converter:latest .
```

### Run the container locally

```powershell
docker run -d -p 8080:80 --name apac-timezone-app apac-timezone-converter:latest
```

Open the application at:

http://localhost:8080

### Verify the container

```powershell
docker ps
docker ps -a
docker logs apac-timezone-app
```

### Stop and restart the container

```powershell
docker stop apac-timezone-app
docker start apac-timezone-app
```

Stopping the container does not delete the Docker image.

## 6. Publishing the Image to Docker Hub

The Docker image was published to the public repository:

`ssquadri/apac-timezone-converter`

### Tag the image

```powershell
docker tag apac-timezone-converter:latest ssquadri/apac-timezone-converter:latest
```

### Authenticate and push

```powershell
docker login
docker push ssquadri/apac-timezone-converter:latest
```

The `latest` tag identifies the most recently published image under that tag. The automated workflow also publishes an image tagged with the corresponding Git commit SHA, making individual builds easier to identify.

Docker Hub image:

https://hub.docker.com/r/ssquadri/apac-timezone-converter

## 7. Continuous Integration (CI)

The CI workflow is defined in:

`.github/workflows/ci.yml`

It runs on pushes to `main` and pull requests targeting `main`.

The workflow performs these checks:

1. Checks out the source code.
2. Sets up Node.js.
3. Installs dependencies using `npm ci`.
4. Runs unit tests using `npm test`.
5. Runs ESLint using `npm run lint`.
6. Validates HTML using `npm run validate:html`.

These checks help detect errors before code is accepted into the delivery process.

## 8. Continuous Delivery / Deployment (CD)

The CD workflow is defined in:

`.github/workflows/cd.yml`

It runs when code is pushed to `main`.

### Pipeline stages

**Stage 1 — Checkout and setup**

GitHub Actions downloads the repository and prepares the Node.js environment.

**Stage 2 — Quality checks**

The workflow installs dependencies and runs unit tests, ESLint, and HTML validation.

If a check fails, the subsequent Docker publishing and deployment steps do not run.

**Stage 3 — Docker image build**

Docker Buildx builds the application image for `linux/amd64`.

**Stage 4 — Publish the image**

The workflow authenticates with Docker Hub and pushes two tags:

- `ssquadri/apac-timezone-converter:latest`
- `ssquadri/apac-timezone-converter:<commit-sha>`

The commit-specific tag provides a traceable reference to the source revision used for the build.

**Stage 5 — Trigger Render**

After the image is pushed successfully, the workflow sends an HTTP POST request to the Render Deploy Hook.

Render then initiates a deployment of the updated image.

The workflow confirms that the deploy-hook request succeeds; Render's deployment status must still be checked separately to confirm that the new version is live.

## 9. GitHub Actions Secrets

The following repository secrets were configured under:

**GitHub Repository → Settings → Secrets and variables → Actions**

| Secret | Purpose |
|---|---|
| `DOCKERHUB_USERNAME` | Docker Hub account username |
| `DOCKERHUB_TOKEN` | Authenticates the workflow to Docker Hub |
| `RENDER_DEPLOY_HOOK` | Triggers a Render deployment |

Secret values are stored in GitHub's encrypted secret storage and referenced by the workflow at runtime.

**Security practices:**

- Never commit access tokens or deploy-hook URLs to source control.
- Do not print secret values in workflow logs.
- Use an access token instead of storing your Docker Hub password.
- Rotate a token or deploy hook if it is accidentally exposed.

## 10. Deployment on Render

The Render web service uses the prebuilt Docker Hub image:

`docker.io/ssquadri/apac-timezone-converter:latest`

The service was configured with the name `apac-timezone-converter` and the Free compute plan.

Render pulls the image and runs the application as a cloud-hosted web service.

### Live application

https://apac-timezone-converter.onrender.com

### Important deployment considerations

- The application is served by Nginx on port 80 inside the container.
- The public Render URL provides access to the hosted application.
- A free Render instance can spin down after inactivity and may take additional time to respond when it wakes up.
- Pushing a new image to Docker Hub does not, by itself, guarantee that an image-backed Render service redeploys. The configured deploy hook triggers the deployment.
- A successful hook request and a healthy live deployment are separate checks.

## 11. Repository Structure

```text
APAC-Time-Zone-Converter-Tool/
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── cd.yml
│
├── tests/
│   └── timezone.test.js
│
├── .gitignore
├── .htmlvalidate.json
├── Dockerfile
├── eslint.config.mjs
├── index.html
├── package.json
├── package-lock.json
├── README.md
└── timezone.js
```

The `node_modules` directory is generated locally when dependencies are installed and should not be committed to the repository.

## 12. How to Run the Project Locally

### Prerequisites

Install the following tools:

- Git
- Node.js and npm
- Docker Desktop
- Visual Studio Code (recommended)

### Clone the repository

```powershell
git clone https://github.com/ssquadri/APAC-Time-Zone-Converter-Tool.git
cd APAC-Time-Zone-Converter-Tool
```

### Install dependencies

```powershell
npm ci
```

### Run quality checks

```powershell
npm test
npm run lint
npm run validate:html
```

### Build and run the Docker image

```powershell
docker build -t apac-timezone-converter:latest .
docker run -d -p 8080:80 --name apac-timezone-app apac-timezone-converter:latest
```

Visit http://localhost:8080.

If a container with the same name already exists, stop or remove that container before creating another one with the same name.

## 13. Validation and Results

The initial automated pipeline run completed successfully.

The observed results included:

- Unit tests passed.
- ESLint passed.
- HTML validation passed.
- Docker image build and Docker Hub push completed.
- Render Deploy Hook request succeeded.
- Render showed the subsequent deployment as Live.
- The public application loaded successfully.

These results establish that the configured workflow can execute the quality checks, publish a container image, and trigger a Render deployment.

A further code-change test can verify that a new application change appears on the live website after a subsequent pipeline run.

## 14. Screenshots and Implementation Walkthrough

The repository documentation will include a chronological, 70-screenshot walkthrough of the project.

The screenshots will cover the implementation from the initial setup through Docker installation, container creation, Docker Hub publishing, GitHub Actions configuration, secrets management, Render deployment, and the live application.

**Screenshot gallery:** To be added in the next documentation update.

The screenshots will be stored in a dedicated `screenshots/` directory and linked from this README in implementation order, from Screenshot 1 through Screenshot 70.

## 15. Future Improvements

Potential next steps include:

- Verify a new code change flows through the complete pipeline and appears on the live website.
- Separate quality checks from image publishing using reusable jobs or workflow dependencies.
- Deploy immutable commit-SHA image tags rather than relying only on `latest`.
- Add a deployment health check and post-deployment smoke test.
- Improve build efficiency with Docker layer caching.
- Add automated security scanning for dependencies and container images.
- Add a staging environment before production deployment.
- Consider automated rollback procedures for unhealthy deployments.

## 16. Author

**Syed S. Quadri**

Cloud and DevOps portfolio project focused on practical containerization, automated quality checks, Docker image publishing, and cloud deployment.

- GitHub: https://github.com/ssquadri
- Portfolio: https://ssquadri.github.io/SSQ/

---

*This project was built as a hands-on learning exercise to understand the practical workflow from source code to a deployed containerized application.*


## 14. Project Implementation Screenshots

The following screenshots document the project step by step, from the initial setup to the live deployment on Render.

### Screenshot 1
![Screenshot 1](screenshots/d%20(1).png)

### Screenshot 2
![Screenshot 2](screenshots/d%20(2).png)

### Screenshot 3
![Screenshot 3](screenshots/d%20(3).png)

### Screenshot 4
![Screenshot 4](screenshots/d%20(4).png)

### Screenshot 5
![Screenshot 5](screenshots/d%20(5).png)

### Screenshot 6
![Screenshot 6](screenshots/d%20(6).png)

### Screenshot 7
![Screenshot 7](screenshots/d%20(7).png)

### Screenshot 8
![Screenshot 8](screenshots/d%20(8).png)

### Screenshot 9
![Screenshot 9](screenshots/d%20(9).png)

### Screenshot 10
![Screenshot 10](screenshots/d%20(10).png)

### Screenshot 11
![Screenshot 11](screenshots/d%20(11).png)

### Screenshot 12
![Screenshot 12](screenshots/d%20(12).png)

### Screenshot 13
![Screenshot 13](screenshots/d%20(13).png)

### Screenshot 14
![Screenshot 14](screenshots/d%20(14).png)

### Screenshot 15
![Screenshot 15](screenshots/d%20(15).png)

### Screenshot 16
![Screenshot 16](screenshots/d%20(16).png)

### Screenshot 17
![Screenshot 17](screenshots/d%20(17).png)

### Screenshot 18
![Screenshot 18](screenshots/d%20(18).png)

### Screenshot 19
![Screenshot 19](screenshots/d%20(19).png)

### Screenshot 20
![Screenshot 20](screenshots/d%20(20).png)

### Screenshot 21
![Screenshot 21](screenshots/d%20(21).png)

### Screenshot 22
![Screenshot 22](screenshots/d%20(22).png)

### Screenshot 23
![Screenshot 23](screenshots/d%20(23).png)

### Screenshot 24
![Screenshot 24](screenshots/d%20(24).png)

### Screenshot 25
![Screenshot 25](screenshots/d%20(25).png)

### Screenshot 26
![Screenshot 26](screenshots/d%20(26).png)

### Screenshot 27
![Screenshot 27](screenshots/d%20(27).png)

### Screenshot 28
![Screenshot 28](screenshots/d%20(28).png)

### Screenshot 29
![Screenshot 29](screenshots/d%20(29).png)

### Screenshot 30
![Screenshot 30](screenshots/d%20(30).png)

### Screenshot 31
![Screenshot 31](screenshots/d%20(31).png)

### Screenshot 32
![Screenshot 32](screenshots/d%20(32).png)

### Screenshot 33
![Screenshot 33](screenshots/d%20(33).png)

### Screenshot 34
![Screenshot 34](screenshots/d%20(34).png)

### Screenshot 35
![Screenshot 35](screenshots/d%20(35).png)

### Screenshot 36
![Screenshot 36](screenshots/d%20(36).png)

### Screenshot 37
![Screenshot 37](screenshots/d%20(37).png)

### Screenshot 38
![Screenshot 38](screenshots/d%20(38).png)

### Screenshot 39
![Screenshot 39](screenshots/d%20(39).png)

### Screenshot 40
![Screenshot 40](screenshots/d%20(40).png)

### Screenshot 41
![Screenshot 41](screenshots/d%20(41).png)

### Screenshot 42
![Screenshot 42](screenshots/d%20(42).png)

### Screenshot 43
![Screenshot 43](screenshots/d%20(43).png)

### Screenshot 44
![Screenshot 44](screenshots/d%20(44).png)

### Screenshot 45
![Screenshot 45](screenshots/d%20(45).png)

### Screenshot 46
![Screenshot 46](screenshots/d%20(46).png)

### Screenshot 47
![Screenshot 47](screenshots/d%20(47).png)

### Screenshot 48
![Screenshot 48](screenshots/d%20(48).png)

### Screenshot 49
![Screenshot 49](screenshots/d%20(49).png)

### Screenshot 50
![Screenshot 50](screenshots/d%20(50).png)

### Screenshot 51
![Screenshot 51](screenshots/d%20(51).png)

### Screenshot 52
![Screenshot 52](screenshots/d%20(52).png)

### Screenshot 53
![Screenshot 53](screenshots/d%20(53).png)

### Screenshot 54
![Screenshot 54](screenshots/d%20(54).png)

### Screenshot 55
![Screenshot 55](screenshots/d%20(55).png)

### Screenshot 56
![Screenshot 56](screenshots/d%20(56).png)

### Screenshot 57
![Screenshot 57](screenshots/d%20(57).png)

### Screenshot 58
![Screenshot 58](screenshots/d%20(58).png)

### Screenshot 59
![Screenshot 59](screenshots/d%20(59).png)

### Screenshot 60
![Screenshot 60](screenshots/d%20(60).png)

### Screenshot 61
![Screenshot 61](screenshots/d%20(61).png)
