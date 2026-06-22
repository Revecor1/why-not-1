"""Раздача статического фронтенда из корня проекта (только для локальной разработки)."""
from pathlib import Path

from django.conf import settings
from django.http import FileResponse, Http404


BASE_DIR = Path(settings.BASE_DIR).resolve()
ALLOWED_ROOTS = {
    (BASE_DIR / 'js').resolve(),
    (BASE_DIR / 'css').resolve(),
}
ROOT_ALLOWED_EXTENSIONS = {
    '.html', '.ico', '.png', '.jpg', '.jpeg', '.svg', '.webp', '.json', '.txt',
}


def _is_allowed(path: Path) -> bool:
    resolved = path.resolve()
    for root in ALLOWED_ROOTS:
        try:
            resolved.relative_to(root)
            return True
        except ValueError:
            continue
    return False


def serve_frontend(request, path=''):
    if path in ('', '/'):
        path = 'index.html'

    # Чистые URL: /menu -> menu.html
    if '.' not in Path(path).name:
        html_candidate = BASE_DIR / f'{path}.html'
        if html_candidate.is_file():
            path = f'{path}.html'

    file_path = (BASE_DIR / path).resolve()

    if not file_path.is_file():
        raise Http404('Страница не найдена')

    if file_path.parent == BASE_DIR:
        if file_path.suffix.lower() not in ROOT_ALLOWED_EXTENSIONS:
            raise Http404('Страница не найдена')
    elif not _is_allowed(file_path):
        raise Http404('Страница не найдена')

    return FileResponse(open(file_path, 'rb'))