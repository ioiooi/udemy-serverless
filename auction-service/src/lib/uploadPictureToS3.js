import { Upload } from "@aws-sdk/lib-storage";
import { S3Client } from "@aws-sdk/client-s3";

const client = new S3Client();

export async function uploadPictureToS3(key, body) {
  const params = {
    Bucket: process.env.AUCTIONS_BUCKET_NAME,
    Key: key,
    Body: body,
    ContentEncoding: "base64",
    ContentType: "image/jpeg",
  };

  const result = await new Upload({
    client,
    params,
  }).done();

  return result.Location;
}
