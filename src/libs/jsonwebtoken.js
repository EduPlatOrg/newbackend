import jwt from 'jsonwebtoken'
import 'dotenv/config'

export function generateTokenAccess(payload) {
  return new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      process.env.TOKEN_SECRET,
      { expiresIn: '7d' },
      (error, token) => {
        if (error) reject(error)
        resolve(token)
      }
    )
  })
}
