import "dotenv/config";
import express from "express";
import { Synapse, calibration } from "@filoz/synapse-sdk";
import { privateKeyToAccount } from "viem/accounts";
import { CID } from "multiformats/cid";

const PORT = process.env.SIDECAR_PORT || 3001;
// Accept key with or without 0x prefix (matches Ethereum .env convention)
const RAW_KEY = process.env.FILECOIN_PRIVATE_KEY;
const PRIVATE_KEY = RAW_KEY
  ? RAW_KEY.startsWith("0x") ? RAW_KEY : `0x${RAW_KEY}`
  : null;

const app = express();
app.use(express.json({ limit: "10mb" }));

let synapse = null;

function initSynapse() {
  if (!PRIVATE_KEY) {
    console.warn("[sidecar] FILECOIN_PRIVATE_KEY not set — uploads will fail");
    return;
  }
  try {
    const account = privateKeyToAccount(PRIVATE_KEY);
    synapse = Synapse.create({ chain: calibration, account });
    console.log(
      `[sidecar] Synapse SDK initialized (Calibration testnet, account: ${account.address})`
    );
  } catch (err) {
    console.error("[sidecar] Failed to initialize Synapse SDK:", err.message);
  }
}

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    configured: synapse !== null,
  });
});

app.post("/upload", async (req, res) => {
  if (!synapse) {
    return res
      .status(503)
      .json({ error: "Synapse SDK not initialized — check FILECOIN_PRIVATE_KEY" });
  }

  const body = req.body;
  if (!body || (typeof body === "object" && Object.keys(body).length === 0)) {
    return res.status(400).json({ error: "Empty request body" });
  }

  try {
    const payload = typeof body === "string" ? body : JSON.stringify(body);
    // Synapse SDK requires minimum 127 bytes; pad small payloads
    const padded = payload.length < 127 ? payload.padEnd(127) : payload;
    const buffer = new TextEncoder().encode(padded);
    const result = await synapse.storage.upload(new Uint8Array(buffer));

    console.log(`[sidecar] Uploaded ${buffer.length} bytes → PieceCID: ${result.pieceCid}`);
    res.json({ pieceCid: result.pieceCid });
  } catch (err) {
    // Extract concise "Details:" line from verbose RPC errors
    const details = err.message.match(/Details:\s*(.+)/)?.[1];
    const short = details || err.message.split("\n")[0];
    console.error("[sidecar] Upload failed:", short);
    res.status(500).json({ error: short });
  }
});

app.get("/retrieve/:pieceCid", async (req, res) => {
  if (!synapse) {
    return res
      .status(503)
      .json({ error: "Synapse SDK not initialized — check FILECOIN_PRIVATE_KEY" });
  }

  const { pieceCid } = req.params;
  if (!pieceCid) {
    return res.status(400).json({ error: "Missing pieceCid parameter" });
  }

  try {
    const cid = CID.parse(pieceCid);
    const data = await synapse.storage.download({ pieceCid: cid });
    const text = new TextDecoder().decode(data).trim();
    console.log(`[sidecar] Retrieved ${data.length} bytes for PieceCID: ${pieceCid}`);

    // Try to parse as JSON for pretty response
    try {
      const parsed = JSON.parse(text);
      res.json({ pieceCid, data: parsed });
    } catch {
      res.json({ pieceCid, data: text });
    }
  } catch (err) {
    const details = err.message.match(/Details:\s*(.+)/)?.[1];
    const short = details || err.message.split("\n")[0];
    console.error("[sidecar] Retrieve failed:", short);
    res.status(500).json({ error: short });
  }
});

app.get("/view/:pieceCid", async (req, res) => {
  const { pieceCid } = req.params;

  if (!synapse) {
    return res.status(503).send("Synapse SDK not initialized");
  }

  try {
    const cid = CID.parse(pieceCid);
    const data = await synapse.storage.download({ pieceCid: cid });
    const text = new TextDecoder().decode(data).trim();
    let parsed;
    try { parsed = JSON.parse(text); } catch { parsed = text; }
    const entries = Array.isArray(parsed) ? parsed : [parsed];

    const rows = entries.map((e) => {
      if (e.type === "SwapExecuted") {
        return `<tr>
          <td><span style="background:#3b82f6;color:#fff;padding:2px 8px;border-radius:4px;font-size:12px">SWAP</span></td>
          <td><code>${e.agent || ""}</code></td>
          <td>${e.direction || ""}</td>
          <td>${e.amount || ""}</td>
          <td><code style="font-size:12px">${e.tx_hash || ""}</code></td>
          <td>${e.timestamp || ""}</td>
        </tr>`;
      }
      if (e.type === "IdentityAttestation") {
        return `<tr>
          <td><span style="background:#10b981;color:#fff;padding:2px 8px;border-radius:4px;font-size:12px">IDENTITY</span></td>
          <td><code>${e.peer_id || ""}</code></td>
          <td colspan="2">${e.eoa || ""}</td>
          <td>${e.verified ? "Verified" : "Rejected"}</td>
          <td>${e.timestamp || ""}</td>
        </tr>`;
      }
      return `<tr><td colspan="6"><pre>${JSON.stringify(e, null, 2)}</pre></td></tr>`;
    }).join("\n");

    res.send(`<!DOCTYPE html>
<html><head>
  <title>Filecoin Archive — ${pieceCid.slice(0, 20)}...</title>
  <style>
    body { font-family: -apple-system, system-ui, sans-serif; max-width: 1100px; margin: 40px auto; padding: 0 20px; background: #0f172a; color: #e2e8f0; }
    h1 { font-size: 20px; color: #38bdf8; }
    .cid { font-family: monospace; font-size: 13px; background: #1e293b; padding: 8px 12px; border-radius: 6px; word-break: break-all; margin: 12px 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th { text-align: left; padding: 8px 12px; background: #1e293b; color: #94a3b8; font-size: 13px; }
    td { padding: 8px 12px; border-bottom: 1px solid #1e293b; font-size: 14px; }
    code { font-size: 12px; color: #94a3b8; }
    .meta { color: #64748b; font-size: 13px; margin-top: 24px; }
  </style>
</head><body>
  <h1>Filecoin Archived Logs</h1>
  <div class="cid">PieceCID: ${pieceCid}</div>
  <p style="color:#64748b;font-size:13px">${entries.length} log ${entries.length === 1 ? "entry" : "entries"} &middot; Filecoin Calibration testnet</p>
  <table>
    <tr><th>Type</th><th>Agent / Peer</th><th>Direction</th><th>Amount</th><th>Tx / Status</th><th>Timestamp</th></tr>
    ${rows}
  </table>
  <p class="meta">Retrieved via Synapse SDK from Filecoin storage</p>
</body></html>`);
  } catch (err) {
    const details = err.message.match(/Details:\s*(.+)/)?.[1];
    const short = details || err.message.split("\n")[0];
    res.status(500).send(`<h1>Retrieve failed</h1><p>${short}</p>`);
  }
});

app.listen(PORT, () => {
  console.log(`[sidecar] Listening on http://localhost:${PORT}`);
  initSynapse();
});
