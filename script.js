let generatedCanvas = null;
let offCanvas = null;
let offCtx = null;
let historyStack = []; // 실행 취소 스택
let isEraserMode = false; // 지우개 모드 상태
let usedColorsSet = new Set(); // 초기 생성 시 사용된 색상
let addedColorsSet = new Set(); // 사용자가 추가한 색상
let isPainting = false; // 드래그 칠하기 상태
let lastPaintedCell = { x: -1, y: -1 }; // 마지막으로 칠한 셀

// --- 공통 기능 ---

function saveState() {
    if (!offCanvas) return;
    // 최대 20단계까지만 저장
    if (historyStack.length > 20) historyStack.shift();
    historyStack.push(offCtx.getImageData(0, 0, offCanvas.width, offCanvas.height));
}

function undo() {
    if (historyStack.length === 0 || !offCtx) {
        alert("실행 취소할 내역이 없습니다.");
        return;
    }
    const previousState = historyStack.pop();
    offCtx.putImageData(previousState, 0, 0);
    redraw();
}

function toggleEraser() {
    isEraserMode = !isEraserMode;
    const btn = document.getElementById('eraser-btn');
    if (isEraserMode) {
        btn.classList.add('active-tool');
        btn.innerText = "지우개 ON";
    } else {
        btn.classList.remove('active-tool');
        btn.innerText = "지우개";
    }
}

function downloadPattern() {
    if (!generatedCanvas) {
        alert('먼저 도안을 생성해주세요.');
        return;
    }
    const link = document.createElement('a');
    link.download = 'knitting-pattern.png';
    link.href = generatedCanvas.toDataURL();
    link.click();
}

// --- 프로젝트 저장/불러오기 ---

function saveProject() {
    if (!offCanvas) {
        alert('저장할 도안이 없습니다.');
        return;
    }
    const projectData = {
        width: offCanvas.width,
        height: offCanvas.height,
        imageData: offCanvas.toDataURL(),
        usedColors: Array.from(usedColorsSet),
        addedColors: Array.from(addedColorsSet)
    };
    const blob = new Blob([JSON.stringify(projectData)], {type: "application/json"});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = "knitting-project.json";
    link.click();
}

function loadProject() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                restoreProject(data);
            } catch (err) {
                alert("프로젝트 파일을 불러오는 중 오류가 발생했습니다.");
                console.error(err);
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

function restoreProject(data) {
    // 입력창 값 복원
    const widthInput = document.getElementById('grid-width');
    const heightInput = document.getElementById('grid-height');
    if (widthInput) widthInput.value = data.width;
    if (heightInput) heightInput.value = data.height;

    // 변수 초기화
    historyStack = [];
    usedColorsSet = new Set(data.usedColors);
    addedColorsSet = new Set(data.addedColors);
    isEraserMode = false;
    
    // UI 초기화
    document.getElementById('added-palette-container').innerHTML = '';
    document.getElementById('palette-container').innerHTML = '';
    if(document.getElementById('eraser-btn')) {
        document.getElementById('eraser-btn').classList.remove('active-tool');
        document.getElementById('eraser-btn').innerText = "지우개";
    }

    // 팔레트 복원
    const paletteContainer = document.getElementById('palette-container');
    data.usedColors.forEach(color => createSwatch(color, paletteContainer));
    
    const addedPaletteContainer = document.getElementById('added-palette-container');
    data.addedColors.forEach(color => createSwatch(color, addedPaletteContainer));

    // 캔버스 복원
    const img = new Image();
    img.onload = () => {
        // 1. 데이터 캔버스
        offCanvas = document.createElement('canvas');
        offCanvas.width = data.width;
        offCanvas.height = data.height;
        offCtx = offCanvas.getContext('2d');
        offCtx.imageSmoothingEnabled = false;
        offCtx.drawImage(img, 0, 0);

        // 2. 화면 표시용 캔버스
        const cellSize = 20;
        const padding = 30;
        const displayCanvas = document.createElement('canvas');
        displayCanvas.width = data.width * cellSize + padding * 2;
        displayCanvas.height = data.height * cellSize + padding * 2;
        const ctx = displayCanvas.getContext('2d');
        generatedCanvas = displayCanvas;

        // 3. 미리보기 캔버스
        const previewCanvas = document.createElement('canvas');
        previewCanvas.width = data.width;
        previewCanvas.height = data.height;
        previewCanvas.style.width = '200px';
        previewCanvas.style.imageRendering = 'pixelated';
        previewCanvas.style.border = '1px solid #ddd';
        const pCtx = previewCanvas.getContext('2d');

        // 그리기 함수 정의
        window.redraw = function() {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, displayCanvas.width, displayCanvas.height);

            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(offCanvas, 0, 0, data.width, data.height, padding, padding, data.width * cellSize, data.height * cellSize);

            pCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
            pCtx.imageSmoothingEnabled = false;
            pCtx.drawImage(offCanvas, 0, 0);

            drawGridLines(ctx, data.width, data.height, cellSize, padding);
            drawNumbers(ctx, data.width, data.height, cellSize, padding);
        };

        window.redraw();

        // UI 구성 (원본 이미지는 없으므로 manual 모드처럼 처리)
        setupUI(displayCanvas, previewCanvas, null, 'manual');

        // 드래그 칠하기 이벤트 리스너
        displayCanvas.addEventListener('mousedown', function(event) {
            if (event.button !== 0) return; // 좌클릭만
            isPainting = true;
            saveState(); // 작업 시작 시 상태 저장

            const { gridX, gridY } = getGridCoordinates(event, displayCanvas, data.width, data.height, cellSize, padding);
            if (gridX === null) return;

            paintCell(gridX, gridY);
            lastPaintedCell = { x: gridX, y: gridY };
            window.redraw();
        });

        displayCanvas.addEventListener('mousemove', function(event) {
            if (!isPainting) return;
            const { gridX, gridY } = getGridCoordinates(event, displayCanvas, data.width, data.height, cellSize, padding);
            if (gridX === null || (gridX === lastPaintedCell.x && gridY === lastPaintedCell.y)) return;

            paintCell(gridX, gridY);
            lastPaintedCell = { x: gridX, y: gridY };
            window.redraw();
        });

        displayCanvas.addEventListener('mouseup', () => { isPainting = false; lastPaintedCell = { x: -1, y: -1 }; });
        displayCanvas.addEventListener('mouseleave', () => { isPainting = false; lastPaintedCell = { x: -1, y: -1 }; });

        // 더블클릭 지우기
        displayCanvas.addEventListener('dblclick', function(event) {
            const { gridX, gridY } = getGridCoordinates(event, displayCanvas, data.width, data.height, cellSize, padding);
            if (gridX === null) return;
            saveState();
            offCtx.fillStyle = '#ffffff';
            offCtx.fillRect(gridX, gridY, 1, 1);
            window.redraw();
        });
    };
    img.src = data.imageData;
}

