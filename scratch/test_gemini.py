
import google.generativeai as genai
import os

API_KEY = "AIzaSyCmOKSELF5XKcU1wESXz130Y0Slh750j28"
genai.configure(api_key=API_KEY)

try:
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content("Hola, dime hola.")
    print("Respuesta:", response.text)
except Exception as e:
    print("Error:", e)
