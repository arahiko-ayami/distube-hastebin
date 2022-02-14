# distube-hastebin

A DisTube custom plugin for supporting Hastebin URL.

# Feature

This plugin grabs the songs on Hastebin then searches on YouTube and plays with DisTube.

# Installation

With npm:
```sh
npm install distube-hastebin@latest
```
With yarn:
```sh
yarn add distube-hastebin@latest
```
With pnpm:
```sh
pnpm add distube-hastebin@latest
```

# Usage

```js
const Discord = require("discord.js");
const client = new Discord.Client();
const { DisTube } = require("distube");
const { HastebinPlugin } = require("distube-hastebin");
const distube = new DisTube(client, {
  plugins: [new HastebinPlugin()],
});
```

## Documentation

### HastebinPlugin([HastebinPluginOptions])
- `host` (string, optional): The host of Hastebin. Defaults to `https://www.toptal.com/developers/hastebin/`.

#### Example

```js
new HastebinPlugin({
  host: "https://your-hastebin-host.com", // Your hastebin host.
});
```
