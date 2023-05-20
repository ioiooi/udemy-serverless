import { SES } from "@aws-sdk/client-ses";

const ses = new SES({ region: "eu-central-1" });

async function sendMail(event, context) {
  const params = {
    Source: "pehajew370@asuflex.com",
    Destination: {
      ToAddresses: ["pehajew370@asuflex.com"],
    },
    Message: {
      Body: {
        Text: {
          Data: "Hello from Codingly!",
        },
      },
      Subject: {
        Data: "Test Mail",
      },
    },
  };

  try {
    const result = await ses.sendEmail(params);
    console.log(result);
    return result;
  } catch (error) {
    console.error(error);
  }
}

export const handler = sendMail;
