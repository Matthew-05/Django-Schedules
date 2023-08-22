from django.forms import ModelForm
from businesses.models import Business, Invited_Employees, Business_Job_Roles
from django.core.exceptions import ValidationError


class Create_Business_form(ModelForm):
		class Meta:
			model = Business
			fields = ['name', 'total_employees','zip_code']


class Invite_Employees_form(ModelForm):
	class Meta:
		model = Invited_Employees
		fields = ['invited_email','first_name','last_name','primary_role','secondary_roles']
	def __init__(self, *args, **kwargs):
		business_id = kwargs.pop('business_id', None)
		print(business_id)
		super().__init__(*args, **kwargs)
		# Limit the choices for the 'role' field based on the current instance's business
		self.fields['primary_role'].queryset = self.fields['primary_role'].queryset.filter(business__id=business_id)
		

  
class Create_Role_form(ModelForm):
	class Meta:
		model = Business_Job_Roles
		fields = ['role_name']
  
class Edit_Employee_form(ModelForm):
	class Meta:
		model = Invited_Employees
		fields = ['first_name','last_name','primary_role','secondary_roles']
  
class Edit_Role_form(ModelForm):
	class Meta:
		model = Business_Job_Roles
		fields = ['role_name']
  

class Business_Settings_form(ModelForm):
	class Meta:
		model = Business
		fields = ['name','total_employees','zip_code','time_zone']