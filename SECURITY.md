# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| latest  | :white_check_mark: |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability in TVx, please report it responsibly:

### How to Report

1. **DO NOT** create a public GitHub issue
2. Email: [Your email or use GitHub Security Advisory]
3. Or use GitHub's private vulnerability reporting:
   - Go to the Security tab
   - Click "Report a vulnerability"
   - Fill out the form with details

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if you have one)

### What to Expect

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Depends on severity
  - Critical: 24-48 hours
  - High: 1 week
  - Medium: 2-4 weeks
  - Low: Best effort

### Disclosure Policy

- We will acknowledge your report within 48 hours
- We will provide a fix timeline based on severity
- We will credit you in the security advisory (unless you prefer to remain anonymous)
- We ask that you do not publicly disclose the vulnerability until we've released a fix

## Security Best Practices for Users

### Docker Deployment

1. **Always use the latest image**: `docker pull dopeytree/tvx:latest`
2. **Run as non-root**: The container runs nginx as non-root by default
3. **Use reverse proxy**: Deploy behind nginx/Traefik with HTTPS
4. **Network isolation**: Use Docker networks to isolate containers

### General Usage

1. **HTTPS Only**: Always access TVx over HTTPS in production
2. **Private Networks**: Best used on private networks or behind VPN
3. **URL Validation**: Only use trusted M3U/XMLTV URLs
4. **Keep Updated**: Regularly update to the latest version

## Known Security Considerations

### Client-Side Storage

- Settings are stored in browser localStorage (client-side only)
- No server-side data storage or user accounts
- M3U/XMLTV URLs are stored locally in your browser

### External Links

- "More Info" links open Google searches in new tabs
- Uses `rel="noopener noreferrer"` for security

### Content Sources

- TVx is a viewer only - it does not host or provide content
- Security of streams depends on your M3U/XMLTV sources
- Always use trusted IPTV providers

## Security Features

✅ **No Authentication Required**: Designed for private home use
✅ **No Data Collection**: No analytics, tracking, or telemetry
✅ **Client-Side Only**: All processing happens in your browser
✅ **Minimal Attack Surface**: Static site, no backend APIs
✅ **Content Security**: Proper CSP headers in nginx config
✅ **XSS Protection**: React's built-in XSS protection
✅ **Dependency Management**: Automated Dependabot updates

## Contact

For security concerns, please use GitHub's private vulnerability reporting or create a security advisory in the repository.
