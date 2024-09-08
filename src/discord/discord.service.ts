interface DiscordData {
  discordWh: string;
  commitData: any;
}

export async function addBountyToDiscord({
  commitData,
  discordWh,
}: DiscordData) {
  // IST is UTC + 5:30, so adding the offset in milliseconds
  const date = new Date(commitData.pushedAt * 1000);
  const istOffset = 5.5 * 60 * 60 * 1000; // 5 hours and 30 minutes in milliseconds
  const istTime = new Date(date.getTime() + istOffset);
  const body = {
    content: "Hello @everyone",
    tts: false,
    color: "blue",
    avatar_url:
      "https://github.githubassets.com/assets/GitHub-Mark-ea2971cee799.png",
    embeds: [
      {
        title: "Main Branch Updated",
        description: `\`${commitData.commit.id}\` ${commitData.commit.message}`, // Commit message
        url: commitData.commit.url, // Link to the commit
        color: 0x0099ff, // Embed color (blue)
        fields: [
          {
            name: "",
            value:
              `**${commitData.commit.author.name}** (@${commitData.commit.author.username}) at ` +
              istTime.toLocaleString(),
          },
        ],
        thumbnail: {
          url: commitData.avatar_url, // Avatar of the author
        },
      },
    ],
  };

  try {
    const res = await fetch(`${discordWh}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const response = (await res.json()) as any;
    return response;
  } catch (error) {
    return error;
  }
}
