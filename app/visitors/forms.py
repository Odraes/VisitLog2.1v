from flask_wtf import FlaskForm
from wtforms import StringField, TextAreaField, SubmitField
from wtforms.validators import DataRequired, Length, Optional


class VisitorForm(FlaskForm):
    full_name = StringField("Full Name", validators=[DataRequired(), Length(max=120)])
    id_number = StringField("ID Number", validators=[DataRequired(), Length(max=64)])
    contact = StringField("Contact", validators=[Optional(), Length(max=64)])
    company = StringField("Company / Organization", validators=[Optional(), Length(max=120)])
    submit = SubmitField("Save Visitor")


class CheckInForm(FlaskForm):
    host_name = StringField("Host Name", validators=[DataRequired(), Length(max=120)])
    purpose = StringField("Purpose of Visit", validators=[DataRequired(), Length(max=255)])
    notes = TextAreaField("Notes", validators=[Optional()])
    submit = SubmitField("Check In")
