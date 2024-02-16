from django.shortcuts import render
from django.http import HttpResponse, Http404


# Create your views here.
def index(request):
    return render(request, "SPA/index.html")

def section(request, num):
    if num == 1:
        return render(request, "users/register.html") 
        #return HttpResponse(texts[num-1])
    if num == 2:
        return render(request, "users/login.html")
    if num == 3:
        return render(request, "users/profile.html")
    if num == 4:
        return render(request, "users/editProfile.html")
    else:
        raise Http404("No such section")


