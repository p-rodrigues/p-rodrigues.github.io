const inputField = document.getElementById("input-field");
const resetButton = document.getElementById("reset-button");
const passSignal = document.getElementById("pass-signal");
const failSignal = document.getElementById("fail-signal");
const passCounter = document.getElementById("pass-counter");
const failCounter = document.getElementById("fail-counter");

var fail_counter = 0;
var pass_counter = 0;

function increment_fail() {
    fail_counter = fail_counter + 1;
    failCounter.innerHTML = "FAIL COUNTER: " + fail_counter;
}

function increment_pass() {
    pass_counter = pass_counter + 1;
    passCounter.innerHTML = "PASS COUNTER: " + pass_counter;
}

function reset_counters() {
    fail_counter = 0;
    pass_counter = 0;
    failCounter.innerHTML = "FAIL COUNTER: " + fail_counter;
    passCounter.innerHTML = "PASS COUNTER: " + pass_counter;

}

// Callback for text input
inputField.addEventListener("input", () => {
  const inputValue = inputField.value;

  // Once 7 characters were read (Serial number size)
  if (inputValue.length === 7) {
    // Clear the text input (allowing to scan a new one)
    inputField.value = "";

    // If the input contains "REB" or "SED" play a warning sound and show a fail image
    if (inputValue.startsWith("REB") || inputValue.startsWith("SED")) {
      const warningSound = new Audio("./mp3/warning.mp3");
      warningSound.play();
      increment_fail();
      failSignal.style.display = "block";
      passSignal.style.display = "none";

    // For every other serial number play a OK sound and show a pass image  
    } else {
      const okSound = new Audio("./mp3/ok.mp3");
      okSound.play();
      increment_pass();
      passSignal.style.display = "block";
      failSignal.style.display = "none";
    }
  }

  // Keep the focus on the text input
  inputField.focus();
});