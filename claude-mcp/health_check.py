#!/usr/bin/env python3
"""Health check script for MCP server"""

import sys
import httpx
import asyncio

async def check_health():
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get("http://localhost:3000/health")
            if response.status_code == 200:
                print("✅ MCP Server is healthy")
                return True
            else:
                print(f"❌ Health check failed: {response.status_code}")
                return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

if __name__ == "__main__":
    result = asyncio.run(check_health())
    sys.exit(0 if result else 1)
