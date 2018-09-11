class Port {
  constructor(device) {
    this.device_ = device
  }

  connect() {
    let readLoop = () => {
      this.device_.transferIn(5, 64).then(result => {
        this.onReceive(result.data)
        readLoop()
      }, error => {
        this.onReceiveError(error)
      })
    }

    return this.device_.open()
      .then(() => {
        if (this.device_.configuration === null) {
          return this.device_.selectConfiguration(1)
        }
      })
      .then(() => this.device_.claimInterface(2))
      .then(() => this.device_.controlTransferOut({
        'requestType': 'class',
        'recipient': 'interface',
        'request': 0x22,
        'value': 0x01,
        'index': 0x02
      }))
      .then(() => {
        readLoop()
      })
  }

  disconnect() {
    return this.device_.controlTransferOut({
      'requestType': 'class',
      'recipient': 'interface',
      'request': 0x22,
      'value': 0x00,
      'index': 0x02
    })
      .then(() => this.device_.close())
  };

  send(data) {
    return this.device_.transferOut(4, data)
  }
}


export default class Serial {
  constructor() {
  }

  static getPorts() {
    if(!navigator || !navigator.usb ){
      return Promise.resolve([])
    }

    return navigator.usb.getDevices().then(devices => {
      return devices.map(device => new Port(device))
    })
  };

  static requestPort() {
    if(!navigator || !navigator.usb ){
      return Promise.reject("No USB device detected to pair or Browser didn't support WebUSB")
    }

    const filters = [
      {'vendorId': 0x2341, 'productId': 0x8036},
      {'vendorId': 0x2341, 'productId': 0x8037}
    ]
    return navigator.usb.requestDevice({'filters': filters}).then(
      device => new Port(device)
    )
  };
}
