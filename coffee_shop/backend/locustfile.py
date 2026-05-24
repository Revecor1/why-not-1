from locust import HttpUser, task, between

class CoffeeUser(HttpUser):
    """
    Глава 5.2: Нагрузочное тестирование.
    Имитирует поведение посетителя сайта.
    """
    wait_time = between(1, 4)

    @task
    def view_home(self):
        """Просмотр главной."""
        self.client.get("/")

    @task
    def view_menu(self):
        """Просмотр меню."""
        self.client.get("/menu/")

    @task
    def view_categories(self):
        """Просмотр категории кофе."""
        self.client.get("/menu/?category=coffee")
