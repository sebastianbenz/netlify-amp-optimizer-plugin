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
          await fs.promises.writeFile(file, optimizedHtml)
        }
      })
    )
    utils.status.show({
      title: `${inputs.siteName} is on 🔥`,
      summary: `AMP Optimizer just made ${filesLength} out of ${files.length} HTML files smaller, faster & better! 🚀`
    })
  }
}
