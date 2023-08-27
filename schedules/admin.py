from django.contrib import admin
from schedules.models import *

admin.site.register(Shift_Outline_Individual)
admin.site.register(Actual_Shifts)

admin.site.register(Schedule_Template)
admin.site.register(Single_Templated_Shift)