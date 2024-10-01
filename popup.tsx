import React, {useEffect, useState} from "react";
import riftImage from "data-base64:~assets/rift.svg";
import {getWallets} from "./background/db";
import "./popup.css";
import {getAddress} from "~background/mempoolApi";
import {MEMPOOL_HOST} from "~background/rift";

const IndexPopup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [dumpAddress, setDumpAddress] = useState("");
  const [satsBalance, setSatsBalance] = useState(0);
  console.log("RIFT RIFT Popup mounted");

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      const wallets = await getWallets();
      const blob = new Blob([JSON.stringify(wallets, null, 2)], {type: "application/json"});
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "wallets.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading wallets:", error);
    } finally {
      setIsLoading(false);
    }

  };

  const aggregateWalletBal = async () => {
    const wallets = await getWallets();
    console.log("Wallets:", wallets);
    let address_states = await Promise.all(wallets.map(async (wallet) => {
      let address_state = await getAddress(wallet.address, MEMPOOL_HOST);
      console.log("Address state:", address_state);
      return address_state;
    }));

    let total = address_states.reduce((acc, address_state) => acc +
      (address_state.chain_stats.funded_txo_sum - address_state.chain_stats.spent_txo_sum) +
      (address_state.mempool_stats.funded_txo_sum - address_state.mempool_stats.spent_txo_sum),
      0
    );
    console.log("Total balance:", total);
    setSatsBalance(total);
  }

  useEffect(() => {
    console.log("RIFT RIFT Popup mounted");
    aggregateWalletBal();
  }, [])


  return (
    <div
      style={{
        backgroundColor: "black",
        width: "300px",
        height: "400px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px 0",
        color: "white"
      }}
    >
      <div style={{flex: 1}} /> {/* Top spacer */}
      <img src={riftImage} alt="Rift" width="84px" height="20px" />

      {/* Balance div */}
      <div style={{marginTop: "20px", fontSize: "24px", fontWeight: "bold"}}>
        Balance: {satsBalance} sats
      </div>

      <div style={{flex: 1}} /> {/* Bottom spacer */}

      <button
        onClick={handleDownload}
        disabled={isLoading}
        style={{
          backgroundColor: "white",
          color: "black",
          border: "none",
          padding: "10px 20px",
          cursor: "pointer",
          width: "80%",
          maxWidth: "200px"
        }}
      >
        {isLoading ? "Downloading..." : "Download Wallets"}
      </button>
    </div>
  );
}

export default IndexPopup;
