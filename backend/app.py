from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from config import Config

db = SQLAlchemy()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    jwt.init_app(app)
    CORS(app)

    from routes.auth_routes import auth_bp
    from routes.reimbursement_routes import reimb_bp
    from routes.analytics_routes import analytics_bp
    from routes.admin import admin_bp
    from routes.expense import expense_bp
    from routes.approval import approval_bp
    from routes.analytics import analytics_bp as analytics_main_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(reimb_bp, url_prefix="/api/reimbursements")
    app.register_blueprint(analytics_bp, url_prefix="/api/analytics")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")
    app.register_blueprint(expense_bp, url_prefix="/api/expenses")
    app.register_blueprint(approval_bp, url_prefix="/api/approval")
    app.register_blueprint(analytics_main_bp, url_prefix="/api/dashboard")

    with app.app_context():
        db.create_all()

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
    