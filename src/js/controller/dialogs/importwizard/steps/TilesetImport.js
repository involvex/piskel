(function () {
  const ns = $.namespace('pskl.controller.dialogs.importwizard.steps');

  ns.TilesetImport = function (piskelController, importController, container) {
    this.superclass.constructor.apply(this, arguments);
    this.tiles = [];
    this.previewCanvas = null;
  };

  pskl.utils.inherit(ns.TilesetImport, ns.AbstractImportStep);

  ns.TilesetImport.prototype.init = function () {
    this.superclass.init.call(this);

    this.tileWidthInput = this.container.querySelector('[name=tile-width]');
    this.tileHeightInput = this.container.querySelector('[name=tile-height]');
    this.columnsInput = this.container.querySelector('[name=tile-columns]');
    this.rowsInput = this.container.querySelector('[name=tile-rows]');
    this.includeEmptyCheckbox = this.container.querySelector('[name=include-empty-tiles]');
    this.previewContainer = this.container.querySelector('.tileset-preview-container');
    this.exportButton = this.container.querySelector('.export-tileset-button');
    this.createButton = this.container.querySelector('.create-tileset-button');

    this.addEventListener(this.tileWidthInput, 'input', this.onTileSizeChange_.bind(this));
    this.addEventListener(this.tileHeightInput, 'input', this.onTileSizeChange_.bind(this));
    this.addEventListener(this.columnsInput, 'input', this.onGridSizeChange_.bind(this));
    this.addEventListener(this.rowsInput, 'input', this.onGridSizeChange_.bind(this));
    this.addEventListener(this.includeEmptyCheckbox, 'change', this.updatePreview_.bind(this));
    this.addEventListener(this.exportButton, 'click', this.exportTileset_.bind(this));
    this.addEventListener(this.createButton, 'click', this.createTileset_.bind(this));

    // Initialize with current sprite dimensions
    const piskel = pskl.app.piskelController.getPiskel();
    this.tileWidthInput.value = Math.min(32, piskel.getWidth());
    this.tileHeightInput.value = Math.min(32, piskel.getHeight());
    this.columnsInput.value = Math.floor(piskel.getWidth() / this.tileWidthInput.value);
    this.rowsInput.value = Math.floor(piskel.getHeight() / this.tileHeightInput.value);

    this.updatePreview_();
  };

  ns.TilesetImport.prototype.onTileSizeChange_ = function () {
    const piskel = pskl.app.piskelController.getPiskel();
    const tileWidth = parseInt(this.tileWidthInput.value) || 1;
    const tileHeight = parseInt(this.tileHeightInput.value) || 1;
    
    this.columnsInput.value = Math.floor(piskel.getWidth() / tileWidth);
    this.rowsInput.value = Math.floor(piskel.getHeight() / tileHeight);
    
    this.updatePreview_();
  };

  ns.TilesetImport.prototype.onGridSizeChange_ = function () {
    this.updatePreview_();
  };

  ns.TilesetImport.prototype.updatePreview_ = function () {
    const options = this.getTilesetOptions_();
    
    try {
      this.tiles = pskl.service.TilesetService.createTileset(options);
      this.renderPreview_();
    } catch (error) {
      console.error('Error creating tileset preview:', error);
      this.showError_('Invalid tileset configuration');
    }
  };

  ns.TilesetImport.prototype.getTilesetOptions_ = function () {
    return {
      tileWidth: parseInt(this.tileWidthInput.value) || 32,
      tileHeight: parseInt(this.tileHeightInput.value) || 32,
      columns: parseInt(this.columnsInput.value) || 1,
      rows: parseInt(this.rowsInput.value) || 1,
      includeEmpty: this.includeEmptyCheckbox.checked
    };
  };

  ns.TilesetImport.prototype.renderPreview_ = function () {
    // Clear previous preview
    this.previewContainer.innerHTML = '';
    
    if (this.tiles.length === 0) {
      this.previewContainer.innerHTML = '<p class="no-tiles-message">No tiles to display</p>';
      return;
    }

    // Create preview canvas
    const previewCanvas = pskl.service.TilesetService.createTilesetPreview(this.tiles, 8);
    if (previewCanvas) {
      previewCanvas.className = 'tileset-preview-canvas';
      this.previewContainer.appendChild(previewCanvas);
      
      // Add grid overlay
      this.addGridOverlay_(previewCanvas);
    }

    // Update tile count
    const tileCount = this.tiles.length;
    const emptyCount = this.tiles.filter(tile => tile.isEmpty).length;
    const info = document.createElement('div');
    info.className = 'tileset-info';
    info.innerHTML = `
      <span class="tile-count">Total tiles: ${tileCount}</span>
      ${emptyCount > 0 ? `<span class="empty-tiles">Empty tiles: ${emptyCount}</span>` : ''}
    `;
    this.previewContainer.appendChild(info);
  };

  ns.TilesetImport.prototype.addGridOverlay_ = function (canvas) {
    const options = this.getTilesetOptions_();
    const { tileWidth, tileHeight } = options;
    
    const overlay = document.createElement('canvas');
    overlay.width = canvas.width;
    overlay.height = canvas.height;
    overlay.className = 'tileset-grid-overlay';
    
    const ctx = overlay.getContext('2d');
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.lineWidth = 1;
    
    // Draw vertical lines
    for (let x = 0; x <= canvas.width; x += tileWidth) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    // Draw horizontal lines
    for (let y = 0; y <= canvas.height; y += tileHeight) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    this.previewContainer.appendChild(overlay);
  };

  ns.TilesetImport.prototype.createTileset_ = function () {
    const options = this.getTilesetOptions_();
    
    try {
      this.tiles = pskl.service.TilesetService.createTileset(options);
      
      if (this.tiles.length === 0) {
        this.showError_('No tiles created with current settings');
        return;
      }
      
      // Create new frames for each tile
      const piskel = pskl.app.piskelController.getPiskel();
      const currentLayer = piskel.getLayerAt(0);
      
      // Clear existing frames if this is a new tileset
      if (confirm('This will replace all current frames with the new tileset. Continue?')) {
        currentLayer.clearFrames();
        
        this.tiles.forEach((tileData, index) => {
          const newFrame = tileData.frame.clone();
          currentLayer.addFrame(newFrame);
        });
        
        // Select first frame
        pskl.app.piskelController.selectFrameAt(0);
        
        // Trigger UI update
        $.publish(Events.PISKEL_RESET);
        $.publish(Events.PISKEL_SAVE_STATE, {
          type: pskl.service.HistoryService.SNAPSHOT
        });
        
        this.showSuccess_(`Created ${this.tiles.length} tiles`);
      }
    } catch (error) {
      console.error('Error creating tileset:', error);
      this.showError_('Failed to create tileset: ' + error.message);
    }
  };

  ns.TilesetImport.prototype.exportTileset_ = function () {
    if (this.tiles.length === 0) {
      this.showError_('No tiles to export');
      return;
    }

    const exportButton = this.exportButton;
    const originalText = exportButton.textContent;
    exportButton.textContent = 'Exporting...';
    exportButton.disabled = true;

    const onProgress = (completed, total, fileName) => {
      exportButton.textContent = `Exporting ${completed}/${total}: ${fileName}`;
    };

    pskl.service.TilesetService.exportTilesAsZip(this.tiles, onProgress)
      .then(zipBlob => {
        // Download the ZIP file
        const url = URL.createObjectURL(zipBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'tileset.zip';
        link.click();
        URL.revokeObjectURL(url);
        
        this.showSuccess_(`Exported ${this.tiles.length} tiles to tileset.zip`);
      })
      .catch(error => {
        console.error('Error exporting tileset:', error);
        this.showError_('Failed to export tileset: ' + error.message);
      })
      .finally(() => {
        exportButton.textContent = originalText;
        exportButton.disabled = false;
      });
  };

  ns.TilesetImport.prototype.showError_ = function (message) {
    $.publish(Events.TOAST_SHOW, [{ message: message, type: 'error' }]);
  };

  ns.TilesetImport.prototype.showSuccess_ = function (message) {
    $.publish(Events.TOAST_SHOW, [{ message: message, type: 'success' }]);
  };
})();