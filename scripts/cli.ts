#!/usr/bin/env node

import { writeFileSync, mkdirSync, existsSync, readFile } from 'fs'
import { select, checkbox } from '@inquirer/prompts'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import chalk from 'chalk'
import { Release } from '~scripts/api/types/response'
import { getCollection } from './api/queries'

type Collection = {
  id: number
  title: string
  artist: string
  lastCleaned?: Date
}

yargs(hideBin(process.argv))
  .scriptName('scheduler')
  .command(['*', 'start'], 'Import releases from a collection', {}, getReleasesinCollection)
  .command('update', 'Update the last cleaned value for releases', {}, updateLastCleaned).argv

async function getReleasesinCollection() {
  console.log(chalk.magentaBright('Getting releases in collection...'))

  const getAllReleases = async ({
    page = 1,
    releases = [],
  }: {
    page?: number
    releases?: Collection[]
  }): Promise<Collection[]> => {
    const response = await getCollection({
      username: 'mitchellslager',
      folderId: 0,
      options: {
        sort: 'added',
        page,
      },
    })

    console.log(
      chalk.blueBright(`Now getting releases from page ${page} (of ${response.pagination.pages})`)
    )

    const collection: Collection[] = response.releases.map(toProduct)

    if (response.pagination.urls.next) {
      return await getAllReleases({ page: page + 1, releases: releases.concat(collection) })
    }

    return releases.concat(collection)
  }

  getAllReleases({}).then((response) => {
    if (existsSync('./data/releases.json')) {
      readFile('./data/releases.json', async (err, data) => {
        if (err) throw err

        const releases: Collection[] = JSON.parse(data.toString())
        response.forEach((release) => {
          if (!releases.find((r) => r.id === release.id)) releases.push(release)
        })

        writeFileSync('./data/releases.json', JSON.stringify(releases, null, 2))
      })
    } else {
      mkdirSync('./data')
      writeFileSync('./data/releases.json', JSON.stringify(response, null, 2))
    }
  })
}

async function updateLastCleaned() {
  console.log(chalk.magentaBright('Updating last cleaned...'))

  if (!existsSync('./data/releases.json')) {
    console.log(chalk.redBright('No data directory found.'))
    return
  }

  readFile('./data/releases.json', async (err, data) => {
    if (err) throw err

    const releases: Collection[] = JSON.parse(data.toString())

    const selectedRecords = await checkbox({
      message: 'Select records to update status',
      pageSize: 20,
      choices: releases.map((release) => ({
        name: `${release.artist} - ${release.title}`,
        value: release.id,
      })),
    })

    const updateStatus = await select({
      message: 'What do you want do update?',
      choices: [
        {
          name: 'All clean',
          value: 'clean',
          description: 'Mark all records as cleaned',
        },
        {
          name: 'All dirty',
          value: 'dirty',
          description: 'Mark all records as dirty',
        },
      ],
    })

    const updatedData = releases.map((release) => ({
      ...release,
      lastCleaned: updateCleanStatus(release, selectedRecords, updateStatus),
    }))

    writeFileSync('./data/releases.json', JSON.stringify(updatedData, null, 2))
  })
}

const toProduct = ({ basic_information: { id, title, artists } }: Release): Collection => ({
  id,
  title,
  artist: artists.map((artist) => artist.name).join(', '),
  lastCleaned: undefined,
})

const updateCleanStatus = (
  release: Collection,
  selectedRecords: number[],
  updateStatus: string
): Date | undefined => {
  if (selectedRecords.includes(release.id)) {
    switch (updateStatus) {
      case 'clean':
        return new Date()
      case 'dirty':
      default:
        return undefined
    }
  } else {
    return release.lastCleaned
  }
}
