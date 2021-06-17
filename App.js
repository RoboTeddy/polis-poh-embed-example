import "regenerator-runtime/runtime";
import React, { useEffect, useState } from "react";
import Web3 from "web3";

import humanityAbi from "./proofOfHumanityAbi";
const proofOfHumanityAddress = "0xc5e9ddebb09cd64dfacab4011a0d5cedaf7c9bdb";

const web3 = new Web3(
  "wss://mainnet.infura.io/ws/v3/ec39a81039c945bd9063af6003109bf2"
);

const humanityContract = new web3.eth.Contract(
  humanityAbi,
  proofOfHumanityAddress
);

// TODO: handle missing window.ethereum

// TODO: figure out how to handle state where we've requested connection to metamask, but not actually connected, and then the user reloads

// consider behavior on page reload

// 1. get address

// 2. find out if one of those addresses is registered with proof of humanity
// --> if none are registered, let the user know that
// --> otherwise, show liek "connected to poh" state of some sort

// 3. request that you sign a pol.is login string --> that becomes the xid

// (user uses application...)

// 4. filter out invalid xids (server side)

// returns a promise that resolves to `true` or `false`
function getIsRegisteredInProofOfHumanity(address) {
  return humanityContract.methods.isRegistered(address).call();
}

export default function App() {
  const [isConnected, setIsConnected] = useState(null);
  const [humanityVerified, setHumanityVerified] = useState(null);
  const [address, setAddress] = useState(null);

  useEffect(() => {
    if (humanityVerified) {
      const script = document.createElement("script");

      script.src = "https://pol.is/embed.js";
      script.async = true;

      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    }
  }, [humanityVerified]);

  const metamaskPublicKey = "";
  const signature = "";

  async function connect() {
    try {
      const arrayOfAddresses = await ethereum.request({
        method: "eth_requestAccounts",
      });

      if (arrayOfAddresses.length) {
        setAddress(arrayOfAddresses[0]);
        setIsConnected(true);
        setHumanityVerified(
          await getIsRegisteredInProofOfHumanity(arrayOfAddresses[0])
        );
      } else {
        alert("No addresses found");
      }
    } catch (err) {
      setIsConnected(false);
      setAddress(null);
      if (err.code === -32002) {
        alert("Please accept the metamask connection");
        console.log("caught error during connection", err);
      }
    }
  }

  useEffect(() => {
    ethereum.on("connect", () => {
      console.log("metamask connected");
    });

    ethereum.on("disconnect", () => {
      console.log("metamask disconnected");
    });

    // TODO: figuer out if this event is supposed to trigger on page load
    // if already connected (metamask docs seemed to say yes, but it doesn't happen)
    ethereum.on("accountsChanged", (accounts) => {
      console.log("accountsChanged", accounts);
      setIsConnected(accounts.length > 0);
      setAddress(accounts[0]);
      // Handle the new accounts, or lack thereof.
      // "accounts" will always be an array, but it can be empty.
    });

    ethereum.on("chainChanged", (chainId) => {
      console.log("chainChanged", accounts);
      alert("chain changed, this forces a reload"); // TODO: kill this alert
      window.location.reload();
    });

    // TODO: return a function that would stop listening to these things
  }, []);

  return (
    <div>
      <h1> Welcome to dao governance land </h1>

      <div>
        <h3> METAMASK </h3>
        {isConnected ? "Connected " + address : "Not connected"}
        {!isConnected && <button onClick={connect}>Connect</button>}
      </div>
      <div>
        <h3>Proof of Humanity</h3>
        {humanityVerified === null && "Humanity not verified"}
        {humanityVerified === true && "Proof of Humanity successfully verified"}
        {humanityVerified === false &&
          "Proof of Humanity failed to verify. Reconnect metamask."}
      </div>

      {humanityVerified && (
        <div
          className="polis"
          data-conversation_id="7rspmntfxw"
          xid={`poh___${metamaskPublicKey}___${signature}`}
          data-ucw="false"
        />
      )}
    </div>
  );
}

/* 
function sign(message, privateKey) {
  // stuff happens
  const signature = 1; // .. a bucnch focppuation
  return signature;
}

function verify(message, signature, publicKey) {
  // return true or false
}

*/
