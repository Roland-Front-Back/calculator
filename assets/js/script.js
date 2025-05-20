function add(num1, num2) {
  return num1 + num2;
}

function subtract(num1, num2) {
  return num1 - num2;
}

function multiply(num1, num2) {
  return num1 * num2;
}

function divide(num1, num2) {
  if (num2 === 0) {
    throw new Error("Cannot divide by zero!");
  }
  return num1 / num2;
}

function operate(operator, num1, num2) {
  switch (operator) {
    case "add":
      return add(num1, num2);
    case "subtract":
      return subtract(num1, num2);
    case "multiply":
      return multiply(num1, num2);
    case "divide":
      return divide(num1, num2);
    default:
      return num2;
  }
}

let firstOperand = null;
let secondOperand = null;
let currentOperator = null;
let shouldResetDisplay = false;
let lastButtonWasOperator = false;
let lastButtonWasEquals = false;

function roundResult(number) {
  return Math.round(number * 1000000) / 1000000;
}

function formatNumber(number) {
  if (Number.isInteger(number)) {
    return number.toLocaleString("en-US");
  } else {
    const maxDecimals = 10;
    const stringNumber = number.toString();
    if (stringNumber.includes(".")) {
      const parts = stringNumber.split(".");
      const integerPart = parseInt(parts[0]).toLocaleString("en-US");
      let decimalPart = parts[1];
      if (decimalPart.length > maxDecimals) {
        decimalPart = decimalPart.slice(0, maxDecimals);
      }
      return `${integerPart}.${decimalPart}`;
    } else {
      return number.toLocaleString("en-US");
    }
  }
}

const mainDisplay = document.getElementById("mainDisplay");
const secondaryDisplay = document.getElementById("secondaryDisplay");
const digitButtons = document.querySelectorAll(".digit");
const operatorButtons = document.querySelectorAll("[data-operator]");
const equalsButton = document.getElementById("equals");
const clearButton = document.getElementById("clear");
const deleteButton = document.getElementById("delete");
const percentButton = document.getElementById("percent");
const negateButton = document.getElementById("negate");

function updateMainDisplay(value) {
  if (value === null) {
    mainDisplay.textContent = "0";
  } else {
    const formatted = formatNumber(value);
    if (formatted.length > 16) {
      mainDisplay.textContent = Number(value).toExponential(10);
    } else {
      mainDisplay.textContent = formatted;
    }
  }
}

function updateSecondaryDisplay() {
  if (firstOperand !== null && currentOperator) {
    const operatorSymbol = getOperatorSymbol(currentOperator);
    secondaryDisplay.textContent = `${formatNumber(
      firstOperand
    )} ${operatorSymbol}`;
  } else {
    secondaryDisplay.textContent = "";
  }
}

function getOperatorSymbol(operator) {
  switch (operator) {
    case "add":
      return "+";
    case "subtract":
      return "-";
    case "multiply":
      return "x";
    case "divide":
      return "÷";
    default:
      return "";
  }
}

function clearCalculator() {
  firstOperand = null;
  secondOperand = null;
  currentOperator = null;
  updateMainDisplay(0);
  updateSecondaryDisplay();
  shouldResetDisplay = false;
  lastButtonWasOperator = false;
  lastButtonWasEquals = false;
  mainDisplay.classList.remove("error");
}

digitButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const digit = button.getAttribute("data-num");

    mainDisplay.classList.remove("error");

    if (lastButtonWasEquals) {
      clearCalculator();
    }

    if (shouldResetDisplay) {
      mainDisplay.textContent = "0";
      shouldResetDisplay = false;
    }

    const currentValue = mainDisplay.textContent.replace(/,/g, "");

    if (digit === ".") {
      if (!currentValue.includes(".")) {
        mainDisplay.textContent = formatNumber(parseFloat(currentValue)) + ".";
      }
    } else {
      if (currentValue === "0") {
        mainDisplay.textContent = digit;
      } else {
        if (currentValue.replace(/[,.-]/g, "").length < 15) {
          const newValue = currentValue + digit;
          updateMainDisplay(parseFloat(newValue));
        }
      }
    }

    lastButtonWasOperator = false;
    lastButtonWasEquals = false;
  });
});

