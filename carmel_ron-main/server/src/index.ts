import 'dotenv/config'
import bcrypt from 'bcryptjs'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express, { type NextFunction, type Request, type Response } from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import jwt from 'jsonwebtoken'
import { Prisma, PrismaClient } from '@prisma/client'
import { createCipheriv, createDecipheriv, createHash, randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto'
import { TextReader, TextWriter, Uint8ArrayReader, Uint8ArrayWriter, ZipReader, ZipWriter } from '@zip.js/zip.js'
import { z } from 'zod'

const app = express()
const prisma = new PrismaClient()
const port = Number(process.env.PORT || 4000)
const jwtSecret = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'local-only-change-this-secret')
if (!jwtSecret) throw new Error('Set JWT_SECRET before starting in production.')
const lightfmServiceUrl = process.env.LIGHTFM_SERVICE_URL || 'http://127.0.0.1:8001'
const lightfmApiToken = process.env.LIGHTFM_API_TOKEN || ''
const xenditSecretKey = process.env.XENDIT_SECRET_KEY || process.env.XENDIT_TEST_SECRET_KEY || ''
const xenditCallbackToken = process.env.XENDIT_CALLBACK_TOKEN || ''
const demoAuthEnabled = process.env.DEMO_AUTH_ENABLED === 'true' && process.env.NODE_ENV !== 'production'
const demoAdminEmail = process.env.DEMO_ADMIN_EMAIL?.toLowerCase() || ''
const demoAdminPassword = process.env.DEMO_ADMIN_PASSWORD || ''
const offlineDemoAccounts = {
  'admin@offline': { name: 'Demo Administrator', role: 'ADMIN' as const, canManageUsers: true, canManageDetails: true, canManageUpdates: true },
  'staff@offline': { name: 'Demo Formator', role: 'FORMATOR' as const, canManageUsers: true, canManageDetails: true, canManageUpdates: true },
  'user@offline': { name: 'Demo Community User', role: 'USER' as const, phone: '+63 900 000 0000', address: 'Local demonstration account' },
}
const offlineDemoPassword = '12345678'
const systemBackupPassword = 'carmelites'
const systemBackupFormat = 'carmels-in-communion-backup'
const maxBackupPlaintextBytes = 45 * 1024 * 1024
const backupTables = [
  { name: 'User', columns: ['id', 'name', 'email', 'phone', 'address', 'privacyConsentAt', 'privacyPolicyVersion', 'passwordHash', 'role', 'isActive', 'canManageUsers', 'canManageDetails', 'canManageUpdates', 'createdAt', 'updatedAt'], uniqueColumns: ['email'] },
  { name: 'Monastery', columns: ['id', 'name', 'city', 'slug', 'description', 'imageUrl', 'address', 'contact', 'sortOrder', 'createdAt', 'updatedAt'], uniqueColumns: ['slug'] },
  { name: 'Discernment', columns: ['id', 'userId', 'stage', 'monastery', 'note', 'createdAt', 'updatedAt'], uniqueColumns: ['userId'] },
  { name: 'Donation', columns: ['id', 'referenceCode', 'amount', 'type', 'fund', 'paymentMethod', 'xenditInvoiceId', 'xenditInvoiceUrl', 'paymongoPaymentIntentId', 'paymongoQrImageUrl', 'paymongoQrExpiresAt', 'isManual', 'isAnonymous', 'donorName', 'donorEmail', 'donorPhone', 'wantsReceipt', 'paymentReference', 'beneficiaryMonasteryId', 'status', 'createdAt', 'updatedAt'], uniqueColumns: ['referenceCode', 'xenditInvoiceId', 'paymongoPaymentIntentId'] },
  { name: 'DonationFile', columns: ['id', 'donationId', 'fileUrl', 'type', 'fileName', 'createdAt'], uniqueColumns: [] },
  { name: 'Conversation', columns: ['id', 'userId', 'name', 'email', 'subject', 'category', 'isRead', 'lastMessageAt', 'createdAt'], uniqueColumns: ['userId'] },
  { name: 'Message', columns: ['id', 'conversationId', 'senderId', 'senderType', 'body', 'readAt', 'createdAt'], uniqueColumns: [] },
  { name: 'Update', columns: ['id', 'title', 'slug', 'excerpt', 'body', 'coverImage', 'category', 'publishedAt', 'createdAt', 'updatedAt'], uniqueColumns: ['slug'] },
  { name: 'PageContent', columns: ['id', 'pageKey', 'blocks', 'updatedAt'], uniqueColumns: ['pageKey'], jsonColumns: ['blocks'] },
  { name: 'ContentInteraction', columns: ['id', 'userId', 'readingId', 'eventType', 'dedupeKey', 'createdAt'], uniqueColumns: ['dedupeKey'] },
  { name: 'FAQ', columns: ['id', 'question', 'answer', 'sortOrder', 'isPublished', 'updatedAt'], uniqueColumns: [] },
  { name: 'AuditLog', columns: ['id', 'userId', 'action', 'entity', 'entityId', 'meta', 'createdAt'], uniqueColumns: [], jsonColumns: ['meta'] },
] as const
const backupDependencies: Record<string, Array<{ table: string; column: string }>> = {
  Discernment: [{ table: 'User', column: 'userId' }],
  Donation: [{ table: 'Monastery', column: 'beneficiaryMonasteryId' }],
  DonationFile: [{ table: 'Donation', column: 'donationId' }],
  Conversation: [{ table: 'User', column: 'userId' }],
  Message: [{ table: 'Conversation', column: 'conversationId' }, { table: 'User', column: 'senderId' }],
  ContentInteraction: [{ table: 'User', column: 'userId' }],
  AuditLog: [{ table: 'User', column: 'userId' }],
}
const backupEnumColumns: Record<string, Record<string, string>> = {
  User: { role: '"Role"' },
  Discernment: { stage: '"DiscernmentStage"' },
  Donation: { type: '"DonationType"', paymentMethod: '"PaymentMethod"', status: '"DonationStatus"' },
  Conversation: { category: '"MessageCategory"' },
  Message: { senderType: '"SenderType"' },
  ContentInteraction: { eventType: '"ContentInteractionType"' },
}

app.disable('x-powered-by')
app.use(helmet())
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173', credentials: true }))
app.use(express.json({ limit: '16mb' }))
app.use(cookieParser())
app.use('/api/auth', rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (_req, res) => res.setHeader('Retry-After', '300').status(429).json({ error: 'Too many authentication attempts. Please wait 5 minutes before trying again.' }),
}))
app.use('/api/contact', rateLimit({ windowMs: 15 * 60 * 1000, limit: 5, standardHeaders: 'draft-8', legacyHeaders: false }))
app.use('/api/content/interactions', rateLimit({ windowMs: 15 * 60 * 1000, limit: 120, standardHeaders: 'draft-8', legacyHeaders: false }))

