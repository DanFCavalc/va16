#!/usr/bin/env python3
"""
Step-by-Step Debugging Script
Let's find exactly what's failing
"""

import sys
import traceback
from pathlib import Path

def check_files():
    """Check if all required files exist"""
    print("🔍 Step 1: Checking Files")
    print("=" * 40)
    
    required_files = [
        'veiculosapreendidos.db',
        'database.py',
        'models.py', 
        'app.py',
        'run.py',
        'templates/dashboard.html'
    ]
    
    all_good = True
    for file in required_files:
        if Path(file).exists():
            size = Path(file).stat().st_size
            print(f"✅ {file} ({size} bytes)")
        else:
            print(f"❌ {file} - MISSING!")
            all_good = False
    
    return all_good

def check_imports():
    """Check if imports work"""
    print(f"\n🔍 Step 2: Testing Imports")
    print("=" * 40)
    
    # Test basic imports
    try:
        import flask
        print(f"✅ Flask {flask.__version__}")
    except Exception as e:
        print(f"❌ Flask import failed: {e}")
        return False
    
    try:
        import flask_sqlalchemy
        print(f"✅ Flask-SQLAlchemy {flask_sqlalchemy.__version__}")
    except Exception as e:
        print(f"❌ Flask-SQLAlchemy import failed: {e}")
        return False
    
    try:
        import sqlalchemy
        print(f"✅ SQLAlchemy {sqlalchemy.__version__}")
        
        # Check if it's the problematic version
        version = sqlalchemy.__version__
        major_version = int(version.split('.')[0])
        if major_version >= 2:
            print(f"ℹ️  SQLAlchemy 2.0+ detected - using new syntax")
        else:
            print(f"ℹ️  SQLAlchemy 1.x detected - using old syntax")
            
    except Exception as e:
        print(f"❌ SQLAlchemy import failed: {e}")
        return False
    
    return True

def test_database_import():
    """Test database.py import"""
    print(f"\n🔍 Step 3: Testing database.py")
    print("=" * 40)
    
    try:
        from database import db
        print(f"✅ database.py imported successfully")
        return True
    except Exception as e:
        print(f"❌ database.py import failed:")
        print(f"   Error: {e}")
        traceback.print_exc()
        return False

def test_models_import():
    """Test models.py import"""
    print(f"\n🔍 Step 4: Testing models.py")
    print("=" * 40)
    
    try:
        from models import Veiculo
        print(f"✅ models.py imported successfully")
        print(f"✅ Veiculo model imported")
        return True
    except Exception as e:
        print(f"❌ models.py import failed:")
        print(f"   Error: {e}")
        traceback.print_exc()
        return False

def test_app_import():
    """Test app.py import"""
    print(f"\n🔍 Step 5: Testing app.py")
    print("=" * 40)
    
    try:
        from app import app
        print(f"✅ app.py imported successfully")
        return True
    except Exception as e:
        print(f"❌ app.py import failed:")
        print(f"   Error: {e}")
        traceback.print_exc()
        return False

def test_database_connection():
    """Test actual database connection"""
    print(f"\n🔍 Step 6: Testing Database Connection")
    print("=" * 40)
    
    try:
        from app import app
        from models import Veiculo
        from database import db
        
        with app.app_context():
            # Try a simple count
            count = Veiculo.query.count()
            print(f"✅ Database connection works!")
            print(f"✅ Found {count} vehicles")
            
            # Try to get a sample
            sample = Veiculo.query.first()
            if sample:
                print(f"✅ Sample vehicle: SPJ={sample.spj}, Status={sample.status}")
            
            return True
            
    except Exception as e:
        print(f"❌ Database connection failed:")
        print(f"   Error: {e}")
        traceback.print_exc()
        return False

def test_app_startup():
    """Test if app can start"""
    print(f"\n🔍 Step 7: Testing App Startup")
    print("=" * 40)
    
    try:
        from app import app
        
        # Test if we can create a test client
        with app.test_client() as client:
            print(f"✅ Flask app can start")
            
            # Test a simple route
            response = client.get('/')
            print(f"✅ Homepage route: {response.status_code}")
            
            return True
            
    except Exception as e:
        print(f"❌ App startup failed:")
        print(f"   Error: {e}")
        traceback.print_exc()
        return False

def run_simple_test():
    """Run the simplest possible test"""
    print(f"\n🔍 Step 8: Simple Direct Test")
    print("=" * 40)
    
    try:
        import sqlite3
        conn = sqlite3.connect('veiculosapreendidos.db')
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM veiculos")
        count = cursor.fetchone()[0]
        print(f"✅ Direct SQLite: {count} vehicles")
        
        cursor.execute("SELECT spj, status FROM veiculos LIMIT 1")
        sample = cursor.fetchone()
        print(f"✅ Sample: SPJ={sample[0]}, Status={sample[1]}")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"❌ Direct SQLite failed: {e}")
        return False

def main():
    """Run all diagnostic steps"""
    print("🐛 Step-by-Step Debugging")
    print("=" * 60)
    print("Let's find exactly what's broken...\n")
    
    steps = [
        ("Files", check_files),
        ("Imports", check_imports), 
        ("Database Import", test_database_import),
        ("Models Import", test_models_import),
        ("App Import", test_app_import),
        ("Database Connection", test_database_connection),
        ("App Startup", test_app_startup),
        ("Direct Test", run_simple_test)
    ]
    
    for step_name, step_func in steps:
        try:
            if not step_func():
                print(f"\n❌ FAILED AT: {step_name}")
                print(f"\n💡 SOLUTION NEEDED FOR: {step_name}")
                break
        except Exception as e:
            print(f"\n💥 CRASHED AT: {step_name}")
            print(f"   Error: {e}")
            traceback.print_exc()
            break
    else:
        print(f"\n🎉 ALL STEPS PASSED!")
        print(f"   The app should work. Try: python run.py")
    
    print(f"\n📋 NEXT: Tell me which step failed and I'll fix it!")

if __name__ == "__main__":
    main()