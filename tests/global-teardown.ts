import fs from 'fs'
import path from 'path'
import { resetTestData } from './helpers/db'

const TEST_USERS_PATH = path.resolve(__dirname, '.test-users.json')

export default async function globalTeardown() {
  console.log('🧹 Cleaning up test data...')
  await resetTestData()

  if (fs.existsSync(TEST_USERS_PATH)) {
    fs.unlinkSync(TEST_USERS_PATH)
  }
}
