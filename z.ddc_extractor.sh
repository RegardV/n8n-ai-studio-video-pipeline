discover_root_orchestration() {
    log "INFO" "Discovering root orchestration files..."
    
    # docker-compose.yml (MASTER FILE)
    add_file "docker-compose.yml" "Master orchestration file - defines all services, volumes, networks, and dependencies" "ROOT_ORCHESTRATION"
    
    # .env file
    add_file ".env" "Environment variables for all services - database passwords, API keys, configuration" "ROOT_ORCHESTRATION"
    
    # docker-compose override files
    for override_file in "docker-compose.override.yml" "docker-compose.prod.yml" "docker-compose.dev.yml"; do
        if check_file "$override_file"; then
            add_file "$override_file" "Docker Compose override file for environment-specific configurations" "ROOT_ORCHESTRATION"
        fi
    done
}

discover_nginx_dependencies() {
    log "INFO" "Discovering Nginx service dependencies..."
    
    # Main nginx configuration
    add_file "nginx/nginx.conf" "Main Nginx configuration - reverse proxy, SSL termination, routing for all services" "NGINX_CONFIG"
    
    # SSL certificates
    add_file "ssl/n8n.crt" "SSL certificate for HTTPS - secures all external communication" "SSL_CERTIFICATES"
    add_file "ssl/n8n.key" "SSL private key for HTTPS - critical security component" "SSL_CERTIFICATES"
    
    # Additional nginx configurations
    for config_file in "nginx/conf.d/security-headers.conf" "nginx/conf.d/rate-limiting.conf" "nginx/html/429.html" "nginx/html/403.html" "nginx/html/404.html" "nginx/html/50x.html"; do
        if check_file "$config_file"; then
            add_file "$config_file" "Nginx additional configuration - security and error pages" "NGINX_CONFIG"
        fi
    done
}

discover_secrets_directory() {
    log "INFO" "Discovering secrets directory (Docker secrets for production security)..."
    
    if [[ -d "secrets" ]]; then
        log "INFO" "Found secrets directory - scanning for Docker secrets..."
        for secret_file in secrets/*.txt; do
            if [[ -f "$secret_file" ]]; then
                add_file "$secret_file" "Docker secret file - contains encrypted credentials for services" "DOCKER_SECRETS"
            fi
        done
    else
        log "WARN" "Secrets directory not found - required for Docker secrets configuration"
    fi
}