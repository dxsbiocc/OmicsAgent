from langchain.chat_models import init_chat_model
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv
import os

load_dotenv()

api_key = os.getenv("SILICONFLOW_API_KEY")
model_name = "deepseek-ai/DeepSeek-V3.1"
base_url = "https://api.siliconflow.cn/v1/"

model = init_chat_model(
    model=model_name,
    model_provider="openai",
    temperature=0.5,
    api_key=api_key,
    base_url=base_url,
)

prompt = ChatPromptTemplate.from_template("tell me a short joke about {topic}")
output_parser = StrOutputParser()

chain = prompt | model | output_parser

print(chain.invoke({"topic": "ice cream"}))