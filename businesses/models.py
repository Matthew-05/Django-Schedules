import uuid
from django.db import models
from django.conf import settings
import pytz
from django.core.exceptions import ValidationError
from django.contrib.postgres.fields import ArrayField
def validate_range_and_unique(value):
    # Check that all values are within the range 0-671
    if not all(0 <= v <= 671 for v in value):
        raise ValidationError('All values must be within the range 1-10.')

    # Check that there are no duplicate values
    if len(set(value)) != len(value):
        raise ValidationError('Duplicate values are not allowed.')



class Business(models.Model):
    TIMEZONES = tuple(zip(pytz.all_timezones, pytz.all_timezones))

    name                    = models.CharField(max_length=100)
    owner                   = models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE,related_name='owner_set')
    date_created            = models.DateTimeField(verbose_name="date joined", auto_now_add=True)
    total_employees         = models.PositiveIntegerField(default=0)
    external_identifier     = models.UUIDField('object_id', max_length=20, unique=True, default=uuid.uuid4)
    zip_code                = models.CharField("zip code", max_length=5, default="43701")
    time_zone               = models.CharField(max_length=100, default='UTC', choices=TIMEZONES)
    
    exclude = ['owner']
    
    def __str__(self):
        return self.name
    

class Business_Job_Roles(models.Model):
    role_name               = models.CharField(max_length=50)
    business                = models.ForeignKey(Business,on_delete=models.CASCADE)
    date_created            = models.DateTimeField(verbose_name="date created", auto_now_add=True)
    def __str__(self):
        return self.role_name

class Invited_Employees(models.Model):
    def default_availability():
        return {'monday':[],'tuesday':[],'wednesday':[],'thursday':[],'friday':[],'saturday':[],'sunday':[]} 
    
    business                = models.ForeignKey(Business,on_delete=models.CASCADE)
    invited_email           = models.EmailField(verbose_name="email",max_length=60)
    first_name              = models.CharField(max_length=30)
    last_name               = models.CharField(max_length=30)
    date_invited            = models.DateTimeField(verbose_name="date invited", auto_now_add=True)
    invite_code             = models.CharField(max_length=36, default=uuid.uuid4, unique=True)
    accepted                = models.BooleanField(default=False)
    primary_role            = models.ForeignKey(Business_Job_Roles, on_delete=models.SET_NULL, blank=True, null=True)
    secondary_roles          = models.ManyToManyField(Business_Job_Roles,related_name ="secondary_roles",blank=True)
    unavailable_blocks      = ArrayField(models.IntegerField(), default=list,validators=[validate_range_and_unique])
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['business', 'invited_email'], name='already invited',violation_error_message="Already invited this user"),
        ]
    def __str__(self):
        return self.first_name + " " + self.last_name
    
