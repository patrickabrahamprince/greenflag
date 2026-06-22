import fs from 'fs'
import path from 'path'
import { resetTestData, createIsolatedTestUsers } from './helpers/db'

const TEST_USERS_PATH = path.resolve(__dirname, '.test-users.json')

export default async function globalSetup() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY missing in .env.test - tests will hang')
  }

  console.log('🧹 Resetting test data...')
  await resetTestData()

  console.log('👥 Creating isolated test users...')
  try {
    const { man1, man2, woman, admin } = await createIsolatedTestUsers()
    console.log('✅ Users created:', { man1: man1.email, woman: woman.email, admin: admin.email })

    const users = {
      TEST_MAN1_EMAIL: man1.email,
      TEST_MAN2_EMAIL: man2.email,
      TEST_WOMAN_EMAIL: woman.email,
      TEST_ADMIN_EMAIL: admin.email,
    }

    fs.writeFileSync(TEST_USERS_PATH, JSON.stringify(users, null, 2))

    console.log('✅ Global setup complete')
    console.log(`   Man1: ${man1.email} (${man1.id})`)
    console.log(`   Man2: ${man2.email} (${man2.id})`)
    console.log(`   Woman: ${woman.email} (${woman.id})`)
    console.log(`   Admin: ${admin.email} (${admin.id})`)
  } catch (e) {
    console.error('❌ Global setup failed:', e)
    process.exit(1)
  }
}
