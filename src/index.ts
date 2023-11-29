import * as core from '@actions/core'
import { Util } from './util'
import { Issues } from './issues'
import { Renderer } from './render'

async function run() {
  const config = Util.getInputs()
  const timespan = Util.getTimespan()

  core.info(`Report from ${timespan.fromDate} to ${timespan.toDate}`)

  const title = Renderer.renderTitle(timespan, config)
  const body = await Renderer.renderBody(timespan, config)

  if (config.createIssue) {
    const labels = config.addLabels || `${Util.lcfirst(timespan.name)}-report`
    await Issues.create(title, body, labels)
  }

  core.setOutput('title', title)
  core.setOutput('body', body)
}

run()
