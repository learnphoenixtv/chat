defmodule Chat.Message do
  use Chat.Web, :model

  schema "messages" do
    field :topic, :string
    field :user, :string
    field :body, :string

    timestamps()
  end

  @doc """
  Builds a changeset based on the `struct` and `params`.
  """
  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, [:topic, :user, :body])
    |> validate_required([:topic, :user, :body])
  end

  @doc """
  Returns recent messages in a given topic.
  """
  def recent(topic) do
    from m in __MODULE__,
      where: m.topic == ^topic,
      order_by: [asc: :inserted_at],
      limit: 50
  end
end
