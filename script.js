const state = {
    upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lower: "abcdefghijklmnopqrstuvwxyz",
    numbers: "0123456789",
    symbols: "!@#$%^&*()_+~`|}{[]:;?><,./-=",
};

const outputEl = document.getElementById("generated-password");
const copyButton = document.getElementById("copy-button");
const lengthInput = document.getElementById("length");
const lengthValueEl = document.getElementById("length-value");
const uppercaseInput = document.getElementById("uppercase");
const lowercaseInput = document.getElementById("lowercase");
const numbersInput = document.getElementById("numbers");
const symbolsInput = document.getElementById("symbols");
const generateButton = document.getElementById("generate-button");
const strengthTextEl = document.getElementById("strength-text");
const strengthBars = document.getElementById("strength-bars");


function randomChar(charSet) {
    if (!charSet.length) return "";
    const randomValues = new Uint32Array(1);
    window.crypto.getRandomValues(randomValues);
    return charSet[randomValues[0] % charSet.length];
}

function updateSliderFill() {
    const min = Number(lengthInput.min);
    const max = Number(lengthInput.max);
    const value = Number(lengthInput.value);
    const percent = ((value - min ) / (max - min)) * 100;

    lengthInput.style.background = `linear-gradient(to right, #a4ffaf 0%, #a4ffaf ${percent}%, #18171f ${percent}%, #18171f 100%)`;

}

function getSelectedPools() {
    const selectedPools = [];

    if (uppercaseInput.checked) selectedPools.push(state.upper);
    if (lowercaseInput.checked) selectedPools.push(state.lower);
    if (numbersInput.checked) selectedPools.push(state.numbers);
    if (symbolsInput.checked) selectedPools.push(state.symbols);

    return selectedPools;
}

function getStrength(length, selectedPools) {
    if (selectedPools.length === 0) return { className: "strength--too-weak", text: "Too weak!" };

    const poolSize = selectedPools.join("").length;
    const entropyBits = length * Math.log2(poolSize);

    if (entropyBits < 28) return { className: "strength--too-weak", text: "Too weak!" };
    if (entropyBits < 36) return { className: "strength--weak", text: "Weak" };
    if (entropyBits < 60) return { className: "strength--medium", text: "Medium" };
    return { className: "strength--strong", text: "Strong" };
}

function renderStrength() {
    const selectedPools = getSelectedPools();
    const length = Number(lengthInput.value);
    const { className, text } = getStrength(length, selectedPools);
    
    strengthBars.className = `strength__bars ${className}`;
    strengthTextEl.textContent = text;
}

function generatePassword() {
    const selectedPools = getSelectedPools();
    const length = Number(lengthInput.value);

    if (selectedPools.length === 0) {
        outputEl.textContent = "Please select at least one character type.";
        renderStrength();
        return;
    }
    if (length < selectedPools.length) {
        outputEl.textContent = `Choose a length of at least ${selectedPools.length} for the selected options.`;
        renderStrength();
        return;
    }

    const combinedPool = selectedPools.join("");
    const requiredChars = selectedPools.map(pool => randomChar(pool));
    const passwordChars = [...requiredChars];

    while (passwordChars.length < length) {
        passwordChars.push(randomChar(combinedPool));
    }

    for (let i = passwordChars.length - 1; i >  0; i -= 1) {
        const randomValues = new Uint32Array(1);
        window.crypto.getRandomValues(randomValues);
        const j = randomValues[0] % (i + 1);
        [passwordChars[i], passwordChars[j]] = [passwordChars[j], passwordChars[i]];
    }

    outputEl.textContent = passwordChars.join("");
    renderStrength();
}

async function copyPassword() {
    const value = outputEl.textContent;

    if (!value || value.includes("Please select at least one character type.") || value.includes("Choose a length of at least")) return;

    try {
        await navigator.clipboard.writeText(value);
        copyButton.classList.add("is-copied");
        setTimeout(() => copyButton.classList.remove("is-copied"), 1200);
    } catch (error) {
        console.error("Failed to copy password: ", error);
    }
}

lengthInput.addEventListener("input", () => {
    lengthValueEl.textContent = lengthInput.value;
    updateSliderFill();
    renderStrength();
});

[uppercaseInput, lowercaseInput, numbersInput, symbolsInput].forEach((input) => { 
    input.addEventListener("change", renderStrength)
});

generateButton.addEventListener("click", generatePassword);
copyButton.addEventListener("click", copyPassword);

updateSliderFill();
generatePassword();