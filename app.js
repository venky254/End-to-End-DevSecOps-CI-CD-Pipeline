
const http = require("node:http");

const PORT = Number(process.env.PORT || 3000);
const startedAt = Date.now();

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#0b1020">
  <meta name="description" content="Venkat's DevSecOps CI/CD Dashboard">
  <title>Venkat | DevSecOps Dashboard</title>

  <style>
    :root {
      --bg: #0b1020;
      --panel: #121b2e;
      --panel2: #17233a;
      --border: #293650;
      --text: #edf3ff;
      --muted: #91a1bd;
      --blue: #70a7ff;
      --green: #42dfae;
      --yellow: #ffd078;
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      min-height: 100vh;
      color: var(--text);
      background:
        radial-gradient(ellipse at 10% 0%, #18345a 0, transparent 35%),
        var(--bg);
      font-family: Inter, "Segoe UI", Arial, sans-serif;
    }

    a { color: var(--blue); text-decoration: none; }
    a:hover { text-decoration: underline; }

    .container {
      width: min(1180px, 100% - 40px);
      margin: auto;
      padding: 28px 0 40px;
    }

    .navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 18px;
      padding-bottom: 24px;
      border-bottom: 1px solid var(--border);
    }

    .brand { display: flex; align-items: center; gap: 13px; }

    .logo {
      width: 46px;
      height: 46px;
      display: grid;
      place-items: center;
      border-radius: 14px;
      background: linear-gradient(135deg, #72a8ff, #42dfae);
      color: #07111e;
      font-size: 25px;
      font-weight: 900;
    }

    .brand h1 { margin: 0; font-size: 19px; }
    .brand p { margin: 4px 0 0; color: var(--muted); font-size: 11px; }

    .health-badge {
      padding: 9px 13px;
      border: 1px solid #285e50;
      border-radius: 30px;
      color: var(--green);
      background: #102d29;
      font-size: 12px;
      white-space: nowrap;
    }

    .hero { padding: 42px 0 28px; }

    .eyebrow {
      color: var(--green);
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 2px;
      text-transform: uppercase;
    }

    .hero h2 {
      margin: 12px 0;
      font-size: clamp(32px, 5vw, 48px);
      line-height: 1.1;
      letter-spacing: -1.5px;
    }

    .hero p {
      max-width: 650px;
      color: var(--muted);
      line-height: 1.8;
    }

    .actions { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 22px; }

    .button {
      display: inline-block;
      padding: 11px 16px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 700;
    }

    .button-primary { color: #07111e; background: var(--green); }
    .button-secondary { color: var(--text); border: 1px solid var(--border); }

    .section-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      margin: 30px 0 15px;
    }

    .section-title h3 { margin: 0; font-size: 17px; }
    .section-title span { color: var(--muted); font-size: 12px; }

    .grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 15px;
    }

    .card {
      min-width: 0;
      padding: 20px;
      border: 1px solid var(--border);
      border-radius: 16px;
      background: linear-gradient(145deg, var(--panel), #101728);
    }

    .card-label { color: var(--muted); font-size: 12px; }

    .card-icon {
      display: grid;
      place-items: center;
      width: 40px;
      height: 40px;
      margin-bottom: 17px;
      border-radius: 12px;
      background: #1d3150;
      color: var(--blue);
      font-size: 20px;
    }

    .card h4 { margin: 8px 0 5px; font-size: 19px; overflow-wrap: anywhere; }
    .card p { margin: 0; color: var(--muted); font-size: 12px; line-height: 1.6; }

    .layout {
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: 16px;
    }

    .panel {
      padding: 22px;
      border: 1px solid var(--border);
      border-radius: 16px;
      background: var(--panel);
    }

    .panel h3 { margin: 0 0 5px; font-size: 16px; }
    .panel-subtitle { margin-bottom: 17px !important; color: var(--muted); font-size: 12px; }

    .stage, .scan {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 15px 0;
      border-bottom: 1px solid #263149;
    }

    .stage:last-child, .scan:last-child { border-bottom: 0; }

    .stage-info, .scan-info { display: flex; align-items: center; gap: 11px; min-width: 0; }

    .stage-icon {
      display: grid;
      place-items: center;
      width: 36px;
      height: 36px;
      flex-shrink: 0;
      border-radius: 10px;
      background: #1c2c46;
      color: var(--blue);
      font-weight: bold;
    }

    .stage strong, .scan strong { display: block; font-size: 13px; }
    .stage small, .scan small { display: block; margin-top: 4px; color: var(--muted); font-size: 11px; }

    .status {
      flex-shrink: 0;
      padding: 5px 8px;
      border-radius: 30px;
      background: #33291b;
      color: var(--yellow);
      font-size: 10px;
      font-weight: 800;
    }

    .status-green { background: #10352d; color: var(--green); }
    .status-blue { background: #1a2c48; color: var(--blue); }

    .scan-symbol {
      display: grid;
      place-items: center;
      width: 34px;
      height: 34px;
      flex-shrink: 0;
      border-radius: 10px;
      background: #1c2c46;
      color: var(--blue);
      font-weight: 800;
    }

    .details {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
    }

    .detail {
      padding: 15px;
      border: 1px solid var(--border);
      border-radius: 11px;
      background: #0e1728;
    }

    .detail span { display: block; color: var(--muted); font-size: 11px; }
    .detail strong { display: block; margin-top: 7px; font-size: 13px; overflow-wrap: anywhere; }

    footer {
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 28px;
      padding-top: 20px;
      border-top: 1px solid var(--border);
      color: var(--muted);
      font-size: 11px;
    }

    @media (max-width: 850px) {
      .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .layout { grid-template-columns: 1fr; }
    }

    @media (max-width: 500px) {
      .container { width: calc(100% - 24px); padding-top: 18px; }
      .navbar { align-items: flex-start; }
      .brand h1 { font-size: 16px; }
      .health-badge { font-size: 10px; }
      .grid { gap: 10px; }
      .card, .panel { padding: 14px; }
      .card h4 { font-size: 16px; }
      .stage, .scan { align-items: flex-start; flex-wrap: wrap; }
      .status { margin-left: 45px; }
      .details { grid-template-columns: 1fr; }
    }
  </style>
</head>

<body>
  <main class="container">
    <header class="navbar">
      <div class="brand">
        <div class="logo">V</div>
        <div>
          <h1>VENKAT<span style="color:#42dfae">.</span> DevSecOps</h1>
          <p>CI/CD CONTROL CENTER</p>
        </div>
      </div>
      <div class="health-badge">● APPLICATION ONLINE</div>
    </header>

    <section class="hero">
      <div class="eyebrow">Automate · Secure · Deliver</div>
      <h2>Welcome to your<br>DevSecOps dashboard.</h2>
      <p>
        A single place to showcase your CI/CD workflow, container publishing
        and security tooling. Connect workflow results to display real scan
        outcomes and deployment status.
      </p>
      <div class="actions">
        <a class="button button-primary"
           href="https://github.com/venky254/End-to-End-DevSecOps-CI-CD-Pipeline"
           target="_blank" rel="noopener noreferrer">View GitHub Repository ↗</a>
        <a class="button button-secondary" href="/health">Check Application Health</a>
      </div>
    </section>

    <div class="section-title">
      <h3>Project Overview</h3>
      <span>DevSecOps toolchain</span>
    </div>

    <section class="grid">
      <article class="card">
        <div class="card-icon">⑂</div>
        <div class="card-label">Automation</div>
        <h4>GitHub Actions</h4>
        <p>Automated CI/CD workflow</p>
      </article>
      <article class="card">
        <div class="card-icon">▣</div>
        <div class="card-label">Containerization</div>
        <h4>Docker</h4>
        <p>Build and package application images</p>
      </article>
      <article class="card">
        <div class="card-icon">⌑</div>
        <div class="card-label">Image security</div>
        <h4>Trivy</h4>
        <p>Scan container images for vulnerabilities</p>
      </article>
      <article class="card">
        <div class="card-icon">◈</div>
        <div class="card-label">Secret detection</div>
        <h4>Gitleaks</h4>
        <p>Check repositories for exposed secrets</p>
      </article>
    </section>

    <div class="section-title">
      <h3>Pipeline & Security</h3>
      <span>Demo status — not live scan results</span>
    </div>

    <section class="layout">
      <article class="panel">
        <h3>CI/CD Workflow</h3>
        <p class="panel-subtitle">Typical stages in the delivery process</p>

        <div class="stage">
          <div class="stage-info">
            <div class="stage-icon">01</div>
            <div><strong>Source Code</strong><small>GitHub repository</small></div>
          </div>
          <span class="status status-blue">Configured</span>
        </div>

        <div class="stage">
          <div class="stage-info">
            <div class="stage-icon">02</div>
            <div><strong>Build & Test</strong><small>Execute workflow checks</small></div>
          </div>
          <span class="status">Not connected</span>
        </div>

        <div class="stage">
          <div class="stage-info">
            <div class="stage-icon">03</div>
            <div><strong>Security Scanning</strong><small>Run configured security tools</small></div>
          </div>
          <span class="status">Awaiting results</span>
        </div>

        <div class="stage">
          <div class="stage-info">
            <div class="stage-icon">04</div>
            <div><strong>Docker Publishing</strong><small>Push image to Docker Hub</small></div>
          </div>
          <span class="status">Awaiting results</span>
        </div>
      </article>

      <article class="panel">
        <h3>Security Scan Summary</h3>
        <p class="panel-subtitle">Results are shown as unavailable until connected</p>

        <div class="scan">
          <div class="scan-info">
            <div class="scan-symbol">T</div>
            <div><strong>Trivy</strong><small>Container vulnerability scan</small></div>
          </div>
          <span class="status">No data</span>
        </div>

        <div class="scan">
          <div class="scan-info">
            <div class="scan-symbol">G</div>
            <div><strong>Gitleaks</strong><small>Secret detection</small></div>
          </div>
          <span class="status">No data</span>
        </div>

        <div class="scan">
          <div class="scan-symbol">N</div>
          <div><strong>npm audit</strong><small>Dependency security</small></div>
          <span class="status">No data</span>
        </div>

        <div class="scan">
          <div class="scan-symbol">S</div>
          <div><strong>SonarQube</strong><small>Code quality, if configured</small></div>
          <span class="status">No data</span>
        </div>
      </article>
    </section>

    <div class="section-title">
      <h3>Application Details</h3>
      <span>Runtime information</span>
    </div>

    <section class="panel">
      <div class="details">
        <div class="detail">
          <span>Application</span>
          <strong>Venkat DevSecOps CI/CD Demo</strong>
        </div>
        <div class="detail">
          <span>Runtime</span>
          <strong>Node.js HTTP Server</strong>
        </div>
        <div class="detail">
          <span>Docker Image</span>
          <strong>venkataramana773/venkat-devsecops-demo</strong>
        </div>
        <div class="detail">
          <span>Health Endpoint</span>
          <strong><a href="/health">GET /health</a></strong>
        </div>
      </div>
    </section>

    <footer>
      <span>© Venkat DevSecOps · Built for learning and demonstration</span>
      <span>Security results require pipeline integration.</span>
    </footer>
  </main>
</body>
</html>`;

const server = http.createServer((req, res) => {
  const pathname = new URL(
    req.url,
    `http://${req.headers.host || "localhost"}`
  ).pathname;

  if (req.method === "GET" && pathname === "/health") {
    res.writeHead(200, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    });

    res.end(JSON.stringify({
      status: "ok",
      service: "venkat-devsecops-demo",
      uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
    }));
    return;
  }

  if (req.method === "GET" &&
      (pathname === "/" || pathname === "/index.html")) {
    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-cache",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
    });
    res.end(html);
    return;
  }

  res.writeHead(404, {
    "Content-Type": "application/json; charset=utf-8",
  });
  res.end(JSON.stringify({ error: "Not found" }));
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Venkat DevSecOps dashboard listening on port ${PORT}`);
});
