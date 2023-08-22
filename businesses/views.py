from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from businesses.models import Business, Invited_Employees, Business_Job_Roles
from businesses.forms import Invite_Employees_form, Create_Business_form, Create_Role_form, Edit_Employee_form, Edit_Role_form, Business_Settings_form
from django.urls import reverse_lazy
from django.core.mail import send_mail
from django.http import HttpResponse
import json
from django.forms.widgets import CheckboxSelectMultiple
from pyzipcode import ZipCodeDatabase
from django.utils import timezone
import pytz
from main.models import Account
from schedules.models import *

zcdb = ZipCodeDatabase()

# Listing the businesses that the requesting user belongs to
def user_businesses(request):
    user = request.user
    businesses = Business.objects.filter(owner=user)
    return(businesses)

# Returning true or false if the requesting user belongs to a business
def is_owner(request, business):
    businesses = user_businesses(request)
    if business in businesses:
        return(True)
    else:
        return(False)

# Listing the business's invited users that have not accepted yet
def list_invited_users(business):
    invited_users = Invited_Employees.objects.filter(business=business)
    return(invited_users)

# Listing the business's created roles
def list_created_roles(business):
    created_roles = Business_Job_Roles.objects.filter(business=business)
    return(created_roles)

##############################  Create Business Modal  ##############################
def create_business(request):
    if request.method == "POST":
        form = Create_Business_form(request.POST)
        if form.is_valid():
            instance = form.save(commit=False)
            instance.owner = request.user
            form.save()
            # This last line sends the signal to the javascript
            return HttpResponse(status=204, headers={'HX-Trigger': json.dumps({"form-submitted": None})})
    else:
        form = Create_Business_form
    return render(request, 'businesses/create_business_form.html', {
        'form': form,
    })

##############################  Corporate Dashboard  ##############################
def corporate_dashboard(request, business_id):
    business = Business.objects.get(pk=business_id)
    if is_owner(request, business):
        return render(request=request, template_name="businesses/corporate_dashboard.html", context={"business": business})
    else:
        return redirect("access_denied")
    
def business_settings_page(request, business_id):
    business = Business.objects.get(pk=business_id)
    if request.method == "POST":
        form = Business_Settings_form(request.POST, instance = business)
        if form.is_valid():
            form.save()
            messages.success(request, "Changes Saved")
            return render(request, 'businesses/business_settings_page.html', {
            'form': form,
            'business': business,
        })
    else:
        form = Business_Settings_form(instance = business)
    return render(request, 'businesses/business_settings_page.html', {
        'form': form,
        'business': business,
    })

##############################  Corporate Schedule  ##############################
def schedule_page(request, business_id):
    business = Business.objects.get(pk=business_id)
    return render(request=request, template_name="businesses/schedule_page.html", context={"business": business})



##############################  Corporate Roles  ##############################
#Job Roles Page
def job_roles_page(request, business_id):
    business = Business.objects.get(pk=business_id)
    created_roles = list_created_roles(business)
    if is_owner(request, business):
        return render(request=request, template_name="businesses/roles_page.html", context={"business": business,"created_roles": created_roles})
    else:
        return redirect("access_denied")
    
def create_role(request, business_id):
    business = Business.objects.get(pk=business_id)
    if request.method == "POST":
        form = Create_Role_form(request.POST)
        if form.is_valid():
            instance = form.save(commit=False)
            instance.business = business
            form.save()
            Shift_Skeleton_Master.objects.create(business=business, role=instance)
            # This last line sends the signal to the javascript
            return HttpResponse(status=204, headers={'HX-Trigger': json.dumps({"form-submitted": None})})
    else:
        form = Create_Role_form
    return render(request, 'businesses/create_job_role_form.html', {
        'form': form,
    })
    