const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' as const, path: '/' }
const visitorChatCookieOptions = { ...cookieOptions, path: '/api/chat' }
type AuthRequest = Request & { auth?: { id: string; role: 'ADMIN' | 'FORMATOR' | 'USER'; demo?: boolean; canManageUsers?: boolean; canManageDetails?: boolean; canManageUpdates?: boolean } }
function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.carmel_session as string | undefined
  if (!token) return res.status(401).json({ error: 'Sign in is required.' })
  try {
    const claims = jwt.verify(token, jwtSecret) as AuthRequest['auth']
    if (!claims?.id || !claims.role) return res.status(401).json({ error: 'Invalid session.' })
    if (claims.demo && !demoAuthEnabled) return res.status(401).json({ error: 'Demo sign-in is disabled.' })
    req.auth = claims
    next()
  } catch { return res.status(401).json({ error: 'Your session has expired. Please sign in again.' }) }
}
function allowRoles(...roles: Array<'ADMIN' | 'FORMATOR' | 'USER'>) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.auth || !roles.includes(req.auth.role)) return res.status(403).json({ error: 'You do not have access to this resource.' })
    next()
  }
}
type StaffPermission = 'canManageUsers' | 'canManageDetails' | 'canManageUpdates'
async function authorizeStaffPermission(req: AuthRequest, res: Response, permission: StaffPermission) {
  if (!req.auth) {
    res.status(401).json({ error: 'Sign in is required.' })
    return false
  }
  if (req.auth.role === 'ADMIN') return true
  if (req.auth.role !== 'FORMATOR') {
    res.status(403).json({ error: 'You do not have access to this resource.' })
    return false
  }
  if (req.auth.demo) {
    if (!demoAuthEnabled) {
      res.status(401).json({ error: 'Demo sign-in is disabled.' })
      return false
    }
    if (!req.auth[permission]) {
      res.status(403).json({ error: 'Your administrator has not granted access to this resource.' })
      return false
    }
    return true
  }
  const user = await prisma.user.findUnique({
    where: { id: req.auth.id },
    select: { role: true, isActive: true, canManageUsers: true, canManageDetails: true, canManageUpdates: true },
  })
  if (!user?.isActive || user.role !== 'FORMATOR') {
    res.status(401).json({ error: 'This account is inactive.' })
    return false
  }
  if (!user[permission]) {
    res.status(403).json({ error: 'Your administrator has not granted access to this resource.' })
    return false
  }
  return true
}
function validate<T extends z.ZodType>(schema: T, input: unknown) {
  const result = schema.safeParse(input)
  return result.success ? { data: result.data, error: null } : { data: null, error: result.error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message })) }
}
async function audit(userId: string, action: string, entity: string, entityId: string, meta?: Prisma.InputJsonValue) {
  if (userId.startsWith('local-demo-') && demoAuthEnabled) return
  await prisma.auditLog.create({ data: { userId, action, entity, entityId, meta } })
}
const asyncRoute = (handler: (req: AuthRequest, res: Response) => Promise<unknown>) => (req: Request, res: Response, next: NextFunction) => Promise.resolve(handler(req as AuthRequest, res)).catch(next)
function routeParam(req: Request, name: string): string {
  const value = req.params[name]
  return Array.isArray(value) ? value[0] ?? '' : value ?? ''
}
async function callLightfm<T>(path: string, body?: unknown, timeoutMs = 10_000): Promise<T> {
  if (!lightfmApiToken) throw new Error('Set LIGHTFM_API_TOKEN in server/.env and recommender/.env to enable the LightFM service.')
  const response = await fetch(`${lightfmServiceUrl}${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: {
      Authorization: `Bearer ${lightfmApiToken}`,
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    signal: AbortSignal.timeout(timeoutMs),
  })
  const result = await response.json() as T & { detail?: string }
  if (!response.ok) throw new Error(result.detail || `The LightFM service returned HTTP ${response.status}.`)
  return result
}
async function createEncryptedBackupArchive(payload: unknown) {
  const plaintext = Buffer.from(JSON.stringify(payload), 'utf8')
  if (plaintext.byteLength > maxBackupPlaintextBytes) {
    throw new Error('The system backup is larger than the supported 45 MB limit.')
  }
  const writer = new ZipWriter(new Uint8ArrayWriter())
  await writer.add('carmels-in-communion-backup.json', new TextReader(plaintext.toString('utf8')), {
    password: systemBackupPassword,
    encryptionStrength: 3,
  })
  return Buffer.from(await writer.close())
}

function validateSystemBackupPayload(payload: unknown): { exportedAt: string; tables: Record<string, unknown[]> } {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new Error('Invalid backup payload.')
  const data = payload as Record<string, unknown>
  if (data.format !== systemBackupFormat || data.version !== 1 || typeof data.exportedAt !== 'string'
    || !Number.isFinite(Date.parse(data.exportedAt)) || !data.tables || typeof data.tables !== 'object' || Array.isArray(data.tables)) {
    throw new Error('Invalid backup payload.')
  }
  const tables = data.tables as Record<string, unknown>
  if (Object.keys(tables).length !== backupTables.length) throw new Error('Backup does not contain every application table.')
  for (const table of backupTables) {
    const rows = tables[table.name]
    if (!Array.isArray(rows)) throw new Error(`Backup table ${table.name} is missing.`)
    for (const row of rows) {
      if (!row || typeof row !== 'object' || Array.isArray(row)) throw new Error(`Backup table ${table.name} contains an invalid row.`)
      const record = row as Record<string, unknown>
      if (typeof record.id !== 'string' || Object.keys(record).some((column) => !(table.columns as readonly string[]).includes(column))
        || table.columns.some((column) => !Object.hasOwn(record, column))) {
        throw new Error(`Backup table ${table.name} contains an invalid record shape.`)
      }
    }
  }
  return { exportedAt: data.exportedAt, tables: tables as Record<string, unknown[]> }
}

function decryptLegacySystemBackup(envelopeText: string, password: string): { exportedAt: string; tables: Record<string, unknown[]> } {
  try {
    const envelope: unknown = JSON.parse(envelopeText)
    if (!envelope || typeof envelope !== 'object' || Array.isArray(envelope)) throw new Error('Invalid envelope.')
    const value = envelope as Record<string, unknown>
    const encryption = value.encryption as Record<string, unknown> | null
    if (value.format !== systemBackupFormat || value.version !== 1 || typeof value.exportedAt !== 'string'
      || !Number.isFinite(Date.parse(value.exportedAt)) || !encryption
      || encryption.algorithm !== 'AES-256-GCM' || encryption.keyDerivation !== 'scrypt'
      || typeof encryption.salt !== 'string' || typeof encryption.iv !== 'string'
      || typeof encryption.authTag !== 'string' || typeof value.ciphertext !== 'string') {
      throw new Error('Invalid backup format.')
    }
    const salt = Buffer.from(encryption.salt, 'base64')
    const iv = Buffer.from(encryption.iv, 'base64')
    const authTag = Buffer.from(encryption.authTag, 'base64')
    const ciphertext = Buffer.from(value.ciphertext, 'base64')
    if (salt.byteLength !== 16 || iv.byteLength !== 12 || authTag.byteLength !== 16
      || ciphertext.byteLength > maxBackupPlaintextBytes) throw new Error('Invalid backup data.')
    const key = scryptSync(password, salt, 32)
    const decipher = createDecipheriv('aes-256-gcm', key, iv)
    decipher.setAuthTag(authTag)
    const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()])
    if (plaintext.byteLength > maxBackupPlaintextBytes) throw new Error('Backup exceeds the supported size.')
    const backup = validateSystemBackupPayload(JSON.parse(plaintext.toString('utf8')))
    if (backup.exportedAt !== value.exportedAt) throw new Error('Backup timestamp does not match.')
    return backup
  } catch {
    throw new Error('This backup is invalid, damaged, or cannot be decrypted with the configured password.')
  }
}

async function decryptSystemBackupArchive(archive: Buffer, password: string) {
  const reader = new ZipReader(new Uint8ArrayReader(new Uint8Array(archive)))
  try {
    const entries = await reader.getEntries()
    const entry = entries[0]
    if (entries.length !== 1 || !entry || entry.directory || entry.filename !== 'carmels-in-communion-backup.json'
      || entry.uncompressedSize > maxBackupPlaintextBytes) {
      throw new Error('Invalid backup archive.')
    }
    const payload = JSON.parse(await entry.getData(new TextWriter(), { password }))
    return validateSystemBackupPayload(payload)
  } catch {
    throw new Error('This archive is invalid, damaged, or cannot be opened with the configured password.')
  } finally {
    await reader.close()
  }
}
function backupSqlValue(value: unknown): string | number | boolean | null {
  if (value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value
  if (value instanceof Date) return value.toISOString()
  throw new Error('Backup contains a value of an unsupported type.')
}
function backupValueSql(table: typeof backupTables[number], column: string, row: Record<string, unknown>) {
  const value = row[column]
  if ('jsonColumns' in table && (table.jsonColumns as readonly string[]).includes(column)) {
    return value === null ? Prisma.sql`NULL::jsonb` : Prisma.sql`${JSON.stringify(value)}::jsonb`
  }
  const sqlValue = backupSqlValue(value)
  if (column.endsWith('At')) return sqlValue === null ? Prisma.sql`NULL::timestamp(3)` : Prisma.sql`${sqlValue}::timestamp(3)`
  if (table.name === 'Donation' && column === 'amount') return Prisma.sql`${sqlValue}::numeric(10,2)`
  if (column === 'sortOrder') return Prisma.sql`${sqlValue}::integer`
  const enumType = backupEnumColumns[table.name]?.[column]
  if (enumType) return sqlValue === null ? Prisma.sql`NULL::${Prisma.raw(enumType)}` : Prisma.sql`${sqlValue}::${Prisma.raw(enumType)}`
  return Prisma.sql`${sqlValue}`
}
const backupPasswordSchema = z.string().min(1).max(128)
function isSystemBackupPassword(value: string) {
  const supplied = Buffer.from(value)
  const expected = Buffer.from(systemBackupPassword)
  return supplied.byteLength === expected.byteLength && timingSafeEqual(supplied, expected)
}

app.get('/api/health', (_req, res) => res.json({
  status: 'ok',
  service: 'carmel-in-communion-api',
  demoAuthEnabled,
  xenditConfigured: Boolean(xenditSecretKey),
  xenditEnabled: Boolean(xenditSecretKey && xenditCallbackToken),
}))

app.post('/api/admin/system-backup/export', authenticate, allowRoles('ADMIN'), rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
}), asyncRoute(async (req, res) => {
  const exportedAt = new Date().toISOString()
  const auditUserId = req.auth!.id.startsWith('local-demo-') && demoAuthEnabled ? null : req.auth!.id
  const backupArchive = await prisma.$transaction(async (tx) => {
    await tx.auditLog.create({
      data: {
        userId: auditUserId,
        action: 'SYSTEM_BACKUP_EXPORT',
        entity: 'SystemBackup',
        meta: { exportedAt },
      },
    })
    const tables: Record<string, unknown[]> = {}
    for (const table of backupTables) {
      tables[table.name] = await tx.$queryRaw<Array<Record<string, unknown>>>(
        Prisma.raw(`SELECT * FROM "${table.name}" ORDER BY "id"`),
      )
    }
    return createEncryptedBackupArchive({ format: systemBackupFormat, version: 1, exportedAt, tables })
  }, { maxWait: 10_000, timeout: 120_000 })
  const filename = `carmels-system-backup-${exportedAt.replaceAll(':', '-').replaceAll('.', '-')}.zip`
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('Content-Type', 'application/zip')
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
  res.send(backupArchive)
}))

app.post('/api/admin/system-backup/import', authenticate, allowRoles('ADMIN'), rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 3,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
}), express.raw({ type: ['application/zip', 'application/octet-stream', 'application/x-zip-compressed', 'text/plain'], limit: '64mb' }), asyncRoute(async (req, res) => {
  if (!Buffer.isBuffer(req.body) || req.body.byteLength === 0) return res.status(400).json({ error: 'Select a valid Carmel system backup file.' })
  const password = req.get('x-system-backup-password') || ''
  const parsedPassword = backupPasswordSchema.safeParse(password)
  if (!parsedPassword.success || !isSystemBackupPassword(parsedPassword.data)) return res.status(400).json({ error: 'The backup encryption password is incorrect.' })
  let backup: ReturnType<typeof validateSystemBackupPayload>
  try {
    if (req.body.byteLength > 0 && req.body[0] === 0x50 && req.body[1] === 0x4b) {
      backup = await decryptSystemBackupArchive(req.body, parsedPassword.data)
    } else {
      backup = decryptLegacySystemBackup(req.body.toString('utf8'), parsedPassword.data)
    }
  } catch (error) {
    if (error instanceof Error) return res.status(400).json({ error: error.message })
    throw error
  }
  const importedAt = new Date().toISOString()
  const auditUserId = req.auth!.id.startsWith('local-demo-') && demoAuthEnabled ? null : req.auth!.id
  const result = await prisma.$transaction(async (tx) => {
    let mergedRecords = 0
    let skippedRecords = 0
    const skippedIds = new Map<string, Set<string>>()
    for (const table of backupTables) skippedIds.set(table.name, new Set())
    for (const table of backupTables) {
      const tableSql = Prisma.raw(`"${table.name}"`)
      const columnsSql = Prisma.raw(table.columns.map((column) => `"${column}"`).join(', '))
      const updateSql = Prisma.join(table.columns.filter((column) => column !== 'id').map((column) => {
        const identifier = Prisma.raw(`"${column}"`)
        return Prisma.sql`${identifier} = EXCLUDED.${identifier}`
      }))
      for (const value of backup.tables[table.name]) {
        const row = value as Record<string, unknown>
        if (typeof row.id !== 'string') throw new Error(`Backup table ${table.name} contains an invalid record ID.`)
        const missingParent = (backupDependencies[table.name] || []).some(({ table: parentTable, column }) => {
          const parentId = row[column]
          return typeof parentId === 'string' && skippedIds.get(parentTable)?.has(parentId)
        })
        if (missingParent) {
          skippedRecords += 1
          skippedIds.get(table.name)?.add(row.id)
          continue
        }
        const uniqueClauses = table.uniqueColumns.flatMap((column) => {
          if (row[column] === null) return []
          return [Prisma.sql`${Prisma.raw(`"${column}"`)} = ${backupSqlValue(row[column])}`]
        })
        if (uniqueClauses.length) {
          const conflicts = await tx.$queryRaw<Array<{ id: string }>>(Prisma.sql`
            SELECT "id" FROM ${tableSql}
            WHERE "id" <> ${row.id} AND (${Prisma.join(uniqueClauses, ' OR ')})
            LIMIT 1
          `)
          if (conflicts.length) {
            skippedRecords += 1
            skippedIds.get(table.name)?.add(row.id)
            continue
          }
        }
        const valuesSql = Prisma.join(table.columns.map((column) => backupValueSql(table, column, row)))
        await tx.$executeRaw(Prisma.sql`
          INSERT INTO ${tableSql} (${columnsSql})
          VALUES (${valuesSql})
          ON CONFLICT ("id") DO UPDATE SET ${updateSql}
        `)
        mergedRecords += 1
      }
    }
    await tx.auditLog.create({
      data: {
        userId: auditUserId,
        action: 'SYSTEM_BACKUP_IMPORT',
        entity: 'SystemBackup',
        meta: { backupExportedAt: backup.exportedAt, importedAt, mergedRecords, skippedRecords },
      },
    })
    return { mergedRecords, skippedRecords }
  }, { maxWait: 10_000, timeout: 600_000 })
  res.json({ ...result, backupExportedAt: backup.exportedAt, importedAt, mode: 'merge' })
}))

const memberPrivacyVersion = '2026-10-02'
const registerSchema = z.object({ name: z.string().trim().min(2).max(100), email: z.email().transform((value) => value.toLowerCase()), gender: z.enum(['MALE', 'FEMALE', 'ANONYMOUS']).default('ANONYMOUS'), phone: z.string().trim().min(7).max(30), address: z.string().trim().min(5).max(300), password: z.string().min(10).max(128), privacyConsent: z.literal(true) })
app.post('/api/auth/register', asyncRoute(async (req, res) => {
  const parsed = validate(registerSchema, req.body)
  if (parsed.error) return res.status(400).json({ error: 'Please check the form fields.', details: parsed.error })
  const passwordHash = await bcrypt.hash(parsed.data!.password, 12)
  try {
    const user = await prisma.user.create({ data: { name: parsed.data!.name, email: parsed.data!.email, gender: parsed.data!.gender, phone: parsed.data!.phone, address: parsed.data!.address, passwordHash, role: 'USER', privacyConsentAt: new Date(), privacyPolicyVersion: memberPrivacyVersion, discernment: { create: {} } }, select: { id: true, name: true, email: true, gender: true, phone: true, address: true, role: true } })
    const token = jwt.sign({ id: user.id, role: user.role }, jwtSecret, { expiresIn: '8h' })
    res.cookie('carmel_session', token, { ...cookieOptions, maxAge: 8 * 60 * 60 * 1000 })
    res.status(201).json({ user })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return res.status(409).json({ error: 'An account with this email already exists.' })
    throw error
  }
}))
const offlineDemoEmails = Object.keys(offlineDemoAccounts)
const loginSchema = z.object({
  email: z.string().trim().toLowerCase().refine((value) => z.email().safeParse(value).success || offlineDemoEmails.includes(value)),
  password: z.string().min(1).max(128),
})
app.post('/api/auth/login', asyncRoute(async (req, res) => {
  const parsed = validate(loginSchema, req.body)
  if (parsed.error) return res.status(400).json({ error: 'Enter a valid email and password.' })
  const input = parsed.data!
  if (input.email in offlineDemoAccounts) {
    const demoAccount = offlineDemoAccounts[input.email as keyof typeof offlineDemoAccounts]
    const providedPassword = Buffer.from(input.password)
    const expectedPassword = Buffer.from(offlineDemoPassword)
    const passwordMatches = providedPassword.length === expectedPassword.length && timingSafeEqual(providedPassword, expectedPassword)
    if (!demoAuthEnabled || !passwordMatches) return res.status(401).json({ error: 'Email or password is incorrect.' })
    const id = `local-demo-${demoAccount.role.toLowerCase()}`
    const claims = {
      id,
      role: demoAccount.role,
      demo: true,
      ...(demoAccount.role === 'USER' ? {} : {
        canManageUsers: demoAccount.canManageUsers,
        canManageDetails: demoAccount.canManageDetails,
        canManageUpdates: demoAccount.canManageUpdates,
      }),
    }
    const token = jwt.sign(claims, jwtSecret, { expiresIn: '8h' })
    res.cookie('carmel_session', token, { ...cookieOptions, maxAge: 8 * 60 * 60 * 1000 })
    return res.json({ user: { id, email: input.email, ...demoAccount, demo: true } })
  }
  const user = await prisma.user.findUnique({ where: { email: input.email } })
  if (user) {
    if (!user.isActive || !(await bcrypt.compare(input.password, user.passwordHash))) return res.status(401).json({ error: 'Email or password is incorrect.' })
    if (user.role === 'ADMIN' || user.role === 'FORMATOR') await audit(user.id, 'LOGIN', 'Session', user.id, { role: user.role })
    const token = jwt.sign({ id: user.id, role: user.role }, jwtSecret, { expiresIn: '8h' })
    res.cookie('carmel_session', token, { ...cookieOptions, maxAge: 8 * 60 * 60 * 1000 })
    return res.json({ user: { id: user.id, name: user.name, email: user.email, gender: user.gender, phone: user.phone, address: user.address, role: user.role, canManageUsers: user.canManageUsers, canManageDetails: user.canManageDetails, canManageUpdates: user.canManageUpdates } })
  }
  const providedPassword = Buffer.from(input.password)
  const expectedPassword = Buffer.from(demoAdminPassword)
  const passwordMatches = providedPassword.length === expectedPassword.length && timingSafeEqual(providedPassword, expectedPassword)
  if (demoAuthEnabled && demoAdminEmail && demoAdminPassword && input.email === demoAdminEmail && passwordMatches) {
    const user = { id: 'local-demo-admin', name: 'Local Demo Administrator', email: demoAdminEmail, role: 'ADMIN' as const }
    const token = jwt.sign({ id: user.id, role: user.role, demo: true }, jwtSecret, { expiresIn: '8h' })
    res.cookie('carmel_session', token, { ...cookieOptions, maxAge: 8 * 60 * 60 * 1000 })
    return res.json({ user })
  }
  return res.status(401).json({ error: 'Email or password is incorrect.' })
}))
app.post('/api/auth/logout', asyncRoute(async (req, res) => {
  res.clearCookie('carmel_session', cookieOptions)
  const token = req.cookies?.carmel_session as string | undefined
  if (token) {
    try {
      const claims = jwt.verify(token, jwtSecret) as AuthRequest['auth']
      if (claims?.id && (claims.role === 'ADMIN' || claims.role === 'FORMATOR') && !claims.demo) {
        await audit(claims.id, 'LOGOUT', 'Session', claims.id, { role: claims.role })
      }
    } catch (error) {
      if (!(error instanceof jwt.JsonWebTokenError)) throw error
    }
  }
  res.status(204).end()
}))
app.get('/api/auth/me', authenticate, asyncRoute(async (req, res) => {
  if (req.auth!.demo && demoAuthEnabled) {
    if (req.auth!.id === 'local-demo-admin') {
      return res.json({ user: { id: req.auth!.id, name: 'Local Demo Administrator', email: demoAdminEmail, role: 'ADMIN', isActive: true } })
    }
    const demoEntry = Object.entries(offlineDemoAccounts).find(([, account]) => `local-demo-${account.role.toLowerCase()}` === req.auth!.id)
    if (!demoEntry) return res.status(401).json({ error: 'Demo account not found.' })
    const [email, account] = demoEntry
    return res.json({ user: { id: req.auth!.id, email, ...account, isActive: true, ...req.auth } })
  }
  const user = await prisma.user.findUnique({ where: { id: req.auth!.id }, select: { id: true, name: true, email: true, gender: true, phone: true, address: true, role: true, isActive: true, canManageUsers: true, canManageDetails: true, canManageUpdates: true } })
  if (!user?.isActive) return res.status(401).json({ error: 'This account is inactive.' })
  res.json({ user })
}))
const profileUpdateSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email().transform((value) => value.toLowerCase()),
  gender: z.enum(['MALE', 'FEMALE', 'ANONYMOUS']).optional(),
  phone: z.string().trim().min(7).max(30).optional(),
  address: z.string().trim().min(5).max(300).optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(10).max(128).optional(),
}).refine((input) => !input.newPassword || Boolean(input.currentPassword), { message: 'Enter your current password to set a new password.', path: ['currentPassword'] })
app.patch('/api/auth/me', authenticate, allowRoles('ADMIN', 'FORMATOR', 'USER'), asyncRoute(async (req, res) => {
  if (req.auth!.demo) return res.status(400).json({ error: 'Update this prototype account in its local profile editor.' })
  const parsed = validate(profileUpdateSchema, req.body)
  if (parsed.error) return res.status(400).json({ error: 'Please check the profile fields.', details: parsed.error })
  const input = parsed.data!
  const currentUser = await prisma.user.findUnique({ where: { id: req.auth!.id }, select: { id: true, name: true, email: true, gender: true, phone: true, address: true, passwordHash: true, isActive: true } })
  if (!currentUser?.isActive) return res.status(401).json({ error: 'This account is inactive.' })
  if (input.newPassword && !(await bcrypt.compare(input.currentPassword!, currentUser.passwordHash))) return res.status(400).json({ error: 'Your current password is incorrect.' })
  const data: Prisma.UserUpdateInput = { name: input.name, email: input.email }
  if (input.gender !== undefined) data.gender = input.gender
  if (input.phone !== undefined) data.phone = input.phone
  if (input.address !== undefined) data.address = input.address
  if (input.newPassword) data.passwordHash = await bcrypt.hash(input.newPassword, 12)
  try {
    const user = await prisma.user.update({ where: { id: currentUser.id }, data, select: { id: true, name: true, email: true, gender: true, phone: true, address: true, role: true, isActive: true } })
    await audit(user.id, 'UPDATE_PROFILE', 'User', user.id, {
      nameChanged: currentUser.name !== user.name,
      emailChanged: currentUser.email !== user.email,
      genderChanged: currentUser.gender !== user.gender,
      phoneChanged: currentUser.phone !== user.phone,
      addressChanged: currentUser.address !== user.address,
      passwordChanged: Boolean(input.newPassword),
    })
    res.json({ user })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return res.status(409).json({ error: 'An account with this email already exists.' })
    throw error
  }
}))

const donationSchema = z.object({
  amount: z.coerce.number().finite().min(50).max(10000000),
  payment: z.enum(['GCASH', 'MAYA', 'BANK', 'CARD']),
  anonymous: z.boolean().default(true),
  name: z.string().trim().max(100).optional().default(''),
  email: z.union([z.email(), z.literal('')]).optional().default(''),
  phone: z.string().trim().max(30).optional().default(''),
  receipt: z.boolean().default(false),
  reference: z.string().trim().max(100).optional().default(''),
  fund: z.string().trim().max(150).optional().default('Federation formation program'),
})
app.post('/api/donations', rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: (_req, res) => res.setHeader('Retry-After', '900').status(429).json({
    error: 'Too many donation checkout attempts. Please wait 15 minutes before trying again.',
  }),
}), asyncRoute(async (req, res) => {
  const parsed = validate(donationSchema, req.body)
  if (parsed.error) return res.status(400).json({ error: 'Please check the donation details.', details: parsed.error })
  const input = parsed.data!
  if (!input.anonymous && (!input.name || !input.email)) return res.status(400).json({ error: 'Name and email are required for a named donation.' })
  if (input.receipt && !input.email && !input.phone) return res.status(400).json({ error: 'Add an email or phone number for the receipt.' })
  if (xenditSecretKey) {
    if (!xenditCallbackToken) return res.status(503).json({ error: 'Set XENDIT_CALLBACK_TOKEN in server/.env and configure the matching Xendit webhook before accepting test donations.' })
    const referenceCode = `CARMEL-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`
    const created = await prisma.$transaction(async (tx) => {
      const donation = await tx.donation.create({ data: {
        referenceCode,
        amount: new Prisma.Decimal(input.amount),
        type: 'ONE_TIME',
        fund: input.fund,
        paymentMethod: input.payment,
        isAnonymous: input.anonymous,
        donorName: input.anonymous ? null : input.name || null,
        donorEmail: input.anonymous && !input.receipt ? null : input.email || null,
        donorPhone: input.anonymous && !input.receipt ? null : input.phone || null,
        wantsReceipt: input.receipt,
        status: 'PENDING',
      } })
      await tx.auditLog.create({ data: {
        action: 'DONATION_RECEIVED',
        entity: 'Donation',
        entityId: donation.id,
        meta: {
          referenceCode,
          amount: input.amount,
          fund: input.fund,
          paymentMethod: input.payment,
          status: 'PENDING',
          isAnonymous: input.anonymous,
        },
      } })
      return donation
    })
    const configuredOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173'
    let returnOrigin = configuredOrigin
    if (process.env.NODE_ENV !== 'production') {
      const requestOrigin = req.get('origin')
      if (requestOrigin) {
        try {
          const parsedOrigin = new URL(requestOrigin)
          if (parsedOrigin.hostname === 'localhost' || parsedOrigin.hostname === '127.0.0.1') returnOrigin = parsedOrigin.origin
        } catch {
          // Use the configured client origin when the request Origin header is invalid.
        }
      }
    }
    const redirectUrl = new URL('/donations', returnOrigin)
    redirectUrl.searchParams.set('reference', referenceCode)
    const invoiceData = {
      amount: input.amount,
      currency: 'PHP',
      external_id: referenceCode,
      invoice_duration: 86400,
      description: `Donation to the Federation formation program (${referenceCode})`,
      payment_methods: [{
        GCASH: 'GCASH',
        MAYA: 'PAYMAYA',
        BANK: 'BANK_TRANSFER',
        CARD: 'CARDS',
      }[input.payment]],
      success_redirect_url: `${redirectUrl.toString()}&xendit=success`,
      failure_redirect_url: `${redirectUrl.toString()}&xendit=cancelled`,
      ...(input.email ? { payer_email: input.email } : {}),
    }
    let xenditResponse: Awaited<ReturnType<typeof fetch>>
    try {
      xenditResponse = await fetch('https://api.xendit.co/v2/invoices', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${xenditSecretKey}:`).toString('base64')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
        signal: AbortSignal.timeout(15000),
      })
    } catch (error) {
      console.error('Xendit invoice request failed:', error instanceof Error ? error.message : 'Unknown network error')
      await prisma.donation.update({ where: { id: created.id }, data: { status: 'FAILED' } })
      return res.status(502).json({ error: 'Could not reach Xendit to create checkout. Please try again.' })
    }
    let invoice: { id?: unknown; invoice_url?: unknown; error_code?: unknown }
    try {
      invoice = await xenditResponse.json() as typeof invoice
    } catch {
      console.error(`Xendit returned an unreadable invoice response (HTTP ${xenditResponse.status}).`)
      await prisma.donation.update({ where: { id: created.id }, data: { status: 'FAILED' } })
      return res.status(502).json({ error: 'Xendit returned an unexpected response. Please try again.' })
    }
    if (!xenditResponse.ok || typeof invoice.id !== 'string' || typeof invoice.invoice_url !== 'string') {
      const errorCode = typeof invoice.error_code === 'string' && /^[A-Z0-9_]{2,100}$/.test(invoice.error_code)
        ? invoice.error_code
        : 'UNKNOWN_ERROR'
      console.error(`Xendit invoice request failed (HTTP ${xenditResponse.status}, ${errorCode}).`)
      await prisma.donation.update({ where: { id: created.id }, data: { status: 'FAILED' } })
      if (errorCode === 'UNAVAILABLE_PAYMENT_METHOD_ERROR') {
        const method = { GCASH: 'GCash', MAYA: 'Maya', BANK: 'Bank Transfer', CARD: 'Cards' }[input.payment]
        return res.status(502).json({
          error: `${method} is not enabled for this Xendit account yet. In Xendit Dashboard, open Payment Channels → Activate Payment Channels and request activation. Some channels require account verification. You can use GCash or Maya while waiting.`,
        })
      }
      return res.status(502).json({ error: `Xendit could not create checkout (${errorCode}). Check the API terminal for details.` })
    }
    await prisma.donation.update({
      where: { id: created.id },
      data: { xenditInvoiceId: invoice.id, xenditInvoiceUrl: invoice.invoice_url },
    })
    return res.status(201).json({
      donation: {
        referenceCode,
        amount: created.amount,
        paymentMethod: created.paymentMethod,
        isAnonymous: created.isAnonymous,
        status: created.status,
        createdAt: created.createdAt,
      },
      invoiceUrl: invoice.invoice_url,
    })
  }
  const isDemoPayment = demoAuthEnabled && input.reference.trim().toLowerCase() === 'carmelites'
  const referenceCode = `CARMEL-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`
  const retainName = !input.anonymous
  const donation = await prisma.$transaction(async (tx) => {
    const created = await tx.donation.create({ data: {
      referenceCode,
      amount: new Prisma.Decimal(input.amount),
      type: 'ONE_TIME',
      fund: input.fund,
      paymentMethod: input.payment,
      isAnonymous: input.anonymous,
      donorName: retainName ? input.name || null : null,
      donorEmail: retainName || input.receipt ? input.email || null : null,
      donorPhone: retainName || input.receipt ? input.phone || null : null,
      wantsReceipt: input.receipt,
      paymentReference: input.reference || null,
      status: isDemoPayment ? 'COMPLETED' : input.reference ? 'RECONCILING' : 'PENDING',
    }, select: { id: true, referenceCode: true, amount: true, paymentMethod: true, isAnonymous: true, status: true, createdAt: true } })
    await tx.auditLog.create({ data: {
      action: 'DONATION_RECEIVED',
      entity: 'Donation',
      entityId: created.id,
      meta: {
        referenceCode: created.referenceCode,
        amount: input.amount,
        fund: input.fund,
        paymentMethod: input.payment,
        status: created.status,
        isAnonymous: input.anonymous,
      },
    } })
    return {
      referenceCode: created.referenceCode,
      amount: created.amount,
      paymentMethod: created.paymentMethod,
      isAnonymous: created.isAnonymous,
      status: created.status,
      createdAt: created.createdAt,
    }
  })
  res.status(201).json({ donation })
}))
app.post('/api/donations/xendit-webhook', asyncRoute(async (req, res) => {
  if (!xenditCallbackToken) return res.status(503).json({ error: 'Xendit webhook verification is not configured.' })
  const callbackToken = req.get('x-callback-token') || ''
  const expectedToken = Buffer.from(xenditCallbackToken)
  const receivedToken = Buffer.from(callbackToken)
  if (expectedToken.length !== receivedToken.length || !timingSafeEqual(expectedToken, receivedToken)) {
    return res.status(401).json({ error: 'Invalid Xendit callback token.' })
  }
  const callbackSchema = z.object({
    external_id: z.string().min(1),
    id: z.string().optional(),
    status: z.string(),
    amount: z.number().finite().positive(),
  }).passthrough()
  const parsedCallback = callbackSchema.safeParse(req.body)
  if (!parsedCallback.success) return res.status(400).json({ error: 'Invalid Xendit invoice notification.' })
  const callback = parsedCallback.data
  if (callback.status !== 'PAID' && callback.status !== 'EXPIRED') return res.json({ received: true })
  const donation = await prisma.donation.findUnique({
    where: { referenceCode: callback.external_id },
    select: { id: true, referenceCode: true, amount: true, status: true, xenditInvoiceId: true },
  })
  if (!donation) return res.status(404).json({ error: 'Donation for this Xendit invoice was not found.' })
  if (callback.id && donation.xenditInvoiceId && callback.id !== donation.xenditInvoiceId) {
    return res.status(409).json({ error: 'Xendit invoice ID does not match the donation.' })
  }
  if (callback.status === 'PAID' && !donation.amount.equals(new Prisma.Decimal(callback.amount))) {
    return res.status(400).json({ error: 'Xendit invoice amount does not match the donation.' })
  }
  if (donation.status === 'COMPLETED') return res.json({ received: true })
  const nextStatus = callback.status === 'PAID' ? 'COMPLETED' : 'FAILED'
  await prisma.$transaction(async (tx) => {
    await tx.donation.update({ where: { id: donation.id }, data: { status: nextStatus } })
    await tx.auditLog.create({ data: {
      action: callback.status === 'PAID' ? 'DONATION_PAID' : 'DONATION_EXPIRED',
      entity: 'Donation',
      entityId: donation.id,
      meta: { referenceCode: donation.referenceCode, status: nextStatus },
    } })
  })
  res.json({ received: true })
}))
app.get('/api/donations/mine', authenticate, allowRoles('USER'), asyncRoute(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.auth!.id }, select: { email: true, isActive: true } })
  if (!user?.isActive) return res.status(401).json({ error: 'This account is inactive.' })
  const donations = await prisma.donation.findMany({ where: { donorEmail: user.email }, orderBy: { createdAt: 'desc' }, select: { referenceCode: true, amount: true, paymentMethod: true, status: true, createdAt: true, fund: true } })
  res.json({ donations })
}))
const discernmentStages = ['EXPLORING', 'PRAYING_AND_LEARNING', 'READY_TO_VISIT', 'IN_CONVERSATION'] as const
const discernmentSchema = z.object({ monastery: z.string().trim().max(150).default(''), note: z.string().trim().max(5000).default('') })
const memberMessageSchema = z.object({ body: z.string().trim().min(1).max(5000) })
app.get('/api/discernment/mine', authenticate, allowRoles('USER'), asyncRoute(async (req, res) => {
  const discernment = await prisma.discernment.upsert({ where: { userId: req.auth!.id }, update: {}, create: { userId: req.auth!.id } })
  res.json({ discernment })
}))
app.patch('/api/discernment/mine', authenticate, allowRoles('USER'), asyncRoute(async (req, res) => {
  const parsed = validate(discernmentSchema, req.body)
  if (parsed.error) return res.status(400).json({ error: 'Please check your discernment details.', details: parsed.error })
  const discernment = await prisma.discernment.upsert({ where: { userId: req.auth!.id }, update: parsed.data!, create: { userId: req.auth!.id, ...parsed.data! } })
  res.json({ discernment })
}))
app.get('/api/account/staff', authenticate, allowRoles('USER'), asyncRoute(async (_req, res) => {
  const staff = await prisma.user.findMany({
    where: { role: { in: ['ADMIN', 'FORMATOR'] }, isActive: true },
    orderBy: [{ role: 'asc' }, { name: 'asc' }],
    select: { id: true, name: true, role: true },
  })
  res.json({ staff })
}))
app.get('/api/account/conversations', authenticate, allowRoles('USER'), asyncRoute(async (req, res) => {
  const conversations = await prisma.conversation.findMany({
    where: { userId: req.auth!.id },
    orderBy: { lastMessageAt: 'desc' },
    include: {
      staffRecipient: { select: { id: true, name: true, role: true } },
      messages: { orderBy: { createdAt: 'asc' }, include: { sender: { select: { id: true, name: true, role: true } } } },
    },
  })
  const ids = conversations.map(({ id }) => id)
  if (ids.length) {
    await prisma.$transaction([
      prisma.message.updateMany({ where: { conversationId: { in: ids }, senderType: { in: ['ADMIN', 'FORMATOR'] }, readAt: null }, data: { readAt: new Date() } }),
      prisma.conversation.updateMany({ where: { id: { in: ids } }, data: { isRead: true } }),
    ])
  }
  res.json({ conversations })
}))
const newMemberConversationSchema = z.object({
  recipientId: z.string().min(1),
  body: z.string().trim().min(1).max(5000),
})
app.post('/api/account/conversations', authenticate, allowRoles('USER'), asyncRoute(async (req, res) => {
  const parsed = validate(newMemberConversationSchema, req.body)
  if (parsed.error) return res.status(400).json({ error: 'Choose a staff member and enter a message.' })
  const [user, recipient] = await Promise.all([
    prisma.user.findUnique({ where: { id: req.auth!.id }, select: { id: true, name: true, email: true, isActive: true } }),
    prisma.user.findUnique({ where: { id: parsed.data!.recipientId }, select: { id: true, name: true, role: true, isActive: true } }),
  ])
  if (!user?.isActive) return res.status(401).json({ error: 'This account is inactive.' })
  if (!recipient?.isActive || (recipient.role !== 'ADMIN' && recipient.role !== 'FORMATOR')) {
    return res.status(404).json({ error: 'That staff account is unavailable.' })
  }
  const conversation = await prisma.conversation.create({
    data: {
      userId: user.id,
      staffRecipientId: recipient.id,
      name: user.name,
      email: user.email,
      subject: `Message to ${recipient.name}`,
      category: 'DISCERNER',
      isRead: false,
      messages: { create: { senderId: user.id, senderType: 'VISITOR', body: parsed.data!.body } },
    },
    include: {
      staffRecipient: { select: { id: true, name: true, role: true } },
      messages: { orderBy: { createdAt: 'asc' }, include: { sender: { select: { id: true, name: true, role: true } } } },
    },
  })
  res.status(201).json({ conversation })
}))
app.post('/api/account/conversations/:id/messages', authenticate, allowRoles('USER'), asyncRoute(async (req, res) => {
  const parsed = validate(memberMessageSchema, req.body)
  if (parsed.error) return res.status(400).json({ error: 'A message cannot be empty.' })
  const conversation = await prisma.conversation.findFirst({
    where: { id: routeParam(req, 'id'), userId: req.auth!.id },
    select: { id: true },
  })
  if (!conversation) return res.status(404).json({ error: 'Conversation not found.' })
  const updated = await prisma.$transaction(async (tx) => {
    await tx.message.create({ data: { conversationId: conversation.id, senderId: req.auth!.id, senderType: 'VISITOR', body: parsed.data!.body } })
    await tx.conversation.update({ where: { id: conversation.id }, data: { isRead: false, lastMessageAt: new Date() } })
    return tx.conversation.findUniqueOrThrow({
      where: { id: conversation.id },
      include: {
        staffRecipient: { select: { id: true, name: true, role: true } },
        messages: { orderBy: { createdAt: 'asc' }, include: { sender: { select: { id: true, name: true, role: true } } } },
      },
    })
  })
  res.status(201).json({ conversation: updated })
}))
app.get('/api/account/conversation', authenticate, allowRoles('USER'), asyncRoute(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.auth!.id }, select: { id: true, name: true, email: true, isActive: true } })
  if (!user?.isActive) return res.status(401).json({ error: 'This account is inactive.' })
  const conversation = await prisma.conversation.findFirst({
    where: { userId: user.id },
    orderBy: { lastMessageAt: 'desc' },
    include: { messages: { orderBy: { createdAt: 'asc' }, include: { sender: { select: { id: true, name: true, role: true } } } } },
  })
  if (conversation) {
    await prisma.message.updateMany({ where: { conversationId: conversation.id, senderType: { in: ['ADMIN', 'FORMATOR'] }, readAt: null }, data: { readAt: new Date() } })
    await prisma.conversation.update({ where: { id: conversation.id }, data: { isRead: true } })
  }
  res.json({ conversation })
}))
app.post('/api/account/conversation/messages', authenticate, allowRoles('USER'), asyncRoute(async (req, res) => {
  const parsed = validate(memberMessageSchema, req.body)
  if (parsed.error) return res.status(400).json({ error: 'A message cannot be empty.' })
  const user = await prisma.user.findUnique({ where: { id: req.auth!.id }, select: { id: true, name: true, email: true, isActive: true } })
  if (!user?.isActive) return res.status(401).json({ error: 'This account is inactive.' })
  const conversation = await prisma.$transaction(async (tx) => {
    const current = await tx.conversation.findFirst({ where: { userId: user.id }, orderBy: { lastMessageAt: 'desc' }, select: { id: true } })
    const thread = current
      ? await tx.conversation.update({ where: { id: current.id }, data: { isRead: false, lastMessageAt: new Date() } })
      : await tx.conversation.create({ data: { userId: user.id, name: user.name, email: user.email, subject: 'Discernment conversation', category: 'DISCERNER', isRead: false } })
    await tx.message.create({ data: { conversationId: thread.id, senderId: user.id, senderType: 'VISITOR', body: parsed.data!.body } })
    return tx.conversation.findUniqueOrThrow({
      where: { id: thread.id },
      include: { messages: { orderBy: { createdAt: 'asc' }, include: { sender: { select: { id: true, name: true, role: true } } } } },
    })
  })
  res.status(201).json({ conversation })
}))
app.get('/api/donations/:reference', asyncRoute(async (req, res) => {
  const donation = await prisma.donation.findUnique({ where: { referenceCode: routeParam(req, 'reference') }, select: { referenceCode: true, amount: true, paymentMethod: true, isAnonymous: true, status: true, createdAt: true, fund: true } })
  if (!donation) return res.status(404).json({ error: 'Acknowledgment not found.' })
  res.json({ donation })
}))

