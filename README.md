recovery-password-api

Sistema de recuperación de contraseña para estudiantes, construido con Next.js y PostgreSQL.

Características

Endpoint PUT /api/recover para generar contraseña temporal y enviar correo.

Endpoint POST /api/reset-password para establecer nueva contraseña.

Formulario en /recoverpass para que el usuario ingrese su nueva contraseña.

Envío de correos transaccionales mediante la API de Brevo.

Requisitos

Node.js v18 o superior

PostgreSQL

Cuenta de Brevo con remitente verificado

Instalación

Clonar el repositorio:

git clone https://github.com/SaulNajera163/recovery-password-api.git

Instalar dependencias:

npm install

Configurar variables de entorno en un archivo .env (ver sección abajo).

Variables de entorno

Crear un archivo .env en la raíz con las siguientes variables (usando tus credenciales):

DATABASE_URL=postgresql://20240559:<tu_contraseña>@<host>:<puerto>/<base_de_datos>
BREVO_API_KEY=<tu_api_key_de_brevo>
EMAIL_FROM=20240559@leon.tecnm.mx
NEXT_PUBLIC_BASE_URL=http://localhost:3000

– Reemplaza <tu_contraseña>, <host>, <puerto> y <base_de_datos> según tu configuración.

Scripts disponibles

npm run dev: inicia la aplicación en modo desarrollo.

npm run build: construye la aplicación para producción.

npm run start: ejecuta la aplicación en modo producción.

Uso

Ejecutar en desarrollo:

npm run dev

Enviar petición PUT a /api/recover con JSON de ejemplo (tus credenciales):

{
  "control_number": "20240559",
  "email": "20240559@leon.tecnm.mx"
}

El estudiante recibe un correo con enlace a /recoverpass?user=<userId>.

Abrir el enlace, completar el formulario y enviar nueva contraseña.

Despliegue en Vercel

Conectar el repositorio en Vercel.

Configurar mismas variables de entorno en el dashboard de Vercel.

Cada push a main disparará un nuevo despliegue automático.

El codígo se pasa el project manager para luego al equipo de front-end y agregar al proyeto final.

                                                                                                    Saul Ivan N.L