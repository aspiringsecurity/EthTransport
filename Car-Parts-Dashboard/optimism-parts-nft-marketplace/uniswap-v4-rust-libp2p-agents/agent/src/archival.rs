use anyhow::{bail, Result};
use chrono::Utc;
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use std::time::Duration;

const DEFAULT_SIDECAR_URL: &str = "http://localhost:3001";

/// A structured log entry for Filecoin archival.
/// Only state-defining artifacts: finalized swaps and identity attestations.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum LogEntry {
    SwapExecuted {
        agent: String,
        direction: String,
        amount: String,
        tx_hash: String,
        timestamp: String,
    },
    IdentityAttestation {
        peer_id: String,
        eoa: String,
        verified: bool,
        timestamp: String,
    },
}

impl LogEntry {
    pub fn swap_executed(agent: &str, direction: &str, amount: &str, tx_hash: &str) -> Self {
        Self::SwapExecuted {
            agent: agent.to_string(),
            direction: direction.to_string(),
            amount: amount.to_string(),
            tx_hash: tx_hash.to_string(),
            timestamp: Utc::now().to_rfc3339(),
        }
    }

    pub fn identity_attestation(peer_id: &str, eoa: &str, verified: bool) -> Self {
        Self::IdentityAttestation {
            peer_id: peer_id.to_string(),
            eoa: eoa.to_string(),
            verified,
            timestamp: Utc::now().to_rfc3339(),
        }
    }
}

/// CID link object: `{"/": "baf..."}` (CBOR/IPLD convention)
#[derive(Debug, Deserialize)]
pub struct CidLink {
    #[serde(rename = "/")]
    pub cid: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SidecarResponse {
    pub piece_cid: CidLink,
}

#[derive(Debug, Deserialize)]
pub struct RetrieveResponse {
    #[serde(rename = "pieceCid")]
    pub piece_cid: String,
    pub data: serde_json::Value,
}

/// Buffers log entries in-memory and flushes to Filecoin via the Node.js sidecar.
#[derive(Clone, Debug)]
pub struct LogArchiver {
    buffer: Arc<Mutex<Vec<LogEntry>>>,
    sidecar_url: String,
}

impl LogArchiver {
    pub fn new() -> Self {
        let sidecar_url =
            std::env::var("SIDECAR_URL").unwrap_or_else(|_| DEFAULT_SIDECAR_URL.to_string());
        Self {
            buffer: Arc::new(Mutex::new(Vec::new())),
            sidecar_url,
        }
    }

    pub fn log(&self, entry: LogEntry) {
        if let Ok(mut buf) = self.buffer.lock() {
            buf.push(entry);
        }
    }

    pub fn buffer_len(&self) -> usize {
        self.buffer.lock().map(|buf| buf.len()).unwrap_or(0)
    }

    pub fn sidecar_url(&self) -> &str {
        &self.sidecar_url
    }

    /// Serialize buffer as JSON array, POST to sidecar, return PieceCID.
    pub async fn flush(&self) -> Result<String> {
        let entries: Vec<LogEntry> = {
            let mut buf = self.buffer.lock().map_err(|e| anyhow::anyhow!("{e}"))?;
            if buf.is_empty() {
                bail!("Nothing to archive — log buffer is empty");
            }
            buf.drain(..).collect()
        };

        let json = serde_json::to_string(&entries)?;

        // Filecoin on-chain commits can take ~90s; keep connect timeout short
        let client = reqwest::Client::builder()
            .connect_timeout(Duration::from_secs(5))
            .timeout(Duration::from_secs(180))
            .build()?;
        let resp = client
            .post(format!("{}/upload", self.sidecar_url))
            .header("Content-Type", "application/json")
            .body(json)
            .send()
            .await?;

        if !resp.status().is_success() {
            let status = resp.status();
            let body = resp.text().await.unwrap_or_default();
            bail!("Sidecar returned {status}: {body}");
        }

        let result: SidecarResponse = resp.json().await?;
        Ok(result.piece_cid.cid)
    }

    /// Retrieve archived data from Filecoin via the sidecar.
    pub async fn retrieve(&self, piece_cid: &str) -> Result<RetrieveResponse> {
        let client = reqwest::Client::builder()
            .connect_timeout(Duration::from_secs(5))
            .timeout(Duration::from_secs(180))
            .build()?;
        let resp = client
            .get(format!("{}/retrieve/{}", self.sidecar_url, piece_cid))
            .send()
            .await?;

        if !resp.status().is_success() {
            let status = resp.status();
            let body = resp.text().await.unwrap_or_default();
            bail!("Sidecar returned {status}: {body}");
        }

        let result: RetrieveResponse = resp.json().await?;
        Ok(result)
    }
}

/// Serialize multiple LogEntry values as newline-delimited JSON.
#[cfg(test)]
pub fn to_ndjson(entries: &[LogEntry]) -> std::result::Result<String, serde_json::Error> {
    let lines = entries
        .iter()
        .map(serde_json::to_string)
        .collect::<std::result::Result<Vec<_>, _>>()?;
    Ok(lines.join("\n"))
}