// --- 도안 생성 및 그리기 로직 ---

function createPixelCanvas(sourceImage, gridWidth, gridHeight, mode, targetColorHex) {
    // 초기화
    historyStack = [];
    usedColorsSet.clear();
    addedColorsSet.clear();
    isEraserMode = false;
    document.getElementById('added-palette-container').innerHTML = '';
    if(document.getElementById('eraser-btn')) {
        document.getElementById('eraser-btn').classList.remove('active-tool');
        document.getElementById('eraser-btn').innerText = "지우개";
    }

    // 1. 데이터 캔버스 (offCanvas)
    offCanvas = document.createElement('canvas');
    offCanvas.width = gridWidth;
    offCanvas.height = gridHeight;
    offCtx = offCanvas.getContext('2d');
    offCtx.imageSmoothingEnabled = false;
    
    // 이미지 그리기 (직접 만들기가 아닐 경우)
    if (mode !== 'manual') {
        offCtx.drawImage(sourceImage, 0, 0, gridWidth, gridHeight);
    } else {
        // 직접 만들기는 투명(또는 흰색) 배경에서 시작
        // 여기서는 편의상 흰색으로 채움 (지우개는 투명으로 처리)
        offCtx.fillStyle = '#ffffff';
        offCtx.fillRect(0, 0, gridWidth, gridHeight);
    }

    // 색상 단순화 및 처리
    processColors(mode, targetColorHex, gridWidth, gridHeight);

    // 2. 화면 표시용 캔버스 설정
    const cellSize = 20;
    const padding = 30;
    const displayCanvas = document.createElement('canvas');
    displayCanvas.width = gridWidth * cellSize + padding * 2;
    displayCanvas.height = gridHeight * cellSize + padding * 2;
    const ctx = displayCanvas.getContext('2d');
    generatedCanvas = displayCanvas;

    // 3. 수정된 미리보기 캔버스
    const previewCanvas = document.createElement('canvas');
    previewCanvas.width = gridWidth;
    previewCanvas.height = gridHeight;
    previewCanvas.style.width = '200px';
    previewCanvas.style.imageRendering = 'pixelated';
    previewCanvas.style.border = '1px solid #ddd';
    const pCtx = previewCanvas.getContext('2d');

    // 그리기 함수 (전역에서 접근 가능하도록 window에 할당하거나 클로저 사용)
    window.redraw = function() {
        // 배경 흰색
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, displayCanvas.width, displayCanvas.height);

        // 픽셀 데이터 그리기
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(offCanvas, 0, 0, gridWidth, gridHeight, padding, padding, gridWidth * cellSize, gridHeight * cellSize);

        // 미리보기 업데이트
        pCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        pCtx.imageSmoothingEnabled = false;
        pCtx.drawImage(offCanvas, 0, 0);

        // 그리드 선 그리기
        drawGridLines(ctx, gridWidth, gridHeight, cellSize, padding);
        
        // 숫자 표시
        drawNumbers(ctx, gridWidth, gridHeight, cellSize, padding);
    };

    // 최초 그리기
    window.redraw();
    extractPalette(gridWidth, gridHeight);

    // UI 구성
    setupUI(displayCanvas, previewCanvas, sourceImage, mode);

    // 드래그 칠하기 이벤트 리스너
    displayCanvas.addEventListener('mousedown', function(event) {
        if (event.button !== 0) return; // 좌클릭만
        isPainting = true;
        saveState(); // 작업 시작 시 상태 저장

        const { gridX, gridY } = getGridCoordinates(event, displayCanvas, gridWidth, gridHeight, cellSize, padding);
        if (gridX === null) return;

        paintCell(gridX, gridY);
        lastPaintedCell = { x: gridX, y: gridY };
        window.redraw();
    });

    displayCanvas.addEventListener('mousemove', function(event) {
        if (!isPainting) return;
        const { gridX, gridY } = getGridCoordinates(event, displayCanvas, gridWidth, gridHeight, cellSize, padding);
        if (gridX === null || (gridX === lastPaintedCell.x && gridY === lastPaintedCell.y)) return;

        paintCell(gridX, gridY);
        lastPaintedCell = { x: gridX, y: gridY };
        window.redraw();
    });

    displayCanvas.addEventListener('mouseup', () => { isPainting = false; lastPaintedCell = { x: -1, y: -1 }; });
    displayCanvas.addEventListener('mouseleave', () => { isPainting = false; lastPaintedCell = { x: -1, y: -1 }; });

    // 더블클릭 지우기
    displayCanvas.addEventListener('dblclick', function(event) {
        const { gridX, gridY } = getGridCoordinates(event, displayCanvas, gridWidth, gridHeight, cellSize, padding);
        if (gridX === null) return;
        saveState();
        offCtx.fillStyle = '#ffffff';
        offCtx.fillRect(gridX, gridY, 1, 1);
        window.redraw();
    });
}

