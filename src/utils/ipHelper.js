/**
 * Get IP address from request
 * Handles proxy headers like X-Forwarded-For
 */
const getIpAddress = (req) => {
  // Check for X-Forwarded-For header (proxy/load balancer)
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    // X-Forwarded-For can contain multiple IPs, get the first one
    return forwarded.split(',')[0].trim();
  }
  
  // Check for X-Real-IP header
  if (req.headers['x-real-ip']) {
    return req.headers['x-real-ip'];
  }
  
  // Fall back to socket address
  return req.socket.remoteAddress || req.connection.remoteAddress || 'unknown';
};

/**
 * Sanitize IP address (remove IPv6 prefix if present)
 */
const sanitizeIp = (ip) => {
  if (!ip) return 'unknown';
  
  // Remove IPv6 prefix for IPv4 addresses
  if (ip.startsWith('::ffff:')) {
    return ip.substring(7);
  }
  
  return ip;
};

module.exports = {
  getIpAddress,
  sanitizeIp,
};
