from django.shortcuts import render, redirect
from schedules.models import *
from schedules.forms import *
from django.http import HttpResponse, JsonResponse
from django.utils import timezone
from json import dumps
from datetime import datetime
from django.urls import reverse
import json
from django.views.decorators.cache import cache_control
from businesses.models import *

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

#Manage Actual Schedules Page
def manage_schedules_page(request, business_id):
    business = Business.objects.get(pk=business_id)
    try:
        roles = Business_Job_Roles.objects.filter(business=business_id)
    except:
        roles = None
    if is_owner(request, business):
        if roles == None:
            return render(request=request, template_name="schedules/manage_schedules.html", context={"business": business})
        else:
            return render(request=request, template_name="schedules/manage_schedules.html", context={"business": business, "roles": roles})

def view_schedules(request, business_id):
    business = Business.objects.get(pk=business_id)
    roles = Business_Job_Roles.objects.filter(business=business_id)

    return render(request, 'schedules/view_shift_schedule.html', {
        'roles': roles,
        'business': business,
    })


def get_scheduled_shifts(request):
    print("RAN")
    business_id = request.GET.get("businessID")
    week_multiplier = request.GET.get("weekMultiplier")
    print(week_multiplier)
    matched_shifts = Actual_Shifts.objects.filter(business_id=business_id).filter(week_multiplier=week_multiplier)
    print(matched_shifts)
    existing_shift_list = []
    if len(matched_shifts) > 0:
        for matched_shift in matched_shifts:
            employee_id = matched_shift.employee.pk
            start_and_end_times = convert_time_slots_to_times(matched_shift.shift_slots)
            start_time = start_and_end_times[0]
            end_time = start_and_end_times[1]
            day_of_week = get_day_of_week(matched_shift.shift_slots)
            name = matched_shift.employee.first_name + " " + matched_shift.employee.last_name
            shift_role = matched_shift.role.role_name
            if matched_shift.related_shift_outline:
                shift_outline_id = matched_shift.related_shift_outline.pk
            else:
                shift_outline_id = None
            json_version = {'dayOfWeek': day_of_week, 'shiftStart': start_time, 'shiftEnd': end_time, 'shiftID': matched_shift.id, 'employeeName': name, 'employeeID': employee_id, 'shiftRole': shift_role}
            existing_shift_list.append(json_version)
            print(day_of_week)
            print(start_and_end_times)
        print(existing_shift_list)        
        return JsonResponse(existing_shift_list, safe=False)
    else:
        return JsonResponse({})
    
def convert_time_slots_to_times(slots):
    first_slot_minutes = (slots[0])*15
    last_slot = slots[-1]
    
    #This is for finding the display time since the logic requires one less slot than the displayed time
    if last_slot == 671:
        last_slot_minutes = 0
    else:
        last_slot_minutes = (last_slot+1)*15

    first_slot_string = convert_minutes_to_time(first_slot_minutes)
    last_slot_string = convert_minutes_to_time(last_slot_minutes)
    return [first_slot_string, last_slot_string]

def get_employees(request):
    business_id = request.GET.get("businessID")
    employees = Invited_Employees.objects.filter(business__id=business_id)
    time_offs_list = []
    if len(employees) > 0:
        for employee in employees:
            first_name = employee.first_name
            last_name = employee.last_name
            role = employee.primary_role.role_name
            employee_id = employee.pk

            name = first_name + " " + last_name
            
            json_version = { 'employeeName': name, 'role': role, 'employeeID': employee_id }
            time_offs_list.append(json_version)
        return JsonResponse(time_offs_list, safe=False)
    else:
        return JsonResponse({})

    

def convert_minutes_to_time(minutes):
    # Calculate the total number of minutes in a day (24 hours * 60 minutes)
    total_minutes_in_a_day = 24 * 60

    # Get the remainder to handle looping back to 12:00 AM
    minutes %= total_minutes_in_a_day

    # Calculate the hours and minutes
    hours = minutes // 60
    remaining_minutes = minutes % 60

    # Determine if it's AM or PM
    am_pm = "AM" if hours < 12 else "PM"

    # Convert to 12-hour format
    if hours == 0:
        hours = 12
    elif hours > 12:
        hours -= 12

    # Format the time as a string with leading zeros for single-digit hours and minutes
    time_str = f"{hours:02d}:{remaining_minutes:02d} {am_pm}"

    return time_str

