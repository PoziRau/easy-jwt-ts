<p align="center">
<img src="https://pozirau.github.io/easy-jwt/json.png" alt="json logo" width="255" height="93">
</p>

<h3 align="center">Easy JWT Typescript</h3>

<p align="center">
  A lightweght JSON Web Token library for node.js written in Typescript
  <br>
  <br>
</p>

## Installation

```bash
npm install easy-jwt-ts
```

## Usage

```js
var jwt = require('easy-jwt-ts')
```

### JWT Sign

```js
jwt.sign(payload, secret_key, [options])
```

#### Payload & Secret

`payload` could be an object literal, buffer or string representing valid JSON. 

`secret` is a string, buffer or an object containing the secret or encoded private key.

#### Options

`alg` algorithm used for encryption. Supported algorithms: `HS256` `HS384` `HS512`

`expireDate` expiry date of JSON Web Token in ms. Leave blank for no expiration.

```js
// Sign using SHA-256 with 1 hour expiry
var secret = fs.readFileSync('secret.key')
jwt.sign({ foo: 'bar' }, secret, { alg: 'HS256', expires: Date.now() + 3600000 })
```

### JWT Verify

```js
jwt.verify(token, secret_key, [options])
```

#### Payload & Secret

`payload` JSON Web Token. 

`secret` is a string, buffer or an object containing the secret or encoded private key.

#### Options

`maxAge` maximum age tokens are allowed to be valid after expiry. Set to 0 by default.

`ignoreExpiration` ignore expired token errors. `False` by default.

`complete` return header and payload in one JSON object. `False` by default.

```js
// Verify JSON Web Token and return header with payload
var secret = fs.readFileSync('secret.key')
jwt.verify(token, secret, { complete: true })
```

## Error Handling

```js
try {
    jwt.verify(token, secret, { complete: true })
} catch (error) {
    /*
        Error: {
            "name": "TokenError",
            "message": "token expired"
        }
    */
}
```

### SignError

This error shows up during the signing process of a JSON Web Token

#### Message

`payload is required` payload was not specified when jwt.sign was called.

`invalid algorithm` the algorithm you are trying to use is not supported, or does not exist.

`secret is required` no secret or key was specified when jwt.sign was called.

### TokenError

This error shows up during the verification of a JSON Web Token

#### Message

`token expired` the JSON Web Token expired.

`invalid token signature` the signature of the token failed to pass verification.

`incorrect token format` the token specified was not using a proper JSON Web Token format.

`invalid algorithm` the header of the JSON Web Token contained an unsupported algorithm format.

`secret is required` no secret or key was specified when jwt.verify was called.
