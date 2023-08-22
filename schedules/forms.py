from django.forms import ModelForm, HiddenInput
from django import forms
from schedules.models import*
from django.core.exceptions import ValidationError
from django.forms.fields import DateField
from crispy_forms.helper import FormHelper
from crispy_forms.layout import Submit
from django.urls import reverse_lazy

class TimePickerInput(forms.TimeInput):
        input_type = 'time'


class Shift_Skeleton_Individual_form(ModelForm):
	def __init__(self, *args, **kwargs):
		super().__init__(*args, **kwargs)
		self.helper = FormHelper(self)

	class Meta:
		model = Shift_Skeleton_Individual
		fields = ['start_block','end_block','shift_start_day_of_week','shift_start','shift_end']
  
	#shift_start = forms.TimeField(widget=SelectTimeWidget(twelve_hr=True, use_seconds=False, required=False), required=False, label=u'Time')

class Create_Shift_Form(ModelForm):
	def __init__(self, *args, **kwargs):
		super(Create_Shift_Form, self).__init__(*args, **kwargs)
		self.fields['shift_employee_count'].widget = HiddenInput()
		self.fields['shift_slots'].widget = HiddenInput()
		self.fields['shift_class_slots'].widget = HiddenInput()
	class Meta:
		model = Shift_Outline_Individual
		fields = ['shift_employee_count','shift_slots','shift_class_slots']


        