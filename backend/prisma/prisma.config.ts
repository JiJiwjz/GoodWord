import path from 'node:path'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  earlyAccess: true,
  schema: path.join(__dirname, 'schema.prisma'),
  migrate: {
    adapter: async () => {
      const { PrismaSQLite } = await import('@prisma/adapter-sqlite')
      return new PrismaSQLite({ url: 'file:./dev.db' })
    },
  },
})
