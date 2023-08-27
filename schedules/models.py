from django.db import models
from businesses.models import *
from django.core.validators import MaxValueValidator, MinValueValidator
import random
import string

def validate_range_and_unique(value):
    # Check that all values are within the range 0-671
    if not all(0 <= v <= 671 for v in value):
        raise ValidationError('All values must be within the range 1-10.')

    # Check that there are no duplicate values
    if len(set(value)) != len(value):
        raise ValidationError('Duplicate values are not allowed.')
    
def validate_unique(value):
    if len(set(value)) != len(value):
        raise ValidationError('Duplicate values are not allowed.')

class Shift_Skeleton_Master(models.Model):
    business                = models.ForeignKey(Business,on_delete=models.CASCADE)
    role                    = models.ForeignKey(Business_Job_Roles,on_delete=models.CASCADE)
    uncertain_shift_end     = models.BooleanField(default=False)
    
    
class Shift_Skeleton_Individual(models.Model):
    days = (("Monday", "Monday"), ("Tuesday", "Tuesday"), ("Wednesday", "Wednesday"), ("Thursday", "Thursday"), ("Friday", "Friday"), ("Saturday", "Saturday"), ("Sunday", "Sunday"))
    
    shift_skeleton_master   = models.ForeignKey(Shift_Skeleton_Master, on_delete=models.CASCADE)
    shift_start_day_of_week = models.CharField(max_length=100, choices=days)
    start_block             = models.CharField(max_length=500)
    end_block               = models.CharField(max_length=500)
    shift_start             = models.TimeField()
    shift_end               = models.TimeField()

class Shift_Outline_Individual(models.Model):
    shift_skeleton_master   = models.ForeignKey(Shift_Skeleton_Master, on_delete=models.CASCADE)
    shift_employee_count    = models.IntegerField(MinValueValidator(1))
    shift_slots             = ArrayField(models.IntegerField(), default=list,validators=[validate_range_and_unique]) ##This is for the schedule finding algo
    shift_class_slots       = ArrayField(models.IntegerField(), default=list,validators=[validate_range_and_unique]) ##This is for passing to the javascript for the classes
    shift_id                = models.CharField(null=True, blank=True)
    def save(self, *args, **kwargs):
        if not self.shift_id:
            random_id = ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))
            self.shift_id = "shift"+str(random_id)
        super().save(*args, **kwargs)

class Actual_Shifts(models.Model):
    business                = models.ForeignKey(Business,on_delete=models.CASCADE)
    role                    = models.ForeignKey(Business_Job_Roles,on_delete=models.CASCADE)
    shift_slots             = ArrayField(models.IntegerField(), default=list,validators=[validate_unique])
    employee                = models.ForeignKey(Invited_Employees,on_delete=models.CASCADE)
    week_multiplier         = models.IntegerField(null=True, blank=True)
    related_shift_outline   = models.ForeignKey(Shift_Outline_Individual, on_delete=models.CASCADE, blank=True, null=True)

class Schedule_Template(models.Model):
    business                = models.ForeignKey(Business,on_delete=models.CASCADE)
    template_name           = models.CharField(max_length=100)


class Single_Templated_Shift(models.Model):
    shift_template                = models.ForeignKey(Schedule_Template,on_delete=models.CASCADE)
    number_of_employees           = models.IntegerField()
    start_slot                    = models.IntegerField()
    end_slot                      = models.IntegerField()
    day_of_week                   = models.CharField()