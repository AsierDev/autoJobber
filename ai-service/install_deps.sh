#!/bin/bash

# Activar el entorno virtual
source venv/bin/activate

# Actualizar pip, wheel y setuptools
pip install --upgrade pip wheel setuptools

# Instalar todas las dependencias excepto textract
grep -v 'textract' requirements.txt > requirements_without_textract.txt
pip install -r requirements_without_textract.txt

# Usar una versión específica de pip para instalar textract
pip install pip==23.3.2
pip install textract
pip install --upgrade pip

echo "Instalación completada."