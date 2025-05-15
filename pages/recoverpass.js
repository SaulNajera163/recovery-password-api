// pages/recoverpass.js
import { useState } from 'react'
import { useRouter } from 'next/router'

export default function RecoverPass() {
  const router = useRouter()
  const { user } = router.query
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!user) {
      setError('Usuario no identificado')
      return
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden')
      return
    }

    const resp = await fetch('/api/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user, password })
    })
    const json = await resp.json()
    if (!resp.ok || !json.ok) {
      setError(json.message || 'No se pudo actualizar la contraseña')
      return
    }

    setSuccess('Contraseña actualizada correctamente. Ya puedes iniciar sesión.')
  }

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h1>Restablecer contraseña</h1>
      {error   && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      {!success && (
        <form onSubmit={handleSubmit}>
          <label>Nueva contraseña</label><br/>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          /><br/><br/>
          <label>Confirmar contraseña</label><br/>
          <input
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
          /><br/><br/>
          <button type="submit">Cambiar contraseña</button>
        </form>
      )}
    </div>
  )
}
