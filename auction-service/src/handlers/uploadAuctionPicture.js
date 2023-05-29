import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import createError from "http-errors";
import validator from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile";
import inputOutputLogger from "@middy/input-output-logger";
import { getAuctionById } from "./getAuction";
import { uploadPictureToS3 } from "../lib/uploadPictureToS3";
import { setAuctionPictureUrl } from "../lib/setAuctionPictureUrl";
import uploadAuctionPictureSchema from "../lib/schemas/uploadAuctionPictureSchema";

export async function uploadAuctionPicutre(event) {
  const { id } = event.pathParameters;
  const { email } = event.requestContext.authorizer.lambda;
  const auction = await getAuctionById(id);

  if (email !== auction.seller) {
    throw new createError.Forbidden("You are not the seller of this auction!");
  }

  const base64 = event.body.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64, "base64");

  try {
    const pictureUrl = await uploadPictureToS3(auction.id + ".jpg", buffer);
    const updatedAuction = await setAuctionPictureUrl(auction.id, pictureUrl);

    return {
      statusCode: 200,
      body: JSON.stringify(updatedAuction.Attributes),
    };
  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }
}

export const handler = middy(uploadAuctionPicutre).use([
  httpErrorHandler(),
  validator({
    eventSchema: transpileSchema(uploadAuctionPictureSchema),
  }),
  inputOutputLogger(),
]);
