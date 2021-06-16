import React from "react";

export default function App() {
  return (
    <div>
      <h1> Welcome to dao governance land </h1>
      <Convo shouldshow={foo ? false : true} />
      <div
        class="polis"
        data-conversation_id="7rspmntfxw"
        xid={`poh___${metamaskPublicKey}___${signature}`}
        data-ucw="false"
      />
    </div>
  );
}

/* 

  Do you need to register to even show the conversation? 
  When does Polis create a user record / set a cookie? Does it for everyoen visitign closed convos on scoop?

*/

function sign(message, privateKey) {
  // stuff happens
  const signature = 1; // .. a bucnch focppuation
  return signature;
}

function verify(message, signature, publicKey) {
  // return true or false
}
