#!/usr/bin/env node
const yargs = require("yargs")
const fs = require("fs")
const { execSync } = require("child_process")
const check = require("./commands/check")
const checkInteractively = require("./commands/checkInteractively")
const save = require("./commands/save")

// eslint-disable-next-line no-unused-expressions
yargs
  .command(
    "check [file]",
    "checks file for writing mistakes",
    (yargsCtx) => {
      yargsCtx.positional("text", {
        describe: "file to check",
      })
    },
    async (argv) => {
      console.info(`👵🏻 OK dear, checking...`)

      const initialText = fs.readFileSync(argv.file).toString()

      if (argv.print) {
        check(initialText)
      } else {
        const { changed, text } = await checkInteractively(initialText)
        if (changed) {
          save(text, "FILE", argv.file)
        }
      }
    },
  )
  .command(
    "listen [text]",
    "checks text for writing mistakes",
    (yargsCtx) => {
      yargsCtx.positional("text", {
        describe: "text to check",
      })
    },
    async (argv) => {
      console.info(`👵🏻 OK dear, checking...`)

      if (argv.print) {
        check(argv.text)
      } else {
        const { changed, text } = await checkInteractively(argv.text)
        if (changed) {
          save(text, "TEXT")
        }
      }
    },
  )
  .command(
    "commit [text]",
    "git commit -m with grammar check",
    (yargsCtx) => {
      yargsCtx.positional("text", {
        describe: "commit message to check",
      })
    },
    async (argv) => {
      console.info(`👵🏻 OK dear, checking...`)

      const { text } = await checkInteractively(argv.text, "COMMIT")

      try {
        const output = argv.all
          ? execSync(`git commit -am "${text}"`)
          : execSync(`git commit -m "${text}"`)

        process.stdout.write(output)
      } catch (error) {
        process.stderr.write(error.stdout)
      }
    },
  )
  .option("print", {
    alias: "p",
    type: "boolean",
    default: false,
    describe: "Print mistakes non-interactively",
  })
  .option("all", {
    alias: "a",
    type: "boolean",
    default: false,
    describe: "Adds -a flag to git commit command",
  })
  .alias("help", "h")
  .alias("version", "v")
  .demandCommand().argv