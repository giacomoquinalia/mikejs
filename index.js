import { type } from 'os'

let impl
;(async () => {
  switch (type()) {
    case 'Linux':
      impl = (await import('./src/linux/index.js')).default.impl
      break
    case 'Windows_NT':
      impl = (await import('./src/windows/index.js')).default.impl
      break
    case 'Darwin':
      break
    default:
      throw new Error('Unsupported platform')
  }
})()

export default impl
