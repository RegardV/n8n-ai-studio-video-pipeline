---
name: Bug Report
about: Report a bug to help us improve N8N AI Studio
title: '[BUG] '
labels: ['bug', 'triage']
assignees: ''

---

## 🐛 Bug Description
A clear and concise description of what the bug is.

## 🔄 Steps to Reproduce
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## ✅ Expected Behavior
A clear and concise description of what you expected to happen.

## ❌ Actual Behavior
A clear and concise description of what actually happened.

## 🖼️ Screenshots
If applicable, add screenshots to help explain your problem.

## 💻 Environment Information
**System Details:**
- OS: [e.g. Ubuntu 22.04]
- Docker Version: [e.g. 24.0.7]
- Docker Compose Version: [e.g. 2.21.0]
- GPU: [e.g. NVIDIA RTX 3080]
- GPU Driver: [e.g. 545.29.02]
- System RAM: [e.g. 32GB]
- Available Storage: [e.g. 100GB free]

**N8N AI Studio Version:**
- Version: [e.g. 1.0.0]
- Installation Method: [e.g. Docker Compose]
- Server IP: [e.g. 192.168.1.100]

## 🔍 Service Status
**Container Status:**
```bash
# Output of: docker-compose ps
```

**Health Check Results:**
```bash
# Output of: ./setup/verify-installation.sh
```

## 📋 Logs
**Error Logs:**
```bash
# Output of: docker-compose logs [service-name]
```

**System Resources:**
```bash
# Output of: nvidia-smi
# Output of: free -h
# Output of: df -h
```

## 🔧 Configuration
**Environment Variables:**
- Custom .env modifications: [List any changes made to .env file]
- Docker secrets: [Any custom secrets configuration]
- SSL certificates: [Custom or generated]

## 🧪 Testing
**Affected Services:**
- [ ] N8N Workflow Automation
- [ ] ComfyUI Image Generation
- [ ] Kokoro TTS
- [ ] FFCreator Video Processing
- [ ] Nginx Reverse Proxy
- [ ] PostgreSQL Database
- [ ] Redis Cache

**API Endpoints Affected:**
- [ ] `/api/comfyui/` endpoints
- [ ] `/api/tts/` endpoints
- [ ] `/api/video/` endpoints
- [ ] N8N web interface
- [ ] Other: _____________

## 🎯 Impact Assessment
**Severity Level:**
- [ ] Critical - System completely unusable
- [ ] High - Major functionality broken
- [ ] Medium - Some features affected
- [ ] Low - Minor issue or cosmetic problem

**Affected Workflows:**
- [ ] Image generation workflows
- [ ] TTS generation workflows
- [ ] Video creation workflows
- [ ] All workflows affected
- [ ] No workflows affected

## 🔗 Related Issues
- Link to any related issues or discussions
- Reference any similar problems reported

## 🚀 Proposed Solution
If you have ideas on how to fix this bug, please describe them here.

## 📚 Additional Context
Add any other context about the problem here. Include:
- When did this start happening?
- Does it happen consistently or intermittently?
- Any recent changes to the system?
- Workarounds you've tried?

## 📋 Checklist
- [ ] I have searched for existing issues
- [ ] I have provided all requested information
- [ ] I have tested this with the latest version
- [ ] I have included relevant logs and screenshots
- [ ] I have checked the documentation
- [ ] I have verified my environment meets system requirements

---

**Note:** For security-related bugs, please use our [Security Policy](../../SECURITY.md) instead of creating a public issue.
