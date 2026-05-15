
import google.generativeai as genai
import os

API_KEY = "AIzaSyCmOKSELF5XKcU1wESXz130Y0Slh750j28"
genai.configure(api_key=API_KEY)

try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(m.name)
except Exception as e:
    print("Error:", e)
