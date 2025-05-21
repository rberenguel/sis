// Element selectors
const gameCubeEl = document.getElementById("gameCube");
const faceFrontEl = document.getElementById("faceFront");
const faceBackEl = document.getElementById("faceBack");
const faceRightEl = document.getElementById("faceRight");
const faceLeftEl = document.getElementById("faceLeft");
const faceTopEl = document.getElementById("faceTop");
const faceBottomEl = document.getElementById("faceBottom");

const hiddenLeftValEl = document.getElementById("hiddenLeftVal");
const hiddenBottomValEl = document.getElementById("hiddenBottomVal");
const hiddenBackValEl = document.getElementById("hiddenBackVal");

const netsContainer = document.getElementById("netsContainer");
const messageArea = document.getElementById("messageArea");
const newPuzzleButton = document.getElementById("newPuzzleButton");

// Game state
let currentCubeFaces = {};
let gameLocked = false;

// --- Net Shape Definitions ---
const netShapes = [
  {
    name: "cross",
    rows: 4,
    cols: 3,
    cells: [
      { faceIndex: 0, r: 1, c: 2 },
      { faceIndex: 1, r: 2, c: 1 },
      { faceIndex: 2, r: 2, c: 2 },
      { faceIndex: 3, r: 2, c: 3 },
      { faceIndex: 4, r: 3, c: 2 },
      { faceIndex: 5, r: 4, c: 2 },
    ],
  },
  {
    name: "stairs",
    rows: 4,
    cols: 3,
    cells: [
      { faceIndex: 0, r: 1, c: 1 },
      { faceIndex: 1, r: 2, c: 1 },
      { faceIndex: 2, r: 2, c: 2 },
      { faceIndex: 4, r: 3, c: 2 },
      { faceIndex: 3, r: 3, c: 3 },
      { faceIndex: 5, r: 4, c: 3 },
    ],
  },
  {
    name: "t-shape",
    rows: 3,
    cols: 4,
    cells: [
      { faceIndex: 0, r: 1, c: 2 },
      { faceIndex: 1, r: 2, c: 1 },
      { faceIndex: 2, r: 2, c: 2 },
      { faceIndex: 3, r: 2, c: 3 },
      { faceIndex: 5, r: 2, c: 4 },
      { faceIndex: 4, r: 3, c: 2 },
    ],
  },
  {
    name: "line-plus-two",
    rows: 3,
    cols: 4,
    cells: [
      { faceIndex: 0, r: 1, c: 1 },
      { faceIndex: 1, r: 2, c: 1 },
      { faceIndex: 2, r: 2, c: 2 },
      { faceIndex: 3, r: 2, c: 3 },
      { faceIndex: 5, r: 2, c: 4 },
      { faceIndex: 4, r: 3, c: 2 },
    ],
  },
];

// --- Dice and Net Logic ---
function getDiceDotsHTML(value) {
  let dotsHTML = '<div class="dice-dots">';
  switch (value) {
    case 1:
      dotsHTML += '<span class="dot dot-1"></span>';
      break;
    case 2:
      dotsHTML +=
        '<span class="dot dot-2a"></span><span class="dot dot-2b"></span>';
      break;
    case 3:
      dotsHTML +=
        '<span class="dot dot-3a"></span><span class="dot dot-3b"></span><span class="dot dot-3c"></span>';
      break;
    case 4:
      dotsHTML +=
        '<span class="dot dot-4a"></span><span class="dot dot-4b"></span><span class="dot dot-4c"></span><span class="dot dot-4d"></span>';
      break;
    case 5:
      dotsHTML +=
        '<span class="dot dot-5a"></span><span class="dot dot-5b"></span><span class="dot dot-5c"></span><span class="dot dot-5d"></span><span class="dot dot-5e"></span>';
      break;
    case 6:
      dotsHTML += `
                        <span class="dot" style="grid-row: 1; grid-column: 1;"></span> <span class="dot" style="grid-row: 1; grid-column: 3;"></span>
                        <span class="dot" style="grid-row: 2; grid-column: 1;"></span> <span class="dot" style="grid-row: 2; grid-column: 3;"></span>
                        <span class="dot" style="grid-row: 3; grid-column: 1;"></span> <span class="dot" style="grid-row: 3; grid-column: 3;"></span>`;
      break;
  }
  dotsHTML += "</div>";
  return dotsHTML;
}