def edit_role(request, role_id):
    role = Business_Job_Roles.objects.get(pk=role_id)
    if request.method == "POST":
        form = Edit_Role_form(request.POST, instance = role)
        if form.is_valid():
            form.save()
            # This last line sends the signal to the javascript
            return HttpResponse(status=204, headers={'HX-Trigger': json.dumps({"form-submitted": None})})
    else:
        form = Edit_Role_form(instance = role)
    return render(request, 'businesses/edit_job_role_form.html', {
        'form': form,
    })    

def delete_role(request, role_id):
    role = Business_Job_Roles.objects.get(pk=role_id)
    if request.method == "POST":
        role.delete()
        return HttpResponse(status=204, headers={'HX-Trigger': json.dumps({"form-submitted": None})})
    return render(request, 'businesses/delete_role_form.html', {
        'role': role,
    })

##############################  Corporate Manage Employees  ##############################  
def manage_team_page(request, business_id):
    business = Business.objects.get(pk=business_id)
    user_timezone = business.time_zone
    timezone.activate(user_timezone)
    if is_owner(request, business):
        invited_users = list_invited_users(business)
        return render(request=request, template_name="businesses/manage_team_page.html", context={"business": business, "invited_users":invited_users})
    else:
        return redirect("access_denied")

def invite_employee(request, business_id):
    business = Business.objects.get(pk=business_id)
    if request.method == "POST":
        form = Invite_Employees_form(request.POST,business_id=business_id)
        if form.is_valid():
            instance = form.save(commit=False)
            instance.business = business
            form.save()
            selected_roles = form.cleaned_data['secondary_roles']
            instance.secondary_roles.set(selected_roles)
            
            business_name = business.name
            to_email = form.cleaned_data['invited_email']
            
            if Account.objects.filter(email=to_email):
                subject = f"{business_name} has invited you to their schedule"
                message = "login accept view implement later"
                send_email(to_email, subject,message)
            else:
                invite_code = instance.invite_code
                invite_key = instance.pk
                subject = f"{business_name} has invited you to their schedule"
                message = f"/register/{invite_key}/{invite_code}"
                send_email(to_email, subject,message)
                
            # This last line sends the signal to the javascript
            return HttpResponse(status=204, headers={'HX-Trigger': json.dumps({"form-submitted": None})})
    else:
        form = Invite_Employees_form(business_id=business_id)
        form.fields["secondary_roles"].widget = CheckboxSelectMultiple()
        form.fields["secondary_roles"].queryset = Business_Job_Roles.objects.filter(business=business)
        
    return render(request, 'businesses/invite_user_form.html', {
        'form': form,
    })
    
def edit_employee(request, employee_id):
    employee = Invited_Employees.objects.get(pk=employee_id)
    business = employee.business
    if request.method == "POST":
        form = Edit_Employee_form(request.POST, instance = employee)
        if form.is_valid():
            form.save()
            # This last line sends the signal to the javascript
            messages.success(request, "Edit made")
            return HttpResponse(status=204, headers={'HX-Trigger': json.dumps({"form-submitted": None})})
    else:
        form = Edit_Employee_form(instance = employee)
        form.fields["secondary_roles"].widget = CheckboxSelectMultiple()
        form.fields["secondary_roles"].queryset = Business_Job_Roles.objects.filter(business=business)
    return render(request, 'businesses/edit_user_form.html', {
        'form': form,
    })
    
def remove_employee(request,employee_id):
    employee = Invited_Employees.objects.get(pk=employee_id)
    if request.method == "POST":
        employee.delete()
        return HttpResponse(status=204, headers={'HX-Trigger': json.dumps({"form-submitted": None})})
    return render(request, 'businesses/remove_employee_form.html', {
        'employee': employee,
    })


##############################  Emailing  ##############################  
def send_email(to_email, subject, message):
    from_email = 'from_email@goober.com'
    send_mail(
        subject = subject,
        message = message,
        from_email= from_email,
        recipient_list= [to_email],
        fail_silently=False
        )