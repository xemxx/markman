const isDevelopment = process.env.NODE_ENV !== 'production'

export const Debug = (str: string) => {
  if (isDevelopment) {
    console.log(str)
  }
}
