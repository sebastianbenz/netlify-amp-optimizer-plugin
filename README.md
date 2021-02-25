# Netlify Plugin: AMP Optimizer
This is a modified Netlify plugin based on [martinbean's AMP Server-Side Rendering Netlify Plugin](https://github.com/martinbean/netlify-plugin-amp-server-side-rendering) to optimize AMP pages.

## Difference to the original plugin
I had issues with the original plugin as it also transformed non-AMP pages, for example the Netlify admin page.

I needed to customize the plugin for my needs, and that's why I made this local plugin.

## Install & usage
The **Netlify AMP Optimizer Plugin** is made to be a local Netlify plugin.

### How to install the Netlify AMP Optimizer plugin
Copy the **plugin** folder and it's contents into your root folder (if you haven't already created a plugin folder).

Then open your **netlify.toml** file at your root folder and add those lines:

```toml
[[plugins]]
  package = "@netlify/plugin-local-install-core"

[[plugins]]
  package = "/plugins/amp-optimizer"
    [plugins.inputs]
    siteName = "Your site name"
```

### Usage
You're all set. But you can also customize the plugin to your needs.

In my use case, AMP Optimizer ignored option that I passed into it. For example, I wanted to turn off *optimizeHeroImages* like this:

```js
const ampOptimizer = require("@ampproject/toolbox-optimizer").create({
  optimizeHeroImages: false
})
```

optimizeHeroImages is great in most use cases, in my case (I put the hero image into a div as a background image), the AMP Optimizer put a preload in the `<head>` that loaded an images that wasn't even visible on page load.

A workaround was to remove the preload tag from the optimized HTML:

```js
const ampOptimizer = require("@ampproject/toolbox-optimizer").create()
const fs = require("fs")
const glob = require("glob")

module.exports = {
  onPostBuild: async ({ constants, utils, inputs }) => {
    const pattern = constants.PUBLISH_DIR + "/**/*.html"
    const files = await new Promise((resolve, reject) => {
      glob(pattern, { nodir: true }, (err, files) => {
        (err) ? reject(err) : resolve(files)
      })
    })
    let filesLength = 0
    await Promise.all(
      files.map(async (file) => {
        const htmlFile = await fs.promises.readFile(file, "utf-8")
        if (htmlFile.toString().substring(0,30).includes("⚡")) {
          ++filesLength
          let optimizedHtml = await ampOptimizer.transformHtml(htmlFile)

          // regex to find preload tag
          const removeDataHero = /<link rel="preload" href="https:..res.cloudinary.*data-hero>/gmi
          
          await fs.promises.writeFile(file, optimizedHtml.toString().replace(removeDataHero,''))

        }
      })
    )
    utils.status.show({
      title: `${inputs.siteName} is on 🔥`,
      summary: `AMP Optimizer just made ${filesLength} out of ${files.length} HTML files smaller, faster & better! 🚀`
    })
  }
}

```
