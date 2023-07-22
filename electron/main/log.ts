const isDevelopment = process.env.NODE_ENV !== 'production'

export const Debug = (str: string): void => {
  if (isDevelopment) {
    console.log(str)
  }
}
