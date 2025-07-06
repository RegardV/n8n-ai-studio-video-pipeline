# Production Password Rotation Guide
## Rotating Secrets on Running N8N AI Studio System

**⚠️ WARNING: This procedure involves downtime and data migration risks**

---

## 📋 **Current Situation Assessment**

When your N8N AI Studio has been running for weeks and you need to rotate passwords, you're dealing with:

- ✅ **Existing databases** with stored user credentials
- ✅ **Persistent data** that must be preserved
- ✅ **Running workflows** that might be interrupted
- ❌ **Password changes** that require database recreation
- ❌ **Service dependencies** that can cause cascading failures

---

## 🔍 **Pre-Rotation System Analysis**

### **Step 1: Document Current State**

```bash
# Backup current system state
mkdir -p backups/$(date +%Y%m%d_%H%M%S)
cd backups/$(date +%Y%m%d_%H%M%S)

# Document running containers
docker-compose ps > container_status.txt

# Backup current secrets
cp -r ../../secrets/ ./secrets_backup/

# Document current volumes
docker volume ls > volumes.txt
du -sh ../../persistent-data/ > data_sizes.txt

# Export current workflows (if N8N is accessible)
curl -s http://localhost:5678/rest/workflows > n8n_workflows_backup.json 2>/dev/null || echo "N8N not accessible"
```

### **Step 2: Identify Services Still Using Old Passwords**

```bash
# Check which containers are having issues
docker-compose ps | grep -E "(restarting|unhealthy|exited)"

# Check specific logs for authentication failures  
docker-compose logs ffcreator --tail=20 2>/dev/null | grep -i "password\|auth"
docker-compose logs n8n --tail=20 2>/dev/null | grep -i "password\|auth"
```

---

## 🔄 **Safe Password Rotation Procedure**

### **Phase 1: Generate New Secrets (Non-Destructive)**

```bash
# Return to main directory
cd ~/n8n-ai-studio

# Backup current secrets
cp -r secrets/ secrets_backup_$(date +%Y%m%d_%H%M%S)/

# Generate new URL-safe secrets
./generate_secrets.sh

# Verify new secrets are different and URL-safe
echo "Old FFCreator password:"
cat secrets_backup_*/ffcreator_db_password.txt
echo -e "\nNew FFCreator password:"  
cat secrets/ffcreator_db_password.txt

# Verify no problematic characters
if grep -q '[/+=]' secrets/ffcreator_database_url.txt; then
    echo "❌ New password still has URL-unsafe characters!"
    exit 1
else
    echo "✅ New passwords are URL-safe"
fi
```

### **Phase 2: Service-by-Service Migration**

#### **2A: Stop Problem Services First**
```bash
# Stop services that are failing (restart loops)
docker-compose stop ffcreator nginx

# Keep working services running
docker-compose ps | grep "Up"
```

#### **2B: Migrate FFCreator Database (High Risk)**
```bash
# CRITICAL: This destroys FFCreator database data
echo "⚠️  WARNING: This will delete all FFCreator job history"
read -p "Continue? (type 'yes'): " confirm

if [ "$confirm" = "yes" ]; then
    # Stop FFCreator database
    docker-compose stop ffcreator-db
    
    # Remove container and data (DESTRUCTIVE!)
    docker-compose rm -f ffcreator-db
    sudo rm -rf ./persistent-data/ffcreator-db/pgdata
    
    # Start fresh with new password
    docker-compose up -d ffcreator-db
    
    # Wait for initialization
    sleep 30
    
    # Verify new database works
    docker exec ffcreator-postgres psql -U $(cat secrets/ffcreator_db_user.txt) -d ffcreator -c "SELECT version();"
    
    if [ $? -eq 0 ]; then
        echo "✅ FFCreator database recreated successfully"
    else
        echo "❌ FFCreator database recreation failed"
        exit 1
    fi
fi
```

#### **2C: Test FFCreator with New Database**
```bash
# Start FFCreator with new database
docker-compose up -d ffcreator

# Monitor startup logs
timeout 60s docker-compose logs -f ffcreator &
sleep 60

# Check if FFCreator is running
if docker-compose ps ffcreator | grep -q "Up"; then
    echo "✅ FFCreator started successfully with new password"
else
    echo "❌ FFCreator still failing - investigate logs"
    docker-compose logs ffcreator --tail=30
fi
```

### **Phase 3: Handle N8N Database (If Needed)**

