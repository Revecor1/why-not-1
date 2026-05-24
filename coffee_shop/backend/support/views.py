from django.shortcuts import render, redirect
from django.contrib import messages
from .models import SupportMessage

def contact_view(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        email = request.POST.get('email')
        text = request.POST.get('message')
        attachment = request.FILES.get('attachment')
        
        # Проверка размера (для Рисунка 25!)
        if attachment and attachment.size > 5 * 1024 * 1024:
            messages.error(request, 'Ошибка: Файл слишком большой. Максимум 5 МБ.')
            return redirect('contact')
        
        # Сохраняем в базу согласно вашей модели (user, subject, message, file)
        SupportMessage.objects.create(
            user=request.user if request.user.is_authenticated else None,
            subject=f"Обращение от {name}",
            message=f"Email: {email}\n\n{text}",
            file=attachment
        )
        
        # Генерируем уведомление
        messages.success(request, 'Ваше сообщение успешно отправлено! Мы ответим вам в ближайшее время.')
        return redirect('contact')
        
    return render(request, 'support/contact.html')