const contactSchema = z.object({ name: z.string().trim().min(2).max(100), email: z.email(), subject: z.string().trim().min(3).max(160), category: z.enum(['DONATION', 'DISCERNER', 'GENERAL']).default('GENERAL'), message: z.string().trim().min(10).max(5000) })
app.post('/api/contact', asyncRoute(async (req, res) => {
  const parsed = validate(contactSchema, req.body)
  if (parsed.error) return res.status(400).json({ error: 'Please check the message form.', details: parsed.error })
  const input = parsed.data!
  const conversation = await prisma.conversation.create({ data: { name: input.name, email: input.email, subject: input.subject, category: input.category, messages: { create: { senderType: 'VISITOR', body: input.message } } }, select: { id: true, createdAt: true } })
  res.status(201).json({ conversationId: conversation.id, received: true })
}))
const publicChatStartSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email().transform((value) => value.toLowerCase()),
  body: z.string().trim().min(1).max(5000),
})
function visitorChatId(req: Request): string | null {
  const token = req.cookies?.carmel_chat_session as string | undefined
  if (!token) return null
  try {
    const claims = jwt.verify(token, jwtSecret)
    if (typeof claims === 'string' || claims.purpose !== 'visitor-chat' || typeof claims.conversationId !== 'string') return null
    return claims.conversationId
  } catch {
    return null
  }
}
app.post('/api/chat/conversations', rateLimit({ windowMs: 15 * 60 * 1000, limit: 5, standardHeaders: 'draft-8', legacyHeaders: false }), asyncRoute(async (req, res) => {
  const parsed = validate(publicChatStartSchema, req.body)
  if (parsed.error) return res.status(400).json({ error: 'Enter your name, a valid email, and a message.' })
  const conversation = await prisma.conversation.create({
    data: {
      name: parsed.data!.name,
      email: parsed.data!.email,
      subject: 'Website chat',
      category: 'GENERAL',
      messages: { create: { senderType: 'VISITOR', body: parsed.data!.body } },
    },
    include: { messages: { orderBy: { createdAt: 'asc' }, include: { sender: { select: { id: true, name: true, role: true } } } } },
  })
  const token = jwt.sign({ purpose: 'visitor-chat', conversationId: conversation.id }, jwtSecret, { expiresIn: '30d' })
  res.cookie('carmel_chat_session', token, { ...visitorChatCookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 })
  res.status(201).json({ conversation, unreadCount: 0 })
}))
app.get('/api/chat/conversation', asyncRoute(async (req, res) => {
  const conversationId = visitorChatId(req)
  if (!conversationId) {
    res.clearCookie('carmel_chat_session', visitorChatCookieOptions)
    return res.json({ conversation: null, unreadCount: 0 })
  }
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { messages: { orderBy: { createdAt: 'asc' }, include: { sender: { select: { id: true, name: true, role: true } } } } },
  })
  if (!conversation) {
    res.clearCookie('carmel_chat_session', visitorChatCookieOptions)
    return res.json({ conversation: null, unreadCount: 0 })
  }
  const unreadCount = conversation.messages.filter((message) => message.senderType !== 'VISITOR' && !message.readAt).length
  res.json({ conversation, unreadCount })
}))
app.post('/api/chat/conversation/read', asyncRoute(async (req, res) => {
  const conversationId = visitorChatId(req)
  if (!conversationId) return res.status(401).json({ error: 'Start a conversation to continue chatting.' })
  const conversation = await prisma.conversation.findUnique({ where: { id: conversationId }, select: { id: true } })
  if (!conversation) return res.status(404).json({ error: 'This conversation is no longer available.' })
  await prisma.$transaction([
    prisma.message.updateMany({ where: { conversationId, senderType: { in: ['ADMIN', 'FORMATOR'] }, readAt: null }, data: { readAt: new Date() } }),
    prisma.conversation.update({ where: { id: conversationId }, data: { isRead: true } }),
  ])
  res.status(204).end()
}))
app.post('/api/chat/messages', rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: 'draft-8', legacyHeaders: false }), asyncRoute(async (req, res) => {
  const conversationId = visitorChatId(req)
  if (!conversationId) return res.status(401).json({ error: 'Start a conversation to continue chatting.' })
  const parsed = validate(memberMessageSchema, req.body)
  if (parsed.error) return res.status(400).json({ error: 'A message cannot be empty.' })
  const conversation = await prisma.conversation.findUnique({ where: { id: conversationId }, select: { id: true } })
  if (!conversation) return res.status(404).json({ error: 'This conversation is no longer available.' })
  const updated = await prisma.$transaction(async (tx) => {
    await tx.message.create({ data: { conversationId, senderType: 'VISITOR', body: parsed.data!.body } })
    await tx.conversation.update({ where: { id: conversationId }, data: { isRead: false, lastMessageAt: new Date() } })
    return tx.conversation.findUniqueOrThrow({
      where: { id: conversationId },
      include: { messages: { orderBy: { createdAt: 'asc' }, include: { sender: { select: { id: true, name: true, role: true } } } } },
    })
  })
  res.status(201).json({ conversation: updated, unreadCount: 0 })
}))