#### **3A: N8N Data Preservation Strategy**
```bash
# If N8N needs password rotation (more complex)
echo "🔍 Checking if N8N needs password rotation..."

# Test current N8N database connection
docker exec n8n-postgres psql -U $(cat secrets_backup_*/postgres_user.txt) -d n8n -c "SELECT COUNT(*) FROM information_schema.tables;" 2>/dev/null

if [ $? -ne 0 ]; then
    echo "⚠️  N8N database also needs migration"
    
    # Export workflows before migration
    mkdir -p migration_backup
    
    # If N8N is accessible, export data
    if curl -s http://localhost:5678/healthz > /dev/null; then
        curl -s http://localhost:5678/rest/workflows > migration_backup/workflows.json
        curl -s http://localhost:5678/rest/credentials > migration_backup/credentials.json
        echo "✅ N8N data exported"
    else
        echo "⚠️  N8N not accessible - will need manual workflow recreation"
    fi
    
    # Database migration would go here (similar to FFCreator)
    # This is more complex and risky for production systems
fi
```

### **Phase 4: Final System Restart**

```bash
# Start all services with new passwords
docker-compose up -d

# Wait for all services to stabilize
sleep 60

# Final health check
echo "🏥 Final System Health Check:"
echo "================================"
docker-compose ps

echo -e "\n🔍 Service Health Details:"
echo "N8N: $(curl -s http://localhost:5678/healthz > /dev/null && echo "✅ Healthy" || echo "❌ Failed")"
echo "ComfyUI: $(curl -s http://localhost:8188/queue > /dev/null && echo "✅ Healthy" || echo "❌ Failed")"  
echo "FFCreator: $(curl -s http://localhost:3001/health > /dev/null && echo "✅ Healthy" || echo "❌ Failed")"
echo "Kokoro: $(curl -s http://localhost:8880/v1/audio/voices > /dev/null && echo "✅ Healthy" || echo "❌ Failed")"
```

---

## 🚨 **High-Risk Scenarios & Rollback**

### **If Migration Fails**

```bash
# Emergency rollback procedure
echo "🚨 EMERGENCY ROLLBACK"

# Stop all services
docker-compose down

# Restore old secrets
rm -rf secrets/
mv secrets_backup_*/ secrets/

# If you destroyed database data, you'll need to restore from backup
# (This is why we recommend full system backup before password rotation)

# Restart with old configuration
docker-compose up -d

echo "⚠️  System rolled back to previous state"
```

### **Data Loss Prevention**

```bash
# Before ANY password rotation, create full backup
echo "📦 Creating full system backup..."

# Stop all services for consistent backup
docker-compose down

# Backup all persistent data
tar -czf full_backup_$(date +%Y%m%d_%H%M%S).tar.gz \
    persistent-data/ \
    secrets/ \
    postgres-data/ \
    redis-data/ \
    n8n-data/ \
    .env \
    docker-compose.yml

echo "✅ Full backup created"

# Restart system
docker-compose up -d
```

---

## 🎯 **Why Password Rotation is Complex in Production**

### **Database Persistence Reality**
- **PostgreSQL** stores user credentials **permanently** in data files
- **Changing secret files** doesn't change **existing database users**
- **Database recreation** is the **only way** to change passwords
- **Recreation destroys all data** (workflows, job history, etc.)

### **Service Dependencies**
- **FFCreator** depends on its database for job tracking
- **N8N** depends on PostgreSQL for all workflow data
- **Cascading failures** occur when one service's password changes

### **Production Constraints**
- **Zero-downtime** password rotation is **nearly impossible**
- **Data preservation** requires **complex migration procedures**
- **Risk of total system failure** if migration goes wrong

---

## 💡 **Recommendations for Production**

### **1. Avoid Password Rotation Unless Critical**
- If system is working, **don't rotate passwords** unless security incident
- **URL-safe passwords** prevent most authentication issues
- **Regular backups** are more important than password rotation

### **2. Plan for System Rebuilds**
- Design workflows to be **easily exportable/importable**
- Keep **workflow templates** in version control
- Separate **data** from **configuration**

### **3. Implement Proper Backup Strategy**
```bash
# Weekly automated backup
#!/bin/bash
docker-compose down
tar -czf backup_$(date +%Y%m%d).tar.gz persistent-data/ secrets/ *.yml
docker-compose up -d
```

### **4. Consider Blue-Green Deployment**
- Build **new system** with new passwords
- **Migrate data** offline
- **Switch traffic** when ready
- **Much safer** than in-place password rotation

---

## 🔄 **Current Issue Resolution**

For your **immediate FFCreator restart loop**:

```bash
# Quick diagnosis
docker-compose logs ffcreator --tail=10

# If it's still the password issue:
./generate_secrets.sh
docker-compose stop ffcreator ffcreator-db
docker-compose rm -f ffcreator-db
sudo rm -rf ./persistent-data/ffcreator-db/pgdata
docker-compose up -d ffcreator-db
sleep 30
docker-compose up -d ffcreator
```

**The fundamental issue**: Production password rotation in Docker requires **database recreation**, which **destroys data**. This is why it's complex and risky.