import "./App.css";
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import EvidenceABI from "./EvidenceVault.json";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

interface EvidenceRecord {
  hash: string;
  timestamp: string;
  uploader: string;
}

function App() {
  const [hash, setHash] = useState("");
  const [status, setStatus] = useState("");
  const [records, setRecords] = useState<EvidenceRecord[]>([]);
  const [loading, setLoading] = useState(false);

  async function requestAccount() {
    await window.ethereum.request({ method: "eth_requestAccounts" });
  }

  async function storeEvidence() {
    if (!hash) return;
    if (typeof window.ethereum !== "undefined") {
      await requestAccount();
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        EvidenceABI.abi,
        signer
      );

      try {
        const transaction = await contract.storeEvidence(hash);
        setStatus("Processing...");
        await transaction.wait();
        setStatus("Evidence successfully stored on-chain!");
      } catch (err) {
        console.error(err);
        setStatus("Error storing evidence.");
      }
    }
  }

  // Function to fetch all evidence from the chain
  const fetchAllEvidence = async () => {
    if (!window.ethereum) return;
    setLoading(true);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        EvidenceABI.abi,
        provider
      );

      // 1. Get all stored hashes
      const hashes: string[] = await contract.getAllHashes();

      // 2. Fetch details for each hash (in parallel)
      const details = await Promise.all(
        hashes.map(async (h: string) => {
          const data = await contract.getEvidence(h);
          return {
            hash: data[0],
            timestamp: new Date(Number(data[1]) * 1000).toLocaleString(),
            uploader: data[2],
          };
        })
      );

      setRecords(details.reverse()); // Show newest first
    } catch (err) {
      console.error("Error fetching evidence:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on load
  useEffect(() => {
    fetchAllEvidence();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <header style={{ marginBottom: "40px" }}>
        <h1 style={{ fontSize: "2.5rem", margin: "0" }}>
          Evidence<span style={{ color: "var(--accent)" }}>Vault</span>
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          Secure On-Chain Hash Verification
        </p>
      </header>
      <div className="card">
        <h3>Store New Evidence</h3>
        <input
          placeholder="Enter File Hash (e.g. IPFS CID)"
          onChange={(e) => setHash(e.target.value)}
        />
        <button onClick={storeEvidence} disabled={loading}>
          {loading ? "Confirming..." : "Upload to Blockchain"}
        </button>
        {status && (
          <p
            style={{
              color: "var(--success)",
              marginTop: "15px",
              fontSize: "14px",
            }}
          >
            {status}
          </p>
        )}
      </div>

      <div className="card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3>On-Chain Records</h3>
          <button
            onClick={fetchAllEvidence}
            style={{ padding: "8px 16px", fontSize: "12px" }}
          >
            {loading ? "Refreshing..." : "Refresh List"}
          </button>
        </div>

        <table>
          <thead>
            <tr>
              <th>File Hash</th>
              <th>Timestamp</th>
              <th>Uploader</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r, i) => (
              <tr key={i}>
                <td>
                  <span className="mono-hash">{r.hash}</span>
                </td>
                <td className="timestamp-cell">
                  <div className="badge-verified">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    {r.timestamp}
                  </div>
                </td>
                <td>
                  <span className="address-tag">
                    {r.uploader.slice(0, 6)}...{r.uploader.slice(-4)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
