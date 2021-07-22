const AWS = require("aws-sdk");
var cfsign = require("aws-cloudfront-sign");
const fs = require("fs/promises");
require("dotenv/config");

const filePath = "C:\\Users\\sydoa\\OneDrive\\Imagens"; // path
const fileName = "min.jpg"; // filename in path

const signingParams = {
  keypairId: process.env.AWS_CLOUD_FRONT_PUBLIC_KEY,
  privateKeyString: process.env.AWS_CLOUD_FRONT_PRIVATE_KEY.replace(
    /\\n/g,
    "\n"
  ),
  expireTime: Date.now() + 1000 * 60 * 60 * 24, // 24h
};

// upload file
(async () => {
  const s3 = new AWS.S3({
    apiVersion: "2006-03-01",
    region: process.env.AWS_REGION,
  });

  const fileContent = await fs.readFile(
    require("path").resolve(filePath, fileName)
  );

  // realiza o upload do arquivo
  const data = await s3
    .upload({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: fileName,
      Body: fileContent,
    })
    .promise();

  console.log(data);

  const url = process.env.AWS_CLOUD_FRONT_DOMAIN_NAME;
  const pathUrl = data.Location.replace("https://", "").replace(
    /([A-z0-9-.]+)\//g,
    ""
  );

  // gera cookies autorizados para acessar os conteúdos
  const signedCookies = cfsign.getSignedCookies(
    `https://${url}/${pathUrl}`,
    signingParams
  );

  console.log(signedCookies);
})();
