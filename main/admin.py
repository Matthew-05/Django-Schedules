from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from main.models import Account



class AccountAdmin(UserAdmin):
    
    ordering = ('email',)
    list_display = ('email','first_name','last_name','last_login','is_admin','is_staff','is_corporate')
    search_fields = ('email','first_name','last_name')
    readonly_fields = ('id','date_joined','last_login')
    
    filter_horizontal = ()
    list_filter = ()
    field_sets = ()
    
admin.site.register(Account,AccountAdmin)