app.get('/api/monasteries', asyncRoute(async (_req, res) => {
  const monasteries = await prisma.monastery.findMany({ orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] })
  res.json({ monasteries })
}))
app.get('/api/updates', asyncRoute(async (_req, res) => {
  const updates = await prisma.update.findMany({ where: { publishedAt: { lte: new Date() } }, orderBy: { publishedAt: 'desc' } })
  res.json({ updates })
}))
app.get('/api/content/:pageKey', asyncRoute(async (req, res) => {
  const content = await prisma.pageContent.findUnique({ where: { pageKey: routeParam(req, 'pageKey').toUpperCase() } })
  if (!content) return res.status(404).json({ error: 'Page content not found.' })
  res.json({ content })
}))
const contentInteractionSchema = z.object({
  readingId: z.string().trim().min(1).max(100),
  type: z.enum(['VIEW', 'BOOKMARK', 'UNBOOKMARK']),
})
app.post('/api/content/interactions', asyncRoute(async (req, res) => {
  const parsed = validate(contentInteractionSchema, req.body)
  if (parsed.error) return res.status(400).json({ error: 'Provide a valid Carmelights interaction.' })
  const input = parsed.data!
  const userAgent = req.get('user-agent') || ''
  if (/\b(bot|crawler|spider|slurp|headless)\b/i.test(userAgent)) return res.status(204).end()

  const siteContent = await prisma.pageContent.findUnique({ where: { pageKey: 'SITE_MANAGED' }, select: { blocks: true } })
  const blocks = siteContent?.blocks
  const entries = blocks && typeof blocks === 'object' && !Array.isArray(blocks) ? blocks.carmelights : undefined
  const published = Array.isArray(entries) && entries.some((entry) =>
    entry && typeof entry === 'object' && !Array.isArray(entry) && entry.id === input.readingId)
  if (!published) return res.status(404).json({ error: 'This Carmelights teaching is unavailable.' })

  let userId: string | null = null
  const sessionToken = req.cookies?.carmel_session as string | undefined
  if (sessionToken) {
    try {
      const claims = jwt.verify(sessionToken, jwtSecret) as AuthRequest['auth']
      if (claims?.id && claims.role === 'USER' && !claims.demo) {
        const user = await prisma.user.findUnique({
          where: { id: claims.id },
          select: { id: true, isActive: true, privacyConsentAt: true },
        })
        if (user?.isActive && user.privacyConsentAt) userId = user.id
      }
    } catch (error) {
      if (!(error instanceof jwt.JsonWebTokenError)) throw error
    }
  }
  if (input.type !== 'VIEW' && !userId) return res.status(204).end()

  let visitorKey = req.cookies?.carmel_analytics_visitor as string | undefined
  if (!visitorKey || !/^[0-9a-f-]{36}$/i.test(visitorKey)) {
    visitorKey = randomUUID()
    res.cookie('carmel_analytics_visitor', visitorKey, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/content/interactions',
      maxAge: 24 * 60 * 60 * 1000,
    })
  }
  const now = new Date()
  const identity = userId || visitorKey
  const bucket = input.type === 'VIEW'
    ? now.toISOString().slice(0, 10)
    : String(Math.floor(now.getTime() / 60_000))
  const dedupeKey = createHash('sha256')
    .update(`${identity}\0${input.readingId}\0${input.type}\0${bucket}`)
    .digest('hex')

  if (userId && input.type !== 'VIEW') {
    const latestBookmark = await prisma.$queryRaw<Array<{ eventType: string }>>(Prisma.sql`
      SELECT "eventType"
      FROM "ContentInteraction"
      WHERE "userId" = ${userId}
        AND "readingId" = ${input.readingId}
        AND "eventType" IN ('BOOKMARK'::"ContentInteractionType", 'UNBOOKMARK'::"ContentInteractionType")
      ORDER BY "createdAt" DESC
      LIMIT 1
    `)
    if (latestBookmark[0]?.eventType === input.type) return res.status(204).end()
  }
  await prisma.$executeRaw(Prisma.sql`
    INSERT INTO "ContentInteraction" ("id", "userId", "readingId", "eventType", "dedupeKey", "createdAt")
    VALUES (${randomUUID()}, ${userId}, ${input.readingId}, ${input.type}::"ContentInteractionType", ${dedupeKey}, ${now})
    ON CONFLICT ("dedupeKey") DO NOTHING
  `)
  res.status(204).end()
}))
const managedMonasterySchema = z.object({
  id: z.string().min(1).max(100),
  name: z.string().trim().min(1).max(200),
  city: z.string().trim().min(1).max(100),
  description: z.string().max(5000),
  projectTitle: z.string().max(200),
  projectDetails: z.string().max(5000),
  image: z.string().max(3_000_000),
})
const managedArticleSchema = z.object({
  id: z.string().min(1).max(100),
  title: z.string().trim().min(1).max(200),
  author: z.string().max(200),
  body: z.string().max(100_000),
  image: z.string().max(3_000_000),
})
const managedSiteContentSchema = z.object({
  homeHeroImage: z.string().max(3_000_000),
  monasteries: z.array(managedMonasterySchema).max(100),
  carmelife: z.array(managedArticleSchema).max(200),
  carmelights: z.array(managedArticleSchema).max(200),
})
const managedUpdatesSchema = z.array(z.object({
  id: z.string().min(1).max(100),
  title: z.string().trim().min(1).max(200),
  date: z.string().min(1).max(100),
  category: z.string().min(1).max(100),
  image: z.string().max(3_000_000),
  body: z.string().max(100_000),
})).max(500)
const homeHeroImageSchema = z.object({ image: z.string().trim().min(1).max(3_000_000) })
const homeSectionImageSchema = z.object({
  section: z.enum(['about', 'carmelife', 'carmelights', 'updates', 'monasteries', 'donations', 'contact']),
  image: z.string().trim().min(1).max(3_000_000),
})
app.put('/api/admin/content/home-hero-image', authenticate, asyncRoute(async (req, res) => {
  if (!await authorizeStaffPermission(req, res, 'canManageDetails')) return
  const parsed = validate(homeHeroImageSchema, req.body)
  if (parsed.error) return res.status(400).json({ error: 'Provide a valid homepage image.' })
  const content = await prisma.pageContent.upsert({
    where: { pageKey: 'HOME_HERO_IMAGE' },
    update: { blocks: { image: parsed.data!.image } },
    create: { pageKey: 'HOME_HERO_IMAGE', blocks: { image: parsed.data!.image } },
  })
  await audit(req.auth!.id, 'UPDATE_CONTENT', 'PageContent', content.id, { pageKey: 'HOME_HERO_IMAGE' })
  res.json({ content })
}))
app.put('/api/admin/content/home-section-image', authenticate, asyncRoute(async (req, res) => {
  if (!await authorizeStaffPermission(req, res, 'canManageDetails')) return
  const parsed = validate(homeSectionImageSchema, req.body)
  if (parsed.error) return res.status(400).json({ error: 'Provide a valid homepage section image.' })
  const pageKey = 'HOME_SECTION_IMAGES'
  const existing = await prisma.pageContent.findUnique({ where: { pageKey } })
  const currentBlocks = existing?.blocks && typeof existing.blocks === 'object' && !Array.isArray(existing.blocks) ? existing.blocks : {}
  const blocks = { ...currentBlocks, [parsed.data!.section]: parsed.data!.image }
  const content = await prisma.pageContent.upsert({
    where: { pageKey },
    update: { blocks: blocks as Prisma.InputJsonValue },
    create: { pageKey, blocks: blocks as Prisma.InputJsonValue },
  })
  await audit(req.auth!.id, 'UPDATE_CONTENT', 'PageContent', content.id, { pageKey, section: parsed.data!.section })
  res.json({ content })
}))
app.put('/api/admin/content/:pageKey', authenticate, asyncRoute(async (req, res) => {
  const pageKey = routeParam(req, 'pageKey').toUpperCase()
  if (pageKey !== 'SITE_MANAGED' && pageKey !== 'SITE_UPDATES') return res.status(404).json({ error: 'Editable content section not found.' })
  if (!await authorizeStaffPermission(req, res, pageKey === 'SITE_MANAGED' ? 'canManageDetails' : 'canManageUpdates')) return
  const parsed = pageKey === 'SITE_MANAGED'
    ? validate(z.object({ blocks: managedSiteContentSchema }), req.body)
    : validate(z.object({ blocks: managedUpdatesSchema }), req.body)
  if (parsed.error) return res.status(400).json({ error: 'Please check the website content before saving.', details: parsed.error })
  const content = await prisma.pageContent.upsert({
    where: { pageKey },
    update: { blocks: parsed.data!.blocks as Prisma.InputJsonValue },
    create: { pageKey, blocks: parsed.data!.blocks as Prisma.InputJsonValue },
  })
  await audit(req.auth!.id, 'UPDATE_CONTENT', 'PageContent', content.id, { pageKey })
  res.json({ content })
}))
app.get('/api/faqs', asyncRoute(async (_req, res) => {
  const faqs = await prisma.fAQ.findMany({ where: { isPublished: true }, orderBy: { sortOrder: 'asc' } })
  res.json({ faqs })
}))

