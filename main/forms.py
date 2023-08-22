from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from django.contrib.auth.forms import AuthenticationForm, UsernameField
from main.models import Account


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