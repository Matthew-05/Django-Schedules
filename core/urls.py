from django.contrib import admin
from django.urls import path
from main import views
import businesses.views
import schedules.views
import availability.views
    
urlpatterns = [

#Not Logged in
    path("", views.landing_page, name="landing_page"),
    path("pricing/", views.pricing_page, name="pricing"),
    path("features/", views.features_page, name="features"),


#Corporate Views
    path("corporate/", views.corporate_login_landing_page, name="corporate_login_landing_page"),
    path("corporate/create-business", businesses.views.create_business, name="create_business"),
    path("corporate/<int:business_id>/dashboard", businesses.views.corporate_dashboard, name="corporate_dashboard"),
    path("corporate/<int:business_id>/schedule", businesses.views.schedule_page, name="schedule"),
    path("corporate/<int:business_id>/manage-team-overview", businesses.views.manage_team_page, name="manage_team_active"),
    path("corporate/<int:business_id>/invite-user", businesses.views.invite_employee, name="invite_user"),
    path("corporate/<int:business_id>/job-roles", businesses.views.job_roles_page, name="job_roles"),
    path("corporate/<int:business_id>/create-role", businesses.views.create_role, name="create_role"),
    path("corporate/<int:employee_id>/edit-employee", businesses.views.edit_employee, name="edit_employee"),
    path("corporate/<int:employee_id>/remove-employee", businesses.views.remove_employee, name="remove_employee"),
    path("corporate/<int:role_id>/edit-role", businesses.views.edit_role, name="edit_role"),
    path("corporate/<int:role_id>/delete-role", businesses.views.delete_role, name="delete_role"),
    path("corporate/<int:business_id>/settings", businesses.views.business_settings_page, name="business_settings"),
    
    
#Schedules
    path("corporate/<int:business_id>/outlines", schedules.views.view_shift_outlines, name="view_shift_outlines"),
    path("getshifts/", schedules.views.getRelevantShifts, name = "get_relevant_shifts"),
    path("submitshift/", schedules.views.submitNewShift, name = "submit_new_shift"),
    path("editshift/", schedules.views.editShift, name = "edit_shift"),
    path("deleteshift/", schedules.views.deleteShift, name = "delete_shift"),
    path("corporate/<int:business_id>/schedule-outlines", schedules.views.schedule_outline_page, name = "schedule_outline_page"),
    path("corporate/<int:business_id>/manage-schedules", schedules.views.manage_schedules_page, name = "manage_schedules"),
    path("corporate/<int:business_id>/schedules/", schedules.views.view_schedules, name="view_schedules"),
    path("getscheduledshifts/", schedules.views.get_scheduled_shifts, name = "get_scheduled_shifts"),
    path("getemployees/", schedules.views.get_employees, name = "get_employees"),

    
#Login, Logout, Register   
    path("register/", views.register_question, name="register_question"),
    path("register/corporate", views.register_corporate, name="register_corporate"),
    path("register/invite-code", views.employee_check, name="employee_check"),
    path("register/<int:invite_id>/<uuid:invite_code>", views.register_from_email, name="register_from_email"),
    path("login/", views.login_request, name="login_landing_page"),
    path("logout/", views.logout_request, name= "logout"),
    

#Availability
    path("corporate/<int:invited_employee_id>/edit-unavailability-blocks", availability.views.edit_unavailibility_blocks, name="edit_unavailibility_blocks"),
    path("corporate/<int:business_id>/view-availability", availability.views.manager_view_time_off, name="manager_view_time_off"),
    path("gettimeoffs/", availability.views.get_all_time_off_instances, name = "get_all_time_off_instances"),
    path("accepttimeoff/", availability.views.accept_time_off, name = "accept_time_off"),
    path("rejecttimeoff/", availability.views.reject_time_off, name = "reject_time_off"),
    path("addnewtimeoff/", availability.views.add_new_time_off, name = "add_new_time_off"),


#Other
    path("invalid-permissions/", views.access_denied, name="access_denied"),
    path('admin/', admin.site.urls),
]
