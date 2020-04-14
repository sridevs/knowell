#!/usr/bin/env bash
npm install
node_modules/knex/bin/cli.js migrate:rollback --env qa
node_modules/knex/bin/cli.js migrate:latest --env qa
node_modules/knex/bin/cli.js seed:run --env qa
