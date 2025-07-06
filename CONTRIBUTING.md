# Contributing to N8N AI Studio

We welcome contributions to the N8N AI Studio project! This document provides guidelines for contributing to our production-ready AI automation platform.

## 🚀 Getting Started

### Prerequisites
- Ubuntu 22.04+ or compatible Linux distribution
- NVIDIA RTX 3080+ GPU with 10GB+ VRAM
- Docker with Compose V2 and NVIDIA runtime
- Git for version control
- Basic knowledge of Docker, Node.js, and AI/ML concepts

### Development Setup

1. **Fork the repository**
   ```bash
   git fork https://github.com/RegardV/n8n-ai-studio.git
   cd n8n-ai-studio
   ```

2. **Create development environment**
   ```bash
   # Copy environment template
   cp .env.example .env.dev
   
   # Set up development-specific configuration
   nano .env.dev
   ```

3. **Install dependencies**
   ```bash
   # Create persistent data structure
   ./setup/create-structure.sh
   
   # Generate development certificates
   cd ssl && ./generate-certificates.sh && cd ..
   
   # Set up Docker secrets for development
   ./setup/dev-secrets.sh
   ```

4. **Start development services**
   ```bash
   # Start core services
   docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
   
   # Verify all services are healthy
   docker-compose ps
   ```

## 📋 Development Workflow

### Branch Strategy
- **main**: Production-ready code only
- **develop**: Integration branch for new features
- **feature/feature-name**: Individual feature development
- **hotfix/issue-name**: Emergency fixes for production issues
- **release/v1.0.0**: Release preparation branches

### Making Changes

1. **Create a feature branch**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the coding standards outlined below
   - Add tests for new functionality
   - Update documentation as needed
   - Ensure all services remain healthy

3. **Test your changes**
   ```bash
   # Run the verification script
   ./setup/verify-installation.sh
   
   # Test specific services
   curl -k https://[YourServerIp]/api/video/health
   curl -k https://[YourServerIp]/api/tts/v1/audio/voices
   curl -k https://[YourServerIp]/api/comfyui/queue
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request**
   - Use the PR template provided
   - Include detailed description of changes
   - Reference any related issues
   - Ensure CI/CD checks pass

## 🏗️ Project Structure

Understanding the project structure helps with contributing:

```
n8n-ai-studio/
├── .github/                    # GitHub templates and workflows
├── docker-compose.yml          # Production orchestration
├── nginx/                      # Reverse proxy configuration
├── ssl/                        # SSL certificate management
├── secrets/                    # Docker secrets (not in git)
├── persistent-data/            # AI models and generated content
├── setup/                      # Installation and setup scripts
├── docs/                       # Project documentation
└── scripts/                    # Utility scripts
```

## 💻 Coding Standards

### Docker Configuration
- Use multi-stage builds for optimization
- Implement proper health checks for all services
- Use Docker secrets for sensitive data
- Follow security best practices (non-root users, minimal permissions)

### Documentation
- Update README.md for user-facing changes
- Add inline comments for complex logic
- Include API documentation for new endpoints
- Update troubleshooting guides for known issues

### API Development
- Follow RESTful conventions
- Implement proper error handling
- Add request/response validation
- Include comprehensive logging

### Security
- Never commit secrets or sensitive data
- Use environment variables for configuration
- Implement proper input validation
- Follow OWASP security guidelines

## 🧪 Testing Guidelines

### Service Testing
Before submitting a PR, ensure all services are working:

1. **Health Checks**
   ```bash
   docker-compose ps
   # All services should show "healthy" status
   ```

2. **API Endpoints**
   ```bash
   # Test each service endpoint
   ./scripts/test-endpoints.sh
   ```

3. **Integration Testing**
   ```bash
   # Run comprehensive verification
   ./setup/verify-installation.sh
   ```

### AI Model Testing
- Test image generation with various prompts
- Verify TTS functionality with different voices
- Ensure video processing works with AI-generated assets
- Check GPU memory usage and performance

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Environment Information**
   - OS version and distribution
   - Docker version and compose version
   - GPU model and driver version
   - System RAM and available storage

2. **Steps to Reproduce**
   - Clear, numbered steps
   - Expected vs actual behavior
   - Any error messages or logs

3. **Additional Context**
   - Screenshots if applicable
   - Docker logs: `docker-compose logs [service-name]`
   - System resources: `nvidia-smi`, `free -h`, `df -h`

## 💡 Feature Requests

For new features:

1. **Check existing issues** to avoid duplicates
2. **Provide clear use case** and justification
3. **Consider implementation complexity** and maintenance burden
4. **Discuss architecture impact** on existing services

## 🔄 Pull Request Process

1. **Use the PR template** and fill out all sections
2. **Ensure CI/CD checks pass** before requesting review
3. **Request review** from at least two maintainers
4. **Address feedback** promptly and thoroughly
5. **Squash commits** before merging (if requested)

### PR Requirements
- [ ] Code follows project standards
- [ ] Documentation is updated
- [ ] Tests pass
- [ ] No breaking changes (or clearly documented)
- [ ] Security considerations addressed

## 📄 Documentation Contributions

Documentation improvements are highly valued:

- Fix typos and grammar errors
- Improve clarity and completeness
- Add examples and use cases
- Update outdated information
- Translate documentation (if multilingual support is added)

## 🤝 Community Guidelines

### Code of Conduct
- Be respectful and inclusive
- Provide constructive feedback
- Help newcomers learn the project
- Focus on what's best for the community

### Communication
- Use GitHub issues for bugs and features
- Join project discussions respectfully
- Provide helpful and detailed responses
- Be patient with response times

## 🚀 Development Environment Tips

### GPU Development
- Monitor GPU memory usage: `nvidia-smi`
- Clear GPU memory between tests if needed
- Use development models for faster testing
- Consider using smaller batch sizes for development

### Docker Development
- Use `docker-compose logs -f [service]` for real-time logs
- Rebuild containers after significant changes
- Use `docker system prune` to clean up development artifacts
- Monitor container resource usage

### Performance Testing
- Test with realistic workloads
- Monitor system resources during testing
- Profile API response times
- Check memory leaks in long-running processes

## 📞 Getting Help

If you need help with contributing:

1. **Check the documentation** first
2. **Search existing issues** for similar problems
3. **Ask in GitHub discussions** for general questions
4. **Create an issue** for specific bugs or features
5. **Reference the Alpha Production Guide** for technical details

## 🎯 Areas for Contribution

We especially welcome contributions in:

- **Performance optimizations** for GPU usage
- **New AI model integrations** (Stable Diffusion variants, other TTS models)
- **Workflow templates** for common use cases
- **Security improvements** and best practices
- **Documentation** and tutorials
- **Testing frameworks** and automated testing
- **CI/CD pipeline** improvements
- **Monitoring and logging** enhancements

## 📋 Contributor License Agreement

By contributing to this project, you agree that your contributions will be licensed under the ISC License that covers the project.

---

Thank you for contributing to N8N AI Studio! 🚀

Your contributions help build a better AI automation platform for everyone.