function generateDiceValues() {
  const faces = {};
  const allPossibleValues = [1, 2, 3, 4, 5, 6];

  faces.front =
    allPossibleValues[Math.floor(Math.random() * allPossibleValues.length)];
  faces.back = 7 - faces.front;

  let possibleTop = allPossibleValues.filter(
    (v) => v !== faces.front && v !== faces.back,
  );
  faces.top = possibleTop[Math.floor(Math.random() * possibleTop.length)];
  faces.bottom = 7 - faces.top;

  let possibleLeft = allPossibleValues.filter(
    (v) =>
      v !== faces.front &&
      v !== faces.back &&
      v !== faces.top &&
      v !== faces.bottom,
  );
  faces.left = possibleLeft[0];
  faces.right = 7 - faces.left;

  return faces;
}

function update3DCubeView(faces) {
  faceFrontEl.innerHTML = getDiceDotsHTML(faces.front);
  faceBackEl.innerHTML = getDiceDotsHTML(faces.back);
  faceTopEl.innerHTML = getDiceDotsHTML(faces.top);
  faceBottomEl.innerHTML = getDiceDotsHTML(faces.bottom);
  faceLeftEl.innerHTML = getDiceDotsHTML(faces.left);
  faceRightEl.innerHTML = getDiceDotsHTML(faces.right);

  hiddenLeftValEl.textContent = faces.left;
  hiddenBottomValEl.textContent = faces.bottom;
  hiddenBackValEl.textContent = faces.back;
}

