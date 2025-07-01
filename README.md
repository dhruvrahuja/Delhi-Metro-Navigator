# Delhi Metro Navigator

Delhi Metro Navigator is a lightweight web application that helps users find the shortest route between any two stations on the Delhi Metro network. It calculates the shortest path, fare estimate, travel time, and estimated CO₂ emission savings based on station data.

## Live Demo

[Visit the Live Site](https://delhi-metro-navigator-delta.vercel.app/)  

---

## Features

- Autocomplete dropdowns for source and destination station input
- Shortest route calculation using Dijkstra's algorithm
- Interchange detection between metro lines
- Fare calculation based on total stations traveled
- Estimated travel time including interchange delays
- CO₂ emission savings estimate per trip

---

## Project Structure

- `index.html` – Main HTML file
- `style.css` – CSS for styling the interface
- `script.js` – JavaScript logic for route calculation, autocomplete, and UI
- `stations.json` – Contains station data including names, lines, and connections

## How It Works

1. **Autocomplete**: As the user types, station suggestions appear.
2. **Station Data**: The `stations.json` file holds all metro stations, their lines, and connections.
3. **Shortest Route**: Dijkstra’s algorithm is used to compute the shortest path.
4. **Fare Calculation**: Based on the number of stations between the source and destination.
5. **Travel Time**: Assumes 2 minutes per station and 8 minutes for each interchange.
6. **CO₂ Emissions Saved**: Estimated as 0.1 kg saved per station traveled.

## Setup Instructions

To run the project locally on your system:

1. **Clone the repository using Git**:
   ```bash
   git clone https://github.com/dhruvrahuja/Delhi-Metro-Navigator.git

2. Run index.html file on your system
