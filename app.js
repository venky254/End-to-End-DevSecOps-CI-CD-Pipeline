const http = require("node:http");
const https = require("node:https");

const PORT = Number(process.env.PORT || 3000);
const OWNER = "venky254";
const REPO = "End-to-End-DevSecOps-CI-CD-Pipeline";
const API_BASE = `https://api.github.com/repos/${OWNER}/${REPO}`;
let cache = { at: 0, data: null };
const startedAt = Date.now();

function githubGet(path) {
  return new Promise((resolve, reject) => {
    const req = https.get(API_BASE + path, {
      headers: {
        "Accept": "application/vnd.github+json",
        "User-Agent": "venkat-devsecops-dashboard",
        "X-GitHub-Api-Version": "2022-11-28"
      }
    }, (response) => {
      let body = "";
      response.setEncoding("utf8");
      response.on("data", chunk => body += chunk);
      response.on("end", () => {
        let parsed;
        try { parsed = JSON.parse(body); }
        catch { return reject(new Error("GitHub returned invalid JSON")); }
        if (response.statusCode < 200 || response.statusCode >= 300) {
          return reject(new Error(parsed.message || `GitHub API returned HTTP ${response.statusCode}`));
        }
        resolve(parsed);
      });
    });
    req.setTimeout(8000, () => req.destroy(new Error("GitHub API request timed out")));
    req.on("error", reject);
  });
}

