import xss from 'xss';

/**
 * Recursively sanitize all string properties in an object to prevent XSS.
 */
export const sanitizeInput = (data) => {
  if (!data) return data;

  if (typeof data === 'string') {
    return xss(data.trim());
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeInput(item));
  }

  if (typeof data === 'object') {
    const sanitizedObj = {};
    for (const [key, val] of Object.entries(data)) {
      sanitizedObj[key] = sanitizeInput(val);
    }
    return sanitizedObj;
  }

  return data;
};

export const xssSanitizeMiddleware = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeInput(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    for (const key of Object.keys(req.query)) {
      req.query[key] = sanitizeInput(req.query[key]);
    }
  }
  if (req.params && typeof req.params === 'object') {
    for (const key of Object.keys(req.params)) {
      req.params[key] = sanitizeInput(req.params[key]);
    }
  }
  next();
};
