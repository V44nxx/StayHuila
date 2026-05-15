
import google.generativeai as genai
import os

API_KEY = "AIzaSyCmOKSELF5XKcU1wESXz130Y0Slh750j28"
genai.configure(api_key=API_KEY)

print("Intentando con gemini-2.0-flash...")
try:
    model = genai.GenerativeModel('gemini-2.0-flash')
    response = model.generate_content("Hola")
    print("Respuesta gemini-2.0-flash:", response.text)
except Exception as e:
    print("Error gemini-2.0-flash:", e)

print("\nIntentando con gemini-flash-latest...")
try:
    model = genai.GenerativeModel('gemini-flash-latest')
    response = model.generate_content("Hola")
    print("Respuesta gemini-flash-latest:", response.text)
except Exception as e:
    print("Error gemini-flash-latest:", e)
