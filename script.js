let stationsData;
const nameToKeyMap = {};

// Load stations.json
fetch('stations.json')
  .then(res => {
    if (!res.ok) throw new Error("Failed to load stations.json");
    return res.json();
  })
  .then(data => {
    stationsData = data.stations;
    populateAutocomplete();
  })
  .catch(err => {
    console.error("Error loading JSON:", err);
    document.getElementById("result").innerText = "Error loading station data.";
  });

// Create label-key map and setup autocomplete
function populateAutocomplete() {
  for (let key in stationsData) {
    const label = `${stationsData[key].name} (${stationsData[key].line})`;
    nameToKeyMap[label] = key;
  }

  setupAutocomplete('source', 'source-list', 'destination-list');
  setupAutocomplete('destination', 'destination-list', 'source-list');
}

// Custom Autocomplete Logic with cross-dropdown close
function setupAutocomplete(inputId, listId, otherListId) {
  const input = document.getElementById(inputId);
  const list = document.getElementById(listId);
  const otherList = document.getElementById(otherListId);

  input.addEventListener("input", function () {
    // Close the other dropdown
    if (otherList) {
      otherList.innerHTML = "";
      otherList.style.display = 'none';
    }

    const val = this.value.toLowerCase();
    list.innerHTML = ""; //LIST GETS RESET ON EVERY KEYSTROKE

    if (!val) {
      list.style.display = 'none';
      return;
    }

    for (const label in nameToKeyMap) {
      if (label.toLowerCase().includes(val)) {
        const item = document.createElement("div");
        item.textContent = label;

        item.onclick = () => {
          input.value = label;
          list.innerHTML = "";
          list.style.display = 'none';
        };

        list.appendChild(item);
      }
    }

    // Show or hide dropdown based on items
    if (list.children.length > 0) {
      list.style.display = 'block';
    } else {
      list.style.display = 'none';
    }
  });
}


// Close dropdowns when clicking outside inputs or dropdowns
document.addEventListener('click', function(event) {
  const sourceList = document.getElementById('source-list');
  const destList = document.getElementById('destination-list');
  
  if (!event.target.closest('.autocomplete-wrapper')) {
    sourceList.innerHTML = '';
    destList.innerHTML = '';
    sourceList.style.display = 'none';
    destList.style.display = 'none';
  }
});

function calculateFare(path) {
  if (!path || path.length === 0) return 0;

  let stationsCount = 1;
  let prevLine = stationsData[path[0]].line;

  for (let i = 1; i < path.length; i++) {
    const currLine = stationsData[path[i]].line;
    if (currLine === prevLine) {
      stationsCount++;
    } else {
      stationsCount++;
    }
    prevLine = currLine;
  }

  if (stationsCount === 1) return 10;
  if (stationsCount >= 2 && stationsCount <= 3) return 20;
  if (stationsCount >= 4 && stationsCount <= 10) return 30;
  if (stationsCount >= 11 && stationsCount <= 17) return 40;
  if (stationsCount >= 18 && stationsCount <= 26) return 50;
  return 60;
}

