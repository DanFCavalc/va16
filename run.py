#!/usr/bin/env python3
"""
Run script for Vehicle Management System
Starts the Flask development server
"""

import sys
from pathlib import Path

# Add current directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

from app import app
from database import db

def check_database():
    """Check if database exists and has data"""
    db_path = Path("veiculosapreendidos.db")
    
    if not db_path.exists():
        print("⚠️  Database not found!")
        print("💡 Run setup first: python setup.py")
        print("   Or initialize database: python init_db.py")
        return False
    
    return True

def run_app():
    """Run the Flask application"""
    print("🚓 Starting Vehicle Management System...")
    print("📍 Server will be available at: http://localhost:5000")
    print("🔍 Press Ctrl+C to stop the server")
    print("-" * 50)
    
    try:
        # Create tables if they don't exist
        with app.app_context():
            db.create_all()
        
        # Run the application
        app.run(
            debug=True,
            host='0.0.0.0',
            port=5000,
            use_reloader=True
        )
        
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
    except Exception as e:
        print(f"\n❌ Error starting server: {e}")
        print("💡 Make sure the database is properly initialized")

if __name__ == "__main__":
    if check_database():
        run_app()
    else:
        sys.exit(1)