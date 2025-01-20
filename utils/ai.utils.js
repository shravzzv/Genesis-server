const OpenAI = require('openai')

const token = process.env.GITHUB_TOKEN
const endpoint = 'https://models.inference.ai.azure.com'
const modelName = 'gpt-4o-mini'

/**
 * Generates a list of todos based on the provided query using OpenAI's chat completion API.
 *
 * @param {string} query - The input query describing the goals to be converted into todos.
 * @returns {Promise<string[]>} - A promise that resolves to an array of todos.
 * @throws {Error} - Throws an error if the API request fails.
 */
const chat = async (query) => {
  try {
    const client = new OpenAI({ baseURL: endpoint, apiKey: token })

    const response = await client.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a helpful assistant. Your job is to convert goals into simple, specific todos. You can generate upto 5 todos. I want only the todos and nothing else. Don't use any list. Just plain text where each todo is separated by using a new line.`,
        },
        {
          role: 'user',
          content: query,
        },
      ],
      temperature: 1.0,
      top_p: 1.0,
      max_tokens: 1000,
      model: modelName,
    })

    return response.choices[0].message.content
      .split('\n')
      .map((todo) => todo.trim())
  } catch (error) {
    console.error(error)
  }
}

const getTodos = async (query) => {
  try {
    const todos = await chat(query)
    return todos
  } catch (error) {
    console.error(error)
    return []
  }
}

module.exports = { getTodos }
