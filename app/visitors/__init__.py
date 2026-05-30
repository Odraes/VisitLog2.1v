from flask import Blueprint

bp = Blueprint("visitors", __name__, url_prefix="/visitors")

from app.visitors import routes  # noqa: F401, E402
