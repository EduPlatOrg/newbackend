const createVerificationEmail = (tokenAccess) => {
    return `
    <!DOCTYPE html>
    <html lang="es">
      <style>
      html {
        background-color: #ffffff;
      }
    
      body {
        max-width: 600px;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        margin: auto;
        background-color: rgb(229, 255, 246);
        padding: 40px;
        border-radius: 4px;
        margin-top: 10px;
      }
    
      h1 {
        color: #17415f;
        margin-bottom: 20px;
      }
    
      p {
        margin-bottom: 15px;
        color: #17415f;
      }
    
      a {
        color: #17415f;
        text-decoration: none;
        font-style: italic;
        font-weight: bold;
      }
    
      a:hover {
        text-decoration: underline;
      }
    
      strong {
        color: #17415f;
      }
    
      .firma {
        font-weight: bold;
        color: #ff8c00;
      }
      </style>
      <body>
      <h1>Verificando su cuenta de Eduplat.org</h1>
      <p>Se ha creado una cuenta en eduplat.org con este correo electrónico, si usted no ha creado la cuenta, desestime este correo, si usted la creo, entonces verifíquela<a href="http://localhost:5173/verify/${tokenAccess}" target="_blank" rel="noopener noreferrer"> haciendo click en este link</a>. Será redirigido automáticamente al inicio de sesión.</p>
      <br/>
      <p class='firma'>Equipo de EduPlat.</p>
    `;
};

export default createVerificationEmail;