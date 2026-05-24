import compression from 'compression';

class CompressionEngine {
  constructor(options = {}) {
    this.options = options;
    this.compressedResponses = 0;
    this.bytesOriginal = 0;
    this.bytesCompressed = 0;
    this.level = options.compressionLevel || 9;
    this.threshold = options.compressionThreshold || 1024;
  }

  middleware() {
    return compression({
      level: this.level,
      threshold: this.threshold,
      filter: (req, res) => {
        if (req.originalUrl.includes('/stream')) {
          return false;
        }
        return compression.filter(req, res);
      },
    });
  }

  recordCompression(original, compressed) {
    this.compressedResponses++;
    this.bytesOriginal += original;
    this.bytesCompressed += compressed;
  }

  getStats() {
    const saved = this.bytesOriginal - this.bytesCompressed;
    const percentage = this.bytesOriginal > 0 ? ((saved / this.bytesOriginal) * 100).toFixed(2) : 0;

    return {
      compressedResponses: this.compressedResponses,
      bytesOriginal: this.bytesOriginal,
      bytesCompressed: this.bytesCompressed,
      bytesSaved: saved,
      compressionRatio: `${percentage}%`,
    };
  }
}

export default CompressionEngine;
