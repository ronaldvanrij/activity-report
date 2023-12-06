import * as core from '@actions/core'
import { Util } from './util'
import { Config, Timespan } from './types'
import { Issues } from './issues'
import { Commits } from './commits'
import { Releases } from './releases'
import { Reactions } from './reactions'
import { Stargazers } from './stargazers'
import { PullRequests } from './pulls'

export namespace Renderer {
  export function renderTitle(timespan: Timespan, config: Config) {
    return Util.render(config.templateTitle, timespan, {
      fromDate: Util.formatDateInTitle(timespan.fromDate),
      toDate: Util.formatDateInTitle(timespan.toDate),
    })
  }

  export async function renderBody(timespan: Timespan, config: Config) {
    let body = renderHeader(timespan, config)

    let issuesString: string | undefined
    let contributorsString: string | undefined
    let pullRequestsString: string | undefined
    let stargazersString: string | undefined
    let commitsString: string | undefined
    let releasesString: string | undefined

    if (config.publishIssues) {
      const issues = await Issues.list()
      const reactions =
        config.publishTopLikedIssues > 0
          ? await Reactions.map(issues.map((issue) => issue.number))
          : []
      core.debug(`issues: ${JSON.stringify(issues.map((i) => i.title))}`)
      issuesString = Issues.render(issues, reactions, timespan, config)
    }

    if (config.publishPulls) {
      const pullRequests = await PullRequests.list()
      core.debug(`prs: ${JSON.stringify(pullRequests.map((i) => i.title))}`)
      pullRequestsString = PullRequests.render(pullRequests, timespan, config)
    }

    if (config.publishCommits || config.publishContributors) {
      const commits = await Commits.list(timespan.fromDate)
      if (config.publishCommits) {
        commitsString = Commits.render(commits, timespan, config)
        core.debug(`commits`)
      }
      if (config.publishContributors) {
        contributorsString = Commits.renderContributors(
          commits,
          timespan,
          config,
        )
        core.debug(`contributors`)
      }
    }

    if (config.publishStargazers) {
      const stargazers = await Stargazers.list()
      stargazersString = Stargazers.render(stargazers, timespan, config)
      core.debug(`stargazers`)
    }

    if (config.publishReleases) {
      const releases = await Releases.list()
      releasesString = Releases.render(releases, timespan, config)
      core.debug(`releases`)
    }

    const arr = [
      issuesString,
      pullRequestsString,
      commitsString,
      contributorsString,
      stargazersString,
      releasesString,
    ]

    arr.forEach((item) => {
      if (item) {
        body += '\n - - - \n'
        body += item
      }
    })

    body += '\n\n'
    body += `${renderFooter(timespan, config)}\n\n`

    return body
  }

  function renderHeader(timespan: Timespan, config: Config) {
    return Util.render(config.templateHeader, timespan)
  }

  function renderFooter(timespan: Timespan, config: Config) {
    return Util.render(config.templateFooter, timespan, {
      labels: config.addLabels,
    })
  }
}
