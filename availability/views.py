from django.shortcuts import render, redirect
from businesses.models import *
from businesses.forms import *
from availability.models import *
from django.http import HttpResponse, JsonResponse
import json
from django.forms.widgets import CheckboxSelectMultiple
from .forms import *
from django.utils import timezone
from datetime import datetime

# Listing the businesses that the requesting user belongs to
def user_businesses(request):
    user = request.user
    businesses = Business.objects.filter(owner=user)
    return(businesses)

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

def edit_unavailibility_blocks(request, invited_employee_id):
    employee = Invited_Employees.objects.get(pk=invited_employee_id)
    unavailibility_blocks = employee.unavailable_blocks
    if request.method == "POST":
        form = Edit_Employee_Unavailability_form(request.POST, instance = employee)
        if form.is_valid():
            print(request.POST.get('unavailable_blocks'))
            form.save()
                
            # This last line sends the signal to the javascript
            return HttpResponse(status=204, headers={'HX-Trigger': json.dumps({"form-submitted": None})})
    else:
        form = Edit_Employee_Unavailability_form(instance = employee)
    return render(request, 'availability/edit_core_availability_form.html', {
        'form': form,
        'unavailibility_blocks': unavailibility_blocks,
        'employee': employee,
    })

    
## Manager Time Off Views
def add_new_time_off(request):
    form = New_Time_Off(request.POST)
    daterange = request.POST.get('Start_and_End_Dates')
    start_date, end_date = daterange.split(' - ')
    print(daterange)
    requester = request.POST.get('requester')
    requester_object = Invited_Employees.objects.get(pk=requester)

    start_date = datetime.strptime(start_date, '%m/%d/%Y')
    end_date = datetime.strptime(end_date, '%m/%d/%Y')
    if form.is_valid():
        print("VALID")
        instance = form.save(commit=False)
        instance.start_date = start_date
        instance.end_date = end_date
        instance.business = requester_object.business
        instance.accepted_by = request.user
        instance.accepted = 'accepted'
        form.save()
        return HttpResponse(status=204)
    else:
        print(form.errors)  

    return HttpResponse(status=204)

def manager_view_time_off(request, business_id):
    business = Business.objects.get(pk=business_id)
    user_timezone = business.time_zone
    timezone.activate(user_timezone)
    add_new_time_off_form = New_Time_Off(business_id=business_id)
    all_roles_in_business = Business_Job_Roles.objects.filter(business=business)
    print(all_roles_in_business)
    if is_owner(request, business):
        return render(request=request, template_name="availability/corporate_time_off.html", context={"business": business, "add_new_time_off_form": add_new_time_off_form, "all_roles_in_business" : all_roles_in_business})
    else:
        return redirect("access_denied")
    
def accept_time_off(request):
    user_account_object = request.user
    time_off_id = request.POST.get('time_off_ID')
    time_off_object = Time_Off.objects.get(pk=time_off_id)

    time_off_object.accepted_by = user_account_object
    time_off_object.accepted = "accepted"
    time_off_object.save()

    return HttpResponse(status=204)

def reject_time_off(request):
    user_account_object = request.user
    time_off_id = request.POST.get('time_off_ID')
    time_off_object = Time_Off.objects.get(pk=time_off_id)

    time_off_object.accepted_by = user_account_object
    time_off_object.accepted = "denied"
    time_off_object.save()

    return HttpResponse(status=204)
    
def get_all_time_off_instances(request):
    business_id = request.GET.get("businessID")
    time_offs = Time_Off.objects.filter(business__id=business_id)
    time_offs_list = []
    if len(time_offs) > 0:
        for time_off_object in time_offs:
            print(time_off_object.requester)
            time_off_object_ID = time_off_object.id
            first_name = time_off_object.requester.first_name
            last_name = time_off_object.requester.last_name
            if time_off_object.requester.primary_role is not None:
                requester_role = time_off_object.requester.primary_role.role_name   
            else:
                requester_role = "N/A"
            start_date = time_off_object.start_date
            end_date = time_off_object.end_date
            accepted = time_off_object.accepted
            accepted_by = time_off_object.accepted_by
            request_date = time_off_object.created
            if accepted_by:
                accepted_by_first_name = time_off_object.accepted_by.first_name
                accepted_by_last_name = time_off_object.accepted_by.last_name
                accepted_by = accepted_by_first_name + " " + accepted_by_last_name
            else:
                accepted_by = None
            holiday_flag = False

            name = first_name + " " + last_name
            
            json_version = {'timeOffID': time_off_object_ID,'startDate': start_date, 'endDate': end_date, 'role': requester_role, 'title': name, 'holidayFlag': holiday_flag, 'acceptedBy': accepted_by, 'accepted': accepted, 'requestDate': request_date}
            time_offs_list.append(json_version)
        return JsonResponse(time_offs_list, safe=False)
    else:
        return JsonResponse({})