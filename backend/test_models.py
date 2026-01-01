from groq import Groq
from dotenv import load_dotenv
import os

load_dotenv()  # load .env

client = Groq(api_key=os.getenv("GROQ_API_KEY"))  # Correct key name

models = client.models.list()

for m in models.data:
    print(m.id)
