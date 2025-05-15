// pages/api/reset-password.js
import { Pool } from 'pg'
import crypto from 'crypto'
import dotenv from 'dotenv'

dotenv.config()
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  const { userId, password } = req.body || {}
  if (!userId || !password) {
    return res.status(400).json({ ok: false, message: 'Faltan datos' })
  }

  try {
    // Genera hash de la nueva contraseña
    const salt       = crypto.randomBytes(16).toString('hex')
    const iterations = 150000
    const derived    = crypto
      .pbkdf2Sync(password, salt, iterations, 64, 'sha256')
      .toString('hex')
    const hash = `pbkdf2:sha256:${iterations}$${salt}$${derived}`

    // Actualiza la contraseña en la base
    await pool.query(
      `UPDATE "user"
          SET password   = $1,
              updated_at = NOW()
        WHERE user_id    = $2`,
      [hash, userId]
    )

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Error en reset-password.js:', err)
    return res.status(500).json({ ok: false, message: 'Error interno' })
  }
}
