const isDevelopment = process.env.NODE_ENV !== 'production'

export const Debug = str => {
  if (isDevelopment) {
    console.log(str)
  }
}
