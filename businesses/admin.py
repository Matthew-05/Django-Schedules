from django.contrib import admin
from businesses.models import Business,Invited_Employees, Business_Job_Roles
from businesses.forms import Invite_Employees_form


admin.site.register(Business)
admin.site.register(Invited_Employees)
admin.site.register(Business_Job_Roles)