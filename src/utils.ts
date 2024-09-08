export function hexToBytes(hex: string) {
  let len = hex.length / 2;
  let bytes = new Uint8Array(len);

  let index = 0;
  for (let i = 0; i < hex.length; i += 2) {
    let c = hex.slice(i, i + 2);
    let b = parseInt(c, 16);
    bytes[index] = b;
    index += 1;
  }

  return bytes;
}

// Function to extract relevant information
export function extractCommitData(payload: any) {
  // Ensure the branch is 'main'
  if (payload.ref === "refs/heads/main") {
    // Extract relevant data
    const commitId = payload.head_commit.id.slice(0, 7);
    const commitMessage = payload.head_commit.message;
    const commitUrl = payload.head_commit.url;
    const authorName = payload.head_commit.author.name;
    const authorUsername = payload.head_commit.author.username;
    const repositoryName = payload.repository.full_name;
    const pushedAt = payload.repository.pushed_at;

    // Format the extracted data into a payload
    const formattedPayload = {
      branch: "main",
      repository: repositoryName,
      commit: {
        id: commitId,
        message: commitMessage,
        url: commitUrl,
        author: {
          name: authorName,
          username: authorUsername,
        },
      },
      avatar_url: payload.sender.avatar_url,
      pushedAt,
    };

    return formattedPayload;
  } else {
    return null; // Not the 'main' branch, return null or handle as needed
  }
}
