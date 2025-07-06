require("dotenv").config();
const nodemailer = require("nodemailer");

async function enviarTeste() {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: "seu-email-para-testar@gmail.com", // seu e-mail real para teste
    subject: "Teste envio Stock360",
    text: "Se você recebeu este e-mail, o envio está funcionando!",
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email enviado:", info.response);
  } catch (err) {
    console.error("Erro no envio:", err);
  }
}

enviarTeste();
