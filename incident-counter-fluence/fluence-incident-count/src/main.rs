/*
 * Copyright 2021 Fluence Labs Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
 