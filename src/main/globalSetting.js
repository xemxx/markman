import path from 'path'

// Set `__static` path to static files in production.
if (process.env.NODE_ENV !== 'development') {
  global.__static = path.join(__dirname, '/src/assets').replace(/\\/g, '\\\\')
}
