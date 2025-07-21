import axios from "axios";

export default async function handler(req, res) {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const username = req.query.username?.trim(); 


  if (!GITHUB_TOKEN || !username) {
    return res.status(400).json({ error: "Missing GitHub token or username" });
  }

  const query = `
    query($userName: String!) {
      user(login: $userName) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await axios.post(
      "https://api.github.com/graphql",
      {
        query,
        variables: { userName: username },
      },
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = response.data;

    // Check for GraphQL errors
    if (data.errors) {
      console.error("GitHub GraphQL errors:", data.errors);
      return res.status(500).json({ error: data.errors });
    }

    const contributions = data.data.user?.contributionsCollection?.contributionCalendar;

    if (!contributions) {
      return res.status(404).json({ error: "User or contributions not found" });
    }

    res.status(200).json(contributions);
  } catch (error) {
    console.error("GitHub API error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch GitHub contributions" });
  }
}
