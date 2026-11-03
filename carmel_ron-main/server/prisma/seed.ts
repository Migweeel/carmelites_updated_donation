import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const locations = ['Angeles', 'Bacolod', 'Baguio', 'Cagayan de Oro', 'Castillejos', 'Cebu', 'Davao', 'Gumaca', 'Infanta']
const monasteries = [
  ...locations.map((city, index) => ({ name: `Discalced Carmelite Monastery of ${city}`, city, slug: city.toLowerCase().replaceAll(' ', '-'), sortOrder: index + 1 })),
  ...Array.from({ length: 14 }, (_, index) => ({ name: `Federation monastery ${String(index + 10).padStart(2, '0')}`, city: 'To be updated', slug: `federation-monastery-${String(index + 10).padStart(2, '0')}`, sortOrder: index + 10 })),
]
const faqs = [
  ['Can I truly give 100% anonymously?', 'Yes. If you choose Give Anonymously, your name is not shown on public acknowledgments or community reports. Contact details shared for a private receipt are used only for that purpose.'],
  ['How do I pay using GCash or Maya?', 'Choose GCash or Maya and send your offering to the account shown in the final step. Include the transfer reference so our team can reconcile the gift.'],
  ['How does becoming a Church Monthly Sponsor work?', 'Choose Monthly Blessing when selecting your offering. Transfers are manual, and your recurring intention helps communities plan formation and daily needs.'],
  ['What do the automated SMS and Email reminders look like?', 'Reminders are brief, respectful notes about your monthly intention. You can update your contact preference or opt out at any time.'],
  ['Can I change, pause, or cancel my monthly sponsorship anytime?', 'Yes. Monthly blessings are commitments, not automatic charges. Contact the Federation to update or pause future transfers.'],
  ['Will I receive an official church donation receipt?', 'You may request an acknowledgment receipt. Official tax documentation depends on the Federation’s current accreditation and will be confirmed directly.'],
]

async function main() {
  const useDevelopmentAdmin = process.env.NODE_ENV !== 'production' && process.env.DEMO_AUTH_ENABLED === 'true'
  const email = (useDevelopmentAdmin ? process.env.DEMO_ADMIN_EMAIL : process.env.ADMIN_EMAIL)?.toLowerCase()
  const password = useDevelopmentAdmin ? process.env.DEMO_ADMIN_PASSWORD : process.env.ADMIN_PASSWORD
  if (email && password) {
    const passwordHash = await bcrypt.hash(password, 12)
    await prisma.user.upsert({ where: { email }, update: { name: process.env.ADMIN_NAME || 'Federation Administrator', passwordHash, role: 'ADMIN', isActive: true }, create: { name: process.env.ADMIN_NAME || 'Federation Administrator', email, passwordHash, role: 'ADMIN' } })
  } else {
    console.warn('Admin seed credentials are unset; skipping admin account seed.')
  }
  for (const monastery of monasteries) {
    await prisma.monastery.upsert({ where: { slug: monastery.slug }, update: { ...monastery }, create: monastery })
  }
  const pages = [
    { pageKey: 'HOME', blocks: [{ title: 'Carmels in Communion', body: 'Welcome to the official website of the Philippine Federation of Discalced Carmelite Nuns.' }] },
    { pageKey: 'ABOUT', blocks: [{ title: 'About Us', body: 'A structure of communion among 23 Carmelite monastery members.' }] },
    { pageKey: 'CARMELIFE', blocks: [{ title: 'Carmelife', body: 'A contemplative life rooted in prayer, sisterhood, and the search for God.' }] },
    { pageKey: 'CARMELIGHT', blocks: [{ title: 'Carmelights', body: 'Vocation stories and glimpses of life in Carmel.' }] },
    { pageKey: 'CONTACT', blocks: [{ title: 'Contact Us', body: 'We welcome your questions and messages.' }] },
  ]
  for (const page of pages) await prisma.pageContent.upsert({ where: { pageKey: page.pageKey }, update: { blocks: page.blocks }, create: page })
  for (const [sortOrder, [question, answer]] of faqs.entries()) {
    const existing = await prisma.fAQ.findFirst({ where: { question } })
    if (existing) await prisma.fAQ.update({ where: { id: existing.id }, data: { answer, sortOrder, isPublished: true } })
    else await prisma.fAQ.create({ data: { question, answer, sortOrder } })
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1 }).finally(() => prisma.$disconnect())
