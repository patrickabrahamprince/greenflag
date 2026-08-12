# GreenFlag Security Testing with Strix AI Pentesting

## Overview

Strix is an autonomous AI pentesting tool that will thoroughly test GreenFlag for vulnerabilities before App Store submission. It acts like a real hacker - finding and validating security issues through working proof-of-concept exploits.

---

## Prerequisites

Before running Strix, ensure you have:

- ✅ Docker installed and running
- ✅ LLM API key (OpenAI, Anthropic, Google, or other supported provider)
- ✅ GreenFlag app deployed and accessible
- ✅ Admin credentials configured
- ✅ Test accounts created

---

## Installation & Setup

### 1. Install Strix

```bash
curl -sSL https://strix.ai/install | bash
```

### 2. Configure LLM Provider

Choose your LLM and set environment variables:

**OpenAI:**
```bash
export STRIX_LLM="openai/gpt-4"
export LLM_API_KEY="sk-..."
```

**Anthropic (Claude):**
```bash
export STRIX_LLM="anthropic/claude-3-opus"
export ANTHROPIC_API_KEY="sk-ant-..."
```

**Google:**
```bash
export STRIX_LLM="google/gemini-pro"
export GOOGLE_API_KEY="..."
```

### 3. Verify Docker is Running

```bash
docker ps
# Should show running containers, or empty list if none running
```

---

## Running Security Assessment

### Option 1: Scan Live Deployment (Recommended)

Test against the live GreenFlag app at Vercel:

```bash
strix --target https://greenflag-dusky.vercel.app \
      --depth full \
      --verbose \
      --report json
```

**Parameters:**
- `--target`: URL of the app to test
- `--depth full`: Run comprehensive tests
- `--verbose`: Show detailed progress
- `--report json`: Output results as JSON

### Option 2: Scan Local Repository

Test the source code directly:

```bash
strix --target /Users/patrickabraham/Documents/GreenFlag_Backup/GreenFlag \
      --type web \
      --depth full \
      --language typescript \
      --report json
```

### Option 3: Scan with API Key for Authenticated Testing

If you want Strix to test authenticated endpoints:

```bash
strix --target https://greenflag-dusky.vercel.app \
      --auth-header "Authorization: Bearer YOUR_AUTH_TOKEN" \
      --depth full \
      --report json
```

---

## What Strix Will Test

### Authentication & Authorization
- ✓ OAuth flow vulnerabilities (Google, Apple)
- ✓ Session management (cookie security, expiration)
- ✓ JWT token validation
- ✓ Admin authentication bypass
- ✓ CORS misconfiguration
- ✓ Cross-site request forgery (CSRF)
- ✓ Privilege escalation

### API Security
- ✓ SQL injection (Supabase queries)
- ✓ NoSQL injection
- ✓ Command injection
- ✓ Path traversal
- ✓ Insecure direct object references (IDOR)
- ✓ API rate limiting bypass
- ✓ Broken object level authorization

### Data Security
- ✓ Sensitive data exposure (emails, photos, personal info)
- ✓ Encryption vulnerabilities
- ✓ Password storage issues
- ✓ Environment variable leaks
- ✓ Database credential exposure
- ✓ API key exposure

### Business Logic Vulnerabilities
- ✓ Coin system exploitation (bypass deduction, duplicate purchases)
- ✓ Matching algorithm manipulation
- ✓ Profile verification bypass
- ✓ Age verification bypass
- ✓ Day 1-3 flow circumvention (skip days, bypass timers)
- ✓ Photo unlock without payment
- ✓ IAP tampering

### Infrastructure & Configuration
- ✓ Exposed credentials in code/config
- ✓ Insecure dependencies
- ✓ Unpatched vulnerabilities (CVEs)
- ✓ Misconfigured Supabase RLS policies
- ✓ Exposed debug endpoints
- ✓ Security headers missing

---

## Interpreting Results

### Check Results

After the scan completes, review findings:

```bash
# View results in JSON
cat strix_runs/latest/report.json

# Or generate a more readable report
strix --analyze strix_runs/latest
```

### Severity Levels

- 🔴 **Critical**: Immediate exploitation possible, data breach risk
- 🟠 **High**: Serious vulnerability, exploitation likely
- 🟡 **Medium**: Moderate risk, exploitation possible under certain conditions
- 🔵 **Low**: Minor issue, exploitation difficult

### For Each Finding, You'll Get:

1. **Vulnerability Description**: What was found and why it's a problem
2. **Proof of Concept**: Working exploit that demonstrates the issue
3. **Attack Path**: Step-by-step how an attacker would exploit it
4. **Remediation**: Specific code fixes and recommendations
5. **CVSS Score**: Industry-standard severity rating

---

## Fixing Vulnerabilities

### Process for Each Finding:

1. **Understand the Issue**
   - Read the vulnerability description
   - Review the proof-of-concept
   - Understand the attack path

2. **Implement Fix**
   - Modify code according to recommendations
   - Add input validation/sanitization
   - Implement proper authentication checks
   - Fix business logic bugs

