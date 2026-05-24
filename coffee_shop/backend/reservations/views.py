from django.shortcuts import render, redirect
from django.contrib import messages
from .models import Reservation

def book_view(request):
    if request.method == 'POST':
        date = request.POST.get('date')
        time = request.POST.get('time')
        people = request.POST.get('people')
        
        Reservation.objects.create(
            user=request.user if request.user.is_authenticated else None,
            date=date,
            time=time,
            number_of_people=people
        )
        
        messages.success(request, f'Столик успешно забронирован на {date} в {time}!')
        return redirect('book')
        
    return render(request, 'reservations/book.html')
