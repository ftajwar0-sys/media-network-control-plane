        const http = require("http");

let nodes = [];
let metrics = {
  totalRouted: 0,
  totalFailed: 0
};


function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => (body += chunk));
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });

}

const server = http.createServer(async (req, res) => {
  const { method, url } = req;

  // Health check
  if (method === "GET" && url === "/") {
    return sendJSON(res, 200, { message: "Media Network Control Plane is running" });
  }

  // Register node
  if (method === "POST" && url === "/nodes") {
    try {
      const body = await readBody(req);
      const data = JSON.parse(body);

      if (!data.id || typeof data.capacity !== "number") {
        return sendJSON(res, 400, { error: "id and numeric capacity are required" });
      }

      const node = {
        id: data.id,
        capacity: data.capacity,
        currentLoad: 0,
        active: true,
      };

      nodes.push(node);
      return sendJSON(res, 201, { message: "Node registered", node });
    } catch (e) {
      return sendJSON(res, 400, { error: "Invalid JSON body" });
    }
  }

  // List nodes
  if (method === "GET" && url === "/nodes") {
    return sendJSON(res, 200, { nodes });
  }

  // Route a request (least-load)
  if (method === "POST" && url === "/route") {
    const available = nodes.filter(n => n.active && n.currentLoad < n.capacity);
  if (available.length === 0) {
   metrics.totalFailed += 1;
   return sendJSON(res, 503, { error: "No available nodes" });
  }


   const selected = available[0];
   selected.currentLoad += 1;
   metrics.totalRouted += 1;


    return sendJSON(res, 200, {
      routedTo: selected.id,
      currentLoad: selected.currentLoad,
      strategy: "least_load",
    });
  }
  // Metrics
if (method === "GET" && url === "/metrics") {
  return sendJSON(res, 200, {
    totalRouted: metrics.totalRouted,
    totalFailed: metrics.totalFailed,
    nodes: nodes.map(n => ({
      id: n.id,
      active: n.active,
      currentLoad: n.currentLoad,
      capacity: n.capacity
    }))
  });
}


  // Not found
  return sendJSON(res, 404, { error: "Not Found" });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