def get_day_of_week(slots):
    first_slot = slots[0]
    if is_between(first_slot, 0, 95):
        return "Sunday"
    if is_between(first_slot, 96, 191):
        return "Monday"
    if is_between(first_slot, 192, 287):
        return "Tuesday"
    if is_between(first_slot, 288, 383):
        return "Wednesday"
    if is_between(first_slot, 384, 479):
        return "Thursday"
    if is_between(first_slot, 480, 575):
        return "Friday"
    if is_between(first_slot, 576, 671):
        return "Saturday"

def is_between(number, lower_bound, upper_bound):
    return lower_bound <= number <= upper_bound

    
    



#Selector Page for each outline
def schedule_outline_page(request, business_id):
    business = Business.objects.get(pk=business_id)
    try:
        schedule_skeleton_masters = Shift_Skeleton_Master.objects.filter(business=business_id)
        roles = Business_Job_Roles.objects.filter(business=business_id)
    except:
        schedule_skeleton_masters = None
    if is_owner(request, business):
        if schedule_skeleton_masters == None:
            return render(request=request, template_name="schedules/schedule_outline_selector.html", context={"business": business})
        else:
            listed = zip(roles, schedule_skeleton_masters)
            return render(request=request, template_name="schedules/schedule_outline_selector.html", context={"business": business, "roles": roles, "list": listed})
    else:
        return redirect("access_denied")

def view_shift_outlines_OLD(request, business_id):
    business = Business.objects.get(pk=business_id)
    roles = Business_Job_Roles.objects.filter(business=business_id)
    all_shift_outlines = Shift_Skeleton_Master.objects.filter(business__id=business_id)

    return render(request, 'schedules/schedule_templates.html', {
        'business': business,
        'all_shift_outlines': all_shift_outlines,
    })

def view_shift_outlines(request, business_id):
    business = Business.objects.get(pk=business_id)
    roles = Business_Job_Roles.objects.filter(business=business_id)
    all_shift_outlines = Shift_Skeleton_Master.objects.filter(business__id=business_id)

    return render(request, 'schedules/schedule_templates.html', {
        'business': business,
        'all_shift_outlines': all_shift_outlines,
    })



#Individual outline functions
def getRelevantShifts(request):
    shift_skeleton_master_id = request.GET.get('shiftMasterID')

    individual_shifts = Shift_Outline_Individual.objects.filter(shift_skeleton_master=shift_skeleton_master_id)

    shift_dictionary  = {}
    if len(individual_shifts) > 0:
        for single_shift in individual_shifts:
            shift_dictionary[single_shift.shift_id] = [single_shift.shift_employee_count, single_shift.shift_class_slots]
        return JsonResponse(shift_dictionary)
    else:
        return JsonResponse({})

def submitNewShift(request):
    shift_master_id = request.POST.get('shift_master_id')
    shift_skeleton_master = Shift_Skeleton_Master.objects.get(pk=shift_master_id)

    class_slots = request.POST.get('class_slots')
    shift_slots = request.POST.get('shift_slots')
    employee_count = request.POST.get('employee_count')

    class_slots = [int(value) for value in class_slots.split(',')]
    shift_slots = [int(value) for value in shift_slots.split(',')]

    new_shift = Shift_Outline_Individual(shift_skeleton_master=shift_skeleton_master, shift_employee_count=employee_count, shift_slots=shift_slots, shift_class_slots=class_slots)
    new_shift.save()

    return HttpResponse(status=204)

def deleteShift(request):
    selected_shift = request.POST.get('selected_shift')
    affected_shift = Shift_Outline_Individual.objects.filter(shift_id=selected_shift)[0]
    affected_shift.delete()
    return HttpResponse(status=204)

def editShift(request):
    selected_shift = request.POST.get('selected_shift')

    affected_shift = Shift_Outline_Individual.objects.filter(shift_id=selected_shift)[0]
    print(affected_shift.shift_class_slots)
    print(affected_shift.shift_slots)
    class_slots = request.POST.get('class_slots')
    shift_slots = request.POST.get('shift_slots')
    employee_count = request.POST.get('employee_count')

    class_slots = [int(value) for value in class_slots.split(',')]
    shift_slots = [int(value) for value in shift_slots.split(',')]
    print(class_slots)
    affected_shift.shift_employee_count = employee_count
    affected_shift.shift_class_slots = class_slots
    affected_shift.shift_slots = shift_slots
    affected_shift.save()
    

    return HttpResponse(status=204)

