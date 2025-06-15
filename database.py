#!/usr/bin/env python3
"""
Fixed Database Configuration with absolute path
"""

from flask_sqlalchemy import SQLAlchemy
import os

# Create the database instance
db = SQLAlchemy()

def init_db(app):
    """Initialize the database with the Flask app"""
    
    # Use absolute path to ensure we connect to the right database
    db_path = os.path.abspath('veiculosapreendidos.db')
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    print(f"Database path: {db_path}")
    
    db.init_app(app)
    
    with app.app_context():
        try:
            # Test connection
            with db.engine.connect() as connection:
                result = connection.execute(db.text("SELECT COUNT(*) FROM veiculos"))
                count = result.scalar()
                print(f"Database connected: {count} vehicles found")
            return True
        except Exception as e:
            print(f"Database connection error: {e}")
            return False

if __name__ == "__main__":
    print("Fixed database configuration with absolute path")