3. **Test the Fix**
   - Verify the vulnerability is closed
   - Re-run Strix on that specific endpoint if possible

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "Fix security vulnerability: [description]"
   ```

---

## Re-Testing After Fixes

### Full Re-scan

```bash
strix --target https://greenflag-dusky.vercel.app \
      --depth full \
      --report json
```

### Targeted Re-scan

Test specific endpoints that were fixed:

```bash
strix --target https://greenflag-dusky.vercel.app/api/coins \
      --depth full \
      --report json
```

### Generate Comparison Report

```bash
strix --compare strix_runs/run1 strix_runs/run2
```

---

## Common Vulnerabilities in Dating Apps

### High Priority to Monitor

1. **Profile Verification Bypass**
   - Can fake profiles be created?
   - Can photo moderation be bypassed?
   - Can age verification be spoofed?

2. **Coin System Exploitation**
   - Can coins be duplicated?
   - Can purchases be reversed?
   - Can free coins be gained illegally?

3. **Matching & Messaging Bypass**
   - Can Day 1-3 progression be skipped?
   - Can users message before Day 3?
   - Can locked features be accessed without payment?

4. **Admin Panel Access**
   - Can unauthenticated users access /admin?
   - Can regular users escalate to admin?
   - Can sensitive admin data be extracted?

5. **Data Privacy**
   - Can user photos be enumerated?
   - Can sensitive profile data be exposed?
   - Can another user's data be accessed (IDOR)?

---

## Generating Final Report

### PDF Report for Stakeholders

```bash
strix --report pdf \
      --output greenflag_security_audit.pdf \
      --include-poc false  # Don't include working exploits in PDF
```

### Compliance Report

```bash
strix --report compliance \
      --standards owasp10 \
      --output compliance_report.pdf
```

### Executive Summary

```bash
strix --summary \
      --format markdown \
      --output security_summary.md
```

---

## Before App Store Submission

✅ **Must Complete:**
1. All critical vulnerabilities fixed
2. All high-severity issues addressed
3. Medium severity issues evaluated and mitigated
4. Low issues documented
5. Final re-scan shows no critical/high findings
6. Security audit report generated

✅ **Ideal State:**
- Zero critical vulnerabilities
- Zero high vulnerabilities
- Only medium/low findings with documented mitigations
- Compliance report passed for OWASP Top 10
- Clean security audit to show Apple

---

## Timeline Estimate

| Phase | Time | Notes |
|-------|------|-------|
| Setup | 15 min | Install Strix, configure LLM |
| Initial Scan | 60 min | Comprehensive test of all endpoints |
| Review | 30 min | Analyze findings, prioritize |
| Fix | 2-4 hrs | Implement remediations |
| Re-test | 60 min | Validate fixes |
| Report | 15 min | Generate final documentation |
| **Total** | **4-6 hrs** | Complete security validation |

---

## Advanced Options

### Custom Payload List

```bash
strix --payloads ./custom_payloads.json \
      --target https://greenflag-dusky.vercel.app
```

### Exclude Endpoints

```bash
strix --target https://greenflag-dusky.vercel.app \
      --exclude "/admin,/health,/metrics"
```

### Specific Attack Types Only

```bash
strix --target https://greenflag-dusky.vercel.app \
      --attack-types "auth,injection,business_logic"
```

### Limit Concurrent Tests

```bash
strix --target https://greenflag-dusky.vercel.app \
      --concurrency 2  # Be gentle on rate limiting
```

---

## Troubleshooting

### Docker Not Running
```bash
# Start Docker
docker daemon

# Or use Docker Desktop app
```

### API Rate Limiting
```bash
# Add delay between requests
strix --target https://greenflag-dusky.vercel.app \
      --delay 2000  # 2 second delay between requests
```

### Timeout Issues
```bash
# Increase timeout
strix --target https://greenflag-dusky.vercel.app \
      --timeout 60000  # 60 second timeout
```

### LLM API Issues
```bash
# Verify API key
echo $LLM_API_KEY

# Check LLM configuration
strix --config
```

---

## Resources

- **Strix Docs**: https://docs.strix.ai
- **Strix Website**: https://strix.ai
- **Discord Community**: https://discord.gg/strix-ai
- **OWASP Top 10**: https://owasp.org/www-project-top-ten/

---

## Post-Submission Security

After launching on App Store:

1. **Monitor for Issues**
   - Set up error logging (Sentry, LogRocket)
   - Monitor API for abuse patterns

2. **Regular Re-testing**
   - Schedule monthly Strix scans
   - Scan before major releases
   - Monitor for new CVEs

3. **Bug Bounty Program**
   - Consider opening bug bounty program
   - Set up responsible disclosure policy
   - Reward security researchers

4. **Keep Dependencies Updated**
   - Regular npm/pip updates
   - Monitor security advisories
   - Update Supabase and Vercel as needed

---

**Status**: Security testing framework ready for deployment

**Next Step**: Run Strix against live GreenFlag app
