import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from typing import Annotated, TypedDict
from langgraph.graph.message import add_messages
from langchain_core.messages import SystemMessage, AIMessage, HumanMessage
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import InMemorySaver
from tavily import TavilyClient

load_dotenv()


def pretty_print(message):
    """格式化打印消息内容"""
    if hasattr(message, "content"):
        content = message.content
        if isinstance(content, str):
            return content
        elif isinstance(content, list):
            # 处理多部分内容
            text_parts = []
            for item in content:
                if isinstance(item, dict):
                    if item.get("type") == "text":
                        text_parts.append(item.get("text", ""))
                    elif item.get("type") == "tool_use":
                        text_parts.append(
                            f"\n[工具调用: {item.get('name', 'unknown')}]\n"
                        )
                else:
                    text_parts.append(str(item))
            return "".join(text_parts)
        else:
            return str(content)
    return str(message)


llm = ChatOpenAI(
    model="deepseek-chat",
    temperature=0.7,
    api_key=os.getenv("DEEPSEEK_API_KEY"),
    base_url=os.getenv("DEEPSEEK_BASE_URL"),
    max_tokens=8192,
)
# 初始化Tavily客户端
tavily_client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))


class SearchState(TypedDict):
    messages: Annotated[list, add_messages]
    user_query: str  # 经过LLM理解后的用户需求总结
    search_query: str  # 优化后用于Tavily API的搜索查询
    search_results: str  # Tavily搜索返回的结果
    final_answer: str  # 最终生成的答案
    step: str  # 标记当前步骤


def understand_query_node(state: SearchState) -> dict:
    user_message = state["messages"][-1].content
    understand_prompt = f"""分析用户的查询："{user_message}"
请完成两个任务：
1. 简洁总结用户想要了解什么
2. 生成最适合搜索引擎的关键词（中英文均可，要精准）

格式：
理解：[用户需求总结]
搜索词：[最佳搜索关键词]"""
    response = llm.invoke([SystemMessage(content=understand_prompt)])
    response_text = response.content

    # 解析LLM的输出，提取搜索关键词
    search_query = user_message  # 默认使用原始查询
    if "搜索词：" in response_text:
        search_query = response_text.split("搜索词：")[1].strip()

    return {
        "user_query": response_text,
        "search_query": search_query,
        "step": "understood",
        "messages": [AIMessage(content=f"我将为您搜索：{search_query}")],
    }


def tavily_search_node(state: SearchState) -> dict:
    search_query = state["search_query"]
    try:
        print(f"🔍 正在搜索: {search_query}")
        response = tavily_client.search(
            query=search_query, search_depth="basic", max_results=5, include_answer=True
        )
        # ... (处理和格式化搜索结果) ...
        search_results = response.content
        return {
            "search_results": search_results,
            "step": "searched",
            "messages": [AIMessage(content="✅ 搜索完成！正在整理答案...")],
        }
    except Exception as e:
        # ... (处理错误) ...
        return {
            "search_results": f"搜索失败：{e}",
            "step": "search_failed",
            "messages": [AIMessage(content="❌ 搜索遇到问题...")],
        }


def generate_answer_node(state: SearchState) -> dict:
    """步骤3：基于搜索结果生成最终答案（流式输出）"""
    if state["step"] == "searched":
        # 如果搜索失败，执行回退策略，基于LLM自身知识回答
        fallback_prompt = f"搜索API暂时不可用，请基于您的知识回答用户的问题：\n用户问题：{state['user_query']}"
        messages = [SystemMessage(content=fallback_prompt)]
    else:
        # 搜索成功，基于搜索结果生成答案
        answer_prompt = f"""基于以下搜索结果为用户提供完整、准确的答案：
用户问题：{state['user_query']}
搜索结果：\n{state['search_results']}
请综合搜索结果，提供准确、有用的回答..."""
        messages = [SystemMessage(content=answer_prompt)]

    # 使用流式输出，实时打印并累积内容
    full_content = ""
    print()  # 换行，准备输出答案
    for chunk in llm.stream(messages):
        if hasattr(chunk, "content") and chunk.content:
            content = chunk.content
            full_content += content
            # 实时打印流式输出
            print(content, end="", flush=True)

    return {
        "final_answer": full_content,
        "step": "completed",
        "messages": [AIMessage(content=full_content)],
    }


def create_search_assistant():
    workflow = StateGraph(SearchState)

    # 添加结点
    workflow.add_node("understand", understand_query_node)
    workflow.add_node("search", tavily_search_node)
    workflow.add_node("answer", generate_answer_node)

    # 添加边
    workflow.add_edge(START, "understand")
    workflow.add_edge("understand", "search")
    workflow.add_edge("search", "answer")
    workflow.add_edge("answer", END)

    memory = InMemorySaver()
    app = workflow.compile(checkpointer=memory)
    return app


if __name__ == "__main__":
    assistant = create_search_assistant()
    user_query = "这周六我要去南京，天气怎么样？有合适的景点吗"
    # Checkpointer requires thread_id in config
    config = {"configurable": {"thread_id": "test-thread-1"}}

    print("=" * 60)
    print(f"用户问题: {user_query}")
    print("=" * 60)
    print("\n开始处理...\n")

    # 流式输出 - 使用 "values" 模式获取状态更新
    result = assistant.stream(
        {"messages": [HumanMessage(content=user_query)]},
        config=config,
        stream_mode="values",
    )

    last_step = None
    for s in result:
        # 显示步骤变化
        if "step" in s and s["step"] != last_step:
            step = s["step"]
            if step == "understood":
                print("\n📝 [步骤 1/3] 理解用户需求...")
            elif step == "searched":
                print("\n🔍 [步骤 2/3] 搜索信息...")
            elif step == "completed":
                print("\n💬 [步骤 3/3] 生成答案...")
            last_step = step

        # 注意：LLM 的流式输出已经在 generate_answer_node 中实时打印了
        # 这里只需要等待流完成即可

    print("\n\n" + "=" * 60)
    print("✅ 处理完成！")
    print("=" * 60)
    print()
