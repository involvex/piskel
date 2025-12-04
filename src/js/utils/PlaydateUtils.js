/**
 * Playdate-specific utilities for handling imagetable filenames and frame extraction
 */
(function () {
  const ns = $.namespace('pskl.utils');

  /**
   * Playdate Imagetable filename patterns and frame extraction utilities
   */
  ns.PlaydateUtils = {
    /**
     * Playdate imagetable filename patterns
     * Supports formats like:
     * - filename_128x128.png (single frame)
     * - filename_64x64_4x4.png (4x4 grid)
     * - filename_32x32_8frames.png (8 frames horizontal)
     * - filename_16x16_2x4.png (2x4 grid)
     */
    IMAGETABLE_PATTERNS: [
      {
        // Pattern: filename_WIDTHxHEIGHT.png
        // Example: sprite_16x16.png
        regex: /^(.+)_(\d+)x(\d+)\.png$/i,
        parse: function (filename) {
          const match = filename.match(this.regex);
          if (match) {
            return {
              baseName: match[1],
              frameWidth: parseInt(match[2], 10),
              frameHeight: parseInt(match[3], 10),
              frames: 1,
              layout: 'single',
            };
          }
          return null;
        },
      },
      {
        // Pattern: filename_WIDTHxHEIGHT_COLSxROWS.png
        // Example: tiles_16x16_4x4.png
        regex: /^(.+)_(\d+)x(\d+)_(\d+)x(\d+)\.png$/i,
        parse: function (filename) {
          const match = filename.match(this.regex);
          if (match) {
            return {
              baseName: match[1],
              frameWidth: parseInt(match[2], 10),
              frameHeight: parseInt(match[3], 10),
              cols: parseInt(match[4], 10),
              rows: parseInt(match[5], 10),
              frames: parseInt(match[4], 10) * parseInt(match[5], 10),
              layout: 'grid',
            };
          }
          return null;
        },
      },
      {
        // Pattern: filename_WIDTHxHEIGHT_FRAMESframes.png
        // Example: animation_32x32_8frames.png
        regex: /^(.+)_(\d+)x(\d+)_(\d+)frames\.png$/i,
        parse: function (filename) {
          const match = filename.match(this.regex);
          if (match) {
            return {
              baseName: match[1],
              frameWidth: parseInt(match[2], 10),
              frameHeight: parseInt(match[3], 10),
              frames: parseInt(match[4], 10),
              cols: parseInt(match[4], 10),
              rows: 1,
              layout: 'horizontal',
            };
          }
          return null;
        },
      },
      {
        // Pattern: filename_WIDTHxHEIGHT_COLSxROWS.png (alternative)
        // Example: sprites_8x8_2x4.png
        regex: /^(.+)_(\d+)x(\d+)_(\d+)x(\d+)\.png$/i,
        parse: function (filename) {
          const match = filename.match(this.regex);
          if (match) {
            return {
              baseName: match[1],
              frameWidth: parseInt(match[2], 10),
              frameHeight: parseInt(match[3], 10),
              cols: parseInt(match[4], 10),
              rows: parseInt(match[5], 10),
              frames: parseInt(match[4], 10) * parseInt(match[5], 10),
              layout: 'grid',
            };
          }
          return null;
        },
      },
    ],

    /**
     * Parse Playdate imagetable filename to extract frame information
     * @param {string} filename - The filename to parse
     * @return {Object|null} - Parsed frame info or null if not a Playdate imagetable
     */
    parseImagetableFilename: function (filename) {
      // Try each pattern until we find a match
      for (let i = 0; i < this.IMAGETABLE_PATTERNS.length; i++) {
        const pattern = this.IMAGETABLE_PATTERNS[i];
        const result = pattern.parse(filename);
        if (result) {
          return result;
        }
      }
      return null;
    },

    /**
     * Check if a filename matches Playdate imagetable patterns
     * @param {string} filename - The filename to check
     * @return {boolean} - True if it matches Playdate imagetable patterns
     */
    isPlaydateImagetableFilename: function (filename) {
      return this.parseImagetableFilename(filename) !== null;
    },

    /**
     * Extract frame dimensions from Playdate imagetable filename
     * @param {string} filename - The filename to parse
     * @return {Object|null} - Object with frameWidth, frameHeight, or null
     */
    extractFrameDimensions: function (filename) {
      const parsed = this.parseImagetableFilename(filename);
      if (parsed) {
        return {
          frameWidth: parsed.frameWidth,
          frameHeight: parsed.frameHeight,
          frames: parsed.frames || 1,
          cols: parsed.cols || 1,
          rows: parsed.rows || 1,
          layout: parsed.layout || 'single',
        };
      }
      return null;
    },

    /**
     * Get suggested import settings for Playdate imagetable
     * @param {string} filename - The filename to analyze
     * @return {Object|null} - Import settings or null if not applicable
     */
    getPlaydateImportSettings: function (filename) {
      const dimensions = this.extractFrameDimensions(filename);
      if (dimensions) {
        return {
          frameSizeX: dimensions.frameWidth,
          frameSizeY: dimensions.frameHeight,
          frameOffsetX: 0,
          frameOffsetY: 0,
          importType: dimensions.layout === 'single' ? 'single' : 'sheet',
          frameCount: dimensions.frames,
          isPlaydateImagetable: true,
          playdateInfo: {
            baseName: this.parseImagetableFilename(filename).baseName,
            layout: dimensions.layout,
            cols: dimensions.cols,
            rows: dimensions.rows,
          },
        };
      }
      return null;
    },

    /**
     * Create frame extraction plan for Playdate imagetable
     * @param {Image} image - The source image
     * @param {string} filename - The original filename
     * @return {Object|null} - Frame extraction plan or null
     */
    createFrameExtractionPlan: function (image, filename) {
      const settings = this.getPlaydateImportSettings(filename);
      if (!settings) {
        return null;
      }

      const frameWidth = settings.frameSizeX;
      const frameHeight = settings.frameSizeY;
      const cols = settings.playdateInfo.cols;
      const rows = settings.playdateInfo.rows;

      // Validate that the image dimensions match the expected grid
      const expectedWidth = frameWidth * cols;
      const expectedHeight = frameHeight * rows;

      if (image.width !== expectedWidth || image.height !== expectedHeight) {
        console.warn(
          'Playdate imagetable dimensions do not match filename pattern'
        );
        console.warn('Expected: ' + expectedWidth + 'x' + expectedHeight);
        console.warn('Actual: ' + image.width + 'x' + image.height);
        return null;
      }

      return {
        frameWidth: frameWidth,
        frameHeight: frameHeight,
        cols: cols,
        rows: rows,
        frameCount: cols * rows,
        extractionMethod: settings.layout,
        frames: this.generateFramePositions(
          frameWidth,
          frameHeight,
          cols,
          rows
        ),
      };
    },

    /**
     * Generate frame positions for grid-based extraction
     * @param {number} frameWidth - Width of each frame
     * @param {number} frameHeight - Height of each frame
     * @param {number} cols - Number of columns
     * @param {number} rows - Number of rows
     * @return {Array} - Array of frame position objects
     */
    generateFramePositions: function (frameWidth, frameHeight, cols, rows) {
      const positions = [];
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          positions.push({
            x: col * frameWidth,
            y: row * frameHeight,
            width: frameWidth,
            height: frameHeight,
            index: row * cols + col,
          });
        }
      }
      return positions;
    },

    /**
     * Check if filename follows Playdate naming conventions
     * @param {string} filename - The filename to check
     * @return {boolean} - True if it follows Playdate conventions
     */
    followsPlaydateNamingConventions: function (filename) {
      // Playdate typically uses snake_case with dimensions
      return /^[a-z0-9_]+_\d+x\d+(\.\d+x\d+)?\.png$/i.test(filename);
    },
  };
})();
