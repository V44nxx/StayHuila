# 🌿 StayHuila - Plataforma Turística de Hospedajes y Experiencias

![Python](https://img.shields.io/badge/Python-3.10%2B-blue?logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Framework-Flask-black?logo=flask&logoColor=white)
![MySQL](https://img.shields.io/badge/Database-MySQL-00758F?logo=mysql&logoColor=white)
![Google Gemini](https://img.shields.io/badge/AI-Google%20Gemini%20OCR-4285F4?logo=google&logoColor=white)
![License](https://img.shields.io/badge/License-Proprietary-red)

**StayHuila** es una plataforma web moderna e interactiva diseñada para promover el turismo sostenible y vivencial en el departamento del Huila, Colombia (San Agustín, Desierto de la Tatacoa, Pitalito, Villavieja, entre otros). Permite a los viajeros reservar hospedajes ecológicos, glampings y experiencias culturales, mientras facilita a los anfitriones locales la gestión de sus publicaciones y reservas.

---

## ✨ Características Principales

- 🏡 **Reserva de Hospedajes y Experiencias**: Búsqueda avanzada con filtros por municipio, categoría, precio y servicios.
- 💳 **Pagos Seguros con Nequi Negocios**: Integración fluida para procesar pagos y comprobantes.
- 🤖 **Verificación Inteligente con IA (Google Gemini OCR)**: Escaneo automático de comprobantes de pago e identificación de datos de transacción.
- 🌍 **Soporte Multilingüe (i18n)**: Traducción dinámica (`/api/translate`) en español, inglés, portugués, francés e italiano.
- 🎮 **Gamificación y Puntos**: Sistema de recompensas y puntos para viajeros frecuentes.
- 🛡️ **Seguridad Avanzada**:
  - Hash seguro de contraseñas con `Flask-Bcrypt`.
  - Gestión centralizada de secretos con variables de entorno (`.env`).
  - Protección de repositorio Git con escaneo de secretos y exclusión de archivos sensibles.
- ⚡ **Optimización de Alto Rendimiento**:
  - Compresión dinámica gzip/brotli para activos web.
  - Conversión automática de imágenes pesadas a formato `.webp`.

---

## 🛠️ Tecnologías Utilizadas

- **Backend**: Python 3, Flask, PyMySQL, Flask-Bcrypt, Flask-Login.
- **Frontend**: HTML5, CSS3 personalizado (Glassmorphism & Dark/Light mode tokens), JavaScript ES6+.
- **Base de Datos**: MySQL / MariaDB (XAMPP).
- **Integraciones**: Google Generative AI (Gemini), Nequi / Wompi.

---

## 🚀 Requisitos Previos

1. **Python 3.10** o superior.
2. **XAMPP / MySQL Server** (puerto predeterminado: 3306).
3. Clave API de **Google Gemini** (opcional para OCR/traducción IA).

---

## ⚙️ Instalación y Configuración Local

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/StayHuila.git
cd StayHuila
```

### 2. Crear entorno virtual e instalar dependencias
```bash
python -m venv venv
# En Windows (PowerShell):
.\venv\Scripts\activate
# En Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
```

### 3. Configurar variables de entorno
Copia el archivo de plantilla `.env.example` a `.env`:
```bash
cp .env.example .env
```
Edita `.env` y configura tus credenciales locales:
```env
SECRET_KEY=tu_clave_secreta_super_segura
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=StayHuila
GEMINI_API_KEY=tu_clave_api_gemini
```

> ⚠️ **Importante**: Nunca subas el archivo `.env` al repositorio Git.

### 4. Inicializar la Base de Datos
Importa el esquema y datos iniciales en MySQL:
```bash
# Vía MySQL CLI o phpMyAdmin importando database/stayhuila.sql
mysql -u root -p StayHuila < database/stayhuila.sql
```

### 5. Ejecutar la Aplicación
```bash
python app.py
```
Accede en tu navegador a: `http://localhost:5000`

---

## 🔒 Seguridad y Buenas Prácticas Git

Este proyecto incluye reglas estrictas para la protección de datos:
- `.gitignore`: Excluye `.env`, certificados, bases de datos locales, logs y medios subidos por usuarios.
- `.gitleaks.toml`: Reglas para escaneo continuo de secretos antes de hacer commit.
- `.env.example`: Plantilla pública sin secretos expuestos.

---

## 📄 Licencia

Derechos reservados © 2026 StayHuila. Todos los derechos reservados.
