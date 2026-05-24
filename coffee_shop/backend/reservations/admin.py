from django.contrib import admin
from .models import Reservation

@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "date", "time", "status", "number_of_people")
    list_filter = ("status", "date")
    search_fields = ("user__email", "comment")
    ordering = ("-date", "-time")