async function getPipelineData() {
  if (cache.data && Date.now() - cache.at < 20000) return cache.data;

  const result = await githubGet("/actions/runs?branch=main&per_page=1");
  const run = result.workflow_runs && result.workflow_runs[0];

  if (!run) {
    const empty = {
      repository: `${OWNER}/${REPO}`,
      hasRun: false,
      checkedAt: new Date().toISOString()
    };
    cache = { at: Date.now(), data: empty };
    return empty;
  }

  let jobs = [];
  try {
    const jobsResult = await githubGet(`/actions/runs/${run.id}/jobs?per_page=100`);
    jobs = (jobsResult.jobs || []).map(job => ({
      name: job.name,
      status: job.status,
      conclusion: job.conclusion,
      steps: (job.steps || []).map(step => ({
        name: step.name,
        status: step.status,
        conclusion: step.conclusion
      }))
    }));
  } catch (error) {
    // Keep run status visible even if GitHub temporarily refuses the jobs request.
    jobs = [];
  }

  const data = {
    repository: `${OWNER}/${REPO}`,
    hasRun: true,
    workflowName: run.name,
    runNumber: run.run_number,
    runId: run.id,
    status: run.status,
    conclusion: run.conclusion,
    event: run.event,
    branch: run.head_branch,
    commit: (run.head_sha || "").slice(0, 7),
    createdAt: run.created_at,
    updatedAt: run.updated_at,
    htmlUrl: run.html_url,
    jobs,
    checkedAt: new Date().toISOString()
  };
  cache = { at: Date.now(), data };
  return data;
}

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#0b1020">
<title>Venkat | DevSecOps Control Center</title>
<style>
:root{--bg:#0b1020;--panel:#121b2e;--line:#293650;--text:#edf3ff;--muted:#91a1bd;--blue:#70a7ff;--green:#42dfae;--yellow:#ffd078;--red:#ff7d8b}
*{box-sizing:border-box}body{margin:0;min-height:100vh;color:var(--text);background:radial-gradient(ellipse at 10% 0%,#18345a 0,transparent 35%),var(--bg);font:15px/1.5 Inter,"Segoe UI",Arial,sans-serif}
a{color:var(--blue);text-decoration:none}a:hover{text-decoration:underline}.container{width:min(1180px,100% - 40px);margin:auto;padding:28px 0 40px}
.navbar{display:flex;justify-content:space-between;align-items:center;gap:18px;padding-bottom:24px;border-bottom:1px solid var(--line)}.brand{display:flex;align-items:center;gap:13px}
.logo{width:46px;height:46px;display:grid;place-items:center;border-radius:14px;background:linear-gradient(135deg,#72a8ff,#42dfae);color:#07111e;font-size:25px;font-weight:900}
.brand h1{margin:0;font-size:19px}.brand p{margin:4px 0 0;color:var(--muted);font-size:11px}.pill{padding:9px 13px;border:1px solid var(--line);border-radius:30px;color:var(--muted);background:#0e1728;font-size:12px;white-space:nowrap}
.hero{padding:42px 0 28px}.eyebrow{color:var(--green);font-size:11px;font-weight:800;letter-spacing:2px;text-transform:uppercase}.hero h2{margin:12px 0;font-size:clamp(32px,5vw,48px);line-height:1.1;letter-spacing:-1.5px}.hero p{max-width:680px;color:var(--muted);line-height:1.8}
.actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:22px}.button{display:inline-block;padding:11px 16px;border-radius:10px;font-size:13px;font-weight:700}.primary{color:#07111e;background:var(--green)}.secondary{color:var(--text);border:1px solid var(--line)}
.section-title{display:flex;justify-content:space-between;align-items:center;gap:12px;margin:30px 0 15px}.section-title h3{margin:0;font-size:17px}.section-title span{color:var(--muted);font-size:12px}
.grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:15px}.card,.panel{min-width:0;padding:20px;border:1px solid var(--line);border-radius:16px;background:linear-gradient(145deg,var(--panel),#101728)}
.card-icon{display:grid;place-items:center;width:40px;height:40px;margin-bottom:17px;border-radius:12px;background:#1d3150;color:var(--blue);font-size:20px}.card-label{color:var(--muted);font-size:12px}.card h4{margin:8px 0 5px;font-size:19px;overflow-wrap:anywhere}.card p{margin:0;color:var(--muted);font-size:12px;line-height:1.6}
.layout{display:grid;grid-template-columns:1.1fr .9fr;gap:16px}.panel h3{margin:0 0 5px;font-size:16px}.sub{margin:0 0 17px;color:var(--muted);font-size:12px}
.stage,.scan{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:15px 0;border-bottom:1px solid #263149}.stage:last-child,.scan:last-child{border-bottom:0}.stage-info,.scan-info{display:flex;align-items:center;gap:11px;min-width:0}
.stage-icon,.scan-symbol{display:grid;place-items:center;width:36px;height:36px;flex-shrink:0;border-radius:10px;background:#1c2c46;color:var(--blue);font-weight:bold}.stage strong,.scan strong{display:block;font-size:13px}.stage small,.scan small{display:block;margin-top:4px;color:var(--muted);font-size:11px}
.status{flex-shrink:0;padding:5px 8px;border-radius:30px;background:#33291b;color:var(--yellow);font-size:10px;font-weight:800}.green{background:#10352d;color:var(--green)}.blue{background:#1a2c48;color:var(--blue)}.red{background:#3b1d29;color:var(--red)}
.details{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.detail{padding:15px;border:1px solid var(--line);border-radius:11px;background:#0e1728}.detail span{display:block;color:var(--muted);font-size:11px}.detail strong{display:block;margin-top:7px;font-size:13px;overflow-wrap:anywhere}
footer{display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-top:28px;padding-top:20px;border-top:1px solid var(--line);color:var(--muted);font-size:11px}
@media(max-width:850px){.grid{grid-template-columns:repeat(2,minmax(0,1fr))}.layout{grid-template-columns:1fr}}
@media(max-width:500px){.container{width:calc(100% - 24px);padding-top:18px}.navbar{align-items:flex-start;flex-direction:column}.brand h1{font-size:16px}.grid{gap:10px}.card,.panel{padding:14px}.card h4{font-size:16px}.stage,.scan{align-items:flex-start;flex-wrap:wrap}.details{grid-template-columns:1fr}}
</style>
</head>
<body><main class="container">
<header class="navbar"><div class="brand"><div class="logo">V</div><div><h1>VENKAT<span style="color:#42dfae">.</span> DevSecOps</h1><p>CI/CD CONTROL CENTER</p></div></div><span class="pill" id="connection">● Connecting to GitHub Actions…</span></header>
<section class="hero"><div class="eyebrow">Automate · Secure · Deliver</div><h2>Your delivery pipeline,<br>in one place.</h2><p>Live workflow status from GitHub Actions, with automatic refresh. Scan details reflect the latest run and the jobs your workflow actually defines.</p><div class="actions"><a class="button primary" href="https://github.com/${OWNER}/${REPO}/actions" target="_blank" rel="noopener noreferrer">Open GitHub Actions ↗</a><a class="button secondary" href="/health">Check Application Health</a></div></section>
<div class="section-title"><h3>Latest Pipeline Run</h3><span id="lastChecked">Loading live data…</span></div>
<section class="grid">
<article class="card"><div class="card-icon">⑂</div><div class="card-label">Workflow</div><h4 id="workflowName">Loading…</h4><p id="runNumber">Fetching latest run</p></article>
<article class="card"><div class="card-icon">◉</div><div class="card-label">Overall status</div><h4 id="runStatus">Loading…</h4><p id="runConclusion">Reading GitHub result</p></article>
<article class="card"><div class="card-icon">⌘</div><div class="card-label">Branch / Commit</div><h4 id="branch">—</h4><p id="commit">Commit —</p></article>
<article class="card"><div class="card-icon">↻</div><div class="card-label">Auto refresh</div><h4>30 seconds</h4><p>Latest workflow status is polled automatically</p></article>
</section>
<div class="section-title"><h3>Workflow Jobs</h3><span>Real job states from GitHub</span></div>
<section class="layout">
<article class="panel"><h3>CI/CD Job Status</h3><p class="sub">Each badge is populated from the latest workflow run.</p><div id="jobs"><div class="stage"><div class="stage-info"><div class="stage-icon">…</div><div><strong>Loading workflow jobs</strong><small>Contacting GitHub Actions API</small></div></div><span class="status">Loading</span></div></div></article>
<article class="panel"><h3>Security Checks</h3><p class="sub">Shows actual workflow job/step status where available, not invented scan counts.</p><div id="security"><div class="scan"><div class="scan-info"><div class="scan-symbol">S</div><div><strong>Security results</strong><small>Loading from latest run</small></div></div><span class="status">Loading</span></div></div></article>
</section>
<div class="section-title"><h3>Application Details</h3><span>Runtime information</span></div>
<section class="panel"><div class="details"><div class="detail"><span>Repository</span><strong><a href="https://github.com/${OWNER}/${REPO}" target="_blank" rel="noopener noreferrer">${OWNER}/${REPO}</a></strong></div><div class="detail"><span>Docker image</span><strong>venkataramana773/venkat-devsecops-demo</strong></div><div class="detail"><span>Runtime</span><strong>Node.js HTTP server</strong></div><div class="detail"><span>Health endpoint</span><strong><a href="/health">GET /health</a></strong></div></div></section>
<footer><span>© Venkat DevSecOps · Learning by building</span><span>GitHub Actions API · Refreshes every 30 seconds</span></footer>
</main>
<script>
const $ = id => document.getElementById(id);
function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[ch]));
}
function pretty(value) {
  if (value === "in_progress" || value === "queued" || value === "waiting") return "In progress";
  if (!value) return "Pending";
  return value.replaceAll("_", " ").replace(/\b\w/g, c => c.toUpperCase());
}
function cssStatus(status, conclusion) {
  if (status === "in_progress" || status === "queued" || status === "waiting") return "status blue";
  if (conclusion === "success") return "status green";
  if (conclusion === "failure" || conclusion === "cancelled" || conclusion === "timed_out" || conclusion === "action_required") return "status red";
  return "status";
}
function badge(status, conclusion) {
  const label = status === "completed" ? pretty(conclusion || "completed") : pretty(status);
  return '<span class="' + cssStatus(status, conclusion) + '">' + esc(label) + '</span>';
}
function renderError(message) {
  $("connection").textContent = "● GitHub API unavailable";
  $("connection").style.color = "var(--yellow)";
  $("lastChecked").textContent = "Retrying automatically";
  $("jobs").innerHTML = '<div class="stage"><div class="stage-info"><div class="stage-icon">!</div><div><strong>Could not load workflow</strong><small>' + esc(message) + '</small></div></div><span class="status">Retrying</span></div>';
  $("security").innerHTML = '<div class="scan"><div><strong>Results unavailable</strong><small>GitHub API did not return data</small></div><span class="status">Unknown</span></div>';
}
async function refresh() {
  try {
    const response = await fetch("/api/pipeline", {cache:"no-store"});
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "GitHub API request failed");
    $("connection").textContent = "● Connected to GitHub Actions";
    $("connection").style.color = "var(--green)";
    $("lastChecked").textContent = "Updated " + new Date(data.checkedAt).toLocaleTimeString();

    if (!data.hasRun) {
      $("workflowName").textContent = "No runs found";
      $("runNumber").textContent = "Push to main to trigger the workflow";
      $("runStatus").textContent = "No data";
      $("runConclusion").textContent = "No workflow run returned by GitHub";
      $("jobs").innerHTML = '<div class="stage"><div><strong>No workflow runs found</strong><small>Check the Actions tab and branch filter.</small></div></div>';
      $("security").innerHTML = '<div class="scan"><div><strong>No scan data</strong><small>Run the workflow to populate results.</small></div></div>';
      return;
    }

    $("workflowName").textContent = data.workflowName || "GitHub Actions";
    $("runNumber").textContent = "Run #" + data.runNumber + " · " + pretty(data.event);
    $("runStatus").textContent = pretty(data.status === "completed" ? data.conclusion : data.status);
    $("runConclusion").textContent = data.status === "completed" ? "Run completed" : "Run is " + pretty(data.status).toLowerCase();
    $("branch").textContent = data.branch || "unknown";
    $("commit").innerHTML = 'Commit <a href="' + esc(data.htmlUrl) + '" target="_blank" rel="noopener noreferrer">' + esc(data.commit || "—") + '</a>';

    const jobs = data.jobs || [];
    $("jobs").innerHTML = jobs.length ? jobs.map(job =>
      '<div class="stage"><div class="stage-info"><div class="stage-icon">✓</div><div><strong>' + esc(job.name) + '</strong><small>' + esc(job.status === "completed" ? "Completed" : pretty(job.status)) + '</small></div></div>' + badge(job.status, job.conclusion) + '</div>'
    ).join("") : '<div class="stage"><div><strong>Job details unavailable</strong><small>Run status is available; job details could not be fetched.</small></div></div>';

    const securityTerms = /gitleaks|npm dependency|audit|trivy|docker build|security|secret scan/i;
    const securityJobs = jobs.filter(job => securityTerms.test(job.name));
    const securitySteps = jobs.flatMap(job => (job.steps || [])
      .filter(step => /trivy|audit dependencies|scan for secrets|gitleaks/i.test(step.name))
      .map(step => ({name:step.name,status:step.status,conclusion:step.conclusion,job:job.name})));
    let rows = securitySteps.map(step =>
      '<div class="scan"><div class="scan-info"><div class="scan-symbol">S</div><div><strong>' + esc(step.name) + '</strong><small>' + esc(step.job) + '</small></div></div>' + badge(step.status, step.conclusion) + '</div>'
    );
    if (!rows.length) rows = securityJobs.map(job =>
      '<div class="scan"><div class="scan-info"><div class="scan-symbol">S</div><div><strong>' + esc(job.name) + '</strong><small>Workflow job status (not vulnerability counts)</small></div></div>' + badge(job.status, job.conclusion) + '</div>'
    );
    $("security").innerHTML = rows.length ? rows.join("") : '<div class="scan"><div><strong>No matching scan steps found</strong><small>Check your workflow job and step names.</small></div><span class="status">No data</span></div>';
  } catch (error) {
    renderError(error.message || "Unknown error");
  }
}
refresh();
setInterval(refresh, 30000);
</script>
</body></html>`;

const server = http.createServer(async (req, res) => {
  const pathname = new URL(req.url, `http://${req.headers.host || "localhost"}`).pathname;

  if (req.method === "GET" && pathname === "/health") {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
    res.end(JSON.stringify({
      status: "ok",
      service: "venkat-devsecops-demo",
      uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000)
    }));
    return;
  }

  if (req.method === "GET" && pathname === "/api/pipeline") {
    try {
      const data = await getPipelineData();
      res.writeHead(200, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff"
      });
      res.end(JSON.stringify(data));
    } catch (error) {
      res.writeHead(502, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
      res.end(JSON.stringify({ error: "Unable to fetch GitHub Actions data: " + error.message }));
    }
    return;
  }

  if (req.method === "GET" && (pathname === "/" || pathname === "/index.html")) {
    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-cache",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer"
    });
    res.end(html);
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify({ error: "Not found" }));
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Venkat DevSecOps dashboard listening on port ${PORT}`);
});
