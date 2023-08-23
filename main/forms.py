from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from django.contrib.auth.forms import AuthenticationForm, UsernameField
from main.models import Account
from crispy_forms.helper import FormHelper
from crispy_forms.layout import Layout, Field


class EmployeeCheck(forms.Form):
	invite_code = forms.UUIDField(required=True, error_messages={'invalid': 'Invalid or accepted invite code.'})

class UserForm(UserCreationForm):
	email = forms.EmailField(required=True)

	class Meta:
		model = Account
		fields = ("email", "first_name", "last_name", "password1", "password2")

	def save(self, commit=True):
		user = super(UserForm, self).save(commit=False)
		user.email = self.cleaned_data['email']
		if commit:
			user.save()
		return user

class UserFormFromEmail(UserCreationForm):
	def __init__(self, *args, **kwargs):
		super().__init__(*args, **kwargs)

		# Customize the field IDs
		self.fields['first_name'].widget.attrs['id'] = 'employee_first_name'
		self.fields['last_name'].widget.attrs['id'] = 'employee_last_name'
		self.fields['password1'].widget.attrs['id'] = 'employee_password1'
		self.fields['password2'].widget.attrs['id'] = 'employee_password2'
	class Meta:
		model = Account
		fields = ("first_name", "last_name", "password1", "password2")
		


class CorporateUserForm(UserCreationForm):
	email = forms.EmailField(required=True)

	class Meta:
		model = Account
		fields = ("email", "first_name", "last_name", "password1", "password2")

	def save(self, commit=True):
		user = super(CorporateUserForm, self).save(commit=False)
		user.email = self.cleaned_data['email']
		if commit:
			user.save()
		return user