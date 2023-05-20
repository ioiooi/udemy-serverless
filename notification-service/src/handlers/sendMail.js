import { SES } from "@aws-sdk/client-ses";

const ses = new SES({ region: "eu-central-1" });

async function sendMail(event, context) {
  console.log(event);

  const record = event.Records[0];
  const email = JSON.parse(record.body);
  const { subject, body, recipient } = email;

  const params = {
    Source: "pehajew370@asuflex.com",
    Destination: {
      ToAddresses: [recipient],
    },
    Message: {
      Body: {
        Text: {
          Data: body,
        },
      },
      Subject: {
        Data: subject,
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
