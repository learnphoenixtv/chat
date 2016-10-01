defmodule Chat.MessageView do
  use Chat.Web, :view

  def render("index.json", %{messages: messages}) do
    %{data: render_many(messages, __MODULE__, "message.json")}
  end

  def render("message.json", %{message: message}) do
    %{
      topic: message.topic,
      user: message.user,
      body: message.body,
      timestamp: Ecto.DateTime.to_iso8601(message.inserted_at)
    }
  end
end
