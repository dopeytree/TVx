# TVx Security Plan

## Overview

This document outlines a comprehensive security plan for the TVx application deployment, focusing on container security, network isolation, and access controls. The plan addresses deployment on both Docker and Unraid environments, with special consideration for Unraid's bridged networking.

## Current Security Assessment

### Identified Vulnerabilities
- **Network Exposure**: Server binds to all interfaces (0.0.0.0), accessible to other containers
- **Unauthenticated Logging**: `/log` endpoint accepts POST requests from any source
- **No Origin Validation**: Missing CORS and host validation
- **No Rate Limiting**: Potential for log spam and DoS attacks
- **Bridge Network Risks**: Unraid's default bridge network allows inter-container communication

### Risk Level: MEDIUM
While path traversal attacks are mitigated, the logging endpoint and network exposure present significant risks in multi-container environments.

## Security Best Practices

### 1. Network Isolation
- **Use custom Docker networks** instead of default bridge
- **Bind services to localhost only** when external access isn't required
- **Implement proper firewall rules** at container and host levels

### 2. Access Control
- **Authentication for sensitive endpoints** (logging, admin functions)
- **Origin validation** for web requests
- **Rate limiting** to prevent abuse
- **Input sanitization** (already implemented for logs)

### 3. Container Security
- **Run as non-root user**
- **Use minimal base images**
- **Regular security scanning**
- **Keep dependencies updated**

### 4. Monitoring & Logging
- **Centralized logging** with proper access controls
- **Security event monitoring**
- **Regular log review and analysis**

## Deployment Security Options

### Docker Deployment Security

#### Option 1: Isolated Network (Recommended)
```yaml
version: '3.8'

services:
  tvx:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: tvx
    networks:
      - tvx_isolated
    ports:
      - "8777:80"
    environment:
      - LOG_TOKEN=${LOG_TOKEN}
      - ALLOWED_ORIGINS=localhost,127.0.0.1
    volumes:
      - ./config:/config
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp

networks:
  tvx_isolated:
    driver: bridge
    internal: true  # No external access except through published ports
```

#### Option 2: Localhost Binding
```yaml
# In docker-compose.yml
services:
  tvx:
    ports:
      - "127.0.0.1:8777:80"  # Bind to localhost only
```

**What does localhost-only binding mean?**
- The service is only accessible from the host machine
- Other containers cannot reach the service directly
- External access requires host-based proxy or port forwarding
- Provides strong isolation but may limit functionality

### Unraid-Specific Security Considerations

#### Bridge Network Challenges
Unraid uses Docker bridge networks by default, which allows:
- All containers to communicate with each other
- Potential lateral movement between containers
- Shared network access to host services

#### Unraid Security Measures

1. **Custom Networks**
   ```yaml
   # In docker-compose.yml for Unraid
   networks:
     tvx_secure:
       driver: bridge
       internal: true
       ipam:
         config:
           - subnet: 172.20.0.0/16
   ```

2. **Unraid-Specific Environment Variables**
   ```yaml
   environment:
     - UNRAID=true
     - NETWORK_MODE=bridge_isolated
   ```

3. **Container Permissions**
   - Use Unraid's container permissions system
   - Limit network access through Unraid's network settings
   - Use VPN containers for external access isolation

## Authorization Mechanisms

### Log Endpoint Authorization

#### Implementation Options

**Option 1: Bearer Token Authentication**
```javascript
// In server.js
const LOG_TOKEN = process.env.LOG_TOKEN || 'default-secure-token-change-me';

if (req.method === 'POST' && pathname === '/log') {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.writeHead(401, { 'WWW-Authenticate': 'Bearer' });
    res.end('Unauthorized');
    return;
  }

  const token = authHeader.substring(7); // Remove 'Bearer '
  if (token !== LOG_TOKEN) {
    res.writeHead(401);
    res.end('Unauthorized');
    return;
  }

  // Proceed with logging...
}
```

**Option 2: API Key in Header**
```javascript
const API_KEY = process.env.LOG_API_KEY;

if (req.method === 'POST' && pathname === '/log') {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== API_KEY) {
    res.writeHead(401);
    res.end('Unauthorized');
    return;
  }
  // Proceed...
}
```

**Option 3: HMAC-SHA256 Signature**
```javascript
const crypto = require('crypto');
const SECRET_KEY = process.env.LOG_SECRET_KEY;

function verifySignature(payload, signature) {
  const expectedSignature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(payload)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}

if (req.method === 'POST' && pathname === '/log') {
  const signature = req.headers['x-signature'];
  if (!verifySignature(body, signature)) {
    res.writeHead(401);
    res.end('Unauthorized');
    return;
  }
  // Proceed...
}
```

