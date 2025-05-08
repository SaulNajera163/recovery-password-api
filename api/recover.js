import { Pool } from 'pg'
import crypto from 'crypto'
import dotenv from 'dotenv'

dotenv.config()

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    res.setHeader('Allow', ['PUT'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  const { control_number, email } = req.body || {}
  if (!control_number || !email) {
    return res.status(400).json({ error: 'control_number y email son requeridos' })
  }

  try {
    const q = `
      SELECT u.user_id
      FROM "user" u
      JOIN student s ON s.user_id = u.user_id
      WHERE u.institutional_email=$1
        AND s.control_number=$2
        AND u.deleted_at IS NULL
        AND s.deleted_at IS NULL
    `
    const { rows } = await pool.query(q, [email, control_number])
    if (!rows.length) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }
    const userId = rows[0].user_id

    const salt = crypto.randomBytes(16).toString('hex')
    const iterations = 150000
    const derived = crypto
      .pbkdf2Sync(control_number, salt, iterations, 64, 'sha256')
      .toString('hex')
    const werkzeugHash = `pbkdf2:sha256:${iterations}$${salt}$${derived}`

    await pool.query(
      `UPDATE "user" SET password=$1, updated_at=NOW() WHERE user_id=$2`,
      [werkzeugHash, userId]
    )

    return res.status(200).json({ recoverLink: `/recoverpass?user=${userId}` })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Error interno' })
  }
}