function getGridCoordinates(event, canvas, gridWidth, gridHeight, cellSize, padding) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (x >= padding && x < padding + gridWidth * cellSize &&
        y >= padding && y < padding + gridHeight * cellSize) {
        const gridX = Math.floor((x - padding) / cellSize);
        const gridY = Math.floor((y - padding) / cellSize);
        return { gridX, gridY };
    }
    return { gridX: null, gridY: null };
}

function paintCell(gridX, gridY) {
    const color = isEraserMode ? '#ffffff' : document.getElementById('paint-color').value;
    offCtx.fillStyle = color;
    offCtx.fillRect(gridX, gridY, 1, 1);
    if (!isEraserMode) updateAddedPalette(color);
}

function processColors(mode, targetColorHex, w, h) {
    const imgData = offCtx.getImageData(0, 0, w, h);
    const data = imgData.data;

    if (mode === 'text' && targetColorHex) {
        // 글자 모드: 2색 단순화
        const tr = parseInt(targetColorHex.slice(1, 3), 16);
        const tg = parseInt(targetColorHex.slice(3, 5), 16);
        const tb = parseInt(targetColorHex.slice(5, 7), 16);

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i+1], b = data[i+2];
            const distWhite = Math.sqrt((r-255)**2 + (g-255)**2 + (b-255)**2);
            const distTarget = Math.sqrt((r-tr)**2 + (g-tg)**2 + (b-tb)**2);
            
            if (distTarget < distWhite) {
                data[i] = tr; data[i+1] = tg; data[i+2] = tb; data[i+3] = 255;
            } else {
                data[i] = 255; data[i+1] = 255; data[i+2] = 255; data[i+3] = 0; // 배경 투명 처리 or 흰색
            }
        }
    } else if (mode === 'image') {
        // 이미지 모드: 색상 단순화 (Nearest Neighbor 유지 + Posterization)
        const step = 51;
        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, Math.round(data[i] / step) * step);
            data[i+1] = Math.min(255, Math.round(data[i+1] / step) * step);
            data[i+2] = Math.min(255, Math.round(data[i+2] / step) * step);
            data[i+3] = 255; // 불투명
        }
    }
    offCtx.putImageData(imgData, 0, 0);
}

