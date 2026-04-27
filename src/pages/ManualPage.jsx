import React from 'react';
import ControlPanel from '../components/ControlPanel';
import CanvasBoard from '../components/CanvasBoard';
import Palette from '../components/Palette';
import useKnitting from '../hooks/useKnitting';

function ManualPage() {
  const {
    gridSize, setGridSize, paintColor, setPaintColor, tool, setTool,
    usedColors, setUsedColors, addedColors, setAddedColors, canvasBoardRef,
    handleGenerate, handleUndo, handleDownload, handleSaveProject, handleLoadProject, handleClear
  } = useKnitting();

  return (
    <>
      <div className="controls">
        <ControlPanel 
          mode="manual" gridSize={gridSize} setGridSize={setGridSize}
          onGenerate={handleGenerate} onUndo={handleUndo}
          onDownload={handleDownload} onSave={handleSaveProject} onLoad={handleLoadProject}
          tool={tool} setTool={setTool} paintColor={paintColor} setPaintColor={setPaintColor}
        />
        <div className="control-group">
          <button className="secondary-btn" onClick={handleClear} style={{ height: '38px', borderColor: 'var(--primary)', color: 'var(--primary)' }}>
            🗑️ 전체 지우기
          </button>
        </div>
        <div className="control-group" style={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end', paddingBottom: '4px' }}>
          <div style={{ fontSize: '0.9rem', color: 'var(--gray)', backgroundColor: 'var(--light)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border)' }}>
            💡 <b>Tip:</b> 원하는 색상으로 나만의 도안을 자유롭게 그려보세요!
          </div>
        </div>
        <Palette usedColors={usedColors} addedColors={addedColors} onSelectColor={setPaintColor} />
      </div>
      <div id="pattern-container">
        <CanvasBoard 
          ref={canvasBoardRef} mode="manual" gridSize={gridSize} setGridSize={setGridSize}
          tool={tool} paintColor={paintColor}
          setUsedColors={setUsedColors} setAddedColors={setAddedColors}
        />
      </div>
    </>
  );
}

export default ManualPage;