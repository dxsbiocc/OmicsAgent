# 消息持久化实现文档

## 设计原则

本实现严格遵循以下原则：

1. **Conversation / Message 是一等业务实体**
   - Conversation 和 Message 作为独立的业务实体，拥有完整的 CRUD API
   - 数据库模型设计完整，支持元数据和状态管理

2. **Agent 无状态，PG 有状态**
   - Agent 层（`VisualAgent`）完全无状态，不保存任何会话信息
   - 所有状态存储在 PostgreSQL 数据库中
   - Agent 只读取历史，不写入历史

3. **流式生成 ≠ 流式写库**
   - 用户消息：在 Agent 理解后立即保存（不是发送前）
   - Agent 消息：流式生成，但在流式完成后一次性保存（不是每个 chunk 都保存）
   - 前端永远不直接写数据库

4. **前端永远不直写数据库**
   - 所有数据库操作通过后端 API 完成
   - 前端只负责 UI 展示和用户交互

5. **LangChain 只读历史，不写历史**
   - Agent 通过 `MessageService.format_messages_for_agent()` 从数据库读取历史
   - Agent 不直接操作数据库，所有写入由 Orchestration 层完成

## 架构设计

```
┌─────────────┐
│   Frontend  │  (UI only, no agent logic)
└──────┬──────┘
       │ HTTP/SSE
       ▼
┌─────────────────┐
│  FastAPI API    │  (Chat & Conversation endpoints)
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│ Chat Orchestration  │  (Coordinates flow, saves messages)
└────────┬────────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌─────────┐ ┌──────────────┐
│  Agent  │ │  PostgreSQL  │
│(Stateless│ │  (Stateful) │
└─────────┘ └──────────────┘
```

## 数据流

### 用户发送消息流程

1. **前端发送请求**
   ```typescript
   POST /api/v1/chat/stream
   {
     "message": "用户消息",
     "conversation_id": 123  // 可选，不提供则创建新对话
   }
   ```

2. **Orchestration 层处理**
   - 获取或创建 Conversation
   - 从数据库读取历史消息（Agent 只读）
   - 调用 Agent 处理消息（Agent 无状态）

3. **保存用户消息**
   - **时机**：Agent 理解用户消息后（`process_message` 返回后）
   - **位置**：`ChatOrchestrator.process_stream()` 中
   - **代码**：
     ```python
     # Step 4: Save user message AFTER understanding (not before)
     await MessageService.create_message(
         db=db,
         conversation_id=conversation.id,
         role="user",
         content=user_message,
     )
     ```

4. **生成 Agent 响应**
   - Agent 流式生成响应
   - 创建 Agent 消息占位符（`is_complete=False`）

5. **保存 Agent 消息**
   - **时机**：流式生成完成后（所有 chunks 发送完毕）
   - **位置**：`ChatOrchestrator.process_stream()` 末尾
   - **代码**：
     ```python
     # Step 8: Update assistant message as complete AFTER streaming finishes
     # This is the key: streaming generation ≠ streaming database writes
     if assistant_message_id:
         await MessageService.update_message(
             db=db,
             message_id=assistant_message_id,
             metadata=final_metadata,
             is_complete=True,  # Mark as complete
         )
     ```

## 数据库模型

### Conversation 模型

```python
class Conversation(Base):
    id: int
    user_id: int
    title: str | None
    is_active: bool
    metadata: dict | None
    created_at: datetime
    updated_at: datetime
    messages: List[Message]  # Relationship
```

### Message 模型

```python
class Message(Base):
    id: int
    conversation_id: int
    role: str  # 'user' or 'assistant'
    content: str
    metadata: dict | None  # Stores visualization results, analysis, etc.
    is_complete: bool  # True when message is fully generated
    created_at: datetime
    updated_at: datetime
```

## API 端点

### Chat API

- `POST /api/v1/chat` - 同步聊天（非流式）
- `POST /api/v1/chat/stream` - 流式聊天（SSE）
- `GET /api/v1/chat/tools` - 获取可用工具列表

### Conversation API

- `POST /api/v1/conversations` - 创建对话
- `GET /api/v1/conversations` - 列出对话
- `GET /api/v1/conversations/{id}` - 获取对话详情
- `PATCH /api/v1/conversations/{id}` - 更新对话
- `DELETE /api/v1/conversations/{id}` - 删除对话
- `GET /api/v1/conversations/{id}/messages` - 获取对话消息

## 服务层

### ConversationService

- `create_conversation()` - 创建对话
- `get_conversation()` - 获取对话
- `list_conversations()` - 列出对话
- `update_conversation()` - 更新对话
- `delete_conversation()` - 删除对话
- `get_or_create_conversation()` - 获取或创建对话

### MessageService

- `create_message()` - 创建消息
- `update_message()` - 更新消息（用于流式更新）
- `get_conversation_messages()` - 获取对话消息
- `format_messages_for_agent()` - 格式化消息供 Agent 使用（只读）

## 关键实现细节

### 1. 消息保存时机

**用户消息**：
- 在 Agent 理解后保存
- 不在发送前保存（因为可能被拒绝或需要更多信息）

**Agent 消息**：
- 创建占位符（`is_complete=False`）
- 流式生成过程中不写库
- 流式完成后一次性更新（`is_complete=True`）

### 2. 历史消息读取

Agent 通过 `MessageService.format_messages_for_agent()` 从数据库读取历史：

```python
conversation_history = await MessageService.format_messages_for_agent(
    db, conversation.id
)
```

返回格式：
```python
[
    {"role": "user", "content": "..."},
    {"role": "assistant", "content": "..."},
    ...
]
```

### 3. 元数据存储

Agent 消息的元数据存储在 `Message.metadata` 字段中：

```python
{
    "needs_info": bool,
    "missing_params": List[str],
    "suggestions": List[str],
    "visual_request": dict | None,
    "visualization": {
        "success": bool,
        "image_url": str,
        "pdf_url": str,
        "data_url": str,
    },
    "analysis": {
        "analysis": str,
        "insights": List[str],
        "recommendations": List[str],
        "possible_analyses": List[str],
    }
}
```

## 数据库迁移

运行以下命令创建数据库表：

```bash
cd backend
alembic upgrade head
```

迁移文件：`g3b4c5d6e7f8_add_conversation_and_message_tables.py`

## 前端集成

前端已更新以支持 `conversation_id`：

```typescript
// 发送消息时传递 conversation_id
await sendChatMessageStream(
  message,
  conversationId,  // 不再是 conversationHistory
  onChunk
);
```

## 测试建议

1. **创建新对话**
   - 不传递 `conversation_id`，验证新对话被创建
   - 验证用户消息在理解后保存
   - 验证 Agent 消息在流式完成后保存

2. **继续现有对话**
   - 传递 `conversation_id`，验证历史消息被正确读取
   - 验证新消息追加到正确对话

3. **流式生成**
   - 验证流式过程中不写库
   - 验证流式完成后消息被保存
   - 验证 `is_complete` 标志正确更新

4. **错误处理**
   - 验证错误消息被正确保存
   - 验证 `is_complete` 在错误情况下也被设置为 `True`

## 未来扩展

1. **对话标题自动生成**：基于第一条消息生成标题
2. **消息搜索**：在对话中搜索消息内容
3. **对话导出**：导出对话为 Markdown 或 PDF
4. **消息编辑**：允许用户编辑已发送的消息
5. **消息删除**：软删除消息

