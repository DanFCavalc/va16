#!/usr/bin/env python3
"""
Fixed Flask Application for SQLAlchemy 2.0+ compatibility
Updated with proper "Outros" filter logic and date filtering
"""

from flask import Flask, render_template, jsonify, request
from datetime import datetime, timedelta
import os
import re

# Import database instance
from database import db, init_db

def parse_date_field(date_value):
    """
    Parse various date formats from database to comparable datetime
    Returns None if unparseable
    """
    if not date_value:
        return None
        
    date_str = str(date_value).strip()
    
    # Year only (e.g., "2023")
    if re.match(r'^\d{4}$', date_str):
        try:
            return datetime(int(date_str), 1, 1)
        except:
            return None
    
    # Numeric timestamp
    if re.match(r'^\d+(?:\.\d+)?$', date_str):
        try:
            num = int(float(date_str))
            # Determine if it's seconds or milliseconds based on length
            if len(str(num)) <= 10:
                return datetime.fromtimestamp(num)
            else:
                return datetime.fromtimestamp(num / 1000)
        except:
            return None
    
    # Try to parse as standard date formats
    date_formats = [
        '%Y-%m-%d',           # 2023-12-25
        '%d/%m/%Y',           # 25/12/2023
        '%d-%m-%Y',           # 25-12-2023
        '%Y/%m/%d',           # 2023/12/25
        '%Y-%m-%d %H:%M:%S',  # 2023-12-25 10:30:00
        '%d/%m/%Y %H:%M:%S',  # 25/12/2023 10:30:00
    ]
    
    for fmt in date_formats:
        try:
            return datetime.strptime(date_str, fmt)
        except:
            continue
    
    # If all else fails, try generic parsing
    try:
        return datetime.fromisoformat(date_str.replace('/', '-'))
    except:
        return None

def create_app():
    """Application factory pattern"""
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = 'your-secret-key-here'
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///veiculosapreendidos.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Initialize database
    init_db(app)
    
    return app

# Create app instance
app = create_app()

# Import models after app is created
from models import Veiculo

@app.route('/')
def index():
    """Main dashboard page"""
    return render_template('dashboard.html')

