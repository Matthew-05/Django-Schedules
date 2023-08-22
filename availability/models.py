from django.db import models
from main.models import Account
from businesses.models import *
from django.core.validators import MaxValueValidator, MinValueValidator
import random
import string
from django.utils.translation import gettext_lazy as _
   

class Time_Off(models.Model):
    business                = models.ForeignKey(Business,on_delete=models.CASCADE)
    requester               = models.ForeignKey(Invited_Employees,on_delete=models.CASCADE)
    start_date              = models.DateField()
    end_date                = models.DateField()
    holiday_flag            = models.BooleanField(default=False)
    accepted                = models.CharField(max_length=8, default="pending")
    accepted_by             = models.ForeignKey(Account, on_delete=models.CASCADE, null=True, blank=True)
    created                 = models.DateField(verbose_name="Date created", auto_now=True)
    def clean(self):
        super().clean()
        if self.start_date and self.end_date and self.end_date <= self.start_date:
            raise ValidationError(_("End date must be after the start date."))
