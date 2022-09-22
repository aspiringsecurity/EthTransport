### Fluence Character count (Grants Round 11 Hackathon - Fluence)
##### Follow The Fluence Quickstart Guide (Beginner)
###### Description
Extend the Fluence Quickstart, https://github.com/fluencelabs/examples/tree/main/quickstart/3-browser-to-service, with a distributed character count service deployed to at least one Fluence peer. Display a message's character count at the end of the message, e.g., (char count: 123 chars). You should accurately count characters.

### Creating the WebAssembly module for char-count service

Based on `2-hosted-services` we modify it to:

```rust
// src/main.rs
use marine_rs_sdk::marine;
use marine_rs_sdk::module_manifest;

module_manifest!();

pub fn main() {}

#[marine]
pub struct CharCount {
    pub msg: String,
    pub reply: String,
}

#[marine]
pub fn char_count(message: String) -> CharCount {
    let num_chars = message.chars().count();
    let _msg;
    let _reply;

    if num_chars < 1 {
        _msg = format!("Your message was empty");
        _reply = format!("Your message has 0 characters");
    } else {
        _msg = format!("Message: {}", message);
        _reply = format!("Your message {} has {} character(s)", message, num_chars);
    }

    CharCount {
        msg: _msg,
        reply: _reply
    }
}
```
where you can see that the `char_count` function return a structure `CharCount` with the message and the char count.

Run `./scripts/build.sh` to compile the code to the Wasm target from the VSCode terminal.


### Tests

A couple of test were created in our `main.rs` file:

```rust
#[cfg(test)]
 mod tests {
     use marine_rs_sdk_test::marine_test;
 
     #[marine_test(config_path = "../configs/Config.toml", modules_dir = "../artifacts")]
     fn non_empty_string(char_count: marine_test_env::char_count::ModuleInterface) {
         let actual = char_count.char_count("SuperNode ☮".to_string());
         assert_eq!(actual.msg, "Message: SuperNode ☮");
         assert_eq!(actual.reply, "Your message SuperNode ☮ has 11 character(s)".to_string());
     }
 
     #[marine_test(config_path = "../configs/Config.toml", modules_dir = "../artifacts")]
     fn empty_string(char_count: marine_test_env::char_count::ModuleInterface) {
         let actual = char_count.char_count("".to_string());
         assert_eq!(actual.msg, "Your message was empty");
         assert_eq!(actual.reply, "Your message has 0 characters"); 
     }
 }

```
For tests running use the`cargo +nightly test --release` command. 

### Deployment To Fluence

To get a peer from one of the Fluence testnets use `fldist`. 

```text
fldist env
```
Let's use the peer`12D3KooWSD5PToNiLQwKDXsu8JSysCwUt8BVUJEqCHcDe7P5h45e`

```bash
fldist --node-id 12D3KooWSD5PToNiLQwKDXsu8JSysCwUt8BVUJEqCHcDe7P5h45e \
       new_service \
       --ms artifacts/char_count.wasm:configs/char_count_cfg.json \
       --name char-count-br
```

Which gives us a unique service id:

```text
service id: 32e7f3e6-9f1e-4140-8281-c58bc4e59440
service created successfully
```

You can ensure your service has been deployed by viewing the Fluence Developer Hub:
https://dash.fluence.dev/blueprint/2741065608bdb352bf4b4762bfed3e9f3e15145806da3ec9deeb92e785951b62


### Update Aqua code

Aqua is a simplified language for defining peer-to-peer applications with Fluence.

With the character count contract deployed, we move to the front end code. This is located in the quickstart/3-browser-to-service.

Our changes focus on the getting-started.aqua file. We create character_count.aqua.

Firstly we change the service id and peer id to match those returned when we deployed the contract.

Secondly, we refactor all references related to hello world to char count versions.

The most important change is that we will now need to pass through our message (messageToSend) and need to update the interface to support this:

```
import "@fluencelabs/aqua-lib/builtin.aqua"

const nodePeerId ?= "12D3KooWSD5PToNiLQwKDXsu8JSysCwUt8BVUJEqCHcDe7P5h45e"
const serviceId ?= "32e7f3e6-9f1e-4140-8281-c58bc4e59440"

data CharCount:
  msg: string
  reply: string

-- The service runs on a Fluence node
service CharCount:
    char_count(from: PeerId) -> CharCount

-- The service runs inside browser
service CharCountPeer("CharCountPeer"):
    char_count(message: string) -> string

func countChars(messageToSend: string, targetPeerId: PeerId, targetRelayPeerId: PeerId) -> string:
    -- execute computation on a Peer in the network
    on nodePeerId:
        CharCount serviceId
        comp <- CharCount.char_count(messageToSend)

    -- send the result to target browser in the background
    co on targetPeerId via targetRelayPeerId:
        res <- CharCountPeer.char_count(messageToSend)

    -- send the result to the initiator
    <- comp.reply
```

### Run install first
```
npm install
```

### Compile aqua file
```
npm run compile-aqua
```

### Update App.tsx for frontend

The front end code is found in the src/App.tsx file from `3-browser-to-service` . For this simplified application this mostly requires changing hello and hello world variable names to their character count alternatives that we used in the character_count.aqua file.


### Run the application 

```text
npm start
```

### Play with the app

Which will open a new browser tab at `http://localhost:3000` . Following the instructions, we connect to any one of the displayed relay ids, open another browser tab also at  `http://localhost:3000`, select a relay and copy and  paste the client peer id and relay id into corresponding fields in the first tab and press the `Say Hello` button.

You will see the message and char count for this message when send the message

Send:
<img width="993" alt="Screen Shot 2021-09-11 at 13 31 33" src="https://user-images.githubusercontent.com/13186215/132939112-c289cb83-8eaf-431c-8842-667f0b13a14c.png">

Receive:
<img width="1375" alt="Screen Shot 2021-09-11 at 13 31 27" src="https://user-images.githubusercontent.com/13186215/132939124-924e9465-d922-48b6-9a51-c61cfb6ad187.png">

