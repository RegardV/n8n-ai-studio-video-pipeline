#!/bin/bash
# =============================================================================
# Docker Secrets Generator for N8N AI Studio
# =============================================================================
# Fixed version that generates URL-safe passwords
# Prevents PostgreSQL connection string parsing errors

echo "🔐 Generating Docker secrets for N8N AI Studio..."
echo "🛠️  Using URL-safe character set to prevent connection issues..."

# Create secrets directory
mkdir -p secrets
chmod 700 secrets

# Function to generate URL-safe password
generate_url_safe_password() {
    # Generate password without problematic URL characters: / + =
    # Use alphanumeric + safe symbols only: - _
    openssl rand -base64 32 | tr -d '/+=' | head -c 32
}

# Function to generate secure hex key
generate_hex_key() {
    openssl rand -hex 32
}

echo ""
echo "📝 Generating database passwords (URL-safe)..."

# PostgreSQL main database password
echo -n "$(generate_url_safe_password)" > secrets/postgres_password.txt
echo "✅ PostgreSQL password: $(head -c 10 secrets/postgres_password.txt)..."

# FFCreator database password  
echo -n "$(generate_url_safe_password)" > secrets/ffcreator_db_password.txt
echo "✅ FFCreator DB password: $(head -c 10 secrets/ffcreator_db_password.txt)..."

# Redis password
echo -n "$(generate_url_safe_password)" > secrets/redis_password.txt
echo "✅ Redis password: $(head -c 10 secrets/redis_password.txt)..."

echo ""
echo "🔑 Generating encryption keys..."

# N8N encryption key (can use full base64 since it's not in URL)
openssl rand -base64 32 > secrets/n8n_encryption_key.txt
echo "✅ N8N encryption key generated"

# FFCreator JWT secret (hex format)
echo -n "$(generate_hex_key)" > secrets/ffcreator_jwt_secret.txt
echo "✅ FFCreator JWT secret generated"

echo ""
echo "🔐 Generating API keys..."

# N8N API key (hex format)
echo -n "$(generate_hex_key)" > secrets/n8n_api_key.txt
echo "✅ N8N API key generated"

# Kokoro API key placeholder
echo -n "kokoro-api-key-placeholder" > secrets/kokoro_api_key.txt
echo "✅ Kokoro API key placeholder created"

echo ""
echo "👥 Creating database usernames..."

# Database usernames (no special characters)
echo -n "n8n_user" > secrets/postgres_user.txt
echo -n "ffcreator_user" > secrets/ffcreator_db_user.txt

echo ""
echo "🔗 Generating database connection URLs..."

# Read the generated passwords
POSTGRES_PASSWORD=$(cat secrets/postgres_password.txt)
FFCREATOR_PASSWORD=$(cat secrets/ffcreator_db_password.txt)

# Generate database URLs (now URL-safe)
echo -n "postgresql://n8n_user:${POSTGRES_PASSWORD}@postgres:5432/n8n" > secrets/postgres_url.txt
echo -n "postgresql://ffcreator_user:${FFCREATOR_PASSWORD}@ffcreator-db:5432/ffcreator" > secrets/ffcreator_database_url.txt

echo "✅ Main database URL generated"
echo "✅ FFCreator database URL generated" 

echo ""
echo "🔒 Setting secure file permissions..."

# Set secure permissions
chmod 600 secrets/*.txt
chown -R $(whoami):$(whoami) secrets/

echo ""
echo "📋 Generated secrets summary:"
echo "=================================="
echo "🗄️  Database Secrets:"
echo "   - postgres_user.txt"
echo "   - postgres_password.txt" 
echo "   - postgres_url.txt"
echo "   - ffcreator_db_user.txt"
echo "   - ffcreator_db_password.txt"
echo "   - ffcreator_database_url.txt"
echo ""
echo "🔐 Application Secrets:"
echo "   - n8n_encryption_key.txt"
echo "   - n8n_api_key.txt"
echo "   - ffcreator_jwt_secret.txt"
echo "   - kokoro_api_key.txt"
echo "   - redis_password.txt"

echo ""
echo "✅ All secrets generated successfully in ./secrets/"
echo ""
echo "🔐 SECURITY NOTES:"
echo "==================="
echo "✅ All passwords are URL-safe (no /, +, = characters)"
echo "✅ File permissions set to 600 (owner read/write only)"
echo "✅ Directory permissions set to 700 (owner access only)"
echo ""
echo "⚠️  IMPORTANT:"
echo "   - Keep these files secure and never commit to git"
echo "   - Add secrets/ to your .gitignore file"
echo "   - Back up these files securely"
echo "   - Rotate passwords regularly in production"
echo ""
echo "🚀 Ready to deploy with: docker-compose up -d"

# Verify the generated database URL doesn't have problematic characters
echo ""
echo "🧪 Verifying URL safety..."
FFCREATOR_URL=$(cat secrets/ffcreator_database_url.txt)
if [[ "$FFCREATOR_URL" =~ [/+=] ]]; then
    echo "❌ WARNING: Generated URL contains problematic characters!"
    echo "   URL: $FFCREATOR_URL"
else
    echo "✅ Database URL is safe for PostgreSQL connections"
    echo "   Preview: postgresql://ffcreator_user:****@ffcreator-db:5432/ffcreator"
fi