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

function startSigning() {
  event.preventDefault();

  const msgParams = JSON.stringify({
    domain: {
      // Defining the chain aka Rinkeby testnet or Ethereum Main Net
      chainId: 1,
      // Give a user friendly name to the specific contract you are signing for.
      name: "Ether Mail",
      // If name isn't enough add verifying contract to make sure you are establishing contracts with the proper entity
      verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
      // Just let's you know the latest version. Definitely make sure the field name is correct.
      version: "1",
    },

    // Defining the message signing data content.
    message: {
      /*
       - Anything you want. Just a JSON Blob that encodes the data you want to send
       - No required fields
       - This is DApp Specific
       - Be as explicit as possible when building out the message schema.
      */
      contents: "Hello, Bob!",
      attachedMoneyInEth: 4.2,
      from: {
        name: "Cow",
        wallets: [
          "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826",
          "0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF",
        ],
      },
      to: [
        {
          name: "Bob",
          wallets: [
            "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
            "0xB0BdaBea57B0BDABeA57b0bdABEA57b0BDabEa57",
            "0xB0B0b0b0b0b0B000000000000000000000000000",
          ],
        },
      ],
    },
    // Refers to the keys of the *types* object below.
    primaryType: "Mail",
    types: {
      // TODO: Clarify if EIP712Domain refers to the domain the contract is hosted on
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" },
      ],
      // Not an EIP712Domain definition
      Group: [
        { name: "name", type: "string" },
        { name: "members", type: "Person[]" },
      ],
      // Refer to PrimaryType
      Mail: [
        { name: "from", type: "Person" },
        { name: "to", type: "Person[]" },
        { name: "contents", type: "string" },
      ],
      // Not an EIP712Domain definition
      Person: [
        { name: "name", type: "string" },
        { name: "wallets", type: "address[]" },
      ],
    },
  });

  //var from = web3.eth.accounts[0];
  const from = "0x34CF1af38ADF9855D02062D044e36F351a7F9120";

  var params = [from, msgParams];
  var method = "eth_signTypedData_v4";

  window.ethereum.sendAsync(
    {
      method,
      params,
      from,
    },
    function (err, result) {
      if (err) return console.dir(err);
      if (result.error) {
        alert(result.error.message);
      }
      if (result.error) return console.error("ERROR", result);
      console.log("TYPED SIGNED:" + JSON.stringify(result.result));

      /*
      const recovered = sigUtil.recoverTypedSignature_v4({
        data: JSON.parse(msgParams),
        sig: result.result,
      });

      if (
        ethUtil.toChecksumAddress(recovered) === ethUtil.toChecksumAddress(from)
      ) {
        alert("Successfully recovered signer as " + from);
      } else {
        alert(
          "Failed to verify signer when comparing " + result + " to " + from
        );
      }
      */
    }
  );
}

export default function App() {
  return <button onClick={startSigning}>hello</button>;
}

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

/*

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

  const messageToSign = "polis-poh-embed-example";

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

  async function startSigning(address) {
    debugger;
    web3.eth.sign(address, messageToSign, function (err, result) {
      if (err) return console.error(err);
      console.log("SIGNED:" + result);
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
        <h3> METAMASK </h3>
        {isConnected ? "Connected " + address : "Not connected"}
        {!isConnected && <button onClick={connect}>Connect</button>}
      </div>
      <div>
        <h3>Proof of Humanity</h3>
        {humanityVerified === null && "Humanity not verified"}
        {humanityVerified === false &&
          "Proof of Humanity failed to verify. Reconnect metamask."}
        {humanityVerified === true && (
          <div>
            Proof of Humanity ready to verify
            <button onClick={() => startSigning(address)}>
              Connect with Proof of Humanity
            </button>
          </div>
        )}
      </div>

      {false && humanityVerified && (
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
*/