function drawGridLines(ctx, w, h, size, pad) {
    const draw = (interval, color, width) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.beginPath();
        for (let x = 0; x <= w; x++) {
            if ((x % interval === 0)) {
                ctx.moveTo(pad + x * size, pad);
                ctx.lineTo(pad + x * size, pad + h * size);
            }
        }
        for (let y = 0; y <= h; y++) {
            if ((y % interval === 0)) {
                ctx.moveTo(pad, pad + y * size);
                ctx.lineTo(pad + w * size, pad + y * size);
            }
        }
        ctx.stroke();
    };
    draw(1, 'rgba(200, 200, 200, 0.5)', 1);
    draw(5, 'rgba(100, 100, 100, 0.8)', 2);
}

function drawNumbers(ctx, w, h, size, pad) {
    ctx.fillStyle = '#333';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = 5; i <= w; i += 5) {
        ctx.fillText(i, pad + (i - 0.5) * size, pad / 2);
        ctx.fillText(i, pad + (i - 0.5) * size, pad + h * size + pad / 2);
    }
    for (let i = 5; i <= h; i += 5) {
        ctx.fillText(i, pad / 2, pad + (i - 0.5) * size);
        ctx.fillText(i, pad + w * size + pad / 2, pad + (i - 0.5) * size);
    }
}

function extractPalette(w, h) {
    const container = document.getElementById('palette-container');
    container.innerHTML = '';
    const data = offCtx.getImageData(0, 0, w, h).data;
    
    for (let i = 0; i < data.length; i += 4) {
        if (data[i+3] > 0) { // 투명하지 않음
            const hex = "#" + ((1 << 24) + (data[i] << 16) + (data[i+1] << 8) + data[i+2]).toString(16).slice(1);
            if(hex !== '#ffffff') usedColorsSet.add(hex); // 흰색 배경 제외
        }
    }

    usedColorsSet.forEach(color => createSwatch(color, container));
}

function updateAddedPalette(color) {
    // 이미 사용된 색상이거나 이미 추가된 색상이면 무시
    if (usedColorsSet.has(color) || addedColorsSet.has(color) || color === '#ffffff') return;
    
    addedColorsSet.add(color);
    const container = document.getElementById('added-palette-container');
    createSwatch(color, container);
}

function createSwatch(color, container) {
    const swatch = document.createElement('div');
    swatch.className = 'color-swatch';
    swatch.style.backgroundColor = color;
    swatch.title = color;
    swatch.onclick = () => document.getElementById('paint-color').value = color;
    container.appendChild(swatch);
}

function setupUI(displayCanvas, previewCanvas, sourceImage, mode) {
    const container = document.getElementById('pattern-container');
    container.innerHTML = '';
    
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.gap = '30px';
    wrapper.style.alignItems = 'flex-start';
    wrapper.style.justifyContent = 'center';
    wrapper.style.flexWrap = 'wrap';
    wrapper.style.width = '100%';

    const leftBox = document.createElement('div');
    leftBox.style.textAlign = 'center';

    if (mode !== 'manual' && sourceImage) {
        const title = document.createElement('div');
        title.innerHTML = '<b>원본 미리보기</b>';
        title.style.marginBottom = '10px';
        const img = document.createElement('img');
        img.src = sourceImage.src;
        img.style.maxWidth = '200px';
        img.style.border = '1px solid #ddd';
        leftBox.appendChild(title);
        leftBox.appendChild(img);
    }

    const prevTitle = document.createElement('div');
    prevTitle.innerHTML = '<br><b>수정된 도안 미리보기</b>';
    prevTitle.style.marginBottom = '10px';
    leftBox.appendChild(prevTitle);
    leftBox.appendChild(previewCanvas);

    const rightBox = document.createElement('div');
    rightBox.style.textAlign = 'center';
    rightBox.style.maxWidth = 'calc(100% - 40px)';
    rightBox.innerHTML = '<div style="font-weight:bold; margin-bottom:10px;">생성된 도안</div>';
    
    const scrollContainer = document.createElement('div');
    scrollContainer.style.overflow = 'auto';
    scrollContainer.style.maxWidth = '100%';
    scrollContainer.style.maxHeight = '80vh';
    scrollContainer.style.border = '1px solid #ddd';
    scrollContainer.style.display = 'inline-block';
    scrollContainer.appendChild(displayCanvas);

    rightBox.appendChild(scrollContainer);

    wrapper.appendChild(leftBox);
    wrapper.appendChild(rightBox);
    container.appendChild(wrapper);
}