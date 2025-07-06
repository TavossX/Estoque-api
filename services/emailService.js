// emailService.js
const nodemailer = require("nodemailer");

function gerarHtmlEmail(nomeProduto, quantidade, logoUrl) {
  return `
  <!DOCTYPE html>
  <html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Alerta de Estoque Baixo - Stock360</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f4f4f4;">
    <table width="100%" bgcolor="#f4f4f4" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="center">
          <table width="600" bgcolor="#ffffff" cellpadding="20" cellspacing="0" border="0" style="font-family: Arial, sans-serif; border-radius:8px; box-shadow:0 0 10px rgba(0,0,0,0.1);">
            <tr>
              <td align="center" style="padding-bottom:10px;">
                <img src="${logoUrl}" alt="Stock360 Logo" width="250" style="display:block; max-width:100%; height:auto;" />
              </td>
            </tr>
            <tr>
              <td style="text-align:center; color:#333333;">
                <h1 style="font-size:24px; margin-bottom:10px;">Alerta de Estoque Baixo</h1>
                <p style="font-size:16px; line-height:1.5; margin:0 0 20px 0;">
                  Olá! O produto <strong>${nomeProduto}</strong> está com estoque baixo. <br />
                  Quantidade atual: <strong>${quantidade}</strong>.
                </p>
                <p style="font-size:14px; color:#777777; margin-top:30px;">
                  Por favor, faça o reabastecimento o mais breve possível para evitar rupturas.
                </p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-top:30px; border-top:1px solid #eeeeee; font-size:12px; color:#999999;">
                © 2025 Stock360. Todos os direitos reservados.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}

async function enviarEmailEstoqueBaixo(emailDestino, nomeProduto, quantidade) {
  const logoUrl =
    "https://res.cloudinary.com/dipwc1he0/image/upload/v1750396255/LogoEmail_zejbio.png"; // URL pública da sua logo

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Stock360" <${process.env.EMAIL_USER}>`,
    to: emailDestino,
    subject: "Alerta: Estoque Baixo no Stock360",
    html: gerarHtmlEmail(nomeProduto, quantidade, logoUrl),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email enviado com sucesso para", emailDestino);
  } catch (error) {
    console.error("Erro ao enviar email:", error);
  }
}

module.exports = { enviarEmailEstoqueBaixo };
