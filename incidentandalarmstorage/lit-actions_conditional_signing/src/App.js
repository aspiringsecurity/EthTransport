import { useRef, useState } from 'react';
import LitJsSdk from "lit-js-sdk";
import './App.css';

function App() {
  const [returnedJson, setReturnedJson] = useState("");
  const [signature, setSignature] = useState("");

  const minBalanceRef = useRef();
  const nameRef = useRef();
  const timeRef = useRef();

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const runLitActions = async (e) => {
    e.preventDefault();
    const litActionCode = `
      const checkAndSignResponse = async () => {
        const satisfyConditions = await LitActions.checkConditions({ conditions, authSig, chain });
        const currentTimestamp = (new Date()).getTime();
        const afterOneMinute = Math.abs(currentTimestamp - timestamp) >= 2 * 60 * 1000;
        if (!satisfyConditions || afterOneMinute) {
          return;
        }

        toSign = { minBalance, fullName, timestamp, currentTimestamp };
        const sigShare = await LitActions.signEcdsa({ toSign, publicKey, sigName });
        LitActions.setResponse({ response: JSON.stringify(toSign) });
      };

      checkAndSignResponse();
    `;

    const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain: "ethereum" });
    const litNodeClient = new LitJsSdk.LitNodeClient({ litNetwork: "serrano" });
    await litNodeClient.connect();

    const date = new Date();
    const dateInString = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
    const timestamp = new Date(dateInString + " " + timeRef.current.value);

    const { signatures, response, logs } = await litNodeClient.executeJs({
      code: litActionCode,
      authSig,
      jsParams: {
        conditions: [
          {
            conditionType: "evmBasic",
            contractAddress: "",
            standardContractType: "",
            chain: "ethereum",
            method: "eth_getBalance",
            parameters: [":userAddress", "latest"],
            returnValueTest: {
              comparator: ">=",
              value: `${minBalanceRef.current.value}`,
            },
          },
        ],
        minBalance: minBalanceRef.current.value,
        fullName: nameRef.current.value,
        timestamp: timestamp.getTime(),
        authSig,
        chain: "ethereum",
        publicKey: "0x041270149148d3eece72d57471232d96308063cd16038f6f8f0daf4ce267e3e76273d02e89e482cb5e0bc944ca98df0594403021614e0a0409264cd13944000767",
        sigName: "sig1",
      },
    });

    setReturnedJson(response !== "" ? JSON.stringify(response, null, 4) : "Doesn't satisfy Access Conditions");
    setSignature(response !== "" ? signatures?.sig1?.signature : "Doesn't satisfy Access Conditions");
  }

  return (
    <div className="App">
      <h1>Conditionally Signed Response using Lit Actions</h1>
      <h2 className="info">Displays the returned JSON if your Ether balance {'>'}= Min balance you entered & if you signed the transaction within 2 mins of your set time</h2>
      <div className="container">
        <div className="response">
          <h2>Returned JSON</h2>
          <div className="responseText__container">
            <textarea readOnly value={returnedJson} className="jsonResponse" />
            <div onClick={() => copyToClipboard(returnedJson)} className="copy">Copy to Clipboard</div>
          </div>
          <h2>Signature</h2>
          <div className="responseText__container">
            <textarea readOnly value={signature} />
            <div onClick={() => copyToClipboard(signature)} className="copy">Copy to Clipboard</div>
          </div>
        </div>
        <div>
          <form onSubmit={runLitActions} className="userInputs">
            <h2>Minimum Balance</h2>
            <input ref={minBalanceRef} type="number" min="0" step="0.001" required placeholder="Min balance for signing" />
            <h2>Full Name</h2>
            <input ref={nameRef} type="text" required placeholder="Enter your full name" />
            <h2>Time</h2>
            <input ref={timeRef} type="time" required placeholder="Enter a time" />
            <button type="submit">Run Lit Actions</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
