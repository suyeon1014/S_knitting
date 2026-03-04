import React, { useRef, useImperativeHandle, forwardRef, useState } from 'react';
import { drawGridLines, drawNumbers } from '../utils/canvasHelpers';

const CanvasBoard = forwardRef(({ mode, gridSize, setGridSize, tool, paintColor, setUsedColors, setAddedColors }, ref) => {
  const displayCanvasRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const offCanvasRef = useRef(null);
  
  const [isPainting, setIsPainting] = useState(false);
  const [historyStack, setHistoryStack] = useState([]);
  const [sourceImage, setSourceImage] = useState(null);

  const cellSize = 20;
  const padding = 30;

  useImperativeHandle(ref, () => ({
    generatePattern, undo, download, saveProject, loadProject
  }));

  const redraw = () => {
    const offCtx = offCanvasRef.current.getContext('2d');
    const ctx = displayCanvasRef.current.getContext('2d');
    const pCtx = previewCanvasRef.current.getContext('2d');
    const { width, height } = offCanvasRef.current;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, displayCanvasRef.current.width, displayCanvasRef.current.height);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(offCanvasRef.current, 0, 0, width, height, padding, padding, width * cellSize, height * cellSize);

    pCtx.clearRect(0, 0, previewCanvasRef.current.width, previewCanvasRef.current.height);
    pCtx.imageSmoothingEnabled = false;
    pCtx.drawImage(offCanvasRef.current, 0, 0);

    drawGridLines(ctx, width, height, cellSize, padding);
    drawNumbers(ctx, width, height, cellSize, padding);
  };

  const saveState = () => {
    if (!offCanvasRef.current) return;
    const ctx = offCanvasRef.current.getContext('2d');
    const data = ctx.getImageData(0, 0, offCanvasRef.current.width, offCanvasRef.current.height);
    setHistoryStack(prev => [...prev.slice(-19), data]);
  };

  const undo = () => {
    if (historyStack.length === 0) return alert("실행 취소할 내역이 없습니다.");
    const prevState = historyStack[historyStack.length - 1];
    setHistoryStack(prev => prev.slice(0, -1));
    const ctx = offCanvasRef.current.getContext('2d');
    ctx.putImageData(prevState, 0, 0);
    redraw();
  };

  const extractPalette = (width, height) => {
    const ctx = offCanvasRef.current.getContext('2d');
    const data = ctx.getImageData(0, 0, width, height).data;
    const colors = new Set();
    for (let i = 0; i < data.length; i += 4) {
      if (data[i+3] > 0) {
        const hex = "#" + ((1 << 24) + (data[i] << 16) + (data[i+1] << 8) + data[i+2]).toString(16).slice(1);
        if (hex !== '#ffffff') colors.add(hex);
      }
    }
    setUsedColors(colors);
    setAddedColors(new Set());
  };

  const generatePattern = ({ type, img, targetColor }) => {
    let width = gridSize.width;
    let height = gridSize.height;

    if (img) {
      const imgRatio = img.width / img.height;
      const gridRatio = width / height;
      if (Math.abs(imgRatio - gridRatio) > 0.1) {
        const suggestedHeight = Math.round(width / imgRatio);
        if (window.confirm(`비율이 맞지 않습니다. 세로 코 수를 ${suggestedHeight}로 변경하시겠습니까?`)) {
          height = suggestedHeight;
          setGridSize({ width, height });
        }
      }
    }

    if (!offCanvasRef.current) offCanvasRef.current = document.createElement('canvas');
    offCanvasRef.current.width = width;
    offCanvasRef.current.height = height;
    const offCtx = offCanvasRef.current.getContext('2d');
    offCtx.imageSmoothingEnabled = false;

    if (type === 'manual') {
      offCtx.fillStyle = '#ffffff'; offCtx.fillRect(0, 0, width, height);
    } else {
      offCtx.drawImage(img, 0, 0, width, height);
      processColors(offCtx, width, height, type, targetColor);
    }

    displayCanvasRef.current.width = width * cellSize + padding * 2;
    displayCanvasRef.current.height = height * cellSize + padding * 2;
    previewCanvasRef.current.width = width;
    previewCanvasRef.current.height = height;

    setHistoryStack([]);
    setSourceImage(img ? img.src : null);
    extractPalette(width, height);
    redraw();
  };

  const processColors = (ctx, w, h, type, targetColor) => {
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;
    if (type === 'text' && targetColor) {
      const tr = parseInt(targetColor.slice(1, 3), 16);
      const tg = parseInt(targetColor.slice(3, 5), 16);
      const tb = parseInt(targetColor.slice(5, 7), 16);
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i+1], b = data[i+2];
        const distWhite = Math.sqrt((r-255)**2 + (g-255)**2 + (b-255)**2);
        const distTarget = Math.sqrt((r-tr)**2 + (g-tg)**2 + (b-tb)**2);
        if (distTarget < distWhite) { data[i]=tr; data[i+1]=tg; data[i+2]=tb; data[i+3]=255; }
        else { data[i]=255; data[i+1]=255; data[i+2]=255; data[i+3]=0; }
      }
    } else if (type === 'image') {
      const step = 51;
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, Math.round(data[i]/step)*step);
        data[i+1] = Math.min(255, Math.round(data[i+1]/step)*step);
        data[i+2] = Math.min(255, Math.round(data[i+2]/step)*step);
        data[i+3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  };

  const getGridPos = (e) => {
    const rect = displayCanvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const { width, height } = offCanvasRef.current;
    if (x >= padding && x < padding + width * cellSize && y >= padding && y < padding + height * cellSize) {
      return { x: Math.floor((x - padding) / cellSize), y: Math.floor((y - padding) / cellSize) };
    }
    return null;
  };

  const paint = (x, y) => {
    const ctx = offCanvasRef.current.getContext('2d');
    const color = tool === 'eraser' ? '#ffffff' : paintColor;
    ctx.fillStyle = color; ctx.fillRect(x, y, 1, 1);
    if (tool !== 'eraser' && color !== '#ffffff') setAddedColors(prev => new Set(prev).add(color));
    redraw();
  };

  const handleMouseDown = (e) => { if(e.button!==0)return; const pos=getGridPos(e); if(!pos)return; setIsPainting(true); saveState(); paint(pos.x, pos.y); };
  const handleMouseMove = (e) => { if(!isPainting)return; const pos=getGridPos(e); if(pos) paint(pos.x, pos.y); };
  const download = () => { const link=document.createElement('a'); link.download='knitting-pattern.png'; link.href=displayCanvasRef.current.toDataURL(); link.click(); };
  const saveProject = (used, added) => { const data={width:offCanvasRef.current.width, height:offCanvasRef.current.height, imageData:offCanvasRef.current.toDataURL(), usedColors:[...used], addedColors:[...added]}; const blob=new Blob([JSON.stringify(data)],{type:"application/json"}); const link=document.createElement('a'); link.href=URL.createObjectURL(blob); link.download="project.json"; link.click(); };
  const loadProject = (data) => { const img=new Image(); img.onload=()=>{ if(!offCanvasRef.current) offCanvasRef.current=document.createElement('canvas'); offCanvasRef.current.width=data.width; offCanvasRef.current.height=data.height; const ctx=offCanvasRef.current.getContext('2d'); ctx.drawImage(img,0,0); displayCanvasRef.current.width=data.width*cellSize+padding*2; displayCanvasRef.current.height=data.height*cellSize+padding*2; previewCanvasRef.current.width=data.width; previewCanvasRef.current.height=data.height; setHistoryStack([]); setSourceImage(null); redraw(); }; img.src=data.imageData; };

  return (
    <div style={{ display: 'flex', gap: '30px', justifyContent: 'center', flexWrap: 'wrap', width: '100%' }}>
      <div style={{ textAlign: 'center' }}>
        {sourceImage && <><div style={{ marginBottom: '10px' }}><b>원본 미리보기</b></div><img src={sourceImage} alt="Original" style={{ maxWidth: '200px', border: '1px solid #ddd' }} /></>}
        <div style={{ marginTop: '20px', marginBottom: '10px' }}><b>수정된 도안 미리보기</b></div>
        <canvas ref={previewCanvasRef} style={{ width: '200px', imageRendering: 'pixelated', border: '1px solid #ddd' }} />
      </div>
      <div style={{ textAlign: 'center', maxWidth: 'calc(100% - 40px)' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>생성된 도안</div>
        <div style={{ overflow: 'auto', maxWidth: '100%', maxHeight: '80vh', border: '1px solid #ddd', display: 'inline-block' }}>
          <canvas ref={displayCanvasRef} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={()=>setIsPainting(false)} onMouseLeave={()=>setIsPainting(false)} 
            onDoubleClick={(e)=>{const pos=getGridPos(e); if(pos){saveState(); const ctx=offCanvasRef.current.getContext('2d'); ctx.fillStyle='#ffffff'; ctx.fillRect(pos.x, pos.y, 1, 1); redraw();}}}
          />
        </div>
      </div>
    </div>
  );
});

export default CanvasBoard;
