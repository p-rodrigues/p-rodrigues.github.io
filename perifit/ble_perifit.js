// Perifit
const PERIFIT_ACC_SERVICE_UUID = '0000fff0-0000-1000-8000-00805f9b34fb';
const PERIFIT_ACC_CHARACTERISTIC_UUID = '0000fff3-0000-1000-8000-00805f9b34fb';

const PERIFIT_FSR_SERVICE_UUID = "0000aa40-0000-1000-8000-00805f9b34fb"
const PERIFIT_FSR_CHARACTERISTIC_UUID = "0000aa41-0000-1000-8000-00805f9b34fb"


const PERIFIT_SUPPORTED_PREFIX = ["Perifit"]

/** Event listeners */
// connect button
document.querySelector('#btn_connect').addEventListener('click', function () {
  if (isWebBluetoothEnabled()) {
    onButtonClick();
  }
});

document.querySelector('#btn_start_exercise').addEventListener('click', function () {
  if (isWebBluetoothEnabled()) {
    onStartExerciseButtonClick();
  }
});

document.querySelector("#forgetBluetoothDevice").addEventListener('click', function () {
  if (isWebBluetoothEnabled()) {
    onForgetBluetoothDeviceButtonClick();
  }
});


function onForgetBluetoothDeviceButtonClick() {
  try {
    navigator.bluetooth.getDevices()
      .then(devices => {
        const deviceIdToForget = document.querySelector('#devicesSelect').value;
        const device = devices.find((device) => device.id == deviceIdToForget);
        if (!device) {
          throw new Error('No Bluetooth device to forget');
        }
        console.log('Forgetting ' + device.name + 'Bluetooth device...');
        return device.forget();
      })
      .then(() => {
        console.log('  > Bluetooth device has been forgotten.');
        populateBluetoothDevices(PERIFIT_SUPPORTED_PREFIX);
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

window.onload = () => {
  populateBluetoothDevices(PERIFIT_SUPPORTED_PREFIX);
};



var file_name = "";
var csv_contents = "";
/** Button handlers */
function onStartExerciseButtonClick() {
  if (recording) {
    recording = false;
    document.getElementById("btn_start_exercise").innerHTML = "Start Exercise";
    file_name = document.getElementById("exercise_prefix").value;
    file_name += document.getElementById("exercise_name").value + "_" + getCurrentTimestamp() + ".csv";
    document.getElementById("exercise_name").disabled = false;
    writeToFile(csv_contents, file_name);
    var a = document.getElementById("downloadLink")
    a.hidden = false;
    var options = document.getElementById("exercise_prefix");
    options.disabled = false;

  } else {
    csv_contents = "";
    var a = document.getElementById("downloadLink")
    a.hidden = true;
    var options = document.getElementById("exercise_prefix");
    options.disabled = true;

    document.getElementById("exercise_name").disabled = true;
    recording = true;
    document.getElementById("btn_start_exercise").innerHTML = "Stop Exercise";
  }
}


// send command to device
onCmdButtonClick = function () {
  write_characteristic(device, NORDIC_UART_SERVICE_UUID, NORDIC_UART_RX_CHARACTERISTIC_UUID, document.getElementById("cmd_rx").value);
}

function saveAs(blob, name) {
  // prompt user to save file
  var a = document.createElement("a");
  document.body.appendChild(a);
  var a = document.getElementById("downloadLink")
  a.hidden = false;
  var url = window.URL.createObjectURL(blob);
  a.href = url;
  a.download = name;
  document.getElementById("downloadLink").hidden = false;
}


function writeToFile(data, name) {
  var blob = new Blob([data], { type: "text/plain;charset=utf-8" });

  //save the blob to a file
  saveAs(blob, name);

}

var last_quats = [];
var last_fsr = [];

function handle_all_notifications(event) {

  if (event.target.uuid == PERIFIT_ACC_CHARACTERISTIC_UUID) {
    last_quats = handle_acc(event);
    if (recording) {
      csv_contents += getCurrentTimestamp() + ", " + last_quats + "," + last_fsr + ", ACC\n";
    }
  } else if (event.target.uuid == PERIFIT_FSR_CHARACTERISTIC_UUID) {
    last_fsr = handle_fsr(event);
    if (recording) {
      csv_contents += getCurrentTimestamp() + ", " + last_quats + "," + last_fsr + ", FSR\n";
    }
  }
}

async function onButtonClick() {
  console.log('Requesting any Bluetooth Device...');

  device = await getDevice(["Perifit"], [PERIFIT_ACC_SERVICE_UUID, PERIFIT_FSR_SERVICE_UUID]);
  populateBluetoothDevices(PERIFIT_SUPPORTED_PREFIX);

  subscribe_characteristic(device, PERIFIT_ACC_SERVICE_UUID, PERIFIT_ACC_CHARACTERISTIC_UUID, handle_all_notifications);
  subscribe_characteristic(device, PERIFIT_FSR_SERVICE_UUID, PERIFIT_FSR_CHARACTERISTIC_UUID, handle_all_notifications);

  return 0;
}


/** Bluetooth functionalities */

function isWebBluetoothEnabled() {
  if (navigator.bluetooth) {
    return true;
  } else {
    console.log('Web Bluetooth API is not available.\n' +
      'Please make sure the "Experimental Web Platform features" flag is enabled.');
    return false;
  }
}

/** Miscellaneous functions */

function getCurrentTimestamp() {
  return Date.now()
}


function addData(chart, x, y, z) {

  var line_x = chart.data.datasets[0].data;
  var line_y = chart.data.datasets[1].data;
  var line_z = chart.data.datasets[2].data;

  // remove oldest data point from chart if there are more than MAX_LENGTH
  if (chart.data.datasets[0].data.length > MAX_LENGTH_ACC) {
    line_x.shift();
    line_y.shift();
    line_z.shift();
  }

  line_x.push(x);
  line_y.push(y);
  line_z.push(z);

  chart.data.datasets[0].data = line_x
  chart.data.datasets[1].data = line_y
  chart.data.datasets[2].data = line_z


  chart.update();
}

function addDataFSR(chart, fsr1_value, fsr2_value) {

  var fsr1 = chart.data.datasets[0].data;
  var fsr2 = chart.data.datasets[1].data;


  if (chart.data.datasets[0].data.length > MAX_LENGTH_FSR) {
    fsr1.shift();
    fsr2.shift();
  }

  fsr1.push(fsr1_value);
  fsr2.push(fsr2_value);

  chart.data.datasets[0].data = fsr1;
  chart.data.datasets[1].data = fsr2;

  chart.update();
}


function removeData(chart) {

  chart.datasets[0]
  //chart.data.labels.pop();
  chart.data.datasets.forEach((dataset) => {
    dataset.data.pop();
  });
  chart.update();
}

/** Notification Handlers */
function handle_acc(event) {

  let value = event.target.value;

  x_raw = value.getInt16(0, littleEndian = true);
  y_raw = value.getInt16(2, littleEndian = true);
  z_raw = value.getInt16(4, littleEndian = true);

  x = x_raw / (1 << 12);
  y = y_raw / (1 << 12);
  z = z_raw / (1 << 12);

  // vector magnitude
  //console.log(Math.sqrt(x * x + y * y + z * z))

  addData(chart_acc, x, y, z);
  let values = [x_raw, y_raw, z_raw];
  return values;
}

function handle_fsr(event) {
  let value = event.target.value;

  fsr1_value = value.getInt16(0, littleEndian = false);
  fsr2_value = value.getInt16(2, littleEndian = false);



  addDataFSR(myChart_fsr, fsr1_value, fsr2_value);

  let values = [fsr1_value, fsr2_value];

  return values;

}


function handle_cmd(event) {
  console.log("cmd response received")
  let value = event.target.value;

  const textDecoder = new TextDecoder('utf-8');
  value = textDecoder.decode(value);
  console.log(value)

  document.getElementById("cmd_tx").innerHTML = value;

  return value;
}