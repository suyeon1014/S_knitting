import React, { useState, useRef } from 'react';
import './App.css'
import ControlPanel from './components/ControlPanel';
import CanvasBoard from './components/CanvasBoard';
import Palette from './components/Palette';

function App() {
  const [mode, setMode] = useState('image');
  const [gridSize, setGridSize] = useState({ width: 30, height: 30 });
  const [paintColor, setPaintColor] = useState('#ff6b6b');
  const [tool, setTool] = useState('paint');
  const [usedColors, setUsedColors] = useState(new Set());
  const [addedColors, setAddedColors] = useState(new Set());
  
  const canvasBoardRef = useRef();

  const handleGenerate = (data) => canvasBoardRef.current?.generatePattern(data);
  const handleUndo = () => canvasBoardRef.current?.undo();
  const handleDownload = () => canvasBoardRef.current?.download();
  const handleSaveProject = () => canvasBoardRef.current?.saveProject(usedColors, addedColors);
  const handleLoadProject = (data) => {
    setGridSize({ width: data.width, height: data.height });
    setUsedColors(new Set(data.usedColors));
    setAddedColors(new Set(data.addedColors));
    canvasBoardRef.current?.loadProject(data);
  };

  return (
    <div className="container">
      <h1>🧶 뜨개 도안 생성기</h1>

      <div className="controls">
        <div style={{ width: '100%' }}>
          <div className="tabs">
            <button className={`tab-btn ${mode === 'image' ? 'active' : ''}`} onClick={() => setMode('image')}>이미지로 만들기</button>
            <button className={`tab-btn ${mode === 'text' ? 'active' : ''}`} onClick={() => setMode('text')}>글자로 만들기</button>
            <button className={`tab-btn ${mode === 'manual' ? 'active' : ''}`} onClick={() => setMode('manual')}>직접 만들기</button>
          </div>
        </div>

        <ControlPanel 
          mode={mode} gridSize={gridSize} setGridSize={setGridSize}
          onGenerate={handleGenerate} onUndo={handleUndo}
          onDownload={handleDownload} onSave={handleSaveProject} onLoad={handleLoadProject}
          tool={tool} setTool={setTool} paintColor={paintColor} setPaintColor={setPaintColor}
        />

        <Palette usedColors={usedColors} addedColors={addedColors} onSelectColor={setPaintColor} />
      </div>

      <div id="pattern-container">
        <CanvasBoard 
          ref={canvasBoardRef}
          mode={mode}
          gridSize={gridSize}
          setGridSize={setGridSize}
          tool={tool}
          paintColor={paintColor}
          setUsedColors={setUsedColors}
          setAddedColors={setAddedColors}
        />
      </div>
    </div>
  )
}

export default App
