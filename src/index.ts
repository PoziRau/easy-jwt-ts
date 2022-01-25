import crypto from 'crypto'

type JSONValue = string | number | boolean | { [x: string]: JSONValue } | Array<JSONValue>

type JSONObject = {
  [x: string]: JSONValue
}

const sign = (
  payload: JSONObject | null = null,
  secret: crypto.BinaryLike | crypto.KeyObject | null,
  options:
    | { alg?: 'HS256' | 'HS384' | 'HS512'; expireDate?: number }
    | { alg: 'HS256'; expireDate: -1 }
) => {
  const algorithm = options?.alg ?? 'HS256'
  const expiry = options?.expireDate ?? -1

  let crypt = 'sha256'

  if (algorithm === 'HS384') {
    crypt = 'sha384'
  } else if (algorithm === 'HS512') {
    crypt = 'sha512'
  } else if (algorithm !== 'HS256') {
    throw new Error(JSON.stringify({ name: 'SignError', message: 'invalid algorithm' }, null, 2))
  }

  if (!payload) {
    throw new Error(JSON.stringify({ name: 'SignError', message: 'payload is required' }, null, 2))
  }
  if (!secret) {
    throw new Error(JSON.stringify({ name: 'SignError', message: 'secret is required' }, null, 2))
  }

  const header = { alg: algorithm, typ: 'JWT', expireDate: expiry }

  const rawHeader = Buffer.from(JSON.stringify(header)).toString('base64')
  const rawPayload = Buffer.from(JSON.stringify(payload)).toString('base64')
  return `${rawHeader}.${rawPayload}.${
    crypto.createHmac(crypt, secret).update(`${rawHeader}.${rawPayload}`).digest('base64')
  }`
}

const verify = (
  data: string = '',
  secret: crypto.BinaryLike | crypto.KeyObject | null,
  options: { maxAge?: number; ignoreExpiration?: boolean; complete?: boolean } = { maxAge: 0 }
) => {
  let maxAge = options?.maxAge ?? 0

  let crypt = 'sha256'

  if (typeof data !== 'string') {
    throw new Error(
      JSON.stringify({ name: 'TokenError', message: 'incorrect token format' }, null, 2)
    )
  }

  const splittedData = data.split('.')
  if (splittedData.length !== 3) {
    throw new Error(
      JSON.stringify({ name: 'TokenError', message: 'incorrect token format' }, null, 2)
    )
  }

  if (!secret) {
    throw new Error(JSON.stringify({ name: 'TokenError', message: 'secret is required' }, null, 2))
  }

  const [rawHeader, rawPayload, signature] = splittedData
  const header = JSON.parse(Buffer.from(rawHeader ?? '', 'base64').toString())
  const payload = JSON.parse(Buffer.from(rawPayload ?? '', 'base64').toString())

  const expired = header?.expireDate
  const algorithm = header?.alg ?? 'HS256'

  if (algorithm === 'HS384') {
    crypt = 'sha384'
  } else if (algorithm === 'HS512') {
    crypt = 'sha512'
  } else if (algorithm !== 'HS256') {
    throw new Error(JSON.stringify({ name: 'TokenError', message: 'invalid algorithm' }, null, 2))
  }

  if (
    signature !==
    crypto.createHmac(crypt, secret).update(`${rawHeader}.${rawPayload}`).digest('base64') 
  ) {
    throw new Error(
      JSON.stringify({ name: 'TokenError', message: 'invalid token signature' }, null, 2)
    )
  }

  if (expired + maxAge >= Date.now() || expired === -1 || options?.ignoreExpiration) {
    if (options?.complete) {
      return { header, payload }
    } else {
      return payload
    }
  } else {
    throw new Error(JSON.stringify({ name: 'TokenError', message: 'token expired' }, null, 2))
  }
}

export { sign, verify }
