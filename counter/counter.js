let count = 0;
const counterDisplay = document.getElementById('counter');
function changeCounter(amount) {
    count += amount;
    counterDisplay.textContent = count;
}