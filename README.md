## Watson

This is the first prototype of a simple cli tool for generating stats for elementary OS.

On its own Watson doesn't do much ; actually it is a dumb tool which is used as a foundation so we can glue together a few plugins which will offer different kind of functionality through Watson. It expose 2 API tasks which plugins can use: *stats* and *build*.

- *stats* task will be used to fetch needed data from remote API(s) and store it locally if needed.
- *build* task will be used to include fetched data (*gathered from stats task*) into static website.

## Plugins

For the moment there are only two plugins written, as a proof of concept:

- watson-plugin-launchpad - Gather data from Launchpad and build issues rellated stats from Launchpad.
- watson-plugin-sourceforge - Build downloads graph with data offered by Sourceforge.


## Installation

```bash
git clone https://github.com/vimishor/watson.git
cd watson && npm install --production
node bin/watson --help
```
