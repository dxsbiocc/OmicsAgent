from langchain.llms import OpenAI
from langchain.chat_models import ChatOpenAI

llm = OpenAI()
chat_model = ChatOpenAI()

print(llm.predict("hi!"))
print(chat_model.predict("Hi!"))