// Dijkstra’s algorithm to find shortest route
function findRoute() {
  const sourceLabel = document.getElementById('source').value;
  const destinationLabel = document.getElementById('destination').value;

  const start = nameToKeyMap[sourceLabel];
  const end = nameToKeyMap[destinationLabel];

  const resultDiv = document.getElementById('result');

  if (!start || !end) {
    resultDiv.innerText = "Please select valid stations from the list.";
    resultDiv.style.display = 'block';
    return;
  }

  if (start === end) {
    resultDiv.innerText = "You're already at the destination!";
    resultDiv.style.display = 'block';
    return;
  }
  var preference = document.getElementById("minTimeRadio").checked ? "time" : "interchanges";


  const result = dijkstra(start, end, preference);
  const path = result.path;
  // const travelTime = result.time;

  if (!path) {
    resultDiv.innerText = "No route found.";
    resultDiv.style.display = 'block';
    return;
  }

  let routeString = "";
  for (let i = 0; i < path.length; i++) {
    const station = stationsData[path[i]];
    routeString += `${station.name} (${station.line})`;
    if (i < path.length - 1) {
      if (stationsData[path[i]].line !== stationsData[path[i + 1]].line) {
        routeString += " ➔ [Interchange] ➔ ";
      } else {
        routeString += " ➔ ";
      }
    }
  }

  let stationsTraveled = 1;
  for (let i = 1; i < path.length; i++) {
    stationsTraveled += 1;
  }

  function calculateFare(stations) {
    if (stations === 1) return 10;
    if (stations >= 2 && stations <= 3) return 20;
    if (stations >= 4 && stations <= 10) return 30;
    if (stations >= 11 && stations <= 17) return 40;
    if (stations >= 18 && stations <= 26) return 50;
    return 60;
  }

  const fare = calculateFare(stationsTraveled);
  const co2Saved = (stationsTraveled * 0.1).toFixed(2);

  let interchanges = 0;
  for (let i = 1; i < path.length; i++) {
    if (stationsData[path[i]].line !== stationsData[path[i - 1]].line) {
      interchanges++;
    }
  }
  const travelTime = (stationsTraveled-1-interchanges) * 2 + interchanges * 8;

  resultDiv.innerText = `
Best path: ${routeString}
Fare: ₹${fare}
Estimated travel time: ${travelTime} minutes
Estimated CO₂ emissions saved: ${co2Saved} kg
Interchanges: ${interchanges}
`;


  resultDiv.style.whiteSpace = "pre-line";
  resultDiv.style.display = 'block';
}



// Dijkstra Implementation
function dijkstra(start, end, mode) {
  const distances = {};
  const prev = {};
  const visited = new Set();
  const pq = new MinPriorityQueue();

  for (const station in stationsData) {
    distances[station] = Infinity;
  }

  distances[start] = 0;
  pq.enqueue(start, 0);

  while (!pq.isEmpty()) {
    const current = pq.dequeue().element;
    if (visited.has(current)) continue;
    visited.add(current);

    if (current === end) break;

    const connections = stationsData[current].connections;

    for (let i = 0; i < connections.length; i++) {
      const neighbor = connections[i];
      const currentLine = stationsData[current].line;
      const neighborLine = stationsData[neighbor].line;

      const sameLine = currentLine === neighborLine;

      let cost;
      if (mode === "time") {
        cost = sameLine ? 2 : 10;
      } else if (mode === "interchanges") {
        cost = sameLine ? 1 : 1000;
      }

      const alt = distances[current] + cost;

      if (alt < distances[neighbor]) {
        distances[neighbor] = alt;
        prev[neighbor] = current;
        pq.enqueue(neighbor, alt);
      }
    }
  }

  if (distances[end] === Infinity) return null;

  const path = [];
  let node = end;
  while (node) {
    path.unshift(node); 
    // unshift adds to the beginning of array can also push and reverse later instead
    node = prev[node];
  }

  return {
    path: path,
    time: distances[end]
  };
}


// Simple Min Priority Queue
class MinPriorityQueue {
  constructor() {
    this.items = [];
  }
  enqueue(element, priority) {
    this.items.push({ element, priority });
    this.items.sort((a, b) => a.priority - b.priority);
  }
  dequeue() {
    return this.items.shift();
  }
  isEmpty() {
    return this.items.length === 0;
  }
}
document.getElementById("minTimeRadio").onclick = function () {
  document.getElementsByClassName("route-option")[0].classList.add("active");
  document.getElementsByClassName("route-option")[1].classList.remove("active");
};

document.getElementById("minInterchangesRadio").onclick = function () {
  document.getElementsByClassName("route-option")[1].classList.add("active");
  document.getElementsByClassName("route-option")[0].classList.remove("active");
};

