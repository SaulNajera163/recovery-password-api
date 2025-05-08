recovery-pass-service

Microservicio Node.js para generación de enlaces de recuperación de contraseña

Este repositorio contiene un microservicio serverless desplegado en Vercel que se encarga de:

Verificar que exista un usuario-estudiante en la base de datos (PostgreSQL) a partir de su correo institucional y número de control.

Regenerar temporalmente la contraseña del usuario (igual al número de control), hashearla en el mismo formato que usa Flask (pbkdf2:sha256:...).

Actualizar el campo password en la tabla user y devolver un recoverLink (p. ej. /recoverpass?user=6).

--- Requisitos

Node.js >= 18

npm (o yarn)

Una base de datos PostgreSQL accesible con las tablas user y student.

--- Variables de entorno

Define en tu dashboard de Vercel (o en .env si lo pruebas local) la clave:

DATABASE_URL=postgresql://admin:sspassdbing@44.222.243.44/ss

Ninguna otra es necesaria para esta función.

--- Despliegue en Vercel (porque es gratis jaja)

Conecta tu repo a Vercel.

En Environment Variables, añade la DATABASE_URL indicada arriba.

Deploy.

Tu endpoint estará en:

PUT https://<tu-proyecto>.vercel.app/api/recover

--- Endpoint /api/recover

Método: PUT

URL: https://<tu-proyecto>.vercel.app/api/recover

Request body (JSON)

{
  "control_number": "<número de control>",
  "email": "<correo institucional>"
}

Respuestas

Código

Situación

Body de respuesta

200

Usuario encontrado y contraseña actualizada

{ "recoverLink": "/recoverpass?user=<user_id>" }

400

Faltan campos (control_number o email)

{ "error": "control_number y email son requeridos" }

404

No existe el usuario

{ "error": "Usuario no encontrado" }

405

Método distinto a PUT

Method Not Allowed

 Ejemplo con curl o igual puedes usar bruno ya que a mi me dio problemas en postman

curl -i -X PUT "https://<tu-proyecto>.vercel.app/api/recover" \
  -H "Content-Type: application/json" \
  -d '{"control_number":"26240210","email":"26240210@leon.tecnm.mx"}'

HTTP/1.1 200 OK
Content-Type: application/json

{"recoverLink":"/recoverpass?user=6"}

 Pasos siguientes (Equipo de Front-end y SMTP para el resto de compañeros en el equipo de Back)

Enviar correo

Usar el recoverLink devuelto para construir el enlace completo:

https://<tu-frontend>.app/recoverpass?user=<user_id>

Integrar con un servicio SMTP (SendGrid, Mailgun, SMTP propio) para notificar al alumno.

Formularios de recuperación (equipo Front-end)

Página /recoverpass que reciba user en query string.

Mostrar formulario para que el usuario ingrese y confirme su nueva contraseña.

API de reset-password

Endpoint separado (Node o Flask) POST /api/reset-password:

Recibe { user_id, new_password }.

Genera hash con werkzeug.generate_password_hash(new_password).

Actualiza user.password en la BD.

Devuelve 200 OK o error si no existe o link expirado.

Flujo completo de UX

Alumno pide recuperar contraseña -> PUT /api/recover -> devuelve recoverLink.

Servicio de correo envía email con enlace.

Alumno abre /recoverpass?user=<id> y define contraseña nueva -> POST /api/reset-password.

Contraseña cambiada, mostrar estado de éxito.

Nota: Este microservicio está pensado para entornos de pruebas o prototipos. Para producción, añade:

Límite de intentos porque este es gratis y aunque tiene buenas prestaciones, es mejor prevenir para evitar abusos.

TTL o tokens únicos en lugar de reusar control_number (aunque eso lleva un poco mas de codigo y mejor servidor (no gratuito)).


