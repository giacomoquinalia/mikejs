import { execa } from 'execa'

class Amixer {
  constructor() {
    this.device = null
  }

  async setActiveDeviceInfo() {
    const { stdout } = await execa('cat', ['/proc/asound/cards'])
    const devices = []
    for (const line of stdout.split('\n')) {
      const deviceMatch = /[0-9] \[\w+/i.exec(line)
      if (deviceMatch) {
        devices.push({
          id: /[0-9]/.exec(deviceMatch)[0],
          name: /[a-zA-Z]+/i.exec(deviceMatch)[0]
        })
      }
    }
    for (const device of devices) {
      try {
        await execa('amixer', ['-c', String(device.id), 'get', device.name])
        this.device
        return device
      } catch {}
    }
    return null
  }

  async isMuted() {
    const device = this.device || (await setActiveDeviceInfo())
    const { stdout, stderr } = await execa('amixer', [
      '-c',
      device.id,
      'get',
      device.name
    ])
    if (stderr) {
      throw new Error(stderr)
    }
    const { 2: muted } =
      /[a-z][a-z ]*: Capture [0-9-]+ \[([0-9]+)%\] (?:[[0-9.-]+dB\] )?\[(on|off)\]/i.exec(
        stdout
      )
    return muted === 'off'
  }

  async setMuted(muted = false) {
    const device = this.device || (await setActiveDeviceInfo())
    const { stderr } = await execa('amixer', [
      '-c',
      device.id,
      'set',
      device.name,
      muted ? 'cap' : 'nocap'
    ])
    if (stderr) {
      throw new Error(stderr)
    }
  }

  async getVolume() {
    const device = this.device || (await setActiveDeviceInfo())
    const { stdout, stderr } = await execa('amixer', [
      '-c',
      device.id,
      'get',
      device.name
    ])
    if (stderr) {
      throw new Error(stderr)
    }
    const { 1: volume } =
      /[a-z][a-z ]*: Capture [0-9-]+ \[([0-9]+)%\] (?:[[0-9.-]+dB\] )?\[(on|off)\]/i.exec(
        stdout
      )
    return volume
  }

  async setVolume(volume) {
    const device = this.device || (await setActiveDeviceInfo())
    const { stderr } = await execa('amixer', [
      '-c',
      device.id,
      'set',
      device.name,
      `${volume}%`
    ])
    if (stderr) {
      throw new Error(stderr)
    }
  }
}

export default {
    impl: new Amixer()
}