### Client-Side Implementation
```javascript
// In frontend logging utility
const LOG_TOKEN = process.env.VITE_LOG_TOKEN;

function sendLog(level, message) {
  fetch('/log', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${LOG_TOKEN}`
    },
    body: JSON.stringify({ level, message })
  });
}
```

## Rate Limiting Implementation

### Server-Side Rate Limiting

#### Basic In-Memory Rate Limiter
```javascript
// In server.js
const rateLimitStore = new Map();

function checkRateLimit(identifier, maxRequests, windowMs) {
  const now = Date.now();
  const windowStart = now - windowMs;

  // Clean old entries
  for (const [key, timestamps] of rateLimitStore.entries()) {
    rateLimitStore.set(key, timestamps.filter(ts => ts > windowStart));
    if (rateLimitStore.get(key).length === 0) {
      rateLimitStore.delete(key);
    }
  }

  // Check current requests
  const timestamps = rateLimitStore.get(identifier) || [];
  if (timestamps.length >= maxRequests) {
    return false; // Rate limit exceeded
  }

  // Add current request
  timestamps.push(now);
  rateLimitStore.set(identifier, timestamps);
  return true;
}

// Usage in /log endpoint
if (req.method === 'POST' && pathname === '/log') {
  const clientId = req.socket.remoteAddress || 'unknown';
  if (!checkRateLimit(clientId, 60, 60000)) { // 60 requests per minute
    res.writeHead(429, { 'Retry-After': '60' });
    res.end('Too Many Requests');
    return;
  }
  // Proceed...
}
```

#### Advanced Rate Limiting with Redis
```javascript
// For production with Redis
const redis = require('redis');
const client = redis.createClient();

async function checkRateLimit(identifier, maxRequests, windowMs) {
  const key = `ratelimit:${identifier}`;
  const now = Date.now();

  // Use Redis sorted set to track requests
  const count = await client.zcount(key, now - windowMs, now);
  if (count >= maxRequests) {
    return false;
  }

  // Add current request
  await client.zadd(key, now, now);
  await client.expire(key, Math.ceil(windowMs / 1000));

  return true;
}
```

### Rate Limit Configuration
```javascript
// Configurable rate limits
const RATE_LIMITS = {
  log: { maxRequests: 60, windowMs: 60000 }, // 60 per minute
  static: { maxRequests: 1000, windowMs: 60000 }, // 1000 per minute
  video: { maxRequests: 100, windowMs: 60000 } // 100 per minute for video requests
};
```

## Security Scanning Options

### Container Image Scanning

#### Trivy (Recommended)
```bash
# Install Trivy
curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin

# Scan Docker image
trivy image ghcr.io/dopeytree/tvx:latest

# Scan filesystem
trivy fs --security-checks vuln,secret,misconfig .

# CI/CD integration
trivy image --exit-code 1 --no-progress --format sarif ghcr.io/dopeytree/tvx:latest
```

#### Docker Scout
```bash
# Enable Docker Scout
docker scout enable

# Scan image
docker scout cves ghcr.io/dopeytree/tvx:latest

# Quick view
docker scout quickview ghcr.io/dopeytree/tvx:latest
```

### Code Security Scanning

#### ESLint Security Plugins
```javascript
// In eslint.config.js
module.exports = {
  plugins: ['security'],
  rules: {
    'security/detect-eval-with-expression': 'error',
    'security/detect-non-literal-regexp': 'error',
    'security/detect-unsafe-regex': 'error',
    'security/detect-buffer-noassert': 'error',
    'security/detect-child-process': 'error',
    'security/detect-disable-mustache-escape': 'error',
    'security/detect-eval-with-expression': 'error',
    'security/detect-new-buffer': 'error',
    'security/detect-no-csrf-before-method-override': 'error',
    'security/detect-non-literal-fs-filename': 'error',
    'security/detect-object-injection': 'error',
    'security/detect-possible-timing-attacks': 'error',
    'security/detect-pseudoRandomBytes': 'error'
  }
};
```

#### Semgrep
```bash
# Install Semgrep
pip install semgrep

# Scan for security issues
semgrep --config=auto .

# Custom rules for Node.js
semgrep --config=p/nodejs .
```

#### CodeQL
```yaml
# In GitHub Actions
- name: Initialize CodeQL
  uses: github/codeql-action/init@v2
  with:
    languages: javascript

- name: Autobuild
  uses: github/codeql-action/autobuild@v2

- name: Perform CodeQL Analysis
  uses: github/codeql-action/analyze@v2
```

### Dependency Scanning

#### npm audit
```bash
# Basic audit
npm audit

