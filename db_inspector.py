#!/usr/bin/env python3
"""
Database Structure Inspector for veiculosapreendidos.db
This script will examine the database structure and help us map the tables.
"""

import sqlite3
import pandas as pd
from pathlib import Path

def inspect_database(db_path):
    """Inspect the database structure and content"""
    
    if not Path(db_path).exists():
        print(f"❌ Database file not found: {db_path}")
        return
    
    print(f"🔍 Inspecting database: {db_path}")
    print("=" * 60)
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Get all table names
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        
        print(f"📊 Found {len(tables)} tables:")
        for table in tables:
            print(f"  - {table[0]}")
        
        print("\n" + "=" * 60)
        
        # Examine each table structure and sample data
        for table_name in [t[0] for t in tables]:
            print(f"\n🗂️  TABLE: {table_name}")
            print("-" * 40)
            
            # Get table schema
            cursor.execute(f"PRAGMA table_info({table_name});")
            columns = cursor.fetchall()
            
            print("📋 Columns:")
            for col in columns:
                cid, name, col_type, notnull, default, pk = col
                pk_str = " (PRIMARY KEY)" if pk else ""
                null_str = " NOT NULL" if notnull else ""
                default_str = f" DEFAULT {default}" if default else ""
                print(f"  {name}: {col_type}{pk_str}{null_str}{default_str}")
            
            # Get row count
            cursor.execute(f"SELECT COUNT(*) FROM {table_name};")
            row_count = cursor.fetchone()[0]
            print(f"\n📈 Total rows: {row_count}")
            
            # Show sample data if table has rows
            if row_count > 0:
                print(f"\n📄 Sample data (first 3 rows):")
                df = pd.read_sql_query(f"SELECT * FROM {table_name} LIMIT 3", conn)
                print(df.to_string(index=False))
                
                # Show column statistics for better understanding
                print(f"\n📊 Column Statistics:")
                for col in df.columns:
                    non_null_count = df[col].notna().sum()
                    unique_count = df[col].nunique()
                    print(f"  {col}: {non_null_count}/{len(df)} non-null, {unique_count} unique values")
            
            print("\n" + "-" * 40)
        
        conn.close()
        
    except Exception as e:
        print(f"❌ Error inspecting database: {e}")

def generate_sqlalchemy_models(db_path):
    """Generate SQLAlchemy model suggestions based on database structure"""
    
    if not Path(db_path).exists():
        return
    
    print(f"\n🏗️  Generating SQLAlchemy Model Suggestions")
    print("=" * 60)
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Get all table names
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        
        for table_name in [t[0] for t in tables]:
            print(f"\nclass {table_name.title().replace('_', '')}(db.Model):")
            print(f"    __tablename__ = '{table_name}'")
            
            # Get table schema
            cursor.execute(f"PRAGMA table_info({table_name});")
            columns = cursor.fetchall()
            
            for col in columns:
                cid, name, col_type, notnull, default, pk = col
                
                # Map SQLite types to SQLAlchemy types
                if col_type.upper().startswith('INT'):
                    sa_type = 'db.Integer'
                elif col_type.upper().startswith('TEXT') or col_type.upper().startswith('VARCHAR'):
                    sa_type = 'db.String'
                elif col_type.upper().startswith('REAL') or col_type.upper().startswith('FLOAT'):
                    sa_type = 'db.Float'
                elif col_type.upper().startswith('DATE'):
                    sa_type = 'db.Date'
                elif col_type.upper().startswith('DATETIME'):
                    sa_type = 'db.DateTime'
                elif col_type.upper().startswith('BOOL'):
                    sa_type = 'db.Boolean'
                else:
                    sa_type = 'db.String'  # Default fallback
                
                # Build column definition
                options = []
                if pk:
                    options.append('primary_key=True')
                if notnull and not pk:
                    options.append('nullable=False')
                if default:
                    options.append(f'default={repr(default)}')
                
                options_str = ', ' + ', '.join(options) if options else ''
                print(f"    {name} = db.Column({sa_type}{options_str})")
            
            print(f"\n    def __repr__(self):")
            primary_key_col = next((col[1] for col in columns if col[5]), 'id')
            print(f"        return f'<{table_name.title()} {{self.{primary_key_col}}}>'")
        
        conn.close()
        
    except Exception as e:
        print(f"❌ Error generating models: {e}")

if __name__ == "__main__":
    # Database path
    db_path = "veiculosapreendidos.db"
    
    # Inspect database structure
    inspect_database(db_path)
    
    # Generate SQLAlchemy model suggestions
    generate_sqlalchemy_models(db_path)
    
    print(f"\n✅ Database inspection complete!")
    print(f"💡 Next steps:")
    print(f"  1. Review the database structure above")
    print(f"  2. Use the SQLAlchemy model suggestions to create models.py")
    print(f"  3. Create the Flask application with appropriate routes")
    print(f"  4. Update the frontend to work with real data")