function createNetDataArray(faces) {
  return [
    faces.top,
    faces.left,
    faces.front,
    faces.right,
    faces.bottom,
    faces.back,
  ];
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function arraysEqual(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function displayNets(netOptions) {
  netsContainer.innerHTML = "";

  netOptions.forEach((option) => {
    const netDiv = document.createElement("div");
    netDiv.classList.add("net-option");

    const selectedShape =
      netShapes[Math.floor(Math.random() * netShapes.length)];
    netDiv.style.gridTemplateRows = `repeat(${selectedShape.rows}, 35px)`;
    netDiv.style.gridTemplateColumns = `repeat(${selectedShape.cols}, 35px)`;
    netDiv.style.justifySelf = "center";

    const gridCells = {};

    for (let r = 1; r <= selectedShape.rows; r++) {
      for (let c = 1; c <= selectedShape.cols; c++) {
        const cellKey = `${r}-${c}`;
        const cell = document.createElement("div");
        cell.classList.add("net-cell", "empty");
        gridCells[cellKey] = cell;
      }
    }

    selectedShape.cells.forEach((shapeCell) => {
      const cellKey = `${shapeCell.r}-${shapeCell.c}`;
      const value = option.data[shapeCell.faceIndex];
      if (gridCells[cellKey] && value !== undefined) {
        gridCells[cellKey].innerHTML = getDiceDotsHTML(value);
        gridCells[cellKey].classList.remove("empty");
      }
    });

    for (let r = 1; r <= selectedShape.rows; r++) {
      for (let c = 1; c <= selectedShape.cols; c++) {
        netDiv.appendChild(gridCells[`${r}-${c}`]);
      }
    }

    netDiv.dataset.isCorrect = option.isCorrect;
    netDiv.addEventListener("click", () =>
      handleNetSelection(netDiv, option.isCorrect),
    );
    netsContainer.appendChild(netDiv);
  });
}

function handleNetSelection(selectedDiv, isCorrect) {
  if (
    gameLocked ||
    selectedDiv.classList.contains("selected-correct") ||
    selectedDiv.classList.contains("selected-incorrect")
  ) {
    return;
  }

  if (isCorrect) {
    Array.from(netsContainer.children).forEach((child) => {
      child.classList.remove("selected-incorrect"); // Remove incorrect styling from any previously clicked
      if (child.dataset.isCorrect !== "true") {
        child.style.opacity = "0.5";
        child.style.cursor = "default";
      }
    });

    selectedDiv.classList.add("selected-correct");
    selectedDiv.style.opacity = "1";
    messageArea.textContent = "Correct!";
    messageArea.className = "message-area-style message-correct"; // Use new classes
    gameLocked = true;
  } else {
    selectedDiv.classList.add("selected-incorrect");
    messageArea.textContent = "Incorrect! Try again.";
    messageArea.className = "message-area-style message-incorrect"; // Use new classes
  }
}

// --- Game Initialization ---
function startGame() {
  gameLocked = false;
  messageArea.textContent = "";
  messageArea.className = "message-area-style"; // Reset to default message style

  Array.from(netsContainer.children).forEach((child) => {
    child.style.opacity = "1";
    child.style.cursor = "pointer";
    child.classList.remove("selected-correct", "selected-incorrect");
  });

  currentCubeFaces = generateDiceValues();
  update3DCubeView(currentCubeFaces);

  const correctNetDataArray = createNetDataArray(currentCubeFaces);
  const netOptions = [{ data: correctNetDataArray, isCorrect: true }];

  const numTotalOptions = 8;
  let attemptsToGenerateIncorrect = 0;

  while (
    netOptions.length < numTotalOptions &&
    attemptsToGenerateIncorrect < 50
  ) {
    let incorrectDataArray = shuffleArray([...correctNetDataArray]);

    let isUniqueAndIncorrect =
      !arraysEqual(incorrectDataArray, correctNetDataArray) &&
      !netOptions.some((opt) => arraysEqual(opt.data, incorrectDataArray));

    if (isUniqueAndIncorrect) {
      netOptions.push({ data: incorrectDataArray, isCorrect: false });
    } else {
      let slightlyModifiedData = [...correctNetDataArray];
      if (slightlyModifiedData.length >= 2) {
        const idx1 = Math.floor(Math.random() * slightlyModifiedData.length);
        let idx2 = Math.floor(Math.random() * slightlyModifiedData.length);
        while (idx2 === idx1) {
          idx2 = Math.floor(Math.random() * slightlyModifiedData.length);
        }
        [slightlyModifiedData[idx1], slightlyModifiedData[idx2]] = [
          slightlyModifiedData[idx2],
          slightlyModifiedData[idx1],
        ];

        if (
          !arraysEqual(slightlyModifiedData, correctNetDataArray) &&
          !netOptions.some((opt) => arraysEqual(opt.data, slightlyModifiedData))
        ) {
          netOptions.push({ data: slightlyModifiedData, isCorrect: false });
        }
      }
    }
    attemptsToGenerateIncorrect++;
  }

  while (netOptions.length < numTotalOptions) {
    let randomValues = Array(6)
      .fill(0)
      .map(() => Math.floor(Math.random() * 6) + 1);
    if (!netOptions.some((opt) => arraysEqual(opt.data, randomValues))) {
      netOptions.push({ data: randomValues, isCorrect: false });
    } else {
      let allOnes = Array(6).fill(1);
      if (
        !arraysEqual(allOnes, correctNetDataArray) &&
        !netOptions.some((opt) => arraysEqual(opt.data, allOnes))
      ) {
        netOptions.push({ data: allOnes, isCorrect: false });
      } else {
        let allTwos = Array(6).fill(2);
        if (
          !arraysEqual(allTwos, correctNetDataArray) &&
          !netOptions.some((opt) => arraysEqual(opt.data, allTwos))
        ) {
          netOptions.push({ data: allTwos, isCorrect: false });
        } else {
          break;
        }
      }
    }
  }

  displayNets(shuffleArray(netOptions));
}

// Event Listeners
newPuzzleButton.addEventListener("click", startGame);

// Initial game start
startGame();
