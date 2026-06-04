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
     <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
     ${htmlText}
     </div>
     </body>
     </html>
    
     `;
  },

  mailTextShell: (stuff) => `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en" style="font-family: 'Poppins', arial, 'helvetica neue', helvetica, sans-serif;">
<head>
  <meta charset="UTF-8">
  <meta content="width=device-width, initial-scale=1" name="viewport">
  <meta name="x-apple-disable-message-reformatting">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta content="telephone=no" name="format-detection">
  <title>Gab Powerful Consult</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style type="text/css">
    /* General reset & client-friendly */
    body, table, td, p, a { margin:0; padding:0; border:0; font-size:100%; }
    body { background-color:#f4f7fb; margin:0; padding:0; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
    table { border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; }
    img { border:0; height:auto; line-height:100%; outline:none; text-decoration:none; -ms-interpolation-mode:bicubic; }
    /* Responsive */
    @media only screen and (max-width: 600px) {
      .responsive-table { width:100% !important; }
      .stack-cell { display:block !important; width:100% !important; text-align:center !important; }
      .btn-mobile { width:100% !important; display:block !important; }
      .mobile-padding { padding-left:20px !important; padding-right:20px !important; }
      .logo-img { width:70px !important; height:70px !important; }
    }
    /* DARK MODE STYLES (system preference) */
    @media (prefers-color-scheme: dark) {
      body { background-color:#121826 !important; }
      .dark-bg-primary { background-color:#121826 !important; }
      .dark-card-bg { background-color:#1E2636 !important; }
      .dark-text-primary { color:#EFF3F8 !important; }
      .dark-text-secondary { color:#B9C7D9 !important; }
      .dark-border { border-color:#2E3A4A !important; }
      .dark-link { color:#8AB4F8 !important; }
      .dark-button { background-color:#2D3A5E !important; box-shadow:none !important; }
      .dark-muted-bg { background-color:#1A212F !important; }
      hr.dark-hr { background:#2E3A4A !important; }
      .dark-footer-bg { background-color:#131A26 !important; }
      /* override inline styles via important where needed */
      .es-wrapper-color { background-color:#121826 !important; }
      .es-header-body table td a, .es-content-body table td p, .footer-text { color:#B9C7D9 !important; }
    }
  </style>
  
</head>
<body style="margin:0; padding:0; background-color:#f4f7fb; font-family:'Poppins', arial, 'helvetica neue', helvetica, sans-serif; -webkit-font-smoothing:antialiased;">
  <div dir="ltr" class="es-wrapper-color" lang="en" style="background-color:#f4f7fb;">
    <table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;background-color:#f4f7fb;">
      <tr>
        <td valign="top" style="padding:0;Margin:0;">
          <!-- HEADER: Logo + brand (modern clean) -->
          <table cellpadding="0" cellspacing="0" class="es-header" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;">
            <tr>
              <td align="center" style="padding:0;Margin:0;">
                <table bgcolor="#ffffff" class="es-header-body" align="center" cellpadding="0" cellspacing="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px;">
                  <tr>
                    <td align="left" style="padding:30px 20px 20px;Margin:0;">
                      <table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;">
                        <tr>
                          <td valign="top" align="center" style="padding:0;Margin:0;">
                            <table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;">
                              <tr>
                                <td align="center" style="padding:0;Margin:0;font-size:0px;">
                                  <a target="_blank" href="https://www.gpcpins.com" style="text-decoration:none;">
                                    <img src="https://www.gpcpins.com/logo.png" height="80" width="80" alt="Gab Powerful Consult" style="display:block; border-radius:24px; box-shadow:0 6px 14px rgba(0,0,0,0.05);" title="Logo">
                                  </a>
                                 </td>
                               </tr>
                               <tr>
                                <td align="center" style="padding:12px 0 0;">
                                  <a target="_blank" href="https://www.gpcpins.com" style="text-decoration:none; font-size:18px; font-weight:600; color:#1F2B44; letter-spacing:-0.2px;">Gab Powerful Consult</a>
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

          <!-- MAIN CONTENT CARD (rounded, shadow, dynamic content) -->
          <table class="es-content" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;">
            <tr>
              <td align="center" style="padding:0;Margin:0;">
                <table class="es-content-body" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px;" cellspacing="0" cellpadding="0" align="center">
                  <tr>
                    <td align="left" bgcolor="#ffffff" style="padding:24px 28px 32px; Margin:0; background-color:#ffffff; border-radius:32px; box-shadow:0 12px 28px rgba(0,0,0,0.04);">
                      <!-- dynamic content wrapper (stuff) with responsive inner padding -->
                      <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 540px; margin:0 auto; color:#1A2C3E;">
                        ${stuff}
                      </div>
                     </td>
                   </tr>
                 </table>
               </td>
             </tr>
           </table>

          <!-- FOOTER: app badges + social + legal (modern dark-mode ready) -->
          <table cellpadding="0" cellspacing="0" class="es-footer" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;">
            <tr>
              <td align="center" style="padding:20px 20px 30px;">
                <table bgcolor="#ffffff" class="es-footer-body" align="center" cellpadding="0" cellspacing="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px;">
                  <tr>
                    <td align="left" style="padding:0 20px;">
                      <!-- App badges row (modern) -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;">
                        <tr>
                          <td align="center" style="padding:12px 0 8px;">
                            <span style="font-size:14px; font-weight:500; color:#2C4A5E;">📱 Download our app</span>
                           </td>
                         </tr>
                         <tr>
                          <td align="center" style="padding:0 0 20px;">
                            <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                              <tr>
                                <td style="padding:0 8px;"><a href="https://www.gpcpins.com" target="_blank"><img src="https://www.gpcpins.com/images/social/appstore.png" width="120" alt="App Store" style="display:block; border-radius:12px;"></a></td>
                                <td style="padding:0 8px;"><a href="https://www.gpcpins.com" target="_blank"><img src="https://www.gpcpins.com/images/social/playstore.png" width="120" alt="Google Play" style="display:block; border-radius:12px;"></a></td>
                              </tr>
                            </table>
                           </td>
                         </tr>
                       </table>

                      <!-- Social icons row -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px; margin-bottom:16px;">
                        <tr>
                          <td align="center" style="padding:10px 0;">
                            <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                              <tr>
                                <td style="padding:0 10px;"><a href="https://www.gpcpins.com" target="_blank"><img src="https://www.gpcpins.com/images/social/facebook.png" width="34" alt="Facebook" style="display:block;"></a></td>
                                <td style="padding:0 10px;"><a href="https://www.gpcpins.com" target="_blank"><img src="https://www.gpcpins.com/images/social/twitter.png" width="34" alt="Twitter" style="display:block;"></a></td>
                                <td style="padding:0 10px;"><a href="https://www.gpcpins.com" target="_blank"><img src="https://www.gpcpins.com/images/social/instagram.png" width="34" alt="Instagram" style="display:block;"></a></td>
                                <td style="padding:0 10px;"><a href="https://www.gpcpins.com" target="_blank"><img src="https://www.gpcpins.com/images/social/youtube.png" width="34" alt="YouTube" style="display:block;"></a></td>
                              </tr>
                            </table>
                           </td>
                         </tr>
                       </table>

                      <!-- Footer links + address + copyright -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;">
                        <tr>
                          <td align="center" style="padding:8px 0 12px; font-size:13px; color:#4F6F8F; line-height:1.6;">
                            <a href="https://www.gpcpins.com/privacy-policy" target="_blank" style="color:#1F2B44; text-decoration:none; font-weight:500;">Privacy Policy</a> &nbsp;•&nbsp;
                            <a href="https://www.gpcpins.com/terms-and-conditions" target="_blank" style="color:#1F2B44; text-decoration:none; font-weight:500;">Terms of Service</a> &nbsp;•&nbsp;
                            <a href="https://www.gpcpins.com" target="_blank" style="color:#1F2B44; text-decoration:none; font-weight:500;">View Online</a>
                            <br><br>
                            Menhyia - Opposite St. Anne's International School, Ashtown, Kumasi, Ghana<br>
                            📞 0322036582
                            <br><br>
                            © ${new Date().getFullYear()} Gab Powerful Consult – All rights reserved.
                            <br><br>
                            <span style="font-size:11px;">Need help? <a href="mailto:support@gpcpins.com" style="color:#1F2B44; text-decoration:none;">support@gpcpins.com</a></span>
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
   </div>

   <!-- Dark mode overrides for email clients that support inline (enhancement) -->
   <style>
    /* Additional robust dark mode overrides for email clients */
    @media (prefers-color-scheme: dark) {
      .es-wrapper-color, .es-wrapper { background-color: #121826 !important; }
      .es-header-body table td a, .es-header-body table td span { color: #EFF3F8 !important; }
      .es-content-body td[bgcolor="#ffffff"] { background-color: #1E2636 !important; }
      .es-footer-body td, .es-footer-body p, .es-footer-body span, .es-footer-body a { color: #B9C7D9 !important; }
      .es-footer-body a { color: #8AB4F8 !important; }
      div[style*="color:#1A2C3E"] { color: #EFF3F8 !important; }
    }
   </style>
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
                                                              <td>
                                                                  <h3
                                                                      style="Margin:0;line-height:43px;mso-line-height-rule:exactly;font-family:Poppins, sans-serif;font-size:36px;font-style:normal;font-weight:bold;color:#022B3A">
                                                                      Thank you for purchasing from us.</h3>
                                                              </td>
                                                          </tr>
                                                          <tr>
                                                              <td >
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
                                                                      style="Margin:0;line-height:43px;mso-line-height-rule:exactly;font-family:Poppins, sans-serif;font-size:36px;font-style:normal;font-weight:bold;color:#022B3A">
                                                                      <strong>${id}</strong>
                                                                  </p>
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

  thankYouText: (
    id,
  ) => `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en" style="font-family: 'Poppins', arial, 'helvetica neue', helvetica, sans-serif;">
<head>
  <meta charset="UTF-8">
  <meta content="width=device-width, initial-scale=1" name="viewport">
  <meta name="x-apple-disable-message-reformatting">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta content="telephone=no" name="format-detection">
  <title>Thank you | Gab Powerful Consult</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style type="text/css">
    /* Global resets & client fixes */
    body, table, td, p, a { margin:0; padding:0; border:0; font-size:100%; }
    body { background-color:#f6f9fc; width:100% !important; margin:0; padding:0; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
    table { border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; }
    img { border:0; height:auto; line-height:100%; outline:none; text-decoration:none; -ms-interpolation-mode:bicubic; }
    .yshortcuts a { border-bottom:none !important; }
    @media only screen and (max-width: 600px) {
      .responsive-table { width:100% !important; }
      .stack-cell { display:block !important; width:100% !important; text-align:center !important; }
      .btn-mobile { width:100% !important; text-align:center !important; }
      .hide-mobile { display:none !important; }
      .mobile-padding { padding-left:20px !important; padding-right:20px !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#f4f7fb; font-family:'Poppins', arial, 'helvetica neue', helvetica, sans-serif; -webkit-font-smoothing:antialiased;">
  <center style="width:100%;table-layout:fixed;">
    <div style="max-width:600px; margin:0 auto;">
      <!-- MAIN CONTAINER (email body) -->
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px; background-color:#f4f7fb; margin:0 auto;">
        <tr>
          <td align="center" style="padding:30px 20px 20px;">
            <!-- Logo + brand area (modern minimal) -->
            <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
              <tr>
                <td align="center" style="padding:10px 0 5px;">
                  <a href="https://www.gpcpins.com" target="_blank" style="text-decoration:none;">
                    <img src="https://www.gpcpins.com/logo.png" width="70" height="70" alt="Gab Powerful Consult" style="display:block; border-radius:16px; box-shadow:0 8px 18px rgba(0,0,0,0.05);">
                  </a>
                </td>
              </tr>
              <tr>
                <td align="center" style="padding-top:12px;">
                  <span style="font-size:18px; font-weight:600; color:#1A2C3E; letter-spacing:-0.3px;">Gab Powerful Consult</span>
                </td>
              </tr>
            </table>

            <!-- MAIN CARD (white card with shadow & rounded corners) -->
            <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:28px; box-shadow:0 12px 30px rgba(0,0,0,0.05); overflow:hidden;">
              <!-- Hero thank you section -->
              <tr>
                <td style="padding:32px 30px 20px; text-align:center; background: linear-gradient(135deg, #FFFFFF 0%, #F9FBFE 100%);">
                  <div style="font-size:56px; line-height:1.2; margin-bottom:12px;">🙏🏾✨</div>
                  <h1 style="font-size:32px; font-weight:700; color:#0B2B3B; margin:0 0 6px; letter-spacing:-0.5px;">Thank You!</h1>
                  <p style="font-size:16px; color:#2C4A5E; line-height:1.5; margin:8px 0 0;">Your transaction was successful & confirmed.</p>
                </td>
              </tr>

              <!-- Main message + attachment note -->
              <tr>
                <td style="padding:0 30px 0px;">
                  <p style="font-size:15px; color:#2E4A62; line-height:1.5; margin:0 0 12px; font-weight:400;">
                    We truly appreciate your trust and business. A digital copy of your <strong>voucher</strong> is attached to this email — keep it safe!
                  </p>
                  <div style="background:#F0F4F8; border-radius:18px; padding:8px 16px; display:inline-block; margin-bottom:20px;">
                    <span style="font-size:13px; font-weight:500; color:#1E6F5C;">📎 Voucher attached</span>
                  </div>
                </td>
              </tr>

              <!-- Transaction ID block (bold, modern badge) -->
              <tr>
                <td style="padding:0 30px;">
                  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background:#F8FAFE; border-radius:24px; border:1px solid #E9EDF2;">
                    <tr>
                      <td style="padding:22px 20px; text-align:center;">
                        <span style="font-size:14px; font-weight:500; text-transform:uppercase; letter-spacing:1.5px; color:#5F7F9C;">Transaction ID</span>
                        <div style="font-size:34px; font-weight:800; color:#0F2C3B; margin-top:10px; word-break:break-all; background:#ffffff; padding:12px 16px; border-radius:40px; display:inline-block; letter-spacing:-0.2px; font-family: monospace;">
                          ${id}
                        </div>
                        <p style="font-size:12px; color:#6A8DAA; margin-top:12px;">Use this ID for reference or support</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- CTA button + extra info -->
              <tr>
                <td style="padding:30px 30px 20px; text-align:center;">
                  <a href="https://www.gpcpins.com" target="_blank" style="display:inline-block; background:#1F2B44; color:#ffffff; font-size:16px; font-weight:600; text-decoration:none; padding:14px 32px; border-radius:48px; box-shadow:0 6px 14px rgba(31,43,68,0.2); transition:0.2s; letter-spacing:0.3px;">Continue Shopping →</a>
                  <p style="font-size:13px; color:#708AA2; margin-top:18px;">We look forward to serving you again soon.</p>
                </td>
              </tr>

              <!-- Divider -->
              <tr>
                <td style="padding:0 30px;">
                  <hr style="border:0; height:1px; background:linear-gradient(to right, #E0E8F0, #ffffff); margin:5px 0 0;">
                </td>
              </tr>

              <!-- App download + social (clean two-column layout) -->
              <tr>
                <td style="padding:20px 30px 25px;">
                  <table width="100%" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding-bottom:20px;">
                        <span style="font-size:14px; font-weight:500; color:#2C4A5E;">📱 Get our app for faster access</span>
                      </td>
                    </tr>
                    <tr>
                      <td align="center">
                        <table border="0" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                          <tr>
                            <td style="padding:0 10px;">
                              <a href="https://www.gpcpins.com" target="_blank"><img src="https://www.gpcpins.com/images/social/appstore.png" width="120" alt="App Store" style="display:block; border-radius:12px;"></a>
                            </td>
                            <td style="padding:0 10px;">
                              <a href="https://www.gpcpins.com" target="_blank"><img src="https://www.gpcpins.com/images/social/playstore.png" width="120" alt="Google Play" style="display:block; border-radius:12px;"></a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Social icons row -->
              <tr>
                <td align="center" style="padding:0 30px 20px;">
                  <table border="0" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                    <tr>
                      <td style="padding:0 12px;"><a href="https://www.gpcpins.com" target="_blank"><img src="https://www.gpcpins.com/images/social/facebook.png" width="36" alt="Facebook" style="display:block;"></a></td>
                      <td style="padding:0 12px;"><a href="https://www.gpcpins.com" target="_blank"><img src="https://www.gpcpins.com/images/social/twitter.png" width="36" alt="Twitter" style="display:block;"></a></td>
                      <td style="padding:0 12px;"><a href="https://www.gpcpins.com" target="_blank"><img src="https://www.gpcpins.com/images/social/instagram.png" width="36" alt="Instagram" style="display:block;"></a></td>
                      <td style="padding:0 12px;"><a href="https://www.gpcpins.com" target="_blank"><img src="https://www.gpcpins.com/images/social/youtube.png" width="36" alt="YouTube" style="display:block;"></a></td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Footer with links & address -->
              <tr>
                <td style="background:#F8FAFD; padding:24px 28px 30px; border-top:1px solid #E4EAF0;">
                  <table width="100%" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="font-size:13px; color:#4F6F8F; line-height:1.6;">
                        <a href="https://www.gpcpins.com/privacy-policy" target="_blank" style="color:#1F2B44; text-decoration:none; font-weight:500;">Privacy Policy</a> &nbsp;•&nbsp;
                        <a href="https://www.gpcpins.com/terms-and-conditions" target="_blank" style="color:#1F2B44; text-decoration:none; font-weight:500;">Terms of Service</a> &nbsp;•&nbsp;
                        <a href="https://www.gpcpins.com" target="_blank" style="color:#1F2B44; text-decoration:none; font-weight:500;">View Online</a>
                        <br><br>
                        Menhyia - Opposite St. Anne's International School, Ashtown, Kumasi, Ghana
                        <br>📞 0322036582
                        <br><br>
                        © ${new Date().getFullYear()} Gab Powerful Consult – All rights reserved.
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="padding-top:18px;">
                        <span style="font-size:11px; color:#8AA5C0;">Need help? Contact <a href="mailto:support@gpcpins.com" style="color:#1F2B44; text-decoration:none;">support@gpcpins.com</a></span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table> <!-- end main card -->

            <!-- tiny spacer for bottom -->
            <table width="100%" style="margin-top:20px;">
              <tr>
                <td align="center" style="font-size:10px; color:#9BB1C5; padding:15px 10px;">
                  This email was sent to our valued customer. If you did not make this purchase, please ignore.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  </center>
</body>
</html>`,


ecgText: (id, message) => `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en" style="font-family: 'Poppins', arial, 'helvetica neue', helvetica, sans-serif;">
<head>
  <meta charset="UTF-8">
  <meta content="width=device-width, initial-scale=1" name="viewport">
  <meta name="x-apple-disable-message-reformatting">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta content="telephone=no" name="format-detection">
  <title>Thank you | Gab Powerful Consult</title>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style type="text/css">
    /* Client-friendly resets */
    body, table, td, p, a { margin:0; padding:0; border:0; font-size:100%; }
    body { background-color:#f4f7fb; margin:0; padding:0; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
    table { border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; }
    img { border:0; height:auto; line-height:100%; outline:none; text-decoration:none; -ms-interpolation-mode:bicubic; }
    @media only screen and (max-width: 600px) {
      .responsive-table { width:100% !important; }
      .stack-cell { display:block !important; width:100% !important; text-align:center !important; }
      .btn-mobile { width:100% !important; text-align:center !important; }
      .mobile-padding { padding-left:20px !important; padding-right:20px !important; }
      .logo-img { width:70px !important; height:70px !important; }
    }
    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      body { background-color:#121826 !important; }
      .dark-wrapper { background-color:#121826 !important; }
      .dark-card { background-color:#1E2636 !important; }
      .dark-text-primary { color:#EFF3F8 !important; }
      .dark-text-secondary { color:#B9C7D9 !important; }
      .dark-border { border-color:#2E3A4A !important; }
      .dark-link { color:#8AB4F8 !important; }
      .dark-button { background-color:#2D3A5E !important; box-shadow:none !important; }
      .dark-muted-bg { background-color:#1A212F !important; }
      .dark-footer-bg { background-color:#131A26 !important; }
      hr.dark-hr { background:#2E3A4A !important; }
    }
  </style>
  ${style}
</head>
<body style="margin:0; padding:0; background-color:#f4f7fb; font-family:'Poppins', arial, 'helvetica neue', helvetica, sans-serif;">
  <div dir="ltr" class="dark-wrapper" style="background-color:#f4f7fb;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px; margin:0 auto; background-color:#f4f7fb;">
      <tr>
        <td align="center" style="padding:30px 20px 20px;">
          <!-- Logo + brand -->
          <table width="100%" style="margin-bottom:16px;">
            <tr>
              <td align="center" style="padding:10px 0 5px;">
                <a href="https://www.gpcpins.com" target="_blank" style="text-decoration:none;">
                  <img src="https://www.gpcpins.com/logo.png" width="70" height="70" alt="Gab Powerful Consult" style="display:block; border-radius:18px; box-shadow:0 8px 18px rgba(0,0,0,0.05);">
                </a>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-bottom:12px;">
                <span style="font-size:18px; font-weight:600; color:#1F2B44; letter-spacing:-0.2px;">Gab Powerful Consult</span>
              </td>
            </tr>
          </table>

          <!-- Main card container -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:32px; box-shadow:0 12px 28px rgba(0,0,0,0.04); overflow:hidden;">
            <!-- Hero section -->
            <tr>
              <td style="padding:36px 28px 16px; text-align:center; background: linear-gradient(135deg, #FFFFFF 0%, #F9FBFE 100%);">
                <div style="font-size:52px; margin-bottom:8px;">🙏✨</div>
                <h1 style="font-size:30px; font-weight:700; color:#0B2B3B; margin:0 0 6px; letter-spacing:-0.3px;">Thank You!</h1>
                <p style="font-size:15px; color:#2C4A5E; line-height:1.4;">Your purchase is confirmed with the details below.</p>
              </td>
            </tr>

            <!-- Dynamic message block -->
            <tr>
              <td style="padding:8px 28px 0px;">
                <div style="background:#F8FAFE; border-radius:24px; padding:18px 20px; border:1px solid #E9EDF2; font-size:15px; line-height:1.5; color:#1A2C3E;">
                  ${message}
                </div>
              </td>
            </tr>

            <!-- Transaction ID (prominent) -->
            <tr>
              <td style="padding:16px 28px 12px;">
                <table width="100%" style="background:#F0F4F9; border-radius:26px; border:1px solid #E4EAF0;">
                  <tr>
                    <td style="padding:22px 20px; text-align:center;">
                      <span style="font-size:13px; font-weight:600; text-transform:uppercase; letter-spacing:1.2px; color:#5F7F9C;">Transaction ID</span>
                      <div style="font-size:34px; font-weight:800; color:#0F2C3B; margin-top:10px; word-break:break-all; background:#ffffff; padding:10px 20px; border-radius:60px; display:inline-block; font-family: monospace; letter-spacing:-0.2px;">
                        ${id}
                      </div>
                      <p style="font-size:12px; color:#6A8DAA; margin-top:14px;">Keep this ID for support & reference</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- CTA button -->
            <tr>
              <td style="padding:12px 28px 30px; text-align:center;">
                <a href="https://www.gpcpins.com" target="_blank" style="display:inline-block; background:#1F2B44; color:#ffffff; font-size:16px; font-weight:600; text-decoration:none; padding:14px 34px; border-radius:50px; box-shadow:0 6px 14px rgba(31,43,68,0.2); letter-spacing:0.3px;">Continue Shopping →</a>
                <p style="font-size:13px; color:#708AA2; margin-top:18px;">We look forward to serving you again.</p>
              </td>
            </tr>

            <!-- Divider -->
            <tr>
              <td style="padding:0 28px;">
                <hr style="border:0; height:1px; background:linear-gradient(to right, #E0E8F0, #ffffff); margin:5px 0 0;">
              </td>
            </tr>

            <!-- App badges row -->
            <tr>
              <td style="padding:22px 28px 12px;">
                <table width="100%">
                  <tr>
                    <td align="center" style="padding-bottom:14px;">
                      <span style="font-size:14px; font-weight:500; color:#2C4A5E;">📱 Get our app</span>
                    </td>
                  </tr>
                  <tr>
                    <td align="center">
                      <table style="margin:0 auto;">
                        <tr>
                          <td style="padding:0 8px;"><a href="https://www.gpcpins.com" target="_blank"><img src="https://www.gpcpins.com/images/social/appstore.png" width="120" alt="App Store" style="display:block; border-radius:12px;"></a></td>
                          <td style="padding:0 8px;"><a href="https://www.gpcpins.com" target="_blank"><img src="https://www.gpcpins.com/images/social/playstore.png" width="120" alt="Google Play" style="display:block; border-radius:12px;"></a></td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Social icons -->
            <tr>
              <td align="center" style="padding:6px 28px 12px;">
                <table style="margin:0 auto;">
                  <tr>
                    <td style="padding:0 10px;"><a href="https://www.gpcpins.com" target="_blank"><img src="https://www.gpcpins.com/images/social/facebook.png" width="34" alt="Facebook" style="display:block;"></a></td>
                    <td style="padding:0 10px;"><a href="https://www.gpcpins.com" target="_blank"><img src="https://www.gpcpins.com/images/social/twitter.png" width="34" alt="Twitter" style="display:block;"></a></td>
                    <td style="padding:0 10px;"><a href="https://www.gpcpins.com" target="_blank"><img src="https://www.gpcpins.com/images/social/instagram.png" width="34" alt="Instagram" style="display:block;"></a></td>
                    <td style="padding:0 10px;"><a href="https://www.gpcpins.com" target="_blank"><img src="https://www.gpcpins.com/images/social/youtube.png" width="34" alt="YouTube" style="display:block;"></a></td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Footer links & address -->
            <tr>
              <td style="background:#F8FAFD; padding:24px 28px 32px; border-top:1px solid #E4EAF0;">
                <table width="100%">
                  <tr>
                    <td align="center" style="font-size:13px; color:#4F6F8F; line-height:1.6;">
                      <a href="https://www.gpcpins.com/privacy-policy" target="_blank" style="color:#1F2B44; text-decoration:none; font-weight:500;">Privacy Policy</a> &nbsp;•&nbsp;
                      <a href="https://www.gpcpins.com/terms-and-conditions" target="_blank" style="color:#1F2B44; text-decoration:none; font-weight:500;">Terms of Service</a> &nbsp;•&nbsp;
                      <a href="https://www.gpcpins.com" target="_blank" style="color:#1F2B44; text-decoration:none; font-weight:500;">View Online</a>
                      <br><br>
                      Menhyia - Opposite St. Anne's International School, Ashtown, Kumasi, Ghana<br>
                      📞 0322036582
                      <br><br>
                      © ${new Date().getFullYear()} Gab Powerful Consult – All rights reserved.
                      <br><br>
                      <span style="font-size:11px;">Need help? <a href="mailto:support@gpcpins.com" style="color:#1F2B44; text-decoration:none;">support@gpcpins.com</a></span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </table>
    </table>
  </div>

  <!-- Extra dark mode overrides for email clients -->
  <style>
    @media (prefers-color-scheme: dark) {
      .dark-wrapper, body, table.es-wrapper { background-color: #121826 !important; }
      div[style*="background-color:#ffffff"] { background-color: #1E2636 !important; }
      div[style*="background:#F8FAFE"], td[style*="background:#F8FAFE"], div[style*="background:#F0F4F9"] { background-color: #1A212F !important; border-color: #2E3A4A !important; }
      div[style*="color:#1A2C3E"], h1, p, span, div:not(.ignore) { color: #EFF3F8 !important; }
      td[style*="background:#F8FAFD"] { background-color: #131A26 !important; }
      a { color: #8AB4F8 !important; }
      hr { background: #2E3A4A !important; }
      .dark-button { background-color: #2D3A5E !important; }
    }
  </style>
</body>
</html>
`
};