@app.route('/api/vehicles')
def get_vehicles():
    """API endpoint to get vehicles with filtering and pagination"""
    
    # Get query parameters
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 5, type=int)
    search = request.args.get('search', '', type=str)
    status = request.args.get('status', '', type=str)
    patio = request.args.get('patio', '', type=str)
    circunscricao = request.args.get('circunscricao', '', type=str)
    tipos = request.args.getlist('tipo')
    date_from = request.args.get('date_from', '', type=str)
    date_to = request.args.get('date_to', '', type=str)
    sort_by = request.args.get('sort_by', 'id', type=str)
    sort_order = request.args.get('sort_order', 'desc', type=str)
    
    try:
        # Build query
        query = Veiculo.query
        
        # Apply search filter
        if search:
            search_filter = f"%{search}%"
            query = query.filter(
                db.or_(
                    Veiculo.placa_original.ilike(search_filter),
                    Veiculo.placa_ostentada.ilike(search_filter),
                    Veiculo.modelo.ilike(search_filter),
                    Veiculo.spj.ilike(search_filter),
                    Veiculo.chassi.ilike(search_filter),
                    Veiculo.proprietario.ilike(search_filter)
                )
            )
        
        # Apply filters with "Outros" logic
        if status:
            query = query.filter(Veiculo.status == status)
        
        if patio:
            # Define predefined patio options (excluding "Outros")
            predefined_patios = ["16º DP", "17º DP", "35º DP", "JDN - Atibaia", "-"]
            
            if patio == "Outros":
                # Filter for records that don't match any predefined option
                query = query.filter(
                    db.and_(
                        Veiculo.patio.isnot(None),
                        ~Veiculo.patio.in_(predefined_patios)
                    )
                )
            else:
                # Standard exact match
                query = query.filter(Veiculo.patio.ilike(f"%{patio}%"))
        
        if circunscricao:
            # Define predefined circunscricao options (excluding "Outros")
            predefined_circunscricoes = ["16º DP", "17º DP", "35º DP"]
            
            if circunscricao == "Outros":
                # Filter for records that don't match any predefined option
                query = query.filter(
                    db.and_(
                        Veiculo.circunscricao.isnot(None),
                        ~Veiculo.circunscricao.in_(predefined_circunscricoes)
                    )
                )
            else:
                # Standard exact match
                query = query.filter(Veiculo.circunscricao == circunscricao)
        
        # NOVA LÓGICA OR PARA TIPOS COM SUPORTE A "Outros" + UI MAPPING
        # UI shows user-friendly "Moto"/"Carro", but maps to database values "MOTO"/"CARRO"
        # CAMINHONETE and other types go to "Outros" category
        if tipos:
            # Map UI values to database values
            tipo_mapping = {
                "Moto": "MOTO",
                "Carro": "CARRO"
            }
            
            # Define predefined tipo options (excluding "Outros") - only main types
            predefined_tipos = ["MOTO", "CARRO"]  # CAMINHONETE goes to "Outros"
            
            # Check if "Outros" is selected along with other types
            if "Outros" in tipos:
                outros_filter = db.and_(
                    Veiculo.tipo.isnot(None),
                    ~Veiculo.tipo.in_(predefined_tipos)
                )
                
                # Remove "Outros" from tipos list to process other selections
                outros_tipos = [t for t in tipos if t != "Outros"]
                
                if outros_tipos:
                    # Map UI values to database values and combine with "Outros" logic
                    mapped_tipos = [tipo_mapping.get(t, t) for t in outros_tipos]
                    tipo_filters = [Veiculo.tipo == tipo for tipo in mapped_tipos]
                    tipo_filters.append(outros_filter)
                    query = query.filter(db.or_(*tipo_filters))
                else:
                    # Only "Outros" is selected
                    query = query.filter(outros_filter)
            else:
                # No "Outros" selected, map UI values to database values
                mapped_tipos = [tipo_mapping.get(t, t) for t in tipos]
                tipo_filters = [Veiculo.tipo == tipo for tipo in mapped_tipos]
                query = query.filter(db.or_(*tipo_filters))
        
        # Apply date filtering - NEW LOGIC
        if date_from or date_to:
            # Get all vehicles first, then filter by date in Python due to string date formats
            vehicles_for_date_filter = query.all()
            filtered_vehicle_ids = []
            
            # Parse filter dates
            filter_date_from = None
            filter_date_to = None
            
            if date_from:
                try:
                    filter_date_from = datetime.strptime(date_from, '%Y-%m-%d')
                except:
                    print(f"Warning: Could not parse date_from: {date_from}")
            
            if date_to:
                try:
                    filter_date_to = datetime.strptime(date_to, '%Y-%m-%d')
                    # Include the entire day
                    filter_date_to = filter_date_to.replace(hour=23, minute=59, second=59)
                except:
                    print(f"Warning: Could not parse date_to: {date_to}")
            
            # Filter vehicles by date
            for vehicle in vehicles_for_date_filter:
                vehicle_date = parse_date_field(vehicle.data_apreensao)
                
                if vehicle_date:
                    include_vehicle = True
                    
                    if filter_date_from and vehicle_date < filter_date_from:
                        include_vehicle = False
                    
                    if filter_date_to and vehicle_date > filter_date_to:
                        include_vehicle = False
                    
                    if include_vehicle:
                        filtered_vehicle_ids.append(vehicle.id)
            
            # Apply the date filter to the query
            if filtered_vehicle_ids:
                query = query.filter(Veiculo.id.in_(filtered_vehicle_ids))
            else:
                # No vehicles match the date filter
                query = query.filter(Veiculo.id.in_([-1]))  # Empty result
        
        # Apply sorting
        safe_sort_fields = ['id', 'spj', 'status', 'modelo', 'placa_original', 'ano']
        if sort_by in safe_sort_fields and hasattr(Veiculo, sort_by):
            if sort_order == 'desc':
                query = query.order_by(getattr(Veiculo, sort_by).desc())
            else:
                query = query.order_by(getattr(Veiculo, sort_by).asc())
        else:
            query = query.order_by(Veiculo.id.desc())
        
        # Paginate results
        pagination = query.paginate(
            page=page, 
            per_page=per_page, 
            error_out=False
        )
        
        vehicles = pagination.items
        
        # Format response
        response = {
            'vehicles': [vehicle.to_dict() for vehicle in vehicles],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': pagination.total,
                'pages': pagination.pages,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            }
        }
        
        return jsonify(response)
        
    except Exception as e:
        print(f"Error in get_vehicles: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'error': 'Failed to load vehicles',
            'vehicles': [],
            'pagination': {
                'page': 1,
                'per_page': per_page,
                'total': 0,
                'pages': 0,
                'has_next': False,
                'has_prev': False
            }
        }), 500
        
