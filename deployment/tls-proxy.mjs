import https from "node:https";
import http from "node:http";
import fs from "node:fs";

const server = https.createServer(
  {
    key: fs.readFileSync("/run/tls/key.pem"),
    cert: fs.readFileSync("/run/tls/cert.pem"),
    minVersion: "TLSv1.2",
  },
  (request, response) => {
    const upstream = http.request(
      {
        hostname: "frontend",
        port: 3000,
        method: request.method,
        path: request.url,
        headers: {
          ...request.headers,
          "x-forwarded-proto": "https",
          "x-forwarded-host": request.headers.host,
        },
      },
      (result) => {
        response.writeHead(result.statusCode ?? 502, result.headers);
        result.pipe(response);
        result.on("error", () => response.destroy());
      },
    );
    upstream.on("error", () => {
      if (!response.headersSent) response.writeHead(502);
      response.end("Frontend unavailable");
    });
    upstream.setTimeout(120_000, () => upstream.destroy());
    request.on("aborted", () => upstream.destroy());
    request.pipe(upstream);
  },
);

server.listen(8443, "0.0.0.0");
