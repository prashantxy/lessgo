import axios from "axios";
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const username = (req.query.username as string | undefined)?.trim();


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
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorData = error instanceof Error && 'response' in error ? (error as any).response?.data : null;
    console.error("GitHub API error:", errorData || errorMessage);
    res.status(500).json({ error: "Failed to fetch GitHub contributions" });
  }
}
