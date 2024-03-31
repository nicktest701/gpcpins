const style = ` <style type="text/css">
body{

    font-family: 'Poppins', system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    font-size: 14px !important;
}

p {
    font-family: 'Barlow', sans-serif;
    font-size: 16px;
    font-weight: 400;
    line-height: 1.75em;
    color: #333;
    margin-bottom: 8px;
  }

#outlook a {
    padding: 0;
}

.es-button {
    mso-style-priority: 100 !important;
    text-decoration: none !important;
}

a[x-apple-data-detectors] {
    color: inherit !important;
    text-decoration: none !important;
    font-size: inherit !important;
    font-family: inherit !important;
    font-weight: inherit !important;
    line-height: inherit !important;
}

.es-desk-hidden {
    display: none;
    float: left;
    overflow: hidden;
    width: 0;
    max-height: 0;
    line-height: 0;
    mso-hide: all;
}



@media only screen and (max-width:600px) {

    p,
    ul li,
    ol li,
    a {
        line-height: 150% !important
    }

    h1,
    h2,
    h3,
    h1 a,
    h2 a,
    h3 a {
        line-height: 120%
    }

    h1 {
        font-size: 30px !important;
        text-align: center
    }

    h2 {
        font-size: 24px !important;
        text-align: center
    }

    h3 {
        font-size: 20px !important;
        text-align: center
    }

    .es-header-body h1 a,
    .es-content-body h1 a,
    .es-footer-body h1 a {
        font-size: 30px !important;
        text-align: center
    }

    .es-header-body h2 a,
    .es-content-body h2 a,
    .es-footer-body h2 a {
        font-size: 24px !important;
        text-align: center
    }

    .es-header-body h3 a,
    .es-content-body h3 a,
    .es-footer-body h3 a {
        font-size: 20px !important;
        text-align: center
    }

    .es-menu td a {
        font-size: 12px !important
    }

    .es-header-body p,
    .es-header-body ul li,
    .es-header-body ol li,
    .es-header-body a {
        font-size: 14px !important
    }

    .es-content-body p,
    .es-content-body ul li,
    .es-content-body ol li,
    .es-content-body a {
        font-size: 14px !important
    }

    .es-footer-body p,
    .es-footer-body ul li,
    .es-footer-body ol li,
    .es-footer-body a {
        font-size: 12px !important
    }

    .es-infoblock p,
    .es-infoblock ul li,
    .es-infoblock ol li,
    .es-infoblock a {
        font-size: 12px !important
    }

    *[class="gmail-fix"] {
        display: none !important
    }

    .es-m-txt-c,
    .es-m-txt-c h1,
    .es-m-txt-c h2,
    .es-m-txt-c h3 {
        text-align: center !important
    }

    .es-m-txt-r,
    .es-m-txt-r h1,
    .es-m-txt-r h2,
    .es-m-txt-r h3 {
        text-align: right !important
    }

    .es-m-txt-l,
    .es-m-txt-l h1,
    .es-m-txt-l h2,
    .es-m-txt-l h3 {
        text-align: left !important
    }

    .es-m-txt-r img,
    .es-m-txt-c img,
    .es-m-txt-l img {
        display: inline !important
    }

    .es-button-border {
        display: inline-block !important
    }

    a.es-button,
    button.es-button {
        font-size: 18px !important;
        display: inline-block !important
    }

    .es-adaptive table,
    .es-left,
    .es-right {
        width: 100% !important
    }

    .es-content table,
    .es-header table,
    .es-footer table,
    .es-content,
    .es-footer,
    .es-header {
        width: 100% !important;
        max-width: 600px !important
    }

    .es-adapt-td {
        display: block !important;
        width: 100% !important
    }

    .adapt-img {
        width: 100% !important;
        height: auto !important
    }

    .es-m-p0 {
        padding: 0 !important
    }

    .es-m-p0r {
        padding-right: 0 !important
    }

    .es-m-p0l {
        padding-left: 0 !important
    }

    .es-m-p0t {
        padding-top: 0 !important
    }

    .es-m-p0b {
        padding-bottom: 0 !important
    }

    .es-m-p20b {
        padding-bottom: 20px !important
    }

    .es-mobile-hidden,
    .es-hidden {
        display: none !important
    }

    tr.es-desk-hidden,
    td.es-desk-hidden,
    table.es-desk-hidden {
        width: auto !important;
        overflow: visible !important;
        float: none !important;
        max-height: inherit !important;
        line-height: inherit !important
    }

    tr.es-desk-hidden {
        display: table-row !important
    }

    table.es-desk-hidden {
        display: table !important
    }

    td.es-desk-menu-hidden {
        display: table-cell !important
    }

    .es-menu td {
        width: 1% !important
    }

    table.es-table-not-adapt,
    .esd-block-html table {
        width: auto !important
    }

    table.es-social {
        display: inline-block !important
    }

    table.es-social td {
        display: inline-block !important
    }

    .es-desk-hidden {
        display: table-row !important;
        width: auto !important;
        overflow: visible !important;
        max-height: inherit !important
    }

    .es-m-p5 {
        padding: 5px !important
    }

    .es-m-p5t {
        padding-top: 5px !important
    }

    .es-m-p5b {
        padding-bottom: 5px !important
    }

    .es-m-p5r {
        padding-right: 5px !important
    }

    .es-m-p5l {
        padding-left: 5px !important
    }

    .es-m-p10 {
        padding: 10px !important
    }

    .es-m-p10t {
        padding-top: 10px !important
    }

    .es-m-p10b {
        padding-bottom: 10px !important
    }

    .es-m-p10r {
        padding-right: 10px !important
    }

    .es-m-p10l {
        padding-left: 10px !important
    }

    .es-m-p15 {
        padding: 15px !important
    }

    .es-m-p15t {
        padding-top: 15px !important
    }

    .es-m-p15b {
        padding-bottom: 15px !important
    }

    .es-m-p15r {
        padding-right: 15px !important
    }

    .es-m-p15l {
        padding-left: 15px !important
    }

    .es-m-p20 {
        padding: 20px !important
    }

    .es-m-p20t {
        padding-top: 20px !important
    }

    .es-m-p20r {
        padding-right: 20px !important
    }

    .es-m-p20l {
        padding-left: 20px !important
    }

    .es-m-p25 {
        padding: 25px !important
    }

    .es-m-p25t {
        padding-top: 25px !important
    }

    .es-m-p25b {
        padding-bottom: 25px !important
    }

    .es-m-p25r {
        padding-right: 25px !important
    }

    .es-m-p25l {
        padding-left: 25px !important
    }

    .es-m-p30 {
        padding: 30px !important
    }

    .es-m-p30t {
        padding-top: 30px !important
    }

    .es-m-p30b {
        padding-bottom: 30px !important
    }

    .es-m-p30r {
        padding-right: 30px !important
    }

    .es-m-p30l {
        padding-left: 30px !important
    }

    .es-m-p35 {
        padding: 35px !important
    }

    .es-m-p35t {
        padding-top: 35px !important
    }

    .es-m-p35b {
        padding-bottom: 35px !important
    }

    .es-m-p35r {
        padding-right: 35px !important
    }

    .es-m-p35l {
        padding-left: 35px !important
    }

    .es-m-p40 {
        padding: 40px !important
    }

    .es-m-p40t {
        padding-top: 40px !important
    }

    .es-m-p40b {
        padding-bottom: 40px !important
    }

    .es-m-p40r {
        padding-right: 40px !important
    }

    .es-m-p40l {
        padding-left: 40px !important
    }
}

@media screen and (max-width:384px) {
    .mail-message-content {
        width: 414px !important
    }
}
</style>`;