operatorButtons.forEach((button) => {
  button.addEventListener("click", () => {
    mainDisplay.classList.remove("error");

    const operator = button.getAttribute("data-operator");
    const currentValue = parseFloat(mainDisplay.textContent.replace(/,/g, ""));

    if (firstOperand !== null && currentOperator && !lastButtonWasOperator) {
      try {
        const result = operate(currentOperator, firstOperand, currentValue);
        firstOperand = roundResult(result);
        updateMainDisplay(firstOperand);
      } catch (error) {
        mainDisplay.textContent = "Get out!!";
        mainDisplay.classList.add("error");
        firstOperand = null;
        shouldResetDisplay = true;
        updateSecondaryDisplay();
        lastButtonWasOperator = true;
        return;
      }
    } else if (firstOperand === null) {
      firstOperand = currentValue;
    }

    currentOperator = operator;
    shouldResetDisplay = true;
    lastButtonWasOperator = true;
    lastButtonWasEquals = false;

    updateSecondaryDisplay();
  });
});

equalsButton.addEventListener("click", () => {
  mainDisplay.classList.remove("error");

  if (
    firstOperand === null ||
    currentOperator === null ||
    lastButtonWasEquals
  ) {
    return;
  }

  const currentValue = parseFloat(mainDisplay.textContent.replace(/,/g, ""));
  secondOperand = currentValue;

  try {
    const result = operate(currentOperator, firstOperand, secondOperand);
    const roundedResult = roundResult(result);

    secondaryDisplay.textContent = `${formatNumber(
      firstOperand
    )} ${getOperatorSymbol(currentOperator)} ${formatNumber(secondOperand)}`;

    updateMainDisplay(roundedResult);

    firstOperand = roundedResult;
    currentOperator = null;
    shouldResetDisplay = true;
    lastButtonWasOperator = false;
    lastButtonWasEquals = true;
  } catch (error) {
    mainDisplay.textContent = "Get out!";
    mainDisplay.classList.add("error");
    firstOperand = null;
    currentOperator = null;
    shouldResetDisplay = true;
    updateSecondaryDisplay();
  }
});

clearButton.addEventListener("click", clearCalculator);

deleteButton.addEventListener("click", () => {
  if (
    shouldResetDisplay ||
    mainDisplay.classList.contains("error") ||
    lastButtonWasEquals
  ) {
    return;
  }

  const currentValue = mainDisplay.textContent.replace(/,/g, "");

  if (
    currentValue.length === 1 ||
    (currentValue.length === 2 && currentValue.startsWith("-"))
  ) {
    updateMainDisplay(0);
  } else {
    const newValue = currentValue.slice(0, -1);
    updateMainDisplay(parseFloat(newValue));
  }
});

percentButton.addEventListener("click", () => {
  mainDisplay.classList.remove("error");

  const currentValue = parseFloat(mainDisplay.textContent.replace(/,/g, ""));
  const percentValue = currentValue / 100;
  updateMainDisplay(percentValue);

  if (lastButtonWasEquals) {
    firstOperand = null;
    currentOperator = null;
    updateSecondaryDisplay();
  }

  lastButtonWasOperator = false;
  lastButtonWasEquals = false;
});

negateButton.addEventListener("click", () => {
  mainDisplay.classList.remove("error");

  const currentValue = parseFloat(mainDisplay.textContent.replace(/,/g, ""));
  const negatedValue = -currentValue;
  updateMainDisplay(negatedValue);

  if (lastButtonWasEquals) {
    firstOperand = null;
    currentOperator = null;
    updateSecondaryDisplay();
  }

  lastButtonWasOperator = false;
  lastButtonWasEquals = false;
});

clearCalculator();
