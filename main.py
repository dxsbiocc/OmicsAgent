from langchain.chat_models import init_chat_model
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from typing import Optional
from typing_extensions import Annotated, TypedDict
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


class Joke(BaseModel):

    setup: str = Field(description="The setup of the joke")
    punchline: str = Field(description="The punchline of the joke")
    rating: Optional[int] = Field(description="The rating of the joke, from 1 to 10", ge=1, le=10)

class JokeDict(TypedDict):
    setup: Annotated[str, ..., "The setup of the joke"]
    punchline: Annotated[str, ..., "The punchline of the joke"]
    rating: Annotated[Optional[int], ..., "The rating of the joke, from 1 to 10"]


prompt = ChatPromptTemplate.from_template("tell me a short joke about {topic}")

structured_model = model.with_structured_output(JokeDict)

print(structured_model.invoke("Tell me a joke about cats"))