module.exports = {
  mailText: (htmlText) => {
    return `<!DOCTYPE html>
     <html lang="en">
    
     <head>
         <meta charset="UTF-8">
         <meta http-equiv="X-UA-Compatible" content="IE=edge">
         <meta name="viewport" content="width=device-width, initial-scale=1.0">
         <link rel="preconnect" href="https://fonts.googleapis.com">
         <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
         <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@100;400;700&display=swap" rel="stylesheet">
         <title>Document</title>
    
         <style>
             *,
             *::after,
             *::before {
                 margin: 0;
                 padding: 0;
                 box-sizing: border-box;
             }
    
             html {
                 scroll-behavior: smooth;
             }
    
             body {
                 font-family: "Poppins",sans-serif;
    
                 -webkit-font-smoothing: antialiased;
                 -moz-osx-font-smoothing: grayscale;
                 font-size: 14px !important;
                 font-weight: 500 !important;
                 width: 100%;
                 min-height: 100vh;
                 background-color:#fff !important;
             }
         </style>
     </head>
    
     <body style='font-family: "Poppins",sans-serif;background-color:#fff;padding:16px;color:#333;'>
     ${htmlText}
     </body>
     </html>
    
     `;
  },

  mailTextShell: (stuff) => `<!DOCTYPE html
  PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en"
  style="font-family:arial, 'helvetica neue', helvetica, sans-serif">

<head>
  <meta charset="UTF-8">
  <meta content="width=device-width, initial-scale=1" name="viewport">
  <meta name="x-apple-disable-message-reformatting">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta content="telephone=no" name="format-detection">
  <title>Gab Powerful Consult</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins&display=swap" rel="stylesheet"><!--<![endif]-->
${style}
</head>

<body
  style="width:100%;background-color:#fff;font-family:arial, 'helvetica neue', helvetica, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0">
  <div dir="ltr" class="es-wrapper-color" lang="en" style="background-color:#fff;">

      <table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0"
          style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;background-color:#ffffff">
          <tr>
              <td valign="top" style="padding:0;Margin:0">
                  <table cellpadding="0" cellspacing="0" class="es-header" align="center"
                      style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top">
                      <tr>
                          <td align="center" style="padding:0;Margin:0">
                              <table bgcolor="#ffffff" class="es-header-body" align="center" cellpadding="0"
                                  cellspacing="0"
                                  style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px">
                                  <tr>
                                      <td align="left" style="padding:20px;Margin:0">
                                          <table cellpadding="0" cellspacing="0" width="100%"
                                              style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                              <tr>
                                                  <td class="es-m-p0r" valign="top" align="center"
                                                      style="padding:0;Margin:0;width:560px">
                                                      <table cellpadding="0" cellspacing="0" width="100%"
                                                          style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                          <tr>
                                                              <td align="center" class="es-m-txt-c"
                                                                  style="padding:0;Margin:0;font-size:0px"><a
                                                                      target="_blank" href="https://www.gpcpins.com"
                                                                      style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#022B3A;font-size:14px"><img
                                                                          src="https://www.gpcpins.com/logo.png"
                                                                       height='120'
                                                                          alt="Logo"
                                                                          style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"
                                                                          width="120" title="Logo"></a></td>
                                                          </tr>

                                                          <tr>
                                                          <td align="center"
                                                              style="padding:0;Margin:0;font-size:0px">
                                                              <a target="_blank"
                                                                  href="https://www.gpcpins.com"
                                                                  style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:none;color:#22287d;font-size:16px">Gab Powerful Consult</a>
                                                          </td>
                                                      </tr>
                                                      </table>
                                                  </td>
                                              </tr>
                                          </table>
                                      </td>
                                  </tr>
                              </table>
                          </td>
                      </tr>
                  </table>
                  <table class="es-content" cellspacing="0" cellpadding="0" align="center"
                      style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
                      <tr>
                          <td align="center" style="padding:0;Margin:0">
                              <table class="es-content-body"
                                  style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px"
                                  cellspacing="0" cellpadding="0" align="center">
                                  <tr>
                                      <td align="left" bgcolor="#ffffff"
                                          style="padding:20px;Margin:0;background-color:#ffffff;border-radius:5px 5px 0px 0px">
                                          <table width="100%" cellspacing="0" cellpadding="0"
                                              style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                              <tr>
                                                  <td class="es-m-p0r es-m-p20b" valign="top" align="center"
                                                      style="padding:0;Margin:0;width:560px">
                                                      <table width="100%" cellspacing="0" cellpadding="0"
                                                          style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:separate;border-spacing:0px;border-radius:5px">
                                                    
                            
                                                          <tr>
                                                              <td align="center"
                                                                  style="Margin:0;padding-top:10px;padding-bottom:20px;padding-left:20px;padding-right:20px">
                                    
                                                                  ${stuff}
                                                              </td>
                                                          </tr>
                                                          <tr>
                                                      
                                                      </tr>
                                                      </table>
                                                  </td>
                                              </tr>
                                          </table>
                                      </td>
                                  </tr>
                              </table>
                          </td>
                      </tr>
                  </table>
           
       
                  <table cellpadding="0" cellspacing="0" class="es-footer" align="center"
                      style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top">
                      <tr>
                          <td align="center" style="padding:0;Margin:0">
                              <table bgcolor="#ffffff" class="es-footer-body" align="center" cellpadding="0"
                                  cellspacing="0"
                                  style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px">
                                  <tr>
                                      <td class="esdev-adapt-off" align="left"
                                          style="padding:0;Margin:0;padding-top:20px;padding-left:20px;padding-right:20px">
                                          <table cellpadding="0" cellspacing="0" class="esdev-mso-table"
                                              style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:560px">
                                              <tr>
                                                  
                                                  <td style="padding:0;Margin:0;width:10px"></td>
                                                  <td class="esdev-mso-td" valign="top" style="padding:0;Margin:0">
                                                      <table cellpadding="0" cellspacing="0" class="es-left"
                                                          align="left"
                                                          style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left">
                                                          <tr>
                                                              <td align="left" style="padding:0;Margin:0;width:139px">
                                                                  <table cellpadding="0" cellspacing="0" width="100%"
                                                                      style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                                      <tr>
                                                                          <td align="right" class="es-m-p0t"
                                                                              style="padding:0;Margin:0;padding-top:10px">
                                                                              <p
                                                                                  style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Poppins, sans-serif;line-height:21px;color:#022B3A;font-size:14px">
                                                                                  Download the app:</p>
                                                                          </td>
                                                                      </tr>
                                                                  </table>
                                                              </td>
                                                          </tr>
                                                      </table>
                                                  </td>
                                                  <td style="padding:0;Margin:0;width:10px"></td>
                                                  <td class="esdev-mso-td" valign="top" style="padding:0;Margin:0">
                                                      <table cellpadding="0" cellspacing="0" class="es-left"
                                                          align="left"
                                                          style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left;color: #fff;">
                                                          <tr>
                                                              <td align="left" style="padding:0;Margin:0;width:40px">
                                                                  <table cellpadding="0" cellspacing="0" width="100%"
                                                                      style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                                      <tr>
                                                                          <td align="right"
                                                                              style="padding:0;Margin:0;font-size:0px">
                                                                              <a target="_blank"
                                                                                  href="https://www.gpcpins.com"
                                                                                  style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#022B3A;font-size:14px"><img
                                                                                      src="https://www.gpcpins.com/images/social/appstore.png"
                                                                                      alt="Download on the app store"
                                                                                     
                                                                                      style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"
                                                                                      title="Download on the app store"
                                                                                      width="40"></a>
                                                                          </td>
                                                                      </tr>
                                                                  </table>
                                                              </td>
                                                          </tr>
                                                      </table>
                                                  </td>
                                                  <td style="padding:0;Margin:0;width:10px"></td>
                                                  <td class="esdev-mso-td" valign="top" style="padding:0;Margin:0">
                                                      <table cellpadding="0" cellspacing="0" class="es-right"
                                                          align="right"
                                                          style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:right">
                                                          <tr>
                                                              <td align="left" style="padding:0;Margin:0;width:40px">
                                                                  <table cellpadding="0" cellspacing="0" width="100%"
                                                                      style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                                      <tr>
                                                                          <td align="right"
                                                                              style="padding:0;Margin:0;font-size:0px">
                                                                              <a target="_blank"
                                                                                  href="https://www.gpcpins.com"
                                                                                  style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#022B3A;font-size:14px"><img
                                                                                  src="https://www.gpcpins.com/images/social/playstore.png"
                                                                            
                                                                                      alt="Get it on google play"
                                                                                    
                                                                                      style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"
                                                                                      title="Get it on google play"
                                                                                      width="40"></a>
                                                                          </td>
                                                                      </tr>
                                                                  </table>
                                                              </td>
                                                          </tr>
                                                      </table>
                                                  </td>
                                              </tr>
                                          </table>
                                      </td>
                                  </tr>
                                  <tr>
                                      <td align="left"
                                          style="Margin:0;padding-top:20px;padding-bottom:20px;padding-left:20px;padding-right:20px">
                                          <table cellpadding="0" cellspacing="0" width="100%"
                                              style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                              <tr>
                                                  <td align="left" style="padding:0;Margin:0;width:560px">
                                                      <table cellpadding="0" cellspacing="0" width="100%"
                                                          style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                          <tr>
                                                              <td align="center"
                                                                  style="padding:0;Margin:0;padding-top:20px;padding-bottom:30px;font-size:0">
                                                                  <table cellpadding="0" cellspacing="0"
                                                                      class="es-table-not-adapt es-social"
                                                                      style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                                      <tr>
                                                                          <td align="center" valign="top"
                                                                              style="padding:0;Margin:0;padding-right:10px">
                                                                              <a target="_blank"
                                                                                  href="https://www.gpcpins.com"
                                                                                  style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#022B3A;font-size:14px">
                                                                                  <img title="Facebook"
                                                                                
                                                                                 
                                                                                  src="https://www.gpcpins.com/images/social/facebook.png"
                                                                                
                                                                                      alt="Fb" height="32"
                                                                                      style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"></a>
                                                                          </td>
                                                                          <td align="center" valign="top"
                                                                              style="padding:0;Margin:0;padding-right:10px">
                                                                              <a target="_blank"
                                                                                  href="https://www.gpcpins.com"
                                                                                  style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#022B3A;font-size:14px"><img
                                                                                      title="Twitter"
                                                                                     
                                                                                      src="https://www.gpcpins.com/images/social/twitter.png"
                                                                                     
                                                                                      alt="Tw" height="32"
                                                                                      style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"></a>
                                                                          </td>
                                                                          <td align="center" valign="top"
                                                                              style="padding:0;Margin:0;padding-right:10px">
                                                                              <a target="_blank"
                                                                                  href="https://www.gpcpins.com"
                                                                                  style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#022B3A;font-size:14px"><img
                                                                                      title="Instagram"
                                                                                 
                                                                                      src="https://www.gpcpins.com/images/social/instagram.png"
                                                                                 
                                                                                      alt="Inst" height="32"
                                                                                      style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"></a>
                                                                          </td>
                                                                          <td align="center" valign="top"
                                                                              style="padding:0;Margin:0"><a
                                                                                  target="_blank"
                                                                                  href="https://www.gpcpins.com"
                                                                                  style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#022B3A;font-size:14px"><img
                                                                                      title="Youtube"
                                                                                 
                                                                                      src="https://www.gpcpins.com/images/social/youtube.png"
                                                                                      alt="Yt" height="32"
                                                                                      style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"></a>
                                                                          </td>
                                                                      </tr>
                                                                  </table>
                                                              </td>
                                                          </tr>
                                                          <tr>
                                                              <td align="center" style="padding:0;Margin:0">
                                                                  <p
                                                                      style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Poppins, sans-serif;line-height:21px;color:#022B3A;font-size:14px">


                                                                      <a href="https://www.gpcpins.com/privacy-policy"
                                                                          target="_blank"
                                                                          style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#022B3A;font-size:14px">Privacy
                                                                          Policy</a>&nbsp;and
                                                                      <a href="https://www.gpcpins.com/terms-and-conditions"
                                                                          target="_blank"
                                                                          style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#022B3A;font-size:14px">Terms
                                                                          of Service</a>


                                                                      <br><br>Menhyia-Opposite St.
                                                                      Anne's International School,
                                                                      Ashtown, Kumasi, Ghana, 0322036582
                                                                      <br><br>©
                                                                      ${new Date().getFullYear()}&nbsp;Gab Powerful Consult<br><br><a
                                                                          href="https://www.gpcpins.com"
                                                                          target="_blank"
                                                                          style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#022B3A;font-size:14px">View
                                                                          Online</a>
                                                                  </p>
                                                              </td>
                                                          </tr>
                                                      </table>
                                                  </td>
                                              </tr>
                                          </table>
                                      </td>
                                  </tr>
                              </table>
                          </td>
                      </tr>
                  </table>
                  <table cellpadding="0" cellspacing="0" class="es-footer" align="center"
                      style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top">
                      <tr>
                          <td align="center" style="padding:0;Margin:0">
                              <table bgcolor="#ffffff" class="es-footer-body" align="center" cellpadding="0"
                                  cellspacing="0"
                                  style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px">
                                  <tr>
                                      <td align="left" style="padding:20px;Margin:0">
                                          <table cellpadding="0" cellspacing="0" width="100%"
                                              style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">

                                          </table>
                                      </td>
                                  </tr>
                              </table>
                          </td>
                      </tr>
                  </table>
              </td>
          </tr>
      </table>
  </div>
</body>


</html>`,

  resendMailText: (id, downloadLink) => `<!DOCTYPE html
  PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en"
  style="font-family:arial, 'helvetica neue', helvetica, sans-serif">

<head>
  <meta charset="UTF-8">
  <meta content="width=device-width, initial-scale=1" name="viewport">
  <meta name="x-apple-disable-message-reformatting">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta content="telephone=no" name="format-detection">
  <title>Gab Powerful Consult</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins&display=swap" rel="stylesheet"><!--<![endif]-->
  ${style}
</head>

<body
  style="width:100%;background-color:#fff;font-family:arial, 'helvetica neue', helvetica, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0">
  <div dir="ltr" class="es-wrapper-color" lang="en" style="background-color:#fff;">

      <table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0"
          style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;background-color:#ffffff">
          <tr>
              <td valign="top" style="padding:0;Margin:0">
                  <table cellpadding="0" cellspacing="0" class="es-header" align="center"
                      style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top">
                      <tr>
                          <td align="center" style="padding:0;Margin:0">
                              <table bgcolor="#ffffff" class="es-header-body" align="center" cellpadding="0"
                                  cellspacing="0"
                                  style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px">
                                  <tr>
                                      <td align="left" style="padding:20px;Margin:0">
                                          <table cellpadding="0" cellspacing="0" width="100%"
                                              style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                              <tr>
                                                  <td class="es-m-p0r" valign="top" align="center"
                                                      style="padding:0;Margin:0;width:560px">
                                                      <table cellpadding="0" cellspacing="0" width="100%"
                                                          style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                          <tr>
                                                              <td align="center" class="es-m-txt-c"
                                                                  style="padding:0;Margin:0;font-size:0px"><a
                                                                      target="_blank" href="https://www.gpcpins.com"
                                                                      style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#022B3A;font-size:14px"><img
                                                                          src="https://www.gpcpins.com/logo.png"
                                                                       height='120'
                                                                          alt="Logo"
                                                                          style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"
                                                                          width="120" title="Logo"></a></td>
                                                          </tr>

                                                          <tr>
                                                          <td align="center"
                                                              style="padding:0;Margin:0;font-size:0px">
                                                              <a target="_blank"
                                                                  href="https://www.gpcpins.com"
                                                                  style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:none;color:#22287d;font-size:16px">Gab Powerful Consult</a>
                                                          </td>
                                                      </tr>
                                                      </table>
                                                  </td>
                                              </tr>
                                          </table>
                                      </td>
                                  </tr>
                              </table>
                          </td>
                      </tr>
                  </table>
                  <table class="es-content" cellspacing="0" cellpadding="0" align="center"
                      style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
                      <tr>
                          <td align="center" style="padding:0;Margin:0">
                              <table class="es-content-body"
                                  style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px"
                                  cellspacing="0" cellpadding="0" align="center">
                                  <tr>
                                      <td align="left" bgcolor="#ffffff"
                                          style="padding:20px;Margin:0;background-color:#ffffff;border-radius:5px 5px 0px 0px">
                                          <table width="100%" cellspacing="0" cellpadding="0"
                                              style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                              <tr>
                                                  <td class="es-m-p0r es-m-p20b" valign="top" align="center"
                                                      style="padding:0;Margin:0;width:560px">
                                                      <table width="100%" cellspacing="0" cellpadding="0"
                                                          style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:separate;border-spacing:0px;border-radius:5px">
                                                    
                                                          <tr>
                                                              <td align="center"
                                                                  style="Margin:0;padding-top:10px;padding-bottom:10px;padding-left:20px;padding-right:20px">
                                                                  <h1
                                                                      style="Margin:0;line-height:43px;mso-line-height-rule:exactly;font-family:Poppins, sans-serif;font-size:36px;font-style:normal;font-weight:bold;color:#022B3A">
                                                                      Thank you for purchasing from us.</h1>
                                                              </td>
                                                          </tr>
                                                          <tr>
                                                              <td align="center"
                                                                  style="Margin:0;padding-top:10px;padding-bottom:20px;padding-left:20px;padding-right:20px">
                                                                  <p
                                                                      style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Poppins, sans-serif;line-height:21px;color:#022B3A;font-size:14px">
                                                                      We look forward to serving you in the future.
                                                                      Click on the button below to download your receipt.

                                                                  </p>

                                                              </td>
                                                          </tr>
                                                          <tr>
                                                          <td align="center"
                                                              style="padding:0;Margin:0;padding-bottom:10px;padding-top:20px">
                                                              <span class="es-button-border"
                                                                  style="border-style:solid;border-color:#2CB543;background:#22287d;border-width:0px;display:inline-block;border-radius:6px;width:auto"><a
                                                                      href="${downloadLink}"
                                                                      class="es-button" target="_blank"
                                                                      style="mso-style-priority:100 !important;text-decoration:none;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;color:#FFFFFF;font-size:18px;padding:10px 20px 10px 20px;display:inline-block;background:#22287d;border-radius:6px;font-family:Poppins, sans-serif;font-weight:normal;font-style:normal;line-height:22px;width:auto;text-align:center;mso-padding-alt:0;mso-border-alt:10px solid #22287d;padding-left:30px;padding-right:30px">Get
                                                                      Receipt
                                                                  </a></span>
                                                          </td>
                                                      </tr>
                                                      </table>
                                                  </td>
                                              </tr>
                                          </table>
                                      </td>
                                  </tr>
                              </table>
                          </td>
                      </tr>
                  </table>
                  <table cellpadding="0" cellspacing="0" class="es-content" align="center"
                      style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
                      <tr>
                          <td align="center" style="padding:0;Margin:0">
                              <table bgcolor="#ffffff" class="es-content-body" align="center" cellpadding="0"
                                  cellspacing="0"
                                  style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px">
                                  <tr>
                                      <td align="left" style="padding:20px;Margin:0">
                                          <!--[if mso]><table style="width:560px" cellpadding="0" cellspacing="0"><tr><td style="width:270px" valign="top"><![endif]-->
                                          <table cellpadding="0" cellspacing="0" class="es-left" align="left"
                                              style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left">
                                              <tr>
                                                  <td class="es-m-p20b" align="left"
                                                      style="padding:0;Margin:0;width:270px">
                                                      <table cellpadding="0" cellspacing="0" width="100%"
                                                          style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                          <tr>
                                                              <td align="left" style="padding:0;Margin:0">
                                                                  <h3
                                                                      style="Margin:0;line-height:24px;mso-line-height-rule:exactly;font-family:Poppins, sans-serif;font-size:20px;font-style:normal;font-weight:bold;color:#022B3A">
                                                                      Transaction ID:</h3>
                                                              </td>
                                                          </tr>
                                                      </table>
                                                  </td>
                                              </tr>
                                          </table>
                                          <!--[if mso]></td><td style="width:20px"></td><td style="width:270px" valign="top"><![endif]-->
                                          <table cellpadding="0" cellspacing="0" class="es-right" align="right"
                                              style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:right">
                                              <tr>
                                                  <td align="left" style="padding:0;Margin:0;width:270px">
                                                      <table cellpadding="0" cellspacing="0" width="100%"
                                                          style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">

                                                      </table>
                                                  </td>
                                              </tr>
                                          </table>
                                      </td>
                                  </tr>
                                  <tr>
                                      <td align="left"
                                          style="padding:0;Margin:0;padding-bottom:20px;padding-left:20px;padding-right:20px">
                                          <table cellpadding="0" cellspacing="0" width="100%"
                                              style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                              <tr>
                                                  <td align="center" valign="top"
                                                      style="padding:0;Margin:0;width:560px">
                                                      <table cellpadding="0" cellspacing="0" width="100%"
                                                          style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:separate;border-spacing:0px;border-radius:5px;background-color:#f2fcfe"
                                                          bgcolor="">
                                                          <tr style="background-color: #f0f0f4;">
                                                              <td align="center"
                                                                  style="padding:0;Margin:0;padding-top:15px;padding-bottom:15px">
                                                                  <h1
                                                                      style="Margin:0;line-height:43px;mso-line-height-rule:exactly;font-family:Poppins, sans-serif;font-size:36px;font-style:normal;font-weight:bold;color:#022B3A">
                                                                      <strong>${id}</strong>
                                                                  </h1>
                                                              </td>
                                                          </tr>
                                                      </table>
                                                  </td>
                                              </tr>
                                              <tr>
                                                  <td align="center" valign="top"
                                                      style="padding:0;Margin:0;width:560px">
                                                      <table cellpadding="0" cellspacing="0" width="100%"
                                                          style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:separate;border-spacing:0px;border-radius:5px">
                                                          <tr>
                                                              <td align="center"
                                                                  style="padding:0;Margin:0;padding-bottom:10px;padding-top:20px">
                                                                  <span class="es-button-border"
                                                                      style="border-style:solid;border-color:#2CB543;background:#22287d;border-width:0px;display:inline-block;border-radius:6px;width:auto"><a
                                                                          href="https://www.gpcpins.com"
                                                                          class="es-button" target="_blank"
                                                                          style="mso-style-priority:100 !important;text-decoration:none;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;color:#FFFFFF;font-size:18px;padding:10px 20px 10px 20px;display:inline-block;background:#22287d;border-radius:6px;font-family:Poppins, sans-serif;font-weight:normal;font-style:normal;line-height:22px;width:auto;text-align:center;mso-padding-alt:0;mso-border-alt:10px solid #22287d;padding-left:30px;padding-right:30px">Continue
                                                                          Shopping
                                                                      </a></span>
                                                              </td>
                                                          </tr>
                                                    
                                                      </table>
                                                  </td>
                                              </tr>
                                          </table>
                                      </td>
                                  </tr>
                              </table>
                          </td>
                      </tr>
                  </table>
                  <table cellpadding="0" cellspacing="0" class="es-content" align="center"
                      style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
                      <tr>
                          <td align="center" style="padding:0;Margin:0">
                              <table class="es-content-body" align="center" cellpadding="0" cellspacing="0"
                                  style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px">
                                  <tr>
                                      <td align="left" bgcolor="#ffffff"
                                          style="Margin:0;padding-top:20px;padding-left:20px;padding-right:20px;padding-bottom:40px;background-color:#ffffff;border-radius:0px 0px 5px 5px">
                                          <!--[if mso]><table style="width:560px" cellpadding="0" cellspacing="0"><tr><td style="width:145px" valign="top"><![endif]-->
                                          <table cellpadding="0" cellspacing="0" class="es-left" align="left"
                                              style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left">
                                              <tr>
                                                  <td class="es-m-p0r es-m-p20b" align="center"
                                                      style="padding:0;Margin:0;width:125px">
                                                      <table cellpadding="0" cellspacing="0" width="100%"
                                                          style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                          <tr>
                                                              <td align="center"
                                                                  style="padding:0;Margin:0;display:none"></td>
                                                          </tr>
                                                      </table>
                                                  </td>
                                                  <td class="es-hidden" style="padding:0;Margin:0;width:20px"></td>
                                              </tr>
                                          </table><!--[if mso]></td><td style="width:145px" valign="top"><![endif]-->
                                          <table cellpadding="0" cellspacing="0" class="es-left" align="left"
                                              style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left">
                                              <tr>
                                                  <td class="es-m-p0r es-m-p20b" align="center"
                                                      style="padding:0;Margin:0;width:125px">
                                                      <table cellpadding="0" cellspacing="0" width="100%"
                                                          style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                          <tr>
                                                              <td align="center"
                                                                  style="padding:0;Margin:0;display:none"></td>
                                                          </tr>
                                                      </table>
                                                  </td>
                                                  <td class="es-hidden" style="padding:0;Margin:0;width:20px"></td>
                                              </tr>
                                          </table><!--[if mso]></td><td style="width:125px" valign="top"><![endif]-->
                                          <table cellpadding="0" cellspacing="0" class="es-left" align="left"
                                              style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left">
                                              <tr>
                                                  <td class="es-m-p0r es-m-p20b" align="center"
                                                      style="padding:0;Margin:0;width:125px">
                                                      <table cellpadding="0" cellspacing="0" width="100%"
                                                          style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                          <tr>
                                                              <td align="center"
                                                                  style="padding:0;Margin:0;display:none"></td>
                                                          </tr>
                                                      </table>
                                                  </td>
                                              </tr>
                                          </table>
                                          <!--[if mso]></td><td style="width:20px"></td><td style="width:125px" valign="top"><![endif]-->
                                          <table cellpadding="0" cellspacing="0" class="es-right" align="right"
                                              style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:right">
                                              <tr>
                                                  <td class="es-m-p0r" align="center"
                                                      style="padding:0;Margin:0;width:125px">
                                                      <table cellpadding="0" cellspacing="0" width="100%"
                                                          style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                          <tr>
                                                              <td align="center"
                                                                  style="padding:0;Margin:0;display:none"></td>
                                                          </tr>
                                                      </table>
                                                  </td>
                                              </tr>
                                          </table><!--[if mso]></td></tr></table><![endif]-->
                                      </td>
                                  </tr>
                              </table>
                          </td>
                      </tr>
                  </table>
                  <table cellpadding="0" cellspacing="0" class="es-footer" align="center"
                      style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top">
                      <tr>
                          <td align="center" style="padding:0;Margin:0">
                              <table bgcolor="#ffffff" class="es-footer-body" align="center" cellpadding="0"
                                  cellspacing="0"
                                  style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px">
                                  <tr>
                                      <td class="esdev-adapt-off" align="left"
                                          style="padding:0;Margin:0;padding-top:20px;padding-left:20px;padding-right:20px">
                                          <table cellpadding="0" cellspacing="0" class="esdev-mso-table"
                                              style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:560px">
                                              <tr>
                                               
                                                  <td style="padding:0;Margin:0;width:10px"></td>
                                                  <td class="esdev-mso-td" valign="top" style="padding:0;Margin:0">
                                                      <table cellpadding="0" cellspacing="0" class="es-left"
                                                          align="left"
                                                          style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left">
                                                          <tr>
                                                              <td align="left" style="padding:0;Margin:0;width:139px">
                                                                  <table cellpadding="0" cellspacing="0" width="100%"
                                                                      style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                                      <tr>
                                                                          <td align="right" class="es-m-p0t"
                                                                              style="padding:0;Margin:0;padding-top:10px">
                                                                              <p
                                                                                  style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Poppins, sans-serif;line-height:21px;color:#022B3A;font-size:14px">
                                                                                  Download the app:</p>
                                                                          </td>
                                                                      </tr>
                                                                  </table>
                                                              </td>
                                                          </tr>
                                                      </table>
                                                  </td>
                                                  <td style="padding:0;Margin:0;width:10px"></td>
                                                  <td class="esdev-mso-td" valign="top" style="padding:0;Margin:0">
                                                      <table cellpadding="0" cellspacing="0" class="es-left"
                                                          align="left"
                                                          style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left;color: #fff;">
                                                          <tr>
                                                              <td align="left" style="padding:0;Margin:0;width:40px">
                                                                  <table cellpadding="0" cellspacing="0" width="100%"
                                                                      style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                                      <tr>
                                                                          <td align="right"
                                                                              style="padding:0;Margin:0;font-size:0px">
                                                                              <a target="_blank"
                                                                                  href="https://www.gpcpins.com"
                                                                                  style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#022B3A;font-size:14px"><img
                                                                                      src="https://www.gpcpins.com/images/social/appstore.png"
                                                                                      alt="Download on the app store"
                                                                                     
                                                                                      style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"
                                                                                      title="Download on the app store"
                                                                                      width="40"></a>
                                                                          </td>
                                                                      </tr>
                                                                  </table>
                                                              </td>
                                                          </tr>
                                                      </table>
                                                  </td>
                                                  <td style="padding:0;Margin:0;width:10px"></td>
                                                  <td class="esdev-mso-td" valign="top" style="padding:0;Margin:0">
                                                      <table cellpadding="0" cellspacing="0" class="es-right"
                                                          align="right"
                                                          style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:right">
                                                          <tr>
                                                              <td align="left" style="padding:0;Margin:0;width:40px">
                                                                  <table cellpadding="0" cellspacing="0" width="100%"
                                                                      style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                                      <tr>
                                                                          <td align="right"
                                                                              style="padding:0;Margin:0;font-size:0px">
                                                                              <a target="_blank"
                                                                                  href="https://www.gpcpins.com"
                                                                                  style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#022B3A;font-size:14px"><img
                                                                                  src="https://www.gpcpins.com/images/social/playstore.png"
                                                                            
                                                                                      alt="Get it on google play"
                                                                                    
                                                                                      style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"
                                                                                      title="Get it on google play"
                                                                                      width="40"></a>
                                                                          </td>
                                                                      </tr>
                                                                  </table>
                                                              </td>
                                                          </tr>
                                                      </table>
                                                  </td>
                                              </tr>
                                          </table>
                                      </td>
                                  </tr>
                                  <tr>
                                      <td align="left"
                                          style="Margin:0;padding-top:20px;padding-bottom:20px;padding-left:20px;padding-right:20px">
                                          <table cellpadding="0" cellspacing="0" width="100%"
                                              style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                              <tr>
                                                  <td align="left" style="padding:0;Margin:0;width:560px">
                                                      <table cellpadding="0" cellspacing="0" width="100%"
                                                          style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                          <tr>
                                                              <td align="center"
                                                                  style="padding:0;Margin:0;padding-top:20px;padding-bottom:30px;font-size:0">
                                                                  <table cellpadding="0" cellspacing="0"
                                                                      class="es-table-not-adapt es-social"
                                                                      style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                                      <tr>
                                                                          <td align="center" valign="top"
                                                                              style="padding:0;Margin:0;padding-right:10px">
                                                                              <a target="_blank"
                                                                                  href="https://www.gpcpins.com"
                                                                                  style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#022B3A;font-size:14px">
                                                                                  <img title="Facebook"
                                                                                
                                                                                 
                                                                                  src="https://www.gpcpins.com/images/social/facebook.png"
                                                                                
                                                                                      alt="Fb" height="32"
                                                                                      style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"></a>
                                                                          </td>
                                                                          <td align="center" valign="top"
                                                                              style="padding:0;Margin:0;padding-right:10px">
                                                                              <a target="_blank"
                                                                                  href="https://www.gpcpins.com"
                                                                                  style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#022B3A;font-size:14px"><img
                                                                                      title="Twitter"
                                                                                     
                                                                                      src="https://www.gpcpins.com/images/social/twitter.png"
                                                                                     
                                                                                      alt="Tw" height="32"
                                                                                      style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"></a>
                                                                          </td>
                                                                          <td align="center" valign="top"
                                                                              style="padding:0;Margin:0;padding-right:10px">
                                                                              <a target="_blank"
                                                                                  href="https://www.gpcpins.com"
                                                                                  style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#022B3A;font-size:14px"><img
                                                                                      title="Instagram"
                                                                                 
                                                                                      src="https://www.gpcpins.com/images/social/instagram.png"
                                                                                 
                                                                                      alt="Inst" height="32"
                                                                                      style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"></a>
                                                                          </td>
                                                                          <td align="center" valign="top"
                                                                              style="padding:0;Margin:0"><a
                                                                                  target="_blank"
                                                                                  href="https://www.gpcpins.com"
                                                                                  style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#022B3A;font-size:14px"><img
                                                                                      title="Youtube"
                                                                                 
                                                                                      src="https://www.gpcpins.com/images/social/youtube.png"
                                                                                      alt="Yt" height="32"
                                                                                      style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"></a>
                                                                          </td>
                                                                      </tr>
                                                                  </table>
                                                              </td>
                                                          </tr>
                                                          <tr>
                                                              <td align="center" style="padding:0;Margin:0">
                                                                  <p
                                                                      style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Poppins, sans-serif;line-height:21px;color:#022B3A;font-size:14px">


                                                                      <a href="https://www.gpcpins.com/privacy-policy"
                                                                          target="_blank"
                                                                          style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#022B3A;font-size:14px">Privacy
                                                                          Policy</a>&nbsp;and
                                                                      <a href="https://www.gpcpins.com/terms-and-conditions"
                                                                          target="_blank"
                                                                          style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#022B3A;font-size:14px">Terms
                                                                          of Service</a>


                                                                      <br><br>Menhyia-Opposite St.
                                                                      Anne's International School,
                                                                      Ashtown, Kumasi, Ghana, 0322036582
                                                                      <br><br>©
                                                                      ${new Date().getFullYear()}&nbsp;Gab Powerful Consult<br><br><a
                                                                          href="https://www.gpcpins.com"
                                                                          target="_blank"
                                                                          style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#022B3A;font-size:14px">View
                                                                          Online</a>
                                                                  </p>
                                                              </td>
                                                          </tr>
                                                      </table>
                                                  </td>
                                              </tr>
                                          </table>
                                      </td>
                                  </tr>
                              </table>
                          </td>
                      </tr>
                  </table>
                  <table cellpadding="0" cellspacing="0" class="es-footer" align="center"
                      style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top">
                      <tr>
                          <td align="center" style="padding:0;Margin:0">
                              <table bgcolor="#ffffff" class="es-footer-body" align="center" cellpadding="0"
                                  cellspacing="0"
                                  style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px">
                                  <tr>
                                      <td align="left" style="padding:20px;Margin:0">
                                          <table cellpadding="0" cellspacing="0" width="100%"
                                              style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">

                                          </table>
                                      </td>
                                  </tr>
                              </table>
                          </td>
                      </tr>
                  </table>
              </td>
          </tr>
      </table>
  </div>
</body>


</html>`,

  thankYouText: (id) => `<!DOCTYPE html
  PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en"
  style="font-family:arial, 'helvetica neue', helvetica, sans-serif">

<head>
  <meta charset="UTF-8">
  <meta content="width=device-width, initial-scale=1" name="viewport">
  <meta name="x-apple-disable-message-reformatting">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta content="telephone=no" name="format-detection">
  <title>Gab Powerful Consult</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins&display=swap" rel="stylesheet"><!--<![endif]-->
 ${style}
</head>

<body
  style="width:100%;background-color:#fff;font-family:arial, 'helvetica neue', helvetica, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0">
  <div dir="ltr" class="es-wrapper-color" lang="en" style="background-color:#fff;">

      <table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0"
          style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;background-color:#ffffff">
          <tr>
              <td valign="top" style="padding:0;Margin:0">
                  <table cellpadding="0" cellspacing="0" class="es-header" align="center"
                      style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top">
                      <tr>
                          <td align="center" style="padding:0;Margin:0">
                              <table bgcolor="#ffffff" class="es-header-body" align="center" cellpadding="0"
                                  cellspacing="0"
                                  style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px">
                                  <tr>
                                      <td align="left" style="padding:20px;Margin:0">
                                          <table cellpadding="0" cellspacing="0" width="100%"
                                              style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                              <tr>
                                                  <td class="es-m-p0r" valign="top" align="center"
                                                      style="padding:0;Margin:0;width:560px">
                                                      <table cellpadding="0" cellspacing="0" width="100%"
                                                          style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                          <tr>
                                                              <td align="center" class="es-m-txt-c"
                                                                  style="padding:0;Margin:0;font-size:0px"><a
                                                                      target="_blank" href="https://www.gpcpins.com"
                                                                      style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#022B3A;font-size:14px"><img
                                                                          src="https://www.gpcpins.com/logo.png"
                                                                       height='120'
                                                                          alt="Logo"
                                                                          style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"
                                                                          width="120" title="Logo"></a></td>
                                                          </tr>

                                                          <tr>
                                                          <td align="center"
                                                              style="padding:0;Margin:0;font-size:0px">
                                                              <a target="_blank"
                                                                  href="https://www.gpcpins.com"
                                                                  style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:none;color:#22287d;font-size:16px">Gab Powerful Consult</a>
                                                          </td>
                                                      </tr>
                                                      </table>
                                                  </td>
                                              </tr>
                                          </table>
                                      </td>
                                  </tr>
                              </table>
                          </td>
                      </tr>
                  </table>
                  <table class="es-content" cellspacing="0" cellpadding="0" align="center"
                      style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
                      <tr>
                          <td align="center" style="padding:0;Margin:0">
                              <table class="es-content-body"
                                  style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px"
                                  cellspacing="0" cellpadding="0" align="center">
                                  <tr>
                                      <td align="left" bgcolor="#ffffff"
                                          style="padding:20px;Margin:0;background-color:#ffffff;border-radius:5px 5px 0px 0px">
                                          <table width="100%" cellspacing="0" cellpadding="0"
                                              style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                              <tr>
                                                  <td class="es-m-p0r es-m-p20b" valign="top" align="center"
                                                      style="padding:0;Margin:0;width:560px">
                                                      <table width="100%" cellspacing="0" cellpadding="0"
                                                          style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:separate;border-spacing:0px;border-radius:5px">
                                                    
                                                          <tr>
                                                              <td align="center"
                                                                  style="Margin:0;padding-top:10px;padding-bottom:10px;padding-left:20px;padding-right:20px">
                                                                  <h1
                                                                      style="Margin:0;line-height:43px;mso-line-height-rule:exactly;font-family:Poppins, sans-serif;font-size:36px;font-style:normal;font-weight:bold;color:#022B3A">
                                                                      Thank you for purchasing from us.</h1>
                                                              </td>
                                                          </tr>
                                                          <tr>
                                                              <td align="center"
                                                                  style="Margin:0;padding-top:10px;padding-bottom:20px;padding-left:20px;padding-right:20px">
                                                                  <p
                                                                      style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Poppins, sans-serif;line-height:21px;color:#022B3A;font-size:14px">
                                                                      We look forward to serving you in the future..
                                                                  </p>
                                                                  <p> Attached to this a copy of your voucher.👇🏾 </p>

                                                              </td>
                                                          </tr>
                                                      </table>
                                                  </td>
                                              </tr>
                                          </table>
                                      </td>
                                  </tr>
                              </table>
                          </td>
                      </tr>
                  </table>
                  <table cellpadding="0" cellspacing="0" class="es-content" align="center"
                      style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
                      <tr>
                          <td align="center" style="padding:0;Margin:0">
                              <table bgcolor="#ffffff" class="es-content-body" align="center" cellpadding="0"
                                  cellspacing="0"
                                  style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px">
                                  <tr>
                                      <td align="left" style="padding:20px;Margin:0">
                                          <!--[if mso]><table style="width:560px" cellpadding="0" cellspacing="0"><tr><td style="width:270px" valign="top"><![endif]-->
                                          <table cellpadding="0" cellspacing="0" class="es-left" align="left"
                                              style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left">
                                              <tr>
                                                  <td class="es-m-p20b" align="left"
                                                      style="padding:0;Margin:0;width:270px">
                                                      <table cellpadding="0" cellspacing="0" width="100%"
                                                          style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                          <tr>
                                                              <td align="left" style="padding:0;Margin:0">
                                                                  <h3
                                                                      style="Margin:0;line-height:24px;mso-line-height-rule:exactly;font-family:Poppins, sans-serif;font-size:20px;font-style:normal;font-weight:bold;color:#022B3A">
                                                                      Transaction ID:</h3>
                                                              </td>
                                                          </tr>
                                                      </table>
                                                  </td>
                                              </tr>
                                          </table>
                                          <!--[if mso]></td><td style="width:20px"></td><td style="width:270px" valign="top"><![endif]-->
                                          <table cellpadding="0" cellspacing="0" class="es-right" align="right"
                                              style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:right">
                                              <tr>
                                                  <td align="left" style="padding:0;Margin:0;width:270px">
                                                      <table cellpadding="0" cellspacing="0" width="100%"
                                                          style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">

                                                      </table>
                                                  </td>
                                              </tr>
                                          </table><!--[if mso]></td></tr></table><![endif]-->
                                      </td>
                                  </tr>
                                  <tr>
                                      <td align="left"
                                          style="padding:0;Margin:0;padding-bottom:20px;padding-left:20px;padding-right:20px">
                                          <table cellpadding="0" cellspacing="0" width="100%"
                                              style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                              <tr>
                                                  <td align="center" valign="top"
                                                      style="padding:0;Margin:0;width:560px">
                                                      <table cellpadding="0" cellspacing="0" width="100%"
                                                          style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:separate;border-spacing:0px;border-radius:5px;background-color:#f2fcfe"
                                                          bgcolor="">
                                                          <tr style="background-color: #f0f0f4;">
                                                              <td align="center"
                                                                  style="padding:0;Margin:0;padding-top:15px;padding-bottom:15px">
                                                                  <h1
                                                                      style="Margin:0;line-height:43px;mso-line-height-rule:exactly;font-family:Poppins, sans-serif;font-size:36px;font-style:normal;font-weight:bold;color:#022B3A">
                                                                      <strong>${id}</strong>
                                                                  </h1>
                                                              </td>
                                                          </tr>
                                                      </table>
                                                  </td>
                                              </tr>
                                              <tr>
                                                  <td align="center" valign="top"
                                                      style="padding:0;Margin:0;width:560px">
                                                      <table cellpadding="0" cellspacing="0" width="100%"
                                                          style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:separate;border-spacing:0px;border-radius:5px">
                                                          <tr>
                                                              <td align="center"
                                                                  style="padding:0;Margin:0;padding-bottom:10px;padding-top:20px">
                                                                  <span class="es-button-border"
                                                                      style="border-style:solid;border-color:#2CB543;background:#22287d;border-width:0px;display:inline-block;border-radius:6px;width:auto"><a
                                                                          href="https://www.gpcpins.com"
                                                                          class="es-button" target="_blank"
                                                                          style="mso-style-priority:100 !important;text-decoration:none;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;color:#FFFFFF;font-size:18px;padding:10px 20px 10px 20px;display:inline-block;background:#22287d;border-radius:6px;font-family:Poppins, sans-serif;font-weight:normal;font-style:normal;line-height:22px;width:auto;text-align:center;mso-padding-alt:0;mso-border-alt:10px solid #22287d;padding-left:30px;padding-right:30px">Continue
                                                                          Shopping
                                                                      </a></span>
                                                              </td>
                                                          </tr>
                                                    
                                                      </table>
                                                  </td>
                                              </tr>
                                          </table>
                                      </td>
                                  </tr>
                              </table>
                          </td>
                      </tr>
                  </table>
                  <table cellpadding="0" cellspacing="0" class="es-content" align="center"
                      style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
                      <tr>
                          <td align="center" style="padding:0;Margin:0">
                              <table class="es-content-body" align="center" cellpadding="0" cellspacing="0"
                                  style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px">
                                  <tr>
                                      <td align="left" bgcolor="#ffffff"
                                          style="Margin:0;padding-top:20px;padding-left:20px;padding-right:20px;padding-bottom:40px;background-color:#ffffff;border-radius:0px 0px 5px 5px">
                                          <!--[if mso]><table style="width:560px" cellpadding="0" cellspacing="0"><tr><td style="width:145px" valign="top"><![endif]-->
                                          <table cellpadding="0" cellspacing="0" class="es-left" align="left"
                                              style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left">
                                              <tr>
                                                  <td class="es-m-p0r es-m-p20b" align="center"
                                                      style="padding:0;Margin:0;width:125px">
                                                      <table cellpadding="0" cellspacing="0" width="100%"
                                                          style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                          <tr>
                                                              <td align="center"
                                                                  style="padding:0;Margin:0;display:none"></td>
                                                          </tr>
                                                      </table>
                                                  </td>
                                                  <td class="es-hidden" style="padding:0;Margin:0;width:20px"></td>
                                              </tr>
                                          </table><!--[if mso]></td><td style="width:145px" valign="top"><![endif]-->
                                          <table cellpadding="0" cellspacing="0" class="es-left" align="left"
                                              style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left">
                                              <tr>
                                                  <td class="es-m-p0r es-m-p20b" align="center"
                                                      style="padding:0;Margin:0;width:125px">
                                                      <table cellpadding="0" cellspacing="0" width="100%"
                                                          style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                          <tr>
                                                              <td align="center"
                                                                  style="padding:0;Margin:0;display:none"></td>
                                                          </tr>
                                                      </table>
                                                  </td>
                                                  <td class="es-hidden" style="padding:0;Margin:0;width:20px"></td>
                                              </tr>
                                          </table><!--[if mso]></td><td style="width:125px" valign="top"><![endif]-->
                                          <table cellpadding="0" cellspacing="0" class="es-left" align="left"
                                              style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left">
                                              <tr>
                                                  <td class="es-m-p0r es-m-p20b" align="center"
                                                      style="padding:0;Margin:0;width:125px">
                                                      <table cellpadding="0" cellspacing="0" width="100%"
                                                          style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                          <tr>
                                                              <td align="center"
                                                                  style="padding:0;Margin:0;display:none"></td>
                                                          </tr>
                                                      </table>
                                                  </td>
                                              </tr>
                                          </table>
                                          <!--[if mso]></td><td style="width:20px"></td><td style="width:125px" valign="top"><![endif]-->
                                          <table cellpadding="0" cellspacing="0" class="es-right" align="right"
                                              style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:right">
                                              <tr>
                                                  <td class="es-m-p0r" align="center"
                                                      style="padding:0;Margin:0;width:125px">
                                                      <table cellpadding="0" cellspacing="0" width="100%"
                                                          style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                          <tr>
                                                              <td align="center"
                                                                  style="padding:0;Margin:0;display:none"></td>
                                                          </tr>
                                                      </table>
                                                  </td>
                                              </tr>
                                          </table><!--[if mso]></td></tr></table><![endif]-->
                                      </td>
                                  </tr>
                              </table>
                          </td>
                      </tr>
                  </table>
                  <table cellpadding="0" cellspacing="0" class="es-footer" align="center"
                      style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top">
                      <tr>
                          <td align="center" style="padding:0;Margin:0">
                              <table bgcolor="#ffffff" class="es-footer-body" align="center" cellpadding="0"
                                  cellspacing="0"
                                  style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px">
                                  <tr>
                                      <td class="esdev-adapt-off" align="left"
                                          style="padding:0;Margin:0;padding-top:20px;padding-left:20px;padding-right:20px">
                                          <table cellpadding="0" cellspacing="0" class="esdev-mso-table"
                                              style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:560px">
                                              <tr>
                                                 
                                                  <td style="padding:0;Margin:0;width:10px"></td>
                                                  <td class="esdev-mso-td" valign="top" style="padding:0;Margin:0">
                                                      <table cellpadding="0" cellspacing="0" class="es-left"
                                                          align="left"
                                                          style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left">
                                                          <tr>
                                                              <td align="left" style="padding:0;Margin:0;width:139px">
                                                                  <table cellpadding="0" cellspacing="0" width="100%"
                                                                      style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                                      <tr>
                                                                          <td align="right" class="es-m-p0t"
                                                                              style="padding:0;Margin:0;padding-top:10px">
                                                                              <p
                                                                                  style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Poppins, sans-serif;line-height:21px;color:#022B3A;font-size:14px">
                                                                                  Download the app:</p>
                                                                          </td>
                                                                      </tr>
                                                                  </table>
                                                              </td>
                                                          </tr>
                                                      </table>
                                                  </td>
                                                  <td style="padding:0;Margin:0;width:10px"></td>
                                                  <td class="esdev-mso-td" valign="top" style="padding:0;Margin:0">
                                                      <table cellpadding="0" cellspacing="0" class="es-left"
                                                          align="left"
                                                          style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left;color: #fff;">
                                                          <tr>
                                                              <td align="left" style="padding:0;Margin:0;width:40px">
                                                                  <table cellpadding="0" cellspacing="0" width="100%"
                                                                      style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                                      <tr>
                                                                          <td align="right"
                                                                              style="padding:0;Margin:0;font-size:0px">
                                                                              <a target="_blank"
                                                                                  href="https://www.gpcpins.com"
                                                                                  style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#022B3A;font-size:14px"><img
                                                                                      src="https://www.gpcpins.com/images/social/appstore.png"
                                                                                      alt="Download on the app store"
                                                                                     
                                                                                      style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"
                                                                                      title="Download on the app store"
                                                                                      width="40"></a>
                                                                          </td>
                                                                      </tr>
                                                                  </table>
                                                              </td>
                                                          </tr>
                                                      </table>
                                                  </td>
                                                  <td style="padding:0;Margin:0;width:10px"></td>
                                                  <td class="esdev-mso-td" valign="top" style="padding:0;Margin:0">
                                                      <table cellpadding="0" cellspacing="0" class="es-right"
                                                          align="right"
                                                          style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:right">
                                                          <tr>
                                                              <td align="left" style="padding:0;Margin:0;width:40px">
                                                                  <table cellpadding="0" cellspacing="0" width="100%"
                                                                      style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                                      <tr>
                                                                          <td align="right"
                                                                              style="padding:0;Margin:0;font-size:0px">
                                                                              <a target="_blank"
                                                                                  href="https://www.gpcpins.com"
                                                                                  style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#022B3A;font-size:14px"><img
                                                                                  src="https://www.gpcpins.com/images/social/playstore.png"
                                                                            
                                                                                      alt="Get it on google play"
                                                                                    
                                                                                      style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"
                                                                                      title="Get it on google play"
                                                                                      width="40"></a>
                                                                          </td>
                                                                      </tr>
                                                                  </table>
                                                              </td>
                                                          </tr>
                                                      </table>
                                                  </td>
                                              </tr>
                                          </table>
                                      </td>
                                  </tr>
                                  <tr>
                                      <td align="left"
                                          style="Margin:0;padding-top:20px;padding-bottom:20px;padding-left:20px;padding-right:20px">
                                          <table cellpadding="0" cellspacing="0" width="100%"
                                              style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                              <tr>
                                                  <td align="left" style="padding:0;Margin:0;width:560px">
                                                      <table cellpadding="0" cellspacing="0" width="100%"
                                                          style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                          <tr>
                                                              <td align="center"
                                                                  style="padding:0;Margin:0;padding-top:20px;padding-bottom:30px;font-size:0">
                                                                  <table cellpadding="0" cellspacing="0"
                                                                      class="es-table-not-adapt es-social"
                                                                      style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                                      <tr>
                                                                          <td align="center" valign="top"
                                                                              style="padding:0;Margin:0;padding-right:10px">
                                                                              <a target="_blank"
                                                                                  href="https://www.gpcpins.com"
                                                                                  style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#022B3A;font-size:14px">
                                                                                  <img title="Facebook"
                                                                                
                                                                                 
                                                                                  src="https://www.gpcpins.com/images/social/facebook.png"
                                                                                
                                                                                      alt="Fb" height="32"
                                                                                      style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"></a>
                                                                          </td>
                                                                          <td align="center" valign="top"
                                                                              style="padding:0;Margin:0;padding-right:10px">
                                                                              <a target="_blank"
                                                                                  href="https://www.gpcpins.com"
                                                                                  style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#022B3A;font-size:14px"><img
                                                                                      title="Twitter"
                                                                                     
                                                                                      src="https://www.gpcpins.com/images/social/twitter.png"
                                                                                     
                                                                                      alt="Tw" height="32"
                                                                                      style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"></a>
                                                                          </td>
                                                                          <td align="center" valign="top"
                                                                              style="padding:0;Margin:0;padding-right:10px">
                                                                              <a target="_blank"
                                                                                  href="https://www.gpcpins.com"
                                                                                  style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#022B3A;font-size:14px"><img
                                                                                      title="Instagram"
                                                                                 
                                                                                      src="https://www.gpcpins.com/images/social/instagram.png"
                                                                                 
                                                                                      alt="Inst" height="32"
                                                                                      style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"></a>
                                                                          </td>
                                                                          <td align="center" valign="top"
                                                                              style="padding:0;Margin:0"><a
                                                                                  target="_blank"
                                                                                  href="https://www.gpcpins.com"
                                                                                  style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#022B3A;font-size:14px"><img
                                                                                      title="Youtube"
                                                                                 
                                                                                      src="https://www.gpcpins.com/images/social/youtube.png"
                                                                                      alt="Yt" height="32"
                                                                                      style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"></a>
                                                                          </td>
                                                                      </tr>
                                                                  </table>
                                                              </td>
                                                          </tr>
                                                          <tr>
                                                              <td align="center" style="padding:0;Margin:0">
                                                                  <p
                                                                      style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Poppins, sans-serif;line-height:21px;color:#022B3A;font-size:14px">


                                                                      <a href="https://www.gpcpins.com/privacy-policy"
                                                                          target="_blank"
                                                                          style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#022B3A;font-size:14px">Privacy
                                                                          Policy</a>&nbsp;and
                                                                      <a href="https://www.gpcpins.com/terms-and-conditions"
                                                                          target="_blank"
                                                                          style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#022B3A;font-size:14px">Terms
                                                                          of Service</a>


                                                                      <br><br>Menhyia-Opposite St.
                                                                      Anne's International School,
                                                                      Ashtown, Kumasi, Ghana, 0322036582
                                                                      <br><br>©
                                                                      ${new Date().getFullYear()}&nbsp;Gab Powerful Consult<br><br><a
                                                                          href="https://www.gpcpins.com"
                                                                          target="_blank"
                                                                          style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#022B3A;font-size:14px">View
                                                                          Online</a>
                                                                  </p>
                                                              </td>
                                                          </tr>
                                                      </table>
                                                  </td>
                                              </tr>
                                          </table>
                                      </td>
                                  </tr>
                              </table>
                          </td>
                      </tr>
                  </table>
                  <table cellpadding="0" cellspacing="0" class="es-footer" align="center"
                      style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top">
                      <tr>
                          <td align="center" style="padding:0;Margin:0">
                              <table bgcolor="#ffffff" class="es-footer-body" align="center" cellpadding="0"
                                  cellspacing="0"
                                  style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px">
                                  <tr>
                                      <td align="left" style="padding:20px;Margin:0">
                                          <table cellpadding="0" cellspacing="0" width="100%"
                                              style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">

                                          </table>
                                      </td>
                                  </tr>
                              </table>
                          </td>
                      </tr>
                  </table>
              </td>
          </tr>
      </table>
  </div>
</body>

</html>`,
  ecgText: (id, message) => `
  <!DOCTYPE html
    PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en"
    style="font-family:arial, 'helvetica neue', helvetica, sans-serif">

<head>
    <meta charset="UTF-8">
    <meta content="width=device-width, initial-scale=1" name="viewport">
    <meta name="x-apple-disable-message-reformatting">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta content="telephone=no" name="format-detection">
    <title>Gab Powerful Consult</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins&display=swap" rel="stylesheet"><!--<![endif]-->
   ${style}
</head>

<body
    style="width:100%;background-color:#fff;font-family:arial, 'helvetica neue', helvetica, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0">
    <div dir="ltr" class="es-wrapper-color" lang="en" style="background-color:#fff;">

        <table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0"
            style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;background-color:#ffffff">
            <tr>
                <td valign="top" style="padding:0;Margin:0">
                    <table cellpadding="0" cellspacing="0" class="es-header" align="center"
                        style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top">
                        <tr>
                            <td align="center" style="padding:0;Margin:0">
                                <table bgcolor="#ffffff" class="es-header-body" align="center" cellpadding="0"
                                    cellspacing="0"
                                    style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px">
                                    <tr>
                                        <td align="left" style="padding:20px;Margin:0">
                                            <table cellpadding="0" cellspacing="0" width="100%"
                                                style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                <tr>
                                                    <td class="es-m-p0r" valign="top" align="center"
                                                        style="padding:0;Margin:0;width:560px">
                                                        <table cellpadding="0" cellspacing="0" width="100%"
                                                            style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                            <tr>
                                                                <td align="center" class="es-m-txt-c"
                                                                    style="padding:0;Margin:0;font-size:0px"><a
                                                                        target="_blank" href="https://www.gpcpins.com"
                                                                        style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#022B3A;font-size:14px"><img
                                                                            src="https://www.gpcpins.com/logo.png"
                                                                          height='120'
                                                                            alt="Logo"
                                                                            style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"
                                                                            width="120" title="Logo"></a></td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                    <table class="es-content" cellspacing="0" cellpadding="0" align="center"
                        style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
                        <tr>
                            <td align="center" style="padding:0;Margin:0">
                                <table class="es-content-body"
                                    style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px"
                                    cellspacing="0" cellpadding="0" align="center">
                                    <tr>
                                        <td align="left" bgcolor="#ffffff"
                                            style="padding:20px;Margin:0;background-color:#ffffff;border-radius:5px 5px 0px 0px">
                                            <table width="100%" cellspacing="0" cellpadding="0"
                                                style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                <tr>
                                                    <td class="es-m-p0r es-m-p20b" valign="top" align="center"
                                                        style="padding:0;Margin:0;width:560px">
                                                        <table width="100%" cellspacing="0" cellpadding="0"
                                                            style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:separate;border-spacing:0px;border-radius:5px">
                                                         
                                                            <tr>
                                                                <td align="center"
                                                                    style="Margin:0;padding-top:10px;padding-bottom:10px;padding-left:20px;padding-right:20px">
                                                                    <h1
                                                                        style="Margin:0;line-height:43px;mso-line-height-rule:exactly;font-family:Poppins, sans-serif;font-size:36px;font-style:normal;font-weight:bold;color:#022B3A">
                                                                        Thank you for purchasing from us.</h1>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td align="center"
                                                                    style="Margin:0;padding-top:10px;padding-bottom:20px;padding-left:20px;padding-right:20px">
                                                                    <p> ${message} </p>
                                                                    <p> Attached to this a copy of your receipt. </p>

                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                    <table cellpadding="0" cellspacing="0" class="es-content" align="center"
                        style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
                        <tr>
                            <td align="center" style="padding:0;Margin:0">
                                <table bgcolor="#ffffff" class="es-content-body" align="center" cellpadding="0"
                                    cellspacing="0"
                                    style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px">
                                    <tr>
                                        <td align="left" style="padding:20px;Margin:0">
                                            <!--[if mso]><table style="width:560px" cellpadding="0" cellspacing="0"><tr><td style="width:270px" valign="top"><![endif]-->
                                            <table cellpadding="0" cellspacing="0" class="es-left" align="left"
                                                style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left">
                                                <tr>
                                                    <td class="es-m-p20b" align="left"
                                                        style="padding:0;Margin:0;width:270px">
                                                        <table cellpadding="0" cellspacing="0" width="100%"
                                                            style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                            <tr>
                                                                <td align="left" style="padding:0;Margin:0">
                                                                    <h3
                                                                        style="Margin:0;line-height:24px;mso-line-height-rule:exactly;font-family:Poppins, sans-serif;font-size:20px;font-style:normal;font-weight:bold;color:#022B3A">
                                                                        Transaction ID:</h3>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                            <!--[if mso]></td><td style="width:20px"></td><td style="width:270px" valign="top"><![endif]-->
                                            <table cellpadding="0" cellspacing="0" class="es-right" align="right"
                                                style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:right">
                                                <tr>
                                                    <td align="left" style="padding:0;Margin:0;width:270px">
                                                        <table cellpadding="0" cellspacing="0" width="100%"
                                                            style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">

                                                        </table>
                                                    </td>
                                                </tr>
                                            </table><!--[if mso]></td></tr></table><![endif]-->
                                        </td>
                                    </tr>
                                    <tr>
                                        <td align="left"
                                            style="padding:0;Margin:0;padding-bottom:20px;padding-left:20px;padding-right:20px">
                                            <table cellpadding="0" cellspacing="0" width="100%"
                                                style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                <tr>
                                                    <td align="center" valign="top"
                                                        style="padding:0;Margin:0;width:560px">
                                                        <table cellpadding="0" cellspacing="0" width="100%"
                                                            style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:separate;border-spacing:0px;border-radius:5px;background-color:#f2fcfe"
                                                            bgcolor="">
                                                            <tr style="background-color: #f0f0f4;">
                                                                <td align="center"
                                                                    style="padding:0;Margin:0;padding-top:15px;padding-bottom:15px">
                                                                    <h1
                                                                        style="Margin:0;line-height:43px;mso-line-height-rule:exactly;font-family:Poppins, sans-serif;font-size:36px;font-style:normal;font-weight:bold;color:#022B3A">
                                                                        <strong>${id}</strong>
                                                                    </h1>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td align="center" valign="top"
                                                        style="padding:0;Margin:0;width:560px">
                                                        <table cellpadding="0" cellspacing="0" width="100%"
                                                            style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:separate;border-spacing:0px;border-radius:5px">
                                                            <tr>
                                                                <td align="center"
                                                                    style="padding:0;Margin:0;padding-bottom:10px;padding-top:20px">
                                                                    <span class="es-button-border"
                                                                        style="border-style:solid;border-color:#2CB543;background:#22287d;border-width:0px;display:inline-block;border-radius:6px;width:auto"><a
                                                                            href="https://www.gpcpins.com"
                                                                            class="es-button" target="_blank"
                                                                            style="mso-style-priority:100 !important;text-decoration:none;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;color:#FFFFFF;font-size:18px;padding:10px 20px 10px 20px;display:inline-block;background:#22287d;border-radius:6px;font-family:Poppins, sans-serif;font-weight:normal;font-style:normal;line-height:22px;width:auto;text-align:center;mso-padding-alt:0;mso-border-alt:10px solid #22287d;padding-left:30px;padding-right:30px">Continue
                                                                            Shopping
                                                                        </a></span>
                                                                </td>
                                                            </tr>
                                                         
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                    <table cellpadding="0" cellspacing="0" class="es-content" align="center"
                        style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
                        <tr>
                            <td align="center" style="padding:0;Margin:0">
                                <table class="es-content-body" align="center" cellpadding="0" cellspacing="0"
                                    style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px">
                                    <tr>
                                        <td align="left" bgcolor="#ffffff"
                                            style="Margin:0;padding-top:20px;padding-left:20px;padding-right:20px;padding-bottom:40px;background-color:#ffffff;border-radius:0px 0px 5px 5px">
                                            <!--[if mso]><table style="width:560px" cellpadding="0" cellspacing="0"><tr><td style="width:145px" valign="top"><![endif]-->
                                            <table cellpadding="0" cellspacing="0" class="es-left" align="left"
                                                style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left">
                                                <tr>
                                                    <td class="es-m-p0r es-m-p20b" align="center"
                                                        style="padding:0;Margin:0;width:125px">
                                                        <table cellpadding="0" cellspacing="0" width="100%"
                                                            style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                            <tr>
                                                                <td align="center"
                                                                    style="padding:0;Margin:0;display:none"></td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                    <td class="es-hidden" style="padding:0;Margin:0;width:20px"></td>
                                                </tr>
                                            </table><!--[if mso]></td><td style="width:145px" valign="top"><![endif]-->
                                            <table cellpadding="0" cellspacing="0" class="es-left" align="left"
                                                style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left">
                                                <tr>
                                                    <td class="es-m-p0r es-m-p20b" align="center"
                                                        style="padding:0;Margin:0;width:125px">
                                                        <table cellpadding="0" cellspacing="0" width="100%"
                                                            style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                            <tr>
                                                                <td align="center"
                                                                    style="padding:0;Margin:0;display:none"></td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                    <td class="es-hidden" style="padding:0;Margin:0;width:20px"></td>
                                                </tr>
                                            </table><!--[if mso]></td><td style="width:125px" valign="top"><![endif]-->
                                            <table cellpadding="0" cellspacing="0" class="es-left" align="left"
                                                style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left">
                                                <tr>
                                                    <td class="es-m-p0r es-m-p20b" align="center"
                                                        style="padding:0;Margin:0;width:125px">
                                                        <table cellpadding="0" cellspacing="0" width="100%"
                                                            style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                            <tr>
                                                                <td align="center"
                                                                    style="padding:0;Margin:0;display:none"></td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                            <!--[if mso]></td><td style="width:20px"></td><td style="width:125px" valign="top"><![endif]-->
                                            <table cellpadding="0" cellspacing="0" class="es-right" align="right"
                                                style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:right">
                                                <tr>
                                                    <td class="es-m-p0r" align="center"
                                                        style="padding:0;Margin:0;width:125px">
                                                        <table cellpadding="0" cellspacing="0" width="100%"
                                                            style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                            <tr>
                                                                <td align="center"
                                                                    style="padding:0;Margin:0;display:none"></td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table><!--[if mso]></td></tr></table><![endif]-->
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                    <table cellpadding="0" cellspacing="0" class="es-footer" align="center"
                        style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top">
                        <tr>
                            <td align="center" style="padding:0;Margin:0">
                                <table bgcolor="#ffffff" class="es-footer-body" align="center" cellpadding="0"
                                    cellspacing="0"
                                    style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px">
                                    <tr>
                                        <td class="esdev-adapt-off" align="left"
                                            style="padding:0;Margin:0;padding-top:20px;padding-left:20px;padding-right:20px">
                                            <table cellpadding="0" cellspacing="0" class="esdev-mso-table"
                                                style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:560px">
                                                <tr>
                                                    
                                                    <td style="padding:0;Margin:0;width:10px"></td>
                                                    <td class="esdev-mso-td" valign="top" style="padding:0;Margin:0">
                                                        <table cellpadding="0" cellspacing="0" class="es-left"
                                                            align="left"
                                                            style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left">
                                                            <tr>
                                                                <td align="left" style="padding:0;Margin:0;width:139px">
                                                                    <table cellpadding="0" cellspacing="0" width="100%"
                                                                        style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                                        <tr>
                                                                            <td align="right" class="es-m-p0t"
                                                                                style="padding:0;Margin:0;padding-top:10px">
                                                                                <p
                                                                                    style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Poppins, sans-serif;line-height:21px;color:#022B3A;font-size:14px">
                                                                                    Download the app:</p>
                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                    <td style="padding:0;Margin:0;width:10px"></td>
                                                    <td class="esdev-mso-td" valign="top" style="padding:0;Margin:0">
                                                        <table cellpadding="0" cellspacing="0" class="es-left"
                                                            align="left"
                                                            style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left;color: #fff;">
                                                            <tr>
                                                                <td align="left" style="padding:0;Margin:0;width:40px">
                                                                    <table cellpadding="0" cellspacing="0" width="100%"
                                                                        style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                                        <tr>
                                                                            <td align="right"
                                                                                style="padding:0;Margin:0;font-size:0px">
                                                                                <a target="_blank"
                                                                                    href="https://www.gpcpins.com"
                                                                                    style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#022B3A;font-size:14px"><img
                                                                                    src="https://www.gpcpins.com/images/social/appstore.png"
                                                                                        alt="Download on the app store"
                                                                                     
                                                                                        style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"
                                                                                        title="Download on the app store"
                                                                                        width="40"></a>
                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                    <td style="padding:0;Margin:0;width:10px"></td>
                                                    <td class="esdev-mso-td" valign="top" style="padding:0;Margin:0">
                                                        <table cellpadding="0" cellspacing="0" class="es-right"
                                                            align="right"
                                                            style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:right">
                                                            <tr>
                                                                <td align="left" style="padding:0;Margin:0;width:40px">
                                                                    <table cellpadding="0" cellspacing="0" width="100%"
                                                                        style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                                        <tr>
                                                                            <td align="right"
                                                                                style="padding:0;Margin:0;font-size:0px">
                                                                                <a target="_blank"
                                                                                    href="https://www.gpcpins.com"
                                                                                    style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#022B3A;font-size:14px"><img
                                                                                    src="https://www.gpcpins.com/images/social/playstore.png"
                                                                                        alt="Get it on google play"
                                                                                      
                                                                                        style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"
                                                                                        title="Get it on google play"
                                                                                        width="40"></a>
                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td align="left"
                                            style="Margin:0;padding-top:20px;padding-bottom:20px;padding-left:20px;padding-right:20px">
                                            <table cellpadding="0" cellspacing="0" width="100%"
                                                style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                <tr>
                                                    <td align="left" style="padding:0;Margin:0;width:560px">
                                                        <table cellpadding="0" cellspacing="0" width="100%"
                                                            style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                            <tr>
                                                                <td align="center"
                                                                    style="padding:0;Margin:0;padding-top:20px;padding-bottom:30px;font-size:0">
                                                                    <table cellpadding="0" cellspacing="0"
                                                                        class="es-table-not-adapt es-social"
                                                                        style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                                        <tr>
                                                                            <td align="center" valign="top"
                                                                                style="padding:0;Margin:0;padding-right:10px">
                                                                                <a target="_blank"
                                                                                    href="https://www.gpcpins.com"
                                                                                    style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#022B3A;font-size:14px">
                                                                                    <img title="Facebook"
                                                                                  
                                                                                    src="https://www.gpcpins.com/images/social/facebook.png"
                                                                                        alt="Fb" height="32"
                                                                                        style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"></a>
                                                                            </td>
                                                                            <td align="center" valign="top"
                                                                                style="padding:0;Margin:0;padding-right:10px">
                                                                                <a target="_blank"
                                                                                    href="https://www.gpcpins.com"
                                                                                    style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#022B3A;font-size:14px"><img
                                                                                        title="Twitter"
                                                                                     
                                                                                        src="https://www.gpcpins.com/images/social/twitter.png"
                                                                                        alt="Tw" height="32"
                                                                                        style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"></a>
                                                                            </td>
                                                                            <td align="center" valign="top"
                                                                                style="padding:0;Margin:0;padding-right:10px">
                                                                                <a target="_blank"
                                                                                    href="https://www.gpcpins.com"
                                                                                    style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#022B3A;font-size:14px"><img
                                                                                        title="Instagram"
                                                                               
                                                                                        src="https://www.gpcpins.com/images/social/instagram.png"
                                                                                        alt="Inst" height="32"
                                                                                        style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"></a>
                                                                            </td>
                                                                            <td align="center" valign="top"
                                                                                style="padding:0;Margin:0"><a
                                                                                    target="_blank"
                                                                                    href="https://www.gpcpins.com"
                                                                                    style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#022B3A;font-size:14px"><img
                                                                                        title="Youtube"
                                                                                        src="https://www.gpcpins.com/images/social/youtube.png"
                                                                                        alt="Yt" height="32"
                                                                                   
                                                                                        style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"></a>
                                                                            </td>
                                                                        </tr>
                                                                    </table>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td align="center" style="padding:0;Margin:0">
                                                                    <p
                                                                        style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:Poppins, sans-serif;line-height:21px;color:#022B3A;font-size:14px">


                                                                        <a href="https://www.gpcpins.com/privacy-policy"
                                                                            target="_blank"
                                                                            style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#022B3A;font-size:14px">Privacy
                                                                            Policy</a>&nbsp;and
                                                                        <a href="https://www.gpcpins.com/terms-and-conditions"
                                                                            target="_blank"
                                                                            style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#022B3A;font-size:14px">Terms
                                                                            of Service</a>


                                                                        <br><br>Menhyia-Opposite St.
                                                                        Anne's International School,
                                                                        Ashtown, Kumasi, Ghana, 0322036582
                                                                        <br><br>©
                                                                        ${new Date().getFullYear()}&nbsp;Gab Powerful Consult<br><br><a
                                                                            href="https://www.gpcpins.com"
                                                                            target="_blank"
                                                                            style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#022B3A;font-size:14px">View
                                                                            Online</a>
                                                                    </p>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                    <table cellpadding="0" cellspacing="0" class="es-footer" align="center"
                        style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top">
                        <tr>
                            <td align="center" style="padding:0;Margin:0">
                                <table bgcolor="#ffffff" class="es-footer-body" align="center" cellpadding="0"
                                    cellspacing="0"
                                    style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px">
                                    <tr>
                                        <td align="left" style="padding:20px;Margin:0">
                                            <table cellpadding="0" cellspacing="0" width="100%"
                                                style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">

                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </div>
</body>

</html>
  
  
  `,
};
