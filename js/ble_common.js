function getDevice(name_prefixes, services) {
  return navigator.bluetooth.requestDevice({
    // filters: [...] <- Prefer filters to save energy & show relevant devices.
    //filter by the name prefix
    filters: [
      // create name prefix filters
      ...name_prefixes.map(name_prefix => ({ namePrefix: name_prefix }))
    ],
    acceptAllDevices: false,
    optionalServices: services
  })
    .then(device => {
      console.log('Connecting to GATT Server...');
      return device.gatt.connect();
    })
}

function subscribe_characteristic(device, serviceUUID, characteristicUUID, func) {

  try {
    device.getPrimaryService(serviceUUID).then(service => {
      return service.getCharacteristics();
    }).then(
      characteristics => {
        characteristics.forEach(characteristic => {
          if (characteristic.uuid === characteristicUUID) {
            console.log('Found the characteristic');

            myCharacteristic = characteristic;
            myCharacteristic.addEventListener('characteristicvaluechanged',
              func);
            characteristic.startNotifications().then(_ => {
              console.log('> Notifications started');
              myCharacteristic.addEventListener('characteristicvaluechanged',
                func);
            });
          }
        })
      }
    )
  } catch (error) {
    console.log(error)
  }
}

function write_characteristic(device, serviceUUID, characteristicUUID, cmd) {
  const textEncoder = new TextEncoder();
  console.log("writing " + cmd)
  try {
    device.getPrimaryService(serviceUUID).then(service => {
      return service.getCharacteristics();
    }).then(
      characteristics => {
        characteristics.forEach(characteristic => {
          if (characteristic.uuid === characteristicUUID) {
            characteristic.writeValueWithoutResponse(textEncoder.encode(cmd));
          }
        })
      }
    )
  } catch (error) {
    console.log(error)
  }

}

function readAppearanceValue(characteristic) {
  return characteristic.readValue().then(value => {
    console.log('> Appearance: ' +
      getDeviceType(value.getUint16(0, true /* Little Endian */)));
  });
}

function readDeviceNameValue(characteristic) {
  return characteristic.readValue().then(value => {
    console.log('> Device Name: ' + new TextDecoder().decode(value));
  });
}

function readPPCPValue(characteristic) {
  return characteristic.readValue().then(value => {
    console.log('> Peripheral Preferred Connection Parameters: ');
    console.log('  > Minimum Connection Interval: ' +
      (value.getUint8(0) | value.getUint8(1) << 8) * 1.25 + 'ms');
    console.log('  > Maximum Connection Interval: ' +
      (value.getUint8(2) | value.getUint8(3) << 8) * 1.25 + 'ms');
    console.log('  > Latency: ' +
      (value.getUint8(4) | value.getUint8(5) << 8) + 'ms');
    console.log('  > Connection Supervision Timeout Multiplier: ' +
      (value.getUint8(6) | value.getUint8(7) << 8));
  });
}

function readCentralAddressResolutionSupportValue(characteristic) {
  return characteristic.readValue().then(value => {
    let supported = value.getUint8(0);
    if (supported === 0) {
      console.log('> Central Address Resolution: Not Supported');
    } else if (supported === 1) {
      console.log('> Central Address Resolution: Supported');
    } else {
      console.log('> Central Address Resolution: N/A');
    }
  });
}

function readPeripheralPrivacyFlagValue(characteristic) {
  return characteristic.readValue().then(value => {
    let flag = value.getUint8(0);
    if (flag === 1) {
      console.log('> Peripheral Privacy Flag: Enabled');
    } else {
      console.log('> Peripheral Privacy Flag: Disabled');
    }
  });
}

/* Utils */

function getDeviceType(value) {
  // Check out page source to see what valueToDeviceType object is.
  return value +
    (value in valueToDeviceType ? ' (' + valueToDeviceType[value] + ')' : '');
}

function populateBluetoothDevices(supported_prefixes) {
  try {
    const devicesSelect = document.querySelector('#devicesSelect');
    console.log('Getting existing permitted Bluetooth devices...');
    navigator.bluetooth.getDevices()
      .then(devices => {
        console.log('> Got ' + devices.length + ' Bluetooth devices.');
        devicesSelect.textContent = '';
        for (const device of devices) {

          //check if the device names starts with the supported prefix
          if (!supported_prefixes.some(prefix => device.name.startsWith(prefix))) {
            continue;
          }

          const option = document.createElement('option');
          option.value = device.id;
          option.textContent = device.name;
          devicesSelect.appendChild(option);
        }
      })
      .catch(error => {
        console.log('Argh! ' + error);
      });
  }
  catch {
    //not supported
    console.log("Not supported")
  }

}
