const http = require("node:http");

const port = Number(process.env.PORT || 3000);

const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }

  res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
  res.end(`<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Venkat DevSecOps Demo</title></head>
<body style="font-family:Arial,sans-serif;max-width:760px;margin:4rem auto;padding:0 1rem">
<h1>Venkat's DevSecOps CI/CD Demo</h1>
<p>Deployed through GitHub Actions.</p>
<p>Health endpoint: <a href="/health">/health</a></p>
</body></html>`);
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Application listening on port ${port}`);
});
