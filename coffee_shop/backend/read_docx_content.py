import zipfile
import xml.etree.ElementTree as ET
import os

# Путь к файлу (с учетом кириллицы и пробелов)
docx_path = r"c:\Users\MI\OneDrive\Рабочий стол\Желтов Н.В. ИСдо-47 Курсовая робота.docx"

def get_docx_text(path):
    """Извлекает текст из DOCX используя стандартные библиотеки"""
    if not os.path.exists(path):
        return f"Ошибка: Файл не найден по пути {path}"
    
    try:
        with zipfile.ZipFile(path) as docx:
            # Читаем содержимое основного XML документа
            xml_content = docx.read('word/document.xml')
            tree = ET.fromstring(xml_content)
            
            # Пространство имен WordML
            ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
            
            paragraphs = []
            for p in tree.findall('.//w:p', ns):
                texts = [node.text for node in p.findall('.//w:t', ns) if node.text]
                if texts:
                    paragraphs.append("".join(texts))
            
            return "\n\n".join(paragraphs)
            
    except Exception as e:
        return f"Произошла ошибка при разборе файла: {str(e)}"

if __name__ == "__main__":
    content = get_docx_text(docx_path)
    # Выводим в UTF-8 для корректного отображения в терминале
    print(content)
