export async function uploadAuctionPicutre(event) {
  return {
    statusCode: 200,
    body: JSON.stringify({}),
  };
}

export const handler = uploadAuctionPicutre;