@app.route('/api/vehicle/<int:vehicle_id>')
def get_vehicle_details(vehicle_id):
    """Get detailed information for a specific vehicle"""
    
    try:
        vehicle = db.session.get(Veiculo, vehicle_id)
        if not vehicle:
            return jsonify({'error': 'Vehicle not found'}), 404
        return jsonify(vehicle.to_dict())
    except Exception as e:
        print(f"Error getting vehicle details: {e}")
        return jsonify({'error': 'Vehicle not found'}), 404

@app.route('/api/search/autocomplete')
def autocomplete():
    """Autocomplete endpoint for search suggestions"""
    
    query = request.args.get('q', '', type=str)
    
    if len(query) < 2:
        return jsonify([])
    
    try:
        suggestions = []
        search_filter = f"%{query}%"
        
        # Placas
        placas = db.session.execute(
            db.select(Veiculo.placa_original)
            .where(Veiculo.placa_original.ilike(search_filter))
            .distinct()
            .limit(5)
        ).scalars().all()
        
        for placa in placas:
            if placa:
                suggestions.append({
                    'value': placa,
                    'type': 'placa'
                })
        
        # Modelos
        modelos = db.session.execute(
            db.select(Veiculo.modelo)
            .where(Veiculo.modelo.ilike(search_filter))
            .distinct()
            .limit(5)
        ).scalars().all()
        
        for modelo in modelos:
            if modelo:
                suggestions.append({
                    'value': modelo,
                    'type': 'modelo'
                })
        
        # SPJs
        spjs = db.session.execute(
            db.select(Veiculo.spj)
            .where(Veiculo.spj.ilike(search_filter))
            .distinct()
            .limit(5)
        ).scalars().all()
        
        for spj in spjs:
            if spj:
                suggestions.append({
                    'value': spj,
                    'type': 'spj'
                })
        
        return jsonify(suggestions[:10])
        
    except Exception as e:
        print(f"Autocomplete error: {e}")
        return jsonify([])

@app.route('/api/filters/options')
def get_filter_options():
    """Get available options for filters"""
    try:
        # Get all unique status values from database
        status_options = db.session.execute(
            db.select(Veiculo.status).distinct()
        ).scalars().all()
        
        # Optional: Check if there are any "outros" tipos beyond our main types
        predefined_tipos = ["MOTO", "CARRO"]  # Only main types, CAMINHONETE goes to "Outros"
        outros_tipos_count = db.session.execute(
            db.select(db.func.count(Veiculo.id))
            .where(
                db.and_(
                    Veiculo.tipo.isnot(None),
                    ~Veiculo.tipo.in_(predefined_tipos)
                )
            )
        ).scalar()
        
        if outros_tipos_count > 0:
            print(f"Info - Found {outros_tipos_count} vehicles with tipo values in 'Outros' category (including CAMINHONETE)")
        
    except Exception as e:
        print(f"Filters options error: {e}")
        status_options = []
    
    options = {
        'status': [opt for opt in status_options if opt],
        'patio': ["16º DP", "17º DP", "35º DP", "JDN - Atibaia", "-", "Outros"],
        'circunscricao': ["16º DP", "17º DP", "35º DP", "Outros"],
        'tipo': ["Moto", "Carro", "Outros"]  # Clean UI - CAMINHONETE goes to "Outros"
    }
    return jsonify(options)

@app.route('/api/statistics')
def get_statistics():
    """Get dashboard statistics"""
    
    try:
        # Total vehicles
        total_vehicles = db.session.execute(
            db.select(db.func.count(Veiculo.id))
        ).scalar()
        
        # Count by status using SQLAlchemy 2.0+ syntax
        status_counts = db.session.execute(
            db.select(Veiculo.status, db.func.count(Veiculo.id))
            .group_by(Veiculo.status)
        ).all()
        
        # Count by type
        type_counts = db.session.execute(
            db.select(Veiculo.tipo, db.func.count(Veiculo.id))
            .group_by(Veiculo.tipo)
        ).all()
        
        response = {
            'total_vehicles': total_vehicles,
            'status_distribution': dict(status_counts),
            'type_distribution': dict(type_counts),
            'recent_vehicles': 0
        }
        
        return jsonify(response)
        
    except Exception as e:
        print(f"Statistics error: {e}")
        return jsonify({
            'total_vehicles': 0,
            'status_distribution': {},
            'type_distribution': {},
            'recent_vehicles': 0
        })

