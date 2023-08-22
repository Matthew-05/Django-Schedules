from django.forms import ModelForm, HiddenInput
from django import forms
from django.core.exceptions import ValidationError
from businesses.models import Invited_Employees
from availability.models import *
from crispy_forms.helper import FormHelper
from crispy_forms.layout import Layout, Fieldset, Submit
from bootstrap_daterangepicker import widgets, fields

class Edit_Employee_Unavailability_form(ModelForm):
    def __init__(self, *args, **kwargs):
        super(Edit_Employee_Unavailability_form, self).__init__(*args, **kwargs)
        self.fields['unavailable_blocks'].widget = HiddenInput()
        self.fields['unavailable_blocks'].required = False
    class Meta:
        model = Invited_Employees
        fields = ['unavailable_blocks']

class New_Time_Off(ModelForm):
    Start_and_End_Dates = fields.DateRangeField(
        input_formats=['%m/%d/%Y'],
        widget=widgets.DateRangeWidget(
            format='%m/%d/%Y'
        ),
    )
    def __init__(self, *args, **kwargs):
        business_id = kwargs.pop('business_id', None)
        super(New_Time_Off, self).__init__(*args, **kwargs)
        if business_id:
            self.fields['requester'].queryset = Invited_Employees.objects.filter(business__id=business_id)

    class Meta:
        model = Time_Off
        fields = ['requester']
        labels = {
            'requester': 'Select an employee',
            'date_range_with_format': 'Start and End Dates'
        }