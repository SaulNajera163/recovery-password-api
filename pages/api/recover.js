// /api/recover.js
import Cors from "micro-cors";
import { Pool } from "pg";
import crypto from "crypto";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const cors = Cors({
  origin: "*",                  
  allowMethods: ["PUT", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
});

const handler = async (req, res) => {
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  if (req.method !== "PUT") {
    res.setHeader("Allow", ["PUT", "OPTIONS"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { control_number, email } = req.body || {};
  if (!control_number || !email) {
    return res
      .status(400)
      .json({ error: "control_number y email son requeridos" });
  }

  try {
    // 1) Buscar usuario
    const { rows } = await pool.query(
      `SELECT u.user_id
         FROM "user" u
         JOIN student s ON s.user_id = u.user_id
        WHERE u.institutional_email = $1
          AND s.control_number       = $2
          AND u.deleted_at IS NULL
          AND s.deleted_at IS NULL`,
      [email, control_number]
    );
    if (!rows.length) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    const userId = rows[0].user_id;

    // 2) Generar hash temporal
    const salt = crypto.randomBytes(16).toString("hex");
    const iterations = 150000;
    const derived = crypto
      .pbkdf2Sync(control_number, salt, iterations, 32, "sha256")
      .toString("hex");
    const hash = `pbkdf2:sha256:${iterations}$${salt}$${derived}`;

    await pool.query(
      `UPDATE "user"
          SET password   = $1,
              updated_at = NOW()
        WHERE user_id    = $2`,
      [hash, userId]
    );

    // 3) Construir y enviar enlace
    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/recoverpass?user=${userId}`;
    const appLink = "https://development.d31rkyyefb7sxv.amplifyapp.com/login";

    const resp = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: "Equipo SS", email: process.env.EMAIL_FROM },
        to: [{ email }],
        subject: "Recuperación de contraseña",
        textContent: `Se ha restablecido tu contraseña exitosamente, intenta ingresar nuevamente con tu número de control (${control_number}) como contraseña. Accede aquí: ${appLink}\n\n¡IMPORTANTE! Cambia tu contraseña una vez dentro.`,
        htmlContent: `<p>Se ha restablecido tu contraseña exitosamente, intenta ingresar nuevamente con tu <strong>número de control</strong> (${control_number}) como contraseña. <a href="${appLink}">Acceder</a>.</p>
                      <p><strong>¡IMPORTANTE!</strong> Cambia tu contraseña una vez dentro para mayor seguridad.</p>`,
      }),
    });

    const data = await resp.json();
    console.log("Brevo response:", resp.status, data);
    if (!resp.ok) throw new Error(data.message || "Fallo en envío de correo");

    return res.status(200).json({ recoverLink: `/recoverpass?user=${userId}` });
  } catch (err) {
    console.error("Error en recover.js:", err);
    return res.status(500).json({ error: "Error interno" });
  }
}
