from django.shortcuts import  render, redirect, get_object_or_404, HttpResponseRedirect
from main.forms import UserForm, CorporateUserForm, UserFormFromEmail, EmployeeCheck
from django.contrib import messages
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import Group, User
from businesses.models import Business, Invited_Employees
from django.http import HttpResponseNotFound, JsonResponse
from django.urls import reverse



#Condition Checks
def is_corporate(request):
    user = request.user
    print(request.user)
    #print(user.objects.only('is_corporate'))
    return user.groups.filter(name="corporate").exists()

def user_businesses(request):
    user = request.user
    businesses = Business.objects.filter(owner=user)
    print(businesses)
    return(businesses)

@login_required() #Determining whether to redirect to corporate dashboard
def determine_login_type(request):
    if is_corporate(request):
        return redirect('corporate_login_landing_page')
    else:
    	return render(request=request, template_name='main/login_landing_page.html')


#First Session Load
def landing_page(request):
    if request.user.is_authenticated:
        print("User Is authenticated")
        if is_corporate(request):
            print("Redirecting to corporate")
            return redirect(corporate_login_landing_page)
        else:
            pass
            return redirect(login_landing_page)
    else:
        corporate_register_form = CorporateUserForm()
        employee_register_form = UserFormFromEmail()
        return render(request=request, template_name='main/landing_page.html', context={"corporate_register_form":corporate_register_form, "employee_register_form":employee_register_form})


#Not Logged In Views
def features_page(request):
    return render(request=request, template_name='main/features.html')

def pricing_page(request):
    return render(request=request, template_name='main/pricing.html')


#Corporate Views
@login_required()
def corporate_login_landing_page(request): ##Note techincally this also routes to another landing page if the user has only one business and has already created it
    listed_user_businesses = user_businesses(request)
    if not listed_user_businesses:
        return render(request=request, template_name='main/corporate_login_no_business_landing.html')
    else:
        if listed_user_businesses.count() > 1:
            return render(request=request, template_name='main/corporate_login_landing.html',context={'listed_user_businesses' : listed_user_businesses, 'business_id': business_id})
        else:
            business_id = listed_user_businesses.values_list('id',flat=True)[0]
            return redirect("corporate_dashboard",business_id=business_id)

#Employee Views
@login_required()
def login_landing_page(request):
    if is_corporate(request):
        print("corporate")
        return redirect('corporate_login_landing_page')
    else:
        print("not corporate")
        return render(request=request, template_name='main/login_landing_page.html')


#Login, Logout, Register
#Register
def register_question(request):
	return render (request=request, template_name="main/register_question.html")

#Employee using the register on the site
def employee_check(request):
    if request.method == "POST":
        form = EmployeeCheck(request.POST)
        invite_code = request.POST.get("invite_code")
        invite_object = Invited_Employees.objects.filter(invite_code=invite_code).first()
        print(type(invite_object))
        if invite_object == None:
            print("not found")
            messages.error(request, "Invite code not found.")
            return render(request=request, template_name="main/employee_check.html", context={"form": form})
        else:
            print("found")
            if invite_object.accepted == True:
                print("This invite code has already been accepted")
                messages.error(request, "Invite code already used.")
            else:
                business_id = invite_object.pk
                return HttpResponseRedirect(reverse("register_from_email", args=[business_id,invite_code]))
        
    return render (request=request, template_name="main/employee_check.html", context={"form": EmployeeCheck()})

#Handling the link sent to an employee
def register_from_email(request,invite_id,invite_code):
    invite_object = Invited_Employees.objects.get(pk=invite_id)
    acceptance_status = getattr(invite_object,"accepted")
    actual_invite_code = getattr(invite_object,"invite_code")
    invited_email = getattr(invite_object,"invited_email")
    if acceptance_status == False and str(actual_invite_code) == str(invite_code): ##Checking if the invite code is correct and they have not accepted yet
        if request.method == "POST":
            form = UserFormFromEmail(request.POST)
            if form.is_valid():
                instance = form.save(commit=False)
                instance.email = invited_email
                user = form.save()
                login(request, user)
                invite_object.accepted = True
                invite_object.save()
                messages.success(request, "Registration successful." )
                return redirect(login_landing_page)
            messages.error(request, "Unsuccessful registration. Invalid information.")
        form = UserFormFromEmail()
        return render(request, template_name="main/register_from_email.html",context={"register_form":form})

    return HttpResponseNotFound("access_denied")

def register_corporate(request):
    if request.method == "POST":
        form = CorporateUserForm(request.POST)
        if form.is_valid():
            user = form.save()
            user.is_corporate = True
            user.save()
            groups = Group.objects.filter(name='corporate')
            user.groups.add(*groups)
            login(request, user)
            messages.success(request, "Registration successful." )
            return redirect("corporate_login_landing_page")
        else:
            errors = form.errors
            return JsonResponse({'errors': errors}, status=400)
        
    form = CorporateUserForm()
    return render (request=request, template_name="main/corporate_register.html", context={"register_form":form})


#Login
def login_view(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect('home')  # Redirect to the home page after successful login
        else:
            # Handle invalid login
            error_message = "Invalid username or password."
            return render(request, 'home.html', {'error_message': error_message}) 
    return redirect('register_corporate')  # Redirect to home page if accessing the login view directly

#Logout
def logout_request(request):
	logout(request)
	messages.info(request, "You have successfully logged out.") 
	return redirect("landing_page")




#Misc -- Likely Delete or move later
def access_denied(request):
    return render(request=request,template_name="main/access_denied.html")