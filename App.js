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

humanityContract.methods
  .isRegistered("0x34cf1af38adf9855d02062d044e36f351a7f9120")
  .call()
  .then(function (result) {
    console.log("isRegistered result", result);
  })
  .catch(function (err) {
    console.log("isRegistered", err);
  });

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

function getIsRegisteredInProofOfHumanity(address) {}

export default function App() {
  const [isConnected, setIsConnected] = useState(null);
  const [address, setAddress] = useState(null);

  const metamaskPublicKey = "";
  const signature = "";

  function connect() {
    ethereum
      .request({ method: "eth_requestAccounts" })
      .then((result) => {
        if (result.length) {
          setAddress(result[0]);
          setIsConnected(true);
        } else {
          alert("No addresses found");
        }
      })
      .catch((err) => {
        setIsConnected(false);
        setAddress(null);
        if (err.code === -32002) {
          alert("Please accept the metamask connection");
          console.log("caught error during connection", err);
        }
      });
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
        {isConnected ? "Connected " + address : "Not connected"}
        {!isConnected && <button onClick={connect}>Connect</button>}
      </div>

      <div
        className="polis"
        data-conversation_id="7rspmntfxw"
        xid={`poh___${metamaskPublicKey}___${signature}`}
        data-ucw="false"
      />
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
