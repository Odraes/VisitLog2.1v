from datetime import datetime
from flask import render_template, redirect, url_for, flash, request
from flask_login import login_required, current_user
from app import db
from app.visitors import bp
from app.visitors.forms import VisitorForm, CheckInForm
from app.models import Visitor, Visit


@bp.route("/")
@login_required
def index():
    q = request.args.get("q", "").strip()
    query = Visitor.query
    if q:
        like = f"%{q}%"
        query = query.filter(
            db.or_(Visitor.full_name.ilike(like), Visitor.company.ilike(like))
        )
    visitors = query.order_by(Visitor.full_name).all()
    active_visits = {v.visitor_id for v in Visit.query.filter_by(check_out=None).all()}
    return render_template("visitors/index.html", visitors=visitors, active_visits=active_visits, q=q)


@bp.route("/add", methods=["GET", "POST"])
@login_required
def add():
    form = VisitorForm()
    if form.validate_on_submit():
        if Visitor.query.filter_by(id_number=form.id_number.data).first():
            flash("A visitor with that ID number already exists.", "danger")
            return render_template("visitors/add.html", form=form)
        visitor = Visitor(
            full_name=form.full_name.data,
            id_number=form.id_number.data,
            contact=form.contact.data,
            company=form.company.data,
        )
        db.session.add(visitor)
        db.session.commit()
        flash(f"Visitor {visitor.full_name} added.", "success")
        return redirect(url_for("visitors.index"))
    return render_template("visitors/add.html", form=form)


@bp.route("/<int:visitor_id>")
@login_required
def detail(visitor_id):
    visitor = Visitor.query.get_or_404(visitor_id)
    return render_template("visitors/detail.html", visitor=visitor)


@bp.route("/<int:visitor_id>/edit", methods=["GET", "POST"])
@login_required
def edit(visitor_id):
    visitor = Visitor.query.get_or_404(visitor_id)
    form = VisitorForm(obj=visitor)
    if form.validate_on_submit():
        existing = Visitor.query.filter_by(id_number=form.id_number.data).first()
        if existing and existing.id != visitor.id:
            flash("Another visitor already has that ID number.", "danger")
            return render_template("visitors/add.html", form=form, editing=True)
        visitor.full_name = form.full_name.data
        visitor.id_number = form.id_number.data
        visitor.contact = form.contact.data
        visitor.company = form.company.data
        db.session.commit()
        flash("Visitor updated.", "success")
        return redirect(url_for("visitors.detail", visitor_id=visitor.id))
    return render_template("visitors/add.html", form=form, editing=True)


@bp.route("/<int:visitor_id>/checkin", methods=["GET", "POST"])
@login_required
def checkin(visitor_id):
    visitor = Visitor.query.get_or_404(visitor_id)
    active = Visit.query.filter_by(visitor_id=visitor_id, check_out=None).first()
    if active:
        flash(f"{visitor.full_name} already has an active visit.", "warning")
        return redirect(url_for("visitors.detail", visitor_id=visitor_id))
    form = CheckInForm()
    if form.validate_on_submit():
        visit = Visit(
            visitor_id=visitor_id,
            host_name=form.host_name.data,
            purpose=form.purpose.data,
            notes=form.notes.data,
            check_in=datetime.utcnow(),
            created_by=current_user.id,
        )
        db.session.add(visit)
        db.session.commit()
        flash(f"{visitor.full_name} checked in.", "success")
        return redirect(url_for("visitors.index"))
    return render_template("visitors/check_in.html", form=form, visitor=visitor)


@bp.route("/visit/<int:visit_id>/checkout", methods=["POST"])
@login_required
def checkout(visit_id):
    visit = Visit.query.get_or_404(visit_id)
    if visit.check_out:
        flash("Visit already checked out.", "warning")
    else:
        visit.check_out = datetime.utcnow()
        db.session.commit()
        flash(f"{visit.visitor.full_name} checked out.", "success")
    return redirect(url_for("visitors.index"))
