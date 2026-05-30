import csv
import io
from datetime import datetime, date
from flask import render_template, request, Response
from flask_login import login_required
from app.reports import bp
from app.models import Visit, Visitor


def _build_query(date_from, date_to, host_name):
    query = Visit.query.join(Visitor)
    if date_from:
        query = query.filter(Visit.check_in >= datetime.combine(date_from, datetime.min.time()))
    if date_to:
        query = query.filter(Visit.check_in <= datetime.combine(date_to, datetime.max.time()))
    if host_name:
        query = query.filter(Visit.host_name.ilike(f"%{host_name}%"))
    return query.order_by(Visit.check_in.desc())


def _parse_date(value):
    if not value:
        return None
    try:
        return date.fromisoformat(value)
    except ValueError:
        return None


@bp.route("/")
@login_required
def index():
    date_from = _parse_date(request.args.get("date_from"))
    date_to = _parse_date(request.args.get("date_to"))
    host_name = request.args.get("host_name", "").strip()

    page = request.args.get("page", 1, type=int)
    query = _build_query(date_from, date_to, host_name)
    pagination = query.paginate(page=page, per_page=20, error_out=False)

    return render_template(
        "reports/index.html",
        visits=pagination.items,
        pagination=pagination,
        date_from=date_from,
        date_to=date_to,
        host_name=host_name,
    )


@bp.route("/export")
@login_required
def export():
    date_from = _parse_date(request.args.get("date_from"))
    date_to = _parse_date(request.args.get("date_to"))
    host_name = request.args.get("host_name", "").strip()

    visits = _build_query(date_from, date_to, host_name).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Visit ID", "Visitor Name", "ID Number", "Company", "Host", "Purpose",
                     "Check In", "Check Out", "Duration", "Notes"])
    for v in visits:
        writer.writerow([
            v.id,
            v.visitor.full_name,
            v.visitor.id_number,
            v.visitor.company or "",
            v.host_name,
            v.purpose,
            v.check_in.strftime("%Y-%m-%d %H:%M"),
            v.check_out.strftime("%Y-%m-%d %H:%M") if v.check_out else "",
            v.duration or "ongoing",
            v.notes or "",
        ])

    output.seek(0)
    filename = f"visitlog_{date.today().isoformat()}.csv"
    return Response(
        output.getvalue(),
        mimetype="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
