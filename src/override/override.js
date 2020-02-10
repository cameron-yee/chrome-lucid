// L U  C   I    D
// Daniel Eden wrote this code
// He also happened to write this ode
// To focus, clarity, rest, and joy
// Which, I hope, you find in this toy

// Define global funcs
function updateStore(storeKey, data) {
  let obj = {}
  obj[storeKey] = JSON.stringify(data)

  chrome.storage.sync.set(obj)
}

function readStore(storeKey, cb) {
  chrome.storage.sync.get(storeKey, result => {
    let d = null

    if (result[storeKey]) d = JSON.parse(result[storeKey])

    // Make sure we got an object back, run callback
    if (typeof d === "object") cb(d)
  })
}

// Set up constants
const weekdays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
]

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

const key = "rhugtkeldibnridrlerlgcrrdvneevit"

// Set up the store for our data
// We want to track the notepad's contents and whether or not the human's current
// location is in darkness.
let defaultData = {
  notepadContent: "",
  ptoTotal: 0,
  pto: 0,
  holiday: 0,
  timeUp: 0
}

// >= v0.0.3 uses an object to store notepad content
// >= v1.1.2 uses chrome sync to store notepad content
// provide a fallback for older versions
readStore(key, d => {
  let data

  // Check if we got data from the chrome sync storage, if so, no fallback is needed
  if (d) {
    data = d
  } else {
    // Get the local storage
    local = localStorage.getItem(key)

    // Check if we got local storage data
    if (local) {
      // Try parsing the local storage data as JSON.
      // If it succeeds, we had an object in local storage
      try {
        data = JSON.parse(local)
        updateStore(key, local)
      } catch (e) {
        // If it fails to parse, we had the notepad content in local storage
        data = defaultData
        data.notepadContent = localStorage.getItem(key)
        updateStore(key, data)
      }

      // Delete the local storage
      localStorage.removeItem(key)
    }

    // If we couldn't get data from anywhere, set to default data
    if (!data) {
      data = defaultData
    }
  }

  start(data)
})

function listenerUpdate() {
  readStore(key, d => {
    document.querySelector(".notepad").innerHTML = d.notepadContent
    document.getElementById("ptoTotal").value = d.ptoTotal
    document.getElementById("pto").value= d.pto
    document.getElementById("holiday").value = d.holiday
    document.getElementById("timeUp").value = d.timeUp
  })
}

function start(data) {
  // Greet the human
  let now = new Date()
  let timeString = `${weekdays[now.getDay()]}, ${
    months[now.getMonth()]
  } ${now.getDate()}`
  let broadTime =
    now.getHours() < 12
      ? "morning"
      : now.getHours() > 17
        ? "evening"
        : "afternoon"

  let g = document.querySelector(".greeting")
  g.innerHTML = `Good ${broadTime}. It is ${timeString}.`

  // Set up the notepad
  let notepadContent = document.querySelector(".notepad")
  notepadContent.innerHTML = data["notepadContent"]

  let ptoTotal = document.getElementById('ptoTotal')
  ptoTotal.innerHTML = data["ptoTotal"]
  
  let pto = document.getElementById('pto')
  pto.innerHTML = data["pto"]
  
  let holiday = document.getElementById('holiday')
  holiday.innerHTML = data["holiday"]
  
  let timeUp = document.getElementById('timeUp')
  timeUp.innerHTML = data["timeUp"]

  let inputs = [notepadContent, ptoTotal, pto, holiday, timeUp]

  notepadContent.addEventListener("input", e => {
    if (notepadContent !== document.activeElement || !windowIsActive) return

    let obj = Object.assign(data, {
      notepadContent: notepadContent.value
    })
    updateStore(key, obj)
  })

  ptoTotal.addEventListener("input", e => {
    if (ptoTotal !== document.activeElement || !windowIsActive) return

    let obj = Object.assign(data, {
      ptoTotal: ptoTotal.value
    })
    updateStore(key, obj)
  })
  
  pto.addEventListener("input", e => {
    if (pto !== document.activeElement || !windowIsActive) return

    let obj = Object.assign(data, {
      pto: pto.value
    })
    updateStore(key, obj)
  })
  
  holiday.addEventListener("input", e => {
    if (holiday !== document.activeElement || !windowIsActive) return

    let obj = Object.assign(data, {
      holiday: holiday.value
    })
    updateStore(key, obj)
  })
  
  timeUp.addEventListener("input", e => {
    if (timeUp !== document.activeElement || !windowIsActive) return

    let obj = Object.assign(data, {
      timeUp: timeUp.value
    })
    updateStore(key, obj)
  })
  
  // Set event listeners for inputs
  for (let i = 0; i < inputs.length; i++) {
    // inputs[i].addEventListener("input", e => {
    //   if (inputs[i] !== document.activeElement || !windowIsActive) return
  
    //   let obj = Object.assign(data, {
    //     [inputs[i]]: inputs[i].value
    //   })

    //   updateStore(key, obj)
    // })
    
    inputs[i].addEventListener("blur", e => {
      if (storeListener) {
        clearInterval(storeListener)
      }
      storeListener = setInterval(listenerUpdate, 1000)
    })

    inputs[i].addEventListener("focus", e => {
      if (storeListener) {
        clearInterval(storeListener)
      }
    })
  }
  
  // Allow updating content between tabs
  
  let windowIsActive

  let storeListener = setInterval(listenerUpdate, 1000)

  window.onfocus = function() {
    windowIsActive = true
  }

  window.onblur = function() {
    windowIsActive = false
    if (storeListener) {
      clearInterval(storeListener)
    }
    storeListener = setInterval(listenerUpdate, 1000)
  }
  
  window.addEventListener("mousewheel", scrollCapture)

  function scrollCapture(e) {
    if (e.target !== notepadContent) notepadContent.scrollTop += e.deltaY
  }
}
