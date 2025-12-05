/**
 * Tileset creation and splitting utilities
 */
(function () {
  const ns = $.namespace('pskl.service');

  /**
   * Service for creating and splitting tilesets from sprites
   */
  ns.TilesetService = {
    /**
     * Create a tileset from current sprite
     * @param {Object} options - Tileset options
     * @param {number} options.tileWidth - Width of each tile
     * @param {number} options.tileHeight - Height of each tile
     * @param {number} options.columns - Number of columns in tileset
     * @param {number} options.rows - Number of rows in tileset
     * @param {boolean} options.includeEmpty - Include empty tiles in export
     * @return {Array} Array of tile data objects
     */
    createTileset: function (options) {
      const piskel = pskl.app.piskelController.getPiskel();
      const frame = piskel.getLayerAt(0).getFrameAt(0);
      const spriteWidth = piskel.getWidth();
      const spriteHeight = piskel.getHeight();
      
      const tiles = [];
      const { tileWidth, tileHeight, columns, rows, includeEmpty } = options;
      
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
          const x = col * tileWidth;
          const y = row * tileHeight;
          
          // Check if tile is within sprite bounds
          if (x >= spriteWidth || y >= spriteHeight) {
            if (includeEmpty) {
              tiles.push(this.createEmptyTile(tileWidth, tileHeight, row, col));
            }
            continue;
          }
          
          const tileData = this.extractTile(frame, x, y, tileWidth, tileHeight, row, col);
          
          // Only add non-empty tiles unless includeEmpty is true
          if (includeEmpty || !this.isEmptyTile(tileData)) {
            tiles.push(tileData);
          }
        }
      }
      
      return tiles;
    },

    /**
     * Extract a tile from a frame
     * @param {Frame} frame - Source frame
     * @param {number} x - X position in frame
     * @param {number} y - Y position in frame
     * @param {number} width - Tile width
     * @param {number} height - Tile height
     * @param {number} row - Tile row in grid
     * @param {number} col - Tile column in grid
     * @return {Object} Tile data object
     */
    extractTile: function (frame, x, y, width, height, row, col) {
      const tileFrame = new pskl.model.Frame(width, height);
      
      for (let dy = 0; dy < height; dy++) {
        for (let dx = 0; dx < width; dx++) {
          const sourceX = x + dx;
          const sourceY = y + dy;
          
          if (sourceX < frame.getWidth() && sourceY < frame.getHeight()) {
            const color = frame.getPixel(sourceX, sourceY);
            tileFrame.setPixel(dx, dy, color);
          }
        }
      }
      
      return {
        frame: tileFrame,
        x: x,
        y: y,
        width: width,
        height: height,
        row: row,
        col: col,
        name: `tile_${row}_${col}.png`
      };
    },

    /**
     * Create an empty tile
     * @param {number} width - Tile width
     * @param {number} height - Tile height
     * @param {number} row - Tile row in grid
     * @param {number} col - Tile column in grid
     * @return {Object} Empty tile data object
     */
    createEmptyTile: function (width, height, row, col) {
      const tileFrame = new pskl.model.Frame(width, height);
      
      return {
        frame: tileFrame,
        x: 0,
        y: 0,
        width: width,
        height: height,
        row: row,
        col: col,
        name: `tile_${row}_${col}_empty.png`,
        isEmpty: true
      };
    },

    /**
     * Check if a tile is empty (all transparent pixels)
     * @param {Object} tileData - Tile data object
     * @return {boolean} True if tile is empty
     */
    isEmptyTile: function (tileData) {
      const frame = tileData.frame;
      for (let y = 0; y < frame.getHeight(); y++) {
        for (let x = 0; x < frame.getWidth(); x++) {
          const color = frame.getPixel(x, y);
          if (color !== pskl.utils.ColorUtils.TRANSPARENT_COLOR) {
            return false;
          }
        }
      }
      return true;
    },

    /**
     * Export tiles as individual PNG files in a ZIP
     * @param {Array} tiles - Array of tile data objects
     * @param {Function} onProgress - Progress callback
     * @return {Promise} Promise that resolves with ZIP blob
     */
    exportTilesAsZip: function (tiles, onProgress) {
      return new Promise((resolve, reject) => {
        const zip = new JSZip();
        let completed = 0;
        
        tiles.forEach((tileData, index) => {
          this.exportTileAsPng(tileData.frame)
            .then(pngBlob => {
              zip.file(tileData.name, pngBlob);
              completed++;
              
              if (onProgress) {
                onProgress(completed, tiles.length, tileData.name);
              }
              
              if (completed === tiles.length) {
                zip.generateAsync({ type: 'blob' })
                  .then(zipBlob => resolve(zipBlob))
                  .catch(reject);
              }
            })
            .catch(reject);
        });
      });
    },

    /**
     * Export a single tile frame as PNG
     * @param {Frame} frame - Tile frame to export
     * @return {Promise} Promise that resolves with PNG blob
     */
    exportTileAsPng: function (frame) {
      return new Promise((resolve, reject) => {
        try {
          const canvas = pskl.utils.CanvasUtils.createCanvasWithFrame(frame);
          canvas.toBlob(blob => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create PNG blob'));
            }
          }, 'image/png');
        } catch (error) {
          reject(error);
        }
      });
    },

    /**
     * Create a tileset preview canvas
     * @param {Array} tiles - Array of tile data objects
     * @param {number} columns - Number of columns in preview
     * @return {HTMLCanvasElement} Preview canvas
     */
    createTilesetPreview: function (tiles, columns) {
      if (tiles.length === 0) {
        return null;
      }
      
      const tileWidth = tiles[0].width;
      const tileHeight = tiles[0].height;
      const rows = Math.ceil(tiles.length / columns);
      
      const canvas = document.createElement('canvas');
      canvas.width = columns * tileWidth;
      canvas.height = rows * tileHeight;
      
      const ctx = canvas.getContext('2d');
      
      tiles.forEach((tileData, index) => {
        const row = Math.floor(index / columns);
        const col = index % columns;
        const x = col * tileWidth;
        const y = row * tileHeight;
        
        const tileCanvas = pskl.utils.CanvasUtils.createCanvasWithFrame(tileData.frame);
        ctx.drawImage(tileCanvas, x, y);
      });
      
      return canvas;
    }
  };
})();