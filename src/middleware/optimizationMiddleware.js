class OptimizationMiddleware {
  static middleware() {
    return (req, res, next) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
      
      if (process.env.NODE_ENV === 'production') {
        res.setHeader('Cache-Control', 'public, max-age=3600');
      } else {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      }

      if (req.method === 'GET') {
        res.setHeader('ETag', `W/"${Date.now()}-${process.pid}"`);
      }

      next();
    };
  }
}

export default OptimizationMiddleware;
