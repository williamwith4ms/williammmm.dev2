let currentPageNumber = 1n;
const itemsPerPage = 500n;
let characterArray = [
    'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z',
    'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
    '0','1','2','3','4','5','6','7','8','9',
    '!','@','#','$','%','^','&','*','(',')','-','_','=','+','[',']','{','}',';',':','\'','"',',','.','<','>','/','?','|','~','`'
];
let currentLength = 1;

function bigIntPow(base, exponent) {
    if (exponent === 0n) return 1n;
    let result = 1n;
    let baseBig = BigInt(base);
    let exp = exponent;
    
    while (exp > 0n) {
        if (exp % 2n === 1n) {
            result *= baseBig;
        }
        baseBig *= baseBig;
        exp = exp / 2n;
    }
    return result;
}

function generateCombination(index) {
    const base = BigInt(characterArray.length);
    let currentIndex = BigInt(index) - 1n;
    
    for (let length = 1; length <= 50; length++) {
        const combinationsForLength = bigIntPow(base, BigInt(length));
        if (currentIndex < combinationsForLength) {
            currentLength = length;
            return indexToCombination(currentIndex, length, characterArray);
        }
        currentIndex -= combinationsForLength;
    }
    
    return null;
}

function indexToCombination(index, length, chars) {
    let result = '';
    let base = BigInt(chars.length);
    let currentIndex = BigInt(index);
    
    for (let i = 0; i < length; i++) {
        result = chars[Number(currentIndex % base)] + result;
        currentIndex = currentIndex / base;
    }
    
    return result;
}

function generateCombinations(page) {
    const pageBig = BigInt(page);
    const startIndex = (pageBig - 1n) * itemsPerPage + 1n;
    const endIndex = pageBig * itemsPerPage;
    
    const container = document.getElementById('numberContainer');
    container.innerHTML = '<div class="loading">Generating combinations...</div>';
    
    setTimeout(() => {
        container.innerHTML = '';
        
        const fragment = document.createDocumentFragment();
        let actualEndIndex = startIndex - 1n;
        let displayLength = 1;
        
        for (let i = startIndex; i <= endIndex; i++) {
            const password = generateCombination(i);
            
            if (password === null) {
                break;
            }
            
            actualEndIndex = i;
            if (password.length > displayLength) {
                displayLength = password.length;
            }
            
            const combinationElement = document.createElement('div');
            combinationElement.className = 'number-item';
            combinationElement.textContent = password;
            
            const combinationLength = password.length;
            combinationElement.setAttribute('data-length', combinationLength.toString());
            
            if (combinationLength > 20) {
                combinationElement.classList.add('extra-long');
            }
            
            combinationElement.style.setProperty('--char-count', combinationLength);
            
            combinationElement.addEventListener('click', () => {
                navigator.clipboard.writeText(password).then(() => {
                    combinationElement.style.backgroundColor = '#28a745';
                    combinationElement.style.color = 'white';
                    setTimeout(() => {
                        combinationElement.style.backgroundColor = '';
                        combinationElement.style.color = '';
                    }, 500);
                });
            });
            
            fragment.appendChild(combinationElement);
        }
        
        container.appendChild(fragment);
        updatePageInfo(page, startIndex, actualEndIndex, displayLength);
        updateControls(page);
        
        if (window.highlightCombination) {
            setTimeout(() => {
                highlightFoundCombination(window.highlightCombination);
                window.highlightCombination = null;
            }, 50);
        }
    }, 100);
}

function updatePageInfo(page, start, end, length) {
    document.getElementById('currentPage').textContent = page.toString();
    document.getElementById('rangeStart').textContent = start.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    document.getElementById('rangeEnd').textContent = end.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    document.getElementById('pageInput').value = page.toString();
    document.getElementById('statsRange').textContent = `${start.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} - ${end.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
    document.getElementById('currentLength').textContent = length;
    document.getElementById('charSetDisplay').textContent = characterArray.join('');
}

function updateControls(page) {
    const firstBtn = document.getElementById('firstBtn');
    const prevBtn = document.getElementById('prevBtn');
    
    firstBtn.disabled = page === 1n || page === 1;
    prevBtn.disabled = page === 1n || page === 1;
    
    document.getElementById('pageInput').min = 1;
}

function goToPage(page) {
    let pageBig = BigInt(page);
    if (pageBig < 1n) pageBig = 1n;
    
    currentPageNumber = pageBig;
    generateCombinations(pageBig);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetGenerator() {
    characterArray = [
        'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z',
        'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
        '0','1','2','3','4','5','6','7','8','9',
        '!','@','#','$','%','^','&','*','(',')','-','_','=','+','[',']','{','}',';',':','\'','"',',','.','<','>','/','?','|','~','`'
    ];
    
    currentPageNumber = 1n;
    goToPage(1n);
}

document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                if (currentPageNumber > 1n) {
                    goToPage(currentPageNumber - 1n);
                }
                break;
            case 'ArrowRight':
                e.preventDefault();
                goToPage(currentPageNumber + 1n);
                break;
            case 'Home':
                e.preventDefault();
                goToPage(1n);
                break;
        }
    }
});

document.getElementById('pageInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const page = e.target.value.trim();
        if (page && page !== '') {
            try {
                const pageBig = BigInt(page);
                if (pageBig > 0n) {
                    goToPage(pageBig);
                }
            } catch (error) {
                alert('Please enter a valid number');
            }
        }
    }
});

