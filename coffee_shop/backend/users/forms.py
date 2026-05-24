from django import forms
from django.contrib.auth import get_user_model
from django.core.validators import RegexValidator

User = get_user_model()


class RegisterForm(forms.Form):
    username = forms.CharField(
        label='Логин',
        max_length=150,
        widget=forms.TextInput(attrs={'class': 'form-input', 'placeholder': 'Логин'}),
    )
    email = forms.EmailField(
        label='E-mail',
        widget=forms.EmailInput(attrs={'class': 'form-input', 'placeholder': 'Email'}),
    )
    phone_validator = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message="Телефон должен быть в формате: '+999999999'. Допускается до 15 цифр."
    )
    phone = forms.CharField(
        label='Телефон (необязательно)',
        max_length=20, required=False,
        validators=[phone_validator],
        widget=forms.TextInput(attrs={'class': 'form-input', 'placeholder': 'Телефон (например, +79991234567)'}),
    )
    password1 = forms.CharField(
        label='Пароль',
        min_length=6,
        widget=forms.PasswordInput(attrs={'class': 'form-input', 'placeholder': 'От 6 символов'}),
    )
    password2 = forms.CharField(
        label='Подтверждение пароля',
        min_length=6,
        widget=forms.PasswordInput(attrs={'class': 'form-input', 'placeholder': 'Повторите пароль'}),
    )

    def clean_email(self):
        email = self.cleaned_data['email']
        if User.objects.filter(email=email).exists():
            raise forms.ValidationError('Этот email уже зарегистрирован.')
        return email

    def clean_username(self):
        username = self.cleaned_data['username']
        if User.objects.filter(username=username).exists():
            raise forms.ValidationError('Это имя уже занято.')
        return username

    def clean(self):
        cleaned_data = super().clean()
        if cleaned_data.get('password1') != cleaned_data.get('password2'):
            raise forms.ValidationError('Пароли не совпадают.')
        return cleaned_data

    def save(self):
        d = self.cleaned_data
        return User.objects.create_user(
            username=d['username'], email=d['email'],
            password=d['password1'], phone=d.get('phone', ''),
        )


class LoginForm(forms.Form):
    email = forms.EmailField(
        label='E-mail',
        widget=forms.EmailInput(attrs={'class': 'form-input', 'placeholder': 'Ваш Email'}),
    )
    password = forms.CharField(
        label='Пароль',
        widget=forms.PasswordInput(attrs={'class': 'form-input', 'placeholder': 'Ваш пароль'}),
    )


class ProfileUpdateForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ['username', 'phone', 'avatar']
        widgets = {
            'username': forms.TextInput(attrs={'class': 'form-input'}),
            'phone': forms.TextInput(attrs={'class': 'form-input'}),
            'avatar': forms.FileInput(attrs={'class': 'form-input'}),
        }

    def clean_avatar(self):
        avatar = self.cleaned_data.get('avatar', False)
        if avatar:
            if avatar.size > 2 * 1024 * 1024:
                raise forms.ValidationError("Размер файла не должен превышать 2 МБ.")
        return avatar
