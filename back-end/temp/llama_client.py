import os
from openai import OpenAI

client = OpenAI(
    api_key="LLM|1472550034096027|6wCMGkTlQPrQwErOKmB6F4rqI6o",
    base_url="https://api.llama.com/compat/v1/",
)

response = client.chat.completions.create(
    model="Llama-4-Maverick-17B-128E-Instruct-FP8",
    messages=[
        {"role": "user", "content": "Hello Llama! Can you give me a quick intro?"},
    ],
)

print(response)
