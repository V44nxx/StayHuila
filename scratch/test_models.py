
import google.generativeai as genai
import os

API_KEY = "AIzaSyCmOKSELF5XKcU1wESXz130Y0Slh750j28"
genai.configure(api_key=API_KEY)

print("Intentando con gemini-pro...")
try:
    model = genai.GenerativeModel('gemini-pro')
    response = model.generate_content("Hola")
    print("Respuesta gemini-pro:", response.text)
except Exception as e:
    print("Error gemini-pro:", e)

print("\nIntentando con gemini-1.5-flash...")
try:
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content("Hola")
    print("Respuesta gemini-1.5-flash:", response.text)
except Exception as e:
    print("Error gemini-1.5-flash:", e)