# Fix vulnerabilities
npm audit fix

# Detailed report
npm audit --audit-level=moderate
```

#### Snyk
```bash
# Install Snyk CLI
npm install -g snyk

# Authenticate
snyk auth

# Test project
snyk test

# Monitor for vulnerabilities
snyk monitor
```

### Runtime Security

#### Falco (Container Runtime Security)
```yaml
# falco_rules.local.yaml
- rule: Unexpected outbound connection
  desc: Detect outbound connections to unexpected destinations
  condition: outbound and not (fd.sip.name in (allowed_domains))
  output: Unexpected outbound connection (command=%proc.cmdline connection=%fd.name)
  priority: WARNING
```

#### Docker Bench Security
```bash
# Run Docker Bench Security
docker run --rm --net host --pid host --userns host --cap-add audit_control \
  -e DOCKER_CONTENT_TRUST=$DOCKER_CONTENT_TRUST \
  -v /var/lib:/var/lib \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v /usr/lib/systemd:/usr/lib/systemd \
  -v /etc:/etc --label docker_bench_security \
  docker/docker-bench-security
```

## Implementation Plan

### Phase 1: Immediate Security Fixes (Week 1)
1. ✅ Add authentication to `/log` endpoint
2. ✅ Implement rate limiting
3. ✅ Add origin validation
4. ✅ Update Docker Compose with custom network
5. ✅ Bind to localhost if appropriate

### Phase 2: Enhanced Security (Week 2)
1. Implement security headers (CSP, HSTS, etc.)
2. Add input validation for all endpoints
3. Implement proper error handling
4. Add security logging
5. Set up automated security scanning

### Phase 3: Monitoring & Compliance (Week 3)
1. Set up security monitoring
2. Implement log aggregation
3. Add security dashboards
4. Regular security audits
5. Compliance documentation

### Phase 4: Advanced Security (Month 2)
1. Container hardening
2. Network segmentation
3. Zero-trust architecture
4. Security automation
5. Incident response plan

## Environment Variables

```bash
# Security Configuration
LOG_TOKEN=your-secure-log-token-here
LOG_API_KEY=your-api-key-here
LOG_SECRET_KEY=your-hmac-secret-here

# Network Configuration
ALLOWED_ORIGINS=localhost,127.0.0.1,your-domain.com
NETWORK_MODE=isolated

# Rate Limiting
LOG_RATE_LIMIT=60
STATIC_RATE_LIMIT=1000
VIDEO_RATE_LIMIT=100

# Security Headers
CSP_ENABLED=true
HSTS_ENABLED=true
```

## Monitoring & Alerts

### Security Events to Monitor
- Failed authentication attempts
- Rate limit violations
- Unusual request patterns
- File access attempts outside static directory
- Log file size anomalies

### Alert Configuration
```javascript
// Security event logging
function logSecurityEvent(event, details) {
  const securityLog = {
    timestamp: new Date().toISOString(),
    event: event,
    details: details,
    ip: req.socket.remoteAddress,
    userAgent: req.headers['user-agent']
  };

  writeLog(`[SECURITY] ${JSON.stringify(securityLog)}`);
}
```

## Testing Security

### Security Test Cases
1. Attempt unauthorized access to `/log` endpoint
2. Test rate limiting with rapid requests
3. Try path traversal attacks
4. Test with invalid origins
5. Attempt log injection attacks
6. Test large payload handling

### Penetration Testing Checklist
- [ ] Network scanning (nmap)
- [ ] Web application scanning (OWASP ZAP)
- [ ] Container vulnerability scanning
- [ ] Dependency vulnerability scanning
- [ ] Authentication bypass testing
- [ ] Authorization testing
- [ ] Input validation testing

## Compliance Considerations

### Security Standards
- **OWASP Top 10** compliance
- **Docker security best practices**
- **Container security standards**
- **Network security principles**

### Audit Requirements
- Security control documentation
- Access control matrices
- Security event logs
- Vulnerability assessment reports
- Incident response procedures

## Conclusion

This security plan provides a comprehensive approach to securing the TVx application in containerized environments. The focus is on network isolation, access control, and monitoring, with specific considerations for Unraid deployments.

**Key Recommendations:**
1. Implement authentication for the logging endpoint
2. Use custom Docker networks for isolation
3. Add rate limiting to prevent abuse
4. Regular security scanning and monitoring
5. Follow the phased implementation plan

**Risk Mitigation Priority:**
- **High**: Network isolation and authentication
- **Medium**: Rate limiting and input validation
- **Low**: Advanced monitoring and compliance

Regular security reviews and updates are essential to maintain the security posture of the application.