export const drawGridLines = (ctx, w, h, size, pad) => {
  const draw = (interval, color, width) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    for (let x = 0; x <= w; x++) {
      if (x % interval === 0) {
        ctx.moveTo(pad + x * size, pad);
        ctx.lineTo(pad + x * size, pad + h * size);
      }
    }
    for (let y = 0; y <= h; y++) {
      if (y % interval === 0) {
        ctx.moveTo(pad, pad + y * size);
        ctx.lineTo(pad + w * size, pad + y * size);
      }
    }
    ctx.stroke();
  };
  draw(1, 'rgba(200, 200, 200, 0.5)', 1);
  draw(5, 'rgba(100, 100, 100, 0.8)', 2);
};

export const drawNumbers = (ctx, w, h, size, pad) => {
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
};

// 텍스트의 실제 영역(Bounding Box)을 계산하여 잘라내는 함수
export const getTrimmedTextCanvas = (text, fontFamily, color) => {
  const tempCanvas = document.createElement('canvas');
  const ctx = tempCanvas.getContext('2d');
  const fontStyle = `bold 100px ${fontFamily}`;
  ctx.font = fontStyle;
  
  const textMetrics = ctx.measureText(text);
  tempCanvas.width = textMetrics.width + 40;
  tempCanvas.height = 150;

  ctx.fillStyle = color;
  ctx.font = fontStyle;
  ctx.textBaseline = 'top';
  ctx.fillText(text, 20, 25);

  const pixels = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height).data;
  let minX = tempCanvas.width, minY = tempCanvas.height, maxX = 0, maxY = 0;
  let found = false;

  for (let y = 0; y < tempCanvas.height; y++) {
    for (let x = 0; x < tempCanvas.width; x++) {
      if (pixels[(y * tempCanvas.width + x) * 4 + 3] > 0) {
        found = true;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (!found) return tempCanvas; // 빈 캔버스 반환

  const realWidth = maxX - minX + 1;
  const realHeight = maxY - minY + 1;
  
  const trimmedCanvas = document.createElement('canvas');
  trimmedCanvas.width = realWidth;
  trimmedCanvas.height = realHeight;
  const tCtx = trimmedCanvas.getContext('2d');
  
  // 배경을 흰색으로 채움 (도안 생성 시 필요)
  tCtx.fillStyle = '#ffffff';
  tCtx.fillRect(0, 0, realWidth, realHeight);
  tCtx.drawImage(tempCanvas, minX, minY, realWidth, realHeight, 0, 0, realWidth, realHeight);

  return trimmedCanvas;
};
