const NewsAPI = require("newsapi");
const newsapi = new NewsAPI(process.env.API_KEY);
const AWS = require("aws-sdk");

AWS.config.update({ region: "ap-southeast-2" });

const sns = new AWS.SNS();

let publishParams = {
  Message: "",
  Subject: "",
  TopicArn: process.env.SNS_TOPIC,
};

function publishToSNS(publishParam) {
  return new Promise((resolve, reject) => {
    sns.publish(publishParam, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.MessageId);
      }
    });
  });
}

async function newsApiCategory(category) {
  const response = await newsapi.v2.topHeadlines({
      category: category,
      language: "en",
    });
  return response
}

function emailBodyTemplate(response) {
  let emailBody = "";
  response["articles"].forEach((message, index) => {
    emailBody +=
      `Title: ${message.title} \n` +
      `Author: ${message.Author} \n` +
      `Description: ${message.description} \n` +
      `url: ${message.url} \n` +
      "\n";
  });
  return emailBody;
}

exports.lambdaHandler = async (event, context) => {
  try {
    const techNews = await newsApiCategory("technology");
    const businessNews = await newsApiCategory("business");
    const generalNews = await newsApiCategory("general");

    const techNewsEmailBody = emailBodyTemplate(techNews);
    const businessNewsEmailBody = emailBodyTemplate(businessNews);
    const generalNewsEmailBody = emailBodyTemplate(generalNews);

    
    const publishParamTech = { ...publishParams, Message: techNewsEmailBody, Subject: "Tech News"};
    const publishParamBusiness = { ...publishParams, Message: businessNewsEmailBody, Subject: "Business News"};
    const publishParamGeneral = { ...publishParams, Message: generalNewsEmailBody, Subject: "General News"};
    

    const messageIdTech = await publishToSNS(publishParamTech);
    const messageIdBusiness = await publishToSNS(publishParamBusiness);
    const messageIdGeneral = await publishToSNS(publishParamGeneral);

    console.log("Email successfully Sent");
    return {
      Status: 200,
      Message: "Email successfully Sent",
    };
  } catch (err) {
    return err;
  }
};

// exports.lambdaHandler()