app.get('/api/admin/dashboard', authenticate, allowRoles('ADMIN'), asyncRoute(async (_req, res) => {
  const now = new Date()
  const yearStart = new Date(now.getFullYear(), 0, 1)
  const yearEnd = new Date(now.getFullYear() + 1, 0, 1)
  const confirmedWhere: Prisma.DonationWhereInput = { status: { in: ['VERIFIED', 'COMPLETED'] } }
  const [confirmed, confirmedCount, monthlyRecords, anonymousCount, identifiedCount, recentDonations] = await Promise.all([
    prisma.donation.aggregate({ where: confirmedWhere, _sum: { amount: true } }),
    prisma.donation.count({ where: confirmedWhere }),
    prisma.donation.findMany({
      where: { ...confirmedWhere, createdAt: { gte: yearStart, lt: yearEnd } },
      select: { amount: true, createdAt: true },
    }),
    prisma.donation.count({ where: { ...confirmedWhere, isAnonymous: true } }),
    prisma.donation.count({ where: { ...confirmedWhere, isAnonymous: false } }),
    prisma.donation.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      select: {
        id: true,
        fund: true,
        amount: true,
        isAnonymous: true,
        donorName: true,
        status: true,
        createdAt: true,
        beneficiaryMonastery: { select: { name: true } },
      },
    }),
  ])
  const monthly = Array.from({ length: 12 }, (_, index) => ({
    month: new Date(now.getFullYear(), index, 1).toLocaleString('en-US', { month: 'short' }),
    amount: 0,
    donations: 0,
  }))
  for (const donation of monthlyRecords) {
    const month = donation.createdAt.getMonth()
    monthly[month].amount += Number(donation.amount)
    monthly[month].donations += 1
  }
  res.json({
    summary: {
      confirmedAmount: Number(confirmed._sum?.amount ?? 0),
      confirmedCount,
      anonymousCount,
      identifiedCount,
    },
    monthly,
    recentDonations,
  })
}))