@app.route('/api/test')
def test_connection():
    """Test endpoint to verify database connection and date parsing"""
    try:
        # Test basic connection
        result = db.session.execute(db.text("SELECT COUNT(*) FROM veiculos"))
        count = result.scalar()
        
        # Test model query
        model_count = Veiculo.query.count()
        
        # Test sample data
        sample = Veiculo.query.first()
        sample_data = sample.to_dict() if sample else None
        
        # Test date parsing with sample data
        date_parsing_results = []
        if sample:
            sample_date = sample.data_apreensao
            parsed_date = parse_date_field(sample_date)
            date_parsing_results.append({
                'original': sample_date,
                'parsed': parsed_date.isoformat() if parsed_date else None,
                'success': parsed_date is not None
            })
            
            # Test a few more samples
            samples = db.session.execute(
                db.select(Veiculo.data_apreensao)
                .where(Veiculo.data_apreensao.isnot(None))
                .distinct()
                .limit(5)
            ).scalars().all()
            
            for date_sample in samples:
                parsed = parse_date_field(date_sample)
                date_parsing_results.append({
                    'original': date_sample,
                    'parsed': parsed.isoformat() if parsed else None,
                    'success': parsed is not None
                })
        
        # Test "Outros" filters
        predefined_patios = ["16º DP", "17º DP", "35º DP", "JDN - Atibaia", "-"]
        outros_patios_count = db.session.execute(
            db.select(db.func.count(Veiculo.id))
            .where(
                db.and_(
                    Veiculo.patio.isnot(None),
                    ~Veiculo.patio.in_(predefined_patios)
                )
            )
        ).scalar()
        
        predefined_circunscricoes = ["16º DP", "17º DP", "35º DP"]
        outros_circunscricoes_count = db.session.execute(
            db.select(db.func.count(Veiculo.id))
            .where(
                db.and_(
                    Veiculo.circunscricao.isnot(None),
                    ~Veiculo.circunscricao.in_(predefined_circunscricoes)
                )
            )
        ).scalar()
        
        predefined_tipos = ["MOTO", "CARRO"]  # Only main types, CAMINHONETE goes to "Outros"
        outros_tipos_count = db.session.execute(
            db.select(db.func.count(Veiculo.id))
            .where(
                db.and_(
                    Veiculo.tipo.isnot(None),
                    ~Veiculo.tipo.in_(predefined_tipos)
                )
            )
        ).scalar()
        
        return jsonify({
            'status': 'success',
            'raw_count': count,
            'model_count': model_count,
            'sample_vehicle': sample_data,
            'date_parsing_test': date_parsing_results,
            'outros_counts': {
                'patios': outros_patios_count,
                'circunscricoes': outros_circunscricoes_count,
                'tipos': outros_tipos_count
            }
        })
        
    except Exception as e:
        import traceback
        return jsonify({
            'status': 'error',
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500

@app.errorhandler(404)
def not_found_error(error):
    return jsonify({'error': 'Não encontrado'}), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({'error': 'Erro interno do servidor'}), 500

if __name__ == '__main__':
    # Test database connection on startup
    with app.app_context():
        try:
            result = db.session.execute(db.text("SELECT COUNT(*) FROM veiculos"))
            count = result.scalar()
            print(f"🚀 Starting app with {count} vehicles in database")
            
            # Test "Outros" logic on startup
            predefined_patios = ["16º DP", "17º DP", "35º DP", "JDN - Atibaia", "-"]
            outros_patios_count = db.session.execute(
                db.select(db.func.count(Veiculo.id))
                .where(
                    db.and_(
                        Veiculo.patio.isnot(None),
                        ~Veiculo.patio.in_(predefined_patios)
                    )
                )
            ).scalar()
            print(f"🔍 Found {outros_patios_count} vehicles with 'outros' pátios")
            
        except Exception as e:
            print(f"⚠️  Database connection issue: {e}")
    
    # Run the application
    app.run(debug=True, host='0.0.0.0', port=5000)