window.addEventListener('load', () => {
    resetGenerator();
});

function jumpToCombination(targetCombination) {
    if (!targetCombination || targetCombination.trim() === '') {
        alert('Please enter a password to search for');
        return;
    }
    
    const password = targetCombination.trim();
    const index = findCombinationIndex(password);
    
    if (index === null) {
        alert(`Password "${password}" not found or contains invalid characters`);
        return;
    }
    
    const pageNumber = ((index - 1n) / itemsPerPage) + 1n;
    
    window.highlightCombination = password;
    
    goToPage(pageNumber);
    
    setTimeout(() => {
        highlightFoundCombination(password);
    }, 100);
}

function findCombinationIndex(password) {
    try {
        const chars = Array.from(password);
        const base = BigInt(characterArray.length);
        const length = chars.length;
        
        for (const char of chars) {
            if (!characterArray.includes(char)) {
                return null;
            }
        }
        
        let startIndex = 1n;
        for (let len = 1; len < length; len++) {
            startIndex += bigIntPow(base, BigInt(len));
        }
        
        let positionInLength = 0n;
        for (let i = 0; i < length; i++) {
            const charIndex = BigInt(characterArray.indexOf(chars[i]));
            const power = bigIntPow(base, BigInt(length - 1 - i));
            positionInLength += charIndex * power;
        }
        
        return startIndex + positionInLength;
    } catch (error) {
        console.error('Error finding password index:', error);
        return null;
    }
}

function highlightFoundCombination(targetCombination) {
    const items = document.querySelectorAll('.number-item');
    let found = false;
    
    items.forEach(item => {
        item.classList.remove('highlight-found');
        
        if (item.textContent === targetCombination) {
            item.classList.add('highlight-found');
            item.scrollIntoView({ behavior: 'smooth', block: 'center' });
            found = true;
        }
    });
    
    if (!found) {
        console.log(`Password "${targetCombination}" not visible on current page`);
    }
}

function addSearchFeature() {
    const searchContainer = document.createElement('div');
    searchContainer.style.cssText = 'margin: 20px 0; text-align: center; background-color: #e9ecef; padding: 15px; border-radius: 8px;';
    searchContainer.innerHTML = `
        <div style="margin-bottom: 10px;">
            <input type="text" id="searchCombination" placeholder="Search for password (e.g., 'abc', 'A1!', 'hello')..." 
                   style="padding: 10px; border: 2px solid #dee2e6; border-radius: 5px; width: 250px; margin-right: 10px; font-family: 'Courier New', monospace;">
            <button onclick="jumpToCombination(document.getElementById('searchCombination').value)" 
                    style="padding: 10px 20px; background-color: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">Find & Highlight</button>
        </div>
        <div style="font-size: 12px; color: #6c757d;">
            Click any password to copy it to clipboard | 
            <strong>Valid characters:</strong> a-z, A-Z, 0-9, and symbols: ! @ # $ % ^ & * ( ) - _ = + [ ] { } ; : ' " , . < > / ? | ~ &#96;
        </div>
    `;
    
    document.querySelector('.controls').after(searchContainer);
    
    document.getElementById('searchCombination').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            jumpToCombination(e.target.value);
        }
    });
}

window.addEventListener('load', () => {
    setTimeout(addSearchFeature, 100);
});

function autoResizeInput(input) {
    const temp = document.createElement('span');
    temp.style.visibility = 'hidden';
    temp.style.position = 'absolute';
    temp.style.fontSize = window.getComputedStyle(input).fontSize;
    temp.style.fontFamily = window.getComputedStyle(input).fontFamily;
    temp.style.fontWeight = window.getComputedStyle(input).fontWeight;
    temp.style.letterSpacing = window.getComputedStyle(input).letterSpacing;
    temp.style.whiteSpace = 'nowrap';
    temp.style.padding = '0';
    temp.style.margin = '0';
    temp.style.border = 'none';
    
    const textToMeasure = input.value || input.placeholder || '1';
    temp.textContent = textToMeasure;
    
    document.body.appendChild(temp);
    const textWidth = temp.offsetWidth;
    document.body.removeChild(temp);
    
    const computedStyle = window.getComputedStyle(input);
    const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
    const paddingRight = parseFloat(computedStyle.paddingRight) || 0;
    const borderLeft = parseFloat(computedStyle.borderLeftWidth) || 0;
    const borderRight = parseFloat(computedStyle.borderRightWidth) || 0;
    
    const totalHorizontalSpacing = paddingLeft + paddingRight + borderLeft + borderRight;
    
    const minWidth = 80;
    const maxWidth = 200;
    const newWidth = Math.max(minWidth, Math.min(maxWidth, textWidth + totalHorizontalSpacing + buffer));
    
    input.style.width = newWidth + 'px';
}

window.addEventListener('load', () => {
    const pageInput = document.getElementById('pageInput');
    
    autoResizeInput(pageInput);
    
    pageInput.addEventListener('input', function() {
        autoResizeInput(this);
    });
    
    pageInput.addEventListener('keydown', function() {
        setTimeout(() => autoResizeInput(this), 10);
    });
    
    pageInput.addEventListener('paste', function() {
        setTimeout(() => autoResizeInput(this), 10);
    });
});