app.get('/api/admin/carmelights/analytics', authenticate, asyncRoute(async (req, res) => {
  if (!await authorizeStaffPermission(req, res, 'canManageDetails')) return
  const content = await prisma.pageContent.findUnique({ where: { pageKey: 'SITE_MANAGED' }, select: { blocks: true } })
  const blocks = content?.blocks
  const entries = blocks && typeof blocks === 'object' && !Array.isArray(blocks) && Array.isArray(blocks.carmelights)
    ? blocks.carmelights.filter((entry): entry is Prisma.JsonObject => Boolean(entry && typeof entry === 'object' && !Array.isArray(entry) && typeof entry.id === 'string'))
    : []
  const published = new Map(entries.map((entry) => [entry.id as string, {
    id: entry.id as string,
    title: typeof entry.title === 'string' ? entry.title : 'Untitled teaching',
    author: typeof entry.author === 'string' ? entry.author : '',
  }]))
  const readingIds = [...published.keys()]
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const [viewTotals, readerTotals, viewCounts, bookmarkCounts] = await Promise.all([
    prisma.$queryRaw<Array<{ count: bigint }>>(Prisma.sql`
      SELECT COUNT(*) AS count FROM "ContentInteraction" AS interaction
      WHERE interaction."eventType" = 'VIEW'::"ContentInteractionType"
        AND interaction."createdAt" >= ${since}
        AND interaction."readingId" = ANY(${readingIds}::text[])
    `),
    prisma.$queryRaw<Array<{ count: bigint }>>(Prisma.sql`
      SELECT COUNT(DISTINCT interaction."userId") AS count
      FROM "ContentInteraction" AS interaction
      JOIN "User" AS account ON account."id" = interaction."userId"
      WHERE interaction."eventType" = 'VIEW'::"ContentInteractionType"
        AND account."isActive" = true
        AND account."privacyConsentAt" IS NOT NULL
        AND interaction."createdAt" >= ${since}
        AND interaction."readingId" = ANY(${readingIds}::text[])
    `),
    prisma.$queryRaw<Array<{ readingId: string; views: bigint }>>(Prisma.sql`
      SELECT "readingId", COUNT(*) AS views FROM "ContentInteraction"
      WHERE "eventType" = 'VIEW'::"ContentInteractionType"
        AND "createdAt" >= ${since}
        AND "readingId" = ANY(${readingIds}::text[])
      GROUP BY "readingId"
      ORDER BY views DESC
      LIMIT 10
    `),
    prisma.$queryRaw<Array<{ readingId: string; bookmarks: bigint }>>(Prisma.sql`
      SELECT "readingId", COUNT(*) AS bookmarks
      FROM (
        SELECT DISTINCT ON (interaction."userId", interaction."readingId") interaction."userId", interaction."readingId", interaction."eventType"
        FROM "ContentInteraction" AS interaction
        JOIN "User" AS account ON account."id" = interaction."userId"
        WHERE interaction."userId" IS NOT NULL
          AND account."isActive" = true
          AND account."privacyConsentAt" IS NOT NULL
          AND interaction."eventType" IN ('BOOKMARK'::"ContentInteractionType", 'UNBOOKMARK'::"ContentInteractionType")
          AND interaction."readingId" = ANY(${readingIds}::text[])
        ORDER BY interaction."userId", interaction."readingId", interaction."createdAt" DESC, interaction."id" DESC
      ) AS current_bookmarks
      WHERE "eventType" = 'BOOKMARK'::"ContentInteractionType"
      GROUP BY "readingId"
    `),
  ])
  const bookmarks = new Map(bookmarkCounts.map(({ readingId, bookmarks: count }) => [readingId, Number(count)]))
  let recommendationModel: { status: string; modelVersion: string | null; trainedAt: string | null; evaluation: Record<string, unknown> | null; configuration: Record<string, string | number> | null } = {
    status: lightfmApiToken ? 'unavailable' : 'not_configured',
    modelVersion: null,
    trainedAt: null,
    evaluation: null,
    configuration: null,
  }
  if (lightfmApiToken) {
    try {
      const health = await callLightfm<{
        model_available: boolean
        model_version: string | null
        trained_at: string | null
        evaluation: Record<string, unknown> | null
        configuration: Record<string, string | number> | null
      }>('/health')
      recommendationModel = {
        status: health.model_available ? 'ready' : 'not_trained',
        modelVersion: health.model_version,
        trainedAt: health.trained_at,
        evaluation: health.evaluation,
        configuration: health.configuration,
      }
    } catch (error) {
      console.warn('LightFM health check failed:', error instanceof Error ? error.message : 'Unknown error')
    }
  }
  res.json({
    windowDays: 30,
    totalViews: Number(viewTotals[0]?.count ?? 0),
    loggedInReaders: Number(readerTotals[0]?.count ?? 0),
    totalBookmarks: [...bookmarks.values()].reduce((sum, count) => sum + count, 0),
    recommendationModel,
    teachings: viewCounts.flatMap(({ readingId, views }) => {
      const reading = published.get(readingId)
      return reading ? [{ ...reading, views: Number(views), bookmarks: bookmarks.get(readingId) || 0 }] : []
    }),
  })
}))

app.post('/api/admin/carmelights/train', authenticate, rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 1,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Model training was recently requested. Please wait 15 minutes before trying again.' },
}), asyncRoute(async (req, res) => {
  if (!await authorizeStaffPermission(req, res, 'canManageDetails')) return
  const content = await prisma.pageContent.findUnique({ where: { pageKey: 'SITE_MANAGED' }, select: { blocks: true } })
  const blocks = content?.blocks
  const entries = blocks && typeof blocks === 'object' && !Array.isArray(blocks) && Array.isArray(blocks.carmelights)
    ? blocks.carmelights.flatMap((entry) => {
      const parsed = managedArticleSchema.safeParse(entry)
      return parsed.success ? [parsed.data] : []
    })
    : []
  if (!entries.length) return res.status(400).json({ error: 'Publish at least one Carmelights teaching before training the model.' })
  const interactions = await prisma.$queryRaw<Array<{ userId: string; readingId: string; eventType: 'VIEW' | 'BOOKMARK' | 'UNBOOKMARK'; createdAt: Date }>>(Prisma.sql`
    SELECT DISTINCT ON (interaction."userId", interaction."readingId", interaction."eventType") interaction."userId", interaction."readingId", interaction."eventType", interaction."createdAt"
    FROM "ContentInteraction" AS interaction
    JOIN "User" AS account ON account."id" = interaction."userId"
    WHERE interaction."userId" IS NOT NULL
      AND account."isActive" = true
      AND account."privacyConsentAt" IS NOT NULL
      AND interaction."eventType" IN ('VIEW'::"ContentInteractionType", 'BOOKMARK'::"ContentInteractionType", 'UNBOOKMARK'::"ContentInteractionType")
      AND interaction."readingId" = ANY(${entries.map((entry) => entry.id)}::text[])
    ORDER BY interaction."userId", interaction."readingId", interaction."eventType", interaction."createdAt" DESC
    LIMIT 500000
  `)
  try {
    const training = await callLightfm<{
      status: string
      users: number
      readings: number
      interactions: number
      model_version: string | null
      trained_at: string | null
      configuration: Record<string, string | number>
      evaluation: Record<string, unknown>
    }>('/train', {
      readings: entries.map(({ id, title, author, body }) => ({ id, title, author, body, published: true })),
      interactions: interactions.map((interaction) => ({
        user_id: interaction.userId,
        reading_id: interaction.readingId,
        event_type: interaction.eventType,
        created_at: interaction.createdAt.toISOString(),
      })),
    }, 10 * 60 * 1000)
    await audit(req.auth!.id, 'TRAIN_RECOMMENDER', 'Carmelights', training.model_version || 'insufficient-data', {
      status: training.status,
      users: training.users,
      readings: training.readings,
      interactions: training.interactions,
      modelVersion: training.model_version,
    })
    res.json(training)
  } catch (error) {
    console.error('Carmelights model training failed:', error instanceof Error ? error.message : 'Unknown error')
    res.status(503).json({ error: error instanceof Error ? error.message : 'LightFM model training failed.' })
  }
}))

