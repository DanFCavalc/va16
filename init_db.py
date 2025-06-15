#!/usr/bin/env python3
"""
Database Initialization Script
Creates tables and optionally adds sample data
"""

import os
import sys
from pathlib import Path

# Add the current directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

from app import app
from database import db
from models import Veiculo, Ocorrencia, HistoricoMovimentacao, create_sample_data

def init_database(add_sample_data=True):
    """Initialize the database with tables and optionally sample data"""
    
    print("🔧 Initializing database...")
    
    with app.app_context():
        try:
            # Create all tables
            print("📊 Creating database tables...")
            db.create_all()
            print("✅ Tables created successfully!")
            
            # Check if we already have data
            vehicle_count = Veiculo.query.count()
            
            if vehicle_count == 0 and add_sample_data:
                print("📝 Adding sample data...")
                create_sample_data()
                
                # Verify data was added
                new_count = Veiculo.query.count()
                print(f"✅ Added {new_count} sample vehicles to database!")
            else:
                print(f"ℹ️  Database already contains {vehicle_count} vehicles")
            
            print("🎉 Database initialization complete!")
            
        except Exception as e:
            print(f"❌ Error initializing database: {e}")
            sys.exit(1)

def reset_database():
    """Reset the database by dropping and recreating all tables"""
    
    print("⚠️  Resetting database (this will delete all data)...")
    
    with app.app_context():
        try:
            # Drop all tables
            print("🗑️  Dropping existing tables...")
            db.drop_all()
            
            # Create all tables
            print("📊 Creating new tables...")
            db.create_all()
            
            # Add sample data
            print("📝 Adding sample data...")
            create_sample_data()
            
            # Verify
            vehicle_count = Veiculo.query.count()
            print(f"✅ Database reset complete! Added {vehicle_count} sample vehicles.")
            
        except Exception as e:
            print(f"❌ Error resetting database: {e}")
            sys.exit(1)

def check_database():
    """Check database status and content"""
    
    print("🔍 Checking database status...")
    
    db_path = "veiculosapreendidos.db"
    
    if not Path(db_path).exists():
        print(f"❌ Database file not found: {db_path}")
        return False
    
    with app.app_context():
        try:
            # Check tables exist
            tables = db.engine.table_names()
            print(f"📊 Found {len(tables)} tables: {', '.join(tables)}")
            
            # Check data
            vehicle_count = Veiculo.query.count()
            ocorrencia_count = Ocorrencia.query.count()
            historico_count = HistoricoMovimentacao.query.count()
            
            print(f"📈 Data summary:")
            print(f"  - Vehicles: {vehicle_count}")
            print(f"  - Occurrences: {ocorrencia_count}")
            print(f"  - Movement history: {historico_count}")
            
            if vehicle_count > 0:
                # Show sample vehicle
                sample_vehicle = Veiculo.query.first()
                print(f"\n📄 Sample vehicle:")
                print(f"  SPJ: {sample_vehicle.spj}")
                print(f"  Model: {sample_vehicle.modelo}")
                print(f"  Plate: {sample_vehicle.placa_original}")
                print(f"  Status: {sample_vehicle.status}")
            
            return True
            
        except Exception as e:
            print(f"❌ Error checking database: {e}")
            return False

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Database Management for Vehicle System")
    parser.add_argument("--reset", action="store_true", help="Reset database (delete all data)")
    parser.add_argument("--check", action="store_true", help="Check database status")
    parser.add_argument("--no-sample", action="store_true", help="Don't add sample data")
    
    args = parser.parse_args()
    
    if args.check:
        check_database()
    elif args.reset:
        confirmation = input("⚠️  This will delete ALL data. Type 'yes' to continue: ")
        if confirmation.lower() == 'yes':
            reset_database()
        else:
            print("❌ Reset cancelled.")
    else:
        init_database(add_sample_data=not args.no_sample)