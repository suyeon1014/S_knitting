import React from 'react';
import ControlPanel from '../components/ControlPanel';
import CanvasBoard from '../components/CanvasBoard';
import Palette from '../components/Palette';
import useKnitting from '../hooks/useKnitting';

function ImagePage() {
  const {
    gridSize, setGridSize, paintColor, setPaintColor, tool, setTool,
    usedColors, setUsedColors, addedColors, setAddedColors, canvasBoardRef,
    handleGenerate, handleUndo, handleDownload, handleSaveProject, handleLoadProject
  } = useKnitting();

  return (
    <>
      <div className="controls">
        <ControlPanel 
          mode="image" gridSize={gridSize} setGridSize={setGridSize}
          onGenerate={handleGenerate} onUndo={handleUndo}
          onDownload={handleDownload} onSave={handleSaveProject} onLoad={handleLoadProject}
          tool={tool} setTool={setTool} paintColor={paintColor} setPaintColor={setPaintColor}
        />
        <Palette usedColors={usedColors} addedColors={addedColors} onSelectColor={setPaintColor} />
      </div>
      <div id="pattern-container">
        <CanvasBoard 
          ref={canvasBoardRef} mode="image" gridSize={gridSize} setGridSize={setGridSize}
          tool={tool} paintColor={paintColor}
          setUsedColors={setUsedColors} setAddedColors={setAddedColors}
        />
      </div>
    </>
  );
}

export default ImagePage;