app.get('/api/recommendations', authenticate, allowRoles('USER'), asyncRoute(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.auth!.id },
    select: { id: true, isActive: true, privacyConsentAt: true },
  })
  if (!user?.isActive) return res.status(401).json({ error: 'This account is inactive.' })
  const content = await prisma.pageContent.findUnique({ where: { pageKey: 'SITE_MANAGED' }, select: { blocks: true } })
  const blocks = content?.blocks
  const entries = blocks && typeof blocks === 'object' && !Array.isArray(blocks) && Array.isArray(blocks.carmelights)
    ? blocks.carmelights.flatMap((entry) => {
      const parsed = managedArticleSchema.safeParse(entry)
      return parsed.success ? [parsed.data] : []
    })
    : []
  if (!entries.length) return res.json({ source: 'fallback', modelVersion: null, items: [] })
  const ids = entries.map(({ id }) => id)
  const memberInteractions = user.privacyConsentAt
    ? prisma.$queryRaw<Array<{ readingId: string; eventType: 'VIEW' | 'BOOKMARK' | 'UNBOOKMARK'; createdAt: Date }>>(Prisma.sql`
      SELECT "readingId", "eventType", "createdAt"
      FROM (
        SELECT DISTINCT ON ("readingId", "eventType") "readingId", "eventType", "createdAt"
        FROM "ContentInteraction"
        WHERE "userId" = ${user.id}
          AND "readingId" = ANY(${ids}::text[])
          AND "eventType" IN ('VIEW'::"ContentInteractionType", 'BOOKMARK'::"ContentInteractionType", 'UNBOOKMARK'::"ContentInteractionType")
        ORDER BY "readingId", "eventType", "createdAt" DESC
      ) AS latest_events
    `)
    : Promise.resolve([] as Array<{ readingId: string; eventType: 'VIEW' | 'BOOKMARK' | 'UNBOOKMARK'; createdAt: Date }>)
  const [userInteractions, popularity] = await Promise.all([
    memberInteractions,
    prisma.contentInteraction.groupBy({
      by: ['readingId'],
      where: { eventType: 'VIEW', readingId: { in: ids }, createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      _count: { _all: true },
    }),
  ])
  const recentCutoff = Date.now() - 30 * 24 * 60 * 60 * 1000
  const excluded = new Set(userInteractions.filter(({ eventType, createdAt }) => eventType === 'VIEW' && createdAt.getTime() >= recentCutoff).map(({ readingId }) => readingId))
  const latestBookmarkById = new Map<string, { eventType: 'VIEW' | 'BOOKMARK' | 'UNBOOKMARK'; createdAt: Date }>()
  for (const interaction of userInteractions.filter(({ eventType }) => eventType !== 'VIEW')) {
    const current = latestBookmarkById.get(interaction.readingId)
    if (!current || interaction.createdAt > current.createdAt) latestBookmarkById.set(interaction.readingId, interaction)
  }
  const bookmarkedIds = new Set([...latestBookmarkById].flatMap(([readingId, interaction]) => interaction.eventType === 'BOOKMARK' ? [readingId] : []))
  for (const readingId of bookmarkedIds) excluded.add(readingId)
  const historyIds = new Set([
    ...userInteractions.filter(({ eventType, createdAt }) => eventType === 'VIEW' && createdAt.getTime() >= recentCutoff).map(({ readingId }) => readingId),
    ...bookmarkedIds,
  ])
  const popularityById = new Map(popularity.map(({ readingId, _count }) => [readingId, _count._all]))
  const readings = entries.map(({ id, title, author, body }) => ({
    id, title, author, body, published: true, popularity: popularityById.get(id) || 0,
  }))
  const stopWords = new Set(['the', 'and', 'for', 'with', 'from', 'that', 'this', 'into', 'your', 'you', 'are', 'was', 'were', 'our', 'their', 'have', 'has', 'will', 'what', 'when', 'where', 'which', 'who', 'how', 'not', 'but', 'can', 'all', 'one', 'more', 'than', 'through', 'about', 'carmel', 'carmelite', 'saint', 'teaching'])
  const terms = (value: string) => value.toLowerCase().match(/[a-z0-9]{3,}/g)?.filter((word) => !stopWords.has(word)) || []
  const interests = new Set(entries.filter(({ id }) => historyIds.has(id)).flatMap(({ title, author, body }) => [...terms(title), ...terms(author), ...terms(body.slice(0, 5000))]))
  const fallback = () => ({
    source: 'fallback',
    modelVersion: null,
    items: [...entries]
      .filter(({ id }) => !excluded.has(id))
      .sort((left, right) => {
        const score = (entry: typeof left) => {
          const matches = [...terms(`${entry.title} ${entry.author} ${entry.body.slice(0, 5000)}`)].filter((term) => interests.has(term)).length
          return matches * 2 + (popularityById.get(entry.id) || 0)
        }
        return score(right) - score(left)
      })
      .slice(0, 8)
      .map((reading) => ({
        ...reading,
        reason: interests.size && terms(`${reading.title} ${reading.author} ${reading.body.slice(0, 5000)}`).some((term) => interests.has(term))
          ? 'Related to your reading interests'
          : 'Popular Carmelights teaching',
      })),
  })
  if (!lightfmApiToken || !user.privacyConsentAt) return res.json(fallback())
  try {
    const result = await callLightfm<{
      recommendations: Array<{ reading_id: string; score: number; reason: string }>
      source: 'lightfm' | 'fallback'
      model_version: string | null
    }>('/recommend', {
      user_id: user.id,
      readings,
      exclude_ids: [...excluded],
      history_ids: [...historyIds],
      limit: 8,
    })
    const articleById = new Map(entries.map((entry) => [entry.id, entry]))
    res.json({
      source: result.source,
      modelVersion: result.model_version,
      items: result.recommendations.flatMap((recommendation) => {
        const reading = articleById.get(recommendation.reading_id)
        return reading ? [{ ...reading, reason: recommendation.reason }] : []
      }),
    })
  } catch (error) {
    console.warn('LightFM recommendations unavailable; using popularity fallback:', error instanceof Error ? error.message : 'Unknown error')
    res.json(fallback())
  }
}))

app.get('/api/admin/donations', authenticate, allowRoles('ADMIN', 'FORMATOR'), asyncRoute(async (_req, res) => {
  const donations = await prisma.donation.findMany({ orderBy: { createdAt: 'desc' }, include: { beneficiaryMonastery: { select: { name: true } } } })
  res.json({ donations })
}))
const manualDonationSchema = z.object({
  amount: z.coerce.number().finite().min(50).max(10000000),
  fund: z.string().trim().min(1).max(150),
  paymentMethod: z.enum(['GCASH', 'MAYA', 'BANK', 'CARD']),
  type: z.enum(['ONE_TIME', 'MONTHLY']),
  isAnonymous: z.boolean(),
  donorName: z.string().trim().max(100).optional(),
  donorEmail: z.union([z.email(), z.literal('')]).optional(),
  donorPhone: z.string().trim().max(30).optional(),
  paymentReference: z.string().trim().max(100).optional(),
  proof: z.object({
    fileUrl: z.string().max(7000000).regex(/^data:(image\/(?:jpeg|png|webp)|application\/pdf);base64,[A-Za-z0-9+/]+=*$/),
    fileName: z.string().trim().min(1).max(255),
    type: z.enum(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
  }).optional(),
})
app.post('/api/admin/donations', authenticate, allowRoles('ADMIN'), asyncRoute(async (req, res) => {
  const parsed = validate(manualDonationSchema, req.body)
  if (parsed.error) return res.status(400).json({ error: 'Please check the donation details and proof file.' })
  const input = parsed.data!
  if (!input.isAnonymous && !input.donorName) return res.status(400).json({ error: 'Enter the donor name or mark this donation as anonymous.' })
  const donation = await prisma.donation.create({
    data: {
      referenceCode: `CARMEL-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`,
      amount: new Prisma.Decimal(input.amount),
      type: input.type,
      fund: input.fund,
      paymentMethod: input.paymentMethod,
      isManual: true,
      isAnonymous: input.isAnonymous,
      donorName: input.isAnonymous ? null : input.donorName || null,
      donorEmail: input.isAnonymous ? null : input.donorEmail || null,
      donorPhone: input.isAnonymous ? null : input.donorPhone || null,
      paymentReference: input.paymentReference || null,
      status: 'COMPLETED',
      ...(input.proof ? { files: { create: { fileUrl: input.proof.fileUrl, fileName: input.proof.fileName, type: input.proof.type } } } : {}),
    },
    include: { files: true, beneficiaryMonastery: { select: { name: true } } },
  })
  await audit(req.auth!.id, 'RECORD_DONATION', 'Donation', donation.id, { referenceCode: donation.referenceCode, amount: input.amount })
  res.status(201).json({ donation })
}))
const managedUserSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  address: true,
  role: true,
  isActive: true,
  canManageUsers: true,
  canManageDetails: true,
  canManageUpdates: true,
  createdAt: true,
  discernment: { select: { stage: true, monastery: true, updatedAt: true } },
} as const
async function authorizeManagedAccounts(req: AuthRequest, res: Response, allowFormator: boolean) {
  if (!req.auth || (req.auth.demo && !demoAuthEnabled)) {
    res.status(403).json({ error: 'A database-backed staff account is required to manage accounts.' })
    return null
  }
  if (req.auth.demo) {
    if (allowFormator && req.auth.role === 'FORMATOR' && req.auth.canManageUsers) {
      return { id: req.auth.id, role: req.auth.role, isActive: true, canManageUsers: true }
    }
    res.status(403).json({ error: 'You do not have access to manage these accounts.' })
    return null
  }
  const user = await prisma.user.findUnique({
    where: { id: req.auth.id },
    select: { id: true, role: true, isActive: true, canManageUsers: true },
  })
  if (!user?.isActive || (user.role !== 'ADMIN' && !(allowFormator && user.role === 'FORMATOR' && user.canManageUsers))) {
    res.status(403).json({ error: 'You do not have access to manage these accounts.' })
    return null
  }
  return user
}
app.get('/api/admin/users', authenticate, asyncRoute(async (req, res) => {
  const actor = await authorizeManagedAccounts(req, res, true)
  if (!actor) return
  const requestedRole = typeof req.query.role === 'string' ? req.query.role.toUpperCase() : 'ALL'
  if (!['ALL', 'USER', 'FORMATOR'].includes(requestedRole)) return res.status(400).json({ error: 'Choose a valid account type.' })
  if (actor.role !== 'ADMIN' && requestedRole !== 'USER') return res.status(403).json({ error: 'Formators can only view community user accounts.' })
  const roles = requestedRole === 'ALL' ? ['USER', 'FORMATOR'] as const : [requestedRole as 'USER' | 'FORMATOR']
  const [users, userCount, formatorCount] = await Promise.all([
    prisma.user.findMany({ where: { role: { in: [...roles] } }, orderBy: [{ createdAt: 'desc' }, { name: 'asc' }], select: managedUserSelect }),
    prisma.user.count({ where: { role: 'USER' } }),
    actor.role === 'ADMIN' ? prisma.user.count({ where: { role: 'FORMATOR' } }) : Promise.resolve(0),
  ])
  res.json({ users, counts: { USER: userCount, FORMATOR: formatorCount } })
}))
const createFormatorSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email().transform((value) => value.toLowerCase()),
  password: z.string().min(10).max(128),
  canManageUsers: z.boolean().default(false),
  canManageDetails: z.boolean().default(false),
  canManageUpdates: z.boolean().default(false),
})
app.post('/api/admin/users/formators', authenticate, allowRoles('ADMIN'), asyncRoute(async (req, res) => {
  const actor = await authorizeManagedAccounts(req, res, false)
  if (!actor) return
  const parsed = validate(createFormatorSchema, req.body)
  if (parsed.error) return res.status(400).json({ error: 'Please check the Formator account details.', details: parsed.error })
  const input = parsed.data!
  try {
    const passwordHash = await bcrypt.hash(input.password, 12)
    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          name: input.name,
          email: input.email,
          passwordHash,
          role: 'FORMATOR',
          canManageUsers: input.canManageUsers,
          canManageDetails: input.canManageDetails,
          canManageUpdates: input.canManageUpdates,
        },
        select: managedUserSelect,
      })
      await tx.auditLog.create({
        data: { userId: actor.id, action: 'CREATE', entity: 'User', entityId: createdUser.id, meta: { role: createdUser.role } },
      })
      return createdUser
    })
    res.status(201).json({ user })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return res.status(409).json({ error: 'An account with this email already exists.' })
    throw error
  }
}))
const managedAccountUpdateSchema = z.object({
  isActive: z.boolean().optional(),
  canManageUsers: z.boolean().optional(),
  canManageDetails: z.boolean().optional(),
  canManageUpdates: z.boolean().optional(),
}).refine((input) => Object.keys(input).length > 0, { message: 'Choose an account setting to update.' })
app.patch('/api/admin/users/:id', authenticate, asyncRoute(async (req, res) => {
  const actor = await authorizeManagedAccounts(req, res, true)
  if (!actor) return
  const parsed = validate(managedAccountUpdateSchema, req.body)
  if (parsed.error) return res.status(400).json({ error: 'Please provide a valid account update.', details: parsed.error })
  const id = routeParam(req, 'id')
  if (id === actor.id && parsed.data!.isActive === false) return res.status(400).json({ error: 'You cannot disable your own account.' })
  const current = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true } })
  if (!current || current.role === 'ADMIN') return res.status(404).json({ error: 'Managed account not found.' })
  if (actor.role === 'FORMATOR' && (current.role !== 'USER' || Object.keys(parsed.data!).some((key) => key !== 'isActive'))) {
    return res.status(403).json({ error: 'Formators can only change community user account status.' })
  }
  const user = await prisma.user.update({ where: { id }, data: parsed.data!, select: managedUserSelect })
  await audit(actor.id, 'UPDATE', 'User', user.id, parsed.data! as Prisma.InputJsonValue)
  res.json({ user })
}))
const managedPasswordSchema = z.object({ password: z.string().min(10).max(128) })
app.post('/api/admin/users/:id/password', authenticate, allowRoles('ADMIN'), asyncRoute(async (req, res) => {
  const actor = await authorizeManagedAccounts(req, res, false)
  if (!actor) return
  const parsed = validate(managedPasswordSchema, req.body)
  if (parsed.error) return res.status(400).json({ error: 'The new password must be between 10 and 128 characters.', details: parsed.error })
  const id = routeParam(req, 'id')
  const current = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true } })
  if (!current || (current.role !== 'USER' && current.role !== 'FORMATOR')) return res.status(404).json({ error: 'Managed account not found.' })
  const passwordHash = await bcrypt.hash(parsed.data!.password, 12)
  await prisma.user.update({ where: { id }, data: { passwordHash } })
  await audit(actor.id, 'RESET_PASSWORD', 'User', id, { role: current.role })
  res.json({ message: 'Account password updated successfully.' })
}))
app.delete('/api/admin/users/:id', authenticate, allowRoles('ADMIN'), asyncRoute(async (req, res) => {
  const actor = await authorizeManagedAccounts(req, res, false)
  if (!actor) return
  const id = routeParam(req, 'id')
  if (id === actor.id) return res.status(400).json({ error: 'You cannot delete your own account.' })
  const user = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true, name: true } })
  if (!user || user.role === 'ADMIN') return res.status(404).json({ error: 'Managed account not found.' })
  await prisma.user.delete({ where: { id } })
  await audit(actor.id, 'DELETE', 'User', user.id, { name: user.name, role: user.role })
  res.status(204).end()
}))
app.get('/api/admin/discernment', authenticate, allowRoles('ADMIN'), asyncRoute(async (_req, res) => {
  const members = await prisma.user.findMany({ where: { role: 'USER', isActive: true }, select: { id: true } })
  if (members.length) {
    await prisma.discernment.createMany({ data: members.map(({ id }) => ({ userId: id })), skipDuplicates: true })
  }
  const discerners = await prisma.discernment.findMany({ where: { user: { isActive: true } }, orderBy: { updatedAt: 'desc' }, select: { id: true, userId: true, stage: true, monastery: true, updatedAt: true, user: { select: { name: true, email: true } } } })
  res.json({ discerners })
}))
const discernmentStageSchema = z.object({ stage: z.enum(discernmentStages) })
app.patch('/api/admin/discernment/:userId/stage', authenticate, allowRoles('ADMIN'), asyncRoute(async (req, res) => {
  const parsed = validate(discernmentStageSchema, req.body)
  if (parsed.error) return res.status(400).json({ error: 'Choose a valid discernment stage.' })
  const userId = routeParam(req, 'userId')
  const current = await prisma.discernment.findUnique({ where: { userId }, select: { stage: true } })
  if (!current) return res.status(404).json({ error: 'Discernment record not found.' })
  const discernment = await prisma.discernment.update({ where: { userId }, data: { stage: parsed.data!.stage }, select: { userId: true, stage: true, updatedAt: true } })
  await audit(req.auth!.id, 'UPDATE_STAGE', 'Discernment', discernment.userId, { from: current.stage, to: discernment.stage })
  res.json({ discernment })
}))
const statusSchema = z.object({ status: z.enum(['PENDING', 'RECONCILING', 'VERIFIED', 'COMPLETED', 'FAILED']) })
app.patch('/api/admin/donations/:id/status', authenticate, allowRoles('ADMIN', 'FORMATOR'), asyncRoute(async (req, res) => {
  const parsed = validate(statusSchema, req.body)
  if (parsed.error) return res.status(400).json({ error: 'Invalid donation status.' })
  const donationId = routeParam(req, 'id')
  const previous = await prisma.donation.findUnique({ where: { id: donationId }, select: { status: true } })
  if (!previous) return res.status(404).json({ error: 'Donation not found.' })
  const donation = await prisma.donation.update({ where: { id: donationId }, data: { status: parsed.data!.status } })
  await audit(
    req.auth!.id,
    donation.status === 'VERIFIED' && previous.status !== 'VERIFIED'
      ? 'VERIFY_DONATION'
      : donation.status === 'FAILED' && (previous.status === 'PENDING' || previous.status === 'RECONCILING')
        ? 'REJECT_DONATION'
        : 'UPDATE_STATUS',
    'Donation',
    donation.id,
    { from: previous.status, to: donation.status },
  )
  res.json({ donation })
}))
app.get('/api/admin/conversations', authenticate, allowRoles('ADMIN', 'FORMATOR'), asyncRoute(async (_req, res) => {
  const conversations = await prisma.conversation.findMany({
    orderBy: { lastMessageAt: 'desc' },
    include: {
      user: { select: { id: true, role: true, isActive: true } },
      staffRecipient: { select: { id: true, name: true, role: true } },
      messages: { orderBy: { createdAt: 'asc' }, include: { sender: { select: { id: true, name: true, role: true } } } },
    },
  })
  res.json({ conversations })
}))
app.get('/api/admin/notifications', authenticate, allowRoles('ADMIN', 'FORMATOR'), asyncRoute(async (req, res) => {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const isAdmin = req.auth!.role === 'ADMIN'
  const [staffPermissions, unreadMessageCount, recentMessages, recentUsers, recentDonations, recentAuditLogs, recentUpdates, recentContent] = await Promise.all([
    isAdmin ? Promise.resolve(null) : prisma.user.findUnique({ where: { id: req.auth!.id }, select: { canManageUsers: true, canManageDetails: true, canManageUpdates: true } }),
    prisma.message.count({ where: { senderType: 'VISITOR', readAt: null } }),
    prisma.message.findMany({
      where: { senderType: 'VISITOR', OR: [{ readAt: null }, { createdAt: { gte: since } }] },
      orderBy: { createdAt: 'desc' },
      take: 25,
      include: { conversation: { select: { id: true, name: true, subject: true } } },
    }),
    prisma.user.findMany({
      where: { createdAt: { gte: since }, role: { in: ['USER', 'FORMATOR'] } },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, name: true, role: true, createdAt: true },
    }),
    isAdmin ? prisma.donation.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, donorName: true, fund: true, status: true, createdAt: true },
    }) : Promise.resolve([]),
    prisma.auditLog.findMany({
      where: { createdAt: { gte: since }, entity: isAdmin ? { not: 'PageContent' } : { notIn: ['PageContent', 'Donation', 'SystemBackup'] } },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: { id: true, action: true, entity: true, entityId: true, createdAt: true },
    }),
    prisma.update.findMany({
      where: { updatedAt: { gte: since }, publishedAt: { not: null } },
      orderBy: { updatedAt: 'desc' },
      take: 10,
      select: { id: true, title: true, updatedAt: true },
    }),
    prisma.pageContent.findMany({
      where: { updatedAt: { gte: since } },
      orderBy: { updatedAt: 'desc' },
      take: 10,
      select: { id: true, pageKey: true, updatedAt: true },
    }),
  ])
  const canManageUsers = isAdmin || staffPermissions?.canManageUsers === true
  const canManageDetails = isAdmin || staffPermissions?.canManageDetails === true
  const canManageUpdates = isAdmin || staffPermissions?.canManageUpdates === true
  const notifications = [
    ...recentMessages.map((message) => ({
      id: `message-${message.id}`,
      kind: 'message',
      title: `Message from ${message.conversation.name}`,
      description: message.conversation.subject,
      createdAt: message.createdAt,
      href: `/admin/messages?conversation=${encodeURIComponent(message.conversation.id)}`,
      unread: message.readAt === null,
    })),
    ...recentUsers.map((user) => ({
      id: `user-${user.id}`,
      kind: 'account',
      title: user.role === 'USER' ? 'New discerner account' : 'New Formator account',
      description: user.name,
      createdAt: user.createdAt,
      href: canManageUsers ? `/admin/users?role=${user.role}` : '/admin/messages',
      unread: false,
    })),
    ...recentDonations.map((donation) => ({
      id: `donation-${donation.id}`,
      kind: 'donation',
      title: 'New donation received',
      description: `${donation.donorName || 'Anonymous'} · ${donation.fund} · ${donation.status}`,
      createdAt: donation.createdAt,
      href: isAdmin ? '/admin/donations' : '/admin/messages',
      unread: false,
    })),
    ...recentAuditLogs.map((log) => ({
      id: `audit-${log.id}`,
      kind: 'activity',
      title: `${log.action.replaceAll('_', ' ')} · ${log.entity}`,
      description: 'A dashboard record was updated.',
      createdAt: log.createdAt,
      href: log.entity === 'Conversation' ? '/admin/messages' : log.entity === 'Donation' && isAdmin ? '/admin/donations' : log.entity === 'User' && canManageUsers ? '/admin/users?role=USER' : '/admin',
      unread: false,
    })),
    ...recentUpdates.map((update) => ({
      id: `update-${update.id}`,
      kind: 'update',
      title: 'Website update published',
      description: update.title,
      createdAt: update.updatedAt,
      href: canManageUpdates ? '/admin/updates' : '/admin',
      unread: false,
    })),
    ...recentContent.map((content) => ({
      id: `content-${content.id}`,
      kind: 'content',
      title: 'Website content updated',
      description: content.pageKey.replaceAll('_', ' ').toLowerCase(),
      createdAt: content.updatedAt,
      href: canManageDetails ? '/admin/content' : '/admin',
      unread: false,
    })),
  ].sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime()).slice(0, 30)
  res.json({ unreadMessageCount, notifications })
}))
app.post('/api/admin/conversations/:id/read', authenticate, allowRoles('ADMIN', 'FORMATOR'), asyncRoute(async (req, res) => {
  const id = routeParam(req, 'id')
  const conversation = await prisma.conversation.findUnique({ where: { id }, select: { id: true } })
  if (!conversation) return res.status(404).json({ error: 'Conversation not found.' })
  await prisma.$transaction([
    prisma.message.updateMany({ where: { conversationId: id, senderType: 'VISITOR', readAt: null }, data: { readAt: new Date() } }),
    prisma.conversation.update({ where: { id }, data: { isRead: true } }),
  ])
  res.status(204).end()
}))
const replySchema = z.object({ body: z.string().trim().min(1).max(5000) })
app.post('/api/admin/conversations/:id/messages', authenticate, allowRoles('ADMIN', 'FORMATOR'), asyncRoute(async (req, res) => {
  const parsed = validate(replySchema, req.body)
  if (parsed.error) return res.status(400).json({ error: 'A reply cannot be empty.' })
  const conversation = await prisma.conversation.findUnique({ where: { id: routeParam(req, 'id') }, select: { id: true, userId: true } })
  if (!conversation) return res.status(404).json({ error: 'Conversation not found.' })
  const message = await prisma.$transaction(async (tx) => {
    const created = await tx.message.create({ data: { conversationId: conversation.id, senderId: req.auth!.id, senderType: req.auth!.role === 'FORMATOR' ? 'FORMATOR' : 'ADMIN', body: parsed.data!.body } })
    await tx.conversation.update({ where: { id: conversation.id }, data: { lastMessageAt: new Date(), isRead: true } })
    await tx.auditLog.create({ data: { userId: req.auth!.id, action: 'REPLY', entity: 'Conversation', entityId: conversation.id } })
    return created
  })
  res.status(201).json({ message })
}))
app.get('/api/admin/audit', authenticate, allowRoles('ADMIN', 'FORMATOR'), asyncRoute(async (_req, res) => {
  const isAdmin = _req.auth!.role === 'ADMIN'
  const logs = await prisma.auditLog.findMany({
    where: isAdmin
      ? { OR: [
        { user: { is: { role: { in: ['ADMIN', 'FORMATOR'] } } } },
        { entity: 'Donation', action: { in: ['DONATION_RECEIVED', 'DONATION_PAID', 'DONATION_EXPIRED'] } },
        { entity: 'SystemBackup' },
      ] }
      : { user: { is: { role: { in: ['ADMIN', 'FORMATOR'] } } }, entity: { notIn: ['Donation', 'SystemBackup'] } },
    orderBy: { createdAt: 'desc' },
    take: 300,
    include: { user: { select: { name: true, email: true, role: true } } },
  })
  res.json({ logs })
}))

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(error)
  res.status(500).json({ error: 'The request could not be completed. Please try again.' })
})
const server = app.listen(port, () => console.log(`Carmel API listening on http://localhost:${port}`))
async function shutdown() { server.close(); await prisma.$disconnect() }
process.on('SIGINT', () => void shutdown())
process.on('SIGTERM', () => void shutdown())
